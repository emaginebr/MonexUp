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
using System.Linq;
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

        public async Task<PixPaymentResult> CreatePixPayment(long productId, long userId, long? networkId, long? sellerId, string documentId, string cellphone, string token, decimal? amount = null, CancellationToken ct = default)
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

            // Step 1: complete the buyer's NAuth profile with whatever the
            // checkout body brought in. Body wins for non-empty values.
            var user = await _userClient.GetByIdAsync(userId, token);
            if (user == null)
            {
                return new PixPaymentResult { Sucesso = false, Mensagem = "User not found" };
            }

            var needsUpdate = false;

            if (!string.IsNullOrWhiteSpace(documentId) && documentId != user.IdDocument)
            {
                user.IdDocument = documentId;
                needsUpdate = true;
            }

            if (!string.IsNullOrWhiteSpace(cellphone))
            {
                var currentFirstPhone = user.Phones?.FirstOrDefault()?.Phone;
                if (cellphone != currentFirstPhone)
                {
                    var phones = user.Phones?.ToList() ?? new List<UserPhoneInfo>();
                    if (phones.Count == 0)
                    {
                        phones.Add(new UserPhoneInfo { Phone = cellphone });
                    }
                    else
                    {
                        phones[0] = new UserPhoneInfo { Phone = cellphone };
                    }
                    user.Phones = phones;
                    needsUpdate = true;
                }
            }

            if (needsUpdate)
            {
                await _userClient.UpdateAsync(user, token);
                user = await _userClient.GetByIdAsync(userId, token);
            }

            if (string.IsNullOrWhiteSpace(user.IdDocument))
            {
                return new PixPaymentResult { Sucesso = false, Mensagem = "CPF é obrigatório para criar o pagamento PIX." };
            }

            // Compute the effective unit amount for this purchase:
            //  - product with a fixed price wins; body `amount` is ignored.
            //  - product without price (open-amount donation) requires
            //    `amount` from the body; otherwise 400.
            decimal effectiveAmount;
            if (product.Price > 0)
            {
                effectiveAmount = (decimal)product.Price;
            }
            else
            {
                if (!amount.HasValue || amount.Value <= 0)
                {
                    return new PixPaymentResult
                    {
                        Sucesso = false,
                        Mensagem = "Valor é obrigatório para produtos sem preço definido."
                    };
                }
                effectiveAmount = amount.Value;
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
                            Quantity = 1,
                            Amount = effectiveAmount
                        }
                    }
                });
            }

            var qrCodeResponse = await _proxyPayService.CreateQRCode(user, product, network, seller, effectiveAmount);

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
