using Xunit;
using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using HomeDecorShop.Infrastructure;
// Chú ý: Trong project này, các repository dùng namespace HomeDecorShop.Infrastructure, nên không cần dùng HomeDecorShop.Infrastructure.Repositories.
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HomeDecorShop.Tests;

public class CartIntegrationTests
{
    // Hàm khởi tạo Database chạy trên RAM ảo
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString()) 
            .Options;
            
        return new AppDbContext(options);
    }

    [Fact]
    public void AddItem_ShouldSaveDirectlyToDatabase_WhenCalled()
    {
        // 1. ARRANGE: Chuẩn bị dữ liệu mồi trong Database thật
        var dbContext = GetInMemoryDbContext();
        var token = "any_valid_or_mock_token_string";

        dbContext.Users.Add(new User { UserId = 1, CurrentToken = token });
        dbContext.Products.Add(new Product
        {
            ProductId = 999,
            Sku = "TEST-999",
            ProductName = "Test Product",
            Slug = "test-product",
            Price = 100000,
            StockLeft = 50,
            InStock = true,
            IsActive = true,
            CategoryNavigation = new Category { Id = 1, Name = "Test", Slug = "test", IsActive = true }
        });
        dbContext.SaveChanges();

        // Khởi tạo các tầng REPOSITORY THẬT của dự án
        var cartRepo = new SqlCartRepository(dbContext);
        var userRepo = new SqlUserRepository(dbContext);
        var productRepo = new SqlProductRepository(dbContext);

        // Khởi tạo SERVICE THẬT kết nối với REPO THẬT
        var cartService = new CartService(cartRepo, userRepo, productRepo);

        var input = new AddCartItemInput { ProductId = 999, Quantity = 2 };

        // 2. ACT: Gọi hàm AddItem THẬT của nhóm để thực thi luồng logic chọc xuống DB
        cartService.AddItem(token, input);

        // 3. ASSERT: Kiểm tra xem code của nhóm chạy xong thì DB có lưu đúng dữ liệu không
        var savedCart = dbContext.Carts
                                 .Include(c => c.Items) 
                                 .FirstOrDefault(c => c.UserId == 1); 

        // Khẳng định kết quả lưu xuống DB thành công từ hàm AddItem
        savedCart.Should().NotBeNull(); 
        savedCart.Items.Count.Should().Be(1); 
        savedCart.Items.First().ProductId.Should().Be(999);
        savedCart.Items.First().Quantity.Should().Be(2);
    }

    [Fact]
    public void UpdateQuantity_ShouldUpdateDatabase_WhenCalled()
    {
        // 1. ARRANGE: Chuẩn bị DB và cho sẵn 1 món hàng vào giỏ
        var dbContext = GetInMemoryDbContext();
        var token = "any_valid_or_mock_token_string";
        dbContext.Users.Add(new User { UserId = 1, CurrentToken = token });
        dbContext.Products.Add(new Product
        {
            ProductId = 999,
            Sku = "TEST-999",
            ProductName = "Test Product",
            Slug = "test-product",
            Price = 100000,
            StockLeft = 50,
            InStock = true,
            IsActive = true,
            CategoryNavigation = new Category { Id = 1, Name = "Test", Slug = "test", IsActive = true }
        });

        // Tạo sẵn 1 giỏ hàng có 1 món với số lượng = 1
        var cart = new Cart
        {
            UserId = 1,
            Items = new List<CartItem>
            {
                new CartItem { ProductId = 999, Quantity = 1, UnitPrice = 100000 }
            }
        };
        dbContext.Carts.Add(cart);
        dbContext.SaveChanges();

        var cartRepo = new SqlCartRepository(dbContext);
        var userRepo = new SqlUserRepository(dbContext);
        var productRepo = new SqlProductRepository(dbContext);
        var cartService = new CartService(cartRepo, userRepo, productRepo);

        // 2. ACT: Gọi hàm Cập nhật
        // Truyền tham số để update món hàng ID 999 lên số lượng là 5
        var updateInput = new UpdateCartItemQuantityInput { Quantity = 5 };
        cartService.UpdateItem(token, 1, updateInput);

        // 3. ASSERT: Kiểm tra xem DB đã lưu số lượng mới là 5 chưa
        var savedCart = dbContext.Carts.Include(c => c.Items).FirstOrDefault(c => c.UserId == 1); 
        savedCart.Items.First().Quantity.Should().Be(5); // Chỗ này ăn tiền nè, khẳng định lượng đã cập nhật
    }
}