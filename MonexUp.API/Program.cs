using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.IO;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;

namespace MonexUp.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    config.AddEnvironmentVariables();
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    #if !DEBUG
                    webBuilder.UseKestrel((context, options) =>
                    {
                        options.ConfigureHttpsDefaults(httpsOptions =>
                        {
                            var s = Assembly.GetExecutingAssembly().GetManifestResourceStream("MonexUp.API.monexup.com.pfx");
                            using (MemoryStream ms = new MemoryStream())
                            {
                                s.CopyTo(ms);
                                var certPassword = context.Configuration["SSL_CERT_PASSWORD"] ?? "pikpro6";
                                httpsOptions.ServerCertificate = new X509Certificate2(ms.ToArray(), certPassword);
                            }
                        });
                    });
                    #endif
                    webBuilder.UseStartup<Startup>();
                });
    }
}
