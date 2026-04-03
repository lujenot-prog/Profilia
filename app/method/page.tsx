import Link from "next/link";

const bigFive = [
  {
    title: "Ouverture",
    text: "Curiosité intellectuelle, goût pour les idées nouvelles, la complexité, l’exploration et l’imagination."
  },
  {
    title: "Conscienciosité",
    text: "Organisation, discipline, sens du devoir, constance, précision et rapport structuré aux objectifs."
  },
  {
    title: "Extraversion",
    text: "Énergie tournée vers l’extérieur, assertivité, expressivité, recherche de stimulation et d’interaction."
  },
  {
    title: "Agréabilité",
    text: "Coopération, chaleur relationnelle, souci d’autrui, diplomatie, confiance et orientation prosociale."
  },
  {
    title: "Stabilité émotionnelle",
    text: "Capacité à rester stable face au stress, à l’incertitude et aux variations émotionnelles."
  }
];

const productLayers = [
  {
    title: "Style analytique",
    text: "Dans Profilia, ce bloc décrit la tendance à structurer, comparer, préciser et raisonner explicitement."
  },
  {
    title: "Vision stratégique",
    text: "Détecte l’orientation projet, la projection dans le temps, le cadrage et la recherche d’exécution."
  },
  {
    title: "Exigence du rendu",
    text: "Mesure l’attention à la qualité, à la cohérence, au ton juste et à la crédibilité du résultat final."
  },
  {
    title: "Rapport au flou",
    text: "Observe comment le langage gère l’hésitation, l’incertitude, le besoin de clarification et la tolérance à l’ambiguïté."
  }
];

const principles = [
  "Le système ne pose pas de diagnostic clinique.",
  "Les résultats décrivent des tendances exprimées dans un corpus textuel, pas la personne entière.",
  "Les comparaisons à des figures publiques ou à des personnages sont des résonances de style, pas des équivalences littérales.",
  "Le niveau de confiance dépend du volume, de la diversité et de la cohérence des données disponibles.",
  "Les inférences sont plus fiables quand elles reposent sur plusieurs conversations et plusieurs contextes d’écriture."
];

const nextSteps = [
  "Ajouter des extraits de preuve textuelle pour chaque grande dimension.",
  "Créer une couche Big Five explicite dans le rapport final.",
  "Comparer les scores inférés à des questionnaires auto-déclarés sur un jeu pilote volontaire.",
  "Mesurer la stabilité des résultats dans le temps et selon différents sous-corpus."
];

