using MonexUp.Application;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text.Json;
using System.Threading.Tasks;

namespace MonexUp.API
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

            var config = new ConfigurationParam
            {
                ConnectionString = connectionString
            };
            Initializer.Configure(services, config, Configuration);
            services.AddControllers();
            services.AddHealthChecks()
                .AddCheck<HealthChecks.DbHealthCheck>("database", tags: new[] { "ready" });
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { 
                    Title = "MonexUp.API", 
                    Version = "v1" 
                });
            });
            services.AddCors(o => o.AddPolicy("MyPolicy", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            }));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment() || env.EnvironmentName == "Docker")
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger(c =>
                {
                    c.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi2_0;
                });
                app.UseSwaggerUI(c => {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MonexUp.API v1");
                    //c.RoutePrefix = string.Empty;
                });
            }


            // Liveness: só indica que o processo está vivo. NÃO depende do banco,
            // para que uma queda de DB não dispare reinício do container.
            app.UseHealthChecks("/",
                new HealthCheckOptions()
                {
                    Predicate = _ => false,
                    ResponseWriter = async (context, report) =>
                    {
                        var result = JsonSerializer.Serialize(
                            new
                            {
                                currentTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                                statusApplication = report.Status.ToString(),
                            });

                        context.Response.ContentType = MediaTypeNames.Application.Json;
                        await context.Response.WriteAsync(result);
                    }
                });

            // Readiness: reflete o estado do banco (para proxy/LB decidir rotear tráfego).
            app.UseHealthChecks("/health/ready",
                new HealthCheckOptions()
                {
                    Predicate = check => check.Tags.Contains("ready"),
                    ResponseWriter = async (context, report) =>
                    {
                        var result = JsonSerializer.Serialize(
                            new
                            {
                                currentTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                                statusApplication = report.Status.ToString(),
                            });

                        context.Response.ContentType = MediaTypeNames.Application.Json;
                        await context.Response.WriteAsync(result);
                    }
                });

            app.Use(async (context, next) =>
            {
                try
                {
                    await next();
                }
                catch (Exception ex)
                {
                    var logger = context.RequestServices.GetRequiredService<ILogger<Startup>>();
                    logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

                    if (context.Response.HasStarted)
                    {
                        throw;
                    }

                    context.Response.Clear();
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = MediaTypeNames.Application.Json;
                    var payload = JsonSerializer.Serialize(new
                    {
                        sucesso = false,
                        mensagemErro = ex.Message
                    });
                    await context.Response.WriteAsync(payload);
                }
            });

            app.UseRouting();
            app.UseCors("MyPolicy");

            app.UseAuthentication();
            app.UseAuthorization();


            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
