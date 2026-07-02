using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Lofn;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.DTO.User;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IProxyPayService
    {
        Task<INetworkModel> EnsureStoreAsync(INetworkModel network, string bearerToken, CancellationToken ct = default);
        Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, LofnProductInfo product, INetworkModel network, UserInfo seller, decimal? unitPriceOverride = null);
        Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatus(string proxyPayInvoiceId);
        /// <summary>Write-only: sets the AbacatePay API key on the network's ProxyPay store.</summary>
        Task SetAbacatePayApiKey(long networkId, string apiKey, string bearerToken, CancellationToken ct = default);
        /// <summary>Indicator: whether the caller's ProxyPay store has an AbacatePay key configured.</summary>
        Task<bool> GetHasAbacatePayApiKey(string bearerToken, CancellationToken ct = default);
        /// <summary>Dev/test only: simulate payment of a PIX invoice at ProxyPay.</summary>
        Task SimulatePayment(long proxyPayInvoiceId, CancellationToken ct = default);
        Task SyncPendingInvoices();
    }
}
