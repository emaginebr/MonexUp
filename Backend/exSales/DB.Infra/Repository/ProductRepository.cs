using Core.Domain.Repository;
using DB.Infra.Context;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Order;
using exSales.DTO.Product;
using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class ProductRepository : IProductRepository<IProductModel, IProductDomainFactory>
    {
        private ExSalesContext _ccsContext;

        private const int PAGE_SIZE = 15;

        public ProductRepository(ExSalesContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IProductModel DbToModel(IProductDomainFactory factory, Product row)
        {
            var md = factory.BuildProductModel();
            md.ProductId = row.ProductId;
            md.NetworkId = row.NetworkId;
            md.Name = row.Name;
            md.Slug = row.Slug;
            md.Description = row.Description;
            md.Price = row.Price;
            md.Frequency = row.Frequency;
            md.Limit = row.Limit;
            md.Status = (ProductStatusEnum) row.Status;
            md.StripeProductId = row.StripeProductId;
            md.StripePriceId = row.StripePriceId;
            return md;
        }

        private void ModelToDb(IProductModel md, Product row)
        {
            row.ProductId = md.ProductId;
            row.NetworkId = md.NetworkId;
            row.Name = md.Name;
            row.Slug = md.Slug;
            row.Description = md.Description;
            row.Price = md.Price;
            row.Frequency = md.Frequency;
            row.Limit = md.Limit;
            row.Status = (int)md.Status;
            row.StripeProductId = md.StripeProductId;
            row.StripePriceId = md.StripePriceId;
        }

        public IProductModel Insert(IProductModel model, IProductDomainFactory factory)
        {
            var row = new Product();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.ProductId = row.ProductId;
            return model;
        }

        public IProductModel Update(IProductModel model, IProductDomainFactory factory)
        {
            var row = _ccsContext.Products.Find(model.ProductId);
            ModelToDb(model, row);
            _ccsContext.Products.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public IProductModel GetById(long id, IProductDomainFactory factory)
        {
            var row = _ccsContext.Products.Find(id);
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IProductModel GetBySlug(string slug, IProductDomainFactory factory)
        {
            var row = _ccsContext.Products.Where(x => x.Slug == slug).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IEnumerable<IProductModel> Search(long networkId, string keyword, int pageNum, out int pageCount, IProductDomainFactory factory)
        {
            var q = _ccsContext.Products
                .Where(x => x.NetworkId == networkId);
            if (!string.IsNullOrEmpty(keyword))
            {
                q = q.Where(x => x.Name.Contains(keyword, StringComparison.CurrentCultureIgnoreCase));
            }
            var pages = (double)q.Count() / (double)PAGE_SIZE;
            pageCount = Convert.ToInt32(Math.Ceiling(pages));
            var rows = q.Skip((pageNum - 1) * PAGE_SIZE).Take(PAGE_SIZE).ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public IEnumerable<IProductModel> ListByNetwork(long networkId, IProductDomainFactory factory)
        {
            var rows = _ccsContext.Products
                .Where(x => x.NetworkId == networkId)
                .ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public bool ExistSlug(long productId, string slug)
        {
            return _ccsContext.Products.Where(x => x.Slug == slug && (productId == 0 || x.ProductId != productId)).Any();
        }

        public IProductModel GetByStripeProductId(string stripeProductId, IProductDomainFactory factory)
        {
            var row = _ccsContext.Products.Where(x => x.StripeProductId == stripeProductId).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IProductModel GetByStripePriceId(string stripePriceId, IProductDomainFactory factory)
        {
            var row = _ccsContext.Products.Where(x => x.StripePriceId == stripePriceId).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }
    }
}
