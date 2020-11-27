# Introduction

Online MarketPlace is a project that simulate e-commerce platform with auction capability.

Feature 3 users access control:
- Admin: Manage user on the platform
- Seller: Manage store and product on platform
- Buyer: Able to purchase and bid product

Tools:
- Truffle
- Ganache CLI
- OpenZeppelin
- Create react app (CRA)
- Rimble UI
- Metamask

Specifications:
- Access control
- Upgrade able
- Pull payment

# Instructions

## Local
Checkout this repository and follow steps below:
```
// Install packages
npm install
// Start ganache cli
npx ganache-cli
// Build contracts 'src/contracts'
npx truffle compile
// Migrate to 'development'
npx truffle migrate
// Run contracts test
npx truffle test
// Start application
npm start
```

## Online

Application host at https://marketplace-5facf.web.app/

Setup Metamask to `Rinkeby Test Network`.
