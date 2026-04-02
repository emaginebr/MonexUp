using System.Threading.Tasks;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.DTO.User;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IProxyPayService
    {
        Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, IProductModel product, INetworkModel network, UserInfo seller, string documentId);
        Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatus(string proxyPayInvoiceId);
        Task SyncPendingInvoices();
    }
}
