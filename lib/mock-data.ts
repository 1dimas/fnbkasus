import { Category, Product } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Semua Menu' },
  { id: 7, name: 'Paket Makan & Minum' },
  { id: 2, name: 'Coffee' },
  { id: 3, name: 'Non-Coffee' },
  { id: 4, name: 'Pastry & Bakery' },
  { id: 5, name: 'Main Course' },
  { id: 6, name: 'Snacks' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Paket Makan & Minum (Combo Deals)
  {
    id: 10,
    name: 'Paket Noir Breakfast (Croissant + Kopi)',
    description: 'Kombinasi sarapan favorit: Classic Butter Croissant hangat renyah dipadukan dengan pilihan kopi (Espresso / Flat White) panas atau dingin.',
    price: 45000,
    isAvailable: true,
    categoryId: 7,
    imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      isComboPackage: true,
      comboFoodOptions: ['Classic Butter Croissant', 'Dark Choco Almond Pain'],
      comboDrinkOptions: ['Monochrome Black Espresso', 'Noir Flat White', 'Manual Brew V60'],
      allowsTemperature: true,
      allowsSugarLevel: true,
    },
  },
  {
    id: 11,
    name: 'Paket Artisan Lunch (Mushroom Toast + Minuman)',
    description: 'Makan siang gourmet: Truffle Mushroom Toast sourdough istimewa disajikan bersama minuman pilihan (Flat White, Charcoal Latte, atau Matcha).',
    price: 68000,
    isAvailable: true,
    categoryId: 7,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      isComboPackage: true,
      comboFoodOptions: ['Truffle Mushroom Toast (Original)', 'Truffle Mushroom Toast (Extra Cheese)'],
      comboDrinkOptions: ['Noir Flat White', 'Artisan Charcoal Latte', 'Kyoto Ceremonial Matcha Latte'],
      allowsTemperature: true,
      allowsSugarLevel: true,
      allowsSpiciness: true,
    },
  },
  {
    id: 12,
    name: 'Paket Sweet Duo (Choco Croissant + Kopi)',
    description: 'Sajian manis sore: Dark Choco Almond Pain hangat berpadu serasi dengan segelas Kopi Panas atau Kopi Dingin pilihan Anda.',
    price: 52000,
    isAvailable: true,
    categoryId: 7,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      isComboPackage: true,
      comboFoodOptions: ['Dark Choco Almond Pain', 'Classic Butter Croissant'],
      comboDrinkOptions: ['Noir Flat White', 'Monochrome Black Espresso', 'Artisan Charcoal Latte'],
      allowsTemperature: true,
      allowsSugarLevel: true,
    },
  },
  {
    id: 13,
    name: 'Paket Chill Snack (Truffle Fries + Matcha Latte)',
    description: 'Camilan santai premium: Crispy Truffle Fries gurih berpadu dengan Kyoto Ceremonial Matcha Latte segar dingin atau hangat.',
    price: 55000,
    isAvailable: true,
    categoryId: 7,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      isComboPackage: true,
      comboFoodOptions: ['Crispy Truffle Fries (Original Truffle)', 'Crispy Truffle Fries (Spicy Truffle)'],
      comboDrinkOptions: ['Kyoto Ceremonial Matcha Latte', 'Artisan Charcoal Latte', 'Noir Flat White'],
      allowsTemperature: true,
      allowsSugarLevel: true,
      allowsSpiciness: true,
    },
  },

  // Coffee
  {
    id: 1,
    name: 'Monochrome Black Espresso',
    description: 'Double shot espresso blend Arabica Aceh Gayo dengan notes dark chocolate dan fruity hints.',
    price: 22000,
    isAvailable: true,
    categoryId: 2,
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsTemperature: true, // Panas atau Dingin
      allowsSugarLevel: true,
      allowsIceLevel: true,
    },
  },
  {
    id: 2,
    name: 'Noir Flat White',
    description: 'Espresso kaya rasa dipadukan dengan steamed micro-foam milk yang lembut dan balance. Nikmat disajikan Panas maupun Dingin.',
    price: 28000,
    isAvailable: true,
    categoryId: 2,
    imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsTemperature: true, // Panas atau Dingin
      allowsSugarLevel: true,
      allowsIceLevel: true,
    },
  },
  {
    id: 3,
    name: 'Manual Brew V60 Japanese',
    description: 'Single origin bean pilihan diseduh manual dengan dripper V60. Tersedia versi Seduh Hangat atau Ice Japanese Drip.',
    price: 32000,
    isAvailable: true,
    categoryId: 2,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsTemperature: true, // Panas atau Dingin
      allowsSugarLevel: true,
      allowsIceLevel: true,
    },
  },

  // Non-Coffee
  {
    id: 4,
    name: 'Kyoto Ceremonial Matcha Latte',
    description: 'Pure Uji Matcha autentik dari Jepang dengan susu oat pilihan dan sentuhan pemanis aren. Tersedia Panas atau Dingin.',
    price: 35000,
    isAvailable: true,
    categoryId: 3,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsTemperature: true, // Panas atau Dingin
      allowsSugarLevel: true,
      allowsIceLevel: true,
    },
  },
  {
    id: 5,
    name: 'Artisan Charcoal Latte',
    description: 'Minuman khas monokrom berbasis activated charcoal organik, vanilla beans, dan fresh milk. Tersedia Panas atau Dingin.',
    price: 30000,
    isAvailable: true,
    categoryId: 3,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsTemperature: true, // Panas atau Dingin
      allowsSugarLevel: true,
      allowsIceLevel: true,
    },
  },

  // Pastry & Bakery
  {
    id: 6,
    name: 'Classic Butter Croissant',
    description: 'Flaky, buttery French pastry renyah di luar dan lembut berlapis di dalam. Pilihan dipanaskan renyah atau suhu ruang.',
    price: 25000,
    isAvailable: true,
    categoryId: 4,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsHeating: true,
    },
  },
  {
    id: 7,
    name: 'Dark Choco Almond Pain',
    description: 'Croissant isi pasta dark chocolate Belgia premium bertabur irisan kacang almond panggang.',
    price: 32000,
    isAvailable: true,
    categoryId: 4,
    imageUrl: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsHeating: true,
    },
  },

  // Main Course
  {
    id: 8,
    name: 'Truffle Mushroom Toast',
    description: 'Sourdough toast artisan dengan sauteed wild mushrooms, keju parmesan, dan white truffle oil.',
    price: 48000,
    isAvailable: true,
    categoryId: 5,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsHeating: true,
      allowsSpiciness: true,
    },
  },

  // Snacks
  {
    id: 9,
    name: 'Crispy Truffle Fries',
    description: 'Kentang goreng renyah dengan aroma truffle alami dan taburan sea salt rosemary.',
    price: 28000,
    isAvailable: true,
    categoryId: 6,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=360&auto=format&fit=crop&q=70',
    customizationConfig: {
      allowsHeating: true,
      allowsSpiciness: true,
    },
  },
];

