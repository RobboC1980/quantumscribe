# Deployment Guide

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   # Supabase credentials
   SUPABASE_URL=https://your-project-url.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Deployment settings
   NODE_ENV=production
   ```

## Deployment Steps

### 1. Build and Deploy the Application

```bash
# Install dependencies
pnpm install

# Build the application
pnpm run build

# Deploy to production
pnpm run deploy
```

### 2. Deploy Supabase Functions

```bash
# Make the deployment script executable
chmod +x deploy-supabase.sh

# Run the deployment script
./deploy-supabase.sh
```

### 3. Verify Deployment

After deployment, check the application and verify the following:
- Frontend is accessible
- API endpoints are working
- Supabase functions are running correctly

## Troubleshooting

### PostCSS Plugin Error
If you encounter PostCSS plugin errors:
- Ensure the PostCSS plugin is exported correctly in CommonJS format
- Check the PostCSS version compatibility in package.json
- Verify the plugin is being called properly in postcss.config.js

### HTTP 405 Auth Failures
If you encounter HTTP 405 errors:
- Check that the Supabase URL and keys are correct in the .env file
- Verify that the authorization headers are being sent correctly
- Ensure the Supabase functions have the correct permissions 