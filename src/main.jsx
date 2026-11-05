import { Component, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-sans/latin-300.css';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-500.css';
import '@fontsource/noto-sans/latin-600.css';
import '@fontsource/noto-sans/latin-700.css';
import '@fontsource/noto-sans/latin-800.css';
import '@fontsource/fira-sans-condensed/latin-700.css';
import '@fontsource/fira-sans-condensed/latin-300-italic.css';
import './proto/proto.css';
import './app/app.css';
import { useConfig, getConfig, resetSaved } from './config/store.js';
import { loadMedia } from './config/media.js';
import { Player, MobilePlayer, useMobile } from './app/Player.jsx';
import Dashboard from './app/Dashboard.jsx';

function useHash() {
  const read = () => (location.hash || '').replace(/^#\/?/, '');
  const [h, set] = useState(read);
  useEffect(() => { const f = () => set(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return h;
}

function App() {
  const config = useConfig();
  const route = useHash() === 'configure' ? 'configure' : 'play';
  const mobile = useMobile();
  // On a phone, Play is the app alone, full screen: what a client sees when they open the link.
  if (mobile && route === 'play') return <MobilePlayer config={config} />;
  return (
    <div className="app">
      <header className="app-top">
        <b>Sports App Demo</b>
        <nav>
          <a href="#play" aria-current={route === 'play'}>Play</a>
          <a href="#configure" aria-current={route === 'configure'}>Configure</a>
        </nav>
        <span className="app-top__client">{config.client.name} · {config.theme.mode}</span>
      </header>
      {route === 'configure' ? <Dashboard /> : <Player config={config} />}
    </div>
  );
}

// Safety net: a render error shows a way out instead of a blank page. Settings live in browser
// storage, so without this one bad save would blank the page on every reload.
class Crash extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="app-crash" role="alert">
        <h1>This screen hit an error</h1>
        <p>Your settings are safe. Reload to carry on. Reset is only needed if the page keeps breaking straight after you change something in Configure, and it deletes your uploaded images and text.</p>
        <div className="app-crash__actions">
          <button onClick={() => location.reload()}>Reload</button>
          <button className="app-crash__secondary" onClick={() => { if (confirm('Delete all your Configure settings, including uploaded images, and reload?')) { resetSaved(); location.hash = '#configure'; location.reload(); } }}>Reset settings…</button>
        </div>
        <pre>{String(this.state.error?.message || this.state.error).slice(0, 300)}</pre>
      </div>
    );
  }
}

// Uploaded images/videos load from IndexedDB first, so the first frame already shows them.
loadMedia(getConfig()).finally(() => createRoot(document.getElementById('root')).render(<Crash><App /></Crash>));
