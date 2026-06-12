# Hướng Dẫn Thiết Lập & Viết Unit Test Cục Bộ (HomeDecorShop)

Tài liệu này hướng dẫn chi tiết từng bước để bạn tự tạo một dự án Unit Test độc lập trong C# bằng **xUnit** và **Moq** cho dự án ShopdecorBee mà **không cần chỉnh sửa hay ảnh hưởng đến bất kỳ dòng code chính nào của dự án**.

---

## 🛠️ BƯỚC 1: Khởi Tạo Dự Án Unit Test Qua Terminal

Hãy mở terminal (PowerShell hoặc CMD) tại thư mục gốc của dự án (`c:\Users\PC\OneDrive\Documents\ShopdecorBee-main`) và chạy lần lượt các lệnh sau:

```powershell
# 1. Di chuyển vào thư mục chứa mã nguồn Backend
cd HomeDecorShop

# 2. Tạo một dự án kiểm thử xUnit mới
dotnet new xunit -o HomeDecorShop.UnitTests

# 3. Thêm dự án test này vào Solution (.sln) của toàn hệ thống
dotnet sln HomeDecorShop.sln add HomeDecorShop.UnitTests\HomeDecorShop.UnitTests.csproj

# 4. Thêm tham chiếu đến dự án Application và Domain (để test Service và Entity)
dotnet add HomeDecorShop.UnitTests\HomeDecorShop.UnitTests.csproj reference HomeDecorShop.Application\HomeDecorShop.Application.csproj
dotnet add HomeDecorShop.UnitTests\HomeDecorShop.UnitTests.csproj reference HomeDecorShop.Domain\HomeDecorShop.Domain.csproj

# 5. Cài đặt thư viện Moq (để giả lập các Repository và Database)
dotnet add HomeDecorShop.UnitTests\HomeDecorShop.UnitTests.csproj package Moq
```

---

## ✍️ BƯỚC 2: Viết Các Kịch Bản Kiểm Thử Đơn Vị (Unit Test)

Sau khi tạo xong project, hãy xóa file mặc định `UnitTest1.cs` đi và tạo mới 3 file test tương ứng cho 3 nghiệp vụ quan trọng nhất dưới đây:

### 1️⃣ Nghiệp vụ 1: Đăng ký tài khoản (`UserServiceTests.cs`)
Tạo file `HomeDecorShop.UnitTests/UserServiceTests.cs` và dán nội dung sau:

```csharp
using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.UnitTests
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _userService = new UserService(_userRepoMock.Object, _emailServiceMock.Object);
        }

        [Fact]
        public void Register_ShouldSucceed_WhenEmailIsUnique()
        {
            // Arrange
            var input = new RegisterUserInput
            {
                Email = "test@example.com",
                FullName = "Nguyen Van A",
                Phone = "0987654321",
                Password = "Password123",
                Role = "customer"
            };

            // Giả lập: Email chưa tồn tại trong hệ thống (trả về null)
            _userRepoMock.Setup(repo => repo.GetByEmail(It.IsAny<string>()))
                         .Returns((User)null!);

            // Giả lập: Lưu user mới thành công
            _userRepoMock.Setup(repo => repo.Create(It.IsAny<User>()))
                         .Returns((User u) => { u.UserId = 1; return u; });

            // Act
            var result = _userService.Register(input);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Token);
            Assert.Equal("test@example.com", result.User.Email);
            Assert.Equal("Nguyen Van A", result.User.FullName);
            _userRepoMock.Verify(repo => repo.Create(It.IsAny<User>()), Times.Once);
        }

        [Fact]
        public void Register_ShouldThrowConflictException_WhenEmailAlreadyExists()
        {
            // Arrange
            var input = new RegisterUserInput
            {
                Email = "duplicate@example.com",
                FullName = "Nguyen Van B",
                Phone = "0987654321",
                Password = "Password123",
                Role = "customer"
            };

            var existingUser = new User { Email = "duplicate@example.com" };

            // Giả lập: Email đã tồn tại (trả về đối tượng user có sẵn)
            _userRepoMock.Setup(repo => repo.GetByEmail("duplicate@example.com"))
                         .Returns(existingUser);

            // Act & Assert
            var exception = Assert.Throws<ConflictException>(() => _userService.Register(input));
            Assert.Equal("Email already exists in the system.", exception.Message);
            _userRepoMock.Verify(repo => repo.Create(It.IsAny<User>()), Times.Never);
        }
    }
}
```

