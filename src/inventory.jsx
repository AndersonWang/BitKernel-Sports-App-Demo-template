// Dev-only page (not part of the build): renders one screen by hash so scripts/inventory.mjs can
// list which shipped images and videos each screen shows (feeds Configure › Images / Videos).
// ?m renders it the way a phone shows Play (zoomed to the screen width, screen height).
import { createRoot } from 'react-dom/client';
import './proto/proto.css';
import './app/app.css';
import { getConfig } from './config/store.js';
import { Device } from './app/Player.jsx';

const id = location.hash.slice(1) || 'home';
const mobile = location.search.includes('m');
const zoom = innerWidth / 375;
if (mobile) document.documentElement.classList.add('is-mobile-play');
createRoot(document.getElementById('root')).render(mobile
  ? <div className="app-mobile" style={{ zoom }}><Device config={getConfig()} initial={id} height={Math.round(innerHeight / zoom)} /></div>
  : <div className="app-phone"><Device config={getConfig()} initial={id} /></div>);
