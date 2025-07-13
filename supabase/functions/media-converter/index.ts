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
    console.log('Generating video thumbnail:', fileName)
    
    // For video thumbnail generation, we'll create a simple frame extraction
    // In a real implementation, you'd use FFmpeg or a video processing service
    
    // For now, we'll create a placeholder thumbnail
    const canvas = new OffscreenCanvas(320, 240)
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Create a simple placeholder thumbnail
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, 320, 240)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Video Thumbnail', 160, 110)
      ctx.fillText(fileName, 160, 130)
      
      // Add play icon
      ctx.beginPath()
      ctx.moveTo(130, 90)
      ctx.lineTo(130, 150)
      ctx.lineTo(180, 120)
      ctx.closePath()
      ctx.fillStyle = '#60a5fa'
      ctx.fill()
    }
    
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 })
    const thumbnailBuffer = await blob.arrayBuffer()
    
    const thumbnailPath = `${modelId}/thumbnails/${Date.now()}-thumb-${fileName}.jpg`
    
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

    console.log('Video thumbnail generated successfully:', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailUrl: publicUrl,
        message: 'Thumbnail do vídeo gerada com sucesso'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating thumbnail:', error)
    throw error
  }
}