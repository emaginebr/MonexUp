# Quickstart: Substituir Stripe pelo ProxyPay

**Date**: 2026-04-02

## Prerequisites

1. ProxyPay backend running and accessible (e.g., `http://localhost:5100`)
2. ProxyPay configured with AbacatePay credentials
3. ProxyPay store created with a `clientId` for MonexUp
4. PostgreSQL database running with MonexUp schema

## Backend Setup

1. Update `appsettings.Development.json`:
```json
{
  "ProxyPay": {
    "ApiUrl": "http://localhost:5100",
    "ClientId": "<your-proxypay-client-id>",
    "TenantId": "monexup"
  }
}
```

2. Remove old Stripe config key `STRIPE_SECRET_KEY` from appsettings.

3. Run migration:
```bash
dotnet ef migrations add RemoveStripeFields --project MonexUp.Infra --startup-project MonexUp.API
dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API
```

4. Build and run:
```bash
dotnet build MonexUp.sln
dotnet run --project MonexUp.API/MonexUp.API.csproj
```

## Frontend Setup

1. Update `monexup-app/.env`:
```
REACT_APP_PROXYPAY_API_URL=http://localhost:5100
REACT_APP_PROXYPAY_CLIENT_ID=<your-proxypay-client-id>
REACT_APP_PROXYPAY_TENANT_ID=monexup
```

2. Remove old Stripe env var `REACT_APP_STRIPE_PUBLISHABLE_KEY`.

3. Install/update dependencies:
```bash
cd monexup-app
npm uninstall @stripe/react-stripe-js @stripe/stripe-js
npm install proxypay-react
npm start
```

## Validation

1. Navigate to a product page (e.g., `http://localhost:443/{networkSlug}/{productSlug}`)
2. Log in as a test user
3. Click "Buy" / "Comprar"
4. Enter a test CPF (e.g., `12345678900`)
5. QR Code PIX should appear in a modal
6. Use ProxyPay's test mode to simulate payment
7. Polling should detect payment and redirect to `/checkout/success`
8. Verify: Order status = Active, Invoice status = Paid, InvoiceFees calculated

## Sync Validation

1. Navigate to `/admin/invoices`
2. Ensure there are pending invoices
3. Click "Sincronizar"
4. Verify pending invoices have their status updated from ProxyPay
