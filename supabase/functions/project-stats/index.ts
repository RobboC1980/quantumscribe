import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Parse URL to get project_id
    const url = new URL(req.url)
    const projectId = url.searchParams.get('project_id')

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if the user has access to this project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get statistics for this project
    const { data: epics, error: epicsError } = await supabaseClient
      .from('epics')
      .select('id')
      .eq('project_id', projectId)

    if (epicsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch epics' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const epicIds = epics.map(e => e.id)
    
    // Get story status counts for this project
    const { data: storyCounts, error: storyCountsError } = await supabaseClient
      .from('stories')
      .select('status, count')
      .in('epic_id', epicIds)
      .group('status')

    if (storyCountsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch story statistics' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format the statistics
    const statusCounts = {
      todo: 0,
      in_progress: 0,
      done: 0
    }

    storyCounts.forEach(item => {
      statusCounts[item.status] = parseInt(item.count)
    })

    const totalStories = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    const completionRate = totalStories > 0 
      ? Math.round((statusCounts.done / totalStories) * 100) 
      : 0

    return new Response(
      JSON.stringify({
        project: {
          id: project.id,
          name: project.name
        },
        stats: {
          total_epics: epics.length,
          total_stories: totalStories,
          status_counts: statusCounts,
          completion_rate: completionRate
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 