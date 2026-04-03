import Link from "next/link";
import { Brain, Radar, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="page-shell">
      <nav className="nav">
        <div className="brand">Profilia</div>
        <div className="nav-links">
          <Link href="/method" className="pill">Méthode</Link>
          <Link href="/upload" className="pill">Commencer</Link>
          <Link href="/results" className="pill">Démo résultats</Link>
          <Link href="/login" className="ghost-button">Connexion</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="card">
          <span className="badge">Miroir cognitif à partir de conversations</span>
          <h1 className="hero-title">
            Importe tes conversations. Découvre les traits qu’elles révèlent de toi.
          </h1>
          <p className="subtitle">
            Profilia lit un corpus de conversations exportées et en propose une cartographie prudente :
            style cognitif, niveau d’exigence, rapport au contrôle, authenticité, énergie d’action et tensions internes.
          </p>
          <div className="hero-actions">
            <Link href="/upload" className="button">Lancer une première analyse</Link>
            <Link href="/results" className="ghost-button">Voir un exemple de rendu</Link>
          </div>
        </div>

        <div className="card">
          <div className="list">
            <div className="metric">
              <strong>10 dimensions</strong>
              <span className="muted">
                analyse, stratégie, contrôle, sens, exigence, émotions…
              </span>
            </div>
            <div className="metric">
              <strong>Portrait + preuves</strong>
              <span className="muted">
                des extraits soutiennent les hypothèses plutôt que des jugements tombés du ciel
              </span>
            </div>
            <div className="metric">
              <strong>Nuancé, pas clinique</strong>
              <span className="muted">
                on décrit des tendances exprimées dans le langage, pas un diagnostic
              </span>
            </div>
          </div>
        </div>
      </section>

      <h2 className="section-title">Ce que la V1 raconte</h2>
      <section className="grid-3">
        <div className="card">
          <Brain size={28} />
          <h3>Style cognitif</h3>
          <p className="helper">
            Repère le niveau d’analyse, la structuration, le rapport au détail, la capacité à projeter.
          </p>
        </div>
        <div className="card">
          <Radar size={28} />
          <h3>Tensions internes</h3>
          <p className="helper">
            Par exemple : fort besoin de maîtrise, mais envie réelle d’exploration.
            Exigence élevée, mais impatience avec la lenteur.
          </p>
        </div>
        <div className="card">
          <ShieldCheck size={28} />
          <h3>Cadre éthique</h3>
          <p className="helper">
            Usage volontaire uniquement. Le produit n’est ni un test clinique,
            ni une machine à profiler autrui à son insu.
          </p>
        </div>
      </section>
    </main>
  );
}