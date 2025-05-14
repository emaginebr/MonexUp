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

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAddress> UserAddresses { get; set; }

    public virtual DbSet<UserDocument> UserDocuments { get; set; }

    public virtual DbSet<UserNetwork> UserNetworks { get; set; }

    public virtual DbSet<UserPhone> UserPhones { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=167.172.240.71;Port=5432;Database=monexup;Username=postgres;Password=eaa69cpxy2");

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

            entity.HasOne(d => d.Seller).WithMany(p => p.InvoiceSellers)
                .HasForeignKey(d => d.SellerId)
                .HasConstraintName("fk_invoice_seller");

            entity.HasOne(d => d.User).WithMany(p => p.InvoiceUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_invoice_user");
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

            entity.HasOne(d => d.User).WithMany(p => p.InvoiceFees)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_fee_user");
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

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_order_user");
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

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("users_pkey");

            entity.ToTable("users");

            entity.Property(e => e.UserId)
                .HasDefaultValueSql("nextval('user_id_seq'::regclass)")
                .HasColumnName("user_id");
            entity.Property(e => e.BirthDate)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("birth_date");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(180)
                .HasColumnName("email");
            entity.Property(e => e.Hash)
                .HasMaxLength(128)
                .HasColumnName("hash");
            entity.Property(e => e.IdDocument)
                .HasMaxLength(30)
                .HasColumnName("id_document");
            entity.Property(e => e.Image)
                .HasMaxLength(150)
                .HasColumnName("image");
            entity.Property(e => e.IsAdmin)
                .HasDefaultValue(false)
                .HasColumnName("is_admin");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(120)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(128)
                .HasColumnName("password");
            entity.Property(e => e.PixKey)
                .HasMaxLength(180)
                .HasColumnName("pix_key");
            entity.Property(e => e.RecoveryHash)
                .HasMaxLength(128)
                .HasColumnName("recovery_hash");
            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(140)
                .HasColumnName("slug");
            entity.Property(e => e.StripeId)
                .HasMaxLength(120)
                .HasColumnName("stripe_id");
            entity.Property(e => e.Token)
                .HasMaxLength(128)
                .HasColumnName("token");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<UserAddress>(entity =>
        {
            entity.HasKey(e => e.AddressId).HasName("pk_user_addresses");

            entity.ToTable("user_addresses");

            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.Address)
                .HasMaxLength(150)
                .HasColumnName("address");
            entity.Property(e => e.City)
                .HasMaxLength(120)
                .HasColumnName("city");
            entity.Property(e => e.Complement)
                .HasMaxLength(150)
                .HasColumnName("complement");
            entity.Property(e => e.Neighborhood)
                .HasMaxLength(120)
                .HasColumnName("neighborhood");
            entity.Property(e => e.State)
                .HasMaxLength(80)
                .HasColumnName("state");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ZipCode)
                .HasMaxLength(15)
                .HasColumnName("zip_code");

            entity.HasOne(d => d.User).WithMany(p => p.UserAddresses)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_address");
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

            entity.HasOne(d => d.User).WithMany(p => p.UserDocuments)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_user_document");
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

            entity.HasOne(d => d.Referrer).WithMany(p => p.UserNetworkReferrers)
                .HasForeignKey(d => d.ReferrerId)
                .HasConstraintName("fk_user_network_referrer");

            entity.HasOne(d => d.User).WithMany(p => p.UserNetworkUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_network_user");
        });

        modelBuilder.Entity<UserPhone>(entity =>
        {
            entity.HasKey(e => e.PhoneId).HasName("user_phones_pkey");

            entity.ToTable("user_phones");

            entity.Property(e => e.PhoneId).HasColumnName("phone_id");
            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.UserPhones)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_phone");
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
        modelBuilder.HasSequence("network_id_seq");
        modelBuilder.HasSequence("profile_id_seq");
        modelBuilder.HasSequence("user_id_seq");

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
