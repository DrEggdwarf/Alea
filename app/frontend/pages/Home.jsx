const FEATURES = [
  {
    icon: "fa-solid fa-comments",
    title: "Coach socratique",
    desc: "Dialogue en temps reel. Le coach questionne ton intention sans jamais reveler le meilleur coup.",
    color: "attack",
  },
  {
    icon: "fa-solid fa-chess-board",
    title: "Annotations visuelles",
    desc: "6 couleurs semantiques sur le plateau et dans le chat. Survole un mot, vois l'idee sur l'echiquier.",
    color: "good",
  },
  {
    icon: "fa-solid fa-bolt",
    title: "Analyse instantanee",
    desc: "Stockfish WASM dans ton navigateur. Zero latence, zero serveur. Profondeur de 1 a 25.",
    color: "passive",
  },
];

const STEPS = [
  { step: "01", label: "Joue un coup", icon: "fa-solid fa-chess-pawn" },
  { step: "02", label: "Le coach reagit", icon: "fa-solid fa-message" },
  { step: "03", label: "Explore les idees", icon: "fa-solid fa-lightbulb" },
  { step: "04", label: "Trouve par toi-meme", icon: "fa-solid fa-check" },
];

export default function Home() {
  return (
    <div className="home">
      <nav className="home-nav">
        <div className="home-nav__brand">
          <div className="home-nav__logo">A</div>
          <span className="home-nav__title">Alea</span>
        </div>
      </nav>

      <main className="home-main">
        <div className="home-hero">
          <div className="home-hero__icon">A</div>
          <h1 className="home-hero__title">
            Apprends les echecs<br />
            <span>par le questionnement</span>
          </h1>
          <p className="home-hero__desc">
            Un coach IA socratique qui te guide sans jamais
            te donner la reponse. Comprends pourquoi, pas juste quoi.
          </p>
          <div className="home-hero__actions">
            <a href="/play" className="home-hero__cta">
              <i className="fa-solid fa-chess-knight"></i>
              Jouer une partie
            </a>
          </div>
        </div>

        <div className="home-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="home-feature">
              <div className={`home-feature__icon home-feature__icon--${f.color}`}>
                <i className={f.icon}></i>
              </div>
              <h3 className="home-feature__title">{f.title}</h3>
              <p className="home-feature__desc">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="home-steps">
          <h2 className="home-steps__title">Comment ca marche</h2>
          <div className="home-steps__grid">
            {STEPS.map((s) => (
              <div key={s.step} className="home-step">
                <div className="home-step__icon">
                  <i className={s.icon}></i>
                </div>
                <div className="home-step__num">{s.step}</div>
                <div className="home-step__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="home-footer">
        Alea v1.0 &mdash; Aegyl 2026
      </footer>
    </div>
  );
}
