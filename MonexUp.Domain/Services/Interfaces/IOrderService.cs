using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IOrderService
    {
        IList<IOrderModel> List(long networkId, long userId, OrderStatusEnum? status);
        Task<OrderListPagedResult> Search(long networkId, long? userId, long? sellerId, int pageNum, string token);
        IOrderModel GetById(long orderId);
        IOrderModel GetByProxyPayInvoiceId(long proxyPayInvoiceId);
        /// <summary>
        /// Idempotent paid transition: resolves the order by its ProxyPay invoice id and,
        /// when it is still Incoming, advances it to Active. No-op if already Active or not found.
        /// Returns the affected order (or null when no matching order exists).
        /// </summary>
        IOrderModel MarkPaidByInvoiceId(long proxyPayInvoiceId);
        IOrderModel Get(long productId, long userId, long? sellerId, OrderStatusEnum status);
        Task<OrderInfo> GetOrderInfo(IOrderModel order, string token);
        IOrderModel Insert(OrderInfo order);
        IOrderModel Update(OrderInfo order);
    }
}
