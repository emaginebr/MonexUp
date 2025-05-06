using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Models
{
    public class UserDocumentModel : IUserDocumentModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserDocumentRepository<IUserDocumentModel, IUserDocumentDomainFactory> _repositoryDocument;

        public UserDocumentModel(IUnitOfWork unitOfWork, IUserDocumentRepository<IUserDocumentModel, IUserDocumentDomainFactory> repositoryDocument)
        {
            _unitOfWork = unitOfWork;
            _repositoryDocument = repositoryDocument;
        }

        public long DocumentId { get; set; }
        public long? UserId { get; set; }
        public DocumentTypeEnum DocumentType { get; set; }
        public string Base64 { get; set; }

        public void Delete(long documentId)
        {
            _repositoryDocument.Delete(documentId);
        }

        public IUserDocumentModel Insert(IUserDocumentModel model, IUserDocumentDomainFactory factory)
        {
            return _repositoryDocument.Insert(model, factory);
        }

        public IEnumerable<IUserDocumentModel> ListByUser(long userId, IUserDocumentDomainFactory factory)
        {
            return _repositoryDocument.ListByUser(userId, factory);
        }

        public IUserDocumentModel Update(IUserDocumentModel model, IUserDocumentDomainFactory factory)
        {
            return _repositoryDocument.Update(model, factory);
        }
    }
}
