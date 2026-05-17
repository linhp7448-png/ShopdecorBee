using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RestoreFeedbackAndPromotion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "Feedback",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RepliedAt",
                table: "Feedback",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "Feedback");

            migrationBuilder.DropColumn(
                name: "RepliedAt",
                table: "Feedback");
        }
    }
}
