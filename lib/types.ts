export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Accessories';
  price: number;
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  images: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}