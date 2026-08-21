import { Product3DViewer } from './Product3DViewer';
import { Product3DViewerSkeleton } from './Product3DViewerSkeleton';
import { Product3DViewerFallback } from './Product3DViewerFallback';

export default {
  title: 'Components/Product3DViewer',
  component: Product3DViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

const sampleTurntable = {
  id: 1,
  name: 'Heritage Plinth Spinner',
  category: 'Turntables',
  brand: 'Meridian & Vale',
  colorway: 'Walnut',
  image: 'https://picsum.photos/seed/cadence-Turntables-1/600/600',
  images: ['https://picsum.photos/seed/cadence-Turntables-1/600/600'],
};

const sampleHeadphones = {
  id: 2,
  name: 'Studio Reference Open-Backs',
  category: 'Headphones',
  brand: 'Oscura',
  colorway: 'Matte Black',
  image: 'https://picsum.photos/seed/cadence-Headphones-2/600/600',
  images: ['https://picsum.photos/seed/cadence-Headphones-2/600/600'],
};

const sampleAmplifier = {
  id: 3,
  name: 'Signature Integrated Tube Amp',
  category: 'Amplifiers',
  brand: 'Solstice Audio',
  colorway: 'Brushed Copper',
  image: 'https://picsum.photos/seed/cadence-Amplifiers-3/600/600',
  images: ['https://picsum.photos/seed/cadence-Amplifiers-3/600/600'],
};

const sampleSpeaker = {
  id: 4,
  name: 'Halcyon Standmount Speaker',
  category: 'Speakers',
  brand: 'Kindred Sound',
  colorway: 'Slate Grey',
  image: 'https://picsum.photos/seed/cadence-Speakers-4/600/600',
  images: ['https://picsum.photos/seed/cadence-Speakers-4/600/600'],
};

const sampleCartridge = {
  id: 5,
  name: 'Atlas MC Cartridge',
  category: 'Cartridges',
  brand: 'Northline',
  colorway: 'Cream',
  image: 'https://picsum.photos/seed/cadence-Cartridges-5/600/600',
  images: ['https://picsum.photos/seed/cadence-Cartridges-5/600/600'],
};

const sampleCable = {
  id: 6,
  name: 'Ember Phono Interconnect',
  category: 'Cables',
  brand: 'Ferrous',
  colorway: 'Brushed Copper',
  image: 'https://picsum.photos/seed/cadence-Cables-6/600/600',
  images: ['https://picsum.photos/seed/cadence-Cables-6/600/600'],
};

export const Turntable3D = {
  args: {
    product: sampleTurntable,
    fallbackImages: sampleTurntable.images,
  },
  render: (args) => (
    <div className="w-[450px]">
      <Product3DViewer {...args} />
    </div>
  ),
};

export const Headphones3D = {
  args: {
    product: sampleHeadphones,
    fallbackImages: sampleHeadphones.images,
  },
  render: (args) => (
    <div className="w-[450px]">
      <Product3DViewer {...args} />
    </div>
  ),
};

export const Amplifier3D = {
  args: {
    product: sampleAmplifier,
    fallbackImages: sampleAmplifier.images,
  },
  render: (args) => (
    <div className="w-[450px]">
      <Product3DViewer {...args} />
    </div>
  ),
};

export const Speaker3D = {
  args: {
    product: sampleSpeaker,
    fallbackImages: sampleSpeaker.images,
  },
  render: (args) => (
    <div className="w-[450px]">
      <Product3DViewer {...args} />
    </div>
  ),
};

export const Cartridge3D = {
  args: {
    product: sampleCartridge,
    fallbackImages: sampleCartridge.images,
  },
  render: (args) => (
    <div className="w-[450px]">
      <Product3DViewer {...args} />
    </div>
  ),
};

export const Cable3D = {
  args: {
    product: sampleCable,
    fallbackImages: sampleCable.images,
  },
  render: (args) => (
    <div className="w-[450px]">
      <Product3DViewer {...args} />
    </div>
  ),
};

export const LoadingState = {
  render: () => (
    <div className="w-[450px]">
      <Product3DViewerSkeleton message="Loading 3D Product Viewer..." />
    </div>
  ),
};

export const WebGLFallback = {
  render: () => (
    <div className="w-[450px]">
      <Product3DViewerFallback
        reason="3D view isn't supported on this device or browser."
        images={sampleTurntable.images}
        onSwitchToImages={() => alert('Switched to image gallery')}
      />
    </div>
  ),
};
