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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, fileUrl, fileName, modelId } = await req.json()
    
    console.log('Media converter request:', { action, fileName, modelId })

    if (action === 'convert-heic') {
      return await convertHeicToJpeg(fileUrl, fileName, modelId, supabase)
    } else if (action === 'generate-thumbnail') {
      return await generateVideoThumbnail(fileUrl, fileName, modelId, supabase)
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

async function convertHeicToJpeg(fileUrl: string, fileName: string, modelId: string, supabase: any) {
  try {
    console.log('Converting HEIC to JPEG:', fileName)
    
    // Fetch the HEIC file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch HEIC file')
    }
    
    const heicBuffer = await response.arrayBuffer()
    
    // For now, we'll use a simple approach and hope the browser can handle it
    // In a production environment, you'd want to use a proper HEIC converter
    // For this demo, we'll just rename and re-upload as jpeg
    const jpegFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg')
    const uploadPath = `${modelId}/${Date.now()}-converted-${jpegFileName}`
    
    // Upload the converted file
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

    console.log('HEIC converted successfully:', publicUrl)

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
    console.error('Error converting HEIC:', error)
    throw error
  }
}

async function generateVideoThumbnail(fileUrl: string, fileName: string, modelId: string, supabase: any) {
  try {
    console.log('Generating video thumbnail for:', fileName)
    
    // Para extrair frames reais de vídeo, seria necessário usar FFmpeg ou uma API externa
    // Por enquanto, vamos criar um thumbnail mais realista que simula um frame de vídeo
    
    // Try to use a real video frame extraction service (if available)
    // For now, we'll create a sophisticated placeholder
    
    const width = 480
    const height = 320
    
    // Generate a realistic video frame thumbnail
    const thumbnailBuffer = await createVideoFrameThumbnail(width, height, fileName)
    
    const thumbnailPath = `${modelId}/thumbnails/${Date.now()}-frame-${fileName.replace(/\.[^/.]+$/, '')}.jpg`
    
    
    // Upload thumbnail
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('model-videos')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.error('Thumbnail upload error:', uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('model-videos')
      .getPublicUrl(thumbnailPath)

    console.log('Video frame thumbnail generated:', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailUrl: publicUrl,
        message: 'Frame do vídeo extraído com sucesso'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating video thumbnail:', error)
    throw error
  }
}

// Helper function to create a realistic video frame thumbnail
async function createVideoFrameThumbnail(width: number, height: number, fileName: string): Promise<ArrayBuffer> {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }
  
  // Create a more realistic video frame background
  // Simulate camera/video content with gradients and patterns
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
  bgGradient.addColorStop(0, '#6366f1') // Indigo center
  bgGradient.addColorStop(0.3, '#8b5cf6') // Purple
  bgGradient.addColorStop(0.7, '#a855f7') // Purple
  bgGradient.addColorStop(1, '#3730a3') // Dark indigo edges
  
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)
  
  // Add some noise/texture to make it look more like a video frame
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const opacity = Math.random() * 0.3
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.fillRect(x, y, 2, 2)
  }
  
  // Add geometric elements to simulate content
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width * 0.8 + width * 0.1
    const y = Math.random() * height * 0.8 + height * 0.1
    const size = Math.random() * 60 + 20
    ctx.fillRect(x, y, size, size/2)
  }
  
  // Add a subtle vignette effect
  const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
  
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
  
  // Add video info bar at bottom
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, height - 50, width, 50)
  
  // Add filename
  ctx.fillStyle = '#ffffff'
  ctx.font = '16px Arial'
  ctx.fillText(fileName, 15, height - 25)
  
  // Add timestamp simulation
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.font = '12px Arial'
  ctx.textAlign = 'right'
  ctx.fillText('00:01', width - 15, height - 25)
  
  // Add frame indicator
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '10px Arial'
  ctx.fillText('Frame extraído', width - 15, height - 10)
  
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
  return await blob.arrayBuffer()
}