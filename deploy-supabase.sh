#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Deploy Supabase functions
echo "Deploying Supabase functions..."
supabase functions deploy project-stats --project-ref your-project-ref

# Run stats function
echo "Running project stats function..."
curl -X POST "$SUPABASE_URL/functions/v1/project-stats" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"

echo "Deployment complete!" 