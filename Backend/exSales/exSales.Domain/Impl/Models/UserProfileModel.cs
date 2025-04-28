using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Models
{
    public class UserProfileModel : IUserProfileModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory> _repositoryProfile;

        public UserProfileModel(IUnitOfWork unitOfWork, IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory> repositoryProfile)
        {
            _unitOfWork = unitOfWork;
            _repositoryProfile = repositoryProfile;
        }

        public long ProfileId { get; set; }
        public long NetworkId { get; set; }
        public string Name { get; set; }
        public double Commission { get; set; }
        public int Level { get; set; }
        public int Members { get; set; }

        public IEnumerable<IUserProfileModel> ListByNetwork(long networkId, IUserProfileDomainFactory factory)
        {
            return _repositoryProfile.ListByNetwork(networkId, factory);
        }

        public IUserProfileModel GetById(long profileId, IUserProfileDomainFactory factory)
        {
            return _repositoryProfile.GetById(profileId, factory);
        }

        public IUserProfileModel Insert(IUserProfileDomainFactory factory)
        {
            return _repositoryProfile.Insert(this, factory);
        }

        public IUserProfileModel Update(IUserProfileDomainFactory factory)
        {
            return _repositoryProfile.Update(this, factory);
        }

        public int GetUsersCount(long networkId, long profileId)
        {
            return _repositoryProfile.GetUsersCount(networkId, profileId);
        }

        public void Delete(long profileId)
        {
            _repositoryProfile.Delete(profileId);
        }
    }
}
