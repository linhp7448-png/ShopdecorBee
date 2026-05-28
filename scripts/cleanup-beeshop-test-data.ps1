[CmdletBinding()]
param(
    [string]$AppSettingsPath = "D:\2026\TMDT_Nhom6_latest\TMDT_Nhom6\HomeDecorShop\HomeDecorShop.API\appsettings.json",
    [switch]$PreviewOnly
)

$ErrorActionPreference = "Stop"

$keepEmails = @(
    "admin@gmail.com",
    "admin1@homedecorshop.local",
    "tdthanh.dev2025@gmail.com"
)

$testEmailPatterns = @(
    "payment-test-%",
    "payment-public-%",
    "payment-public-bypass-%",
    "payment-return-%",
    "payment-return2-%",
    "payment-shot-%",
    "payment-live-%",
    "sigtest-%",
    "sandbox.%",
    "diag.%",
    "flow.%",
    "apitest.%"
)

function ConvertTo-SqlLiteral {
    param([Parameter(Mandatory = $true)][string]$Value)

    return "N'" + $Value.Replace("'", "''") + "'"
}

function New-SqlConnection {
    param([Parameter(Mandatory = $true)][string]$ConnectionString)

    return New-Object System.Data.SqlClient.SqlConnection $ConnectionString
}

function Invoke-SqlDataSet {
    param(
        [Parameter(Mandatory = $true)][string]$ConnectionString,
        [Parameter(Mandatory = $true)][string]$Query
    )

    $connection = New-SqlConnection -ConnectionString $ConnectionString
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = $Query

        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $command
        $dataSet = New-Object System.Data.DataSet
        [void]$adapter.Fill($dataSet)
        return $dataSet
    }
    finally {
        if ($connection.State -ne [System.Data.ConnectionState]::Closed) {
            $connection.Close()
        }
    }
}

function Write-DataTable {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][System.Data.DataTable]$Table
    )

    Write-Host ""
    Write-Host $Title
    if ($Table.Rows.Count -eq 0) {
        Write-Host "(none)"
        return
    }

    $Table | Format-Table -AutoSize
}

if (-not (Test-Path -LiteralPath $AppSettingsPath)) {
    throw "App settings file was not found: $AppSettingsPath"
}

$appSettings = Get-Content -LiteralPath $AppSettingsPath -Raw | ConvertFrom-Json
$connectionString = [string]$appSettings.ConnectionStrings.DefaultConnection
if ([string]::IsNullOrWhiteSpace($connectionString)) {
    throw "ConnectionStrings:DefaultConnection is missing from $AppSettingsPath"
}

$keepEmailList = ($keepEmails | ForEach-Object { ConvertTo-SqlLiteral -Value $_ }) -join ", "
$patternPredicate = ($testEmailPatterns | ForEach-Object { "u.Email LIKE " + (ConvertTo-SqlLiteral -Value $_) }) -join " OR "

$previewQuery = @"
SET NOCOUNT ON;

DROP TABLE IF EXISTS #TargetUsers;

SELECT u.UserId, u.Email, u.FullName
INTO #TargetUsers
FROM dbo.Users AS u
WHERE u.Email NOT IN ($keepEmailList)
  AND ($patternPredicate);

SELECT UserId, Email, FullName
FROM #TargetUsers
ORDER BY UserId;

SELECT 'Users' AS Entity, COUNT(*) AS Cnt FROM #TargetUsers
UNION ALL
SELECT 'Addresses', COUNT(*) FROM dbo.Addresses AS a INNER JOIN #TargetUsers AS tu ON tu.UserId = a.UserId
UNION ALL
SELECT 'Carts', COUNT(*) FROM dbo.Carts AS c INNER JOIN #TargetUsers AS tu ON tu.UserId = c.UserId
UNION ALL
SELECT 'CartItems', COUNT(*) FROM dbo.CartItems AS ci INNER JOIN dbo.Carts AS c ON c.Id = ci.CartId INNER JOIN #TargetUsers AS tu ON tu.UserId = c.UserId
UNION ALL
SELECT 'Orders', COUNT(*) FROM dbo.Orders AS o INNER JOIN #TargetUsers AS tu ON tu.UserId = o.UserId
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM dbo.OrderItems AS oi INNER JOIN dbo.Orders AS o ON o.Id = oi.OrderId INNER JOIN #TargetUsers AS tu ON tu.UserId = o.UserId
UNION ALL
SELECT 'Payments', COUNT(*) FROM dbo.Payments AS p INNER JOIN dbo.Orders AS o ON o.Id = p.OrderId INNER JOIN #TargetUsers AS tu ON tu.UserId = o.UserId;
"@

