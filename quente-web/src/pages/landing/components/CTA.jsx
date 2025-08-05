import { ArrowRight } from 'lucide-react';


const CTA = ({ title, subtitle, buttonText }) => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">{title}</h2>
          <p className="cta-desc">{subtitle}</p>
          <a
            href="#contact"
            className="cta-btn"
          >
            {buttonText}
            <ArrowRight className="cta-arrow" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;