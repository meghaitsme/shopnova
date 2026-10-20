import { useState } from 'react';

interface Pref {
  key: string;
  label: string;
  desc: string;
  default: boolean;
}

const PREFS: Pref[] = [
  { key: 'orderUpdates',   label: 'Order Updates',   desc: 'Get notified when your order status changes.',    default: true  },
  { key: 'promotions',     label: 'Promotions',       desc: 'Receive offers and sale alerts.',                  default: false },
  { key: 'newsletter',     label: 'Newsletter',       desc: 'Monthly digest with product recommendations.',     default: true  },
  { key: 'security',       label: 'Security Alerts',  desc: 'Important notices about your account security.',  default: true  },
];

export default function Notifications() {
  const [state, setState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(PREFS.map((p) => [p.key, p.default]))
  );

  const toggle = (key: string) =>
    setState((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="settings-page">
      <h1>Notification Settings</h1>
      <p className="muted">Choose what emails and alerts you want to receive.</p>

      <div className="toggle-list">
        {PREFS.map((p) => (
          <div key={p.key} className="toggle-row">
            <div>
              <strong>{p.label}</strong>
              <p className="muted">{p.desc}</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={state[p.key]}
                onChange={() => toggle(p.key)}
              />
              <span className="slider" />
            </label>
          </div>
        ))}
      </div>

      <p className="form-message">💾 Preferences saved locally (backend integration pending)</p>
    </div>
  );
}
