export function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>vibe-eyes</h1>
        <p className="tagline">Visual feedback loop for Claude Code</p>
      </header>

      <main className="cards">
        <div className="card">
          <div className="card-icon">📸</div>
          <h2>Screenshot</h2>
          <p>Capture your dev server UI automatically. Resized to 1072px for token efficiency.</p>
        </div>

        <div className="card">
          <div className="card-icon">🔍</div>
          <h2>Diff</h2>
          <p>Compare before and after screenshots. Claude evaluates changes using its own vision.</p>
        </div>

        <div className="card">
          <div className="card-icon">🔄</div>
          <h2>Loop</h2>
          <p>Autonomous iteration. Claude fixes layout issues without asking you to check.</p>
        </div>
      </main>

      <footer className="footer">
        <p>Built for vibecoders. Works everywhere Claude Code runs.</p>
      </footer>
    </div>
  );
}
