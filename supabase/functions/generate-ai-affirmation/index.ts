
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

The script must follow this EXACT structure with natural breaks and smooth transitions:

1. **Greeting and Empowerment:** Start by addressing the user by their name and acknowledging their mood supportively. Use warm, encouraging language.

2. **You Are Affirmations:** Create 3-4 affirmations describing the user as already achieving their goal. Use "You, ${name}, are..." or "${name}, you are..." phrasing. Make these emotionally resonant and specific to their goal.

3. **Smooth Transition:** Create a natural bridge from "You are" to "I am" with phrases like:
   - "Now, let these truths become your own inner voice..."
   - "Feel these words flowing through you as your own truth..."
   - "Take a deep breath, and let these affirmations become yours..."
   - "Now, repeat after me, and let these powerful truths become your reality..."

4. **I Am Statements:** Provide 4-6 powerful "I am" statements in first person. These should be:
   - Present-tense and positive
   - Emotionally compelling
   - Directly related to the goal
   - Progressively building in power

5. **Integration of Custom Affirmations:** If provided, weave custom affirmations naturally throughout the script, converting them to match the current section's perspective.

6. **Powerful Closing:** End with a calming, reassuring statement that helps anchor the affirmations, such as:
   - "Take a deep breath and feel these truths resonating within your soul."
   - "Let these affirmations flow through every cell of your being."

IMPORTANT FORMATTING RULES:
- Use natural pauses indicated by "..." (ellipses) for breathing space
- Add paragraph breaks between major sections
- The tone should be inspiring, soothing, and deeply personal
- Make it sound like a guided meditation script, not a list
- Include gentle breathing cues where appropriate
- The transition from "You" to "I" should feel seamless and natural`;

    const userPrompt = `
User Details:
- Name: ${name}
- Goal: ${goal}
- Current Mood: ${mood}
- Custom Affirmations to include: ${customAffirmations || 'None'}

Create a manifestation script that follows the structure above, with smooth transitions and natural breaks for optimal audio delivery.`;

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
