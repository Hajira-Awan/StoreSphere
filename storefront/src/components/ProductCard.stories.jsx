import { ProductCard } from './ProductCard';

const sampleProduct = {
  id: 1,
  name: 'Heritage Belt-Drive',
  brand: 'Meridian & Vale',
  category: 'Turntables',
  price: 649,
  inStock: true,
  rating: 4.7,
  reviewCount: 128,
  image: 'https://picsum.photos/seed/cadence-Turntables-1/600/600',
  specs: { 'Drive type': 'Belt-drive', 'Wow & flutter': '0.12%' },
};

const outOfStockProduct = {
  ...sampleProduct,
  id: 2,
  name: 'Signature Direct-Drive',
  inStock: false,
  price: 1299,
};

export default {
  title: 'Catalog/ProductCard',
  component: ProductCard,
};

export const GridInStock = {
  render: () => (
    <div className="max-w-xs">
      <ProductCard product={sampleProduct} view="grid" />
    </div>
  ),
};

export const GridOutOfStock = {
  render: () => (
    <div className="max-w-xs">
      <ProductCard product={outOfStockProduct} view="grid" />
    </div>
  ),
};

export const ListView = {
  render: () => (
    <div className="max-w-xl">
      <ProductCard product={sampleProduct} view="list" />
    </div>
  ),
};
