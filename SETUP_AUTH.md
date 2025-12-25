# NextAuth Setup Instructions

## Required Environment Variables

Add the following to your `.env.local` file:

```bash
# NextAuth Secret (REQUIRED)
# Generate a secure secret using: openssl rand -base64 32
# Or use Node.js: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=your-generated-secret-here
```

## Generate AUTH_SECRET

### Option 1: Using OpenSSL
```bash
openssl rand -base64 32
```

### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Using PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Quick Setup

1. Generate a secret using one of the methods above
2. Add it to `.env.local`:
   ```bash
   AUTH_SECRET=N9Arbg+r62xtce06QERnxQep1hgk2wr1o3RsxQrwFU8=
   ```
3. Restart your development server

## Important Notes

- **Never commit `.env.local` to version control**
- Use different secrets for development and production
- The secret should be at least 32 characters long
- If `AUTH_SECRET` is not set, NextAuth will use a fallback secret (development only)

