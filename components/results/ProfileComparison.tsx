type Scores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

type Props = {
  modelScores: Scores;
  testScores: Scores;
};

const labels: Record<keyof Scores, string> = {
  openness: "Ouverture",
  conscientiousness: "Conscienciosité",
  extraversion: "Extraversion",
  agreeableness: "Agréabilité",
  neuroticism: "Neuroticisme"
};

function getGapLabel(gap: number) {
  if (gap <= 10) return "Très cohérent";
  if (gap <= 20) return "Assez cohérent";
  return "Écart important";
}

function getGapDescription(gap: number) {
  if (gap <= 10) {
    return "Le modèle et le questionnaire racontent ici presque la même histoire.";
  }
  if (gap <= 20) {
    return "La tendance générale reste proche, même s’il existe une nuance notable.";
  }
  return "Le modèle et le questionnaire divergent ici de manière visible.";
}

export default function ProfileComparison({ modelScores, testScores }: Props) {
  const entries = Object.keys(modelScores).map((key) => {
    const trait = key as keyof Scores;
    const model = modelScores[trait];
    const test = testScores[trait];
    const gap = Math.abs(model - test);

    return {
      trait,
      label: labels[trait],
      model,
      test,
      gap,
      verdict: getGapLabel(gap),
      description: getGapDescription(gap)
    };
  });

  const averageGap = Math.round(
    entries.reduce((acc, item) => acc + item.gap, 0) / entries.length
  );

  const coherence = Math.max(0, 100 - averageGap);

  return (
    <section className="card" style={{ marginTop: 0 }}>
      <div className="section-head">
        <div>
          <p className="section-eyebrow">Comparaison finale</p>
          <h2 style={{ margin: 0 }}>Profilia face au questionnaire</h2>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8, marginBottom: 20 }}>
        Cette comparaison ne dit pas qui a “raison”, mais elle permet de voir à quel point
        l’estimation de Profilia rejoint ou non tes réponses à un questionnaire structuré.
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
            flexWrap: "wrap"
          }}
        >
          <strong>Cohérence globale estimée</strong>
          <span className="tone-pill">{coherence}%</span>
        </div>

        <div
          className="profilia-progress-shell"
          style={{ marginTop: 12, height: 12 }}
        >
          <div
            className="profilia-progress-bar"
            style={{ width: `${coherence}%` }}
          />
        </div>
      </div>

      <div className="profilia-form-grid">
        {entries.map((item) => (
          <div
            key={item.trait}
            className="profilia-form-section"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                flexWrap: "wrap",
                marginBottom: 12
              }}
            >
              <div>
                <h3 style={{ margin: 0, marginBottom: 6 }}>{item.label}</h3>
                <span className="tone-pill">{item.verdict}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap"
                }}
              >
                <span className="tone-pill">Écart : {item.gap}</span>
              </div>
            </div>

            <div className="profilia-score-grid">
              <div className="profilia-score-box">
                <div className="muted" style={{ marginBottom: 6 }}>
                  Score Profilia
                </div>
                <strong>{item.model}/100</strong>
              </div>

              <div className="profilia-score-box">
                <div className="muted" style={{ marginBottom: 6 }}>
                  Score questionnaire
                </div>
                <strong>{item.test}/100</strong>
              </div>
            </div>

            <p className="muted" style={{ margin: 0 }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}