"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  AnalysisResult,
  AnalysisDimension,
  ComparisonCard
} from "@/lib/analysis";
import { readAnalysis } from "@/lib/storage";
import { AnalysisBar } from "./analysis-bar";
import { ProfilePieChart } from "./profile-pie-chart";
import FeedbackForm from "@/components/results/FeedbackForm";
import BigFiveMiniTest from "@/components/results/BigFiveMiniTest";
import ProfileComparison from "@/components/results/ProfileComparison";

const demoData: AnalysisResult = {
  title: "Portrait probabiliste exprimé dans les conversations",
  summary:
    "Le corpus donne l’image d’un profil analytique et stratégique, assez exigeant avec le rendu final, sensible à la cohérence et naturellement tourné vers l’action. L’écriture laisse aussi apparaître un besoin d’authenticité : le résultat doit être bon, mais aussi sonner juste.",
  confidence: 78,
  analysisEngine: "heuristic",
  dimensions: [
    {
      key: "analyse_logique",
      label: "Analyse / logique",
      score: 82,
      confidence: 81,
      explanation: "La personne découpe, précise et structure volontiers."
    },
    {
      key: "vision_strategique",
      label: "Vision stratégique",
      score: 79,
      confidence: 76,
      explanation:
        "Les échanges montrent une pensée orientée trajectoire, projet et positionnement."
    },
    {
      key: "creativite_utile",
      label: "Créativité utile",
      score: 67,
      confidence: 68,
      explanation: "La créativité semble mobilisée au service d’un objectif concret."
    },
    {
      key: "exigence_perfectionnisme",
      label: "Exigence / perfectionnisme",
      score: 84,
      confidence: 79,
      explanation:
        "Le langage montre un fort souci de justesse et de qualité du rendu."
    },
    {
      key: "tolerance_incertitude",
      label: "Tolérance à l’incertitude",
      score: 46,
      confidence: 61,
      explanation: "Le flou semble moins confortable que l’action cadrée."
    },
    {
      key: "energie_action",
      label: "Énergie d’action",
      score: 76,
      confidence: 72,
      explanation: "Le rythme d’écriture suggère une envie d’avancer vite."
    },
    {
      key: "lecture_sociale",
      label: "Lecture sociale",
      score: 63,
      confidence: 65,
      explanation:
        "La personne paraît attentive aux publics, aux groupes et aux effets de discours."
    },
    {
      key: "besoin_controle",
      label: "Besoin de contrôle",
      score: 74,
      confidence: 71,
      explanation: "Le cadre, le ton et la forme semblent importants."
    },
    {
      key: "besoin_sens",
      label: "Besoin de sens / authenticité",
      score: 72,
      confidence: 73,
      explanation:
        "Les échanges rejettent ce qui paraît générique, creux ou artificiel."
    },
    {
      key: "sensibilite_emotionnelle",
      label: "Sensibilité émotionnelle",
      score: 58,
      confidence: 62,
      explanation:
        "Une intensité émotionnelle est visible, mais plutôt contenue par la structure."
    }
  ],
  tensions: [
    "Volonté d’aller vite, mais sans sacrifier la qualité du rendu.",
    "Besoin de maîtrise assez marqué, avec un rapport plus prudent au flou.",
    "Recherche d’authenticité qui refuse le rendu trop standard ou trop creux."
  ],
  highlights: [
    "La personne revient souvent sur la justesse du ton et la crédibilité du résultat.",
    "Les échanges donnent l’impression d’un profil qui pense autant au fond qu’à la manière de le présenter.",
    "On sent une énergie de mise en mouvement : le projet doit rapidement prendre forme."
  ],
  sourceStats: {
    characterCount: 18342,
    wordCount: 2968,
    estimatedMessages: 48
  },
  fictionalComparisons: [],
  publicFigureComparisons: []
};

type BigFiveItem = {
  key:
    | "ouverture"
    | "conscienciosite"
    | "extraversion"
    | "agreabilite"
    | "stabilite_emotionnelle";
  label: string;
  score: number;
  explanation: string;
};

type ComparableScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

