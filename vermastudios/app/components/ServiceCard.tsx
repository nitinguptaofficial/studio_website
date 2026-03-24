'use client';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  index?: number;
}

export default function ServiceCard({ icon, title, description, index = 0 }: ServiceCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-white)',
        padding: '48px 32px',
        textAlign: 'center',
        border: '1px solid var(--color-gray-200)',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        animationDelay: `${index * 0.1}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-gold)';
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(201, 169, 110, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-gray-200)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        fontSize: '40px',
        marginBottom: '24px',
        lineHeight: 1,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: '16px',
        letterSpacing: '0.03em',
        color: 'var(--color-black)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        lineHeight: 1.8,
        color: 'var(--color-gray-500)',
      }}>
        {description}
      </p>
      {/* Gold bottom border on hover */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'var(--color-gold)',
        transform: 'scaleX(0)',
        transition: 'transform 0.3s ease',
      }}
        className="service-card-line"
      />
      <style jsx>{`
        div:hover .service-card-line {
          transform: scaleX(1) !important;
        }
      `}</style>
    </div>
  );
}
