import { ProductGallery } from './ProductGallery';

export default {
  title: 'Components/ProductGallery',
  component: ProductGallery,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    images: [
      'https://picsum.photos/seed/p1/600/600',
      'https://picsum.photos/seed/p2/600/600',
      'https://picsum.photos/seed/p3/600/600',
      'https://picsum.photos/seed/p4/600/600',
    ],
    altText: 'Sample Product',
  },
};

export const SingleImage = {
  args: {
    images: ['https://picsum.photos/seed/p1/600/600'],
    altText: 'Sample Product',
  },
};

export const NoImages = {
  args: {
    images: [],
    altText: 'Sample Product',
  },
};
