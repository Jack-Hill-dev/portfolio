
function App() {
  return (
    <main className="journey">
      <div className="stage">
        <section className="scene intro" aria-label="Introduction">
          <div className="about-copy">
            <p className="statement">Hello, I'm Your Name.</p>
            <p className="statement">A developer based in the UK.</p>
            <p className="statement">I create digital experiences.</p>
          </div>
        </section>

        <section className="scene work" aria-labelledby="project-one">
          <figure className="work-center">
            <div className="visual">Project preview</div>
            <figcaption className="caption">
              <h2 id="project-one">Field Notes</h2>
              <p>01 / Editorial design</p>
            </figcaption>
          </figure>
        </section>

        <section className="scene work" aria-labelledby="project-two">
          <figure className="work-center">
            <div className="visual">Project preview</div>
            <figcaption className="caption">
              <h2 id="project-two">Still Life</h2>
              <p>02 / Visual identity</p>
            </figcaption>
          </figure>
        </section>

        <section className="scene contact" aria-label="Contact">
          <div className="center">
            <h2>Let's talk.</h2>
            <a href="mailto:you@example.com">you@example.com</a>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
