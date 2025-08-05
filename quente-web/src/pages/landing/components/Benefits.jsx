import { Check, Clock, DollarSign, Shield, Zap, Users } from 'lucide-react';

const Benefits = () => {
  return (
    <section id="benefits" className="benefits-section">
      <div className="benefits-container">
        <div className="benefits-header">
          <h2 className="benefits-title">
            ¿Por qué elegir Cuenteo?
          </h2>
          <p className="benefits-desc">
            Nuestra solución de inventario y facturación ofrece ventajas únicas que ayudan a tu negocio a prosperar.
          </p>
        </div>

        <div className="benefits-grid">
          <div>
            <img 
              src="https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Equipo usando Cuenteo" 
              className="benefits-img"
            />
          </div>

          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon-bg teal">
                <Clock className="benefit-icon teal" />
              </div>
              <div>
                <h3 className="benefit-title">Ahorra Tiempo</h3>
                <p className="benefit-desc">
                  Automatiza tareas repetitivas y reduce la entrada manual de datos hasta en un 80%. Nuestros procesos optimizados te ayudan a enfocarte en hacer crecer tu negocio en lugar de papeleo.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-bg amber">
                <DollarSign className="benefit-icon amber" />
              </div>
              <div>
                <h3 className="benefit-title">Reduce Costos</h3>
                <p className="benefit-desc">
                  Reduce gastos operativos previniendo el exceso de inventario, minimizando las roturas de stock y optimizando tus niveles de inventario con nuestra previsión inteligente.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-bg blue">
                <Zap className="benefit-icon blue" />
              </div>
              <div>
                <h3 className="benefit-title">Aumenta la Eficiencia</h3>
                <p className="benefit-desc">
                  Optimiza operaciones con sistemas integrados de inventario y facturación que se comunican sin problemas, eliminando redundancias y errores.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-bg red">
                <Shield className="benefit-icon red" />
              </div>
              <div>
                <h3 className="benefit-title">Seguridad Mejorada</h3>
                <p className="benefit-desc">
                  Descansa tranquilo con características de seguridad empresarial que incluyen control de acceso basado en roles, almacenamiento de datos encriptado y copias de seguridad regulares.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-bg purple">
                <Users className="benefit-icon purple" />
              </div>
              <div>
                <h3 className="benefit-title">Satisfacción del Cliente</h3>
                <p className="benefit-desc">
                  Mejora la experiencia del cliente con procesamiento más rápido de pedidos, facturación precisa y entregas puntuales, lo que lleva a una mayor satisfacción y lealtad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;