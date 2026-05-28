$ErrorActionPreference = "Stop"

$repoRoot = "D:\2026\TMDT_Nhom6_latest\TMDT_Nhom6"
$apiOutputDir = Join-Path $repoRoot "HomeDecorShop\HomeDecorShop.API\bin\Debug\net9.0"
$backendOutLog = Join-Path $repoRoot "be-ngrok-backend.out.log"
$backendErrLog = Join-Path $repoRoot "be-ngrok-backend.err.log"
$ngrokLog = Join-Path $repoRoot "be-ngrok-tunnel.log"
$publicUrl = "https://molybdic-edyth-postxiphoid.ngrok-free.dev"

function Stop-ListenerProcess {
    param([int]$Port)

    $connections = @(Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port })
    $owningProcesses = $connections | Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $owningProcesses) {
        if (-not $processId -or $processId -eq 0 -or $processId -eq $PID) {
            continue
        }

        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Output "Stopped port $Port process $processId ($($process.ProcessName))"
        }
    }
}

function Stop-MatchingProcesses {
    $commandLinePattern = "HomeDecorShop\.API\.dll|HomeDecorShop\.API\.csproj|start-be\.ps1|restart-be-ngrok\.ps1|ngrok http 5020|molybdic-edyth-postxiphoid"

    $candidates = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessId -ne $PID -and (
            ($_.Name -ieq "dotnet.exe" -and $_.CommandLine -match "HomeDecorShop\.API") -or
            ($_.Name -ieq "ngrok.exe") -or
            ($_.Name -ieq "powershell.exe" -and $_.CommandLine -match $commandLinePattern)
        )
    })

    foreach ($candidate in $candidates) {
        Stop-Process -Id $candidate.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Output "Stopped matched process $($candidate.ProcessId) ($($candidate.Name))"
    }
}

function Wait-ForHttp200 {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 60
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                return $true
            }
        }
        catch {
        }

        Start-Sleep -Seconds 1
    }

    return $false
}

Stop-ListenerProcess -Port 4040
Stop-ListenerProcess -Port 5020
Stop-MatchingProcesses

foreach ($path in @($backendOutLog, $backendErrLog, $ngrokLog)) {
    if (Test-Path $path) {
        Remove-Item -Force $path
    }
}

$env:DOTNET_ROLL_FORWARD = "Major"
$env:ASPNETCORE_ENVIRONMENT = "Development"

$backendProcess = Start-Process `
    -FilePath "dotnet" `
    -ArgumentList @("HomeDecorShop.API.dll", "--urls", "http://localhost:5020") `
    -WorkingDirectory $apiOutputDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $backendOutLog `
    -RedirectStandardError $backendErrLog `
    -PassThru

Write-Output "Started backend PID $($backendProcess.Id)"

if (-not (Wait-ForHttp200 -Url "http://localhost:5020/swagger/v1/swagger.json" -TimeoutSeconds 90)) {
    Write-Output "Backend failed to become healthy. Tail stdout:"
    if (Test-Path $backendOutLog) {
        Get-Content $backendOutLog -Tail 80
    }

    Write-Output "Tail stderr:"
    if (Test-Path $backendErrLog) {
        Get-Content $backendErrLog -Tail 80
    }

    throw "Backend did not start on http://localhost:5020"
}

$ngrokExe = (Get-Command ngrok -ErrorAction Stop).Source
$ngrokProcess = Start-Process `
    -FilePath $ngrokExe `
    -ArgumentList @("http", "5020", "--url", $publicUrl, "--log", $ngrokLog, "--log-format", "logfmt", "--log-level", "info") `
    -WorkingDirectory $repoRoot `
    -WindowStyle Hidden `
    -PassThru

Write-Output "Started ngrok PID $($ngrokProcess.Id)"

$tunnelDetected = $false
$detectedUrl = $null
$deadline = (Get-Date).AddSeconds(45)
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 3
        $payload = $response.Content | ConvertFrom-Json
        $detectedUrl = @($payload.tunnels | Select-Object -ExpandProperty public_url -ErrorAction SilentlyContinue | Select-Object -First 1)[0]
        if ($detectedUrl) {
            $tunnelDetected = $true
            break
        }
    }
    catch {
    }

    Start-Sleep -Seconds 1
}

if (-not $tunnelDetected) {
    Write-Output "ngrok failed to expose a tunnel. Tail log:"
    if (Test-Path $ngrokLog) {
        Get-Content $ngrokLog -Tail 80
    }

    throw "ngrok did not start correctly"
}

$publicSwaggerUrl = "$publicUrl/swagger/v1/swagger.json"
$publicStatus = "UNKNOWN"

try {
    $publicResponse = Invoke-WebRequest -UseBasicParsing -Uri $publicSwaggerUrl -TimeoutSec 10
    $publicStatus = $publicResponse.StatusCode
}
catch {
    $publicStatus = $_.Exception.Message
}

Write-Output "Tunnel URL: $detectedUrl"
Write-Output "Public Swagger status: $publicStatus"
