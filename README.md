# Mobile Ecommerce Platform

Full-stack mobile ecommerce project with a customer app, admin dashboard, and a Node/Express API.

## Structure
- `server`: Node/Express + MongoDB API
- `mobile`: Expo React Native customer app
- `web`: React (Vite) admin dashboard

## Features
Customer (mobile):
- Auth (JWT)
- Browse categories and products
- Product detail with reviews
- Cart, wishlist, coupons
- Orders and payments
- Notifications
- Customer chat assistant (Gemini)

Admin (web):
- Admin login
- Manage categories, products, coupons
- View/update orders and payments
- Create notifications

Backend:
- REST API with JWT auth
- Image proxy for blocked hotlinks
- Gemini chat integration

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile: Expo, React Native, Expo Router
- Admin: React, Vite

## Environment Variables

### `server/.env`
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mobile_ecommerce
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/gemini-2.5-flash
CORS_ORIGINS=http://localhost:5173
IMAGE_PROXY_ALLOWLIST=upload.wikimedia.org,images.unsplash.com
CHAT_DEBUG=false
```

### `mobile/.env`
```
EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:3000/api
```
Use your machine IP for device/emulator access (not `localhost`).

### `web/.env`
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Run Locally

### Backend
```
cd server
npm install
npm run dev
```

### Mobile
```
cd mobile
npm install
npm expo start
press 'a'; # For android
```

### Admin Dashboard
```
cd web
npm install
npm run dev
```

## Notes
- Admin routes require an admin user role.
- The chat assistant pulls context from the customer’s cart, orders, and a product sample.
- If remote product images fail to load due to hotlink protection, the API image proxy is used.
