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
      bio: 'Adventure seeker and food lover. Been to 25 countries and counting!'
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
      bio: 'Solo traveler, photographer, and coffee addict.'
    }
  });
  console.log('Created demo users');

  // Create cities
  const cities = await Promise.all([
    // Asia
    prisma.city.create({
      data: {
        name: 'Tokyo',
        country: 'Japan',
        region: 'Asia',
        latitude: 35.6762,
        longitude: 139.6503,
        costIndex: 4.2,
        popularity: 95,
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        description: 'A fascinating blend of ultra-modern and traditional culture'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Bangkok',
        country: 'Thailand',
        region: 'Asia',
        latitude: 13.7563,
        longitude: 100.5018,
        costIndex: 2.1,
        popularity: 88,
        imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
        description: 'Vibrant street life and ornate shrines'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Singapore',
        country: 'Singapore',
        region: 'Asia',
        latitude: 1.3521,
        longitude: 103.8198,
        costIndex: 4.5,
        popularity: 85,
        imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
        description: 'Modern city-state with stunning architecture'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Bali',
        country: 'Indonesia',
        region: 'Asia',
        latitude: -8.3405,
        longitude: 115.0920,
        costIndex: 2.0,
        popularity: 90,
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        description: 'Tropical paradise with temples and beaches'
      }
    }),
    // Europe
    prisma.city.create({
      data: {
        name: 'Paris',
        country: 'France',
        region: 'Europe',
        latitude: 48.8566,
        longitude: 2.3522,
        costIndex: 4.0,
        popularity: 98,
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        description: 'The City of Light and romance'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Barcelona',
        country: 'Spain',
        region: 'Europe',
        latitude: 41.3851,
        longitude: 2.1734,
        costIndex: 3.2,
        popularity: 92,
        imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        description: 'Gaudi architecture and Mediterranean vibes'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Rome',
        country: 'Italy',
        region: 'Europe',
        latitude: 41.9028,
        longitude: 12.4964,
        costIndex: 3.5,
        popularity: 94,
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        description: 'Ancient history and incredible cuisine'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Amsterdam',
        country: 'Netherlands',
        region: 'Europe',
        latitude: 52.3676,
        longitude: 4.9041,
        costIndex: 3.8,
        popularity: 87,
        imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
        description: 'Canals, bikes, and artistic heritage'
      }
    }),
    prisma.city.create({
      data: {
        name: 'London',
        country: 'UK',
        region: 'Europe',
        latitude: 51.5074,
        longitude: -0.1278,
        costIndex: 4.5,
        popularity: 96,
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        description: 'Historic landmarks and modern culture'
      }
    }),
    // Americas
    prisma.city.create({
      data: {
        name: 'New York',
        country: 'USA',
        region: 'North America',
        latitude: 40.7128,
        longitude: -74.0060,
        costIndex: 4.8,
        popularity: 97,
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        description: 'The city that never sleeps'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Los Angeles',
        country: 'USA',
        region: 'North America',
        latitude: 34.0522,
        longitude: -118.2437,
        costIndex: 4.2,
        popularity: 89,
        imageUrl: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800',
        description: 'Entertainment capital with perfect weather'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Rio de Janeiro',
        country: 'Brazil',
        region: 'South America',
        latitude: -22.9068,
        longitude: -43.1729,
        costIndex: 2.8,
        popularity: 86,
        imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
        description: 'Stunning beaches and vibrant culture'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Mexico City',
        country: 'Mexico',
        region: 'North America',
        latitude: 19.4326,
        longitude: -99.1332,
        costIndex: 2.2,
        popularity: 82,
        imageUrl: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800',
        description: 'Rich history and incredible food scene'
      }
    }),
    // Middle East
    prisma.city.create({
      data: {
        name: 'Dubai',
        country: 'UAE',
        region: 'Middle East',
        latitude: 25.2048,
        longitude: 55.2708,
        costIndex: 4.3,
        popularity: 91,
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        description: 'Futuristic architecture and luxury'
      }
    }),
    // Africa
    prisma.city.create({
      data: {
        name: 'Cape Town',
        country: 'South Africa',
        region: 'Africa',
        latitude: -33.9249,
        longitude: 18.4241,
        costIndex: 2.5,
        popularity: 84,
        imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
        description: 'Table Mountain and stunning coastline'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Marrakech',
        country: 'Morocco',
        region: 'Africa',
        latitude: 31.6295,
        longitude: -7.9811,
        costIndex: 2.0,
        popularity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800',
        description: 'Ancient medina and vibrant souks'
      }
    }),
    // Oceania
    prisma.city.create({
      data: {
        name: 'Sydney',
        country: 'Australia',
        region: 'Oceania',
        latitude: -33.8688,
        longitude: 151.2093,
        costIndex: 4.0,
        popularity: 93,
        imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
        description: 'Iconic harbor and beautiful beaches'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Auckland',
        country: 'New Zealand',
        region: 'Oceania',
        latitude: -36.8509,
        longitude: 174.7645,
        costIndex: 3.5,
        popularity: 78,
        imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
        description: 'City of Sails with stunning nature'
      }
    }),
    // More Asia
    prisma.city.create({
      data: {
        name: 'Seoul',
        country: 'South Korea',
        region: 'Asia',
        latitude: 37.5665,
        longitude: 126.9780,
        costIndex: 3.3,
        popularity: 86,
        imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800',
        description: 'K-pop culture and traditional palaces'
      }
    }),
    prisma.city.create({
      data: {
        name: 'Hong Kong',
        country: 'China',
        region: 'Asia',
        latitude: 22.3193,
        longitude: 114.1694,
        costIndex: 4.0,
        popularity: 88,
        imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800',
        description: 'Dramatic skyline and dim sum'
      }
    }),
  ]);
  console.log(`Created ${cities.length} cities`);

  // Create activities for each city
  const activityTemplates = [
    { name: 'City Walking Tour', category: 'sightseeing', costMin: 20, costMax: 50, durationHrs: 3 },
    { name: 'Local Food Tour', category: 'food', costMin: 40, costMax: 80, durationHrs: 3 },
    { name: 'Museum Visit', category: 'culture', costMin: 15, costMax: 30, durationHrs: 2 },
    { name: 'Street Food Experience', category: 'food', costMin: 10, costMax: 25, durationHrs: 2 },
    { name: 'Sunset Viewpoint', category: 'sightseeing', costMin: 0, costMax: 10, durationHrs: 1.5 },
    { name: 'Cooking Class', category: 'food', costMin: 50, costMax: 100, durationHrs: 4 },
    { name: 'Spa & Wellness', category: 'wellness', costMin: 60, costMax: 150, durationHrs: 2 },
    { name: 'Night Market Tour', category: 'nightlife', costMin: 15, costMax: 40, durationHrs: 2.5 },
    { name: 'Shopping District', category: 'shopping', costMin: 0, costMax: 500, durationHrs: 3 },
    { name: 'Adventure Activity', category: 'adventure', costMin: 80, costMax: 200, durationHrs: 4 },
  ];

  let activitiesCreated = 0;
  for (const city of cities) {
    for (const template of activityTemplates) {
      await prisma.activity.create({
        data: {
          cityId: city.id,
          name: `${city.name} ${template.name}`,
          category: template.category,
          costMin: template.costMin,
          costMax: template.costMax,
          durationHrs: template.durationHrs,
          rating: (3.5 + Math.random() * 1.5).toFixed(2),
          isFeatured: Math.random() > 0.7,
          description: `Experience the best ${template.name.toLowerCase()} in ${city.name}`
        }
      });
      activitiesCreated++;
    }
  }
  console.log(`Created ${activitiesCreated} activities`);

  // Get some cities for trips
  const tokyo = cities.find(c => c.name === 'Tokyo');
  const paris = cities.find(c => c.name === 'Paris');
  const bali = cities.find(c => c.name === 'Bali');
  const barcelona = cities.find(c => c.name === 'Barcelona');

  // Create demo trips
  const now = new Date();
  const ongoingStart = new Date(now);
  ongoingStart.setDate(ongoingStart.getDate() - 3);
  const ongoingEnd = new Date(now);
  ongoingEnd.setDate(ongoingEnd.getDate() + 4);

  const upcomingStart = new Date(now);
  upcomingStart.setDate(upcomingStart.getDate() + 14);
  const upcomingEnd = new Date(now);
  upcomingEnd.setDate(upcomingEnd.getDate() + 21);

  const completedStart = new Date(now);
  completedStart.setMonth(completedStart.getMonth() - 2);
  const completedEnd = new Date(completedStart);
  completedEnd.setDate(completedEnd.getDate() + 10);

  // Ongoing trip
  const trip1 = await prisma.trip.create({
    data: {
      userId: user1.id,
      title: 'Japan Adventure',
      description: 'Exploring the wonders of Japan',
      startDate: ongoingStart,
      endDate: ongoingEnd,
      status: 'ongoing',
      isPublic: true,
      totalBudget: 3000,
      stops: {
        create: [{
          cityId: tokyo.id,
          arrivalDate: ongoingStart,
          departureDate: ongoingEnd,
          orderIndex: 0,
          notes: 'Staying in Shinjuku area'
        }]
      }
    }
  });

  // Upcoming trip
  const trip2 = await prisma.trip.create({
    data: {
      userId: user1.id,
      title: 'European Summer',
      description: 'Paris and Barcelona adventure',
      startDate: upcomingStart,
      endDate: upcomingEnd,
      status: 'planned',
      isPublic: true,
      totalBudget: 5000,
      stops: {
        create: [
          {
            cityId: paris.id,
            arrivalDate: upcomingStart,
            departureDate: new Date(upcomingStart.getTime() + 4 * 24 * 60 * 60 * 1000),
            orderIndex: 0
          },
          {
            cityId: barcelona.id,
            arrivalDate: new Date(upcomingStart.getTime() + 4 * 24 * 60 * 60 * 1000),
            departureDate: upcomingEnd,
            orderIndex: 1
          }
        ]
      }
    }
  });

  // Completed trip
  const trip3 = await prisma.trip.create({
    data: {
      userId: user2.id,
      title: 'Bali Retreat',
      description: 'Relaxing getaway in Bali',
      startDate: completedStart,
      endDate: completedEnd,
      status: 'completed',
      isPublic: true,
      totalBudget: 2000,
      stops: {
        create: [{
          cityId: bali.id,
          arrivalDate: completedStart,
          departureDate: completedEnd,
          orderIndex: 0
        }]
      }
    }
  });
  console.log('Created demo trips');

  // Add expenses to completed trip
  await prisma.expense.createMany({
    data: [
      { tripId: trip3.id, category: 'flight', description: 'Round trip flights', amount: 800, date: completedStart },
      { tripId: trip3.id, category: 'hotel', description: 'Beach villa 10 nights', amount: 600, date: completedStart },
      { tripId: trip3.id, category: 'food', description: 'Restaurants and cafes', amount: 300, date: completedEnd },
      { tripId: trip3.id, category: 'activity', description: 'Tours and activities', amount: 250, date: completedEnd },
    ]
  });
  console.log('Added expenses');

  // Add packing items
  const packingItems = [
    { label: 'Passport', category: 'documents' },
    { label: 'Flight tickets', category: 'documents' },
    { label: 'Travel insurance', category: 'documents' },
    { label: 'T-shirts', category: 'clothing' },
    { label: 'Shorts', category: 'clothing' },
    { label: 'Swimsuit', category: 'clothing' },
    { label: 'Phone', category: 'electronics' },
    { label: 'Charger', category: 'electronics' },
    { label: 'Camera', category: 'electronics' },
    { label: 'Sunscreen', category: 'toiletries' },
  ];

  for (const item of packingItems) {
    await prisma.packingItem.create({
      data: { tripId: trip1.id, ...item }
    });
  }
  console.log('Added packing items');

  // Create community posts
  await prisma.communityPost.createMany({
    data: [
      {
        userId: user2.id,
        tripId: trip3.id,
        content: 'Just got back from the most amazing trip to Bali! The beaches were incredible and the food was out of this world. Highly recommend visiting Uluwatu Temple at sunset!',
        likesCount: 24
      },
      {
        userId: user1.id,
        content: 'Pro tip for traveling in Japan: Get a JR Pass if you plan to visit multiple cities. It saves so much money on the bullet trains!',
        likesCount: 45
      },
      {
        userId: user2.id,
        content: 'Anyone been to Barcelona recently? Looking for restaurant recommendations! #Barcelona #FoodTravel',
        likesCount: 12
      },
      {
        userId: user1.id,
        tripId: trip1.id,
        content: 'Day 3 in Tokyo and I still cant get over how efficient the train system is. Also, the ramen here is life-changing!',
        likesCount: 31
      },
      {
        userId: user2.id,
        content: 'Packing tip: Always roll your clothes instead of folding. You can fit so much more in your suitcase!',
        likesCount: 67
      },
    ]
  });
  console.log('Created community posts');

  // Create some notes
  await prisma.tripNote.createMany({
    data: [
      {
        tripId: trip3.id,
        title: 'Hotel Check-in',
        content: 'Check-in after 2pm. Breakfast included. Room 204.',
        noteDate: completedStart
      },
      {
        tripId: trip3.id,
        title: 'Restaurant Recommendation',
        content: 'Try Locavore for fine dining - need reservation 2 weeks in advance!',
      },
    ]
  });
  console.log('Created trip notes');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
