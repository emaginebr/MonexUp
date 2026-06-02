using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using MonexUp.DTO.Payment;
using MonexUp.DTO.Subscription;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IOrderService _orderService;
        private readonly IProxyPayService _proxyPayService;
        private readonly IUserClient _userClient;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IOrderDomainFactory _orderFactory;
        private readonly ILofnProductClient _lofnProductClient;

        public SubscriptionService(
            IOrderService orderService,
            IProxyPayService proxyPayService,
            IUserClient userClient,
            INetworkDomainFactory networkFactory,
            IOrderDomainFactory orderFactory,
            ILofnProductClient lofnProductClient
        )
        {
            _orderService = orderService;
            _proxyPayService = proxyPayService;
            _userClient = userClient;
            _networkFactory = networkFactory;
            _orderFactory = orderFactory;
            _lofnProductClient = lofnProductClient;
        }

        public async Task<PixPaymentResult> CreatePixPayment(long productId, long userId, long? networkId, long? sellerId, string documentId, string token, CancellationToken ct = default)
        {
            var product = await _lofnProductClient.GetByIdAsync(productId);
            if (product == null)
            {
                return new PixPaymentResult { Sucesso = false, Mensagem = "Product not found" };
            }

            INetworkModel network = null;
            if (networkId.HasValue && networkId.Value > 0)
            {
                network = _networkFactory.BuildNetworkModel().GetById(networkId.Value, _networkFactory);
            }

            if (network == null)
            {
                return new PixPaymentResult { Sucesso = false, Mensagem = "Network not found" };
            }

            if (string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                network = await _proxyPayService.EnsureStoreAsync(network, token, ct);
            }

            UserInfo seller = null;
            if (sellerId.HasValue && sellerId.Value > 0)
            {
                seller = await _userClient.GetByIdAsync(sellerId.Value, token);
            }

            var order = _orderService.Get(productId, userId, sellerId, OrderStatusEnum.Incoming);
            if (order == null)
            {
                order = _orderService.Insert(new OrderInfo
                {
                    NetworkId = network.NetworkId,
                    UserId = userId,
                    SellerId = sellerId,
                    Status = OrderStatusEnum.Incoming,
                    Items = new List<OrderItemInfo>
                    {
                        new OrderItemInfo {
                            ProductId = productId,
                            Quantity = 1
                        }
                    }
                });
            }

            var user = await _userClient.GetByIdAsync(order.UserId, token);
            var qrCodeResponse = await _proxyPayService.CreateQRCode(user, product, network, seller, documentId);

            if (!qrCodeResponse.Sucesso)
            {
                return new PixPaymentResult
                {
                    Sucesso = false,
                    Mensagem = qrCodeResponse.Mensagem ?? "Failed to create QR Code"
                };
            }

            if (qrCodeResponse.InvoiceId > 0)
            {
                order.ProxyPayInvoiceId = qrCodeResponse.InvoiceId;
                order.Update(_orderFactory);
            }

            return new PixPaymentResult
            {
                Sucesso = true,
                Order = await _orderService.GetOrderInfo(order, token),
                QrCode = new PixQRCodeInfo
                {
                    InvoiceId = qrCodeResponse.InvoiceId,
                    BrCode = qrCodeResponse.BrCode,
                    BrCodeBase64 = qrCodeResponse.BrCodeBase64,
                    ExpiredAt = qrCodeResponse.ExpiredAt
                }
            };
        }

        public async Task<SubscriptionInfo> CreateSubscription(long productId, long userId, long? networkId, long? sellerId, string token)
        {
            throw new NotSupportedException("Stripe subscriptions are no longer supported. Use CreatePixPayment instead.");
        }
    }
}
