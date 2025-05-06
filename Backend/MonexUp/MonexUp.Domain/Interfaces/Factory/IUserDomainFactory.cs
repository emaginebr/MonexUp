using System;
using MonexUp.Domain.Interfaces.Models;

namespace MonexUp.Domain.Interfaces.Factory
{
    public interface IUserDomainFactory
    {
        IUserModel BuildUserModel();
    }
}
