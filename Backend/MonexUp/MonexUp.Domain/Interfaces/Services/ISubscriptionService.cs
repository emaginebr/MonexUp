using MonexUp.DTO.Subscription;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface ISubscriptionService
    {
        Task<SubscriptionInfo> CreateSubscription(long productId, long userId, long? sellerId);
        //Task<SubscriptionInfo> CreateInvoice(long productId, long userId);

    }
}
