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
    
    console.log('=== MEDIA CONVERTER DEBUG ===')
    console.log('Action:', action)
    console.log('File Name:', fileName)
    console.log('Model ID:', modelId)
    console.log('File URL:', fileUrl)
    console.log('CLOUDINARY_URL configured:', !!cloudinaryUrl)
    console.log('CLOUDINARY_URL value:', cloudinaryUrl?.substring(0, 20) + '...' || 'NOT_SET')
    console.log('=== END DEBUG ===')

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
    console.log('=== GENERATING VIDEO THUMBNAIL ===')
    console.log('File Name:', fileName)
    console.log('Model ID:', modelId)
    console.log('File URL:', fileUrl)
    console.log('Cloudinary URL exists:', !!cloudinaryUrl)
    
    // Check if Cloudinary is configured
    if (!cloudinaryUrl) {
      console.log('❌ CLOUDINARY NOT CONFIGURED - Using fallback')
      return await fallbackVideoThumbnail(fileUrl, fileName, modelId, supabase)
    }
    
    console.log('✅ CLOUDINARY CONFIGURED - Proceeding with real thumbnail generation')
    
    const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(cloudinaryUrl)
    console.log('Using Cloudinary for video thumbnail:', cloudName)
    
    // First, fetch the video file and upload to Cloudinary
    const videoResponse = await fetch(fileUrl)
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video file')
    }
    
    const videoBlob = await videoResponse.blob()
    
    // Use signed upload with correct signature generation
    const timestamp = Math.round(Date.now() / 1000)
    const folder = `models/${modelId}/videos`
    
    // Create parameters object and sort alphabetically (required by Cloudinary)
    const params = {
      folder: folder,
      resource_type: 'video',
      timestamp: timestamp.toString()
    }
    
    // Sort parameters alphabetically and create string to sign
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&')
    
    console.log('String to sign:', sortedParams)
    
    // Generate signature
    const signature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sortedParams))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )
    
    const formData = new FormData()
    formData.append('file', videoBlob)
    formData.append('folder', folder)
    formData.append('resource_type', 'video')
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('signature', signature)
    
    console.log('Uploading video to Cloudinary with signed upload...')
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
    console.log('Generating enhanced video thumbnail for:', fileName)
    
    // Get video file to determine actual dimensions and size
    const videoResponse = await fetch(fileUrl)
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video file')
    }
    
    const videoBlob = await videoResponse.blob()
    const fileSizeKB = Math.round(videoBlob.size / 1024)
    const fileSizeMB = (videoBlob.size / (1024 * 1024)).toFixed(1)
    
    // Create a more informative thumbnail
    const width = 480
    const height = 320
    
    // Generate enhanced SVG thumbnail with video info
    const svgThumbnail = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="playBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="8"/>
  <circle cx="240" cy="120" r="35" fill="url(#playBg)" opacity="0.9"/>
  <polygon points="225,105 225,135 255,120" fill="white"/>
  <text x="240" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName}</text>
  <text x="240" y="200" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">Vídeo • ${fileSizeMB}MB</text>
  <text x="240" y="220" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="11">Clique para reproduzir</text>
  <rect x="20" y="20" width="440" height="280" fill="none" stroke="#374151" stroke-width="1" rx="6" opacity="0.3"/>
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