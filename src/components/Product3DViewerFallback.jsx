import { AlertCircle, Image as ImageIcon } from 'lucide-react';

export function Product3DViewerFallback({
  reason = "3D view isn't supported on this device or browser.",
  images = [],
  _altText = "Product Image",
  onSwitchToImages,
}) {
  return (
    <div
      role="region"
      aria-label="3D Viewer Unavailable Fallback"
      className="w-full aspect-square bg-[--color-surface] border border-[--color-line] rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
    >
      {images.length > 0 ? (
        <div className="absolute inset-0 opacity-20 filter blur-sm select-none pointer-events-none">
          <img src={images[0]} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}

      <div className="relative z-10 max-w-xs flex flex-col items-center gap-3">
        <div className="p-3 bg-[--color-surface-hover] rounded-full border border-[--color-line] text-[--color-accent]">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        
        <h4 className="font-serif text-lg text-[--color-ink]">3D View Unavailable</h4>
        
        <p className="text-sm text-[--color-ink-muted] leading-relaxed">
          {reason}
        </p>

        {onSwitchToImages && (
          <button
            onClick={onSwitchToImages}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[--color-surface-hover] hover:bg-[--color-line] text-[--color-ink] border border-[--color-line] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          >
            <ImageIcon className="w-4 h-4" /> Switch to Image Gallery
          </button>
        )}
      </div>
    </div>
  );
}
