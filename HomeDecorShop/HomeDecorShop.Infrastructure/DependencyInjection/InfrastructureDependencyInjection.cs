using HomeDecorShop.Application;
using Microsoft.Extensions.DependencyInjection;

namespace HomeDecorShop.Infrastructure;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IProductRepository, SqlProductRepository>();
        services.AddScoped<IProductReviewRepository, SqlProductReviewRepository>();
        services.AddScoped<IUserRepository, SqlUserRepository>();
        services.AddScoped<IFeedbackRepository, SqlFeedbackRepository>();
        services.AddScoped<ICategoryRepository, SqlCategoryRepository>();
        services.AddScoped<ICartRepository, SqlCartRepository>();
        services.AddScoped<IOrderRepository, SqlOrderRepository>();
        services.AddScoped<IPaymentRepository, SqlPaymentRepository>();
        services.AddScoped<IWalletRepository, SqlWalletRepository>();
        services.AddScoped<IMarketingRepository, MarketingRepository>();
        services.AddScoped<ISettingsRepository, SqlSettingsRepository>();
        services.AddScoped<IEmailService, EmailService>();
        return services;
    }
}
