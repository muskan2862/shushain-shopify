# Sushain Shopify API Dashboard

A Next.js application integrated with the Shopify Admin API to manage product information, update product prices, and view recent orders.

## Features

- **Product Listing:** Fetch and display products from the Shopify store.
- **Price Management:** Update product variant prices through the Shopify API.
- **Order Management:** Retrieve and display recent orders.
- **API Integration:** Connect to Shopify using secure server-side API routes.
- **Dashboard UI:** View product details and order information in one place.

## Tech Stack

- Next.js
- React
- JavaScript
- Shopify Admin GraphQL API
- Node.js

## Getting Started

### Prerequisites

- Node.js installed
- A Shopify development store
- Shopify app credentials with the required API access scopes

### Installation

Clone the repository:

```bash
git clone https://github.com/muskan2862/shushain-shopify.git
cd shushain-shopify
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and configure the following variables using your Shopify app credentials:

```env
SHOPIFY_SHOP=your-store.myshopify.com
SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
```

**Security:** Never commit `.env.local` or expose your Shopify client secret in public repositories.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

| Endpoint | Purpose |
|---|---|
| `/api/test-shopify` | Test the Shopify connection and fetch products |
| `/api/update-price` | Update a product variant's price |
| `/api/orders` | Fetch recent orders |

## Project Structure

```text
shushain-shopify/
├── app/
│   ├── api/
│   │   ├── test-shopify/
│   │   ├── update-price/
│   │   └── orders/
│   └── page.js
├── .env.local
├── .gitignore
└── package.json
```

## Deployment

This application can be deployed using [Vercel](https://vercel.com/). Configure the required Shopify environment variables in the deployment platform before deploying.

## Notes

- API credentials should remain server-side.
- Shopify API access scopes must match the operations performed by the application.
- Test price updates carefully in a development store.

## Author

Muskan

## License

No license has been specified yet.
