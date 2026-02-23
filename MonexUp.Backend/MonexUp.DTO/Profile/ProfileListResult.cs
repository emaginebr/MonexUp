using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Profile
{
    public class ProfileListResult: StatusResult
    {
        public IList<UserProfileInfo> Profiles { get; set; }
    }
}