export default function MethodPage() {
  return (
    <main className="page-shell">
      <nav className="nav">
        <Link href="/" className="pill">
          ← Accueil
        </Link>
        <div className="nav-links">
          <Link href="/upload" className="pill">
            Nouvelle analyse
          </Link>
          <Link href="/results" className="pill">
            Résultats
          </Link>
        </div>
      </nav>

      <section className="card">
        <span className="badge">Méthode</span>
        <p className="premium-kicker">Fondations scientifiques</p>
        <h1 className="premium-title" style={{ maxWidth: 900 }}>
          Comment Profilia construit ses analyses
        </h1>
        <p className="premium-subtitle" style={{ maxWidth: 900 }}>
          Profilia n’essaie pas de “lire l’âme”. Le produit estime, à partir du
          langage, des tendances de personnalité, de style cognitif et de rapport
          à l’action. Le but n’est pas de produire un verdict, mais un miroir
          probabiliste, argumenté et lisible.
        </p>

        <div className="hero-stats-grid" style={{ marginTop: 24 }}>
          <div className="metric premium-metric">
            <strong>Big Five</strong>
            <span className="muted">cadre théorique de base</span>
          </div>
          <div className="metric premium-metric">
            <strong>Indices linguistiques</strong>
            <span className="muted">signaux textuels + structure</span>
          </div>
          <div className="metric premium-metric">
            <strong>Inférence prudente</strong>
            <span className="muted">pas de diagnostic clinique</span>
          </div>
        </div>
      </section>

      <section className="two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <p className="section-eyebrow">Cadre de base</p>
          <h2 style={{ marginTop: 0 }}>Le socle : le Big Five</h2>
          <p className="muted">
            Le modèle des Big Five sert de référence générale pour structurer les
            grands traits de personnalité. Profilia ne prétend pas remplacer un
            test psychométrique validé ; il s’en inspire comme colonne vertébrale
            théorique, puis ajoute une couche produit plus lisible pour
            l’utilisateur.
          </p>

          <div className="list">
            {bigFive.map((item) => (
              <div key={item.title} className="vibe-card">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{item.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-eyebrow">Couche produit</p>
          <h2 style={{ marginTop: 0 }}>Les dimensions maison</h2>
          <p className="muted">
            Pour rendre la lecture plus concrète, Profilia transforme une partie
            des signaux en dimensions plus parlantes dans un usage quotidien :
            style analytique, vision stratégique, exigence du rendu, besoin de
            clarté, énergie d’action, ou encore style relationnel.
          </p>

          <div className="list">
            {productLayers.map((item) => (
              <div key={item.title} className="vibe-card">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{item.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="premium-grid" style={{ marginTop: 18 }}>
        <div className="card">
          <p className="section-eyebrow">Pipeline</p>
          <h2 style={{ marginTop: 0 }}>Comment l’analyse est produite</h2>

          <div className="list">
            <div className="dimension-card">
              <h3 style={{ marginTop: 0 }}>1. Parsing du corpus</h3>
              <p className="muted" style={{ margin: 0 }}>
                Les conversations sont transformées en texte exploitable, puis
                segmentées pour conserver l’ordre, les rôles et la structure des
                échanges.
              </p>
            </div>

            <div className="dimension-card">
              <h3 style={{ marginTop: 0 }}>2. Extraction de signaux</h3>
              <p className="muted" style={{ margin: 0 }}>
                Le moteur observe des indices linguistiques : précision, style
                directif, intensité émotionnelle, orientation projet,
                reformulations, rapport à l’incertitude, et densité stratégique.
              </p>
            </div>

            <div className="dimension-card">
              <h3 style={{ marginTop: 0 }}>3. Base heuristique</h3>
              <p className="muted" style={{ margin: 0 }}>
                Une première couche calcule des scores structurés pour éviter
                qu’une génération libre devienne trop flatteuse, trop vague ou
                incohérente.
              </p>
            </div>

            <div className="dimension-card">
              <h3 style={{ marginTop: 0 }}>4. Raffinement IA</h3>
              <p className="muted" style={{ margin: 0 }}>
                Une seconde couche affine les explications, les tensions
                internes, les comparaisons et la synthèse globale, tout en restant
                contrainte par la base heuristique.
              </p>
            </div>
          </div>
        </div>

        <div className="side-stack">
          <div className="card">
            <p className="section-eyebrow">Confiance</p>
            <h2 style={{ marginTop: 0 }}>D’où vient le score de confiance ?</h2>
            <div className="list">
              <blockquote className="quote">
                Plus le corpus est riche, varié et cohérent, plus l’inférence est
                crédible.
              </blockquote>
              <blockquote className="quote">
                Un texte très court, monotone ou ultra-contextuel donne une
                lecture plus fragile.
              </blockquote>
              <blockquote className="quote">
                Le score de confiance n’est pas une vérité scientifique : c’est un
                indicateur de robustesse interne.
              </blockquote>
            </div>
          </div>

          <div className="card">
            <p className="section-eyebrow">Preuves</p>
            <h2 style={{ marginTop: 0 }}>Ce qui rendra l’outil plus robuste</h2>
            <div className="list">
              {nextSteps.map((item, index) => (
                <blockquote key={index} className="quote">
                  {item}
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <p className="section-eyebrow">Limites</p>
          <h2 style={{ marginTop: 0 }}>Ce que Profilia ne fait pas</h2>
          <div className="list">
            {principles.map((item, index) => (
              <blockquote key={index} className="quote">
                {item}
              </blockquote>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-eyebrow">Usage responsable</p>
          <h2 style={{ marginTop: 0 }}>Le bon positionnement du produit</h2>
          <p className="muted">
            Le produit devient crédible lorsqu’il se présente comme un outil
            d’introspection assistée, fondé sur des indices de langage, avec des
            limites affichées, des preuves textuelles et une méthode explicite.
          </p>
          <p className="muted">
            Le but n’est pas de remplacer les psychologues, les tests validés ou
            les évaluations cliniques. Le but est d’aider une personne à mieux
            voir ce que son langage laisse apparaître d’elle.
          </p>

          <div className="dimension-card" style={{ marginTop: 14 }}>
            <h3 style={{ marginTop: 0 }}>Formulation recommandée</h3>
            <p className="muted" style={{ margin: 0 }}>
              “Profilia estime, à partir du langage, des tendances de personnalité
              et de style cognitif, avec un niveau de confiance, des éléments
              d’appui textuels et des limites explicites.”
            </p>
          </div>
        </div>
      </section>

      <p className="footer-note">
        Cette page présente une méthode d’inférence textuelle inspirée par des
        cadres psychométriques reconnus. Elle ne constitue ni une validation
        clinique, ni un test psychologique officiel.
      </p>
    </main>
  );
}