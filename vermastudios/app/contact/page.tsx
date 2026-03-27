'use client';

import ContactForm from '../components/ContactForm';
import SectionTitle from '../components/SectionTitle';

const contactInfo = [
  {
    icon: '📍',
    title: 'Visit Our Studio',
    lines: ['S-3, Param Puri', 'Uttam Nagar, New Delhi - 110059'],
  },
  {
    icon: '📞',
    title: 'Call Us',
    lines: ['+91 98105 02795', '+91 95823 72497'],
  },
  {
    icon: '✉️',
    title: 'Email Us',
    lines: ['Vermastudio297@gmail.com'],
  },
  {
    icon: '🕐',
    title: 'Working Hours',
    lines: ['Mon – Fri: 9:00 AM – 7:00 PM', 'Sat: 10:00 AM – 5:00 PM'],
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '60vh',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&h=800&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 10, 0.7)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '16px',
          }}>Get In Touch</p>
          <h1 style={{ fontSize: '52px', fontWeight: 700, color: '#fafafa' }}>Contact Us</h1>
          <div className="gold-line" />
        </div>
      </section>

      {/* Contact Info Cards */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginTop: '-120px',
            position: 'relative',
            zIndex: 2,
          }}>
            {contactInfo.map((info) => (
              <div key={info.title} style={{
                background: 'var(--color-white)',
                padding: '36px 28px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                border: '1px solid var(--color-gray-100)',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{info.icon}</div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--color-black)',
                }}>{info.title}</h3>
                {info.lines.map((line) => (
                  <p key={line} style={{
                    fontSize: '14px',
                    color: 'var(--color-gray-500)',
                    lineHeight: 1.8,
                  }}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start',
          }}>
            {/* Form */}
            <div>
              <SectionTitle
                subtitle="Send a Message"
                title="Let's Work Together"
                align="left"
              />
              <ContactForm />
            </div>

            {/* Map Placeholder */}
            <div>
              <SectionTitle
                subtitle="Find Us"
                title="Our Location"
                align="left"
              />
              <div style={{
                width: '100%',
                height: '400px',
                background: 'var(--color-gray-100)',
                border: '1px solid var(--color-gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!4v1774614779797!6m8!1m7!1sTIUrAw586S1BYF-nFZ8_QQ!2m2!1d28.61729417013438!2d77.05772770174251!3f177.84975920361154!4f-2.7544180680907573!5f0.7820865974627469"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Varma Studios Location"
                />

                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d346.4818952413956!2d77.05744584857997!3d28.61718546905761!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d04d7c85d7dcf%3A0x8b981693413dcb7c!2sS-3%2C%20Param%20Puri%2C%20Uttam%20Nagar%2C%20Delhi%2C%20110059!5e0!3m2!1sen!2sin!4v1774615095742!5m2!1sen!2sin" width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Varma Studios Location">
                </iframe>
              </div>

              {/* Additional Info */}
              <div style={{
                marginTop: '24px',
                padding: '24px',
                background: 'var(--color-beige)',
              }}>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-black)',
                }}>
                  Studio Visits
                </h4>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-gray-600)' }}>
                  We welcome studio visits by appointment. Please call or email us to schedule a visit and discuss your photography needs in person.
                </p>
              </div>
            </div>
          </div>

          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="grid-template-columns: 1fr 1fr"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </section>
    </>
  );
}
