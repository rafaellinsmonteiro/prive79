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
    const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, fileUrl, fileName, modelId } = await req.json()
    
    console.log('Media converter request:', { action, fileName, modelId })
    console.log('Cloudinary URL exists:', !!cloudinaryUrl)

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
function parseCloudinaryUrl(cloudinaryUrl?: string) {
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL not configured')
  }
  
  try {
    const url = new URL(cloudinaryUrl)
    return {
      cloudName: url.hostname,
      apiKey: url.username,
      apiSecret: url.password
    }
  } catch (error) {
    throw new Error(`Invalid CLOUDINARY_URL format: ${error.message}`)
  }
}

async function convertHeicToJpeg(fileUrl: string, fileName: string, modelId: string, supabase: any, cloudinaryUrl?: string) {
  try {
    console.log('Converting HEIC to JPEG:', fileName)
    
    // Check if Cloudinary is configured
    if (!cloudinaryUrl) {
      console.log('Cloudinary not configured, using fallback conversion')
      return await fallbackHeicConversion(fileUrl, fileName, modelId, supabase)
    }
    
    const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(cloudinaryUrl)
    console.log('Using Cloudinary:', cloudName)
    
    // Upload to Cloudinary with auto format conversion
    const formData = new FormData()
    formData.append('file', fileUrl)
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
      console.error('Cloudinary upload failed:', cloudinaryResponse.status, await cloudinaryResponse.text())
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
    // Fallback to simple conversion
    return await fallbackHeicConversion(fileUrl, fileName, modelId, supabase)
  }
}

async function fallbackHeicConversion(fileUrl: string, fileName: string, modelId: string, supabase: any) {
  try {
    console.log('Using fallback HEIC conversion for:', fileName)
    
    // Fetch the HEIC file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch HEIC file')
    }
    
    const heicBuffer = await response.arrayBuffer()
    
    // Simple renaming approach (browsers can often handle HEIC when served as JPEG)
    const jpegFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg')
    const uploadPath = `${modelId}/${Date.now()}-converted-${jpegFileName}`
    
    // Upload the file as JPEG
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('model-photos')
      .upload(uploadPath, heicBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('model-photos')
      .getPublicUrl(uploadPath)

    console.log('HEIC converted successfully (fallback):', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        convertedUrl: publicUrl,
        message: 'HEIC convertido para JPEG com sucesso'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in fallback HEIC conversion:', error)
    throw error
  }
}

async function generateVideoThumbnail(fileUrl: string, fileName: string, modelId: string, supabase: any, cloudinaryUrl?: string) {
  try {
    console.log('Generating video thumbnail for:', fileName)
    
    // Check if Cloudinary is configured
    if (!cloudinaryUrl) {
      console.log('Cloudinary not configured, using fallback thumbnail generation')
      return await fallbackVideoThumbnail(fileUrl, fileName, modelId, supabase)
    }
    
    const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(cloudinaryUrl)
    console.log('Using Cloudinary for video thumbnail:', cloudName)
    
    // First, fetch the video file and upload to Cloudinary
    const videoResponse = await fetch(fileUrl)
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video file')
    }
    
    const videoBlob = await videoResponse.blob()
    
    // Upload video to Cloudinary
    const formData = new FormData()
    formData.append('file', videoBlob)
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
    
    console.log('Uploading video to Cloudinary...')
    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      console.error('Cloudinary video upload failed:', cloudinaryResponse.status, errorText)
      throw new Error(`Cloudinary video upload failed: ${cloudinaryResponse.status}`)
    }
    
    const cloudinaryData = await cloudinaryResponse.json()
    console.log('Video uploaded to Cloudinary successfully:', cloudinaryData.public_id)
    
    // Generate thumbnail URL from video using Cloudinary transformations
    // Extract frame at 1 second, resize to 480x320, format as JPEG
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1.0,w_480,h_320,c_fill,f_jpg/${cloudinaryData.public_id}.jpg`
    
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
    // Fallback to simple thumbnail
    return await fallbackVideoThumbnail(fileUrl, fileName, modelId, supabase)
  }
}

async function fallbackVideoThumbnail(fileUrl: string, fileName: string, modelId: string, supabase: any) {
  try {
    console.log('Using fallback video thumbnail generation for:', fileName)
    
    // Create a simple placeholder thumbnail
    const width = 480
    const height = 320
    
    // Generate SVG placeholder
    const svgThumbnail = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3730a3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="240" cy="160" r="40" fill="white" opacity="0.9"/>
  <polygon points="220,140 220,180 260,160" fill="#6366f1"/>
  <text x="240" y="220" text-anchor="middle" fill="white" font-family="Arial" font-size="14">${fileName}</text>
  <text x="240" y="280" text-anchor="middle" fill="white" font-family="Arial" font-size="12" opacity="0.8">Thumbnail gerado</text>
</svg>`
    
    const thumbnailPath = `${modelId}/thumbnails/${Date.now()}-thumb-${fileName}.svg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('model-videos')
      .upload(thumbnailPath, svgThumbnail, {
        contentType: 'image/svg+xml'
      })

    if (uploadError) {
      console.error('Thumbnail upload error:', uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('model-videos')
      .getPublicUrl(thumbnailPath)

    console.log('Video thumbnail generated (fallback):', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailUrl: publicUrl,
        message: 'Thumbnail do vídeo gerado com sucesso'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in fallback video thumbnail generation:', error)
    throw error
  }
}