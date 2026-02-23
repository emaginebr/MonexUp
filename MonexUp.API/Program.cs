using Castle.Core.Resource;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Https;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Resources;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace MonexUp.API
{
    public class Program
    {
        private static void LoadEnvFile()
        {
            var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
            if (!File.Exists(envPath))
                envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
            if (!File.Exists(envPath))
                return;

            foreach (var line in File.ReadAllLines(envPath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#"))
                    continue;

                var idx = trimmed.IndexOf('=');
                if (idx <= 0) continue;

                var key = trimmed.Substring(0, idx).Trim();
                var value = trimmed.Substring(idx + 1).Trim();
                if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                    Environment.SetEnvironmentVariable(key, value);
            }
        }

        public static void Main(string[] args)
        {
            LoadEnvFile();
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
                    webBuilder.UseKestrel(options =>
                    {
                        options.ConfigureHttpsDefaults(httpsOptions =>
                        {
                            var s = Assembly.GetExecutingAssembly().GetManifestResourceStream("MonexUp.API.monexup.com.pfx");
                            using (MemoryStream ms = new MemoryStream())
                            {
                                s.CopyTo(ms);
                                var certPassword = Environment.GetEnvironmentVariable("SSL_CERT_PASSWORD") ?? "pikpro6";
                                httpsOptions.ServerCertificate = new X509Certificate2(ms.ToArray(), certPassword);
                            }
                        });
                    });
                    #endif
                    webBuilder.UseStartup<Startup>();
                });
    }
}
