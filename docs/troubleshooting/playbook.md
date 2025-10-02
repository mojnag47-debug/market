# 🔧 Troubleshooting Playbook

## 🚨 Common Errors & Solutions

### Docker Container Issues
```bash
# Symptom: Containers failing to start
ERROR: for postgres  Cannot start service postgres: driver failed programming external connectivity

# Solution:
docker system prune --volumes
sudo service docker restart
```

### Database Migration Failures
```typescript
// Error: Database migration version conflict
Error: Migration 20240101120000_initial_schema failed

// Resolution:
npx prisma migrate reset --force
pnpm db:seed:test
```

### API Authentication Errors
```json
{
  "type": "https://api.nextgen-marketplace.com/errors#auth",
  "title": "Invalid JWT",
  "status": 401,
  "instance": "/api/v1/orders"
}

// Debugging Steps:
1. Verify JWT expiration with jwt.io
2. Check Auth0 tenant configuration
3. Validate Redis session store connectivity
```

## 🔄 Recovery Procedures

### Blockchain Node Recovery
```bash
# Reset local Ethereum node
npx hardhat node --reset

# Redeploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Cache Invalidation
```bash
# Flush Redis cache
redis-cli FLUSHALL

# Restart API server
make restart-api
```

## 🕵️ Diagnostic Checklist
1. Review application logs:
   ```bash
   docker logs --tail 100 api_container
   ```
2. Run connectivity tests:
   ```bash
   make test:connectivity
   ```
3. Verify dependency versions:
   ```bash
   pnpm list --depth 0
   pip freeze
   cargo tree
   ```

[//]: # (File path: docs/troubleshooting/playbook.md)