using Core.Domain;
using Core.Domain.Cloud;
using Core.Domain.Repository;
using DB.Infra;
using DB.Infra.Context;
using DB.Infra.Repository;
using exSales.Domain.Impl.Core;
using exSales.Domain.Impl.Factory;
using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Core;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using exSales.Domain;

namespace exSales.Application
{
    public static class Initializer
    {

        private static void injectDependency(Type serviceType, Type implementationType, IServiceCollection services, bool scoped = true)
        {
            if(scoped)
                services.AddScoped(serviceType, implementationType);
            else
                services.AddTransient(serviceType, implementationType);
        }
        public static void Configure(IServiceCollection services, ConfigurationParam config, bool scoped = true)
        {
            if (scoped)
                services.AddDbContext<ExSalesContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));
            else
                services.AddDbContextFactory<ExSalesContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));

            //StxTxService.WALLET_API = config.WalletStxApi;
            //StxTxService.STACKS_API = config.StacksApi;

            #region Infra
            injectDependency(typeof(ExSalesContext), typeof(ExSalesContext), services, scoped);
            injectDependency(typeof(IUnitOfWork), typeof(UnitOfWork), services, scoped);
            injectDependency(typeof(ILogCore), typeof(LogCore), services, scoped);
            #endregion

            #region Repository
            injectDependency(typeof(IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory>), typeof(InvoiceRepository), services, scoped);
            injectDependency(typeof(INetworkRepository<INetworkModel, INetworkDomainFactory>), typeof(NetworkRepository), services, scoped);
            injectDependency(typeof(IOrderRepository<IOrderModel, IOrderDomainFactory>), typeof(OrderRepository), services, scoped);
            injectDependency(typeof(IProductRepository<IProductModel, IProductDomainFactory>), typeof(ProductRepository), services, scoped);
            injectDependency(typeof(IUserAddressRepository<IUserAddressModel, IUserAddressDomainFactory>), typeof(UserAddressRepository), services, scoped);
            injectDependency(typeof(IUserDocumentRepository<IUserDocumentModel, IUserDocumentDomainFactory>), typeof(UserDocumentRepository), services, scoped);
            injectDependency(typeof(IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory>), typeof(UserNetworkRepository), services, scoped);
            injectDependency(typeof(IUserPhoneRepository<IUserPhoneModel, IUserPhoneDomainFactory>), typeof(UserPhoneRepository), services, scoped);
            injectDependency(typeof(IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory>), typeof(UserProfileRepository), services, scoped);
            injectDependency(typeof(IUserRepository<IUserModel, IUserDomainFactory>), typeof(UserRepository), services, scoped);
            #endregion

            #region Service
            injectDependency(typeof(IUserService), typeof(UserService), services, scoped);
            injectDependency(typeof(INetworkService), typeof(NetworkService), services, scoped);
            injectDependency(typeof(IProfileService), typeof(ProfileService), services, scoped);
            injectDependency(typeof(IProductService), typeof(ProductService), services, scoped);
            injectDependency(typeof(IOrderService), typeof(OrderService), services, scoped);
            injectDependency(typeof(ISubscriptionService), typeof(SubscriptionService), services, scoped);
            injectDependency(typeof(IMailerSendService), typeof(MailerSendService), services, scoped);
            injectDependency(typeof(IStripeService), typeof(StripeService), services, scoped);
            #endregion

            #region Factory
            injectDependency(typeof(IInvoiceDomainFactory), typeof(InvoiceDomainFactory), services, scoped);
            injectDependency(typeof(INetworkDomainFactory), typeof(NetworkDomainFactory), services, scoped);
            injectDependency(typeof(IOrderDomainFactory), typeof(OrderDomainFactory), services, scoped);
            injectDependency(typeof(IProductDomainFactory), typeof(ProductDomainFactory), services, scoped);
            injectDependency(typeof(IUserAddressDomainFactory), typeof(UserAddressDomainFactory), services, scoped);
            injectDependency(typeof(IUserDocumentDomainFactory), typeof(UserDocumentDomainFactory), services, scoped);
            injectDependency(typeof(IUserNetworkDomainFactory), typeof(UserNetworkDomainFactory), services, scoped);
            injectDependency(typeof(IUserPhoneDomainFactory), typeof(UserPhoneDomainFactory), services, scoped);
            injectDependency(typeof(IUserProfileDomainFactory), typeof(UserProfileDomainFactory), services, scoped);
            injectDependency(typeof(IUserDomainFactory), typeof(UserDomainFactory), services, scoped);
            #endregion


            services.AddAuthentication("BasicAuthentication")
                .AddScheme<AuthenticationSchemeOptions, AuthHandler>("BasicAuthentication", null);

        }
    }
}
