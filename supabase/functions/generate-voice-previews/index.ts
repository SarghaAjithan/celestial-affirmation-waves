
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { voice } = await req.json();
    
    if (!voice) {
      throw new Error('Voice parameter is required');
    }

    console.log('Generating voice preview for:', voice);

    // Voice-specific introduction text
    const voiceIntros = {
      'alloy': 'Hi, I am Alloy, a neutral and balanced voice.',
      'echo': 'Hi, I am Echo, a warm and friendly voice.',
      'fable': 'Hi, I am Fable, an expressive and dynamic voice.',
      'onyx': 'Hi, I am Onyx, a deep and resonant voice.',
      'nova': 'Hi, I am Nova, a bright and energetic voice.',
      'shimmer': 'Hi, I am Shimmer, a gentle and soothing voice.'
    };

    const introText = voiceIntros[voice as keyof typeof voiceIntros] || `Hi, I am ${voice}.`;

    // Check if preview already exists
    const { data: existingFile } = await supabase.storage
      .from('voice-previews')
      .list('', { search: `${voice}-preview.mp3` });

    if (existingFile && existingFile.length > 0) {
      console.log('Voice preview already exists for:', voice);
      const { data } = supabase.storage
        .from('voice-previews')
        .getPublicUrl(`${voice}-preview.mp3`);
      
      return new Response(JSON.stringify({ url: data.publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate audio using OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: introText,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Uint8Array(audioBuffer);

    console.log('Audio generated, size:', audioBlob.length);

    // Upload to Supabase storage
    const filename = `${voice}-preview.mp3`;
    const { data, error } = await supabase.storage
      .from('voice-previews')
      .upload(filename, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('voice-previews')
      .getPublicUrl(filename);

    console.log('Public URL generated:', urlData.publicUrl);

    return new Response(JSON.stringify({ url: urlData.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-voice-previews function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
