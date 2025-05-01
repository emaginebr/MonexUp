using exSales.DTO.Subscription;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface ISubscriptionService
    {
        Task<SubscriptionInfo> Insert(long productId, long userId);

    }
}
