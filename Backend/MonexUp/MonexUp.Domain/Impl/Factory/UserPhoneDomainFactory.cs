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
    public class UserPhoneDomainFactory : IUserPhoneDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserPhoneRepository<IUserPhoneModel, IUserPhoneDomainFactory> _repositoryPhone;

        public UserPhoneDomainFactory(IUnitOfWork unitOfWork, IUserPhoneRepository<IUserPhoneModel, IUserPhoneDomainFactory> repositoryPhone)
        {
            _unitOfWork = unitOfWork;
            _repositoryPhone = repositoryPhone;
        }

        public IUserPhoneModel BuildUserPhoneModel()
        {
            return new UserPhoneModel(_unitOfWork, _repositoryPhone);
        }
    }
}
