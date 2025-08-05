import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import './landing.css';
import Hero from './components/Hero';
import Features from './components/Features';
import Benefits from './components/Benefits';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CTA from './components/CTA';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar scrolled={scrolled} />
      <Hero />
      <Features />
      <Benefits />
      <CTA
        title="Optimiza las Operaciones de tu Negocio Hoy"
        subtitle="Únete a miles de empresas que confían en Cuenteo para sus necesidades de inventario y facturación."
        buttonText="Comenzar Prueba Gratuita"
      />
      <Pricing />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

export default LandingPage;