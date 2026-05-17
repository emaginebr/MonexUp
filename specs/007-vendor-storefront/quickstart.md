# Quickstart — Vendor Storefront

## Pré-requisitos

- PostgreSQL rodando (banco `monexup` populado conforme `.env`).
- Lofn rodando em `REACT_APP_LOFN_API_URL` (`c:\repos\Lofn\Lofn`).
- ProxyPay sandbox configurado em `REACT_APP_PROXYPAY_*`.
- `.env` do `monexup-app/` preenchido (`.env.example` como base).

## Subir o ambiente

```powershell
# Terminal 1 — backend MonexUp
dotnet run --project MonexUp.API/MonexUp.API.csproj

# Terminal 2 — backend Lofn
dotnet run --project c:\repos\Lofn\Lofn\Lofn.API\Lofn.API.csproj

# Terminal 3 — frontend
cd monexup-app
npm install        # primeira vez
npm start          # porta 3000
```

## Cenário de teste — US1 (listagem pública)

1. Login admin no MonexUp em `http://localhost:3000/account/login`.
2. Criar rede `loja-demo` (admin → networks).
3. Criar 3 produtos via `/admin/products`:
   - Produto físico (productType=1, price 50)
   - Produto info (productType=2, price 30)
   - Doação (productType=3, donationMode=Open, minimumDonationAmount=10)
4. Cadastrar vendedor `vendedor-x` na rede (`/loja-demo/new-seller`).
5. Logout. Abrir janela anônima em `http://localhost:3000/loja-demo/store/vendedor-x`.
6. **Esperado**: 3 cards visíveis com imagem, preço e botão correto (Comprar, Comprar, Doar).
7. **Edge**: acessar `/loja-demo/store/inexistente` → estado "vendedor não encontrado".
8. **Edge**: acessar `/rede-inexistente/store/vendedor-x` → estado "loja indisponível".

## Cenário de teste — US2 (compra PIX)

1. Na storefront (anônimo), clicar **Comprar** no produto físico.
2. **Esperado**: SimpleLoginForm aparece pedindo nome, e-mail, CPF.
3. Preencher e confirmar.
4. **Esperado**: modal PIX abre exibindo QR Code, código copia-e-cola e contador de expiração.
5. Simular liquidação no ProxyPay sandbox (dashboard ou comando).
6. **Esperado**: dentro do `pollInterval` (5 s) modal vai a "pago" e front redireciona para `/checkout/success`.
7. **Edge**: clicar **Comprar** novamente no mesmo produto antes da liquidação → backend retorna mesmo invoice (idempotência) ou mensagem; no front, botão fica desabilitado durante request.
8. **Edge**: deixar QR expirar → modal mostra erro com botão "Tentar novamente".

## Cenário de teste — US3 (doação)

1. Na storefront, clicar **Doar** no produto de doação aberta.
2. **Esperado**: aparece `DonationAmountForm` pedindo valor.
3. Informar valor < `minimumDonationAmount` → bloqueia com mensagem.
4. Informar valor válido → segue para `SimpleLoginForm` (se anônimo) → modal PIX.
5. **Esperado**: modal PIX abre com o valor informado.
6. Para doação de valor fixo (`donationMode != Open`): clicar **Doar** vai direto a `SimpleLoginForm` + modal com o preço do produto.

## Validações finais

- [ ] `SellerPage` antiga em `/loja-demo/@/vendedor-x` continua funcionando inalterada (FR-016).
- [ ] `ProductPage` antiga em `/loja-demo/@/vendedor-x/{productSlug}` inalterada.
- [ ] Card NÃO navega para detalhe ao clicar fora do botão (FR-003a).
- [ ] Strings em PT, EN, ES, FR (alternar via seletor de idioma) — Princípio V.
- [ ] Console sem erros de React/i18next.
- [ ] Backend não recebeu chamadas a endpoints novos — apenas `Order/createPixPayment` e `Product/search`.

## Critérios de aceitação medíveis (SC) verificáveis manualmente

| SC | Como verificar |
|----|----------------|
| SC-001 | DevTools → Network → Throttling 4G → Reload → tempo até `load` < 3 s |
| SC-002 | Cronometrar do submit do SimpleLoginForm até QR Code visível |
| SC-004 | Duplo-clique no botão → conferir no banco que apenas 1 invoice foi criado em 5 min |
| SC-005 | Confirmar `Order.sellerId`/`networkId` correspondem ao slug da URL |
