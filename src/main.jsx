import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-sans/300.css';
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/500.css';
import '@fontsource/noto-sans/600.css';
import '@fontsource/noto-sans/700.css';
import './proto/proto.css';
import './app/app.css';
import { IS_CLIENT, useConfig } from './config/store.js';
import { Player } from './app/Player.jsx';
import Dashboard from './app/Dashboard.jsx';

function useHash() {
  const [h, set] = useState(location.hash || '#/');
  useEffect(() => { const f = () => set(location.hash || '#/'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return h;
}

function App() {
  const config = useConfig();
  const hash = useHash();
  // Packaged client builds: player only, whatever the URL says.
  if (IS_CLIENT) return <div className="app app--client"><Player config={config} isClient /></div>;
  const route = hash.replace('#', '') || '/';
  if (route === '/client') return <div className="app app--client"><Player config={config} isClient /></div>;
  return (
    <div className="app">
      <header className="app-top">
        <b>Sports App Demo</b>
        <nav>
          <a href="#/" aria-current={route === '/'}>Preview</a>
          <a href="#/dashboard" aria-current={route === '/dashboard'}>Dashboard</a>
        </nav>
        <span className="app-top__client">{config.client.name} · {config.theme.mode}</span>
      </header>
      {route === '/dashboard' ? <Dashboard /> : <Player config={config} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
