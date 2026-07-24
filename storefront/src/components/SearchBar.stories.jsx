import { useState } from 'react';
import { SearchBar } from './SearchBar';

export default {
  title: 'Catalog/SearchBar',
  component: SearchBar,
};

function Controlled() {
  const [value, setValue] = useState('');
  return (
    <div className="max-w-sm">
      <SearchBar value={value} onChange={setValue} />
    </div>
  );
}

export const Default = {
  render: () => <Controlled />,
};
