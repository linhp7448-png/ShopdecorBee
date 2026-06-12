# ==============================================================================
# SCRIPT CHẠY KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (AUTO FLOW TESTING) - ShopdecorBee
# ==============================================================================
# Hướng dẫn chạy:
# Mở PowerShell với quyền Administrator tại thư mục gốc của dự án và chạy:
# .\run-auto-tests.ps1
# ==============================================================================

# Thiết lập bảng mã hiển thị tiếng Việt UTF-8 cho console
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== BẮT ĐẦU LUỒNG CHẠY KIỂM THỬ TỰ ĐỘNG (AUTO FLOW) ===" -ForegroundColor Green

# ------------------------------------------------------------------------------
# BƯỚC 1: Khởi động & dọn dẹp Cơ sở dữ liệu qua Docker
# ------------------------------------------------------------------------------
Write-Host "`n[Bước 1] Dọn dẹp & khởi động CSDL SQL Server trên Docker..." -ForegroundColor Cyan

# Dừng container cũ nếu có để tránh xung đột dữ liệu
Write-Host "Dừng container cũ (nếu có)..." -ForegroundColor DarkGray
docker compose -f docker-compose.sql.yml down --volumes --remove-orphans

# Khởi động lại container SQL Server mới tinh
Write-Host "Khởi động SQL Server mới..." -ForegroundColor Yellow
docker compose -f docker-compose.sql.yml up -d

# Chờ 12 giây để SQL Server khởi động hoàn tất và mở cổng 1433
Write-Host "Chờ CSDL khởi động ổn định (12 giây)..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

# ------------------------------------------------------------------------------
# BƯỚC 2: Tự động Biên dịch (Build) và Khởi động Backend API
# ------------------------------------------------------------------------------
Write-Host "`n[Bước 2] Khởi động ứng dụng Backend API (.NET)..." -ForegroundColor Cyan

# Chạy Backend dưới nền (Background Process) qua cổng HTTP (5020)
$backendJob = Start-Process dotnet -ArgumentList "run --project HomeDecorShop\HomeDecorShop.API\HomeDecorShop.API.csproj --launch-profile http" -PassThru -NoNewWindow

# Chờ 15 giây để Server .NET khởi tạo và lắng nghe cổng 5020
Write-Host "Chờ Server API khởi động hoàn toàn (15 giây)..." -ForegroundColor DarkGray
Start-Sleep -Seconds 15

# Gọi thử API Seed dữ liệu mẫu để tạo mới database & nạp dữ liệu sạch
Write-Host "Đang gọi API Seed dữ liệu mẫu..." -ForegroundColor Yellow
try {
    $seedResult = Invoke-RestMethod -Method Post -Uri "http://localhost:5020/api/Maintenance/seed/all" -TimeoutSec 15
    Write-Host "-> Đã seed dữ liệu mẫu thành công! Cơ sở dữ liệu sẵn sàng." -ForegroundColor Green
} catch {
    Write-Host "-> [CẢNH BÁO] Seed dữ liệu thất bại hoặc chậm. Tiến trình vẫn tiếp tục..." -ForegroundColor Red
}

# ------------------------------------------------------------------------------
# BƯỚC 3: Tự động chạy kiểm thử API bằng Newman
# ------------------------------------------------------------------------------
Write-Host "`n[Bước 3] Tiến hành kiểm thử tự động API bằng Newman..." -ForegroundColor Cyan

# Tạo thư mục test-reports nếu chưa tồn tại
$reportDir = "test-reports"
if (!(Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir | Out-Null
}

# Kiểm tra xem Newman có được cài đặt hay chưa
$newmanExists = Get-Command newman -ErrorAction SilentlyContinue
if (!$newmanExists) {
    Write-Host "-> Newman chưa được cài đặt! Đang cài đặt Newman và Reporter..." -ForegroundColor Yellow
    npm install -g newman newman-reporter-htmlextra
}

# Thực thi kiểm thử tự động và xuất báo cáo HTML + màn hình console
newman run postman/ShopdecorBee-7-Services.postman_collection.json `
           -e postman/BeeShop.local.postman_environment.json `
           -r cli,htmlextra `
           --reporter-htmlextra-export test-reports/automation_report.html

# ------------------------------------------------------------------------------
# BƯỚC 5: Tự động Tắt dịch vụ giải phóng tài nguyên
# ------------------------------------------------------------------------------
Write-Host "`n[Bước 5] Dọn dẹp môi trường và giải phóng tài nguyên..." -ForegroundColor Cyan

# Tắt Backend API .NET
if ($backendJob) {
    Write-Host "Đang dừng tiến trình Backend (PID: $($backendJob.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
}

# Tắt Container CSDL Docker
Write-Host "Đang dừng container SQL Server trên Docker..." -ForegroundColor Yellow
docker compose -f docker-compose.sql.yml down

Write-Host "`n=== LUỒNG KIỂM THỬ TỰ ĐỘNG HOÀN THÀNH CHUYÊN NGHIỆP! ===" -ForegroundColor Green
Write-Host "-> Báo cáo kiểm thử HTML đã được lưu tại: test-reports/automation_report.html" -ForegroundColor Green
# ==============================================================================