type ResultsClientProps = {
  initialResult?: AnalysisResult | null;
  analysisId?: string | null;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getDimension(result: AnalysisResult, key: AnalysisDimension["key"]) {
  return result.dimensions.find((d) => d.key === key)?.score ?? 50;
}

function getTopDimensions(result: AnalysisResult, count = 5) {
  return [...result.dimensions].sort((a, b) => b.score - a.score).slice(0, count);
}

function getArchetype(result: AnalysisResult) {
  const analyse = getDimension(result, "analyse_logique");
  const strategy = getDimension(result, "vision_strategique");
  const exigence = getDimension(result, "exigence_perfectionnisme");
  const action = getDimension(result, "energie_action");
  const control = getDimension(result, "besoin_controle");
  const meaning = getDimension(result, "besoin_sens");
  const creativity = getDimension(result, "creativite_utile");

  if (analyse >= 78 && strategy >= 76 && exigence >= 76) {
    return {
      name: "Bâtisseur analytique",
      subtitle:
        "Un profil qui veut comprendre vite, structurer juste, puis transformer l’idée en quelque chose de net et solide."
    };
  }

  if (strategy >= 76 && action >= 72 && control >= 70) {
    return {
      name: "Stratège d’exécution",
      subtitle:
        "Un profil qui projette, tranche et aime voir les choses prendre forme avec un vrai niveau de maîtrise."
    };
  }

  if (meaning >= 72 && exigence >= 72 && creativity >= 68) {
    return {
      name: "Créatif exigeant",
      subtitle:
        "Un profil qui ne cherche pas seulement une bonne idée, mais une idée juste, crédible et fidèle à son intention."
    };
  }

  return {
    name: "Profil hybride structuré",
    subtitle:
      "Un profil plutôt dense, qui combine réflexion, cadrage et envie d’avancer concrètement."
  };
}

function getFallbackComparisons(result: AnalysisResult): {
  fictional: ComparisonCard[];
  publicFigures: ComparisonCard[];
} {
  const analyse = getDimension(result, "analyse_logique");
  const strategy = getDimension(result, "vision_strategique");
  const exigence = getDimension(result, "exigence_perfectionnisme");
  const action = getDimension(result, "energie_action");
  const control = getDimension(result, "besoin_controle");
  const social = getDimension(result, "lecture_sociale");
  const meaning = getDimension(result, "besoin_sens");
  const uncertainty = getDimension(result, "tolerance_incertitude");
  const creativity = getDimension(result, "creativite_utile");

  const fictional: ComparisonCard[] = [];
  const publicFigures: ComparisonCard[] = [];

  if (analyse >= 75 && control >= 72) {
    fictional.push({
      name: "Sherlock Holmes",
      aura: "Lecture fine + structure mentale",
      why: "Le profil donne l’image de quelqu’un qui aime disséquer, préciser et faire tenir les choses debout.",
      differs:
        "Ici, l’élan projet et le besoin de concrétiser semblent plus marqués qu’une pure logique d’observation."
    });
  }

  if (strategy >= 78 && control >= 75 && action >= 72) {
    fictional.push({
      name: "Thomas Shelby",
      aura: "Vision + contrôle + exécution",
      why: "Le mélange entre projection, maîtrise et envie d’avancer ressort fortement.",
      differs:
        "Le profil analysé semble moins opaque relationnellement et davantage tourné vers la construction explicite."
    });
  }

  if (analyse >= 76 && exigence >= 78 && uncertainty <= 45) {
    fictional.push({
      name: "Beth Harmon",
      aura: "Exigence + intensité + précision",
      why: "On retrouve une combinaison de rigueur, de tension intérieure et de recherche d’un niveau d’exécution très propre.",
      differs:
        "Ici, la dimension stratégique et la volonté de cadrer collectivement paraissent plus visibles."
    });
  }

  if (social >= 70 && strategy >= 74) {
    fictional.push({
      name: "Harvey Specter",
      aura: "Lecture sociale + placement",
      why: "Le profil paraît sensible à la manière de convaincre, cadrer et se positionner devant les autres.",
      differs:
        "Le corpus ici semble davantage motivé par la cohérence du fond que par la seule domination sociale."
    });
  }

  if (strategy >= 76 && meaning >= 70 && exigence >= 76) {
    publicFigures.push({
      name: "Steve Jobs",
      aura: "Vision + obsession du rendu",
      why: "On retrouve l’idée qu’un résultat doit être fort, cohérent et suffisamment net pour marquer.",
      differs:
        "Le profil ici paraît plus analytique dans la formulation et moins centré sur la posture iconique."
    });
  }

  if (analyse >= 78 && creativity >= 66) {
    publicFigures.push({
      name: "Elon Musk",
      aura: "Système + projection",
      why: "Écho partiel sur le goût des structures, des projets ambitieux et de l’architecture d’ensemble.",
      differs:
        "Le corpus analysé semble plus attentif à la justesse du ton et moins polarisant dans la posture."
    });
  }

  if (meaning >= 72 && creativity >= 68 && social >= 66) {
    publicFigures.push({
      name: "Virgil Abloh",
      aura: "Idée + identité + intention",
      why: "Résonance sur la capacité à relier créativité, direction et sens donné au rendu.",
      differs:
        "Ici, la logique de structuration et la volonté de cadrer paraissent plus fortes."
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

  if (!publicFigures.length) {
    publicFigures.push({
      name: "Fondateur analytique",
      aura: "Archétype réel",
      why: "Le profil rappelle surtout des personnes qui aiment penser loin, cadrer fort et exiger un rendu crédible.",
      differs:
        "Cette comparaison reste générique et sert surtout de repère de style."
    });
  }

  return {
    fictional: fictional.slice(0, 2),
    publicFigures: publicFigures.slice(0, 2)
  };
}

function getPerceptionCards(result: AnalysisResult) {
  const strategy = getDimension(result, "vision_strategique");
  const action = getDimension(result, "energie_action");
  const control = getDimension(result, "besoin_controle");
  const meaning = getDimension(result, "besoin_sens");
  const uncertainty = getDimension(result, "tolerance_incertitude");
  const social = getDimension(result, "lecture_sociale");

  return [
    {
      title: "Dans un projet",
      text:
        strategy >= 74
          ? "Tu risques d’être perçu comme celui qui voit rapidement la structure d’ensemble, les angles faibles et les prochaines étapes utiles."
          : "Tu sembles surtout apporter du cadre, de la lecture et une envie que les choses ne restent pas trop abstraites."
    },
    {
      title: "Sous pression",
      text:
        control >= 72 && uncertainty <= 48
          ? "Sous tension, tu peux devenir plus direct, plus exigeant et moins tolérant au flou ou aux détours inutiles."
          : "Sous pression, tu gardes probablement le besoin de comprendre vite ce qui compte vraiment avant de réagir."
    },
    {
      title: "Dans l’exécution",
      text:
        action >= 70
          ? "Tu donnes l’image de quelqu’un qui aime voir le travail prendre forme, sans sacrifier la cohérence du résultat."
          : "Tu sembles préférer une avancée propre et structurée à une exécution trop précipitée."
    },
    {
      title: "Dans le relationnel",
      text:
        social >= 68 && meaning >= 68
          ? "Tu parais assez bon pour sentir comment parler aux autres, mais avec un besoin que l’échange reste vrai et pas trop artificiel."
          : "Tu n’as pas l’air de chercher le relationnel pour lui-même : il compte surtout quand il sert le sens, le projet ou la justesse du message."
    }
  ];
}

function getBlindSpots(result: AnalysisResult) {
  const exigence = getDimension(result, "exigence_perfectionnisme");
  const control = getDimension(result, "besoin_controle");
  const uncertainty = getDimension(result, "tolerance_incertitude");
  const action = getDimension(result, "energie_action");

  const items: string[] = [];

  if (exigence >= 76) {
    items.push(
      "Tu peux avoir du mal à te satisfaire d’un rendu simplement bon quand tu vois encore tout ce qu’il pourrait devenir."
    );
  }

  if (control >= 74 && uncertainty <= 48) {
    items.push(
      "Le flou prolongé ou les explications trop approximatives peuvent te fatiguer vite."
    );
  }

  if (action >= 72 && exigence >= 74) {
    items.push(
      "Tu peux vouloir aller vite tout en gardant un niveau d’exigence élevé, ce qui crée parfois une tension intérieure inutile."
    );
  }

  if (!items.length) {
    items.push(
      "Ton angle mort probable se joue surtout dans l’équilibre entre réflexion, vitesse et patience face au réel."
    );
  }

  return items.slice(0, 3);
}

function getSignature(result: AnalysisResult) {
  const top3 = getTopDimensions(result, 3).map((d) => d.label.toLowerCase());
  return `${top3[0]} · ${top3[1]} · ${top3[2]}`;
}

function getScoreTone(score: number) {
  if (score >= 78) return "Très marqué";
  if (score >= 66) return "Marqué";
  if (score >= 54) return "Présent";
  if (score >= 42) return "Modéré";
  return "En retrait";
}

function getBigFive(result: AnalysisResult): BigFiveItem[] {
  const analyse = getDimension(result, "analyse_logique");
  const strategy = getDimension(result, "vision_strategique");
  const creativity = getDimension(result, "creativite_utile");
  const exigence = getDimension(result, "exigence_perfectionnisme");
  const uncertainty = getDimension(result, "tolerance_incertitude");
  const action = getDimension(result, "energie_action");
  const social = getDimension(result, "lecture_sociale");
  const control = getDimension(result, "besoin_controle");
  const meaning = getDimension(result, "besoin_sens");
  const emotional = getDimension(result, "sensibilite_emotionnelle");

  const ouverture = clamp(
    Math.round(creativity * 0.45 + meaning * 0.25 + analyse * 0.15 + uncertainty * 0.15),
    25,
    90
  );

  const conscienciosite = clamp(
    Math.round(exigence * 0.4 + control * 0.3 + strategy * 0.15 + action * 0.15),
    25,
    92
  );

  const extraversion = clamp(
    Math.round(action * 0.4 + social * 0.35 + emotional * 0.1 + (100 - control) * 0.15),
    20,
    82
  );

  const agreabilite = clamp(
    Math.round(social * 0.45 + meaning * 0.25 + (100 - control) * 0.15 + (100 - exigence) * 0.15),
    20,
    82
  );

  const stabiliteEmotionnelle = clamp(
    Math.round((100 - emotional) * 0.35 + uncertainty * 0.35 + (100 - control) * 0.1 + 50 * 0.2),
    20,
    82
  );

  return [
    {
      key: "ouverture",
      label: "Ouverture",
      score: ouverture,
      explanation:
        "Estimation dérivée de la curiosité intellectuelle, du besoin de sens, de la créativité utile et du rapport à l’exploration."
    },
    {
      key: "conscienciosite",
      label: "Conscienciosité",
      score: conscienciosite,
      explanation:
        "Estimation dérivée du besoin de contrôle, de l’exigence du rendu, de la structuration et de l’orientation projet."
    },
    {
      key: "extraversion",
      label: "Extraversion",
      score: extraversion,
      explanation:
        "Estimation dérivée de l’énergie d’action, de la dynamique relationnelle visible et du style d’engagement dans l’échange."
    },
    {
      key: "agreabilite",
      label: "Agréabilité",
      score: agreabilite,
      explanation:
        "Estimation dérivée de la lecture sociale, du souci de justesse relationnelle et d’une posture plus ou moins directive."
    },
    {
      key: "stabilite_emotionnelle",
      label: "Stabilité émotionnelle",
      score: stabiliteEmotionnelle,
      explanation:
        "Estimation dérivée du rapport au flou, de l’intensité émotionnelle exprimée et de la manière de gérer la tension dans le langage."
    }
  ];
}

function getEngineShortLabel(engine?: "gemini" | "heuristic") {
  return engine === "gemini" ? "Gemini" : "Heuristique";
}

export function ResultsClient({
  initialResult = null,
  analysisId: forcedAnalysisId = null
}: ResultsClientProps) {
  const [result, setResult] = useState<AnalysisResult | null>(initialResult);
  const [testScores, setTestScores] = useState<ComparableScores | null>(null);

  useEffect(() => {
    if (initialResult) return;
    setResult(readAnalysis() ?? demoData);
  }, []);

  const topSlices = useMemo(() => {
    if (!result) return [];
    return getTopDimensions(result, 5).map((item) => ({
      label: item.label,
      score: item.score
    }));
  }, [result]);

  const archetype = useMemo(() => {
    if (!result) return null;
    return getArchetype(result);
  }, [result]);

  const comparisons = useMemo(() => {
    if (!result) return { fictional: [], publicFigures: [] };

    const hasAIComparisons =
      (result.fictionalComparisons?.length ?? 0) > 0 ||
      (result.publicFigureComparisons?.length ?? 0) > 0;

    if (hasAIComparisons) {
      return {
        fictional: (result.fictionalComparisons ?? []).slice(0, 2),
        publicFigures: (result.publicFigureComparisons ?? []).slice(0, 2)
      };
    }

    return getFallbackComparisons(result);
  }, [result]);

  const perceptionCards = useMemo(() => {
    if (!result) return [];
    return getPerceptionCards(result);
  }, [result]);

  const blindSpots = useMemo(() => {
    if (!result) return [];
    return getBlindSpots(result);
  }, [result]);

  const top3 = useMemo(() => {
    if (!result) return [];
    return getTopDimensions(result, 3);
  }, [result]);

  const bigFive = useMemo(() => {
    if (!result) return [];
    return getBigFive(result);
  }, [result]);

  const modelScores = useMemo<ComparableScores | null>(() => {
    if (!bigFive.length) return null;

    const getScore = (key: BigFiveItem["key"]) =>
      bigFive.find((item) => item.key === key)?.score ?? 50;

    return {
      openness: getScore("ouverture"),
      conscientiousness: getScore("conscienciosite"),
      extraversion: getScore("extraversion"),
      agreeableness: getScore("agreabilite"),
      neuroticism: 100 - getScore("stabilite_emotionnelle")
    };
  }, [bigFive]);

  const engineShortLabel = useMemo(
    () => getEngineShortLabel(result?.analysisEngine),
    [result]
  );

  const analysisId =
    forcedAnalysisId ??
    (result as (AnalysisResult & { id?: string }) | null)?.id ??
    null;

  if (!result || !archetype) return null;

  return (
    <main className="page-shell">
      <nav className="nav">
        <Link href="/" className="pill">
          ← Accueil
        </Link>
        <div className="nav-links">
          <Link href="/method" className="pill">
            Méthode
          </Link>
          <Link href="/upload" className="pill">
            Nouvelle analyse
          </Link>
        </div>
      </nav>

      <section className="premium-hero card">
        <div className="premium-hero-copy">
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              marginBottom: 8
            }}
          >
            <span className="badge">Confiance globale : {result.confidence}/100</span>
            <span className="badge">Moteur : {engineShortLabel}</span>
          </div>
          <p className="premium-kicker">Portrait premium</p>
          <h1 className="premium-title">{archetype.name}</h1>
          <p className="premium-subtitle">{archetype.subtitle}</p>

          <div className="trait-chips">
            {top3.map((item) => (
              <span key={item.key} className="trait-chip">
                {item.label} · {item.score}/100
              </span>
            ))}
          </div>

          <p className="subtitle" style={{ marginTop: 18 }}>
            {result.summary}
          </p>

          <div className="hero-stats-grid">
            <div className="metric premium-metric">
              <strong>{result.sourceStats.wordCount}</strong>
              <span className="muted">mots analysés</span>
            </div>
            <div className="metric premium-metric">
              <strong>{result.sourceStats.estimatedMessages}</strong>
              <span className="muted">messages estimés</span>
            </div>
            <div className="metric premium-metric">
              <strong>{getSignature(result)}</strong>
              <span className="muted">signature dominante</span>
            </div>
          </div>
        </div>

        <div className="premium-hero-visual">
          <div className="card premium-inner-card">
            <h2 style={{ marginTop: 0 }}>Dominantes</h2>
            <ProfilePieChart data={topSlices} />
          </div>
        </div>
      </section>

      <section className="premium-grid" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">Lecture détaillée</p>
              <h2 style={{ margin: 0 }}>Dimensions clés</h2>
            </div>
          </div>

          <div className="list">
            {result.dimensions.map((dimension) => (
              <div key={dimension.key} className="dimension-card">
                <AnalysisBar
                  label={dimension.label}
                  score={dimension.score}
                  confidence={dimension.confidence}
                  explanation={dimension.explanation}
                />
                <div className="dimension-meta">
                  <span className="tone-pill">{getScoreTone(dimension.score)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="side-stack">
          <div className="card">
            <p className="section-eyebrow">Tensions</p>
            <h2 style={{ marginTop: 0 }}>Tes tiraillements probables</h2>
            <div className="list">
              {result.tensions.map((item, index) => (
                <blockquote key={index} className="quote">
                  {item}
                </blockquote>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="section-eyebrow">Ce qui ressort</p>
            <h2 style={{ marginTop: 0 }}>Indices saillants</h2>
            <div className="list">
              {result.highlights.map((item, index) => (
                <blockquote key={index} className="quote">
                  {item}
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="section-head">
          <div>
            <p className="section-eyebrow">Ancrage théorique</p>
            <h2 style={{ margin: 0 }}>Lecture Big Five estimative</h2>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 0 }}>
          Cette couche ne remplace pas un test psychométrique validé. Elle traduit les dimensions de Profilia
          en une lecture approximative inspirée du modèle Big Five, pour rendre le rapport plus lisible et plus crédible.
        </p>

        <div className="list">
          {bigFive.map((trait) => (
            <div key={trait.key} className="dimension-card">
              <AnalysisBar
                label={trait.label}
                score={trait.score}
                confidence={Math.max(40, result.confidence - 8)}
                explanation={trait.explanation}
              />
              <div className="dimension-meta">
                <span className="tone-pill">{getScoreTone(trait.score)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {analysisId ? (
        <section style={{ marginTop: 18 }}>
          <FeedbackForm analysisId={analysisId} />
        </section>
      ) : null}

      {analysisId ? (
        <section style={{ marginTop: 18 }}>
          <BigFiveMiniTest
            analysisId={analysisId}
            onComplete={(scores) => setTestScores(scores)}
          />
        </section>
      ) : null}

      {analysisId && modelScores && testScores ? (
        <section style={{ marginTop: 18 }}>
          <ProfileComparison
            modelScores={modelScores}
            testScores={testScores}
          />
        </section>
      ) : null}

      <section className="two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <p className="section-eyebrow">Échos fictionnels</p>
          <h2 style={{ marginTop: 0 }}>Personnages qui te ressemblent un peu</h2>
          <div className="list">
            {comparisons.fictional.map((item) => (
              <div key={item.name} className="vibe-card">
                <div className="vibe-topline">
                  <span className="vibe-type">Fiction</span>
                  <span className="tone-pill">{item.aura}</span>
                </div>
                <h3 style={{ marginBottom: 8 }}>{item.name}</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  <p className="muted" style={{ margin: 0 }}>
                    <strong style={{ color: "var(--text)" }}>Pourquoi ça colle :</strong>{" "}
                    {item.why}
                  </p>
                  {item.differs ? (
                    <p className="muted" style={{ margin: 0 }}>
                      <strong style={{ color: "var(--text)" }}>Ce qui diffère :</strong>{" "}
                      {item.differs}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-eyebrow">Résonances réelles</p>
          <h2 style={{ marginTop: 0 }}>Figures publiques évocatrices</h2>
          <div className="list">
            {comparisons.publicFigures.map((item) => (
              <div key={item.name} className="vibe-card">
                <div className="vibe-topline">
                  <span className="vibe-type">Référence</span>
                  <span className="tone-pill">{item.aura}</span>
                </div>
                <h3 style={{ marginBottom: 8 }}>{item.name}</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  <p className="muted" style={{ margin: 0 }}>
                    <strong style={{ color: "var(--text)" }}>Pourquoi ça colle :</strong>{" "}
                    {item.why}
                  </p>
                  {item.differs ? (
                    <p className="muted" style={{ margin: 0 }}>
                      <strong style={{ color: "var(--text)" }}>Ce qui diffère :</strong>{" "}
                      {item.differs}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <p className="section-eyebrow">Perception probable</p>
          <h2 style={{ marginTop: 0 }}>Comment tu peux être perçu</h2>
          <div className="perception-grid">
            {perceptionCards.map((item) => (
              <div key={item.title} className="perception-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>{item.title}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-eyebrow">Angles morts</p>
          <h2 style={{ marginTop: 0 }}>Ce qui peut te freiner</h2>
          <div className="list">
            {blindSpots.map((item, index) => (
              <blockquote key={index} className="quote">
                {item}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <p className="footer-note">
        Ce rapport décrit des tendances exprimées dans un corpus textuel. La lecture Big Five affichée ici est estimative,
        dérivée des dimensions de Profilia, et ne constitue pas un test psychologique officiel.
      </p>
    </main>
  );
}