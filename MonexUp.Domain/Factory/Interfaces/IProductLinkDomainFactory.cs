using MonexUp.Domain.Interfaces.Models;

namespace MonexUp.Domain.Interfaces.Factory
{
    public interface IProductLinkDomainFactory
    {
        IProductLinkModel BuildProductLinkModel();
    }
}
