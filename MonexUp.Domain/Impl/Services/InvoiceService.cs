using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Order;
using NAuth.ACL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{

    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceDomainFactory _invoiceFactory;
        private readonly IInvoiceFeeDomainFactory _feeFactory;
        private readonly IUserClient _userClient;
        private readonly IUserProfileDomainFactory _profileFactory;
        private readonly IOrderDomainFactory _orderFactory;
        private readonly IOrderItemDomainFactory _orderItemFactory;
        private readonly IProductDomainFactory _productFactory;
        private readonly IOrderService _orderService;
        private readonly INetworkService _networkService;
        private readonly IStripeService _stripeService;

        private const double PLATAFORM_FEE = 0.02;

        public InvoiceService(
            IInvoiceDomainFactory invoiceFactory,
            IInvoiceFeeDomainFactory feeFactory,
            IUserClient userClient,
            IUserProfileDomainFactory profileFactory,
            IOrderDomainFactory orderFactory,
            IOrderItemDomainFactory orderItemFactory,
            IProductDomainFactory productFactory,
            IOrderService orderService,
            INetworkService networkService,
            IStripeService stripeService
        )
        {
            _invoiceFactory = invoiceFactory;
            _feeFactory = feeFactory;
            _userClient = userClient;
            _profileFactory = profileFactory;
            _orderFactory = orderFactory;
            _orderItemFactory = orderItemFactory;
            _productFactory = productFactory;
            _orderService = orderService;
            _networkService = networkService;
            _stripeService = stripeService;
        }

        private void ValidateIsNoHaveCommissionPaid(IInvoiceModel invoice)
        {
            if (invoice.ListFees(_feeFactory).Where(x => x.PaidAt.HasValue).Any())
            {
                throw new Exception("Invoice already has a commission paid");
            }
        }

        public void ClearFees(IInvoiceModel invoice)
        {
            ValidateIsNoHaveCommissionPaid(invoice);

            _feeFactory.BuildInvoiceFeeModel().DeleteByInvoice(invoice.InvoiceId);
        }

        public void CalculateFee(IInvoiceModel invoice)
        {
            ClearFees(invoice);

            var order = _orderService.GetById(invoice.OrderId);
            if (order == null)
            {
                throw new Exception("Order not found");
            }
            var network = _networkService.GetById(order.NetworkId);
            if (network == null)
            {
                throw new Exception("Network not found");
            }
            if (network.Plan == DTO.Network.NetworkPlanEnum.Free)
            {
                var feeValue = invoice.Price * PLATAFORM_FEE;
                var plataformFee = _feeFactory.BuildInvoiceFeeModel();
                plataformFee.InvoiceId = invoice.InvoiceId;
                plataformFee.Amount = Math.Round(feeValue, 2);
                plataformFee.Insert(_feeFactory);
            }
            if (network.Commission > 0)
            {
                var feeValue = invoice.Price * (network.Commission / 100.0);
                var networkFee = _feeFactory.BuildInvoiceFeeModel();
                networkFee.InvoiceId = invoice.InvoiceId;
                networkFee.NetworkId = network.NetworkId;
                networkFee.Amount = Math.Round(feeValue, 2);
                networkFee.Insert(_feeFactory);
            }
            if (order.SellerId.HasValue && order.SellerId > 0)
            {
                var userNetwork = _networkService.GetUserNetwork(network.NetworkId, order.SellerId.Value);
                var profile = userNetwork.GetProfile(_profileFactory);
                if (profile != null && profile.Commission > 0) {
                    var feeValue = invoice.Price * (profile.Commission / 100.0);
                    var sellerFee = _feeFactory.BuildInvoiceFeeModel();
                    sellerFee.InvoiceId = invoice.InvoiceId;
                    sellerFee.UserId = order.SellerId.Value;
                    sellerFee.Amount = Math.Round(feeValue, 2);
                    sellerFee.Insert(_feeFactory);
                }
            }
        }

        public IInvoiceModel Insert(IInvoiceModel invoice)
        {
            var newInvoice = invoice.Insert(_invoiceFactory);
            CalculateFee(newInvoice);
            return newInvoice;
        }

        public IInvoiceModel Pay(IInvoiceModel invoice)
        {
            ValidateIsNoHaveCommissionPaid(invoice);

            invoice.Status = InvoiceStatusEnum.Paid;
            var newInvoice = invoice.Update(_invoiceFactory);
            CalculateFee(newInvoice);
            return newInvoice;
        }

        public IInvoiceModel ProcessInvoice(IInvoiceModel invoiceStripe)
        {
            var invoice = _invoiceFactory.BuildInvoiceModel().GetByStripeId(invoiceStripe.StripeId, _invoiceFactory);
            if (invoice != null)
            {
                if (invoice.Status != invoiceStripe.Status)
                {
                    if (invoiceStripe.Status == InvoiceStatusEnum.Paid)
                    {
                        invoice.PaymentDate = invoiceStripe.PaymentDate;
                        return Pay(invoice);
                    }
                    invoice.Status = invoiceStripe.Status;
                    var newInvoice = invoice.Update(_invoiceFactory);
                    CalculateFee(newInvoice);
                    return newInvoice;
                }
                return invoice;
            }
            return Insert(invoiceStripe);
        }

        public async Task<IInvoiceModel> Checkout(string checkoutSessionId)
        {
            var invoice = await _stripeService.Checkout(checkoutSessionId);
            if (invoice == null)
            {
                throw new Exception("Invoice is empty");
            }
            return ProcessInvoice(invoice);
        }

        public async Task Syncronize()
        {
            var invoicesStripe = await _stripeService.ListInvoices();
            foreach (var invoiceStripe in invoicesStripe)
            {
                ProcessInvoice(invoiceStripe);
            }
        }

        public async Task<InvoiceInfo> GetInvoiceInfo(IInvoiceModel invoice)
        {
            if (invoice == null)
            {
                return null;
            }
            return new InvoiceInfo
            {
                InvoiceId = invoice.InvoiceId,
                OrderId = invoice.OrderId,
                UserId = invoice.UserId,
                SellerId = invoice.SellerId,
                Price = invoice.Price,
                DueDate = invoice.DueDate,
                PaymentDate = invoice.PaymentDate,
                Status = invoice.Status,
                Order = await _orderService.GetOrderInfo(invoice.GetOrder(_orderFactory)),
                User = await _userClient.GetByIdAsync(invoice.UserId, ""),
                Seller = invoice.SellerId.HasValue ?
                    await _userClient.GetByIdAsync(invoice.SellerId.Value, "") : null,
                Fees = invoice.ListFees(_feeFactory).Select(x => new InvoiceFeeInfo
                {
                    FeeId = x.FeeId,
                    InvoiceId = x.InvoiceId,
                    NetworkId = x.NetworkId,
                    UserId = x.UserId,
                    Amount = x.Amount,
                    PaidAt = x.PaidAt
                }).ToList()
            };
        }

        public async Task<InvoiceListPagedResult> Search(long networkId, long? userId, long? sellerId, int pageNum)
        {
            var model = _invoiceFactory.BuildInvoiceModel();
            int pageCount = 0;
            var invoiceModels = model.Search(networkId, userId, sellerId, pageNum, out pageCount, _invoiceFactory).ToList();
            var invoices = new List<InvoiceInfo>();
            foreach (var x in invoiceModels)
            {
                invoices.Add(await GetInvoiceInfo(x));
            }
            return new InvoiceListPagedResult
            {
                Sucesso = true,
                Invoices = invoices,
                PageNum = pageNum,
                PageCount = pageCount
            };
        }

        private async Task<StatementInfo> GetStatementInfo(IInvoiceFeeModel fee)
        {
            var invoice = _invoiceFactory.BuildInvoiceModel().GetById(fee.InvoiceId, _invoiceFactory);
            var order = invoice.GetOrder(_orderFactory);
            var network = _networkService.GetById(order.NetworkId);
            var buyer = await _userClient.GetByIdAsync(invoice.UserId, "");
            var seller = invoice.SellerId.HasValue ? await _userClient.GetByIdAsync(invoice.SellerId.Value, "") : null;
            return new StatementInfo {
                InvoiceId = fee.InvoiceId,
                FeeId = fee.FeeId,
                NetworkId = order.NetworkId,
                NetworkName = network.Name,
                UserId = invoice.UserId,
                BuyerName = buyer?.Name,
                SellerId = invoice.SellerId,
                SellerName = seller?.Name,
                PaymentDate = invoice.PaymentDate,
                Description = string.Join(", ",
                    order.ListItems(_orderItemFactory)
                    .Select(x => x.GetProduct(_productFactory).Name + " (" + x.Quantity.ToString() + ")")
                    .ToArray()
                ),
                Amount = fee.Amount,
                PaidAt = fee.PaidAt,
            };
        }

        public async Task<StatementListPagedResult> SearchStatement(StatementSearchParam param)
        {
            int pageCount = 0;
            var fees = _feeFactory.BuildInvoiceFeeModel().Search(param.NetworkId, param.UserId, param.Ini, param.End, param.PageNum, out pageCount, _feeFactory);
            var statements = new List<StatementInfo>();
            foreach (var fee in fees)
            {
                statements.Add(await GetStatementInfo(fee));
            }
            return new StatementListPagedResult
            {
                PageNum = param.PageNum,
                PageCount = pageCount,
                Statements = statements
            };
        }

        public double GetBalance(long? networkId, long? userId)
        {
            return _feeFactory.BuildInvoiceFeeModel().GetBalance(networkId, userId);
        }

        public double GetAvailableBalance(long userId)
        {
            return _feeFactory.BuildInvoiceFeeModel().GetAvailableBalance(userId);
        }
    }
}
