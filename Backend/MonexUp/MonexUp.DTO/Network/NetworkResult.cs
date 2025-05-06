using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Network
{
    public class NetworkResult: StatusResult
    {
        public NetworkInfo Network { get; set; }
    }
}
