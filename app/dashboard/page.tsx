import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, title, summary, confidence, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="page-shell">
      <nav className="nav">
        <Link href="/" className="pill">← Accueil</Link>
        <div className="nav-links">
          <Link href="/upload" className="pill">Nouvelle analyse</Link>
          <Link href="/method" className="pill">Méthode</Link>
        </div>
      </nav>

      <section className="card">
        <span className="badge">Dashboard</span>
        <h1 style={{ marginTop: 16 }}>Ton espace Profilia</h1>
        <p className="subtitle">
          Retrouve ici tes analyses sauvegardées et relance de nouveaux rapports.
        </p>
      </section>

      <section className="list" style={{ marginTop: 18 }}>
        {analyses?.length ? analyses.map((item) => (
          <div key={item.id} className="card">
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p className="muted">{item.summary}</p>
            <div className="hero-stats-grid">
              <div className="metric">
                <strong>{item.confidence}/100</strong>
                <span className="muted">confiance</span>
              </div>
              <div className="metric">
                <strong>{new Date(item.created_at).toLocaleDateString()}</strong>
                <span className="muted">date</span>
              </div>
              <div className="metric">
                <Link href={`/analysis/${item.id}`} className="pill">Ouvrir</Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              Aucune analyse sauvegardée pour l’instant.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}