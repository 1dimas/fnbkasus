import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_PRODUCTS__: Product[] | undefined;
}

if (!global.__GLOBAL_PRODUCTS__) {
  // Initialize in-memory prototype catalog
  global.__GLOBAL_PRODUCTS__ = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
}

export function getLocalProducts(): Product[] {
  if (!global.__GLOBAL_PRODUCTS__) {
    global.__GLOBAL_PRODUCTS__ = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  }

  // Self-heal any stale 404 Unsplash URLs in memory
  global.__GLOBAL_PRODUCTS__ = global.__GLOBAL_PRODUCTS__!.map((prod) => {
    if (prod.imageUrl && prod.imageUrl.includes('photo-1576107232684-1279f3908594')) {
      if (prod.id === 13 || prod.name.includes('Chill Snack')) {
        return {
          ...prod,
          imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
        };
      }
      return {
        ...prod,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      };
    }
    return prod;
  });

  return global.__GLOBAL_PRODUCTS__!;
}

export function addLocalProduct(productData: Partial<Product>): Product {
  const products = getLocalProducts();
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newId = maxId + 1;

  const newProduct: Product = {
    id: newId,
    name: productData.name?.trim() || 'Menu Baru',
    description: productData.description?.trim() || '',
    price: Number(productData.price) || 0,
    isAvailable: productData.isAvailable ?? true,
    categoryId: Number(productData.categoryId) || 2,
    imageUrl:
      productData.imageUrl?.trim() ||
      'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80',
    customizationConfig: productData.customizationConfig || {
      allowsTemperature: [2, 3, 7].includes(Number(productData.categoryId)),
      allowsSugarLevel: [2, 3, 7].includes(Number(productData.categoryId)),
      allowsIceLevel: [2, 3].includes(Number(productData.categoryId)),
      allowsHeating: [4, 5, 6].includes(Number(productData.categoryId)),
      allowsSpiciness: [5, 6].includes(Number(productData.categoryId)),
      isComboPackage: Number(productData.categoryId) === 7,
    },
  };

  products.unshift(newProduct);
  return newProduct;
}

export function updateLocalProduct(id: number, updates: Partial<Product>): Product | null {
  const products = getLocalProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : products[index].name,
    description: updates.description !== undefined ? updates.description.trim() : products[index].description,
    price: updates.price !== undefined ? Number(updates.price) : products[index].price,
    categoryId: updates.categoryId !== undefined ? Number(updates.categoryId) : products[index].categoryId,
  };

  return products[index];
}

export function toggleLocalProductAvailability(id: number): Product | null {
  const products = getLocalProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return null;
  product.isAvailable = !product.isAvailable;
  return product;
}

export function deleteLocalProduct(id: number): boolean {
  if (!global.__GLOBAL_PRODUCTS__) return false;
  const initialLen = global.__GLOBAL_PRODUCTS__.length;
  global.__GLOBAL_PRODUCTS__ = global.__GLOBAL_PRODUCTS__.filter((p) => p.id !== id);
  return global.__GLOBAL_PRODUCTS__.length < initialLen;
}
