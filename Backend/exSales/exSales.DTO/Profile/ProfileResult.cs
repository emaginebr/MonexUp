using exSales.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.DTO.Profile
{
    public class ProfileResult: StatusResult
    {
        public UserProfileInfo Profile { get; set; }
    }
}
