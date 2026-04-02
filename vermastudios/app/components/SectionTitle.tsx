interface SectionTitleProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: 'center' | 'left';
}

export default function SectionTitle({ title, subtitle, light = false, align = 'center' }: SectionTitleProps) {
  return (
    <div style={{
      textAlign: align,
      marginBottom: '60px',
    }}>
      {subtitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: align === 'center' ? 'center' : 'flex-start', marginBottom: '12px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--color-teal)',
            boxShadow: '0 0 8px var(--color-teal)',
            flexShrink: 0,
          }} />
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            margin: 0,
          }}>
            {subtitle}
          </p>
        </div>
      )}
      <h2 style={{
        fontSize: '40px',
        fontWeight: 600,
        color: light ? '#fafafa' : 'var(--color-black)',
        lineHeight: 1.2,
        marginBottom: '0',
      }}>
        {title}
      </h2>
      <div
        className={align === 'center' ? 'gold-line' : 'gold-line gold-line-left'}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
}
