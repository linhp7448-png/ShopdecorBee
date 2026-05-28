using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kept as a historical migration marker. Demo categories/products are now seeded explicitly via maintenance APIs.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
