using System;
using System.Collections.Generic;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using Core.Domain;
using Core.Domain.Repository;
using System.Net;

namespace exSales.Domain.Impl.Models
{
    public class UserModel : IUserModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserRepository<IUserModel, IUserDomainFactory> _repositoryUser;

        public UserModel(IUnitOfWork unitOfWork, IUserRepository<IUserModel, IUserDomainFactory> repositoryUser)
        {
            _unitOfWork = unitOfWork;
            _repositoryUser = repositoryUser;
        }

        public long UserId { get; set; }
        public string Hash { get; set; }
        public string Token { get; set; }
        public string Slug { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string IdDocument { get; set; }
        public string PixKey { get; set; }
        public DateTime? BirthDate { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string StripeId { get; set; }

        private string CreateMD5(string input)
        {
            using (System.Security.Cryptography.MD5 md5 = System.Security.Cryptography.MD5.Create())
            {
                byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
                byte[] hashBytes = md5.ComputeHash(inputBytes);

                return Convert.ToHexString(hashBytes);
            }
        }

        public IUserModel GetById(long userId, IUserDomainFactory factory)
        {
            return _repositoryUser.GetById(userId, factory);
        }

        public IUserModel GetByToken(string token, IUserDomainFactory factory)
        {
            return _repositoryUser.GetByToken(token, factory);
        }

        public string GenerateNewToken(IUserDomainFactory factory)
        {
            var token = CreateMD5(Guid.NewGuid().ToString());
            _repositoryUser.UpdateToken(this.UserId, token);
            return token;
        }

        public IUserModel Insert(IUserDomainFactory factory)
        {
            return _repositoryUser.Insert(this, factory);
        }

        public IUserModel Update(IUserDomainFactory factory)
        {
            return _repositoryUser.Update(this, factory);
        }

        public IEnumerable<IUserModel> ListUsers(IUserDomainFactory factory)
        {
            return _repositoryUser.ListUsers(factory);
        }

        public IUserModel GetByEmail(string email, IUserDomainFactory factory)
        {
            return _repositoryUser.GetByEmail(email, factory);
        }
        public IUserModel GetBySlug(string slug, IUserDomainFactory factory)
        {
            return _repositoryUser.GetBySlug(slug, factory);
        }

        public IUserModel GetByRecoveryHash(string recoveryHash, IUserDomainFactory factory)
        {
            return _repositoryUser.GetUserByRecoveryHash(recoveryHash, factory);
        }

        public IEnumerable<IUserModel> ListAllUsers(IUserDomainFactory factory)
        {
            return _repositoryUser.ListUsers(factory);
        }

        public IUserModel LoginWithEmail(string email, string password, IUserDomainFactory factory)
        {
            var user = _repositoryUser.GetByEmail(email, factory);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            string encryptPwd = CreateMD5(user.Hash + "|" + password);
            return _repositoryUser.LoginWithEmail(email, encryptPwd, factory);
        }

        public bool HasPassword(long userId, IUserDomainFactory factory)
        {
            return _repositoryUser.HasPassword(userId, factory);
        }

        public void ChangePassword(long userId, string password, IUserDomainFactory factory)
        {
            var user = _repositoryUser.GetById(userId, factory);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            string encryptPwd = CreateMD5(user.Hash + "|" + password);
            _repositoryUser.ChangePassword(userId, encryptPwd);
        }

        public void ChangePasswordUsingHash(string recoveryHash, string password, IUserDomainFactory factory)
        {
            var user = _repositoryUser.GetUserByRecoveryHash(recoveryHash, factory);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            string encryptPwd = CreateMD5(user.Hash + "|" + password);
            _repositoryUser.ChangePassword(user.UserId, encryptPwd);
        }

        public string GenerateRecoveryHash(long userId, IUserDomainFactory factory)
        {
            var user = _repositoryUser.GetById(userId, factory);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            string recoveryHash = CreateMD5(user.Hash + "|" + Guid.NewGuid().ToString());
            _repositoryUser.UpdateRecoveryHash(userId, recoveryHash);
            return recoveryHash;
        }

        public bool ExistSlug(long userId, string slug) { 
            return _repositoryUser.ExistSlug(userId, slug);
        }

        public IUserModel GetByStripeId(string stripeId, IUserDomainFactory factory)
        {
            return _repositoryUser.GetByStripeId(stripeId, factory);
        }
    }
}
