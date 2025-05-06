using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Models
{
    public class UserPhoneModel : IUserPhoneModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserPhoneRepository<IUserPhoneModel, IUserPhoneDomainFactory> _repositoryPhone;

        public UserPhoneModel(IUnitOfWork unitOfWork, IUserPhoneRepository<IUserPhoneModel, IUserPhoneDomainFactory> repositoryPhone)
        {
            _unitOfWork = unitOfWork;
            _repositoryPhone = repositoryPhone;
        }

        public long PhoneId { get; set; }
        public long UserId { get; set; }
        public string Phone { get; set; }

        public void DeleteAllByUser(long userId)
        {
            _repositoryPhone.DeleteAllByUser(userId);
        }

        public IUserPhoneModel Insert(IUserPhoneDomainFactory factory)
        {
            return _repositoryPhone.Insert(this, factory);
        }

        public IEnumerable<IUserPhoneModel> ListByUser(long userId, IUserPhoneDomainFactory factory)
        {
            return _repositoryPhone.ListByUser(userId, factory).ToList();
        }
    }
}
