import { Input } from './Input';

export default {
  title: 'UI/Input',
  component: Input,
};

export const Default = {
  args: { id: 'story-input', label: 'Email address', placeholder: 'you@example.com' },
};

export const WithHiddenLabel = {
  args: {
    id: 'story-input-hidden',
    label: 'Search products',
    hideLabel: true,
    placeholder: 'Search…',
  },
};

export const Disabled = {
  args: { id: 'story-input-disabled', label: 'Promo code', disabled: true, value: 'LOCKED' },
};
