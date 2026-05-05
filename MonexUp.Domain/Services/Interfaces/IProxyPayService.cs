using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Lofn;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.DTO.User;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IProxyPayService
    {
        Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, LofnProductInfo product, INetworkModel network, UserInfo seller, string documentId);
        Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatus(string proxyPayInvoiceId);
        Task SyncPendingInvoices();
    }
}
