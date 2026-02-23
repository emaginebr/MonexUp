using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IUserProfileModel
    {
        long ProfileId { get; set; }

        long NetworkId { get; set; }

        string Name { get; set; }

        double Commission { get; set; }
        int Level { get; set; }
        int Members { get; set; }

        IEnumerable<IUserProfileModel> ListByNetwork(long networkId, IUserProfileDomainFactory factory);
        IUserProfileModel GetById(long profileId, IUserProfileDomainFactory factory);
        IUserProfileModel Insert(IUserProfileDomainFactory factory);
        IUserProfileModel Update(IUserProfileDomainFactory factory);
        int GetUsersCount(long networkId, long profileId);
        void Delete(long profileId);
    }
}
