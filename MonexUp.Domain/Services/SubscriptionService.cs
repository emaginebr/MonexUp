using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Order;
using MonexUp.DTO.Payment;
using MonexUp.DTO.Subscription;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IOrderService _orderService;
        private readonly IProxyPayService _proxyPayService;
        private readonly IInvoiceService _invoiceService;
        private readonly IUserClient _userClient;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IProductDomainFactory _productFactory;
        private readonly IOrderItemDomainFactory _orderItemFactory;
        private readonly IInvoiceDomainFactory _invoiceFactory;

        public SubscriptionService(
            IOrderService orderService,
            IProxyPayService proxyPayService,
            IInvoiceService invoiceService,
            IUserClient userClient,
            INetworkDomainFactory networkFactory,
            IProductDomainFactory productFactory,
            IOrderItemDomainFactory orderItemFactory,
            IInvoiceDomainFactory invoiceFactory
        )
        {
            _orderService = orderService;
            _proxyPayService = proxyPayService;
            _invoiceService = invoiceService;
            _userClient = userClient;
            _networkFactory = networkFactory;
            _productFactory = productFactory;
            _orderItemFactory = orderItemFactory;
            _invoiceFactory = invoiceFactory;
        }

        public async Task<PixPaymentResult> CreatePixPayment(long productId, long userId, long? networkId, long? sellerId, string documentId, string token)
        {
            var product = _productFactory.BuildProductModel().GetById(productId, _productFactory);
            if (product == null)
            {
                return new PixPaymentResult { Sucesso = false, Mensagem = "Product not found" };
            }

            INetworkModel network = null;
            if (networkId.HasValue && networkId.Value > 0)
            {
                network = _networkFactory.BuildNetworkModel().GetById(networkId.Value, _networkFactory);
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
                    NetworkId = product.NetworkId,
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

            var invoice = _invoiceFactory.BuildInvoiceModel();
            invoice.OrderId = order.OrderId;
            invoice.UserId = userId;
            invoice.SellerId = sellerId;
            invoice.Price = product.Price;
            invoice.DueDate = DateTime.UtcNow;
            invoice.Status = InvoiceStatusEnum.Draft;
            var newInvoice = _invoiceService.Insert(invoice);

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
