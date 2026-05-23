# Huong Dan Chay

## Terminal 1 - Clone source

```powershell
git clone
cd TMDT_Nhom6
```

## Terminal 2 - Start SQL Server

```powershell
docker compose -f docker-compose.sql.yml up -d
docker compose -f docker-compose.sql.yml ps
```

## Terminal 3 - Start Backend

```powershell
dotnet restore HomeDecorShop\HomeDecorShop.sln
cd HomeDecorShop\HomeDecorShop.API
dotnet run --launch-profile http
```

## Terminal 4 - Seed du lieu

```powershell
Invoke-RestMethod -Method Post http://localhost:5020/api/Maintenance/seed/all
```

## Terminal 5 - Start Frontend

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

## Terminal 6 - Start ngrok

```powershell
ngrok config add-authtoken 3CHqDga7M0o27PcWJWmERTM55E1_5mfBKdmVUCZ5fj9QnR8FN
ngrok http --domain=gecko-canning-viability.ngrok-free.dev 5020
```

## URL

```text
Frontend: http://127.0.0.1:3000
Backend: http://localhost:5020
Swagger: http://localhost:5020/swagger
```

## Hướng dẫn xem tính năng mới

### 1. Phản hồi khách hàng (Feedback & Admin Reply)
- **Dành cho Admin:** Truy cập Dashboard Admin -> Chọn Tab số **7 (Phản hồi khách)** để xem danh sách feedback và thực hiện trả lời khách hàng.
- **Dành cho khách:** Truy cập trang **Liên hệ (Contact)** để xem các feedback đã gửi và nội dung phản hồi từ Shop hiển thị công khai.

### 2. Khuyến mại (Giá mới & Giá cũ gạch ngang)
- **Trang chủ**: Kiểm tra các mục Flash Sale, Mới về tổ (New Arrivals), Góc Tổ Ong (Trending). Sản phẩm có khuyến mại sẽ hiển thị giá cũ gạch ngang bên cạnh giá mới.
- **Chi tiết sản phẩm**: Hiển thị rõ ràng giá niêm yết (gạch ngang), giá bán hiện tại và phần trăm tiết kiệm được.

> [!TIP]
> Nếu bạn clone dự án về máy mới, sau khi chạy `dotnet restore` ở Terminal 3, hãy chạy thêm lệnh `dotnet ef database update --project HomeDecorShop.Infrastructure --startup-project HomeDecorShop.API` để đảm bảo cơ sở dữ liệu có đầy đủ các cột tính năng mới nhé!

