#!/usr/bin/env node
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Usage: node tools/generate-token.js --sub=USER_ID --email=user@example.com --role=seller
const argv = require('minimist')(process.argv.slice(2));
const sub = argv.sub || 'test-seller-id';
const email = argv.email || 'seller@example.com';
const role = argv.role || 'seller';
const expHours = Number(argv.exp) || 24;

const secret = process.env.JWT_SECRET || 'your-secret-key';

const token = jwt.sign({ sub, email, role }, secret, { algorithm: 'HS256', expiresIn: `${expHours}h` });
console.log(token);
