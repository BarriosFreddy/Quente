import { useState } from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Inicial",
      monthlyPrice: 29,
      annualPrice: 290, // 2 months free
      description: "Perfecto para pequeñas empresas que están comenzando",
      features: [
        "Hasta 1,000 artículos en inventario",
        "Reportes básicos",
        "5 cuentas de usuario",
        "Soporte por correo",
        "Almacenamiento en la nube (10GB)",
        "Acceso a la app móvil"
      ],
      highlighted: false,
      buttonText: "Prueba Gratuita"
    },
    {
      name: "Profesional",
      monthlyPrice: 79,
      annualPrice: 790, // 2 months free
      description: "Ideal para empresas en crecimiento con mayores necesidades",
      features: [
        "Hasta 10,000 artículos en inventario",
        "Reportes y análisis avanzados",
        "20 cuentas de usuario",
        "Soporte prioritario por correo",
        "Almacenamiento en la nube (50GB)",
        "Acceso a la app móvil",
        "Soporte para múltiples ubicaciones",
        "Acceso a API"
      ],
      highlighted: true,
      buttonText: "Prueba Gratuita"
    },
    {
      name: "Empresarial",
      monthlyPrice: 199,
      annualPrice: 1990, // 2 months free
      description: "Para grandes empresas con requisitos complejos",
      features: [
        "Artículos ilimitados en inventario",
        "Reportes y análisis personalizados",
        "Usuarios ilimitados",
        "Soporte 24/7 dedicado",
        "Almacenamiento en la nube (500GB)",
        "Acceso a la app móvil",
        "Soporte para múltiples ubicaciones",
        "Acceso a API",
        "Integraciones personalizadas",
        "Gerente de cuenta dedicado"
      ],
      highlighted: false,
      buttonText: "Contactar Ventas"
    }
  ];

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2 className="pricing-title">
            Precios Simples y Transparentes
          </h2>
          <p className="pricing-desc">
            Elige el plan que mejor se adapte a las necesidades de tu negocio
          </p>
          
          {/* Billing toggle */}
          <div className="pricing-toggle">
            <span className={`pricing-toggle-label${!isAnnual ? ' active' : ''}`}>
              Mensual
            </span>
            <button
              className={`pricing-switch${isAnnual ? ' active' : ''}`}
              onClick={() => setIsAnnual(!isAnnual)}
              style={{ backgroundColor: isAnnual ? '#2563EB' : '#CBD5E1' }}
            >
              <span
                className={`pricing-switch-knob${isAnnual ? ' annual' : ''}`}
              />
            </button>
            <span className={`pricing-toggle-label${isAnnual ? ' active' : ''}`}>
              Anual <span className="pricing-save">Ahorra 20%</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`pricing-card${plan.highlighted ? ' highlighted' : ''}`}
            >
              {plan.highlighted && (
                <div className="pricing-popular">
                  Más Popular
                </div>
              )}
              <div className={`pricing-card-body${plan.highlighted ? ' pt-10' : ''}`}>
                <h3 className="pricing-card-title">{plan.name}</h3>
                <p className="pricing-card-desc">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="pricing-price">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="pricing-duration">/{isAnnual ? 'año' : 'mes'}</span>
                </div>
                
                <div className="pricing-features">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="pricing-feature">
                      <span className="pricing-feature-icon-bg">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      </span>
                      <span className="pricing-feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <a
                  href="#contact"
                  className={`pricing-btn${plan.highlighted ? ' highlighted' : ''}`}
                >
                  {plan.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Todos los planes incluyen una prueba gratuita de 14 días. No se requiere tarjeta de crédito.
          </p>
          <a href="#contact" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
            ¿Necesitas un plan personalizado? Contacta a nuestro equipo de ventas
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;