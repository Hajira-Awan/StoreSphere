import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Product3DViewer, checkWebGLSupport } from './Product3DViewer';
import { Product3DViewerFallback } from './Product3DViewerFallback';
import { Product3DViewerSkeleton } from './Product3DViewerSkeleton';

const mockProduct = {
  id: 1,
  name: 'Reference Turntable Deck',
  category: 'Turntables',
  colorway: 'Walnut',
  image: 'https://picsum.photos/600/600',
  images: ['https://picsum.photos/600/600'],
};

describe('Product3DViewer', () => {
  let originalGetContext;
  let originalWebGLContext;

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalWebGLContext = window.WebGLRenderingContext;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.WebGLRenderingContext = originalWebGLContext;
  });

  it('renders WebGL unsupported fallback when WebGL is unavailable', () => {
    delete window.WebGLRenderingContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

    render(
      <Product3DViewer
        product={mockProduct}
        fallbackImages={mockProduct.images}
      />
    );

    expect(screen.getByRole('region', { name: /3D Viewer Unavailable Fallback/i })).toBeInTheDocument();
    expect(screen.getByText(/3D View Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/3D view isn't supported on this device or browser/i)).toBeInTheDocument();
  });

  it('Product3DViewerFallback triggers switch to images callback', () => {
    const handleSwitch = vi.fn();
    render(
      <Product3DViewerFallback
        reason="WebGL is disabled."
        images={mockProduct.images}
        onSwitchToImages={handleSwitch}
      />
    );

    const switchBtn = screen.getByRole('button', { name: /Switch to Image Gallery/i });
    expect(switchBtn).toBeInTheDocument();
    fireEvent.click(switchBtn);
    expect(handleSwitch).toHaveBeenCalledTimes(1);
  });

  it('Product3DViewerSkeleton renders with accessible loading status', () => {
    render(<Product3DViewerSkeleton message="Loading 3D Assets..." />);

    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute('aria-label', 'Loading 3D Assets...');
    expect(screen.getByText('Loading 3D Assets...')).toBeInTheDocument();
  });

  it('detects WebGL capability using checkWebGLSupport', () => {
    const isSupported = checkWebGLSupport();
    expect(typeof isSupported).toBe('boolean');
  });

  it('renders screen reader instructions and controls when WebGL is mocked as supported', () => {
    window.WebGLRenderingContext = class WebGLRenderingContext {};
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      getExtension: () => null,
      getParameter: () => 1024,
    });

    render(
      <Product3DViewer
        product={mockProduct}
        fallbackImages={mockProduct.images}
      />
    );

    // Screen reader accessible region
    const viewerRegion = screen.getByRole('region', { name: /Interactive 3D viewer for Reference Turntable Deck/i });
    expect(viewerRegion).toBeInTheDocument();

    // Reset button exists
    const resetBtn = screen.getByRole('button', { name: /Reset 3D camera view/i });
    expect(resetBtn).toBeInTheDocument();

    // Zoom buttons exist
    expect(screen.getByRole('button', { name: /Zoom in 3D model/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zoom out 3D model/i })).toBeInTheDocument();

    // Rotation controls exist
    expect(screen.getByRole('button', { name: /Rotate left/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rotate right/i })).toBeInTheDocument();
  });

  it('supports keyboard navigation listeners without crashing', () => {
    window.WebGLRenderingContext = class WebGLRenderingContext {};
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      getExtension: () => null,
      getParameter: () => 1024,
    });

    render(
      <Product3DViewer
        product={mockProduct}
        fallbackImages={mockProduct.images}
      />
    );

    const viewerRegion = screen.getByRole('region', { name: /Interactive 3D viewer/i });
    
    // Fire keyboard events
    fireEvent.keyDown(viewerRegion, { key: 'ArrowRight' });
    fireEvent.keyDown(viewerRegion, { key: 'ArrowLeft' });
    fireEvent.keyDown(viewerRegion, { key: 'ArrowUp' });
    fireEvent.keyDown(viewerRegion, { key: 'ArrowDown' });
    fireEvent.keyDown(viewerRegion, { key: '+' });
    fireEvent.keyDown(viewerRegion, { key: '-' });
    fireEvent.keyDown(viewerRegion, { key: 'r' });

    expect(viewerRegion).toBeInTheDocument();
  });
});
