export interface RequestWithUser extends Request {
  user: { id: string };
}

export enum Categories {
  MEN = 'men',
  WOMEN = 'women',
  KIDS = 'kids',
}

export enum SubCategories {
  PANTS = 'pants',
  SHIRTS = 'shirts',
  HOODIES = 'hoodies',
  DRESSES = 'dresses',
  SHORTS = 'shorts',
  SKIRTS = 'skirts',
  JACKETS = 'jackets',
  SUITS = 'suits',
  JEANS = 'jeans',
  SHOES = 'shoes',
  SANDALS = 'sandals',
  BAGS = 'bags',
  SUNGLASSES = 'sunglasses',
  HATS = 'hats',
  GLOVES = 'gloves',
  SCARVES = 'scarves',
  OTHER = 'other',
}

export enum Brands {
  ZARA = 'zara',
  HM = 'h&m',
  GUCCI = 'gucci',
  NIKE = 'nike',
  ADIDAS = 'adidas',
  PUMA = 'puma',
  VANS = 'vans',
  CONVERSE = 'converse',
  NB = 'new balance',
  POLO = 'polo',
  TOMMY_HILFIGER = 'tommy hilfiger',
  VERSACE = 'versace',
  DIESEL = 'diesel',
  FENDI = 'fendi',
  PRADA = 'prada',
  BURBERRY = 'burberry',
  CHANEL = 'chanel',
  DIOR = 'dior',
  LOUIS_VUITTON = 'louis vuitton',
  HERMES = 'hermes',
  CHLOE = 'chloe',
  FERRAGAMO = 'ferragamo',
  COACH = 'coach',
  BALENCIAGA = 'balenciaga',
  OTHER = 'other',
}

interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  brand?: string;
  category: string;
  sizes: string[];
  quantity: number;
}
export interface Cart {
  products: CartProduct[];
  totalProducts: number;
}
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
