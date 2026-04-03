"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAnalysis } from "@/lib/storage";
import type { AnalysisResult } from "@/lib/analysis";
import { parseChatExportFile } from "@/lib/parser";

type ImportStats = {
  conversations: number;
  messages: number;
  filesRead: number;
};

type StoredAnalysisResult = AnalysisResult & {
  id?: string;
};

export default function UploadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const stats = useMemo(() => {
    const cleaned = text.trim();
    return {
      chars: cleaned.length,
      words: cleaned ? cleaned.split(/\s+/).length : 0
    };
  }, [text]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setParsing(true);
    setError(null);

    try {
      const parsed = await parseChatExportFile(file);
      setText(parsed.text);
      setImportStats(parsed.stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de lire ce fichier pour le moment."
      );
      setImportStats(null);
    } finally {
      setParsing(false);
    }
  }

  async function handleAnalyze() {
    if (!text.trim()) {
      setError("Ajoute un corpus textuel avant de lancer l’analyse.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error("Impossible de lancer l’analyse pour le moment.");
      }

      const data = (await response.json()) as AnalysisResult;

let finalResult: AnalysisResult = data;
let savedAnalysisId: string | null = null;

try {
  const saveResponse = await fetch("/api/save-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: data.title,
      summary: data.summary,
      confidence: data.confidence,
      rawText: text,
      result: data
    })
  });

  const saveJson = await saveResponse.json();
  console.log("SAVE_ANALYSIS response:", saveJson);

  if (saveResponse.ok && typeof saveJson?.id === "string") {
    savedAnalysisId = saveJson.id;
    finalResult = {
      ...data,
      id: saveJson.id
    };
  } else {
    console.warn("Analyse non sauvegardée en base :", saveJson?.error);
  }
} catch (saveErr) {
  console.warn("Erreur de sauvegarde distante :", saveErr);
}

saveAnalysis(finalResult);

if (savedAnalysisId) {
  router.push(`/analysis/${savedAnalysisId}`);
  return;
}

router.push("/results");

      saveAnalysis(finalResult);

      if (savedAnalysisId) {
        router.push(`/analysis/${savedAnalysisId}`);
        return;
      }

      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inconnue est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <nav className="nav">
        <Link href="/" className="pill">← Accueil</Link>
        <div className="nav-links">
          <Link href="/method" className="pill">Méthode</Link>
          <Link href="/dashboard" className="pill">Dashboard</Link>
          <Link href="/login" className="pill">Connexion</Link>
        </div>
      </nav>

      <div className="two-col">
        <section className="card">
          <span className="badge">Étape 1 — déposer un corpus</span>
          <h1>Importer des conversations</h1>
          <p className="helper">
            Cette version lit maintenant le <strong>zip complet d’export ChatGPT</strong>, les fichiers
            <code> conversations-000.json, conversations-001.json… </code> ainsi que du texte brut.
          </p>

          <div className="upload-box" style={{ marginTop: 18 }}>
            <label className="label">Fichier</label>
            <input
              type="file"
              accept=".zip,.txt,.json,.md,.html"
              onChange={handleFileChange}
            />
            {filename ? <p className="helper">Fichier chargé : {filename}</p> : null}
            {parsing ? (
              <p className="helper">Lecture et assemblage de l’export en cours…</p>
            ) : null}
          </div>

          <div style={{ marginTop: 18 }}>
            <label className="label">Ou colle directement le texte</label>
            <textarea
              className="textarea"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Colle ici un export ou plusieurs conversations…"
            />
          </div>

          <div className="hero-actions">
            <button
              className="button"
              onClick={handleAnalyze}
              disabled={loading || parsing}
            >
              {loading ? "Analyse en cours…" : "Analyser mes conversations"}
            </button>

            <button
              className="ghost-button"
              onClick={() => {
                setText(sampleCorpus);
                setImportStats(null);
                setFilename(null);
              }}
              type="button"
            >
              Charger un exemple
            </button>
          </div>

          <p className="helper" style={{ marginTop: 12 }}>
            Si tu es connecté, l’analyse sera aussi sauvegardée dans ton espace personnel.
          </p>

          {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
        </section>

        <section className="card">
          <span className="badge">Aperçu</span>
          <h2>Signal capté avant analyse</h2>
          <div className="grid-3" style={{ marginTop: 6 }}>
            <div className="metric">
              <strong>{stats.chars}</strong>
              <span className="muted">caractères</span>
            </div>
            <div className="metric">
              <strong>{stats.words}</strong>
              <span className="muted">mots</span>
            </div>
            <div className="metric">
              <strong>{filename ? "1" : "0"}</strong>
              <span className="muted">fichier chargé</span>
            </div>
          </div>

          {importStats ? (
            <>
              <h2 className="section-title">Résumé de l’import</h2>
              <div className="grid-3" style={{ marginTop: 6 }}>
                <div className="metric">
                  <strong>{importStats.conversations}</strong>
                  <span className="muted">conversations lues</span>
                </div>
                <div className="metric">
                  <strong>{importStats.messages}</strong>
                  <span className="muted">messages extraits</span>
                </div>
                <div className="metric">
                  <strong>{importStats.filesRead}</strong>
                  <span className="muted">fichiers lus</span>
                </div>
              </div>
            </>
          ) : null}

          <h2 className="section-title">Ce que la route API renvoie</h2>
          <div className="list helper">
            <span>• portrait synthétique</span>
            <span>• dimensions scorées</span>
            <span>• tensions internes</span>
            <span>• indices saillants</span>
            <span>• comparaisons fiction / réel</span>
            <span>• niveau de confiance</span>
          </div>
        </section>
      </div>
    </main>
  );
}

const sampleCorpus = `Je veux quelque chose de crédible, propre, qui sonne juste et qui soit directement exploitable. J’aime bien quand on avance vite, mais je ne veux pas sacrifier la qualité du rendu. Il me faut une structure claire, une logique d’ensemble et une vraie cohérence entre le fond, le ton et la manière de présenter les choses. J’aime aussi les idées différenciantes, le positionnement, la stratégie de lancement et la façon de convaincre un jury ou une équipe.`;