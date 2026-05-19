using Core.Domain;
using Core.Domain.Cloud;
using Core.Domain.Repository;
using DB.Infra;
using DB.Infra.Context;
using DB.Infra.Repository;
using MonexUp.Domain.Impl.Core;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Core;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using NAuth.ACL;
using NAuth.ACL.Interfaces;
using NAuth.DTO.Settings;
using zTools.ACL;
using zTools.ACL.Interfaces;
using zTools.DTO.Settings;
using MonexUp.Infra.Interfaces.AppServices;
using MonexUp.Application.Validators;
using FluentValidation;
using MonexUp.DTO.ProductLink;
using MonexUp.DTO.Billing;

namespace MonexUp.Application
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
        public static void Configure(IServiceCollection services, ConfigurationParam config, IConfiguration configuration, bool scoped = true)
        {
            if (scoped)
                services.AddDbContext<MonexUpContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));
            else
                services.AddDbContextFactory<MonexUpContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));

            #region Infra
            injectDependency(typeof(MonexUpContext), typeof(MonexUpContext), services, scoped);
            injectDependency(typeof(IUnitOfWork), typeof(UnitOfWork), services, scoped);
            injectDependency(typeof(ILogCore), typeof(LogCore), services, scoped);
            #endregion

            #region Repository
            injectDependency(typeof(IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>), typeof(InvoiceFeeRepository), services, scoped);
            injectDependency(typeof(INetworkRepository<INetworkModel, INetworkDomainFactory>), typeof(NetworkRepository), services, scoped);
            injectDependency(typeof(IOrderRepository<IOrderModel, IOrderDomainFactory>), typeof(OrderRepository), services, scoped);
            injectDependency(typeof(IOrderItemRepository<IOrderItemModel, IOrderItemDomainFactory>), typeof(OrderItemRepository), services, scoped);
            injectDependency(typeof(IProductLinkRepository<IProductLinkModel, IProductLinkDomainFactory>), typeof(ProductLinkRepository), services, scoped);
            injectDependency(typeof(IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory>), typeof(UserNetworkRepository), services, scoped);
            injectDependency(typeof(IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory>), typeof(UserProfileRepository), services, scoped);
            #endregion

            #region Lofn
            injectDependency(typeof(ILofnStoreClient), typeof(DB.Infra.AppServices.LofnStoreClient), services, scoped);
            injectDependency(typeof(ILofnProductClient), typeof(DB.Infra.AppServices.LofnProductClient), services, scoped);
            #endregion

            #region NAuth
            services.Configure<NAuthSetting>(configuration.GetSection("NAuth"));
            services.AddNAuth();
            #endregion

            #region zTools
            services.Configure<zToolsetting>(options =>
            {
                options.ApiUrl = configuration["zTools:ApiURL"];
            });
            injectDependency(typeof(IFileClient), typeof(FileClient), services, scoped);
            injectDependency(typeof(IMailClient), typeof(MailClient), services, scoped);
            #endregion

            #region ProxyPay
            services.Configure<MonexUp.Infra.Interfaces.AppServices.ProxyPaySetting>(configuration.GetSection("ProxyPay"));
            injectDependency(typeof(IProxyPayAppService), typeof(MonexUp.Infra.AppServices.ProxyPayAppService), services, scoped);
            injectDependency(typeof(IProxyPayClient), typeof(DB.Infra.AppServices.ProxyPayClient), services, scoped);
            #endregion

            #region Service
            injectDependency(typeof(INetworkService), typeof(NetworkService), services, scoped);
            injectDependency(typeof(IProfileService), typeof(ProfileService), services, scoped);
            injectDependency(typeof(IProductLinkService), typeof(ProductLinkService), services, scoped);
            injectDependency(typeof(ILofnStoreProvisioningService), typeof(LofnStoreProvisioningService), services, scoped);
            injectDependency(typeof(IOrderService), typeof(OrderService), services, scoped);
            injectDependency(typeof(ISubscriptionService), typeof(SubscriptionService), services, scoped);
            injectDependency(typeof(IProxyPayService), typeof(ProxyPayService), services, scoped);
            injectDependency(typeof(IBillingService), typeof(BillingService), services, scoped);
            injectDependency(typeof(IBillingFeeService), typeof(DB.Infra.Services.BillingFeeService), services, scoped);
            injectDependency(typeof(IBillingReconciliationService), typeof(DB.Infra.Services.BillingReconciliationService), services, scoped);
            #endregion

            #region Factory
            injectDependency(typeof(IInvoiceFeeDomainFactory), typeof(InvoiceFeeDomainFactory), services, scoped);
            injectDependency(typeof(INetworkDomainFactory), typeof(NetworkDomainFactory), services, scoped);
            injectDependency(typeof(IOrderDomainFactory), typeof(OrderDomainFactory), services, scoped);
            injectDependency(typeof(IOrderItemDomainFactory), typeof(OrderItemDomainFactory), services, scoped);
            injectDependency(typeof(IProductLinkDomainFactory), typeof(ProductLinkDomainFactory), services, scoped);
            injectDependency(typeof(IUserNetworkDomainFactory), typeof(UserNetworkDomainFactory), services, scoped);
            injectDependency(typeof(IUserProfileDomainFactory), typeof(UserProfileDomainFactory), services, scoped);
            #endregion

            #region Validators
            services.AddScoped<IValidator<ProductLinkInsertInfo>, ProductLinkInsertInfoValidator>();
            services.AddScoped<IValidator<EnsureStoreRequest>, EnsureStoreRequestValidator>();
            #endregion


            services.AddAuthentication("NAuth")
                .AddScheme<AuthenticationSchemeOptions, NAuthHandler>("NAuth", options => { });

        }
    }
}
