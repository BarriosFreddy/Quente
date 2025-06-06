import { 
  Package, 
  BarChart2, 
  FileText, 
  AlertCircle, 
  Truck, 
  Users, 
  Smartphone, 
  Database 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Package className="h-6 w-6 text-blue-600" />,
      title: "Gestión de Inventario",
      description: "Controla niveles de stock, establece puntos de reorden y gestiona múltiples almacenes con facilidad."
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Generación de Facturas",
      description: "Crea facturas profesionales automáticamente con plantillas personalizables."
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
      title: "Análisis en Tiempo Real",
      description: "Obtén información valiosa con paneles de control y reportes personalizables."
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-blue-600" />,
      title: "Alertas de Stock Bajo",
      description: "Recibe notificaciones cuando los niveles de inventario caen por debajo de los límites establecidos."
    },
    {
      icon: <Truck className="h-6 w-6 text-blue-600" />,
      title: "Gestión de Proveedores",
      description: "Mantén la información de proveedores y optimiza los procesos de compra."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Base de Datos de Clientes",
      description: "Almacena detalles de clientes y rastrea el historial de compras para mejores relaciones."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-blue-600" />,
      title: "Acceso Móvil",
      description: "Accede a tu sistema de inventario y facturación desde cualquier dispositivo, en cualquier lugar."
    },
    {
      icon: <Database className="h-6 w-6 text-blue-600" />,
      title: "Almacenamiento en la Nube",
      description: "Almacenamiento seguro en la nube que garantiza que tus datos estén seguros y siempre accesibles."
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Características Poderosas para tu Negocio
          </h2>
          <p className="features-desc">
            Cuenteo ofrece un conjunto completo de herramientas diseñadas para optimizar tus procesos de inventario y facturación.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card"
            >
              <div className="feature-icon-bg">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;