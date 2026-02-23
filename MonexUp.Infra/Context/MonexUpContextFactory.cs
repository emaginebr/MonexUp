using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DB.Infra.Context;

public class MonexUpContextFactory : IDesignTimeDbContextFactory<MonexUpContext>
{
    public MonexUpContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MonexUpContext>();

        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
        var database = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "monexup";
        var username = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "";

        optionsBuilder
            .UseLazyLoadingProxies()
            .UseNpgsql($"Host={host};Port={port};Database={database};Username={username};Password={password}");

        return new MonexUpContext(optionsBuilder.Options);
    }
}
