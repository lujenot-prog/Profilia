"use client";

import { useState } from "react";

type Props = {
  analysisId: string;
};

const satisfactionLabels: Record<number, string> = {
  1: "Pas du tout",
  2: "Plutôt non",
  3: "Mitigé",
  4: "Plutôt oui",
  5: "Tout à fait"
};

export default function FeedbackForm({ analysisId }: Props) {
  const [satisfactionScore, setSatisfactionScore] = useState<number>(0);
  const [mostAccurate, setMostAccurate] = useState("");
  const [leastAccurate, setLeastAccurate] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          analysisId,
          satisfactionScore,
          mostAccurate,
          leastAccurate,
          wouldRecommend
        })
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="card" style={{ marginTop: 0 }}>
        <div className="section-head">
          <div>
            <p className="section-eyebrow">Merci</p>
            <h2 style={{ margin: 0 }}>Ton retour a bien été enregistré</h2>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          Ton ressenti nous aide à affiner la lecture de Profilia et à mieux comprendre
          ce qui résonne vraiment avec les utilisateurs.
        </p>
      </section>
    );
  }

  const selectedLabel = satisfactionScore
    ? satisfactionLabels[satisfactionScore]
    : "Choisis une note";

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: 0 }}>
      <div className="section-head">
        <div>
          <p className="section-eyebrow">Retour utilisateur</p>
          <h2 style={{ margin: 0 }}>Ton ressenti sur cette analyse</h2>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8, marginBottom: 22 }}>
        Avant d’aller plus loin, raconte-nous comment cette lecture t’a parlé.
        Le but n’est pas de voir si tu “entres” dans le résultat, mais de mesurer
        à quel point il sonne juste, nuancé et crédible.
      </p>

      <div className="profilia-form-grid">
        <div className="profilia-form-section">
          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            Est-ce que ce profil te ressemble ?
          </label>

          <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
            Note ton ressenti global, de l’impression la plus lointaine à la plus fidèle.
          </p>

          <div className="profilia-answer-grid">
            {[1, 2, 3, 4, 5].map((n) => {
              const selected = satisfactionScore === n;

              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSatisfactionScore(n)}
                  className={`profilia-answer-chip ${selected ? "is-selected" : ""}`}
                >
                  <div className="profilia-answer-chip-number">{n}</div>
                  <div className="profilia-answer-chip-label">
                    {satisfactionLabels[n]}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 12 }}>
            <span className="tone-pill">{selectedLabel}</span>
          </div>
        </div>

        <div className="profilia-form-section">
          <label
            htmlFor="most-accurate"
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            Qu’est-ce qui t’a semblé le plus juste ?
          </label>

          <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
            Une idée, une formulation, une intuition, un trait qui t’a paru particulièrement fidèle.
          </p>

          <textarea
            id="most-accurate"
            value={mostAccurate}
            onChange={(e) => setMostAccurate(e.target.value)}
            rows={4}
            placeholder="Exemple : la partie sur mon besoin de cohérence et d’authenticité m’a vraiment parlé…"
            className="profilia-textarea"
          />
        </div>

        <div className="profilia-form-section">
          <label
            htmlFor="least-accurate"
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            Qu’est-ce qui t’a semblé moins juste ?
          </label>

          <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
            Tu peux signaler un décalage, une exagération, ou une zone qui t’a paru trop floue.
          </p>

          <textarea
            id="least-accurate"
            value={leastAccurate}
            onChange={(e) => setLeastAccurate(e.target.value)}
            rows={4}
            placeholder="Exemple : la dimension relationnelle me paraît un peu surestimée…"
            className="profilia-textarea"
          />
        </div>

        <div className="profilia-form-section">
          <label
            htmlFor="recommend"
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            Recommanderais-tu Profilia à un ami ?
          </label>

          <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
            Une note simple, entre 0 et 10.
          </p>

          <input
            id="recommend"
            type="number"
            min={0}
            max={10}
            value={wouldRecommend}
            onChange={(e) => setWouldRecommend(Number(e.target.value))}
            className="profilia-input"
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 24
        }}
      >
        <button
          type="submit"
          disabled={loading || satisfactionScore === 0}
          className="button"
          style={{
            opacity: loading || satisfactionScore === 0 ? 0.7 : 1,
            cursor: loading || satisfactionScore === 0 ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Enregistrement..." : "Envoyer mon retour"}
        </button>
      </div>
    </form>
  );
}