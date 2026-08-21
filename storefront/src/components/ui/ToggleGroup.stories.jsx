import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { ToggleGroup } from './ToggleGroup';

export default {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
};

function ViewSwitcher(args) {
  const [value, setValue] = useState(args.value ?? 'grid');
  return <ToggleGroup {...args} value={value} onChange={setValue} />;
}

export const GridListSwitch = {
  render: (args) => <ViewSwitcher {...args} />,
  args: {
    label: 'Layout',
    value: 'grid',
    options: [
      { value: 'grid', label: 'Grid view', icon: <LayoutGrid className="w-4 h-4" /> },
      { value: 'list', label: 'List view', icon: <List className="w-4 h-4" /> },
    ],
  },
};
