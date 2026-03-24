const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding mock data...\n');

  // Delete existing portfolio items first
  await prisma.portfolioItem.deleteMany({});
  
  const portfolioItems = [
    { title: 'The Grand Celebration', category: 'Wedding', featured: true, order: 1, description: 'A magical wedding celebration captured in timeless frames',
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=450&fit=crop'
      ]
    },
    { title: 'Eternal Vows', category: 'Wedding', featured: true, order: 2, description: 'Beautiful sunset vows exchanged on a dreamy evening',
      images: [
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=450&fit=crop'
      ]
    },
    { title: 'Garden Romance', category: 'Wedding', featured: false, order: 3, description: 'A romantic garden wedding with lush greenery and floral decor',
      images: [
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=450&fit=crop'
      ]
    },
    { title: 'Corporate Summit 2024', category: 'Events', featured: true, order: 5, description: 'Professional coverage of a major corporate summit',
      images: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=450&fit=crop'
      ]
    },
    { title: 'Modern Elegance', category: 'Portraits', featured: true, order: 8, description: 'Sophisticated portrait capturing modern elegance',
      images: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=450&fit=crop'
      ]
    },
    { title: 'Brand Visuals', category: 'Commercial', featured: true, order: 11, description: 'High-impact brand photography for marketing campaigns',
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop'
      ]
    }
  ];

  for (const item of portfolioItems) {
    const { images, ...data } = item;
    const createdItem = await prisma.portfolioItem.create({ data });
    
    const imageRecords = images.map((url, index) => ({
      url,
      portfolioItemId: createdItem.id,
      order: index
    }));
    
    await prisma.portfolioImage.createMany({ data: imageRecords });
    console.log(`  ✅ Portfolio: ${item.title} (${images.length} images)`);
  }

  // ==================== SERVICES ====================
  const services = [
    { name: 'Wedding Photography', description: 'Your wedding day is one of the most important moments of your life. We capture every emotion, every glance, and every celebration with cinematic artistry.', icon: '💍', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', price: '₹50,000 onwards', features: 'Pre-wedding shoot, Full-day coverage, Candid & traditional, Photo album design, Drone photography, Same-day edit highlights', order: 1 },
    { name: 'Event Coverage', description: 'From corporate events to birthday celebrations, we provide comprehensive event coverage that captures the energy and essence of every occasion.', icon: '🎉', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop', price: '₹25,000 onwards', features: 'Corporate events, Birthday & anniversary, Award ceremonies, Product launches, Social gatherings, Live event streaming', order: 2 },
    { name: 'Portrait Sessions', description: 'Whether it is a personal portrait, family session, or professional headshot, our portrait sessions are tailored to bring out your authentic self.', icon: '📸', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop', price: '₹10,000 per session', features: 'Individual portraits, Family sessions, Corporate headshots, Maternity shoots, Newborn photography, Creative concepts', order: 3 },
    { name: 'Commercial Photography', description: 'Elevate your brand with professional commercial photography. We create visual content that drives engagement and tells your brand story.', icon: '🏢', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', price: '₹35,000 onwards', features: 'Product photography, Fashion shoots, Food photography, Architecture & interiors, Lifestyle imagery, Brand campaigns', order: 4 },
    { name: 'Studio Sessions', description: 'Our fully-equipped studio provides the perfect setting for controlled, professional photography with premium lighting setups and backdrops.', icon: '🎬', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop', price: '₹15,000 per session', features: 'Professional lighting, Multiple backdrops, Props available, Makeup room access, Outfit changes, Instant preview', order: 5 },
  ];

  // Delete existing test service first
  await prisma.service.deleteMany({});
  for (const svc of services) {
    await prisma.service.create({ data: svc });
    console.log(`  ✅ Service: ${svc.name}`);
  }

  // ==================== TESTIMONIALS ====================
  const testimonials = [
    { name: 'Priya & Rahul Sharma', event: 'Wedding Photography', quote: 'Varma Studios captured our wedding day with such grace and artistry. Every photo tells a story, and we could not be happier with the results. Truly exceptional work!', rating: 5, featured: true },
    { name: 'Anita Desai', event: 'Corporate Event', quote: 'The team was incredibly professional and made everyone feel at ease. The corporate event photos exceeded our expectations and perfectly captured the essence of our brand.', rating: 5, featured: true },
    { name: 'Vikram Patel', event: 'Portrait Session', quote: 'My portrait session was an unforgettable experience. The attention to detail, lighting, and creative direction resulted in stunning photos I will treasure forever.', rating: 5, featured: true },
    { name: 'Meera & Karthik', event: 'Wedding Photography', quote: 'From the pre-wedding shoot to the reception, Varma Studios was exceptional. They captured moments we did not even know happened! Highly recommended.', rating: 5, featured: false },
    { name: 'Deepak Innovations', event: 'Product Launch', quote: 'The product launch photos were outstanding. They really captured the energy of the event and gave us premium marketing material for months.', rating: 4, featured: false },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
    console.log(`  ✅ Testimonial: ${t.name}`);
  }

  // ==================== TEAM MEMBERS ====================
  const teamMembers = [
    { name: 'Arjun Varma', role: 'Lead Photographer & Founder', bio: 'With over 10 years of experience, Arjun founded Varma Studios with a vision to create art through photography. His work has been featured in leading publications.', order: 1, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
    { name: 'Sneha Kapoor', role: 'Senior Photographer', bio: 'Specializing in portrait and fashion photography, Sneha brings a unique artistic perspective and has worked with top brands across the country.', order: 2, imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' },
    { name: 'Ravi Mehta', role: 'Wedding Specialist', bio: 'Ravi has covered over 200 weddings and has an eye for capturing the most intimate and joyful moments of celebrations.', order: 3, imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
    { name: 'Kavitha Nair', role: 'Post-Production Lead', bio: 'Kavitha ensures every image reaches its full potential through expert editing, color grading, and retouching techniques.', order: 4, imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' },
  ];

  for (const m of teamMembers) {
    await prisma.teamMember.create({ data: m });
    console.log(`  ✅ Team: ${m.name}`);
  }

  // ==================== TIMELINE ====================
  const timeline = [
    { year: '2016', title: 'Studio Founded', description: 'Varma Studios was born from a passion for storytelling through photography.', order: 1 },
    { year: '2018', title: 'First Major Award', description: 'Recognized as "Best Emerging Photography Studio" at the National Photography Awards.', order: 2 },
    { year: '2020', title: 'Team Expansion', description: 'Grew our team to 8 talented professionals, each bringing unique expertise.', order: 3 },
    { year: '2022', title: '500+ Projects', description: 'Reached the milestone of 500 successfully completed photography projects.', order: 4 },
    { year: '2024', title: 'New Studio Launch', description: 'Opened our state-of-the-art 3000 sq.ft studio with premium equipment and setups.', order: 5 },
  ];

  for (const ev of timeline) {
    await prisma.timelineEvent.create({ data: ev });
    console.log(`  ✅ Timeline: ${ev.year} - ${ev.title}`);
  }

  console.log('\n🎉 Seeding complete!');
  await prisma.$disconnect();
}

seed().catch(console.error);
