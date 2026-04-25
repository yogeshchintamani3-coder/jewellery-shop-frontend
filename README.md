# prathamesh jewellers Frontend

Angular 19 zoneless application for the prathamesh jewellers Jewellery Shop.

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

```bash
npm install --legacy-peer-deps
npx ng serve
```

Open `http://localhost:4200`.

## Features

- **Zoneless change detection** using Angular Signals (no Zone.js)
- **Standalone components** with lazy-loaded routes
- **Dark/Light theme** toggle with CSS variables
- **Responsive design** for mobile and desktop
- Razorpay payment integration
- Admin dashboard with analytics, product management, and order management

## Project Structure

```
src/app/
  core/           - Services, guards, interceptors, models
  shared/         - Reusable components (header, footer, product-card, search-bar)
  features/
    home/         - Landing page
    products/     - Product list and detail
    auth/         - Login and signup
    cart/         - Shopping cart
    checkout/     - Checkout with Razorpay
    orders/       - Order history and detail
    admin/        - Dashboard, product management, order management
```

## Environment

The API base URL is configured in `api.service.ts`. Default: `http://localhost:8080/api`.

## Build for Production

```bash
npx ng build --configuration production
```

Output goes to `dist/jewellery-shop-frontend/browser`.

## Docker

```bash
docker build -t prathamesh jewellers-frontend .
docker run -p 80:80 prathamesh jewellers-frontend
```

## Docker Compose (full stack)

From the parent directory:

```bash
cp .env.example .env   # fill in your values
docker compose up --build
```

Frontend: `http://localhost`  
Backend: `http://localhost:8080`
