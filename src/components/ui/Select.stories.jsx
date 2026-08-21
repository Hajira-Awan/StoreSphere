import { Select } from './Select';

export default {
  title: 'UI/Select',
  component: Select,
};

export const Default = {
  args: {
    id: 'story-select',
    label: 'Category',
    options: [
      { value: 'all', label: 'All categories' },
      { value: 'turntables', label: 'Turntables' },
      { value: 'headphones', label: 'Headphones' },
    ],
  },
};

export const SortBy = {
  args: {
    id: 'story-select-sort',
    label: 'Sort by',
    options: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price-asc', label: 'Price: Low to High' },
      { value: 'price-desc', label: 'Price: High to Low' },
    ],
  },
};
