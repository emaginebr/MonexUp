using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MonexUp.Domain.Interfaces.Services;
using NCrontab;

namespace NoChainSwapBackgroundService
{
    public class Service : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<Service> _logger;
        private readonly CrontabSchedule _schedule;
        private DateTime _nextRun;

        public Service(IServiceProvider serviceProvider, ILogger<Service> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _schedule = CrontabSchedule.Parse("*/5 * * * *");
            _nextRun = _schedule.GetNextOccurrence(DateTime.UtcNow);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ProxyPay reconciliation background service started.");
            while (!stoppingToken.IsCancellationRequested)
            {
                if (DateTime.UtcNow >= _nextRun)
                {
                    await RunReconciliationAsync(stoppingToken);
                    _nextRun = _schedule.GetNextOccurrence(DateTime.UtcNow);
                }
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
                catch (TaskCanceledException) { }
            }
        }

        private async Task RunReconciliationAsync(CancellationToken ct)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var reconciler = scope.ServiceProvider.GetRequiredService<IBillingReconciliationService>();
                await reconciler.ReconcileAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ProxyPay reconciliation tick failed.");
            }
        }
    }
}
