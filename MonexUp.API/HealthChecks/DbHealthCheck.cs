using System.Threading;
using System.Threading.Tasks;
using DB.Infra.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace MonexUp.API.HealthChecks
{
    /// <summary>
    /// Readiness check: verifica se o banco está acessível.
    /// Usado no endpoint /health/ready (proxy/LB), NÃO na liveness — assim
    /// uma queda do banco não faz o orquestrador reiniciar um processo saudável.
    /// </summary>
    public class DbHealthCheck : IHealthCheck
    {
        private readonly MonexUpContext _context;

        public DbHealthCheck(MonexUpContext context)
        {
            _context = context;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);

            return canConnect
                ? HealthCheckResult.Healthy("Banco acessível.")
                : HealthCheckResult.Unhealthy("Banco inacessível.");
        }
    }
}
