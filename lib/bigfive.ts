export const bigFiveQuestions = [
  { id: "o1", trait: "openness", text: "J’aime explorer des idées nouvelles." },
  { id: "o2", trait: "openness", text: "Je suis curieux face à ce qui sort de l’ordinaire." },

  { id: "c1", trait: "conscientiousness", text: "Je suis organisé dans ce que je fais." },
  { id: "c2", trait: "conscientiousness", text: "Je termine généralement ce que je commence." },

  { id: "e1", trait: "extraversion", text: "Je me sens énergisé au contact des autres." },
  { id: "e2", trait: "extraversion", text: "Je prends facilement la parole dans un groupe." },

  { id: "a1", trait: "agreeableness", text: "Je fais facilement preuve d’empathie." },
  { id: "a2", trait: "agreeableness", text: "Je cherche souvent à éviter les conflits." },

  { id: "n1", trait: "neuroticism", text: "Je me sens souvent stressé ou tendu." },
  { id: "n2", trait: "neuroticism", text: "Je suis facilement affecté émotionnellement." },
] as const;

export function computeBigFiveScores(
  answers: Record<string, number>
) {
  const sums = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  const counts = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  for (const q of bigFiveQuestions) {
    const value = answers[q.id] ?? 0;
    sums[q.trait] += value;
    counts[q.trait] += 1;
  }

  const normalize = (sum: number, count: number) => {
    if (!count) return 0;
    return Math.round((sum / (count * 5)) * 100);
  };

  return {
    openness: normalize(sums.openness, counts.openness),
    conscientiousness: normalize(sums.conscientiousness, counts.conscientiousness),
    extraversion: normalize(sums.extraversion, counts.extraversion),
    agreeableness: normalize(sums.agreeableness, counts.agreeableness),
    neuroticism: normalize(sums.neuroticism, counts.neuroticism),
  };
}