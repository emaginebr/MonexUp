using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Product
{
    public class ProductResult: StatusResult
    {
        public ProductInfo Product { get; set; }
    }
}
