export default function Privacy() {
  return (
    <div className="settings-page">
      <h1>Privacy</h1>
      <p className="muted">Control your data and privacy preferences.</p>

      <section className="settings-section">
        <h2>Data & Personalization</h2>
        <ul className="settings-list">
          <li>
            <div>
              <strong>Download your data</strong>
              <p className="muted">Get a copy of your orders, addresses, and activity.</p>
            </div>
            <button className="btn-ghost">Request Export</button>
          </li>
          <li>
            <div>
              <strong>Personalized recommendations</strong>
              <p className="muted">Use my browsing history to suggest products.</p>
            </div>
            <button className="btn-ghost">Manage</button>
          </li>
        </ul>
      </section>

      <section className="settings-section danger-zone">
        <h2>Danger Zone</h2>
        <ul className="settings-list">
          <li>
            <div>
              <strong>Delete account</strong>
              <p className="muted">Permanently remove your account and all data.</p>
            </div>
            <button className="btn-danger">Delete Account</button>
          </li>
        </ul>
      </section>
    </div>
  );
}
