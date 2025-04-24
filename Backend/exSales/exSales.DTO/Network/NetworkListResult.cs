using exSales.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.DTO.Network
{
    public class NetworkListResult: StatusResult
    {
        public IList<UserNetworkInfo> Networks { get; set; }
    }
}
