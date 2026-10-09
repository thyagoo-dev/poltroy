function App() {
  return (
    <main className="app-shell">
      <section
        className="foundation-card"
        aria-labelledby="poltroy-foundation-title"
      >
        <span className="foundation-eyebrow">POLTROY</span>

        <h1 id="poltroy-foundation-title">
          Fundação do projeto pronta.
        </h1>

        <p className="foundation-description">
          A base técnica do Poltroy está funcionando. A partir daqui,
          construiremos a aplicação de forma incremental, mobile-first e
          offline-first.
        </p>

        <dl className="foundation-status">
          <div>
            <dt>Stack</dt>
            <dd>React + TypeScript + Vite</dd>
          </div>

          <div>
            <dt>Estratégia</dt>
            <dd>Mobile-first · Offline-first</dd>
          </div>

          <div>
            <dt>Etapa</dt>
            <dd>01 · Fundação</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

export default App