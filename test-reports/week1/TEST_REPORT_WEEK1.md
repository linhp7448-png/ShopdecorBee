# Tuần 1 — Postman Test Report (BeeShop API)

## Chuẩn bị

- Backend chạy ở `{{baseUrl}}` (mặc định `http://localhost:5020`)
- Import 2 file vào Postman:
  - `postman/BeeShop.local.postman_environment.json`
  - `postman/BeeShop_Week1.postman_collection.json`
- Chọn environment `BeeShop Local`
- Chạy folder theo thứ tự khuyến nghị:
  - `00 - Maintenance` → `01 - Auth & User Service` → `02 - Category Service` → `03 - Product Service` → `04 - Cart Service` → `05 - Order Service` → `06 - Payment Service` → `07 - Wallet Service`

## Lưu ý phạm vi (theo code hiện tại)

- “Đổi mật khẩu”: hiện **chưa có endpoint** trong `AccountController`/`AuthController` → collection để placeholder `.../api/account/change-password` và kỳ vọng `404/405`.
- “Nhóm danh mục”: backend có `CategoryGroup` (được seed) nhưng **chưa có endpoint** để list nhóm riêng. Thông tin group chỉ xuất hiện lồng trong `GET /api/categories`.

---

## [TEST-REPORT] AUTH & USER SERVICE

### Test cases

- [ ] AUTH-01 Seed demo data: `POST /api/Maintenance/seed/all` → 200
- [ ] AUTH-02 Register: `POST /api/auth/register` → 200, trả về `token`
- [ ] AUTH-03 Login: `POST /api/auth/login` → 200, trả về `token`
- [ ] AUTH-04 Profile: `GET /api/account/profile` → 200, có `id/email/role`
- [ ] AUTH-05 Update profile: `PUT /api/account/profile` → 200, `fullName` đổi
- [ ] AUTH-06 Admin login: `POST /api/auth/login (admin)` → 200, set `adminToken`
- [ ] AUTH-07 Admin list users: `GET /api/users` → 200 (admin-only)
- [ ] AUTH-08 Change password (N/A): `POST /api/account/change-password` → 404/405 (not implemented)

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

---

## [TEST-REPORT] PRODUCT SERVICE

### Test cases

- [ ] PROD-01 List: `GET /api/products?page=1&pageSize=10` → 200, có `items/total`, set `productId`
- [ ] PROD-02 Detail: `GET /api/products/{productId}` → 200
- [ ] PROD-03 Search: `GET /api/products?q=bee&page=1&pageSize=10` → 200
- [ ] PROD-04 Filter by category: `GET /api/products?category={categorySlug}` → 200

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

---

## [TEST-REPORT] CATEGORY SERVICE

### Test cases

- [ ] CAT-01 List: `GET /api/categories` → 200, set `categoryId/categorySlug`
- [ ] CAT-02 Detail: `GET /api/categories/{categoryId}` → 200
- [ ] CAT-03 Category group (partial): group nằm trong field `group` của category (không có endpoint list group riêng)

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

---

## [TEST-REPORT] CART SERVICE

### Test cases

- [ ] CART-01 Get cart: `GET /api/cart` → 200
- [ ] CART-02 Add item: `POST /api/cart/items` → 200, set `cartItemId`
- [ ] CART-03 Update quantity: `PUT /api/cart/items/{cartItemId}` → 200
- [ ] CART-04 Remove item: `DELETE /api/cart/items/{cartItemId}` → 204
- [ ] CART-05 Clear cart: `DELETE /api/cart/items` → 204

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

---

## [TEST-REPORT] ORDER SERVICE

### Test cases

- [ ] ORD-01 Setup add to cart: `POST /api/cart/items` → 200
- [ ] ORD-02 Place order: `POST /api/orders` → 201, set `orderId`
- [ ] ORD-03 List mine: `GET /api/orders` → 200
- [ ] ORD-04 Detail: `GET /api/orders/{orderId}` → 200
- [ ] ORD-05 Admin list all: `GET /api/admin/orders` → 200 (adminToken)
- [ ] ORD-06 Admin update status: `PATCH /api/admin/orders/{orderId}/status?status=processing` → 200 (adminToken)
- [ ] ORD-07 Cancel order: `POST /api/orders/{orderId}/cancel` → 200 hoặc 409 tuỳ trạng thái

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

---

## [TEST-REPORT] PAYMENT SERVICE

### Test cases

- [ ] PAY-01 Process payment: `POST /api/payments` body `{ orderId, method: "cod" }` → 201 hoặc 409 tuỳ trạng thái
- [ ] PAY-02 List mine: `GET /api/payments` → 200
- [ ] PAY-03 Detail: `GET /api/payments/{paymentId}` → 200 (hoặc 404 nếu chưa tạo)
- [ ] PAY-04 By order: `GET /api/payments/order/{orderId}` → 200

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

---

## [TEST-REPORT] WALLET SERVICE

### Test cases

- [ ] WAL-01 Get wallet: `GET /api/wallet` → 200
- [ ] WAL-02 Deposit direct: `POST /api/wallet/deposit` body `{ amount: 100000 }` → 200
- [ ] WAL-03 Withdraw: `POST /api/wallet/withdraw` body `{ amount: 1000 }` → 200 hoặc 409 nếu thiếu tiền
- [ ] WAL-04 Transactions: `GET /api/wallet/transactions` → 200, array

### Kết quả

- Tổng: ___ Passed / ___ Failed / ___ N/A
- Ghi chú lỗi (nếu có): _______________________________________________

