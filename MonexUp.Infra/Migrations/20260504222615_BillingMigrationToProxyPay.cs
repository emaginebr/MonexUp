using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DB.Infra.Migrations
{
    /// <inheritdoc />
    public partial class BillingMigrationToProxyPay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_monexup_invoice_fees_network_id",
                table: "monexup_invoice_fees");

            migrationBuilder.AddColumn<string>(
                name: "proxypay_client_id",
                table: "monexup_networks",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "proxypay_store_id",
                table: "monexup_networks",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "invoice_id",
                table: "monexup_invoice_fees",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<long>(
                name: "paid_amount_cents_at_record",
                table: "monexup_invoice_fees",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "proxypay_invoice_id",
                table: "monexup_invoice_fees",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "reversed_at",
                table: "monexup_invoice_fees",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "role",
                table: "monexup_invoice_fees",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_monexup_networks_proxypay_store_id",
                table: "monexup_networks",
                column: "proxypay_store_id");

            migrationBuilder.CreateIndex(
                name: "ix_monexup_invoice_fees_network_unreversed",
                table: "monexup_invoice_fees",
                column: "network_id",
                filter: "reversed_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_monexup_invoice_fees_proxypay_invoice_id",
                table: "monexup_invoice_fees",
                column: "proxypay_invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_monexup_invoice_fees_proxypay_invoice_user_role",
                table: "monexup_invoice_fees",
                columns: new[] { "proxypay_invoice_id", "user_id", "role" },
                unique: true,
                filter: "proxypay_invoice_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_monexup_networks_proxypay_store_id",
                table: "monexup_networks");

            migrationBuilder.DropIndex(
                name: "ix_monexup_invoice_fees_network_unreversed",
                table: "monexup_invoice_fees");

            migrationBuilder.DropIndex(
                name: "ix_monexup_invoice_fees_proxypay_invoice_id",
                table: "monexup_invoice_fees");

            migrationBuilder.DropIndex(
                name: "ix_monexup_invoice_fees_proxypay_invoice_user_role",
                table: "monexup_invoice_fees");

            migrationBuilder.DropColumn(
                name: "proxypay_client_id",
                table: "monexup_networks");

            migrationBuilder.DropColumn(
                name: "proxypay_store_id",
                table: "monexup_networks");

            migrationBuilder.DropColumn(
                name: "paid_amount_cents_at_record",
                table: "monexup_invoice_fees");

            migrationBuilder.DropColumn(
                name: "proxypay_invoice_id",
                table: "monexup_invoice_fees");

            migrationBuilder.DropColumn(
                name: "reversed_at",
                table: "monexup_invoice_fees");

            migrationBuilder.DropColumn(
                name: "role",
                table: "monexup_invoice_fees");

            migrationBuilder.AlterColumn<long>(
                name: "invoice_id",
                table: "monexup_invoice_fees",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_monexup_invoice_fees_network_id",
                table: "monexup_invoice_fees",
                column: "network_id");
        }
    }
}
