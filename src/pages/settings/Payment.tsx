export default function Payment() {
  const cards = [
    { id: 1, brand: 'Visa',       last4: '4242', exp: '12/26', primary: true },
    { id: 2, brand: 'Mastercard', last4: '8888', exp: '03/27', primary: false },
  ];

  return (
    <div className="settings-page">
      <h1>Payment Methods</h1>
      <p className="muted">Manage your saved cards for faster checkout.</p>

      <div className="card-list">
        {cards.map((c) => (
          <div key={c.id} className="card-row">
            <div className="card-brand">
              <i className="bx bx-credit-card" />
              <div>
                <strong>{c.brand} •••• {c.last4}</strong>
                <p className="muted">Expires {c.exp}</p>
              </div>
            </div>
            <div className="card-actions">
              {c.primary && <span className="badge-primary">Primary</span>}
              <button className="btn-ghost">Edit</button>
              <button className="btn-ghost danger">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" style={{ marginTop: 20 }}>
        <i className="bx bx-plus" /> Add Payment Method
      </button>
    </div>
  );
}
