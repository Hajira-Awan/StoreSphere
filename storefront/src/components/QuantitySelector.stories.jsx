import { useState } from 'react';
import { QuantitySelector } from './QuantitySelector';

export default {
  title: 'Components/QuantitySelector',
  component: QuantitySelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

const Template = (args) => {
  const [quantity, setQuantity] = useState(args.quantity || 1);
  return <QuantitySelector {...args} quantity={quantity} onChange={setQuantity} />;
};

export const Default = Template.bind({});
Default.args = {
  quantity: 1,
  min: 1,
  max: 10,
};

export const AtMinimum = Template.bind({});
AtMinimum.args = {
  quantity: 1,
  min: 1,
  max: 10,
};

export const AtMaximum = Template.bind({});
AtMaximum.args = {
  quantity: 10,
  min: 1,
  max: 10,
};
