import { ArrowRight, Package, Receipt, BarChart, Shield } from 'lucide-react';

const Hero = () => {
  return (
    <div className="hero-section" id="home">
      {/* Background with gradient overlay */}
      <div className="hero-bg-gradient" aria-hidden="true" />
      
      {/* Gradient blobs for visual interest */}
      <div className="hero-blob hero-blob-blue"></div>
      <div className="hero-blob hero-blob-teal"></div>
      
      <div className="hero-container">
        <div className="hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">
              Simplifica tu <span className="hero-title-highlight">Inventario</span> y <span className="hero-title-highlight">Facturación</span>
            </h1>
            <p className="hero-desc">
              Optimiza las operaciones de tu negocio con nuestro sistema integral de inventario y facturación. Ahorra tiempo, reduce errores y haz crecer tu negocio.
            </p>
            
            <div className="hero-actions">
              <a 
                href="#contact" 
                className="hero-btn-main"
              >
                Comenzar Ahora
                <ArrowRight className="hero-arrow" />
              </a>
              <a 
                href="#features" 
                className="hero-btn-secondary"
              >
                Ver Características
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="hero-img-card">
              <img 
                src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Panel de Control de Cuenteo" 
                className="hero-img"
              />
            </div>
            
            {/* Feature pills */}
           {/*  <div className="hero-pill hero-pill-inv">
              <Package className="hero-icon" />
              Control de Inventario
            </div>
            
            <div className="hero-pill hero-pill-bill">
              <Receipt className="hero-icon" />
              Facturación Inteligente
            </div>
            
            <div className="hero-pill hero-pill-analysis">
              <BarChart className="w-4 h-4" />
              Análisis en Tiempo Real
            </div> */}
          </div>
        </div>
        
        {/* Trust indicators */}
        {/* <div className="mt-16 text-center">
          <p className="text-blue-100 mb-6">Más de 1,000 empresas confían en nosotros</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D', 'Empresa E'].map((company, index) => (
              <div key={index} className="text-white opacity-70 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Hero;