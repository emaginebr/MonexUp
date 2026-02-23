using MonexUp.Application;
using NoChainSwapBackgroundService;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MonexUp.BackgroundService
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = Configuration.GetConnectionString("MonexUpContext");
            if (string.IsNullOrEmpty(connectionString))
            {
                var host = Configuration["POSTGRES_HOST"] ?? System.Environment.GetEnvironmentVariable("POSTGRES_HOST");
                var port = Configuration["POSTGRES_PORT"] ?? System.Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
                var db = Configuration["POSTGRES_DB"] ?? System.Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "monexup";
                var user = Configuration["POSTGRES_USER"] ?? System.Environment.GetEnvironmentVariable("POSTGRES_USER");
                var pass = Configuration["POSTGRES_PASSWORD"] ?? System.Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
                connectionString = $"Host={host};Port={port};Database={db};Username={user};Password={pass}";
            }

            var config = new ConfigurationParam
            {
                ConnectionString = connectionString
            };
            Initializer.Configure(services, config, Configuration, false);
            services.AddHostedService<Service>();
            //services.AddHostedService<ServiceDaily>();
            services.AddTransient(typeof(ScheduleTask), typeof(ScheduleTask));
            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            
        }
    }
}
