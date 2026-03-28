using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Template.Infra.Context;

public partial class TemplateContext : DbContext
{
    public TemplateContext()
    {
    }

    public TemplateContext(DbContextOptions<TemplateContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TemplateDb> Templates { get; set; }

    public virtual DbSet<TemplatePageDb> TemplatePages { get; set; }

    public virtual DbSet<TemplatePartDb> TemplateParts { get; set; }

    public virtual DbSet<TemplateVarDb> TemplateVars { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TemplateDb>(entity =>
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
        });

        modelBuilder.Entity<TemplatePageDb>(entity =>
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

        modelBuilder.Entity<TemplatePartDb>(entity =>
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

        modelBuilder.Entity<TemplateVarDb>(entity =>
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
    }
}
