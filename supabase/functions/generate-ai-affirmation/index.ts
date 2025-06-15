
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, goal, customAffirmations, mood } = await req.json();

    if (!name || !goal) {
      return new Response(JSON.stringify({ error: 'Name and goal are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert in writing powerful, transformative manifestation scripts. Your task is to create a personalized affirmation script for a user based on the details they provide.

The script must follow this structure:

1.  **Greeting and Empowerment:** Start by addressing the user by their name and empowering them. Acknowledge their current mood in a supportive way if it's low, and celebrate it if it's high.
2.  **Affirmations (You are...):** Create a few affirmations that describe the user as already achieving their goal. Use "You, ${name}, are..." or similar phrasing.
3.  **Transition to "I am":** Smoothly transition the narrative from "You are" to "I am". This is a critical step to help the user internalize the affirmations.
4.  **"I am" Statements:** Provide a series of powerful "I am" statements related to the goal. These should be present-tense, positive, and emotionally resonant.
5.  **Integration of Custom Affirmations:** If the user provided custom affirmations, weave them naturally into the script.
6.  **Closing:** End with a powerful, calming, and reassuring statement. For example: "Take a deep breath and feel these truths resonating within your soul."

The tone should be inspiring, soothing, and deeply personal. The final text should be a single block of text, not a numbered list. It should sound like a guided meditation script.`;

    const userPrompt = `
User Details:
- Name: ${name}
- Goal: ${goal}
- Current Mood: ${mood}
- Custom Affirmations to include: ${customAffirmations || 'None'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        throw new Error('Failed to get response from OpenAI.');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-affirmation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
