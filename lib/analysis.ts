export type ComparisonCard = {
  name: string;
  aura: string;
  why: string;
  differs?: string;
};

export type AnalysisDimension = {
  key:
    | "analyse_logique"
    | "vision_strategique"
    | "creativite_utile"
    | "exigence_perfectionnisme"
    | "tolerance_incertitude"
    | "energie_action"
    | "lecture_sociale"
    | "besoin_controle"
    | "besoin_sens"
    | "sensibilite_emotionnelle";
  label: string;
  score: number;
  confidence: number;
  explanation: string;
};

export type AnalysisResult = {
  id?: string;
  title: string;
  summary: string;
  confidence: number;
  analysisEngine?: "gemini" | "heuristic";
  dimensions: AnalysisDimension[];
  tensions: string[];
  highlights: string[];
  sourceStats: {
    characterCount: number;
    wordCount: number;
    estimatedMessages: number;
  };
  fictionalComparisons?: ComparisonCard[];
  publicFigureComparisons?: ComparisonCard[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function countMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce((total, pattern) => {
    const matches = text.match(pattern);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function boundedCount(text: string, patterns: RegExp[], max = 6) {
  return Math.min(countMatches(text, patterns), max);
}

function computeScore(
  positive: number,
  negative: number,
  options?: {
    base?: number;
    posWeight?: number;
    negWeight?: number;
    min?: number;
    max?: number;
  }
) {
  const base = options?.base ?? 50;
  const posWeight = options?.posWeight ?? 5;
  const negWeight = options?.negWeight ?? 4;
  const min = options?.min ?? 28;
  const max = options?.max ?? 86;

  const raw = base + positive * posWeight - negative * negWeight;
  return Math.round(clamp(raw, min, max));
}

function confidenceFromText(wordCount: number) {
  if (wordCount < 300) return 42;
  if (wordCount < 1000) return 56;
  if (wordCount < 3000) return 68;
  if (wordCount < 7000) return 76;
  return 82;
}

export function heuristicAnalysis(text: string): AnalysisResult {
  const safeText = text || "";
  const lower = safeText.toLowerCase();

  const wordCount = safeText.trim() ? safeText.trim().split(/\s+/).length : 0;
  const characterCount = safeText.length;
  const estimatedMessages = Math.max(1, Math.round(wordCount / 120));
  const globalConfidence = confidenceFromText(wordCount);

  const analysisSignals = boundedCount(lower, [
    /\b(analyse|analyser|analytique|logique|structure|structurer|raisonnement)\b/g,
    /\b(probl[eè]me|variable|mod[eè]le|m[ée]thode|hypoth[eè]se|donn[ée]e?s?)\b/g,
    /\b(pr[ée]cis|pr[ée]cision|coh[ée]rence|rigueur)\b/g
  ]);

  const strategySignals = boundedCount(lower, [
    /\b(strat[ée]gie|strat[ée]gique|vision|positionnement|impact)\b/g,
    /\b(plan|[ée]tape|roadmap|lancement|mvp|priorit[ée])\b/g,
    /\b(projet|ex[ée]cution|convaincre|business)\b/g
  ]);

  const creativitySignals = boundedCount(
    lower,
    [
      /\b(cr[ée]atif|cr[ée]ativit[ée]|id[ée]e?s?|concept|angle)\b/g,
      /\b(design|visuel|identit[ée]|moodboard|canva|gamma)\b/g
    ],
    5
  );

  const perfectionismSignals = boundedCount(lower, [
    /\b(propre|net|juste|coh[ée]rent|cr[ée]dible|quali)\b/g,
    /\b(corrige|corriger|reformule|am[ée]liore|mieux)\b/g,
    /\b(faut pas|pas faux|pas faire ia|authentique)\b/g
  ]);

  const uncertaintySignals = boundedCount(
    lower,
    [
      /\b(peut-[êe]tre|j[’']?h[ée]site|je ne sais pas|pas s[uû]r|incertain)\b/g,
      /\b(tu penses|est-ce que|possible|probablement)\b/g
    ],
    5
  );

  const actionSignals = boundedCount(
    lower,
    [
      /\b(on fonce|vas-y|allez|go|commence|coder|faire|build)\b/g,
      /\b(concret|maintenant|directement|vite|avancer)\b/g
    ],
    5
  );

  const socialSignals = boundedCount(
    lower,
    [
      /\b(jury|groupe|[ée]quipe|client|public|convaincre)\b/g,
      /\b(adapter|adapter le discours|profil|persona|personne)\b/g,
      /\b(comment il sera per[cç]u|comment parler)\b/g
    ],
    5
  );

  const controlSignals = boundedCount(lower, [
    /\b(exact|exactement|pr[ée]cis|cadre|structure|ma[iî]trise)\b/g,
    /\b(je veux|il faut|directement|proprement)\b/g,
    /\b(format|version|fichier|arborescence)\b/g
  ]);

  const meaningSignals = boundedCount(
    lower,
    [
      /\b(sens|authentique|vrai|juste|me ressemble|coh[ée]rent)\b/g,
      /\b(pas faux|pas creux|pas g[ée]n[ée]rique)\b/g
    ],
    5
  );

  const emotionalSignals = boundedCount(
    lower,
    [
      /\b(j'adore|chaud|agace|frustr|stress|pression|envie)\b/g,
      /\b(peur|doute|fatigu|saoule|gal[eè]re)\b/g,
      /\b(kiff|plaisir|enthousiasme)\b/g
    ],
    5
  );

  const dimensions: AnalysisDimension[] = [
    {
      key: "analyse_logique",
      label: "Analyse / logique",
      score: computeScore(analysisSignals, 0, { base: 54, max: 84 }),
      confidence: globalConfidence,
      explanation:
        "Le corpus montre une tendance à structurer les problèmes, préciser les termes et chercher des raisonnements solides."
    },
    {
      key: "vision_strategique",
      label: "Vision stratégique",
      score: computeScore(strategySignals, 0, { base: 53, max: 85 }),
      confidence: globalConfidence,
      explanation:
        "Les échanges laissent voir une projection vers l’exécution, le positionnement et les prochaines étapes."
    },
    {
      key: "creativite_utile",
      label: "Créativité utile",
      score: computeScore(creativitySignals, 1, { base: 50, max: 80 }),
      confidence: globalConfidence - 4,
      explanation:
        "La créativité semble surtout mobilisée pour renforcer une idée, un rendu ou une proposition concrète."
    },
    {
      key: "exigence_perfectionnisme",
      label: "Exigence / perfectionnisme",
      score: computeScore(perfectionismSignals, 0, { base: 56, max: 86 }),
      confidence: globalConfidence,
      explanation:
        "De nombreuses reformulations et demandes de précision suggèrent une exigence marquée sur la qualité finale."
    },
    {
      key: "tolerance_incertitude",
      label: "Tolérance à l’incertitude",
      score: computeScore(1, uncertaintySignals, {
        base: 58,
        posWeight: 2,
        negWeight: 5,
        min: 30,
        max: 78
      }),
      confidence: globalConfidence - 6,
      explanation:
        "Le rapport au flou semble plutôt mesuré : il existe une capacité à explorer, mais avec un besoin assez net de clarifier rapidement."
    },
    {
      key: "energie_action",
      label: "Énergie d’action",
      score: computeScore(actionSignals, 0, { base: 52, max: 82 }),
      confidence: globalConfidence - 2,
      explanation:
        "Le langage suggère une orientation vers l’avancement concret, avec une préférence pour les prochaines actions claires."
    },
    {
      key: "lecture_sociale",
      label: "Lecture sociale",
      score: computeScore(socialSignals, 0, { base: 49, max: 78 }),
      confidence: globalConfidence - 5,
      explanation:
        "On perçoit une attention aux interlocuteurs, aux publics et à la manière d’adapter le discours."
    },
    {
      key: "besoin_controle",
      label: "Besoin de contrôle",
      score: computeScore(controlSignals, 0, { base: 55, max: 85 }),
      confidence: globalConfidence,
      explanation:
        "Le corpus reflète un besoin de cadrer, préciser et maîtriser la forme comme le fond."
    },
    {
      key: "besoin_sens",
      label: "Besoin de sens / authenticité",
      score: computeScore(meaningSignals, 0, { base: 52, max: 81 }),
      confidence: globalConfidence - 3,
      explanation:
        "Les formulations montrent une sensibilité à l’authenticité, à la justesse du ton et à la cohérence personnelle."
    },
    {
      key: "sensibilite_emotionnelle",
      label: "Sensibilité émotionnelle exprimée",
      score: computeScore(emotionalSignals, 1, { base: 48, max: 76 }),
      confidence: globalConfidence - 7,
      explanation:
        "Le texte contient des marqueurs affectifs et d’intensité, sans pour autant permettre une lecture clinique."
    }
  ];

  const tensions: string[] = [];

  const perfectionism =
    dimensions.find((d) => d.key === "exigence_perfectionnisme")?.score ?? 50;
  const action = dimensions.find((d) => d.key === "energie_action")?.score ?? 50;
  const control = dimensions.find((d) => d.key === "besoin_controle")?.score ?? 50;
  const meaning = dimensions.find((d) => d.key === "besoin_sens")?.score ?? 50;
  const uncertaintyTolerance =
    dimensions.find((d) => d.key === "tolerance_incertitude")?.score ?? 50;

  if (perfectionism >= 70 && action >= 65) {
    tensions.push(
      "Volonté d’avancer vite, mais avec une exigence de qualité qui peut ralentir la satisfaction finale."
    );
  }

  if (control >= 70 && uncertaintyTolerance <= 45) {
    tensions.push(
      "Besoin marqué de maîtrise, avec un inconfort probable quand le cadre reste trop flou."
    );
  }

  if (meaning >= 68 && perfectionism >= 68) {
    tensions.push(
      "Recherche d’authenticité et de justesse, qui peut rendre les rendus génériques rapidement insatisfaisants."
    );
  }

  if (!tensions.length) {
    tensions.push(
      "Le corpus suggère quelques tensions ordinaires entre envie d’avancer, besoin de précision et recherche de cohérence."
    );
  }

  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const highlights = [
    `Dominante probable : ${sorted[0].label.toLowerCase()}.`,
    `Dimension secondaire marquée : ${sorted[1].label.toLowerCase()}.`,
    `Le niveau de confiance reste modéré : il décrit une expression écrite, pas la personne entière.`
  ];

  const summary =
    "Le corpus laisse apparaître un profil plutôt structuré et orienté vers l’action, avec une exigence sensible sur la qualité, la cohérence et la maîtrise du rendu. Les scores proposés décrivent des tendances exprimées dans le langage, avec prudence.";

  return {
    title: "Portrait de personnalité exprimée",
    summary,
    confidence: globalConfidence,
    analysisEngine: "heuristic",
    dimensions,
    tensions,
    highlights,
    sourceStats: {
      characterCount,
      wordCount,
      estimatedMessages
    },
    fictionalComparisons: [],
    publicFigureComparisons: []
  };
}