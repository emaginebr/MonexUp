using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IUserModel
    {
        long UserId { get; set; }
        string Hash { get; set; }
        string Slug { get; set; }
        string Name { get; set; }
        string Email { get; set; }
        string IdDocument { get; set; }
        string PixKey { get; set; }
        DateTime? BirthDate { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime UpdatedAt { get; set; }
        bool IsAdmin { get; set; }
        string StripeId { get; set; }

        IUserModel Insert(IUserDomainFactory factory);
        IUserModel Update(IUserDomainFactory factory);
        IUserModel GetByEmail(string email, IUserDomainFactory factory);
        IUserModel GetBySlug(string slug, IUserDomainFactory factory);
        IUserModel GetById(long userId, IUserDomainFactory factory);
        IUserModel GetByToken(string token, IUserDomainFactory factory);
        IUserModel GetByStripeId(string stripeId, IUserDomainFactory factory);
        string GenerateNewToken(IUserDomainFactory factory);
        IUserModel GetByRecoveryHash(string recoveryHash, IUserDomainFactory factory);
        IEnumerable<IUserModel> ListAllUsers(IUserDomainFactory factory);
        IUserModel LoginWithEmail(string email, string password, IUserDomainFactory factory);
        bool HasPassword(long userId, IUserDomainFactory factory);
        void ChangePassword(long userId, string password, IUserDomainFactory factory);
        string GenerateRecoveryHash(long userId, IUserDomainFactory factory);
        bool ExistSlug(long userId, string slug);
    }
}
