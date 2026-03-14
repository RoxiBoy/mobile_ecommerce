# Customer Mobile App (Expo)

Customer app features based on server controllers/routes:
- Auth (register/login)
- Product catalog + featured + search
- Product detail + add review
- Cart management + coupon validation
- Wishlist management
- Order placement and listing
- Payment record creation and history
- Notifications list/read/delete

## Setup
1. `cp .env.example .env`
2. Set `EXPO_PUBLIC_API_BASE_URL` if needed
3. `npm install`
4. `npm run start`

## API URL defaults
- Android emulator fallback: `http://10.0.2.2:4000/api`
- iOS simulator/web fallback: `http://localhost:4000/api`

## Notes
- Auth token is kept in memory (session-only) in current implementation.
- Make sure backend server is running before starting mobile app.
