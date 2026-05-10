import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@traveloop.app',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      city: 'San Francisco',
      country: 'USA',
      bio: 'Traveloop administrator'
    }
  });
  console.log('Created admin user');

  // Create demo users
  const userPassword = await bcrypt.hash('User123!', 12);
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Traveler',
      city: 'New York',
      country: 'USA',
      bio: 'Adventure seeker and food lover.'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      passwordHash: userPassword,
      firstName: 'Sarah',
      lastName: 'Explorer',
      city: 'London',
      country: 'UK',
      bio: 'Solo traveler and photographer.'
    }
  });
  console.log('Created demo users');

  // Create cities sequentially
  const cityData = [
    { name: 'Tokyo', country: 'Japan', region: 'Asia', latitude: 35.6762, longitude: 139.6503, costIndex: 4.2, popularity: 95, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', description: 'Ultra-modern meets traditional' },
    { name: 'Bangkok', country: 'Thailand', region: 'Asia', latitude: 13.7563, longitude: 100.5018, costIndex: 2.1, popularity: 88, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', description: 'Vibrant street life' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', latitude: -8.3405, longitude: 115.0920, costIndex: 2.0, popularity: 90, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', description: 'Tropical paradise' },
    { name: 'Paris', country: 'France', region: 'Europe', latitude: 48.8566, longitude: 2.3522, costIndex: 4.0, popularity: 98, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', description: 'City of Light' },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', latitude: 41.3851, longitude: 2.1734, costIndex: 3.2, popularity: 92, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', description: 'Gaudi architecture' },
    { name: 'Rome', country: 'Italy', region: 'Europe', latitude: 41.9028, longitude: 12.4964, costIndex: 3.5, popularity: 94, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', description: 'Ancient history' },
    { name: 'London', country: 'UK', region: 'Europe', latitude: 51.5074, longitude: -0.1278, costIndex: 4.5, popularity: 96, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', description: 'Historic landmarks' },
    { name: 'New York', country: 'USA', region: 'North America', latitude: 40.7128, longitude: -74.0060, costIndex: 4.8, popularity: 97, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', description: 'City that never sleeps' },
    { name: 'Dubai', country: 'UAE', region: 'Middle East', latitude: 25.2048, longitude: 55.2708, costIndex: 4.3, popularity: 91, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', description: 'Futuristic luxury' },
    { name: 'Sydney', country: 'Australia', region: 'Oceania', latitude: -33.8688, longitude: 151.2093, costIndex: 4.0, popularity: 93, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', description: 'Iconic harbor' },
  ];

  const cities = [];
  for (const data of cityData) {
    const city = await prisma.city.create({ data });
    cities.push(city);
  }
  console.log(`Created ${cities.length} cities`);

  // Create activities sequentially
  const activityTemplates = [
    { name: 'Walking Tour', category: 'sightseeing', costMin: 20, costMax: 50, durationHrs: 3 },
    { name: 'Food Tour', category: 'food', costMin: 40, costMax: 80, durationHrs: 3 },
    { name: 'Museum Visit', category: 'culture', costMin: 15, costMax: 30, durationHrs: 2 },
    { name: 'Cooking Class', category: 'food', costMin: 50, costMax: 100, durationHrs: 4 },
    { name: 'Adventure Tour', category: 'adventure', costMin: 80, costMax: 200, durationHrs: 4 },
  ];

  let actCount = 0;
  for (const city of cities) {
    for (const t of activityTemplates) {
      await prisma.activity.create({
        data: {
          cityId: city.id,
          name: `${city.name} ${t.name}`,
          category: t.category,
          costMin: t.costMin,
          costMax: t.costMax,
          durationHrs: t.durationHrs,
          rating: (3.5 + Math.random() * 1.5).toFixed(2),
          isFeatured: Math.random() > 0.7,
          description: `Best ${t.name.toLowerCase()} in ${city.name}`
        }
      });
      actCount++;
    }
  }
  console.log(`Created ${actCount} activities`);

  // Get cities for trips
  const tokyo = cities.find(c => c.name === 'Tokyo');
  const bali = cities.find(c => c.name === 'Bali');

  // Create demo trips
  const now = new Date();
  const ongoingStart = new Date(now); ongoingStart.setDate(ongoingStart.getDate() - 3);
  const ongoingEnd = new Date(now); ongoingEnd.setDate(ongoingEnd.getDate() + 4);
  const completedStart = new Date(now); completedStart.setMonth(completedStart.getMonth() - 2);
  const completedEnd = new Date(completedStart); completedEnd.setDate(completedEnd.getDate() + 10);

  const trip1 = await prisma.trip.create({
    data: {
      userId: user1.id,
      title: 'Japan Adventure',
      description: 'Exploring Japan',
      startDate: ongoingStart,
      endDate: ongoingEnd,
      status: 'ongoing',
      isPublic: true,
      totalBudget: 3000,
      stops: { create: [{ cityId: tokyo.id, arrivalDate: ongoingStart, departureDate: ongoingEnd, orderIndex: 0 }] }
    }
  });

  const trip2 = await prisma.trip.create({
    data: {
      userId: user2.id,
      title: 'Bali Retreat',
      description: 'Relaxing in Bali',
      startDate: completedStart,
      endDate: completedEnd,
      status: 'completed',
      isPublic: true,
      totalBudget: 2000,
      stops: { create: [{ cityId: bali.id, arrivalDate: completedStart, departureDate: completedEnd, orderIndex: 0 }] }
    }
  });
  console.log('Created demo trips');

  // Add expenses
  await prisma.expense.create({ data: { tripId: trip2.id, category: 'flight', description: 'Round trip', amount: 800, date: completedStart } });
  await prisma.expense.create({ data: { tripId: trip2.id, category: 'hotel', description: 'Beach villa', amount: 600, date: completedStart } });
  console.log('Added expenses');

  // Add packing items
  await prisma.packingItem.create({ data: { tripId: trip1.id, label: 'Passport', category: 'documents' } });
  await prisma.packingItem.create({ data: { tripId: trip1.id, label: 'Phone', category: 'electronics' } });
  console.log('Added packing items');

  // Create community posts
  await prisma.communityPost.create({ data: { userId: user2.id, tripId: trip2.id, content: 'Just got back from Bali! Amazing!', likesCount: 24 } });
  await prisma.communityPost.create({ data: { userId: user1.id, content: 'Pro tip: Get a JR Pass for Japan!', likesCount: 45 } });
  console.log('Created community posts');

  console.log('Seeding completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
