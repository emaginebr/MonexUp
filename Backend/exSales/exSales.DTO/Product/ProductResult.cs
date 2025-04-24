using exSales.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.DTO.Product
{
    public class ProductResult: StatusResult
    {
        public ProductInfo Product { get; set; }
    }
}