---

### 2️⃣ Nghiệp vụ 2: Giỏ hàng & Tính tiền sản phẩm (`CartServiceTests.cs`)
Tạo file `HomeDecorShop.UnitTests/CartServiceTests.cs` và dán nội dung sau:

```csharp
using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.UnitTests
{
    public class CartServiceTests
    {
        private readonly Mock<ICartRepository> _cartRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IProductRepository> _productRepoMock;
        private readonly CartService _cartService;

        public CartServiceTests()
        {
            _cartRepoMock = new Mock<ICartRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _productRepoMock = new Mock<IProductRepository>();
            _cartService = new CartService(_cartRepoMock.Object, _userRepoMock.Object, _productRepoMock.Object);
        }

        [Fact]
        public void AddItem_ShouldAddProductSuccessfully_WhenStockIsAvailable()
        {
            // Arrange
            var token = "valid_token";
            var input = new AddCartItemInput(ProductId: 10, Quantity: 2);

            var user = new User { UserId = 1, Email = "customer@example.com" };
            var product = new Product
            {
                ProductId = 10,
                ProductName = "Den Ban Vintage",
                Price = 150000,
                InStock = true,
                StockLeft = 10,
                IsActive = true
            };
            var cart = new Cart
            {
                UserId = 1,
                Items = new List<CartItem>()
            };

            // Giả lập các dependencies
            _userRepoMock.Setup(repo => repo.GetByToken(token)).Returns(user);
            _productRepoMock.Setup(repo => repo.GetById(10)).Returns(product);
            _cartRepoMock.Setup(repo => repo.GetByUserId(user.UserId)).Returns(cart);
            _cartRepoMock.Setup(repo => repo.Update(It.IsAny<Cart>())).Returns((Cart c) => c);

            // Act
            var result = _cartService.AddItem(token, input);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.TotalItems);
            Assert.Equal(300000, result.TotalAmount); // 150,000 * 2 = 300,000
            Assert.Single(result.Items);
            Assert.Equal("Den Ban Vintage", result.Items.First().ProductName);
        }

        [Fact]
        public void AddItem_ShouldThrowConflictException_WhenQuantityExceedsStock()
        {
            // Arrange
            var token = "valid_token";
            var input = new AddCartItemInput(ProductId: 10, Quantity: 15); // Yêu cầu 15 sản phẩm

            var user = new User { UserId = 1 };
            var product = new Product
            {
                ProductId = 10,
                ProductName = "Den Ban Vintage",
                InStock = true,
                StockLeft = 5, // Chỉ còn 5 sản phẩm
                IsActive = true
            };

            _userRepoMock.Setup(repo => repo.GetByToken(token)).Returns(user);
            _productRepoMock.Setup(repo => repo.GetById(10)).Returns(product);

            // Act & Assert
            var exception = Assert.Throws<ConflictException>(() => _cartService.AddItem(token, input));
            Assert.Contains("Selected quantity exceeds available stock", exception.Message);
        }
    }
}
```

---

### 3️⃣ Nghiệp vụ 3: Tìm kiếm & Bộ lọc sản phẩm (`ProductServiceTests.cs`)
Tạo file `HomeDecorShop.UnitTests/ProductServiceTests.cs` và dán nội dung sau:

