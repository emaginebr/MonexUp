using Template.Core;
using Template.Core.Repository;
using Template.Infra;
using Template.Infra.Context;
using Template.Infra.Repository;
using Template.Domain.Impl.Factory;
using Template.Domain.Impl.Models;
using Template.Domain.Impl.Services;
using Template.Domain.Interfaces.Factory;
using Template.Domain.Interfaces.Models;
using Template.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using NAuth.ACL;
using NAuth.ACL.Interfaces;
using NAuth.DTO.Settings;

namespace Template.Application
{
    public static class Initializer
    {
        private static void injectDependency(Type serviceType, Type implementationType, IServiceCollection services, bool scoped = true)
        {
            if (scoped)
                services.AddScoped(serviceType, implementationType);
            else
                services.AddTransient(serviceType, implementationType);
        }

        public static void Configure(IServiceCollection services, ConfigurationParam config, IConfiguration configuration, bool scoped = true)
        {
            if (scoped)
                services.AddDbContext<TemplateContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));
            else
                services.AddDbContextFactory<TemplateContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));

            #region Infra
            injectDependency(typeof(TemplateContext), typeof(TemplateContext), services, scoped);
            injectDependency(typeof(IUnitOfWork), typeof(UnitOfWork), services, scoped);
            #endregion

            #region Repository
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

            #region Service
            injectDependency(typeof(ITemplateService), typeof(TemplateService), services, scoped);
            #endregion

            #region Factory
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
