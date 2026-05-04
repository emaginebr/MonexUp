using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.ProductLink;
using MonexUp.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class ProductLinkService : IProductLinkService
    {
        private readonly IProductLinkDomainFactory _factory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly ILofnStoreProvisioningService _provisioning;

        public ProductLinkService(
            IProductLinkDomainFactory factory,
            IUserNetworkDomainFactory userNetworkFactory,
            ILofnStoreProvisioningService provisioning)
        {
            _factory = factory;
            _userNetworkFactory = userNetworkFactory;
            _provisioning = provisioning;
        }

        public async Task<UpsertResult> UpsertAsync(
            ProductLinkInsertInfo info,
            long callerUserId,
            string bearerToken,
            CancellationToken ct = default)
        {
            if (info == null || info.LofnProductId <= 0 || info.NetworkId <= 0 || info.UserId <= 0)
            {
                return new UpsertResult
                {
                    StatusCode = 400,
                    Created = false,
                    Body = new ProductLinkApiResult
                    {
                        Sucesso = false,
                        MensagemErro = "lofnProductId, networkId e userId são obrigatórios."
                    }
                };
            }

            if (!IsAuthorizedForLink(info, callerUserId))
            {
                return new UpsertResult
                {
                    StatusCode = 403,
                    Created = false,
                    Body = new ProductLinkApiResult
                    {
                        Sucesso = false,
                        MensagemErro = "Usuário não autorizado para esta rede."
                    }
                };
            }

            var existing = _factory.BuildProductLinkModel().GetByLofnProductId(info.LofnProductId, _factory);
            if (existing != null)
            {
                return new UpsertResult
                {
                    StatusCode = 200,
                    Created = false,
                    Body = new ProductLinkApiResult
                    {
                        Sucesso = true,
                        MensagemSucesso = "Link já registrado.",
                        Data = ToInfo(existing)
                    }
                };
            }

            try
            {
                await _provisioning.EnsureStoreAsync(info.NetworkId, bearerToken, ct);
            }
            catch (Exception ex)
            {
                return new UpsertResult
                {
                    StatusCode = 503,
                    Created = false,
                    Body = new ProductLinkApiResult
                    {
                        Sucesso = false,
                        MensagemErro = "Lofn indisponível, tente novamente. " + ex.Message
                    }
                };
            }

            var model = _factory.BuildProductLinkModel();
            model.LofnProductId = info.LofnProductId;
            model.NetworkId = info.NetworkId;
            model.UserId = info.UserId;
            var saved = model.Upsert(_factory);

            return new UpsertResult
            {
                StatusCode = 201,
                Created = true,
                Body = new ProductLinkApiResult
                {
                    Sucesso = true,
                    MensagemSucesso = "Link criado.",
                    Data = ToInfo(saved)
                }
            };
        }

        public ProductLinkListApiResult GetByNetwork(long networkId, long callerUserId)
        {
            if (!IsMember(callerUserId, networkId, requireManager: false))
            {
                return new ProductLinkListApiResult
                {
                    Sucesso = false,
                    MensagemErro = "Usuário não pertence à rede."
                };
            }

            var rows = _factory.BuildProductLinkModel().ListByNetwork(networkId, _factory);
            return new ProductLinkListApiResult
            {
                Sucesso = true,
                Data = rows.Select(ToInfo).ToList()
            };
        }

        public ProductLinkListApiResult GetByUser(long userId, long callerUserId)
        {
            if (callerUserId != userId && !IsAnyNetworkManager(callerUserId))
            {
                return new ProductLinkListApiResult
                {
                    Sucesso = false,
                    MensagemErro = "Acesso negado."
                };
            }

            var rows = _factory.BuildProductLinkModel().ListByUser(userId, _factory);
            return new ProductLinkListApiResult
            {
                Sucesso = true,
                Data = rows.Select(ToInfo).ToList()
            };
        }

        public ProductLinkApiResult DeleteByNetwork(long networkId, long callerUserId)
        {
            if (!IsMember(callerUserId, networkId, requireManager: true))
            {
                return new ProductLinkApiResult
                {
                    Sucesso = false,
                    MensagemErro = "Apenas o gestor da rede pode remover os links."
                };
            }

            var deleted = _factory.BuildProductLinkModel().DeleteByNetwork(networkId);
            return new ProductLinkApiResult
            {
                Sucesso = true,
                MensagemSucesso = $"{deleted} link(s) removido(s)."
            };
        }

        private bool IsAuthorizedForLink(ProductLinkInsertInfo info, long callerUserId)
        {
            if (info.UserId == callerUserId)
            {
                return IsMember(callerUserId, info.NetworkId, requireManager: false);
            }
            return IsMember(callerUserId, info.NetworkId, requireManager: true);
        }

        private bool IsMember(long userId, long networkId, bool requireManager)
        {
            var un = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);
            if (un == null) return false;
            if (requireManager) return un.Role == UserRoleEnum.NetworkManager || un.Role == UserRoleEnum.Administrator;
            return un.Role >= UserRoleEnum.User;
        }

        private bool IsAnyNetworkManager(long userId)
        {
            var nets = _userNetworkFactory.BuildUserNetworkModel().ListByUser(userId, _userNetworkFactory);
            return nets.Any(x => x.Role == UserRoleEnum.NetworkManager || x.Role == UserRoleEnum.Administrator);
        }

        private static ProductLinkInfo ToInfo(IProductLinkModel m) => new()
        {
            Id = m.Id,
            LofnProductId = m.LofnProductId,
            NetworkId = m.NetworkId,
            UserId = m.UserId,
            CreatedAt = m.CreatedAt
        };
    }
}
