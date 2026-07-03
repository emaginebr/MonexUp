# ProxyPay — Correções Necessárias

Documento que lista bugs e melhorias identificadas no repositório **ProxyPay** (`C:\repos\ProxyPay`) durante o trabalho de integração com a página `/admin/orders/:orderId` do MonexUp. ProxyPay é um projeto separado, tratado como read-only pelo agente — cada item aqui precisa de autorização explícita do responsável antes de aplicar.

> **Última atualização:** 2026-05-19 — descoberto durante implementação do endpoint `GET /Order/listInvoices/{orderId}` no MonexUp.

---

## 1. `InvoiceRepository.GetByIdAsync` não carrega `Items` (CRÍTICO)

**Arquivo:** `C:\repos\ProxyPay\backend\ProxyPay.Infra\Repository\InvoiceRepository.cs:41-47`

**Código atual:**

```csharp
public async Task<InvoiceModel> GetByIdAsync(long id)
{
    var row = await _context.Invoices.FindAsync(id);
    if (row == null)
        return null;
    return _mapper.Map<InvoiceModel>(row);
}
```

**Problema:**
`FindAsync` não faz eager-load de navigation properties. `InvoiceModel.Items` chega sempre vazio no consumidor. Como consequência, todo cliente da API `/api/invoice/getById/{id}` recebe uma fatura sem itens — impossibilitando calcular total, mostrar descrições, exibir quantidades.

**Impacto no MonexUp:**
`GET /Order/listInvoices/{orderId}` retorna InvoiceInfo com `items: []` → frontend não consegue derivar valor total da fatura. Colunas Valor e Desconto exibem `R$ 0,00` mesmo em faturas pagas.

**Fix sugerido:**

```csharp
public async Task<InvoiceModel> GetByIdAsync(long id)
{
    var row = await _context.Invoices
        .Include(x => x.InvoiceItems)
        .FirstOrDefaultAsync(x => x.InvoiceId == id);
    if (row == null)
        return null;
    return _mapper.Map<InvoiceModel>(row);
}
```

Confirmar que `Invoice.InvoiceItems` é a navigation property correta olhando `ProxyPay.Infra/Context/ProxyPayContext.cs`. Verificar também que o AutoMapper `InvoiceProfile` faz o pass-through `Invoice → InvoiceModel` incluindo `InvoiceItems → Items`.

**Tests:** confirmar via `ProxyPay.ApiTests/Controllers/InvoiceControllerTests.cs` que após uma criação com N itens, o GET traz os N itens de volta.

---

## 2. `Invoice.DueDate` armazenado como `0001-01-01` para invoices criadas via QR Code

**Onde aparece:** todas as faturas geradas pelo fluxo PIX QR Code no MonexUp chegam com `DueDate = DateTime.MinValue`.

**Provável causa:** no fluxo `CreateQRCodeAsync` (`ProxyPay.Domain/Services/*`) a fatura é inserida sem popular `DueDate`. EF Core grava `default(DateTime)` que serializa como `0001-01-01T00:00:00`.

**Fix sugerido:**

Ao criar a fatura no fluxo PIX, popular `DueDate` com uma regra consistente. Sugestões:
- Fixed one-time PIX → `DueDate = CreatedAt.AddDays(1)` (comum: 24h para pagar).
- Recurring subscription → `DueDate` = próxima virada de ciclo.

Alternativa mais leve: se PIX QR Code realmente não tem "vencimento" no sentido bancário, mudar o schema para permitir `DueDate` nullable (`DateTime?`) e ajustar mappers/DTO. Isso remove o valor mágico `0001-01-01` dos consumidores.

**Workaround atual no MonexUp (não precisa reverter quando ProxyPay for corrigido):** frontend em `monexup-app/src/Pages/OrderDetailPage/index.tsx` já filtra datas anteriores a 1990 via helper `isValidDate` e mostra `—` no lugar.

---

## 3. `InvoiceInfo` não expõe `total` derivado no wire

**Arquivo:** `C:\repos\ProxyPay\backend\ProxyPay.DTO\Invoice\InvoiceInfo.cs`

**Problema:**
O modelo de domínio `InvoiceModel` calcula total via `GetTotal()` e `GetTotalRealPaid()` (`ProxyPay.Domain\Models\InvoiceModel.cs:128,131`), mas o DTO exposto na API não carrega esse valor pré-computado. Todo consumidor precisa somar `items[]` manualmente. Frágil quando `Items` chega vazio (ver item 1).

**Fix sugerido:**

Adicionar `Total` (e opcionalmente `TotalRealPaid`) ao `InvoiceInfo`:

```csharp
[JsonPropertyName("total")]
public double Total { get; set; }
```

E popular no mapper via `.ForMember(d => d.Total, opt => opt.MapFrom(s => s.GetTotal()))`.

**Benefício:** consumidor tem valor autoritativo sem depender de eager-load de items nem de aritmética client-side. Também protege contra descontos aplicados no futuro em nível de invoice (não só nos items).

---

