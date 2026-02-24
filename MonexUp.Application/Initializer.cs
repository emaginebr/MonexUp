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
            injectDependency(typeof(IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory>), typeof(InvoiceRepository), services, scoped);
            injectDependency(typeof(IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>), typeof(InvoiceFeeRepository), services, scoped);
            injectDependency(typeof(INetworkRepository<INetworkModel, INetworkDomainFactory>), typeof(NetworkRepository), services, scoped);
            injectDependency(typeof(IOrderRepository<IOrderModel, IOrderDomainFactory>), typeof(OrderRepository), services, scoped);
            injectDependency(typeof(IOrderItemRepository<IOrderItemModel, IOrderItemDomainFactory>), typeof(OrderItemRepository), services, scoped);
            injectDependency(typeof(IProductRepository<IProductModel, IProductDomainFactory>), typeof(ProductRepository), services, scoped);
            injectDependency(typeof(IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory>), typeof(UserNetworkRepository), services, scoped);
            injectDependency(typeof(IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory>), typeof(UserProfileRepository), services, scoped);
            injectDependency(typeof(ITemplateRepository<ITemplateModel, ITemplateDomainFactory>), typeof(TemplateRepository), services, scoped);
            injectDependency(typeof(ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory>), typeof(TemplatePageRepository), services, scoped);
            injectDependency(typeof(ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory>), typeof(TemplatePartRepository), services, scoped);
            injectDependency(typeof(ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory>), typeof(TemplateVarRepository), services, scoped);
            #endregion

            #region NAuth
            services.Configure<NAuthSetting>(configuration.GetSection("NAuth"));
            services.AddHttpClient();
            injectDependency(typeof(IUserClient), typeof(UserClient), services, scoped);
            injectDependency(typeof(IRoleClient), typeof(RoleClient), services, scoped);
            #endregion

            #region zTools
            services.Configure<zToolsetting>(options =>
            {
                options.ApiUrl = configuration["ZTOOLS_API_URL"];
            });
            injectDependency(typeof(IFileClient), typeof(FileClient), services, scoped);
            injectDependency(typeof(IMailClient), typeof(MailClient), services, scoped);
            #endregion

            #region Service
            injectDependency(typeof(INetworkService), typeof(NetworkService), services, scoped);
            injectDependency(typeof(IProfileService), typeof(ProfileService), services, scoped);
            injectDependency(typeof(IProductService), typeof(ProductService), services, scoped);
            injectDependency(typeof(IOrderService), typeof(OrderService), services, scoped);
            injectDependency(typeof(ISubscriptionService), typeof(SubscriptionService), services, scoped);
            injectDependency(typeof(IStripeService), typeof(StripeService), services, scoped);
            injectDependency(typeof(IInvoiceService), typeof(InvoiceService), services, scoped);
            injectDependency(typeof(ITemplateService), typeof(TemplateService), services, scoped);
            #endregion

            #region Factory
            injectDependency(typeof(IInvoiceDomainFactory), typeof(InvoiceDomainFactory), services, scoped);
            injectDependency(typeof(IInvoiceFeeDomainFactory), typeof(InvoiceFeeDomainFactory), services, scoped);
            injectDependency(typeof(INetworkDomainFactory), typeof(NetworkDomainFactory), services, scoped);
            injectDependency(typeof(IOrderDomainFactory), typeof(OrderDomainFactory), services, scoped);
            injectDependency(typeof(IOrderItemDomainFactory), typeof(OrderItemDomainFactory), services, scoped);
            injectDependency(typeof(IProductDomainFactory), typeof(ProductDomainFactory), services, scoped);
            injectDependency(typeof(IUserNetworkDomainFactory), typeof(UserNetworkDomainFactory), services, scoped);
            injectDependency(typeof(IUserProfileDomainFactory), typeof(UserProfileDomainFactory), services, scoped);
            injectDependency(typeof(ITemplateDomainFactory), typeof(TemplateDomainFactory), services, scoped);
            injectDependency(typeof(ITemplatePageDomainFactory), typeof(TemplatePageDomainFactory), services, scoped);
            injectDependency(typeof(ITemplatePartDomainFactory), typeof(TemplatePartDomainFactory), services, scoped);
            injectDependency(typeof(ITemplateVarDomainFactory), typeof(TemplateVarDomainFactory), services, scoped);
            #endregion


            services.AddAuthentication("NAuth")
                .AddScheme<AuthenticationSchemeOptions, NAuthHandler>("NAuth", options => { });

        }
    }
}
