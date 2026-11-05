// Loading Screen (638:21321) and Login page - Email (default) (640:39648).
import { Component, useEffect, useMemo, useState } from 'react';
import { ShaderFill } from '../lib/custom-effect-runtime/index';
import { setup as setupMovingGradient, render as renderMovingGradient, manifest as manifestMovingGradient } from '../lib/custom-effects/CodeComponentId_8ce92017e53431a2f04b3574f4ba7c98f6f55f1e_625';
import { Button, Icon, useSlot, useSlotOverride } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { launchColours } from '../tokens/theme.js';

// Shader params exactly as authored in Figma ("Moving gradient").
const LAUNCH_SHADER = {
  setup: setupMovingGradient,
  render: renderMovingGradient,
  params: {
    intensity: 4.289999961853027,
    gradient: {
      stops: [
        { position: 0, color: { r: 0, g: 0.545098066329956, b: 0.1568627506494522, a: 1 } },
        { position: 0.5, color: { r: 0, g: 0.6078431606292725, b: 0.3490196168422699, a: 1 } },
        { position: 1, color: { r: 0.8705882430076599, g: 0.5843137502670288, b: 0, a: 1 } },
      ],
    },
    gradientBalance: 0,
    material: 0,
    morphSpeed: 3.740000009536743,
    detail: 1.7799999713897705,
    twist: 0.03999999910593033,
    zoom: 72,
    gradientMethod: 0,
    warp: 0.25999999046325684,
    rotationSpeed: 12,
  },
  manifest: manifestMovingGradient,
};

// The shader is decoration: if it fails in some browser, keep the CSS gradient behind it
// instead of taking the whole demo down.
class ShaderGuard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e) { console.warn('Launch shader disabled:', e); }
  render() { return this.state.failed ? null : this.props.children; }
}

// Loading Screen — after 5 s, dissolves (ease-out, 300 ms) into Login, as wired in Figma.
// Colour stops come from Configure › Opening animation, else the theme (theme-launch.json), else Figma.
const hexToRgb = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255, a: 1 });
const withColours = (colours) => ({
  ...LAUNCH_SHADER,
  params: { ...LAUNCH_SHADER.params, gradient: { stops: LAUNCH_SHADER.params.gradient.stops.map((st, i) => ({ ...st, color: hexToRgb(colours[i]) })) } },
});

export function Launch() {
  const nav = useNav();
  const crest = useSlot('club-crest');
  const colours = launchColours(nav.config);
  const shader = useMemo(() => withColours(colours), [colours.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => nav.replace('login', { transition: 'dissolve', duration: 300 }), 5000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="p-screen p-launch" style={{ background: `linear-gradient(141deg, ${colours[0]} 0%, ${colours[1]} 50%, ${colours[2]} 100%)` }}>
      {/* The shader paints over this gradient; browsers without WebGPU keep the gradient. */}
      <ShaderGuard key={colours.join()}><ShaderFill className="p-launch__shader" shader={shader} /></ShaderGuard>
      <img className="p-launch__crest" src={crest} alt="" />
    </div>
  );
}

const TABS = [
  { id: 'email', label: 'Email', placeholder: 'Enter your email', type: 'email' },
  { id: 'phone', label: 'Phone', placeholder: 'Enter your phone number', type: 'tel' },
  { id: 'uid', label: 'UID', placeholder: 'Enter your UID', type: 'text' },
];

// Login page - Email (default). Any input (or none) logs in: it's a demo.
export function Login() {
  const nav = useNav();
  // Figma shows a placeholder mark here; the demo uses the club crest unless a login logo is uploaded in Configure.
  const crest = useSlot('club-crest');
  const logo = useSlotOverride('login-logo') || crest;
  const [tab, setTab] = useState('email');
  const [showPw, setShowPw] = useState(false);
  const t = TABS.find((x) => x.id === tab);
  const submit = (e) => { e.preventDefault(); nav.replace('home'); };
  return (
    <div className="p-screen p-login">
      <form className="p-login__box" onSubmit={submit}>
        <div className="p-login__top">
          <img className="p-login__logo" src={logo} alt="" />
          <h1 className="p-subtitle p-login__title">Please Sign In</h1>
          <div className="p-tabs" role="tablist">
            {TABS.map((x) => (
              <button key={x.id} type="button" role="tab" aria-selected={x.id === tab} className={'p-tabs__item' + (x.id === tab ? ' is-active' : '')} onClick={() => setTab(x.id)}>{x.label}</button>
            ))}
          </div>
        </div>
        <div className="p-login__main">
          <div className="p-login__fields">
            <label className="p-field">
              <input key={tab} type={t.type} placeholder={t.placeholder} aria-label={t.placeholder} autoComplete="off" />
            </label>
            <label className="p-field">
              <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" aria-label="Password" autoComplete="off" />
              <button type="button" className="p-field__icon" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((v) => !v)}>
                <Icon name="eye-off" size={18} color="var(--colour-icon-tertiary)" />
              </button>
            </label>
          </div>
          <div className="p-login__ctas">
            <button type="submit" className="p-btn p-btn--primary p-btn--block p-btn--lg">Log In</button>
            <button type="button" className="p-login__link" onClick={nav.dead}>Forgot password?</button>
          </div>
          <div className="p-login__alt">
            <div className="p-divider"><i /><span>or</span><i /></div>
            <Button variant="secondary" icon="recharge" block onClick={nav.dead}>Recharge Code</Button>
          </div>
          <p className="p-login__signup">Don’t have an account? <button type="button" onClick={nav.dead}>Sign up</button></p>
        </div>
      </form>
    </div>
  );
}
