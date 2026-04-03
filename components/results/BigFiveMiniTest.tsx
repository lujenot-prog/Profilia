"use client";

import { useMemo, useState } from "react";
import { bigFiveQuestions } from "@/lib/bigfive";

type Scores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

type Props = {
  analysisId: string;
  onComplete: (scores: Scores) => void;
};

const scaleLabels: Record<number, string> = {
  1: "Pas du tout d’accord",
  2: "Plutôt pas d’accord",
  3: "Neutre",
  4: "Plutôt d’accord",
  5: "Tout à fait d’accord"
};

export default function BigFiveMiniTest({ analysisId, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const progress = Math.round((answeredCount / bigFiveQuestions.length) * 100);

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/bigfive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analysisId, answers })
      });

      const data = await res.json();

      if (res.ok) {
        onComplete(data.scores);
      }
    } finally {
      setLoading(false);
    }
  }

  const isComplete = answeredCount === bigFiveQuestions.length;

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: 0 }}>
      <div className="section-head">
        <div>
          <p className="section-eyebrow">Questionnaire de référence</p>
          <h2 style={{ margin: 0 }}>Comparer avec un mini Big Five</h2>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8, marginBottom: 18 }}>
        Ce mini questionnaire ne remplace pas un test psychométrique long, mais il permet
        déjà de confronter la lecture de Profilia à une structure reconnue de personnalité.
      </p>

      <div
        className="profilia-form-section"
        style={{
          marginBottom: 22
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 10,
            flexWrap: "wrap"
          }}
        >
          <strong>Progression</strong>
          <span className="tone-pill">
            {answeredCount}/{bigFiveQuestions.length} questions
          </span>
        </div>

        <div className="profilia-progress-shell">
          <div
            className="profilia-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="profilia-form-grid">
        {bigFiveQuestions.map((q, index) => {
          const selectedValue = answers[q.id];

          return (
            <div
              key={q.id}
              className="profilia-form-section"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 10
                }}
              >
                <span className="tone-pill">Question {index + 1}</span>
                {selectedValue ? (
                  <span className="tone-pill">{scaleLabels[selectedValue]}</span>
                ) : null}
              </div>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontWeight: 700,
                  fontSize: "1.02rem",
                  lineHeight: 1.5
                }}
              >
                {q.text}
              </p>

              <div className="profilia-answer-grid">
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = answers[q.id] === n;

                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAnswer(q.id, n)}
                      className={`profilia-answer-chip ${selected ? "is-selected" : ""}`}
                    >
                      <div className="profilia-answer-chip-number">{n}</div>
                      <div className="profilia-answer-chip-label">
                        {scaleLabels[n]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginTop: 24
        }}
      >
        <p className="muted" style={{ margin: 0 }}>
          {isComplete
            ? "Tout est prêt. Tu peux lancer la comparaison."
            : "Réponds à toutes les questions pour afficher la comparaison."}
        </p>

        <button
          type="submit"
          disabled={loading || !isComplete}
          className="button"
          style={{
            opacity: loading || !isComplete ? 0.7 : 1,
            cursor: loading || !isComplete ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Calcul en cours..." : "Voir la comparaison"}
        </button>
      </div>
    </form>
  );
}