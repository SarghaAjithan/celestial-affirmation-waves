
export function getGoalText(goalId: string): string {
  const goalTexts = {
    wealth: 'I want to manifest financial abundance and prosperity in my life',
    love: 'I want to attract meaningful love and deep connections',
    confidence: 'I want to build unshakeable confidence and self-worth',
    peace: 'I want to cultivate inner peace and emotional balance',
    health: 'I want to manifest vibrant health and vitality',
    career: 'I want to achieve career growth and professional fulfillment',
    custom: 'I want to create my own unique manifestation'
  };
  return goalTexts[goalId as keyof typeof goalTexts] || '';
}

export function createPersonalizedAffirmationText(
  name: string,
  goal: string,
  customAffirmations: string,
  goalType: string
): string {
  const personalizedGreetings = {
    wealth: `${name}, you are a magnet for abundance and prosperity`,
    love: `${name}, you are worthy of deep, meaningful love`,
    confidence: `${name}, you radiate confidence and inner strength`,
    peace: `${name}, you are a beacon of calm and tranquility`,
    health: `${name}, your body is vibrant and full of life`,
    career: `${name}, you are destined for professional success`,
    custom: `${name}, you are a powerful creator of your reality`
  };

  const goalSpecificAffirmations = {
    wealth: [
      'Money flows to me easily and effortlessly',
      'I am open to receiving abundance from multiple sources',
      'My financial situation improves every day',
      'I make wise decisions that increase my wealth'
    ],
    love: [
      'I attract loving, supportive relationships into my life',
      'I am open to giving and receiving love freely',
      'The perfect partner is drawn to my authentic self',
      'I radiate love and attract love in return'
    ],
    confidence: [
      'I trust my abilities and believe in myself completely',
      'I speak my truth with courage and conviction',
      'I am comfortable being my authentic self',
      'My confidence grows stronger each day'
    ],
    peace: [
      'I am calm and centered in all situations',
      'Peace flows through every aspect of my life',
      'I release stress and embrace tranquility',
      'I find serenity in the present moment'
    ],
    health: [
      'My body heals and regenerates perfectly',
      'I make choices that support my optimal health',
      'Energy and vitality flow through every cell',
      'I am grateful for my strong, healthy body'
    ],
    career: [
      'Opportunities for growth come to me naturally',
      'I excel in my chosen field and am recognized for my talents',
      'My career brings me fulfillment and financial reward',
      'I am a valuable contributor to my workplace'
    ],
    custom: [
      'I have the power to create any reality I desire',
      'The universe supports my highest good',
      'I am aligned with my true purpose',
      'Miracles happen in my life regularly'
    ]
  };

  const greeting = personalizedGreetings[goalType as keyof typeof personalizedGreetings] || personalizedGreetings.custom;
  const specificAffirmations = goalSpecificAffirmations[goalType as keyof typeof goalSpecificAffirmations] || goalSpecificAffirmations.custom;

  // Create personalized goal statement
  const goalStatement = goal.toLowerCase().replace('i want to', 'I am').replace('i', 'I');

  const allAffirmations = [goalStatement, ...specificAffirmations];

  if (customAffirmations) {
    allAffirmations.push(...customAffirmations.split('\n').filter(a => a.trim()));
  }

  return `${greeting}. ${allAffirmations.join('. ')}. Take a deep breath and feel these truths resonating within your soul.`;
}
