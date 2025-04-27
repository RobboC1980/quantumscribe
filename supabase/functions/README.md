# Supabase Edge Functions

This directory contains Edge Functions that run on Supabase's infrastructure.

## Available Functions

1. `profile` - Handles user profile management (get and update profile)
2. `project-stats` - Provides statistics for a specific project

## Local Development

To run these functions locally:

1. Install Supabase CLI: `npm install -g supabase`
2. Start the local server: `supabase functions serve`
3. Test the functions locally:
   ```bash
   # Get profile
   curl -i --location --request GET 'http://localhost:54321/functions/v1/profile' \
   --header 'Authorization: Bearer YOUR_AUTH_TOKEN'
   
   # Update profile
   curl -i --location --request PATCH 'http://localhost:54321/functions/v1/profile' \
   --header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
   --header 'Content-Type: application/json' \
   --data-raw '{"display_name": "New Name"}'
   
   # Get project stats
   curl -i --location --request GET 'http://localhost:54321/functions/v1/project-stats?project_id=YOUR_PROJECT_ID' \
   --header 'Authorization: Bearer YOUR_AUTH_TOKEN'
   ```

## Deployment

To deploy these functions to your Supabase project:

```bash
supabase functions deploy profile
supabase functions deploy project-stats
```

## Function Types

Edge Functions in this project are built using TypeScript for better type safety. However, linting them directly in the codebase might show errors since they are designed to run in Deno runtime, not Node.js.

The TypeScript errors in these files can be ignored as they are expected to run in the Deno environment provided by Supabase. 