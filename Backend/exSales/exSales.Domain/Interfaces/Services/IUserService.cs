using System;
using System.Collections.Generic;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.User;
using Microsoft.AspNetCore.Http;
using exSales.Domain.Impl.Models;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IUserService
    {
        IUserModel LoginWithEmail(string email, string password);
        bool HasPassword(long userId);
        void ChangePasswordUsingHash(string recoveryHash, string newPassword);
        void ChangePassword(long userId, string oldPassword, string newPassword);
        Task<bool> SendRecoveryEmail(string email);

        IUserModel Insert(UserInfo user);
        IUserModel Update(UserInfo user);
        IUserModel GetUserByEmail(string email);
        IUserModel GetBySlug(string slug);
        IUserModel GetUserByID(long userId);
        IUserModel GetUserByToken(string token);
        IUserModel GetByStripeId(string stripeId);
        //IUserModel GetUserHash(ChainEnum chain, string address);
        UserInfo GetUserInSession(HttpContext httpContext);
        UserInfo GetUserInfoFromModel(IUserModel md);
        UserListPagedResult Search(long networkId, string keyword, long? profileId, int pageNum);
    }
}
