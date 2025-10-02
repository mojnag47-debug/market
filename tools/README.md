# Token generator

This folder contains a small helper to generate JWT tokens for local development.

Usage:

1. Ensure dependencies are installed:

   pnpm add -D jsonwebtoken minimist

2. Set JWT secret (optional, defaults to `your-secret-key`):

   # current shell only
   $env:JWT_SECRET = 'a-very-secure-secret-please-change'

   # or persistent (Windows):
   setx JWT_SECRET "a-very-secure-secret-please-change"

3. Generate a token:

   node tools/generate-token.js --sub=test-seller-123 --email=test@seller.com --role=seller

The script prints a signed JWT to stdout. Use it in `Authorization: Bearer <token>` for API requests.
