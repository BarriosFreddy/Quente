import { BarChart2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github as GitHub } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div>
            <div className="footer-brand">
              <BarChart2 className="footer-brand-icon" />
              <span className="footer-brand-title">Cuenteo</span>
            </div>
            <p className="footer-description">
              Optimizando la gestión de inventario y procesos de facturación para empresas en todo el mundo.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link">
                <Facebook className="footer-social-icon" />
              </a>
              <a href="#" className="footer-social-link">
                <Twitter className="footer-social-icon" />
              </a>
              <a href="#" className="footer-social-link">
                <Instagram className="footer-social-icon" />
              </a>
              <a href="#" className="footer-social-link">
                <Linkedin className="footer-social-icon" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="footer-title">Enlaces Rápidos</h3>
            <ul className="footer-links">
              <li>
                <a href="#features" className="footer-link">Características</a>
              </li>
              <li>
                <a href="#pricing" className="footer-link">Precios</a>
              </li>
              <li>
                <a href="#testimonials" className="footer-link">Testimonios</a>
              </li>
              <li>
                <a href="#" className="footer-link">Blog</a>
              </li>
              <li>
                <a href="#contact" className="footer-link">Contacto</a>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="footer-title">Recursos</h3>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">Centro de Ayuda</a>
              </li>
              <li>
                <a href="#" className="footer-link">Documentación</a>
              </li>
              <li>
                <a href="#" className="footer-link">Referencia API</a>
              </li>
              <li>
                <a href="#" className="footer-link">Foro Comunitario</a>
              </li>
              <li>
                <a href="#" className="footer-link">Tutoriales en Video</a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="footer-title">Contáctanos</h3>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <Mail className="footer-contact-icon" />
                <span>info@cuenteo.com</span>
              </li>
              <li className="footer-contact-item">
                <Phone className="footer-contact-icon" />
                <span>+1 (234) 567-890</span>
              </li>
              <li className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                <span>123 Business Ave, Suite 100<br />San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="footer-divider" />
        <hr className="border-gray-800 my-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {currentYear} Cuenteo. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="footer-link">Política de Privacidad</a>
            <a href="#" className="footer-link">Términos de Servicio</a>
            <a href="#" className="footer-link">Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;