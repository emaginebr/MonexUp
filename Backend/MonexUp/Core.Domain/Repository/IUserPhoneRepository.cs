using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface IUserPhoneRepository<TModel, TFactory>
    {
        IEnumerable<TModel> ListByUser(long userId, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        void DeleteAllByUser(long userId);
    }
}
