/* eslint-disable no-console */
/* eslint-disable n/no-process-exit */
/**
 * Seed script to create test pet data (cat, dog, rabbit)
 * Usage: pnpm tsx scripts/seed.ts
 */

const BASE_URL = 'http://localhost:7878';

const pets = [
  {
    name: 'Nabi',
    status: 1,
    category: { name: 'Cat' },
    tags: [{ name: 'cute' }, { name: 'indoor' }],
    photoUrls: ['http://localhost:7878/static/cat.jpg'],
  },
  {
    name: 'Mong',
    status: 1,
    category: { name: 'Dog' },
    tags: [{ name: 'friendly' }, { name: 'outdoor' }],
    photoUrls: ['http://localhost:7878/static/dog.jpg'],
  },
  {
    name: 'Toki',
    status: 1,
    category: { name: 'Rabbit' },
    tags: [{ name: 'cute' }, { name: 'indoor' }],
    photoUrls: ['http://localhost:7878/static/rabbit.jpg'],
  },
];

async function seed() {
  for (const pet of pets) {
    const response = await fetch(`${BASE_URL}/pet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to create pet "${pet.name}":`, error);
    } else {
      const created = (await response.json()) as Record<string, unknown>;
      console.log(`Created pet: ${created.name} (id: ${created.id})`);
    }
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
