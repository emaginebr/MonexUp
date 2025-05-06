using exSales.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Factory
{
    public interface IOrderItemDomainFactory
    {
        IOrderItemModel BuildOrderItemModel();
    }
}
