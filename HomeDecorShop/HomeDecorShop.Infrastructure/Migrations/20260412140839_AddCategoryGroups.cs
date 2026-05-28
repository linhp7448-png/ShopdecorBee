using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoryGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryGroups", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "CategoryGroups",
                columns: new[] { "Id", "DisplayOrder", "IsActive", "Name", "Slug" },
                values: new object[,]
                {
                    { 1, 1, true, "Bàn ăn & Bếp", "ban-an-bep" },
                    { 2, 2, true, "Trang trí & Sắp đặt", "trang-tri-sap-dat" },
                    { 3, 3, true, "Vải & Phụ kiện mềm", "vai-phu-kien-mem" },
                    { 4, 4, true, "Ánh sáng & Hương thơm", "anh-sang-huong-thom" },
                    { 5, 999, false, "Khác", "khac" }
                });

            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "Categories",
                type: "int",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE [Categories] SET [GroupId] = 1
                WHERE [Name] IN (
                    N'Ly gốm / cốc decor',
                    N'Khăn bàn nhiều chất liệu',
                    N'Tấm lót bàn / lót ly',
                    N'Phụ kiện bàn ăn / bếp decor'
                );
                """);

            migrationBuilder.Sql("""
                UPDATE [Categories] SET [GroupId] = 2
                WHERE [Name] IN (
                    N'Bình hoa / lọ hoa decor',
                    N'Khay decor / khay đựng đồ',
                    N'Giỏ / đồ mây tre decor',
                    N'Gương / tranh / đồ treo tường'
                );
                """);

            migrationBuilder.Sql("""
                UPDATE [Categories] SET [GroupId] = 3
                WHERE [Name] IN (
                    N'Gối tựa / vỏ gối decor',
                    N'Rèm / vải decor'
                );
                """);

            migrationBuilder.Sql("""
                UPDATE [Categories] SET [GroupId] = 4
                WHERE [Name] IN (
                    N'Nến thơm / phụ kiện nến',
                    N'Đèn decor'
                );
                """);

            migrationBuilder.Sql("""
                UPDATE [Categories]
                SET [GroupId] = 5
                WHERE [GroupId] IS NULL;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "GroupId",
                table: "Categories",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_GroupId",
                table: "Categories",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoryGroups_Slug",
                table: "CategoryGroups",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_CategoryGroups_GroupId",
                table: "Categories",
                column: "GroupId",
                principalTable: "CategoryGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_CategoryGroups_GroupId",
                table: "Categories");

            migrationBuilder.DropTable(
                name: "CategoryGroups");

            migrationBuilder.DropIndex(
                name: "IX_Categories_GroupId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "Categories");
        }
    }
}
