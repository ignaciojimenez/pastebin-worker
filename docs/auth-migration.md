# Auth Migration Checklist

Enabling HTTP Basic Auth on `curlbin.ignacio.systems` so only authenticated clients can upload.

## What Changes

- All `POST /` (upload) requests require HTTP Basic Auth
- All `PUT /<name>:<passwd>` (update) requests require HTTP Basic Auth
- `GET` requests (paste retrieval) remain unauthenticated
- Static pages (`/`, `/api`, `/tos`) require auth when `BASIC_AUTH` is non-empty

## Steps

### 1. Test against dev preview first

Update one backup client to use auth, test against the dev preview URL:

```bash
# Generate bcrypt hash
node scripts/bcrypt.js
# Enter password when prompted

# Set auth in wrangler.toml [env.dev.vars]
# [env.dev.vars.BASIC_AUTH]
# ignacio = "$2b$08$<hash>"

# Deploy to dev
pnpm run deploy:dev

# Test upload with auth
curl -u ignacio:yourpassword -Fc=@testfile.txt https://pb-dev.ignaciojimenez.workers.dev/
```

### 2. Update all backup clients

For each script/cron that uploads to curlbin:

**Before:**
```bash
curl -Fc=@backup.tar.gz.enc https://curlbin.ignacio.systems
```

**After:**
```bash
curl -u ignacio:yourpassword -Fc=@backup.tar.gz.enc https://curlbin.ignacio.systems
```

Or using `.netrc` for cleaner scripts:
```bash
# In ~/.netrc
machine curlbin.ignacio.systems
  login ignacio
  password yourpassword

# Then curl uses -n flag
curl -n -Fc=@backup.tar.gz.enc https://curlbin.ignacio.systems
```

### 3. Enable auth in production

```bash
# Generate bcrypt hash
node scripts/bcrypt.js

# Add to wrangler.toml
# [vars.BASIC_AUTH]
# ignacio = "$2b$08$<hash>"

# Deploy
pnpm run deploy
```

### 4. Verify

```bash
# Should fail (no auth)
curl -Fc="test" https://curlbin.ignacio.systems
# Expected: HTTP basic auth is required

# Should succeed (with auth)
curl -u ignacio:yourpassword -Fc="test" https://curlbin.ignacio.systems
# Expected: JSON response with url, manageUrl

# Existing pastes should still be readable without auth
curl https://curlbin.ignacio.systems/<existing-paste-name>
```

## Rollback

Set `BASIC_AUTH = {}` in `wrangler.toml` and redeploy to disable auth.
