type Props = {
  label: string;
  score: number;
  confidence?: number;
  explanation?: string;
};

export function AnalysisBar({ label, score, confidence, explanation }: Props) {
  return (
    <div className="analysis-bar-wrap">
      <div className="analysis-bar-head">
        <strong>{label}</strong>
        <span className="muted">{score}/100</span>
      </div>
      <div className="analysis-bar">
        <div className="analysis-bar-fill" style={{ width: `${score}%` }} />
      </div>
      {typeof confidence === "number" ? (
        <span className="small muted">Confiance : {confidence}/100</span>
      ) : null}
      {explanation ? <span className="small muted">{explanation}</span> : null}
    </div>
  );
}
