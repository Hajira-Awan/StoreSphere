import { Skeleton, ProductCardSkeleton } from './Skeleton';

export default {
  title: 'UI/Skeleton',
};

export const BasicBlock = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const ProductCardGrid = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-w-2xl">
      <ProductCardSkeleton view="grid" />
      <ProductCardSkeleton view="grid" />
      <ProductCardSkeleton view="grid" />
    </div>
  ),
};

export const ProductCardList = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-xl">
      <ProductCardSkeleton view="list" />
      <ProductCardSkeleton view="list" />
    </div>
  ),
};
