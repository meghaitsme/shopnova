import { Link } from 'react-router-dom';
import { SERVICES } from '../../data/services';

export default function Services() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <h1>What We Offer</h1>
        <p>
          ShopNova goes beyond just selling products — we make sure your
          shopping experience is smooth, safe, and enjoyable.
        </p>
      </section>

      <section className="services-grid">
        {SERVICES.map((s) => (
          <Link
            key={s.slug}
            to={`/services/${s.slug}`}
            className="service-card"
          >
            <div className="service-icon" style={{ background: s.color }}>
              <i className={`bx ${s.icon}`} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.short}</p>
            <span className="service-link">
              Learn more <i className="bx bx-right-arrow-alt" />
            </span>
          </Link>
        ))}
      </section>

      <section className="services-cta">
        <h2>Still have questions?</h2>
        <p>Our team is here to help you with anything you need.</p>
        <Link to="/contact" className="btn-primary">
          <i className="bx bx-envelope" /> Contact Us
        </Link>
      </section>
    </div>
  );
}
