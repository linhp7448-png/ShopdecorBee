using HomeDecorShop.API;
using HomeDecorShop.API.Payments;
using HomeDecorShop.Application;
using HomeDecorShop.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddApiControllers();
builder.Services.AddApiExceptionHandling();
builder.Services.AddApiAuthentication();
builder.Services.Configure<VnPayOptions>(builder.Configuration.GetSection(VnPayOptions.SectionName));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200", "http://127.0.0.1:4200",
                "http://localhost:5173", "http://127.0.0.1:5173",
                "http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddApiSwagger();

var app = builder.Build();

app.InitializeDatabase();

app.UseExceptionHandler();
// app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.DisplayRequestDuration();
    options.EnableTryItOutByDefault();
    options.DefaultModelsExpandDepth(-1);
    options.DocExpansion(DocExpansion.List);
});

app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/docs", () => Results.Redirect("/swagger"));

app.MapControllers();

app.Run();
