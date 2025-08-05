import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Cuenteo ha transformado completamente la forma en que gestionamos nuestro inventario. Hemos reducido las roturas de stock en un 75% y nuestro proceso de facturación ahora es perfecto. Solo el ahorro de tiempo ha valido la inversión.",
      author: "Sara Jiménez",
      position: "Gerente de Operaciones",
      company: "Soluciones Minoristas Globales",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      quote: "Como propietario de una pequeña empresa, estaba abrumado con el seguimiento del inventario y la facturación. Cuenteo simplificó todo con una interfaz intuitiva que no requiere experiencia técnica para usar.",
      author: "Miguel Rodríguez",
      position: "Propietario",
      company: "Ferretería Rodríguez",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      quote: "Las funciones de análisis en Cuenteo nos han dado información que nunca antes tuvimos. Hemos optimizado nuestros niveles de stock y mejorado el flujo de caja en más del 30% en solo seis meses.",
      author: "Ana López",
      position: "Directora Financiera",
      company: "Innovaciones Tecnológicas S.A.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      quote: "El soporte al cliente en Cuenteo es excepcional. Cada vez que hemos tenido preguntas, su equipo ha sido receptivo y servicial. El proceso de incorporación fue suave y bien guiado.",
      author: "David Torres",
      position: "Director de TI",
      company: "Manufacturas Meridian",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  
  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };
  
  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="testimonials-desc">
            Conoce a las empresas que han transformado sus operaciones con Cuenteo
          </p>
        </div>

        <div className="testimonials-slider">
          {/* Testimonial cards */}
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} fill="currentColor" className="h-8 w-8" />
              ))}
            </div>
            
            <blockquote className="testimonial-quote">
              "{testimonials[activeIndex].quote}"
            </blockquote>
            
            <div className="testimonial-indicators">
              <img 
                src={testimonials[activeIndex].avatar} 
                alt={testimonials[activeIndex].author} 
                className="testimonial-avatar"
              />
              <div>
                <p className="testimonial-name">{testimonials[activeIndex].author}</p>
                <p className="testimonial-role">{testimonials[activeIndex].position}</p>
                <p className="testimonial-company">{testimonials[activeIndex].company}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="testimonial-nav">
            <button 
               onClick={prevTestimonial}
               className="testimonial-nav-btn"
             >
              <ChevronLeft className="h-6 w-6 text-blue-600" />
            </button>
            
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`testimonial-indicator${activeIndex === index ? ' active' : ''}`}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
             onClick={nextTestimonial}
             className="testimonial-nav-btn"
           > >
              <ChevronRight className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;