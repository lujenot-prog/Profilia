import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { heuristicAnalysis, type AnalysisResult } from "@/lib/analysis";

type ComparisonCard = {
  name: string;
  aura: string;
  why: string;
  differs?: string;
};

type AIRefinement = {
  title?: string;
  summary?: string;
  confidence?: number;
  dimensions?: {
    key: string;
    label: string;
    score: number;
    confidence: number;
    explanation: string;
  }[];
  tensions?: string[];
  highlights?: string[];
  fictionalComparisons?: ComparisonCard[];
  publicFigureComparisons?: ComparisonCard[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function extractJsonString(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function safeParseRefinement(raw: string): AIRefinement | null {
  try {
    return JSON.parse(extractJsonString(raw)) as AIRefinement;
  } catch (error) {
    console.error("GEMINI JSON parse failed:", error);
    console.error("RAW GEMINI OUTPUT:", raw);
    return null;
  }
}

function fallbackComparisons(base: AnalysisResult) {
  const get = (key: string) => base.dimensions.find((d) => d.key === key)?.score ?? 50;

  const analyse = get("analyse_logique");
  const strategy = get("vision_strategique");
  const exigence = get("exigence_perfectionnisme");
  const control = get("besoin_controle");
  const meaning = get("besoin_sens");
  const uncertainty = get("tolerance_incertitude");
  const creativity = get("creativite_utile");
  const social = get("lecture_sociale");

  const fictional: ComparisonCard[] = [];
  const publicFigures: ComparisonCard[] = [];

  if (analyse >= 75 && control >= 72) {
    fictional.push({
      name: "Sherlock Holmes",
      aura: "Lecture fine + structure mentale",
      why: "Le profil évoque quelqu’un qui dissèque, précise et cherche à faire tenir les choses debout.",
      differs:
        "Ici, le style semble plus orienté projet concret et exécution que pure déduction distante."
    });
  }

  if (analyse >= 76 && exigence >= 78 && uncertainty <= 48) {
    fictional.push({
      name: "Beth Harmon",
      aura: "Exigence + précision",
      why: "On retrouve une combinaison de rigueur, d’intensité et de faible tolérance à l’approximation.",
      differs:
        "Le profil analysé paraît plus stratégique dans la coordination et plus attentif à la présentation finale."
    });
  }

  if (!fictional.length) {
    fictional.push({
      name: "Le stratège calme",
      aura: "Archétype narratif",
      why: "Le profil évoque quelqu’un qui préfère comprendre les ressorts d’un système avant de pousser l’action.",
      differs:
        "Cette image reste volontairement large et ne capture pas toute la singularité du corpus."
    });
  }

  if (strategy >= 76 && exigence >= 76) {
    publicFigures.push({
      name: "Steve Jobs",
      aura: "Vision + exigence du rendu",
      why: "On retrouve une sensibilité à la cohérence du résultat, au positionnement et à la qualité perçue.",
      differs:
        "Le profil ici semble plus analytique dans la formulation et moins centré sur la posture de rupture charismatique."
    });
  }

  if (meaning >= 70 && creativity >= 66 && social >= 62) {
    publicFigures.push({
      name: "Virgil Abloh",
      aura: "Vision + identité",
      why: "Le profil rappelle une manière de relier direction, esthétique et intention.",
      differs:
        "Ici, la dimension structurante et logique paraît plus marquée que chez une figure purement créative."
    });
  }

  if (!publicFigures.length) {
    publicFigures.push({
      name: "Fondateur analytique",
      aura: "Archétype réel",
      why: "Le profil rappelle quelqu’un qui aime penser loin, cadrer fort et exiger un rendu crédible.",
      differs:
        "Cette comparaison reste volontairement générique et sert surtout de repère de style."
    });
  }

  return {
    fictional: fictional.slice(0, 2),
    publicFigures: publicFigures.slice(0, 2)
  };
}

function mergeAnalysis(base: AnalysisResult, refined: AIRefinement): AnalysisResult {
  const mergedDimensions = base.dimensions.map((baseDim) => {
    const aiDim = refined.dimensions?.find((d) => d.key === baseDim.key);
    if (!aiDim) return baseDim;

    return {
      ...baseDim,
      score: clamp(Math.round(baseDim.score * 0.55 + aiDim.score * 0.45), 25, 90),
      confidence: clamp(
        Math.round(baseDim.confidence * 0.5 + aiDim.confidence * 0.5),
        35,
        92
      ),
      explanation: aiDim.explanation || baseDim.explanation
    };
  });

  return {
    ...base,
    title: refined.title || base.title,
    summary: refined.summary || base.summary,
    confidence: clamp(
      Math.round(base.confidence * 0.6 + (refined.confidence ?? base.confidence) * 0.4),
      35,
      90
    ),
    analysisEngine: "gemini",
    dimensions: mergedDimensions,
    tensions: refined.tensions?.length ? refined.tensions.slice(0, 4) : base.tensions,
    highlights: refined.highlights?.length ? refined.highlights.slice(0, 4) : base.highlights
  };
}

export async function POST(request: Request) {
  let base: AnalysisResult | null = null;

  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    base = heuristicAnalysis(text);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = fallbackComparisons(base);
      return NextResponse.json({
        ...base,
        analysisEngine: "heuristic",
        fictionalComparisons: fallback.fictional,
        publicFigureComparisons: fallback.publicFigures
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Tu analyses un corpus textuel fourni volontairement par son auteur.
Tu affines une première analyse heuristique déjà calculée.

Règles :
- ton prudent, nuancé, jamais clinique
- pas de diagnostic psychologique
- tendances exprimées dans le langage seulement
- scores crédibles et modérés
- évite les extrêmes
- réponse en français
- retourne uniquement du JSON valide
- donne exactement 2 fictionalComparisons et 2 publicFigureComparisons
- évite les clichés trop systématiques
- n’utilise Sherlock Holmes, Steve Jobs, Elon Musk ou Thomas Shelby que si le corpus les justifie vraiment
- cherche des comparaisons fines, partielles et expliquées
- chaque comparaison doit exprimer une ressemblance limitée, pas une identité complète

Dimensions attendues :
- analyse_logique
- vision_strategique
- creativite_utile
- exigence_perfectionnisme
- tolerance_incertitude
- energie_action
- lecture_sociale
- besoin_controle
- besoin_sens
- sensibilite_emotionnelle

Schéma attendu :
{
  "title": string,
  "summary": string,
  "confidence": number,
  "dimensions": [
    {
      "key": string,
      "label": string,
      "score": number,
      "confidence": number,
      "explanation": string
    }
  ],
  "tensions": string[],
  "highlights": string[],
  "fictionalComparisons": [
    {
      "name": string,
      "aura": string,
      "why": string,
      "differs": string
    }
  ],
  "publicFigureComparisons": [
    {
      "name": string,
      "aura": string,
      "why": string,
      "differs": string
    }
  ]
}
`;

    const input = `
CORPUS :
${text.slice(0, 90000)}

ANALYSE HEURISTIQUE DE BASE :
${JSON.stringify(base, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\n\n${input}`
    });

    const raw = response.text ?? "";
    console.log("RAW_GEMINI_OUTPUT:", raw);

    const refined = safeParseRefinement(raw);
    const merged = refined ? mergeAnalysis(base, refined) : base;
    const fallback = fallbackComparisons(base);

    const finalPayload = {
      ...merged,
      analysisEngine: refined ? "gemini" : "heuristic",
      fictionalComparisons:
        refined?.fictionalComparisons?.length
          ? refined.fictionalComparisons.slice(0, 2)
          : fallback.fictional,
      publicFigureComparisons:
        refined?.publicFigureComparisons?.length
          ? refined.publicFigureComparisons.slice(0, 2)
          : fallback.publicFigures
    };

    console.log("FINAL_GEMINI_PAYLOAD:", finalPayload);

    return NextResponse.json(finalPayload);
  } catch (error) {
    console.error("ANALYZE_ROUTE_GEMINI_ERROR:", error);

    if (base) {
      const fallback = fallbackComparisons(base);
      return NextResponse.json({
        ...base,
        analysisEngine: "heuristic",
        fictionalComparisons: fallback.fictional,
        publicFigureComparisons: fallback.publicFigures
      });
    }

    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}