using HomeDecorShop.Application.Feedbacks;
using Microsoft.Extensions.DependencyInjection;

namespace HomeDecorShop.Application;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IWalletService, WalletService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IMarketingService, MarketingService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<CreateFeedbackHandler>();
        services.AddScoped<GetFeedbacksHandler>();
        return services;
    }
}
