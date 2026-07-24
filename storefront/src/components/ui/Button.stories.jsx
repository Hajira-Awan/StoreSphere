import { Button } from './Button';
import { Heart } from 'lucide-react';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export const Primary = {
  args: { variant: 'primary', size: 'md', children: 'Add to cart' },
};

export const Secondary = {
  args: { variant: 'secondary', size: 'md', children: 'View details' },
};

export const Ghost = {
  args: { variant: 'ghost', size: 'md', children: 'Cancel' },
};

export const WithIcon = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: (
      <>
        <Heart className="w-4 h-4" /> Save
      </>
    ),
  },
};

export const Disabled = {
  args: { variant: 'primary', size: 'md', children: 'Sold out', disabled: true },
};
