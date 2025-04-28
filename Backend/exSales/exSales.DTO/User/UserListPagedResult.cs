using exSales.DTO.Domain;
using exSales.DTO.Network;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace exSales.DTO.User
{
    public class UserListPagedResult: StatusResult
    {
        [JsonPropertyName("users")]
        public IList<UserNetworkSearchInfo> Users { get; set; }
        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; }
        [JsonPropertyName("pageCount")]
        public int PageCount { get; set; }
    }
}
