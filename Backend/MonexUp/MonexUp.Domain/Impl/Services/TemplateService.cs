using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Template;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly ITemplateDomainFactory _templateFactory;
        private readonly ITemplatePageDomainFactory _pageFactory;
        private readonly ITemplatePartDomainFactory _partFactory;
        private readonly ITemplateVarDomainFactory _varFactory;
        private readonly INetworkService _networkService;

        public TemplateService(
            ITemplateDomainFactory templateFactory,
            ITemplatePageDomainFactory pageFactory,
            ITemplatePartDomainFactory partFactory,
            ITemplateVarDomainFactory varFactory,
            INetworkService networkService
        )
        {
            _templateFactory = templateFactory;
            _pageFactory = pageFactory;
            _partFactory = partFactory;
            _varFactory = varFactory;
            _networkService = networkService;
        }

        private TemplatePartInfo GetTemplatePartInfo(ITemplatePartModel part)
        {
            if (part == null)
            {
                return null;
            }
            return new TemplatePartInfo
            {
                PartId = part.PartId,
                PageId = part.PageId,
                PartKey = part.PartKey,
                Order = part.Order
            };
        }

        private IDictionary<string, string> GetVariables(IList<ITemplateVarModel> vars)
        {
            var returnVal = new Dictionary<string, string>();
            foreach (var variable in vars)
            {
                returnVal.Add(variable.Key, variable.Value);
            }
            return returnVal;
        }

        public TemplatePageInfo GetTemplatePageInfo(ITemplatePageModel page, LanguageEnum lang)
        {
            if (page == null)
            {
                return null;
            }
            return new TemplatePageInfo
            {
                PageId = page.PageId,
                TemplateId = page.TemplateId,
                Slug = page.Slug,
                Title = page.Title,
                Parts = page.ListParts(_partFactory).Select(x => GetTemplatePartInfo(x)).ToList(),
                Variables = GetVariables(page.ListVariables(lang, _varFactory))
            };
        }

        public ITemplatePageModel GetOrCreateNetworkPage(string networkSlug, string pageSlug)
        {
            var network = _networkService.GetBySlug( networkSlug );
            if (network == null)
            {
                throw new ArgumentNullException("Network not found");
            }
            var template = _templateFactory.BuildTemplateModel().GetByNetwork(network.NetworkId, _templateFactory);
            if (template == null)
            {
                template = CreateDefaultNetworkTemplate(network.NetworkId);
            }
            var page = _pageFactory.BuildTemplatePageModel().GetBySlug(template.TemplateId, pageSlug, _pageFactory);
            if (page == null)
            {
                throw new ArgumentNullException("Page not found");
            }
            return page;
        }

        public ITemplateModel CreateDefaultNetworkTemplate(long networkId)
        {
            var template = _templateFactory.BuildTemplateModel();
            template.NetworkId = networkId;
            template = template.Insert(_templateFactory);

            var networkPage = _pageFactory.BuildTemplatePageModel();
            networkPage.TemplateId = template.TemplateId;
            networkPage.Slug = "network-home";
            networkPage.Title = "Network Main Page";
            networkPage = networkPage.Insert(_pageFactory);

            var team3cols = _partFactory.BuildTemplatePartModel();
            team3cols.PageId = networkPage.PageId;
            team3cols.PartKey = "TEAM_3_COLS";
            team3cols = team3cols.Insert(_partFactory);

            var plan3cols = _partFactory.BuildTemplatePartModel();
            plan3cols.PageId = networkPage.PageId;
            plan3cols.PartKey = "PLAN_3_COLS";
            plan3cols = plan3cols.Insert(_partFactory);

            var hero01 = _partFactory.BuildTemplatePartModel();
            hero01.PageId = networkPage.PageId;
            hero01.PartKey = "HERO01";
            hero01 = hero01.Insert(_partFactory);

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "HERO_TITLE",
                English = "Welcome to My Network",
                French = "Bienvenue sur mon réseau",
                Spanish = "Bienvenido a mi red",
                Portuguese = "Bem vindo a minha Rede"
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "HERO_SLOGAN",
                English = "Grow your income, build your future.",
                French = "Augmentez vos revenus, construisez votre avenir.",
                Spanish = "Haz crecer tus ingresos, construye tu futuro.",
                Portuguese = "Aumente sua renda, construa seu futuro."
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "HERO_LINK_TO_PLANS",
                English = "Explore our plans",
                French = "Découvrez nos plans",
                Spanish = "Conoce nuestros planes",
                Portuguese = "Conheça nossos planos"
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "HERO_BECOME_A_SELLER",
                English = "Become a representative",
                French = "Devenez représentant",
                Spanish = "Conviértete en representante",
                Portuguese = "Seja um representante"
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "HERO_RESUME",
                English = "Join a powerful network of entrepreneurs transforming lives through innovation, collaboration, and opportunity.",
                French = "Rejoignez un réseau puissant d'entrepreneurs qui transforment des vies grâce à l'innovation, la collaboration et les opportunités.",
                Spanish = "Únete a una red poderosa de emprendedores que transforman vidas mediante la innovación, la colaboración y la oportunidad.",
                Portuguese = "Junte-se a uma rede poderosa de empreendedores que transformam vidas com inovação, colaboração e oportunidade."
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "PLAN_TITLE",
                English = "Plans",
                French = "Plans",
                Spanish = "Planes",
                Portuguese = "Planos"
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "PLAN_DESCRIPTION",
                English = "Choose the plan that best fits your goals and start your journey to financial growth and personal success today.",
                French = "Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd'hui votre parcours vers la croissance financière et le succès personnel.",
                Spanish = "Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.",
                Portuguese = "Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal."
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "TEAM_TITLE",
                English = "Team",
                French = "Équipe",
                Spanish = "Equipo",
                Portuguese = "Equipe"
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkPage.PageId,
                Key = "TEAM_DESCRIPTION",
                English = "Be part of a united team that shares knowledge, supports your growth, and celebrates every achievement with you. Together, we go further.",
                French = "Faites partie d'une équipe unie qui partage ses connaissances, soutient votre développement et célèbre chaque réussite à vos côtés. Ensemble, nous allons plus loin.",
                Spanish = "Sé parte de un equipo unido que comparte conocimientos, apoya tu crecimiento y celebra contigo cada logro. Juntos llegamos más lejos.",
                Portuguese = "Faça parte de uma equipe unida que compartilha conhecimento, apoia seu crescimento e comemora cada conquista com você. Juntos, vamos mais longe."
            });

            var networkSellerPage = _pageFactory.BuildTemplatePageModel();
            networkSellerPage.TemplateId = template.TemplateId;
            networkSellerPage.Slug = "network-seller";
            networkSellerPage.Title = "Network Seller Page";
            networkSellerPage = networkSellerPage.Insert(_pageFactory);

            var plan3colsSeller = _partFactory.BuildTemplatePartModel();
            plan3colsSeller.PageId = networkSellerPage.PageId;
            plan3colsSeller.PartKey = "PLAN_3_COLS";
            plan3colsSeller = plan3colsSeller.Insert(_partFactory);

            var profile01 = _partFactory.BuildTemplatePartModel();
            profile01.PageId = networkSellerPage.PageId;
            profile01.PartKey = "PROFILE01";
            profile01 = profile01.Insert(_partFactory);

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkSellerPage.PageId,
                Key = "PROFILE_SLOGAN",
                English = "Purpose-driven, results-focused.",
                French = "Guidé par l’objectif, axé sur les résultats.",
                Spanish = "Con propósito y enfocado en resultados.",
                Portuguese = "Com propósito e foco em resultados."
            });


            SaveVariable(new TemplateVarInfo
            {
                PageId = networkSellerPage.PageId,
                Key = "PROFILE_DESCRIPTION",
                English = "Work freely, earn by merit, and grow with a supportive community.",
                French = "Travaillez librement, gagnez par mérite et évoluez avec une communauté solidaire.",
                Spanish = "Trabaja con libertad, gana por mérito y crece con una comunidad que te apoya.",
                Portuguese = "Trabalhe com liberdade, ganhe por mérito e cresça com uma comunidade que apoia você."
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkSellerPage.PageId,
                Key = "PLAN_TITLE",
                English = "Plans",
                French = "Plans",
                Spanish = "Planes",
                Portuguese = "Planos"
            });

            SaveVariable(new TemplateVarInfo
            {
                PageId = networkSellerPage.PageId,
                Key = "PLAN_DESCRIPTION",
                English = "Choose the plan that best fits your goals and start your journey to financial growth and personal success today.",
                French = "Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd'hui votre parcours vers la croissance financière et le succès personnel.",
                Spanish = "Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.",
                Portuguese = "Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal."
            });

            var networkProductPage = _pageFactory.BuildTemplatePageModel();
            networkProductPage.TemplateId = template.TemplateId;
            networkProductPage.Slug = "network-product";
            networkProductPage.Title = "Network Product Page";
            networkProductPage = networkProductPage.Insert(_pageFactory);

            var product01 = _partFactory.BuildTemplatePartModel();
            product01.PageId = networkProductPage.PageId;
            product01.PartKey = "PRODUCT01";
            product01 = product01.Insert(_partFactory);

            return template;
        }

        public ITemplateModel CreateDefaultUserTemplate(long userId)
        {
            var template = _templateFactory.BuildTemplateModel();
            template.UserId = userId;
            template = template.Insert(_templateFactory);

            var userPage = _pageFactory.BuildTemplatePageModel();
            userPage.TemplateId = template.TemplateId;
            userPage.Slug = "user-home";
            userPage.Title = "Seller Main Page";
            userPage = userPage.Insert(_pageFactory);

            return template;
        }
        public ITemplateModel UpdateTemplate(ITemplateModel template)
        {
            if (template == null)
            {
                throw new ArgumentNullException();
            }
            if (!(template.UserId.HasValue || template.NetworkId.HasValue))
            {
                throw new ArgumentNullException("User Id and Network Id is empty");
            }
            return template.Update(_templateFactory);
        }

        public ITemplatePageModel GetPageBySlug(long templateId, string slug)
        {
            return _pageFactory.BuildTemplatePageModel().GetBySlug(templateId, slug, _pageFactory);
        }
        public ITemplatePageModel GetPageById(long pageId)
        {
            return _pageFactory.BuildTemplatePageModel().GetById(pageId, _pageFactory);
        }

        public ITemplatePageModel UpdatePage(ITemplatePageModel page)
        {
            if (page == null)
            {
                throw new ArgumentNullException();
            }
            if (!(page.PageId > 0))
            {
                throw new Exception("Page not exists");
            } 
            if (!(page.TemplateId > 0))
            {
                throw new Exception("Page not linked to a template");
            }
            if (string.IsNullOrEmpty(page.Slug))
            {
                throw new Exception("Slug is empty");
            }
            return page.Update(_pageFactory);
        }

        public ITemplatePartModel InsertPart(TemplatePartInfo part)
        {
            if (part == null)
            {
                throw new ArgumentNullException();
            }
            if (!(part.PageId > 0))
            {
                throw new Exception("Part not linked to a page");
            }
            if (string.IsNullOrEmpty(part.PartKey))
            {
                throw new Exception("Key is empty");
            }
            var md = _partFactory.BuildTemplatePartModel();
            md.PageId = part.PageId;
            md.PartKey = part.PartKey;
            return md.Insert(_partFactory);
        }
        public ITemplatePartModel UpdatePart(TemplatePartInfo part)
        {
            if (part == null)
            {
                throw new ArgumentNullException();
            }
            if (!(part.PartId > 0))
            {
                throw new Exception("Part not exists");
            }
            if (!(part.PageId > 0))
            {
                throw new Exception("Part not linked to a page");
            }
            if (string.IsNullOrEmpty(part.PartKey))
            {
                throw new Exception("Key is empty");
            }
            var md = _partFactory.BuildTemplatePartModel();
            md.PartId = part.PartId;
            md.PageId = part.PageId;
            md.PartKey = part.PartKey;
            return md.Update(_partFactory);
        }

        public void DeletePart(long partId)
        {
            _partFactory.BuildTemplatePartModel().Delete(partId);
        }
        public void MovePartUp(long partId)
        {
            _partFactory.BuildTemplatePartModel().MoveUp(partId);
        }
        public void MovePartDown(long partId)
        {
            _partFactory.BuildTemplatePartModel().MoveDown(partId);
        }

        public TemplateVarInfo GetVariable(long pageId, string key)
        {
            var variables = _varFactory.BuildTemplateVarModel().ListByKey(pageId, key, _varFactory);
            return new TemplateVarInfo { 
                PageId = pageId,
                Key = key,
                English = variables.Where(x => x.Language == LanguageEnum.English).Select(x => x.Value).FirstOrDefault(),
                Spanish = variables.Where(x => x.Language == LanguageEnum.Spanish).Select(x => x.Value).FirstOrDefault(),
                French = variables.Where(x => x.Language == LanguageEnum.French).Select(x => x.Value).FirstOrDefault(),
                Portuguese = variables.Where(x => x.Language == LanguageEnum.Portuguese).Select(x => x.Value).FirstOrDefault()
            };
        }

        public void SaveVariable(TemplateVarInfo variable)
        {
            ITemplateVarModel md = null;
            //English
            md = _varFactory.BuildTemplateVarModel();
            md.PageId = variable.PageId;
            md.Key = variable.Key;
            md.Value = variable.English;
            md.Language = LanguageEnum.English;
            md.Save(_varFactory);
            //Spanish
            md = _varFactory.BuildTemplateVarModel();
            md.PageId = variable.PageId;
            md.Key = variable.Key;
            md.Value = variable.Spanish;
            md.Language = LanguageEnum.Spanish;
            md.Save(_varFactory);
            //French
            md = _varFactory.BuildTemplateVarModel();
            md.PageId = variable.PageId;
            md.Key = variable.Key;
            md.Value = variable.French;
            md.Language = LanguageEnum.French;
            md.Save(_varFactory);
            //Portuguese
            md = _varFactory.BuildTemplateVarModel();
            md.PageId = variable.PageId;
            md.Key = variable.Key;
            md.Value = variable.Portuguese;
            md.Language = LanguageEnum.Portuguese;
            md.Save(_varFactory);
        }
    }
}
