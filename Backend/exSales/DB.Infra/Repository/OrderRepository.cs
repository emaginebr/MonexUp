using Core.Domain.Repository;
using DB.Infra.Context;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Network;
using exSales.DTO.Order;
using NoobsMuc.Coinmarketcap.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class OrderRepository : IOrderRepository<IOrderModel, IOrderDomainFactory>
    {
        private ExSalesContext _ccsContext;

        public OrderRepository(ExSalesContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IOrderModel DbToModel(IOrderDomainFactory factory, Order row)
        {
            var md = factory.BuildOrderModel();
            md.OrderId = row.OrderId;
            md.ProductId = row.ProductId;
            md.UserId = row.UserId;
            md.Status = (OrderStatusEnum) row.Status;
            md.StripeId = row.StripeId;
            return md;
        }

        private void ModelToDb(IOrderModel md, Order row)
        {
            row.OrderId = md.OrderId;
            row.ProductId = md.ProductId;
            row.UserId = md.UserId;
            row.Status = (int)md.Status;
            row.StripeId = md.StripeId;
        }

        public IOrderModel Insert(IOrderModel model, IOrderDomainFactory factory)
        {
            var row = new Order();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.OrderId = row.OrderId;
            return model;
        }

        public IOrderModel Update(IOrderModel model, IOrderDomainFactory factory)
        {
            var row = _ccsContext.Orders.Find(model.OrderId);
            ModelToDb(model, row);
            _ccsContext.Orders.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public IEnumerable<IOrderModel> List(long networkId, long userId, int status, IOrderDomainFactory factory)
        {
            var q = _ccsContext.Orders;
            if (networkId > 0)
            {
                q.Where(x => x.Product.NetworkId == networkId);
            }
            if (userId > 0) {
                q.Where(x => x.UserId == userId);
            }
            if (status > 0) {
                q.Where(x => x.Status == status);
            }
            return q.ToList().Select(x => DbToModel(factory, x));
        }

        public IOrderModel GetById(long id, IOrderDomainFactory factory)
        {
            var row = _ccsContext.Orders.Find(id);
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IOrderModel Get(long productId, long userId, int status, IOrderDomainFactory factory)
        {
            var row = _ccsContext.Orders
                .Where(x => x.ProductId == productId && x.UserId == userId && x.Status == status)
                .FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IOrderModel GetByStripeId(string stripeId, IOrderDomainFactory factory)
        {
            var row = _ccsContext.Orders
                .Where(x => x.StripeId == stripeId)
                .FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }
    }
}
