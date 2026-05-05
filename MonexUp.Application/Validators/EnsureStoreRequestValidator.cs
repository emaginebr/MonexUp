using FluentValidation;
using MonexUp.DTO.Billing;

namespace MonexUp.Application.Validators
{
    public class EnsureStoreRequestValidator : AbstractValidator<EnsureStoreRequest>
    {
        public EnsureStoreRequestValidator()
        {
            RuleFor(x => x.NetworkId).GreaterThan(0).WithMessage("NetworkId é obrigatório.");
        }
    }
}
