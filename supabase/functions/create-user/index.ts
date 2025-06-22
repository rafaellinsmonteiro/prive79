
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify that the request is from an authenticated user
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user token using admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader)
    if (userError || !user) {
      console.error('Invalid token:', userError)
      throw new Error('Invalid token')
    }

    console.log('Authenticated user:', user.id, user.email)

    // Check if user is admin using direct query instead of RPC
    // This bypasses any RLS issues with the is_admin() function
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    console.log('Admin check result:', { adminCheck, adminError })
    
    // If no admin record found, also check by email as fallback
    if (adminError || !adminCheck) {
      const { data: adminCheckByEmail, error: adminEmailError } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()
      
      console.log('Admin check by email result:', { adminCheckByEmail, adminEmailError })
      
      if (adminEmailError || !adminCheckByEmail) {
        console.log('User is not admin:', user.email)
        throw new Error('User is not admin')
      }
    }

    console.log('Admin verification successful for user:', user.email)

    const { email, password, name, user_role, plan_id, is_active } = await req.json()

    console.log('Creating user:', { email, name, user_role })

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        user_role,
      }
    })

    if (authError) {
      console.error('Auth user creation failed:', authError)
      throw new Error(`Auth user creation failed: ${authError.message}`)
    }

    console.log('Auth user created:', authData.user.id)

    // Create user in system_users table
    const { data: systemData, error: systemError } = await supabaseAdmin
      .from('system_users')
      .insert({
        user_id: authData.user.id,
        email,
        name,
        user_role,
        plan_id: plan_id || null,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (systemError) {
      console.error('System user creation failed:', systemError)
      // Cleanup auth user if system user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`System user creation failed: ${systemError.message}`)
    }

    console.log('System user created:', systemData.id)

    return new Response(
      JSON.stringify({ success: true, user: systemData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
