import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ProfileUpdateParams {
  display_name?: string
  avatar_url?: string
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the Auth context
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Fetch user profile
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ profile: data }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update user profile
      const requestData: ProfileUpdateParams = await req.json()
      
      // Validate request data
      const validFields = ['display_name', 'avatar_url']
      const updateData: Record<string, unknown> = {}
      
      for (const field of validFields) {
        if (field in requestData) {
          updateData[field] = requestData[field as keyof ProfileUpdateParams]
        }
      }
      
      // Add updated_at timestamp
      updateData.updated_at = new Date().toISOString()
      
      // Update the profile
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ profile: data }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 