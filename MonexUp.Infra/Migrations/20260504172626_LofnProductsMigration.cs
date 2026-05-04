using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DB.Infra.Migrations
{
    /// <inheritdoc />
    public partial class LofnProductsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_fee_invoice",
                table: "invoice_fees");

            migrationBuilder.DropForeignKey(
                name: "fk_fee_network",
                table: "invoice_fees");

            migrationBuilder.DropForeignKey(
                name: "fk_invoice_order",
                table: "invoices");

            migrationBuilder.DropForeignKey(
                name: "fk_order_item",
                table: "order_items");

            migrationBuilder.DropForeignKey(
                name: "fk_order_network",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "fk_user_network_network",
                table: "user_networks");

            migrationBuilder.DropForeignKey(
                name: "fk_user_network_profile",
                table: "user_networks");

            migrationBuilder.DropForeignKey(
                name: "fk_user_profile_network",
                table: "user_profiles");

            migrationBuilder.DropForeignKey(
                name: "fk_withdrawal_network",
                table: "withdrawals");

            migrationBuilder.DropTable(
                name: "products");

            migrationBuilder.DropTable(
                name: "template_parts");

            migrationBuilder.DropTable(
                name: "template_vars");

            migrationBuilder.DropTable(
                name: "template_pages");

            migrationBuilder.DropTable(
                name: "templates");

            migrationBuilder.DropPrimaryKey(
                name: "withdrawals_pkey",
                table: "withdrawals");

            migrationBuilder.DropPrimaryKey(
                name: "user_profiles_pkey",
                table: "user_profiles");

            migrationBuilder.DropPrimaryKey(
                name: "pk_user_network",
                table: "user_networks");

            migrationBuilder.DropPrimaryKey(
                name: "user_documents_pkey",
                table: "user_documents");

            migrationBuilder.DropPrimaryKey(
                name: "orders_pkey",
                table: "orders");

            migrationBuilder.DropPrimaryKey(
                name: "order_items_pkey",
                table: "order_items");

            migrationBuilder.DropPrimaryKey(
                name: "networks_pkey",
                table: "networks");

            migrationBuilder.DropPrimaryKey(
                name: "invoices_pkey",
                table: "invoices");

            migrationBuilder.DropPrimaryKey(
                name: "pk_invoice_fee",
                table: "invoice_fees");

            migrationBuilder.DropColumn(
                name: "stripe_id",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "stripe_id",
                table: "invoices");

            migrationBuilder.DropSequence(
                name: "invoice_commission_commission_id_seq");

            migrationBuilder.DropSequence(
                name: "network_id_seq");

            migrationBuilder.DropSequence(
                name: "profile_id_seq");

            migrationBuilder.RenameTable(
                name: "withdrawals",
                newName: "monexup_withdrawals");

            migrationBuilder.RenameTable(
                name: "user_profiles",
                newName: "monexup_user_profiles");

            migrationBuilder.RenameTable(
                name: "user_networks",
                newName: "monexup_user_networks");

            migrationBuilder.RenameTable(
                name: "user_documents",
                newName: "monexup_user_documents");

            migrationBuilder.RenameTable(
                name: "orders",
                newName: "monexup_orders");

            migrationBuilder.RenameTable(
                name: "order_items",
                newName: "monexup_order_items");

            migrationBuilder.RenameTable(
                name: "networks",
                newName: "monexup_networks");

            migrationBuilder.RenameTable(
                name: "invoices",
                newName: "monexup_invoices");

            migrationBuilder.RenameTable(
                name: "invoice_fees",
                newName: "monexup_invoice_fees");

            migrationBuilder.RenameIndex(
                name: "IX_withdrawals_network_id",
                table: "monexup_withdrawals",
                newName: "IX_monexup_withdrawals_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_profiles_network_id",
                table: "monexup_user_profiles",
                newName: "IX_monexup_user_profiles_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_networks_profile_id",
                table: "monexup_user_networks",
                newName: "IX_monexup_user_networks_profile_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_networks_network_id",
                table: "monexup_user_networks",
                newName: "IX_monexup_user_networks_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_orders_network_id",
                table: "monexup_orders",
                newName: "IX_monexup_orders_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_order_items_order_id",
                table: "monexup_order_items",
                newName: "IX_monexup_order_items_order_id");

            migrationBuilder.RenameIndex(
                name: "IX_invoices_order_id",
                table: "monexup_invoices",
                newName: "IX_monexup_invoices_order_id");

            migrationBuilder.RenameIndex(
                name: "IX_invoice_fees_network_id",
                table: "monexup_invoice_fees",
                newName: "IX_monexup_invoice_fees_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_invoice_fees_invoice_id",
                table: "monexup_invoice_fees",
                newName: "IX_monexup_invoice_fees_invoice_id");

            migrationBuilder.CreateSequence(
                name: "monexup_invoice_commission_id_seq");

            migrationBuilder.CreateSequence(
                name: "monexup_network_id_seq");

            migrationBuilder.CreateSequence(
                name: "monexup_profile_id_seq");

            migrationBuilder.AlterColumn<long>(
                name: "profile_id",
                table: "monexup_user_profiles",
                type: "bigint",
                nullable: false,
                defaultValueSql: "nextval('monexup_profile_id_seq'::regclass)",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldDefaultValueSql: "nextval('profile_id_seq'::regclass)");

            migrationBuilder.AlterColumn<long>(
                name: "network_id",
                table: "monexup_networks",
                type: "bigint",
                nullable: false,
                defaultValueSql: "nextval('monexup_network_id_seq'::regclass)",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldDefaultValueSql: "nextval('network_id_seq'::regclass)");

            migrationBuilder.AddColumn<long>(
                name: "lofn_store_id",
                table: "monexup_networks",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "fee_id",
                table: "monexup_invoice_fees",
                type: "bigint",
                nullable: false,
                defaultValueSql: "nextval('monexup_invoice_commission_id_seq'::regclass)",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldDefaultValueSql: "nextval('invoice_commission_commission_id_seq'::regclass)");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_withdrawals_pkey",
                table: "monexup_withdrawals",
                column: "withdrawal_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_user_profiles_pkey",
                table: "monexup_user_profiles",
                column: "profile_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_pk_user_network",
                table: "monexup_user_networks",
                columns: new[] { "user_id", "network_id" });

            migrationBuilder.AddPrimaryKey(
                name: "monexup_user_documents_pkey",
                table: "monexup_user_documents",
                column: "document_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_orders_pkey",
                table: "monexup_orders",
                column: "order_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_order_items_pkey",
                table: "monexup_order_items",
                column: "item_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_networks_pkey",
                table: "monexup_networks",
                column: "network_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_invoices_pkey",
                table: "monexup_invoices",
                column: "invoice_id");

            migrationBuilder.AddPrimaryKey(
                name: "monexup_pk_invoice_fee",
                table: "monexup_invoice_fees",
                column: "fee_id");

            migrationBuilder.CreateTable(
                name: "monexup_product_links",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    lofn_product_id = table.Column<long>(type: "bigint", nullable: false),
                    network_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "(now() at time zone 'utc')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("monexup_product_links_pkey", x => x.id);
                    table.ForeignKey(
                        name: "monexup_fk_product_link_network",
                        column: x => x.network_id,
                        principalTable: "monexup_networks",
                        principalColumn: "network_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_monexup_networks_lofn_store_id",
                table: "monexup_networks",
                column: "lofn_store_id");

            migrationBuilder.CreateIndex(
                name: "ix_monexup_product_links_lofn_product_id",
                table: "monexup_product_links",
                column: "lofn_product_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_monexup_product_links_network_user",
                table: "monexup_product_links",
                columns: new[] { "network_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "ix_monexup_product_links_user",
                table: "monexup_product_links",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_fee_invoice",
                table: "monexup_invoice_fees",
                column: "invoice_id",
                principalTable: "monexup_invoices",
                principalColumn: "invoice_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_fee_network",
                table: "monexup_invoice_fees",
                column: "network_id",
                principalTable: "monexup_networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_invoice_order",
                table: "monexup_invoices",
                column: "order_id",
                principalTable: "monexup_orders",
                principalColumn: "order_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_order_item",
                table: "monexup_order_items",
                column: "order_id",
                principalTable: "monexup_orders",
                principalColumn: "order_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_order_network",
                table: "monexup_orders",
                column: "network_id",
                principalTable: "monexup_networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_user_network_network",
                table: "monexup_user_networks",
                column: "network_id",
                principalTable: "monexup_networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_user_network_profile",
                table: "monexup_user_networks",
                column: "profile_id",
                principalTable: "monexup_user_profiles",
                principalColumn: "profile_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_user_profile_network",
                table: "monexup_user_profiles",
                column: "network_id",
                principalTable: "monexup_networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "monexup_fk_withdrawal_network",
                table: "monexup_withdrawals",
                column: "network_id",
                principalTable: "monexup_networks",
                principalColumn: "network_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "monexup_fk_fee_invoice",
                table: "monexup_invoice_fees");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_fee_network",
                table: "monexup_invoice_fees");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_invoice_order",
                table: "monexup_invoices");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_order_item",
                table: "monexup_order_items");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_order_network",
                table: "monexup_orders");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_user_network_network",
                table: "monexup_user_networks");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_user_network_profile",
                table: "monexup_user_networks");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_user_profile_network",
                table: "monexup_user_profiles");

            migrationBuilder.DropForeignKey(
                name: "monexup_fk_withdrawal_network",
                table: "monexup_withdrawals");

            migrationBuilder.DropTable(
                name: "monexup_product_links");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_withdrawals_pkey",
                table: "monexup_withdrawals");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_user_profiles_pkey",
                table: "monexup_user_profiles");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_pk_user_network",
                table: "monexup_user_networks");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_user_documents_pkey",
                table: "monexup_user_documents");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_orders_pkey",
                table: "monexup_orders");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_order_items_pkey",
                table: "monexup_order_items");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_networks_pkey",
                table: "monexup_networks");

            migrationBuilder.DropIndex(
                name: "ix_monexup_networks_lofn_store_id",
                table: "monexup_networks");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_invoices_pkey",
                table: "monexup_invoices");

            migrationBuilder.DropPrimaryKey(
                name: "monexup_pk_invoice_fee",
                table: "monexup_invoice_fees");

            migrationBuilder.DropColumn(
                name: "lofn_store_id",
                table: "monexup_networks");

            migrationBuilder.DropSequence(
                name: "monexup_invoice_commission_id_seq");

            migrationBuilder.DropSequence(
                name: "monexup_network_id_seq");

            migrationBuilder.DropSequence(
                name: "monexup_profile_id_seq");

            migrationBuilder.RenameTable(
                name: "monexup_withdrawals",
                newName: "withdrawals");

            migrationBuilder.RenameTable(
                name: "monexup_user_profiles",
                newName: "user_profiles");

            migrationBuilder.RenameTable(
                name: "monexup_user_networks",
                newName: "user_networks");

            migrationBuilder.RenameTable(
                name: "monexup_user_documents",
                newName: "user_documents");

            migrationBuilder.RenameTable(
                name: "monexup_orders",
                newName: "orders");

            migrationBuilder.RenameTable(
                name: "monexup_order_items",
                newName: "order_items");

            migrationBuilder.RenameTable(
                name: "monexup_networks",
                newName: "networks");

            migrationBuilder.RenameTable(
                name: "monexup_invoices",
                newName: "invoices");

            migrationBuilder.RenameTable(
                name: "monexup_invoice_fees",
                newName: "invoice_fees");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_withdrawals_network_id",
                table: "withdrawals",
                newName: "IX_withdrawals_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_user_profiles_network_id",
                table: "user_profiles",
                newName: "IX_user_profiles_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_user_networks_profile_id",
                table: "user_networks",
                newName: "IX_user_networks_profile_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_user_networks_network_id",
                table: "user_networks",
                newName: "IX_user_networks_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_orders_network_id",
                table: "orders",
                newName: "IX_orders_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_order_items_order_id",
                table: "order_items",
                newName: "IX_order_items_order_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_invoices_order_id",
                table: "invoices",
                newName: "IX_invoices_order_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_invoice_fees_network_id",
                table: "invoice_fees",
                newName: "IX_invoice_fees_network_id");

            migrationBuilder.RenameIndex(
                name: "IX_monexup_invoice_fees_invoice_id",
                table: "invoice_fees",
                newName: "IX_invoice_fees_invoice_id");

            migrationBuilder.CreateSequence(
                name: "invoice_commission_commission_id_seq");

            migrationBuilder.CreateSequence(
                name: "network_id_seq");

            migrationBuilder.CreateSequence(
                name: "profile_id_seq");

            migrationBuilder.AlterColumn<long>(
                name: "profile_id",
                table: "user_profiles",
                type: "bigint",
                nullable: false,
                defaultValueSql: "nextval('profile_id_seq'::regclass)",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldDefaultValueSql: "nextval('monexup_profile_id_seq'::regclass)");

            migrationBuilder.AddColumn<string>(
                name: "stripe_id",
                table: "orders",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "network_id",
                table: "networks",
                type: "bigint",
                nullable: false,
                defaultValueSql: "nextval('network_id_seq'::regclass)",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldDefaultValueSql: "nextval('monexup_network_id_seq'::regclass)");

            migrationBuilder.AddColumn<string>(
                name: "stripe_id",
                table: "invoices",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "fee_id",
                table: "invoice_fees",
                type: "bigint",
                nullable: false,
                defaultValueSql: "nextval('invoice_commission_commission_id_seq'::regclass)",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldDefaultValueSql: "nextval('monexup_invoice_commission_id_seq'::regclass)");

            migrationBuilder.AddPrimaryKey(
                name: "withdrawals_pkey",
                table: "withdrawals",
                column: "withdrawal_id");

            migrationBuilder.AddPrimaryKey(
                name: "user_profiles_pkey",
                table: "user_profiles",
                column: "profile_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_network",
                table: "user_networks",
                columns: new[] { "user_id", "network_id" });

            migrationBuilder.AddPrimaryKey(
                name: "user_documents_pkey",
                table: "user_documents",
                column: "document_id");

            migrationBuilder.AddPrimaryKey(
                name: "orders_pkey",
                table: "orders",
                column: "order_id");

            migrationBuilder.AddPrimaryKey(
                name: "order_items_pkey",
                table: "order_items",
                column: "item_id");

            migrationBuilder.AddPrimaryKey(
                name: "networks_pkey",
                table: "networks",
                column: "network_id");

            migrationBuilder.AddPrimaryKey(
                name: "invoices_pkey",
                table: "invoices",
                column: "invoice_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_invoice_fee",
                table: "invoice_fees",
                column: "fee_id");

            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    product_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    network_id = table.Column<long>(type: "bigint", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    frequency = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    image = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    limit = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    price = table.Column<double>(type: "double precision", nullable: false),
                    slug = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    stripe_price_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    stripe_product_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("products_pkey", x => x.product_id);
                    table.ForeignKey(
                        name: "fk_network_product",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                });

            migrationBuilder.CreateTable(
                name: "templates",
                columns: table => new
                {
                    template_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    network_id = table.Column<long>(type: "bigint", nullable: true),
                    css = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    title = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    user_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("templates_pkey", x => x.template_id);
                    table.ForeignKey(
                        name: "fk_template_network",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                });

            migrationBuilder.CreateTable(
                name: "template_pages",
                columns: table => new
                {
                    page_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    template_id = table.Column<long>(type: "bigint", nullable: false),
                    slug = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    title = table.Column<string>(type: "character varying(170)", maxLength: 170, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("template_pages_pkey", x => x.page_id);
                    table.ForeignKey(
                        name: "fk_template_page",
                        column: x => x.template_id,
                        principalTable: "templates",
                        principalColumn: "template_id");
                });

            migrationBuilder.CreateTable(
                name: "template_parts",
                columns: table => new
                {
                    part_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    page_id = table.Column<long>(type: "bigint", nullable: false),
                    order = table.Column<double>(type: "double precision", nullable: false),
                    part_key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("template_parts_pkey", x => x.part_id);
                    table.ForeignKey(
                        name: "fk_template_part_page",
                        column: x => x.page_id,
                        principalTable: "template_pages",
                        principalColumn: "page_id");
                });

            migrationBuilder.CreateTable(
                name: "template_vars",
                columns: table => new
                {
                    var_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    page_id = table.Column<long>(type: "bigint", nullable: false),
                    key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    language = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("template_vars_pkey", x => x.var_id);
                    table.ForeignKey(
                        name: "fk_template_var_page",
                        column: x => x.page_id,
                        principalTable: "template_pages",
                        principalColumn: "page_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_network_id",
                table: "products",
                column: "network_id");

            migrationBuilder.CreateIndex(
                name: "IX_template_pages_template_id",
                table: "template_pages",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_template_parts_page_id",
                table: "template_parts",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "IX_template_vars_page_id",
                table: "template_vars",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "IX_templates_network_id",
                table: "templates",
                column: "network_id");

            migrationBuilder.AddForeignKey(
                name: "fk_fee_invoice",
                table: "invoice_fees",
                column: "invoice_id",
                principalTable: "invoices",
                principalColumn: "invoice_id");

            migrationBuilder.AddForeignKey(
                name: "fk_fee_network",
                table: "invoice_fees",
                column: "network_id",
                principalTable: "networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "fk_invoice_order",
                table: "invoices",
                column: "order_id",
                principalTable: "orders",
                principalColumn: "order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_order_item",
                table: "order_items",
                column: "order_id",
                principalTable: "orders",
                principalColumn: "order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_order_network",
                table: "orders",
                column: "network_id",
                principalTable: "networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "fk_user_network_network",
                table: "user_networks",
                column: "network_id",
                principalTable: "networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "fk_user_network_profile",
                table: "user_networks",
                column: "profile_id",
                principalTable: "user_profiles",
                principalColumn: "profile_id");

            migrationBuilder.AddForeignKey(
                name: "fk_user_profile_network",
                table: "user_profiles",
                column: "network_id",
                principalTable: "networks",
                principalColumn: "network_id");

            migrationBuilder.AddForeignKey(
                name: "fk_withdrawal_network",
                table: "withdrawals",
                column: "network_id",
                principalTable: "networks",
                principalColumn: "network_id");
        }
    }
}
