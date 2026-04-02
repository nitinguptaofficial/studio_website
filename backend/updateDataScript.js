const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old services...');
  await prisma.service.deleteMany();

  const services = [
    {
      name: 'Wedding Photography',
      description: 'Capturing your unforgettable day with timeless elegance, preserving the love and joy of your wedding.',
      icon: '💍',
      order: 1
    },
    {
      name: 'Cinematography',
      description: 'Professional cinematic videos of your special events, giving a cinematic feel to your beautiful moments.',
      icon: '🎥',
      order: 2
    },
    {
      name: 'Corporate Events',
      description: 'High-quality photography for your corporate gatherings, seminars, and networking events.',
      icon: '🏢',
      order: 3
    },
    {
      name: 'Portfolio',
      description: 'Stunning portfolio shoots for actors, models, and professionals looking to build their brand.',
      icon: '📸',
      order: 4
    },
    {
      name: 'Pre-Wedding',
      description: 'Beautiful, artistic pre-wedding shoots to capture the romance and anticipation before your big day.',
      icon: '❤️',
      order: 5
    },
    {
      name: 'Candid',
      description: 'Authentic candid photography capturing true emotions and unspoken moments as they happen naturally.',
      icon: '✨',
      order: 6
    }
  ];

  console.log('Inserting new services...');
  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  console.log('Finished updating services.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
