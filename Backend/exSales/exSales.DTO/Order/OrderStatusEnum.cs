using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.DTO.Order
{
    public enum OrderStatusEnum
    {
        Incoming = 1,
        Active = 2,
        Suspended = 3,
        Finished = 4,
        Expired = 5
    }
}
