using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DB.Infra.Context;

public partial class MonexUpContext : DbContext
{
    public MonexUpContext()
    {
    }

    public MonexUpContext(DbContextOptions<MonexUpContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<InvoiceFee> InvoiceFees { get; set; }

    public virtual DbSet<Network> Networks { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Template> Templates { get; set; }

    public virtual DbSet<TemplatePage> TemplatePages { get; set; }

    public virtual DbSet<TemplatePart> TemplateParts { get; set; }

    public virtual DbSet<TemplateVar> TemplateVars { get; set; }

    public virtual DbSet<UserDocument> UserDocuments { get; set; }

    public virtual DbSet<UserNetwork> UserNetworks { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    public virtual DbSet<Withdrawal> Withdrawals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("invoices_pkey");

            entity.ToTable("invoices");

            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.DueDate)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("due_date");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentDate)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("payment_date");
            entity.Property(e => e.Price).HasColumnName("price");
            entity.Property(e => e.SellerId).HasColumnName("seller_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.StripeId)
                .HasMaxLength(120)
                .HasColumnName("stripe_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Order).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_invoice_order");
        });

        modelBuilder.Entity<InvoiceFee>(entity =>
        {
            entity.HasKey(e => e.FeeId).HasName("pk_invoice_fee");

            entity.ToTable("invoice_fees");

            entity.Property(e => e.FeeId)
                .HasDefaultValueSql("nextval('invoice_commission_commission_id_seq'::regclass)")
                .HasColumnName("fee_id");
            entity.Property(e => e.Amount).HasColumnName("amount");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");
            entity.Property(e => e.PaidAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("paid_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Invoice).WithMany(p => p.InvoiceFees)
                .HasForeignKey(d => d.InvoiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_fee_invoice");

            entity.HasOne(d => d.Network).WithMany(p => p.InvoiceFees)
                .HasForeignKey(d => d.NetworkId)
                .HasConstraintName("fk_fee_network");
        });

        modelBuilder.Entity<Network>(entity =>
        {
            entity.HasKey(e => e.NetworkId).HasName("networks_pkey");

            entity.ToTable("networks");

            entity.Property(e => e.NetworkId)
                .HasDefaultValueSql("nextval('network_id_seq'::regclass)")
                .HasColumnName("network_id");
            entity.Property(e => e.Commission).HasColumnName("commission");
            entity.Property(e => e.Email)
                .HasMaxLength(180)
                .HasColumnName("email");
            entity.Property(e => e.Image)
                .HasMaxLength(110)
                .HasColumnName("image");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnName("name");
            entity.Property(e => e.Plan)
                .HasDefaultValue(1)
                .HasColumnName("plan");
            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("slug");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.WithdrawalMin).HasColumnName("withdrawal_min");
            entity.Property(e => e.WithdrawalPeriod)
                .HasDefaultValue(0)
                .HasColumnName("withdrawal_period");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("orders_pkey");

            entity.ToTable("orders");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");
            entity.Property(e => e.SellerId).HasColumnName("seller_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.StripeId)
                .HasMaxLength(120)
                .HasColumnName("stripe_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Network).WithMany(p => p.Orders)
                .HasForeignKey(d => d.NetworkId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_order_network");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.ItemId).HasName("order_items_pkey");

            entity.ToTable("order_items");

            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_order_item");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("products_pkey");

            entity.ToTable("products");

            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Frequency)
                .HasDefaultValue(0)
                .HasColumnName("frequency");
            entity.Property(e => e.Image)
                .HasMaxLength(150)
                .HasColumnName("image");
            entity.Property(e => e.Limit)
                .HasDefaultValue(0)
                .HasColumnName("limit");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(120)
                .HasColumnName("name");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");
            entity.Property(e => e.Price).HasColumnName("price");
            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(140)
                .HasColumnName("slug");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.StripePriceId)
                .HasMaxLength(120)
                .HasColumnName("stripe_price_id");
            entity.Property(e => e.StripeProductId)
                .HasMaxLength(120)
                .HasColumnName("stripe_product_id");

            entity.HasOne(d => d.Network).WithMany(p => p.Products)
                .HasForeignKey(d => d.NetworkId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_network_product");
        });

        modelBuilder.Entity<Template>(entity =>
        {
            entity.HasKey(e => e.TemplateId).HasName("templates_pkey");

            entity.ToTable("templates");

            entity.Property(e => e.TemplateId).HasColumnName("template_id");
            entity.Property(e => e.Css)
                .HasMaxLength(80)
                .HasColumnName("css");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");
            entity.Property(e => e.Title)
                .HasMaxLength(80)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Network).WithMany(p => p.Templates)
                .HasForeignKey(d => d.NetworkId)
                .HasConstraintName("fk_template_network");
        });

        modelBuilder.Entity<TemplatePage>(entity =>
        {
            entity.HasKey(e => e.PageId).HasName("template_pages_pkey");

            entity.ToTable("template_pages");

            entity.Property(e => e.PageId).HasColumnName("page_id");
            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(180)
                .HasColumnName("slug");
            entity.Property(e => e.TemplateId).HasColumnName("template_id");
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(170)
                .HasColumnName("title");

            entity.HasOne(d => d.Template).WithMany(p => p.TemplatePages)
                .HasForeignKey(d => d.TemplateId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_template_page");
        });

        modelBuilder.Entity<TemplatePart>(entity =>
        {
            entity.HasKey(e => e.PartId).HasName("template_parts_pkey");

            entity.ToTable("template_parts");

            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Order).HasColumnName("order");
            entity.Property(e => e.PageId).HasColumnName("page_id");
            entity.Property(e => e.PartKey)
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnName("part_key");

            entity.HasOne(d => d.Page).WithMany(p => p.TemplateParts)
                .HasForeignKey(d => d.PageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_template_part_page");
        });

        modelBuilder.Entity<TemplateVar>(entity =>
        {
            entity.HasKey(e => e.VarId).HasName("template_vars_pkey");

            entity.ToTable("template_vars");

            entity.Property(e => e.VarId).HasColumnName("var_id");
            entity.Property(e => e.Key)
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnName("key");
            entity.Property(e => e.Language)
                .HasDefaultValue(1)
                .HasColumnName("language");
            entity.Property(e => e.PageId).HasColumnName("page_id");
            entity.Property(e => e.Value)
                .IsRequired()
                .HasColumnName("value");

            entity.HasOne(d => d.Page).WithMany(p => p.TemplateVars)
                .HasForeignKey(d => d.PageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_template_var_page");
        });

        modelBuilder.Entity<UserDocument>(entity =>
        {
            entity.HasKey(e => e.DocumentId).HasName("user_documents_pkey");

            entity.ToTable("user_documents");

            entity.Property(e => e.DocumentId).HasColumnName("document_id");
            entity.Property(e => e.Base64).HasColumnName("base64");
            entity.Property(e => e.DocumentType)
                .HasDefaultValue(0)
                .HasColumnName("document_type");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<UserNetwork>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.NetworkId }).HasName("pk_user_network");

            entity.ToTable("user_networks");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");
            entity.Property(e => e.ProfileId).HasColumnName("profile_id");
            entity.Property(e => e.ReferrerId).HasColumnName("referrer_id");
            entity.Property(e => e.Role)
                .HasDefaultValue(0)
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");

            entity.HasOne(d => d.Network).WithMany(p => p.UserNetworks)
                .HasForeignKey(d => d.NetworkId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_network_network");

            entity.HasOne(d => d.Profile).WithMany(p => p.UserNetworks)
                .HasForeignKey(d => d.ProfileId)
                .HasConstraintName("fk_user_network_profile");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("user_profiles_pkey");

            entity.ToTable("user_profiles");

            entity.Property(e => e.ProfileId)
                .HasDefaultValueSql("nextval('profile_id_seq'::regclass)")
                .HasColumnName("profile_id");
            entity.Property(e => e.Commission).HasColumnName("commission");
            entity.Property(e => e.Level)
                .HasDefaultValue(1)
                .HasColumnName("level");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnName("name");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");

            entity.HasOne(d => d.Network).WithMany(p => p.UserProfiles)
                .HasForeignKey(d => d.NetworkId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_profile_network");
        });

        modelBuilder.Entity<Withdrawal>(entity =>
        {
            entity.HasKey(e => e.WithdrawalId).HasName("withdrawals_pkey");

            entity.ToTable("withdrawals");

            entity.Property(e => e.WithdrawalId).HasColumnName("withdrawal_id");
            entity.Property(e => e.Duedate)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("duedate");
            entity.Property(e => e.NetworkId).HasColumnName("network_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Network).WithMany(p => p.Withdrawals)
                .HasForeignKey(d => d.NetworkId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_withdrawal_network");
        });
        modelBuilder.HasSequence("network_id_seq");
        modelBuilder.HasSequence("profile_id_seq");
        modelBuilder.HasSequence("invoice_commission_commission_id_seq");

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
