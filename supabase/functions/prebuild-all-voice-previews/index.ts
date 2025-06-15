
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

const voiceIntros: Record<string, string> = {
  'alloy': 'Hi, I am Alloy, a neutral and balanced voice.',
  'echo': 'Hi, I am Echo, a warm and friendly voice.',
  'fable': 'Hi, I am Fable, an expressive and dynamic voice.',
  'onyx': 'Hi, I am Onyx, a deep and resonant voice.',
  'nova': 'Hi, I am Nova, a bright and energetic voice.',
  'shimmer': 'Hi, I am Shimmer, a gentle and soothing voice.'
};

const voices = Object.keys(voiceIntros);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const results: Record<string, string> = {};
    for (const voice of voices) {
      const filename = `${voice}-preview.mp3`;

      // Check if already exists in storage
      const { data: existingFile } = await supabase.storage
        .from('voice-previews')
        .list('', { search: filename });

      if (existingFile && existingFile.length > 0) {
        const { data } = supabase.storage
          .from('voice-previews')
          .getPublicUrl(filename);
        results[voice] = data.publicUrl;
        continue;
      }

      // Generate from OpenAI
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: voiceIntros[voice],
          voice,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        results[voice] = `ERROR: Could not generate audio (${response.status})`;
        continue;
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Uint8Array(audioBuffer);

      // Upload to storage
      const { error } = await supabase.storage
        .from('voice-previews')
        .upload(filename, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (error) {
        results[voice] = `ERROR: Upload failed (${error.message})`;
        continue;
      }

      const { data } = supabase.storage
        .from('voice-previews')
        .getPublicUrl(filename);
      results[voice] = data.publicUrl;
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
