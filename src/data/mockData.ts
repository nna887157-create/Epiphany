import { Category, Product, AdminCredentials } from '../types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Boissons Alcoolisées',
    image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: [
      { id: '1-1', name: 'Vin', categoryId: '1' },
      { id: '1-2', name: 'Bière', categoryId: '1' },
      { id: '1-3', name: 'Cocktails', categoryId: '1' },
      { id: '1-4', name: 'Spiritueux', categoryId: '1' }
    ]
  },
  {
    id: '2',
    name: 'Promotion Happy Hour',
    image: 'https://images.pexels.com/photos/1269025/pexels-photo-1269025.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: [
      { id: '2-1', name: 'Entrées', categoryId: '2' },
      { id: '2-2', name: 'Offres Boissons', categoryId: '2' }
    ]
  },
  {
    id: '3',
    name: 'Manger',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: [
      { id: '3-1', name: 'Entrées', categoryId: '3' },
      { id: '3-2', name: 'Plats Principaux', categoryId: '3' },
      { id: '3-3', name: 'Desserts', categoryId: '3' }
    ]
  }
];

export const mockProducts: Product[] = [
  // Boissons Alcoolisées - Vin
  {
    id: '1',
    title: 'Cabernet Sauvignon',
    image: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 45,
    description: 'Vin rouge corsé aux riches saveurs de cassis et de chêne',
    categoryId: '1',
    subcategoryId: '1-1',
    verres: [
      { id: 'v1', name: 'Verre 12cl', price: 15 },
      { id: 'v2', name: 'Verre 18cl', price: 22 }
    ]
  },
  {
    id: '2',
    title: 'Chardonnay',
    image: 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 38,
    description: 'Vin blanc sec aux notes de pomme et de vanille',
    categoryId: '1',
    subcategoryId: '1-1',
    verres: [
      { id: 'v3', name: 'Verre 12cl', price: 12 },
      { id: 'v4', name: 'Verre 18cl', price: 18 }
    ]
  },
  // Boissons Alcoolisées - Bière
  {
    id: '3',
    title: 'IPA Artisanale',
    image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 8,
    description: 'India Pale Ale houblonnée aux notes d\'agrumes',
    categoryId: '1',
    subcategoryId: '1-2',
    verres: [
      { id: 'v5', name: 'Demi 25cl', price: 4 },
      { id: 'v6', name: 'Pinte 50cl', price: 8 }
    ]
  },
  {
    id: '4',
    title: 'Bière de Blé',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 7,
    description: 'Bière de blé légère et rafraîchissante à la finition douce',
    categoryId: '1',
    subcategoryId: '1-2',
    verres: [
      { id: 'v7', name: 'Demi 25cl', price: 3.5 },
      { id: 'v8', name: 'Pinte 50cl', price: 7 }
    ]
  },
  // Boissons Alcoolisées - Cocktails
  {
    id: '5',
    title: 'Martini Classique',
    image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 12,
    description: 'Gin ou vodka premium avec vermouth sec, garni d\'olives',
    categoryId: '1',
    subcategoryId: '1-3',
    extras: [
      { id: 'e1', name: 'Olives supplémentaires', price: 2 },
      { id: 'e2', name: 'Gin Premium', price: 3 }
    ]
  },
  {
    id: '6',
    title: 'Mojito',
    image: 'https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 10,
    description: 'Menthe fraîche, citron vert, rhum et eau pétillante',
    categoryId: '1',
    subcategoryId: '1-3'
  },
  // Happy Hour - Entrées
  {
    id: '7',
    title: 'Ailes de Poulet (Happy Hour)',
    image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 8,
    description: 'Ailes de poulet buffalo croustillantes avec céleri et fromage bleu (50% de réduction pendant l\'happy hour)',
    categoryId: '2',
    subcategoryId: '2-1'
  },
  {
    id: '8',
    title: 'Nachos Géants',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 6,
    description: 'Nachos garnis de fromage, jalapeños et crème aigre (Spécial Happy Hour)',
    categoryId: '2',
    subcategoryId: '2-1'
  },
  // Happy Hour - Offres Boissons
  {
    id: '9',
    title: 'Margarita Maison 50 Dh',
    image: 'https://images.pexels.com/photos/5946985/pexels-photo-5946985.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 5,
    description: 'Margarita classique préparée avec tequila maison et citron vert frais (Happy hour uniquement)',
    categoryId: '2',
    subcategoryId: '2-2'
  },
  // Manger - Entrées
  {
    id: '10',
    title: 'Anneaux de Calamar',
    image: 'https://images.pexels.com/photos/4518604/pexels-photo-4518604.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 12,
    description: 'Anneaux de calamar dorés frits servis avec sauce marinara',
    categoryId: '3',
    subcategoryId: '3-1'
  },
  {
    id: '11',
    title: 'Bruschetta',
    image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 9,
    description: 'Pain grillé garni de tomates fraîches, basilic et mozzarella',
    categoryId: '3',
    subcategoryId: '3-1'
  },
  // Manger - Plats Principaux
  {
    id: '12',
    title: 'Saumon Grillé',
    image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 24,
    description: 'Saumon atlantique frais avec sauce au beurre citronné et légumes de saison',
    categoryId: '3',
    subcategoryId: '3-2',
    extras: [
      { id: 'e3', name: 'Légumes supplémentaires', price: 4 },
      { id: 'e4', name: 'Riz Pilaf', price: 3 }
    ]
  },
  {
    id: '13',
    title: 'Entrecôte',
    image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 32,
    description: 'Entrecôte de 340g cuite à la perfection avec purée de pommes de terre à l\'ail',
    categoryId: '3',
    subcategoryId: '3-2',
    extras: [
      { id: 'e5', name: 'Sauce aux champignons', price: 5 },
      { id: 'e6', name: 'Crevettes grillées', price: 8 }
    ]
  },
  // Manger - Desserts
  {
    id: '14',
    title: 'Tiramisu',
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 8,
    description: 'Dessert italien classique avec biscuits imbibés de café et mascarpone',
    categoryId: '3',
    subcategoryId: '3-3'
  },
  {
    id: '15',
    title: 'Moelleux au Chocolat',
    image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 9,
    description: 'Gâteau au chocolat chaud avec cœur coulant, servi avec glace vanille',
    categoryId: '3',
    subcategoryId: '3-3'
  }
];

export const defaultAdminCredentials: AdminCredentials = {
  username: 'Epiphany',
  password: 'epiphany@123'
};