```csharp
using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.UnitTests
{
    public class ProductServiceTests
    {
        private readonly Mock<IProductRepository> _productRepoMock;
        private readonly Mock<ICategoryRepository> _categoryRepoMock;
        private readonly Mock<IProductReviewRepository> _reviewRepoMock;
        private readonly ProductService _productService;

        public ProductServiceTests()
        {
            _productRepoMock = new Mock<IProductRepository>();
            _categoryRepoMock = new Mock<ICategoryRepository>();
            _reviewRepoMock = new Mock<IProductReviewRepository>();
            _productService = new ProductService(_productRepoMock.Object, _categoryRepoMock.Object, _reviewRepoMock.Object);
        }

        [Fact]
        public void Search_ShouldFilterProductsByPriceRange()
        {
            // Arrange
            var query = new ProductQuery
            {
                MinPrice = 100000,
                MaxPrice = 300000,
                Page = 1,
                PageSize = 10
            };

            var fakeProducts = new List<Product>
            {
                new Product { ProductId = 1, ProductName = "Ghe Luoi", Price = 50000, IsActive = true }, // Không thỏa mãn
                new Product { ProductId = 2, ProductName = "Den Ban", Price = 150000, IsActive = true }, // Thỏa mãn
                new Product { ProductId = 3, ProductName = "Ghe Sofa", Price = 250000, IsActive = true }, // Thỏa mãn
                new Product { ProductId = 4, ProductName = "Ghe Cong Eg", Price = 500000, IsActive = true } // Không thỏa mãn
            };

            _productRepoMock.Setup(repo => repo.GetAll()).Returns(fakeProducts);

            // Act
            var result = _productService.Search(query);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Total); // Chỉ có 2 sản phẩm nằm trong khoảng giá [100K - 300K]
            Assert.Equal(2, result.Items.Count);
            Assert.Contains(result.Items, item => item.Name == "Den Ban");
            Assert.Contains(result.Items, item => item.Name == "Ghe Sofa");
        }
    }
}
```

---

## 🏃‍♂️ BƯỚC 3: Chạy Kiểm Thử Tự Động (Run Tests)

Tại cửa sổ Terminal ở thư mục `c:\Users\PC\OneDrive\Documents\ShopdecorBee-main\HomeDecorShop`, hãy chạy lệnh sau:

```powershell
dotnet test
```

Nếu thành công, terminal sẽ hiển thị kết quả kiểm thử như sau:
```text
Passed!  - Failed:     0, Passed:     5, Skipped:     0, Total:     5, Duration: < 1s
```

---

## 📊 BƯỚC 4: Đo Lường & Xuất Báo Cáo Độ Bao Phủ Mã Nguồn (Code Coverage)

Để đo lường xem các test case của bạn đã bao phủ bao nhiêu phần trăm mã nguồn chính của hệ thống, hãy làm theo các bước sau:

1. **Chạy test và thu thập dữ liệu độ bao phủ:**
   ```powershell
   dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura
   ```
   Lệnh này sẽ tạo ra một file `coverage.cobertura.xml` chứa thông tin thô về độ phủ.

2. **Chuyển đổi dữ liệu sang dạng Báo cáo HTML trực quan (Dễ dàng nộp bài/báo cáo):**
   Bạn có thể cài đặt và sử dụng công cụ **ReportGenerator** để vẽ biểu đồ HTML:
   * Cài đặt công cụ generator (chỉ cần chạy một lần duy nhất):
     ```powershell
     dotnet tool install -g dotnet-reportgenerator-globaltool
     ```
   * Chuyển đổi file xml thành trang HTML:
     ```powershell
     reportgenerator "-reports:HomeDecorShop.UnitTests\coverage.cobertura.xml" "-targetdir:test-reports\coverage-html" -reporttypes:Html
     ```
   * Mở file **`test-reports\coverage-html\index.html`** bằng trình duyệt để xem báo cáo độ phủ chi tiết từng dòng code với màu sắc vô cùng trực quan và chuyên nghiệp!
