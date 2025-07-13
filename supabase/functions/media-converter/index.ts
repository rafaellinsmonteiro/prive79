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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, fileUrl, fileName, modelId } = await req.json()
    
    console.log('Media converter request:', { action, fileName, modelId })

    if (action === 'convert-heic') {
      return await convertHeicToJpeg(fileUrl, fileName, modelId, supabase, cloudinaryUrl)
    } else if (action === 'generate-thumbnail') {
      return await generateVideoThumbnail(fileUrl, fileName, modelId, supabase, cloudinaryUrl)
    } else {
      throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in media-converter:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Parse Cloudinary credentials from URL
function parseCloudinaryUrl(cloudinaryUrl: string) {
  const url = new URL(cloudinaryUrl)
  return {
    cloudName: url.hostname,
    apiKey: url.username,
    apiSecret: url.password
  }
}

async function convertHeicToJpeg(fileUrl: string, fileName: string, modelId: string, supabase: any, cloudinaryUrl: string) {
  try {
    console.log('Converting HEIC to JPEG using Cloudinary:', fileName)
    
    const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(cloudinaryUrl)
    
    // Upload to Cloudinary with auto format conversion
    const formData = new FormData()
    formData.append('file', fileUrl)
    formData.append('upload_preset', 'unsigned') // You might need to create this
    formData.append('format', 'jpg')
    formData.append('resource_type', 'image')
    formData.append('folder', `models/${modelId}`)
    
    // Generate signature for authenticated upload
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = `folder=models/${modelId}&format=jpg&resource_type=image&timestamp=${timestamp}`
    
    const signature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, new TextEncoder().encode(paramsToSign))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )
    
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    
    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!cloudinaryResponse.ok) {
      throw new Error('Cloudinary upload failed')
    }
    
    const cloudinaryData = await cloudinaryResponse.json()
    
    console.log('HEIC converted successfully via Cloudinary:', cloudinaryData.secure_url)

    return new Response(
      JSON.stringify({ 
        success: true, 
        convertedUrl: cloudinaryData.secure_url,
        message: 'HEIC convertido para JPEG com sucesso'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error converting HEIC via Cloudinary:', error)
    throw error
  }
}

async function generateVideoThumbnail(fileUrl: string, fileName: string, modelId: string, supabase: any, cloudinaryUrl: string) {
  try {
    console.log('Generating video thumbnail using Cloudinary:', fileName)
    
    const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(cloudinaryUrl)
    
    // Upload video to Cloudinary and generate thumbnail
    const formData = new FormData()
    formData.append('file', fileUrl)
    formData.append('resource_type', 'video')
    formData.append('folder', `models/${modelId}/videos`)
    
    // Generate signature
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = `folder=models/${modelId}/videos&resource_type=video&timestamp=${timestamp}`
    
    const signature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, new TextEncoder().encode(paramsToSign))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )
    
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    
    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!cloudinaryResponse.ok) {
      throw new Error('Cloudinary video upload failed')
    }
    
    const cloudinaryData = await cloudinaryResponse.json()
    
    // Generate thumbnail URL from video using Cloudinary transformations
    const thumbnailUrl = cloudinaryData.secure_url
      .replace('/video/upload/', '/image/upload/')
      .replace(/\.(mp4|mov|avi|mkv)$/, '.jpg')
      + '?fl_getinfo'
    
    console.log('Video thumbnail generated via Cloudinary:', thumbnailUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailUrl: thumbnailUrl,
        videoUrl: cloudinaryData.secure_url,
        message: 'Frame do vídeo extraído com sucesso'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating video thumbnail via Cloudinary:', error)
    throw error
  }
}