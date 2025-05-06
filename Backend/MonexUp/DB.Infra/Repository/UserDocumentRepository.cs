using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class UserDocumentRepository : IUserDocumentRepository<IUserDocumentModel, IUserDocumentDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public UserDocumentRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IUserDocumentModel DbToModel(IUserDocumentDomainFactory factory, UserDocument row)
        {
            var md = factory.BuildUserDocumentModel();
            md.DocumentId = row.DocumentId;
            md.UserId = row.UserId;
            md.DocumentType = (DocumentTypeEnum) row.DocumentType;
            md.Base64 = row.Base64;
            return md;
        }

        private void ModelToDb(IUserDocumentModel md, UserDocument row)
        {
            row.DocumentId = md.DocumentId;
            row.UserId = md.UserId;
            row.DocumentType = (int)md.DocumentType;
            row.Base64 = md.Base64;
        }

        public IUserDocumentModel Insert(IUserDocumentModel model, IUserDocumentDomainFactory factory)
        {
            var row = new UserDocument();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.DocumentId = row.DocumentId;
            return model;
        }

        public IUserDocumentModel Update(IUserDocumentModel model, IUserDocumentDomainFactory factory)
        {
            var row = _ccsContext.UserDocuments.Find(model.DocumentId);
            ModelToDb(model, row);
            _ccsContext.UserDocuments.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public void Delete(long documentId)
        {
            var row = _ccsContext.UserDocuments.Find(documentId);
            if (row == null)
                return;
            _ccsContext.UserDocuments.Remove(row);
            _ccsContext.SaveChanges();
        }

        public IEnumerable<IUserDocumentModel> ListByUser(long userId, IUserDocumentDomainFactory factory)
        {
            return _ccsContext.UserDocuments
                .Where(x => x.UserId == userId)
                .Select(x => DbToModel(factory, x));
        }
    }
}
