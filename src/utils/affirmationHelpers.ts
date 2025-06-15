
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
