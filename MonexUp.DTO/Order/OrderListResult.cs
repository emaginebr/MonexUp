using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Order
{
    public class OrderListResult: StatusResult
    {
        public IList<OrderInfo> Orders { get; set; }
    }
}
