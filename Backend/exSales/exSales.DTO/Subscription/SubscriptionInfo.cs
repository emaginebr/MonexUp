using exSales.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.DTO.Subscription
{
    public class SubscriptionInfo
    {
        public OrderInfo Order { get; set; }
        public string ClientSecret {  get; set; }
    }
}
