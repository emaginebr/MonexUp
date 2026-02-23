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
                var host = Configuration["DB_HOST"] ?? System.Environment.GetEnvironmentVariable("DB_HOST");
                var port = Configuration["DB_PORT"] ?? System.Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
                var db = Configuration["DB_NAME"] ?? System.Environment.GetEnvironmentVariable("DB_NAME") ?? "monexup";
                var user = Configuration["DB_USER"] ?? System.Environment.GetEnvironmentVariable("DB_USER");
                var pass = Configuration["DB_PASSWORD"] ?? System.Environment.GetEnvironmentVariable("DB_PASSWORD");
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