## 4. ~~Sem endpoint "list invoices by external reference"~~ ✅ Existe

**Status:** ✅ Resolvido. `GET /Invoice/byExternalCode/{externalCode}` já implementado em `ProxyPay.API/Controllers/InvoiceController.cs:39`. MonexUp precisa apenas passar a chamar quando modelo Order → N Invoices for wired.

**Pendência derivada:** MonexUp `SubscriptionService.CreatePixPayment` deve popular `InvoiceRequest.ExternalCode` com `Order.OrderId` na criação da invoice — hoje esse campo fica em branco. Sem isso, o endpoint `byExternalCode` fica útil só teoricamente. **Escopo MonexUp**, não ProxyPay.

---

## 6. Sem endpoint "list invoices by store" (CRÍTICO para /admin/billing)

**Contexto:**
Tela `/admin/billing` do MonexUp precisa listar TODAS as invoices da loja para o `NetworkManager` (com paginação, filtros por status/data, busca por número/comprador). Também precisa filtrar por `sellerId` no fluxo `Seller`. ProxyPay não expõe endpoint para isso hoje.

Endpoints existentes em `ProxyPay.API/Controllers/InvoiceController.cs`:
- GET `/Invoice/getById/{invoiceId}` — busca por PK
- GET `/Invoice/byExternalCode/{externalCode}` — busca por referência externa

**Falta:**
- `GET /Invoice/search` (POST body ou querystring) com parâmetros:
  - `storeId` (obrigatório) — vem do `Store.Id` do clientId autenticado
  - `pageNum`, `pageSize`
  - `status?` (opcional, InvoiceStatusEnum)
  - `fromDate?`, `toDate?` (filtro por CreatedAt ou DueDate)
  - `keyword?` (opcional — busca em InvoiceNumber, ExternalCode, Customer.Name)
- Retorno: `InvoiceListPagedResult` no padrão dos outros endpoints paginados (`{ items[], pageNum, pageSize, totalCount, totalPages }`).

**Fix sugerido:**

```csharp
[HttpPost("search")]
public async Task<ActionResult<InvoiceListPagedResult>> Search([FromBody] InvoiceSearchParam param)
{
    var result = await _invoiceService.SearchAsync(param);
    return Ok(result);
}
```

+ `IInvoiceService.SearchAsync` com IQueryable + Include(InvoiceItems) + `Skip/Take`. Usar HotChocolate GraphQL alternativamente se preferirem.

**Workaround temporário no MonexUp** (enquanto o endpoint não existe): agregar as invoices via `OrderService.Search(networkId, ...)` e para cada order chamar `GetFullInvoiceAsync`. Custa N+1 requests → OK para dev com poucos pedidos, INVIÁVEL em prod.

**Prioridade:** ALTA — bloqueia UX do gerente de rede.

---

## 5. `InvoiceStatusEnum` — mapeamento numérico precisa estar documentado no consumidor

**Arquivo:** `C:\repos\ProxyPay\backend\ProxyPay.DTO\Invoice\InvoiceStatusEnum.cs`

```
1 = Pending
2 = Sent
3 = Paid
4 = Overdue
5 = Cancelled
6 = Expired
```

**Problema:** não é um bug do ProxyPay em si, mas foi armadilha no MonexUp (frontend inicial associou status=3 a "Expired" — errado, era "Paid"). Documento fica aqui como referência para futuros consumidores.

**Sugestão (opcional):** serializar o enum como string no wire (`[JsonConverter(typeof(JsonStringEnumConverter))]` no `InvoiceInfo.Status`) para eliminar a ambiguidade numérica em clientes JS/TS.

---

## Prioridade sugerida

1. **Item 6** (list invoices by store) — bloqueia `/admin/billing` para NetworkManager; **fix imediato**.
2. **Item 1** (Items eager-load) — bloqueia UI de faturas no MonexUp; **fix imediato**.
3. **Item 3** (Total no DTO) — reduz superfície de bugs semelhantes; **junto do 1**.
4. **Item 2** (DueDate padrão) — cosmético mas suja telas; **próximo sprint**.
5. **Item 4** (~~list by externalCode~~ — resolvido; ver pendência MonexUp).
6. **Item 5** (enum como string) — melhoria de contrato; opcional.

---

## Como reproduzir os bugs 1–3

1. No MonexUp, criar uma assinatura de qualquer produto (`/admin/products/new` + fazer checkout como comprador em `/{network}/store/{seller}/{product}`).
2. Concluir pagamento via botão π (simulate) no modal PIX.
3. Navegar `/admin/orders/{id}` — abrir card "Pagamento".
4. Observar:
   - Coluna **Valor** = `R$ 0,00` (bug 1 + 3).
   - Coluna **Desconto** = `R$ 0,00` (bug 1).
   - Coluna **Vencimento** = `—` (bug 2, frontend filtra `0001-01-01`).
   - Coluna **Status** = correta (`Pago`) — status enum funciona.

Após fix do item 1, Valor e Desconto passam a refletir os items reais.
