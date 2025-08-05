import { useState } from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a server
    console.log(formData);
    alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
    setFormData({
      name: '',
      email: '',
      company: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">
            Contáctanos
          </h2>
          <p className="contact-desc">
            ¿Tienes preguntas sobre Cuenteo? Nuestro equipo está aquí para ayudarte a encontrar la solución perfecta para tu negocio.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3 className="contact-info-title">Información de Contacto</h3>
            
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="contact-info-label">Correo Electrónico</p>
                  <a href="mailto:info@cuenteo.com" className="contact-info-link">
                    info@cuenteo.com
                  </a>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="contact-info-label">Teléfono</p>
                  <a href="tel:+1234567890" className="contact-info-link">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="contact-info-label">Chat en Vivo</p>
                  <p className="contact-info-meta">Disponible Lunes-Viernes, 9AM-5PM EST</p>
                </div>
              </div>
            </div>
            
            <div className="contact-help">
              <h4 className="contact-help-title">¿Necesitas ayuda inmediata?</h4>
              <p className="contact-help-desc">Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta.</p>
              <button className="contact-help-btn">
                Programar una Demo
              </button>
            </div>
          </div>
          
          <div className="contact-info">
            <h3 className="contact-info-title">Envíanos un Mensaje</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="contact-form-fields">
                <div>
                  <label htmlFor="name" className="contact-form-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="contact-form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="contact-form-label">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="contact-form-input"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="contact-form-label">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-form-input"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="contact-form-btn"
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;