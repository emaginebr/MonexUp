using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DB.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderItemAmount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "amount",
                table: "monexup_order_items",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "template",
                table: "monexup_networks",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount",
                table: "monexup_order_items");

            migrationBuilder.DropColumn(
                name: "template",
                table: "monexup_networks");
        }
    }
}
