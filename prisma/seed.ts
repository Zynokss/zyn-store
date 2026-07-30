import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes'];

const ADJECTIVES = [
  'Minimalist', 'Over-Dyed', 'Tactical', 'Vintage Wash', 'Modular', 
  'Heavyweight', 'Boxy-Fit', 'Structured', 'Essential', 'Relaxed-Fit', 
  'Pleated', 'Cropped', 'Utility', 'Technical', 'Classic'
];

const ITEM_TYPES = {
  Tops: ['Heavyweight Hoodie', 'Graphic Tee', 'Oversized Crewneck', 'Long Sleeve Henley', 'Knit Polo'],
  Bottoms: ['Cargo Pants', 'Relaxed Chinos', 'Pleated Trousers', 'Heavy Fleece Sweatpants', 'Raw Denim Jeans'],
  Outerwear: ['Bomber Jacket', 'Modular Fleece', 'Puffer Coat', 'Tailored Blazer', 'Windbreaker'],
  Accessories: ['Ribbed Beanie', 'Crossbody Bag', 'Leather Belt', 'Canvas Tote', 'Minimalist Cap'],
  Shoes: ['Chunky Canvas Sneakers', 'Leather Loafers', 'Suede Runners', 'Tactical Boots', 'Slip-on Mules']
};

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(): number {
  return Math.floor(Math.random() * 180) + 35; // Prices between $35 and $215
}

async function main() {
  console.log('Clearing existing products...');
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Generating 60 products...');

  const products = [];

  for (let i = 1; i <= 60; i++) {
    const category = getRandomElement(CATEGORIES);
    const itemType = getRandomElement(ITEM_TYPES[category as keyof typeof ITEM_TYPES]);
    const adj = getRandomElement(ADJECTIVES);
    
    const name = `${adj} ${itemType}`;
    const price = getRandomPrice();
    const image = getRandomElement(IMAGE_POOL);

    products.push({
      name,
      description: `Premium quality ${name.toLowerCase()} constructed from high-grade materials. Designed with clean lines and superior comfort for everyday wear.`,
      category,
      price,
      sizes: category === 'Shoes' ? ['40', '41', '42', '43', '44'] : ['S', 'M', 'L', 'XL'],
      images: [image],
      inStock: Math.random() > 0.1, // 90% in stock
      featured: i <= 8, // First 8 items featured
    });
  }

  await prisma.product.createMany({
    data: products,
  });

  console.log('✅ Successfully added 60 items to your Supabase database!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });