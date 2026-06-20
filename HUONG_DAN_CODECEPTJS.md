
---

## 🚀 3. Hướng Dẫn Cài Đặt (Install)
Mở cửa sổ Command Prompt / PowerShell mới tại thư mục gốc của dự án và làm theo các bước sau:

1. **Di chuyển vào thư mục kiểm thử**:
   ```powershell
   cd e2e-tests
   ```

2. **Cài đặt các gói phụ thuộc (CodeceptJS & Playwright)**:
   ```powershell
   npm install
   ```

3. **Cài đặt trình duyệt (nếu máy chưa cài đặt Playwright Browser)**:
   ```powershell
   npx playwright install
   ```

---

## 🏃 4. Các Lệnh Chạy Kiểm Thử (Run Tests)

### Cách A. Chạy ở chế độ ngầm định (Headless Mode)
Trình duyệt sẽ chạy ẩn ở nền, thích hợp để chạy trên các hệ thống tích hợp liên tục (CI/CD):
```powershell
npm run test
```

### Cách B. Chạy hiển thị trình duyệt trực quan (Headed Mode - Khuyên Dùng khi Học/Debug)
CodeceptJS sẽ mở trình duyệt Chromium thực tế để bạn quan sát từng thao tác click, nhập liệu tự động:
```powershell
# Chạy hiển thị cửa sổ trình duyệt Chromium trực tiếp
npx codeceptjs run --steps
```

### Cách C. Sử dụng Giao diện Đồ Họa Tương Tác (CodeceptJS UI)
CodeceptJS cung cấp một Dashboard hiển thị trực quan các test case, kết quả và nút bấm chạy/dừng:
```powershell
npm run test:ui
```

---

## 📂 5. Cấu trúc các File Kiểm Thử Đã Tạo Sẵn

Toàn bộ kịch bản kiểm thử nằm trong thư mục `e2e-tests/` bao gồm:
1. **`codecept.conf.js`**: File cấu hình chính, chỉ định cổng chạy Frontend Angular (`http://127.0.0.1:3000`) và cấu hình Helper là Playwright.
2. **`auth_test.js`**: Kịch bản kiểm thử luồng đăng ký tài khoản mới và đăng nhập bằng tài khoản khách hàng mẫu (`customer@gmail.com`).
3. **`product_test.js`**: Kịch bản kiểm thử tìm kiếm sản phẩm ở Header, bộ lọc giá và xem chi tiết sản phẩm.
4. **`cart_test.js`**: Kịch bản kiểm thử đăng nhập -> xem chi tiết sản phẩm -> thêm vào giỏ -> vào trang Checkout điền thông tin -> đặt hàng COD thành công.
