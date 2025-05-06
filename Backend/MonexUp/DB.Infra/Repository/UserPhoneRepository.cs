using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class UserPhoneRepository : IUserPhoneRepository<IUserPhoneModel, IUserPhoneDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public UserPhoneRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IUserPhoneModel DbToModel(IUserPhoneDomainFactory factory, UserPhone row)
        {
            var md = factory.BuildUserPhoneModel();
            md.PhoneId = row.PhoneId;
            md.UserId = row.UserId;
            md.Phone = row.Phone;
            return md;
        }

        private void ModelToDb(IUserPhoneModel md, UserPhone row)
        {
            row.PhoneId = md.PhoneId;
            row.UserId = md.UserId;
            row.Phone = md.Phone;
        }

        public IUserPhoneModel Insert(IUserPhoneModel model, IUserPhoneDomainFactory factory)
        {
            var row = new UserPhone();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.PhoneId = row.PhoneId;
            return model;
        }

        public void DeleteAllByUser(long userId)
        {
            var rows = _ccsContext.UserPhones.Where(x => x.UserId == userId).ToList();
            if (rows.Count() == 0)
                return;
            _ccsContext.UserPhones.RemoveRange(rows);
            _ccsContext.SaveChanges();
        }

        public IEnumerable<IUserPhoneModel> ListByUser(long userId, IUserPhoneDomainFactory factory)
        {
            var phones = _ccsContext.UserPhones
                .Where(x => x.UserId == userId)
                .ToList();
            return phones.Select(x => DbToModel(factory, x));
        }
    }
}
