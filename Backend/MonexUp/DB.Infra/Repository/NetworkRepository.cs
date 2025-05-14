using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Network;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace DB.Infra.Repository
{
    public class NetworkRepository : INetworkRepository<INetworkModel, INetworkDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public NetworkRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private INetworkModel DbToModel(INetworkDomainFactory factory, Network row)
        {
            var md = factory.BuildNetworkModel();
            md.NetworkId = row.NetworkId;
            md.Name = row.Name;
            md.Slug = row.Slug;
            md.Image = row.Image;
            md.Email = row.Email?.ToLower();
            md.Commission = row.Commission;
            md.WithdrawalMin = row.WithdrawalMin;
            md.WithdrawalPeriod = row.WithdrawalPeriod;
            md.Plan = (NetworkPlanEnum)row.Plan;
            md.Status = (NetworkStatusEnum) row.Status;
            return md;
        }

        private void ModelToDb(INetworkModel md, Network row)
        {
            row.NetworkId = md.NetworkId;
            row.Name = md.Name;
            row.Slug = md.Slug;
            row.Image = md.Image;
            row.Email = md.Email;
            row.Commission = md.Commission;
            row.WithdrawalMin = md.WithdrawalMin;
            row.WithdrawalPeriod = md.WithdrawalPeriod;
            row.Plan = (int)md.Plan;
            row.Status = (int)md.Status;
        }

        public INetworkModel Insert(INetworkModel model, INetworkDomainFactory factory)
        {
            var row = new Network();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.NetworkId = row.NetworkId;
            return model;
        }

        public INetworkModel Update(INetworkModel model, INetworkDomainFactory factory)
        {
            var row = _ccsContext.Networks.Find(model.NetworkId);
            ModelToDb(model, row);
            _ccsContext.Networks.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public IEnumerable<INetworkModel> ListByStatus(int status, INetworkDomainFactory factory)
        {
            var networks = _ccsContext.Networks.Where(x => x.Status == status).ToList(); 
            return networks.Select(x => DbToModel(factory, x));
        }

        public INetworkModel GetById(long id, INetworkDomainFactory factory)
        {
            var row = _ccsContext.Networks.Find(id);
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public INetworkModel GetBySlug(string slug, INetworkDomainFactory factory)
        {
            var row = _ccsContext.Networks.Where(x => x.Slug.ToLower() == slug.ToLower()).FirstOrDefault();
            if (row == null)
            {
                return null;
            }
            return DbToModel(factory, row);
        }

        public bool ExistSlug(long networkId, string slug)
        {
            return _ccsContext.Networks.Where(x => x.Slug == slug && (networkId == 0 || x.NetworkId != networkId)).Any();
        }

        public INetworkModel GetByName(string name, INetworkDomainFactory factory)
        {
            var row = _ccsContext.Networks.Where(x => x.Name.ToLower() == name.ToLower()).FirstOrDefault();
            if (row == null)
            {
                return null;
            }
            return DbToModel(factory, row);
        }

        public INetworkModel GetByEmail(string email, INetworkDomainFactory factory)
        {
            var row = _ccsContext.Networks.Where(x => x.Email.ToLower() == email.ToLower()).FirstOrDefault();
            if (row == null)
            {
                return null;
            }
            return DbToModel(factory, row);
        }
    }
}
