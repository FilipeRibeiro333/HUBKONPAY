# HUBKON PAY

### One API. Multiple Payment and Settlement Rails for Emerging Markets.

HUBKON PAY is a B2B settlement orchestration platform designed to connect traditional banking rails and Web3 infrastructure through a unified API.

The platform is designed for cross-border B2B transactions, particularly import and settlement workflows between emerging markets and international suppliers.

---

## 1. The Problem

Cross-border B2B payments in emerging markets can involve:

* Limited access to foreign currency
* Slow international bank transfers
* High FX and banking costs
* Fragmented payment infrastructure
* Manual reconciliation
* Limited visibility across settlement stages
* Operational friction between importers, banks, customs agents and suppliers

For an importer, the payment process can involve several disconnected systems and intermediaries.

HUBKON PAY is designed to provide a unified orchestration layer across these rails.

---

## 2. The Solution

HUBKON PAY provides a single application layer for coordinating multiple settlement rails.

```text
                    HUBKON PAY
                        │
             Settlement Orchestration
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   Banking Rails    Web3 Rails      Compliance
        │               │                │
   SWIFT / CIPS       Solana        Invoice / Metadata
```

The platform does not need to replace existing banks or payment networks.

Instead, HUBKON PAY acts as an orchestration layer above the available rails.

---

## 3. Architecture

The repository contains three main components:

```text
HUBKONPAY/
│
├── hubkon-frontend/
│   └── Next.js application
│
└── hubkon-pay/
    │
    ├── backend/
    │   └── Express / Node.js backend
    │
    └── hubkon-solana-contracts/
        └── Solana / Anchor programs
```

### Frontend

Technology:

* Next.js
* React
* JavaScript / TypeScript
* Wallet integration
* Settlement dashboard
* Transaction explorer
* Administrative interfaces

The frontend provides the user interface for initiating and monitoring settlement operations.

### Backend

Technology:

* Node.js
* Express
* MongoDB
* REST APIs
* Webhooks
* HMAC-SHA256 request authentication
* Authentication and RBAC
* Transaction orchestration

The backend coordinates the application logic, transaction lifecycle, banking integrations and settlement routing.

### Solana Layer

Technology:

* Solana
* Anchor
* Rust
* SPL tokens
* USDC / other supported settlement assets

The Solana layer provides programmable on-chain settlement infrastructure for the Web3 rail.

---

## 4. Settlement Flow

A simplified HUBKON PAY settlement flow:

```text
1. Invoice
      │
      ▼
2. Invoice metadata validation
      │
      ▼
3. Settlement request
      │
      ▼
4. HUBKON routing engine
      │
      ├──────────────► Banking rail
      │
      └──────────────► Solana / Web3 rail
                              │
                              ▼
                       On-chain settlement
                              │
                              ▼
                     Transaction confirmation
                              │
                              ▼
                       Reconciliation
```

The routing layer allows the application to select the appropriate settlement rail according to the transaction flow and available infrastructure.

---

## 5. Banking Rails

The architecture is designed to integrate with traditional financial infrastructure through APIs and banking partners.

Examples include:

* SWIFT
* CIPS
* Bank APIs
* Webhooks
* Fiat settlement systems

HUBKON PAY is designed as an orchestration layer rather than as a replacement for licensed financial institutions.

---

## 6. Solana / Web3 Rail

The Web3 component provides an additional programmable settlement rail.

The Solana implementation includes:

* Anchor smart contracts
* Rust programs
* On-chain transaction processing
* SPL token interactions
* Wallet-based transaction signing
* Transaction verification

The objective is to allow compatible B2B settlement flows to use blockchain infrastructure while keeping the orchestration layer independent from a single rail.

---

## 7. Security

Security considerations implemented or planned across the system include:

### API Authentication

HMAC-SHA256 request signing is used to authenticate protected API requests.

### Wallet Model

The Web3 architecture is designed around client-controlled wallet signing rather than requiring HUBKON to hold users' private keys.

### Access Control

The backend contains authentication and role-based access-control mechanisms.

### Transaction Protection

The architecture includes transaction validation and failure-handling mechanisms designed to prevent invalid settlement states.

### Secrets

Environment variables and private keys are intentionally excluded from the public repository.

---

## 8. Repository Structure

```text
hubkon-frontend/
├── app/
├── components/
├── providers/
├── services/
├── package.json
└── package-lock.json

hubkon-pay/
│
├── backend/
│   ├── src/
│   ├── tests/
│   ├── scripts/
│   ├── app.js
│   ├── package.json
│   └── README.md
│
└── hubkon-solana-contracts/
    ├── programs/
    ├── tests/
    ├── migrations/
    ├── Anchor.toml
    ├── Cargo.toml
    └── package.json
```

---

## 9. Local Development

### Requirements

* Node.js
* npm
* MongoDB
* Git
* Rust
* Solana CLI
* Anchor CLI

### Clone

```bash
git clone https://github.com/FilipeRibeiro333/HUBKONPAY.git
cd HUBKONPAY
```

### Frontend

```bash
cd hubkon-frontend
npm install
npm run dev
```

### Backend

```bash
cd hubkon-pay/backend
npm install
npm start
```

Configure environment variables according to the backend `.env.example` or project documentation.

### Solana Contracts

```bash
cd hubkon-pay/hubkon-solana-contracts
yarn install
anchor build
anchor test
```

The exact commands may vary according to the configured Solana cluster and local environment.

---

## 10. Testing

The backend contains automated tests covering areas such as:

* Authentication
* Middleware
* RBAC
* API behavior
* Security-related functionality

Solana programs can be built and tested using the Anchor toolchain.

```bash
anchor build
anchor test
```

---

## 11. Demo

The primary product flow demonstrated by HUBKON PAY is:

```text
B2B Invoice
     ↓
Metadata / validation
     ↓
Settlement request
     ↓
HUBKON routing layer
     ↓
Banking or Web3 rail
     ↓
Settlement confirmation
     ↓
Reconciliation
```

A complete demonstration should show the transaction moving through the orchestration layer and, where applicable, reaching Solana settlement.

---

## 12. Current Development Stage

HUBKON PAY is an early-stage infrastructure project under active development.

The repository contains:

* Next.js frontend
* Node.js / Express backend
* MongoDB persistence
* API and webhook infrastructure
* Authentication and RBAC
* Solana / Anchor smart-contract infrastructure
* Multi-rail settlement architecture

The system is being developed toward production-grade integrations and mainnet deployment.

---

## 13. Vision

HUBKON PAY aims to provide a unified settlement orchestration layer for businesses operating across emerging markets.

Instead of forcing businesses to adapt to a single payment rail, HUBKON PAY is designed to coordinate multiple rails behind a single application and API.

```text
                ONE HUBKON API
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      Banks         Solana       Other Rails
        │             │             │
        └─────────────┼─────────────┘
                      │
               B2B Settlement
```

---

## License

See the repository license for current usage and distribution terms.
