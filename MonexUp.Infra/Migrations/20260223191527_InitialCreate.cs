using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DB.Infra.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "invoice_commission_commission_id_seq");

            migrationBuilder.CreateSequence(
                name: "network_id_seq");

            migrationBuilder.CreateSequence(
                name: "profile_id_seq");

            migrationBuilder.CreateTable(
                name: "networks",
                columns: table => new
                {
                    network_id = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "nextval('network_id_seq'::regclass)"),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    email = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    commission = table.Column<double>(type: "double precision", nullable: false),
                    withdrawal_min = table.Column<double>(type: "double precision", nullable: false),
                    withdrawal_period = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    plan = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    image = table.Column<string>(type: "character varying(110)", maxLength: 110, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("networks_pkey", x => x.network_id);
                });

            migrationBuilder.CreateTable(
                name: "user_documents",
                columns: table => new
                {
                    document_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    document_type = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    base64 = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_documents_pkey", x => x.document_id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    order_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    stripe_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    seller_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    network_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("orders_pkey", x => x.order_id);
                    table.ForeignKey(
                        name: "fk_order_network",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                });

            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    product_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    network_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    price = table.Column<double>(type: "double precision", nullable: false),
                    frequency = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    limit = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    slug = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    stripe_product_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    stripe_price_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    image = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true)
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
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    title = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    css = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true)
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
                name: "user_profiles",
                columns: table => new
                {
                    profile_id = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "nextval('profile_id_seq'::regclass)"),
                    network_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    commission = table.Column<double>(type: "double precision", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_profiles_pkey", x => x.profile_id);
                    table.ForeignKey(
                        name: "fk_user_profile_network",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                });

            migrationBuilder.CreateTable(
                name: "withdrawals",
                columns: table => new
                {
                    withdrawal_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    network_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    duedate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("withdrawals_pkey", x => x.withdrawal_id);
                    table.ForeignKey(
                        name: "fk_withdrawal_network",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                columns: table => new
                {
                    invoice_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    order_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    seller_id = table.Column<long>(type: "bigint", nullable: true),
                    price = table.Column<double>(type: "double precision", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    payment_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    stripe_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("invoices_pkey", x => x.invoice_id);
                    table.ForeignKey(
                        name: "fk_invoice_order",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                columns: table => new
                {
                    item_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    order_id = table.Column<long>(type: "bigint", nullable: false),
                    product_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("order_items_pkey", x => x.item_id);
                    table.ForeignKey(
                        name: "fk_order_item",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "order_id");
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
                name: "user_networks",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    network_id = table.Column<long>(type: "bigint", nullable: false),
                    profile_id = table.Column<long>(type: "bigint", nullable: true),
                    referrer_id = table.Column<long>(type: "bigint", nullable: true),
                    role = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_network", x => new { x.user_id, x.network_id });
                    table.ForeignKey(
                        name: "fk_user_network_network",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                    table.ForeignKey(
                        name: "fk_user_network_profile",
                        column: x => x.profile_id,
                        principalTable: "user_profiles",
                        principalColumn: "profile_id");
                });

            migrationBuilder.CreateTable(
                name: "invoice_fees",
                columns: table => new
                {
                    fee_id = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "nextval('invoice_commission_commission_id_seq'::regclass)"),
                    invoice_id = table.Column<long>(type: "bigint", nullable: false),
                    network_id = table.Column<long>(type: "bigint", nullable: true),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    amount = table.Column<double>(type: "double precision", nullable: false),
                    paid_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoice_fee", x => x.fee_id);
                    table.ForeignKey(
                        name: "fk_fee_invoice",
                        column: x => x.invoice_id,
                        principalTable: "invoices",
                        principalColumn: "invoice_id");
                    table.ForeignKey(
                        name: "fk_fee_network",
                        column: x => x.network_id,
                        principalTable: "networks",
                        principalColumn: "network_id");
                });

            migrationBuilder.CreateTable(
                name: "template_parts",
                columns: table => new
                {
                    part_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    page_id = table.Column<long>(type: "bigint", nullable: false),
                    part_key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    order = table.Column<double>(type: "double precision", nullable: false)
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
                    language = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
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
                name: "IX_invoice_fees_invoice_id",
                table: "invoice_fees",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoice_fees_network_id",
                table: "invoice_fees",
                column: "network_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_order_id",
                table: "invoices",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_order_id",
                table: "order_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_network_id",
                table: "orders",
                column: "network_id");

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

            migrationBuilder.CreateIndex(
                name: "IX_user_networks_network_id",
                table: "user_networks",
                column: "network_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_networks_profile_id",
                table: "user_networks",
                column: "profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_network_id",
                table: "user_profiles",
                column: "network_id");

            migrationBuilder.CreateIndex(
                name: "IX_withdrawals_network_id",
                table: "withdrawals",
                column: "network_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "invoice_fees");

            migrationBuilder.DropTable(
                name: "order_items");

            migrationBuilder.DropTable(
                name: "products");

            migrationBuilder.DropTable(
                name: "template_parts");

            migrationBuilder.DropTable(
                name: "template_vars");

            migrationBuilder.DropTable(
                name: "user_documents");

            migrationBuilder.DropTable(
                name: "user_networks");

            migrationBuilder.DropTable(
                name: "withdrawals");

            migrationBuilder.DropTable(
                name: "invoices");

            migrationBuilder.DropTable(
                name: "template_pages");

            migrationBuilder.DropTable(
                name: "user_profiles");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "templates");

            migrationBuilder.DropTable(
                name: "networks");

            migrationBuilder.DropSequence(
                name: "invoice_commission_commission_id_seq");

            migrationBuilder.DropSequence(
                name: "network_id_seq");

            migrationBuilder.DropSequence(
                name: "profile_id_seq");
        }
    }
}
