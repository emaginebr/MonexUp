using Core.Domain.Repository;
using DB.Infra.Context;
using Microsoft.EntityFrameworkCore;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DB.Infra.Repository
{
    public class ProductLinkRepository : IProductLinkRepository<IProductLinkModel, IProductLinkDomainFactory>
    {
        private readonly MonexUpContext _ccsContext;

        public ProductLinkRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IProductLinkModel DbToModel(IProductLinkDomainFactory factory, ProductLink row)
        {
            var md = factory.BuildProductLinkModel();
            md.Id = row.Id;
            md.LofnProductId = row.LofnProductId;
            md.NetworkId = row.NetworkId;
            md.UserId = row.UserId;
            md.CreatedAt = row.CreatedAt;
            return md;
        }

        public IProductLinkModel Upsert(IProductLinkModel model, IProductLinkDomainFactory factory)
        {
            var existing = _ccsContext.ProductLinks
                .AsNoTracking()
                .FirstOrDefault(x => x.LofnProductId == model.LofnProductId);

            if (existing != null)
            {
                return DbToModel(factory, existing);
            }

            var row = new ProductLink
            {
                LofnProductId = model.LofnProductId,
                NetworkId = model.NetworkId,
                UserId = model.UserId,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            try
            {
                _ccsContext.ProductLinks.Add(row);
                _ccsContext.SaveChanges();
            }
            catch (DbUpdateException)
            {
                var raced = _ccsContext.ProductLinks
                    .AsNoTracking()
                    .FirstOrDefault(x => x.LofnProductId == model.LofnProductId);
                if (raced != null)
                {
                    return DbToModel(factory, raced);
                }
                throw;
            }

            model.Id = row.Id;
            model.CreatedAt = row.CreatedAt;
            return model;
        }

        public IProductLinkModel GetByLofnProductId(long lofnProductId, IProductLinkDomainFactory factory)
        {
            var row = _ccsContext.ProductLinks
                .AsNoTracking()
                .FirstOrDefault(x => x.LofnProductId == lofnProductId);
            return row == null ? null : DbToModel(factory, row);
        }

        public IList<IProductLinkModel> ListByNetwork(long networkId, IProductLinkDomainFactory factory)
        {
            return _ccsContext.ProductLinks
                .AsNoTracking()
                .Where(x => x.NetworkId == networkId)
                .OrderByDescending(x => x.CreatedAt)
                .ToList()
                .Select(x => DbToModel(factory, x))
                .ToList();
        }

        public IList<IProductLinkModel> ListByUser(long userId, IProductLinkDomainFactory factory)
        {
            return _ccsContext.ProductLinks
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToList()
                .Select(x => DbToModel(factory, x))
                .ToList();
        }

        public int DeleteByNetwork(long networkId)
        {
            var rows = _ccsContext.ProductLinks.Where(x => x.NetworkId == networkId).ToList();
            if (rows.Count == 0) return 0;
            _ccsContext.ProductLinks.RemoveRange(rows);
            _ccsContext.SaveChanges();
            return rows.Count;
        }
    }
}
