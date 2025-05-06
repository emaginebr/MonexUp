using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IUserDocumentModel
    {
        long DocumentId { get; set; }

        long? UserId { get; set; }

        DocumentTypeEnum DocumentType { get; set; }

        string Base64 { get; set; }

        IEnumerable<IUserDocumentModel> ListByUser(long userId, IUserDocumentDomainFactory factory);
        IUserDocumentModel Insert(IUserDocumentModel model, IUserDocumentDomainFactory factory);
        IUserDocumentModel Update(IUserDocumentModel model, IUserDocumentDomainFactory factory);
        void Delete(long documentId);
    }
}
