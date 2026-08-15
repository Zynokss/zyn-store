export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  colors?: string[];
  images: string[];
  image?: string;
  inStock?: boolean;
  featured?: boolean;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CatalogProduct extends Product {
  formattedPrice?: string;
  primaryImage?: string;
}