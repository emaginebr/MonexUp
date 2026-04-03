# Data Model: 003-unit-api-tests

**Date**: 2026-04-02

Este feature nao introduz novas entidades de dados. Os projetos de teste consomem as entidades existentes do MonexUp.

## Entidades Existentes Testadas

### Testes Unitarios (via Mock)

| Entidade | Interface | Factory | Servico |
|----------|-----------|---------|---------|
| Invoice | IInvoiceModel | IInvoiceDomainFactory | InvoiceService |
| InvoiceFee | IInvoiceFeeModel | IInvoiceFeeDomainFactory | InvoiceService |
| Order | IOrderModel | IOrderDomainFactory | OrderService |
| OrderItem | IOrderItemModel | IOrderItemDomainFactory | OrderService |
| Product | IProductModel | IProductDomainFactory | ProductService |
| Network | INetworkModel | INetworkDomainFactory | NetworkService |
| UserNetwork | IUserNetworkModel | IUserNetworkDomainFactory | NetworkService |
| UserProfile | IUserProfileModel | IUserProfileDomainFactory | ProfileService |

### Testes de API (via HTTP)

| Endpoint Group | Controlador | DTOs de Request | DTOs de Response |
|---------------|-------------|-----------------|------------------|
| /order | OrderController | PixPaymentRequest, OrderInfo, OrderSearchParam, OrderParam | PixPaymentResult, OrderInfo, OrderListPagedResult |
| /invoice | InvoiceController | InvoiceSearchParam, StatementSearchParam | InvoiceListPagedResult, StatementListPagedResult |
| /network | NetworkController | NetworkInsertInfo, NetworkInfo, NetworkRequestInfo, NetworkChangeStatusInfo | NetworkInfo, UserNetworkInfo |
| /profile | ProfileController | UserProfileInfo | UserProfileInfo |
| /image | ImageController | IFormFile (multipart) | string (URL) |

## Dependencias Externas Mockadas (Testes Unitarios)

| Interface | Pacote | Usado Por |
|-----------|--------|-----------|
| IUserClient | NAuth | Todos os servicos |
| IFileClient | zTools | NetworkService, ProductService |
| IProxyPayAppService | ProxyPay | ProxyPayService |
| IUnitOfWork | Core.Domain | Todas as factories |

## Configuracao dos Testes de API

| Campo | Tipo | Descricao |
|-------|------|-----------|
| ApiBaseUrl | string | URL base da API externa |
| Auth:Email | string | Email para login NAuth |
| Auth:Password | string | Senha para login NAuth |
| Auth:LoginEndpoint | string | Endpoint de autenticacao |
| Timeout | int | Timeout em segundos |
