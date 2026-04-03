# API Test Contracts: Endpoints a Testar

**Date**: 2026-04-02

## OrderController (`/order`)

| Metodo | Endpoint | Auth | Request Body | Response | Testes |
|--------|----------|------|-------------|----------|--------|
| POST | /order/createPixPayment/{productSlug}?networkSlug=X&sellerSlug=Y | Sim | PixPaymentRequest | PixPaymentResult | Sucesso, produto inexistente, sem auth |
| GET | /order/checkPixStatus/{proxyPayInvoiceId} | Sim | - | ProxyPayQRCodeStatusResponse | Sucesso, ID invalido |
| POST | /order/update | Sim | OrderInfo | OrderInfo | Sucesso, dados invalidos |
| POST | /order/search | Sim | OrderSearchParam | OrderListPagedResult | Com resultados, sem resultados, paginacao |
| POST | /order/list | Sim | OrderParam | IList<OrderInfo> | Lista com filtros |
| GET | /order/getById/{orderId} | Sim | - | OrderInfo | Sucesso, ID inexistente |

## InvoiceController (`/invoice`)

| Metodo | Endpoint | Auth | Request Body | Response | Testes |
|--------|----------|------|-------------|----------|--------|
| GET | /invoice/syncronize | Sim | - | void | Sucesso |
| POST | /invoice/search | Sim | InvoiceSearchParam | InvoiceListPagedResult | Com resultados, paginacao |
| POST | /invoice/searchStatement | Sim | StatementSearchParam | StatementListPagedResult | Com resultados, filtros |
| GET | /invoice/getBalance?networkId={id} | Sim | - | double | Sucesso |
| GET | /invoice/getAvailableBalance | Sim | - | double | Sucesso |

## NetworkController (`/network`)

| Metodo | Endpoint | Auth | Request Body | Response | Testes |
|--------|----------|------|-------------|----------|--------|
| POST | /network/insert | Sim | NetworkInsertInfo | NetworkInfo | Sucesso, nome duplicado, email invalido |
| POST | /network/update | Sim | NetworkInfo | NetworkInfo | Sucesso, dados invalidos |
| GET | /network/listAll | Nao | - | IList<NetworkInfo> | Lista publica |
| GET | /network/listByUser | Sim | - | IList<UserNetworkInfo> | Redes do utilizador |
| GET | /network/getById/{networkId} | Sim | - | NetworkInfo | Sucesso, ID inexistente |
| GET | /network/getBySlug/{networkSlug} | Nao | - | NetworkInfo | Sucesso, slug inexistente |
| GET | /network/getSellerBySlug/{networkSlug}/{sellerSlug} | Nao | - | UserNetworkInfo | Sucesso |
| POST | /network/requestAccess | Sim | NetworkRequestInfo | void | Sucesso |
| POST | /network/changeStatus | Sim | NetworkChangeStatusInfo | void | Sucesso, sem permissao |
| GET | /network/promote/{networkId}/{userId} | Sim | - | void | Sucesso |
| GET | /network/demote/{networkId}/{userId} | Sim | - | void | Sucesso |

## ProfileController (`/profile`)

| Metodo | Endpoint | Auth | Request Body | Response | Testes |
|--------|----------|------|-------------|----------|--------|
| POST | /profile/insert | Sim | UserProfileInfo | UserProfileInfo | Sucesso, nome vazio |
| POST | /profile/update | Sim | UserProfileInfo | UserProfileInfo | Sucesso |
| GET | /profile/delete/{profileId} | Sim | - | void | Sucesso, com utilizadores vinculados |
| GET | /profile/listByNetwork/{networkId} | Sim | - | IList<UserProfileInfo> | Com resultados |
| GET | /profile/getById/{profileId} | Sim | - | UserProfileInfo | Sucesso, ID inexistente |

## ImageController (`/image`)

| Metodo | Endpoint | Auth | Request Body | Response | Testes |
|--------|----------|------|-------------|----------|--------|
| POST | /image/uploadImageUser | Sim | multipart/form-data (file) | string | Sucesso |
| POST | /image/uploadImageNetwork | Sim | multipart/form-data (networkId + file) | string | Sucesso |

## Validacoes Transversais

- Todos endpoints com Auth=Sim devem retornar 401 quando chamados sem token
- Todos endpoints devem retornar Content-Type application/json (exceto upload de imagem)
- Endpoints de busca devem respeitar formato paginado (pageNum, pageCount)
