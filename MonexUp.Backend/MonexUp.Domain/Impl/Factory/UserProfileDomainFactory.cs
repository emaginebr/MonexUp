using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MonexUp.Domain.Impl.Models;

namespace MonexUp.Domain.Impl.Factory
{
    public class UserProfileDomainFactory : IUserProfileDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory> _repositoryProfile;

        public UserProfileDomainFactory(IUnitOfWork unitOfWork, IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory> repositoryProfile)
        {
            _unitOfWork = unitOfWork;
            _repositoryProfile = repositoryProfile;
        }

        public IUserProfileModel BuildUserProfileModel()
        {
            return new UserProfileModel(_unitOfWork, _repositoryProfile);
        }
    }
}
