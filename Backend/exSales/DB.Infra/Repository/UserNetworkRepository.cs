using Core.Domain.Repository;
using DB.Infra.Context;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Document;
using exSales.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class UserNetworkRepository : IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory>
    {
        private ExSalesContext _ccsContext;

        public UserNetworkRepository(ExSalesContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IUserNetworkModel DbToModel(IUserNetworkDomainFactory factory, UserNetwork row)
        {
            var md = factory.BuildUserNetworkModel();
            md.UserId = row.UserId;
            md.NetworkId = row.NetworkId;
            md.ProfileId = row.ProfileId;
            md.Role = (UserRoleEnum) row.Role;
            md.Status = (UserNetworkStatusEnum) row.Status;
            md.ReferrerId = row.ReferrerId;
            return md;
        }

        private void ModelToDb(IUserNetworkModel md, UserNetwork row)
        {
            row.UserId = md.UserId;
            row.NetworkId = md.NetworkId;
            row.ProfileId = md.ProfileId;
            row.Role = (int)md.Role;
            row.Status = (int)md.Status;
            row.ReferrerId = md.ReferrerId;
        }

        public IUserNetworkModel Insert(IUserNetworkModel model, IUserNetworkDomainFactory factory)
        {
            var row = new UserNetwork();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public IUserNetworkModel Update(IUserNetworkModel model, IUserNetworkDomainFactory factory)
        {
            var row = _ccsContext.UserNetworks
                .Where(x => x.NetworkId == model.NetworkId && x.UserId == model.UserId)
                .FirstOrDefault();
            if (row == null)
                return null;
            ModelToDb(model, row);
            _ccsContext.UserNetworks.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public IEnumerable<IUserNetworkModel> ListByUser(long userId, IUserNetworkDomainFactory factory)
        {
            var rows = _ccsContext.UserNetworks
                .Where(x => x.UserId == userId).ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public IUserNetworkModel Get(long networkId, long userId, IUserNetworkDomainFactory factory)
        {
            var row = _ccsContext.UserNetworks
                .Where(x => x.NetworkId == networkId && x.UserId == userId)
                .FirstOrDefault();
            if (row == null)
            {
                return null;
            }
            return DbToModel(factory, row);
        }

        public int GetQtdyUserByNetwork(long networkId)
        {
            return _ccsContext.UserNetworks
                .Where(x => x.NetworkId == networkId)
                .Count();
        }
    }
}
