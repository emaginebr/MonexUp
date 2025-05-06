using System;
using MonexUp.DTO.Domain;

namespace MonexUp.DTO.User
{
    public class UserResult : StatusResult
    {
        public UserInfo User { get; set; }
    }
}
