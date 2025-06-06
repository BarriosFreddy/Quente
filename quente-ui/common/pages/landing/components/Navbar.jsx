import { useState } from 'react';
import { Menu, X, BarChart2 } from 'lucide-react';

const Navbar = ({ scrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Características', href: '#features' },
    { name: 'Beneficios', href: '#benefits' },
    { name: 'Precios', href: '#pricing' },
    { name: 'Testimonios', href: '#testimonials' },
    { name: 'Contacto', href: '#contact' },
  ];

  return (
    <nav
      className={`navbar-fixed ${scrolled ? 'navbar-bg-scrolled' : 'navbar-bg-transparent'}`}
    >
      <div className="navbar-container">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="flex items-center gap-2">
              <BarChart2 className="h-8 w-8 text-blue-600" />
              <span className={`font-bold text-xl ${scrolled ? 'text-blue-600' : 'text-white'}`}>Cuenteo</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="md-flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`font-medium hover-text-blue-600 transition-colors ${scrolled ? 'text-gray-800' : 'text-white'}`}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              className="bg-blue-600 text-white px-6 py-2 rounded-md bg-blue-700 transition-colors font-medium"
            >
              Empezar
            </a>
            <a
              href="/login"
              className={`ml-2 border-2 px-6 py-2 rounded-md font-medium transition-colors ${scrolled ? 'border-blue-600 text-blue-600 bg-white hover:bg-blue-50' : 'border-white text-white bg-transparent hover:bg-blue-600 hover:text-white'}`}
            >
              Ingresa
            </a>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md-hidden">
            <button 
              onClick={toggleMenu}
              className={`p-2 rounded-md focus-outline-none ${scrolled ? 'text-gray-800' : 'text-white'}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md-hidden absolute top-full left-0 right-0 bg-white shadow-md">
            <div className="flex flex-col space-y-3 px-4 py-5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-800 font-medium hover-text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                className="bg-blue-600 text-white px-6 py-2 rounded-md bg-blue-700 transition-colors font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Empezar
              </a>
              <a
                href="/login"
                className="mt-2 border-2 border-blue-600 text-blue-600 bg-white px-6 py-2 rounded-md font-medium text-center transition-colors hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;