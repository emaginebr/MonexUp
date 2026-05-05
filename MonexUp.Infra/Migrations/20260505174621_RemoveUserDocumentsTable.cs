using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DB.Infra.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserDocumentsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "monexup_fk_fee_invoice",
                table: "monexup_invoice_fees");

            migrationBuilder.DropTable(
                name: "monexup_invoices");

            migrationBuilder.DropTable(
                name: "monexup_user_documents");

            migrationBuilder.DropIndex(
                name: "IX_monexup_invoice_fees_invoice_id",
                table: "monexup_invoice_fees");

            migrationBuilder.DropColumn(
                name: "invoice_id",
                table: "monexup_invoice_fees");

            migrationBuilder.AddColumn<long>(
                name: "proxypay_invoice_id",
                table: "monexup_orders",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "withdrawal_due_date",
                table: "monexup_invoice_fees",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_monexup_orders_proxypay_invoice_id",
                table: "monexup_orders",
                column: "proxypay_invoice_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_monexup_orders_proxypay_invoice_id",
                table: "monexup_orders");

            migrationBuilder.DropColumn(
                name: "proxypay_invoice_id",
                table: "monexup_orders");

            migrationBuilder.DropColumn(
                name: "withdrawal_due_date",
                table: "monexup_invoice_fees");

            migrationBuilder.AddColumn<long>(
                name: "invoice_id",
                table: "monexup_invoice_fees",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "monexup_invoices",
                columns: table => new
                {
                    invoice_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    order_id = table.Column<long>(type: "bigint", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    payment_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    price = table.Column<double>(type: "double precision", nullable: false),
                    seller_id = table.Column<long>(type: "bigint", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("monexup_invoices_pkey", x => x.invoice_id);
                    table.ForeignKey(
                        name: "monexup_fk_invoice_order",
                        column: x => x.order_id,
                        principalTable: "monexup_orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "monexup_user_documents",
                columns: table => new
                {
                    document_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    base64 = table.Column<string>(type: "text", nullable: true),
                    document_type = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    user_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("monexup_user_documents_pkey", x => x.document_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_monexup_invoice_fees_invoice_id",
                table: "monexup_invoice_fees",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_monexup_invoices_order_id",
                table: "monexup_invoices",
                column: "order_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_fee_invoice",
                table: "monexup_invoice_fees",
                column: "invoice_id",
                principalTable: "monexup_invoices",
                principalColumn: "invoice_id");
        }
    }
}
