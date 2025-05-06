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
    public class UserAddressModel : IUserAddressModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserAddressRepository<IUserAddressModel, IUserAddressDomainFactory> _repositoryAddr;

        public UserAddressModel(IUnitOfWork unitOfWork, IUserAddressRepository<IUserAddressModel, IUserAddressDomainFactory> repositoryAddr)
        {
            _unitOfWork = unitOfWork;
            _repositoryAddr = repositoryAddr;
        }

        public long AddressId { get; set; }
        public long UserId { get; set; }
        public string ZipCode { get; set; }
        public string Address { get; set; }
        public string Complement { get; set; }
        public string Neighborhood { get; set; }
        public string City { get; set; }
        public string State { get; set; }

        public void DeleteAllByUser(long userId)
        {
            _repositoryAddr.DeleteAllByUser(userId);
        }

        public IUserAddressModel Insert(IUserAddressDomainFactory factory)
        {
            return _repositoryAddr.Insert(this, factory);
        }

        public IEnumerable<IUserAddressModel> ListByUser(long userId, IUserAddressDomainFactory factory)
        {
            return _repositoryAddr.ListByUser(userId, factory).ToList();
        }
    }
}
