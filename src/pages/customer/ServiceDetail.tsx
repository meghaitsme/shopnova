import { Link, useParams } from 'react-router-dom';
import { getService } from '../../data/services';

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getService(slug) : undefined;

  if (!service) {
    return (
      <div className="service-detail">
        <h2>Service not found</h2>
        <p className="muted">The service you are looking for does not exist.</p>
        <Link to="/services" className="btn-primary">
          <i className="bx bx-arrow-back" /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="service-detail">
      <Link to="/services" className="back-link">
        <i className="bx bx-chevron-left" /> All Services
      </Link>

      <header className="service-detail-header">
        <div className="service-icon-lg" style={{ background: service.color }}>
          <i className={`bx ${service.icon}`} />
        </div>
        <div>
          <h1>{service.title}</h1>
          <p className="muted">{service.short}</p>
        </div>
      </header>

      <section className="service-detail-body">
        <p className="service-detail-text">{service.longDescription}</p>

        <h2>What&apos;s included</h2>
        <ul className="service-features">
          {service.features.map((f) => (
            <li key={f}>
              <i className="bx bx-check-circle" /> {f}
            </li>
          ))}
        </ul>
      </section>

      <div className="service-detail-cta">
        <Link to="/contact" className="btn-primary">
          <i className="bx bx-envelope" /> Ask a question
        </Link>
        <Link to="/products" className="btn-ghost">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
