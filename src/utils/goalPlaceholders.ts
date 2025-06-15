
export interface GoalPlaceholderMap {
  [theme: string]: {
    [moodIndex: number]: string;
  };
}

export const goalPlaceholders: GoalPlaceholderMap = {
  wealth: {
    0: "Even though I feel unsure, I trust I'm moving toward financial independence.",
    1: "I'm open to receiving financial stability and peace.",
    2: "I believe new income opportunities are opening for me now.",
    3: "I am ready to welcome wealth and abundance into my life.",
    4: "I am a magnet for financial prosperity and success."
  },
  love: {
    0: "Though I've felt unsure in love, I'm open to safe and loving relationships.",
    1: "I am preparing my heart for meaningful connection.",
    2: "I believe love is gently making its way to me.",
    3: "I am ready to experience deep, joyful connection.",
    4: "Love flows to me freely, and I welcome it fully."
  },
  confidence: {
    0: "Even with doubt, I am learning to trust myself more each day.",
    1: "I want to build strength and believe in my worth.",
    2: "I am growing into my confidence, one step at a time.",
    3: "I believe in my inner power and potential.",
    4: "I show up fully, confidently, and unapologetically as myself."
  },
  peace: {
    0: "Even amidst stress, I'm finding my path to inner calm.",
    1: "I want to feel more grounded and emotionally balanced.",
    2: "Peace is returning to me more and more each day.",
    3: "I feel calm, centered, and at ease.",
    4: "I live in harmony with my thoughts and emotions."
  },
  health: {
    0: "I may not feel my best now, but I trust my body knows how to heal.",
    1: "I want to feel more energy and balance in my body.",
    2: "Each day I'm getting stronger and healthier.",
    3: "I feel vibrant and energized in my body.",
    4: "Health flows through every cell of my being."
  },
  career: {
    0: "I'm unclear now, but I believe my dream career is unfolding for me.",
    1: "I want more direction and fulfillment in my work.",
    2: "Exciting new career opportunities are opening for me.",
    3: "I feel proud of the growth and success I'm creating.",
    4: "I am thriving in a career that aligns with my purpose."
  },
  custom: {
    0: "Even though I'm figuring things out, I know what I want is possible.",
    1: "I'm ready to create something meaningful in my life.",
    2: "I believe beautiful changes are coming my way.",
    3: "I'm excited to take bold steps toward my vision.",
    4: "My path is clear and I'm creating the life I dream of."
  }
};

export const getGoalPlaceholder = (selectedGoal: string, moodIndex: number | null): string => {
  if (moodIndex === null) {
    return "I want to manifest...";
  }
  
  const theme = selectedGoal || 'custom';
  return goalPlaceholders[theme]?.[moodIndex] || "I want to manifest...";
};