$preview = Invoke-SqlDataSet -ConnectionString $connectionString -Query $previewQuery
$targetUsers = $preview.Tables[0]
$impactSummary = $preview.Tables[1]

Write-Host "BeeShop test-data cleanup preview"
Write-Host "App settings: $AppSettingsPath"
Write-Host "Preview only: $($PreviewOnly.IsPresent)"

Write-DataTable -Title "-- Target users --" -Table $targetUsers
Write-DataTable -Title "-- Impact summary --" -Table $impactSummary

if ($targetUsers.Rows.Count -eq 0) {
    Write-Host ""
    Write-Host "No matching test users were found. Nothing to delete."
    return
}

if ($PreviewOnly) {
    Write-Host ""
    Write-Host "Preview completed. No data was modified."
    return
}

$cleanupQuery = @"
SET NOCOUNT ON;
SET XACT_ABORT ON;

DROP TABLE IF EXISTS #TargetUsers;

SELECT u.UserId
INTO #TargetUsers
FROM dbo.Users AS u
WHERE u.Email NOT IN ($keepEmailList)
  AND ($patternPredicate);

DECLARE @Deleted TABLE (Entity NVARCHAR(50) NOT NULL, Cnt INT NOT NULL);

BEGIN TRANSACTION;

DELETE p
FROM dbo.Payments AS p
INNER JOIN dbo.Orders AS o ON o.Id = p.OrderId
INNER JOIN #TargetUsers AS tu ON tu.UserId = o.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'Payments', @@ROWCOUNT);

DELETE oi
FROM dbo.OrderItems AS oi
INNER JOIN dbo.Orders AS o ON o.Id = oi.OrderId
INNER JOIN #TargetUsers AS tu ON tu.UserId = o.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'OrderItems', @@ROWCOUNT);

DELETE o
FROM dbo.Orders AS o
INNER JOIN #TargetUsers AS tu ON tu.UserId = o.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'Orders', @@ROWCOUNT);

DELETE ci
FROM dbo.CartItems AS ci
INNER JOIN dbo.Carts AS c ON c.Id = ci.CartId
INNER JOIN #TargetUsers AS tu ON tu.UserId = c.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'CartItems', @@ROWCOUNT);

DELETE c
FROM dbo.Carts AS c
INNER JOIN #TargetUsers AS tu ON tu.UserId = c.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'Carts', @@ROWCOUNT);

DELETE a
FROM dbo.Addresses AS a
INNER JOIN #TargetUsers AS tu ON tu.UserId = a.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'Addresses', @@ROWCOUNT);

DELETE u
FROM dbo.Users AS u
INNER JOIN #TargetUsers AS tu ON tu.UserId = u.UserId;
INSERT INTO @Deleted (Entity, Cnt) VALUES (N'Users', @@ROWCOUNT);

COMMIT TRANSACTION;

SELECT Entity, Cnt
FROM @Deleted;

SELECT 'Users' AS Entity, COUNT(*) AS Cnt FROM dbo.Users
UNION ALL
SELECT 'Addresses', COUNT(*) FROM dbo.Addresses
UNION ALL
SELECT 'Carts', COUNT(*) FROM dbo.Carts
UNION ALL
SELECT 'CartItems', COUNT(*) FROM dbo.CartItems
UNION ALL
SELECT 'Orders', COUNT(*) FROM dbo.Orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM dbo.OrderItems
UNION ALL
SELECT 'Payments', COUNT(*) FROM dbo.Payments;
"@

$cleanup = Invoke-SqlDataSet -ConnectionString $connectionString -Query $cleanupQuery
Write-DataTable -Title "-- Deleted rows --" -Table $cleanup.Tables[0]
Write-DataTable -Title "-- Final table counts --" -Table $cleanup.Tables[1]
