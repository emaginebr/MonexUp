using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.Infra.Interfaces.AppServices;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class LofnStoreProvisioningService : ILofnStoreProvisioningService
    {
        private readonly INetworkDomainFactory _networkFactory;
        private readonly ILofnStoreClient _lofnStoreClient;

        public LofnStoreProvisioningService(
            INetworkDomainFactory networkFactory,
            ILofnStoreClient lofnStoreClient)
        {
            _networkFactory = networkFactory;
            _lofnStoreClient = lofnStoreClient;
        }

        public async Task<long> EnsureStoreAsync(long networkId, string bearerToken, CancellationToken ct = default)
        {
            if (networkId <= 0) throw new ArgumentException("networkId is required.", nameof(networkId));
            if (string.IsNullOrWhiteSpace(bearerToken))
                throw new ArgumentException("bearerToken is required.", nameof(bearerToken));

            var networkModel = _networkFactory.BuildNetworkModel();

            var network = networkModel.GetById(networkId, _networkFactory);
            if (network == null)
            {
                throw new InvalidOperationException($"Network {networkId} not found.");
            }

            if (network.LofnStoreId.HasValue && network.LofnStoreId.Value > 0)
            {
                return network.LofnStoreId.Value;
            }

            var storeId = await _lofnStoreClient.InsertAsync(network.Name, bearerToken, ct);

            var won = networkModel.TrySetLofnStoreId(networkId, storeId);
            if (won)
            {
                return storeId;
            }

            var refreshed = networkModel.GetById(networkId, _networkFactory);
            if (refreshed?.LofnStoreId.HasValue == true && refreshed.LofnStoreId.Value > 0)
            {
                return refreshed.LofnStoreId.Value;
            }

            return storeId;
        }
    }
}
