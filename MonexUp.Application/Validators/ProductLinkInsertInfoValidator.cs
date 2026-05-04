using FluentValidation;
using MonexUp.DTO.ProductLink;

namespace MonexUp.Application.Validators
{
    public class ProductLinkInsertInfoValidator : AbstractValidator<ProductLinkInsertInfo>
    {
        public ProductLinkInsertInfoValidator()
        {
            RuleFor(x => x.LofnProductId).GreaterThan(0).WithMessage("LofnProductId é obrigatório.");
            RuleFor(x => x.NetworkId).GreaterThan(0).WithMessage("NetworkId é obrigatório.");
            RuleFor(x => x.UserId).GreaterThan(0).WithMessage("UserId é obrigatório.");
        }
    }
}
