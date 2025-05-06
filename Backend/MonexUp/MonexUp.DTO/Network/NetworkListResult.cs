using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Network
{
    public class NetworkListResult: StatusResult
    {
        public IList<NetworkInfo> Networks { get; set; }
    }
}
