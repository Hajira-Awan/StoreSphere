import { useState } from 'react';

export function ProductGallery({ images = [], altText = 'Product Image' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-[--color-surface-hover] border border-[--color-line] rounded-lg flex items-center justify-center">
        <span className="text-[--color-ink-faint]">No image available</span>
      </div>
    );
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square relative rounded-lg overflow-hidden border border-[--color-line] bg-[--color-surface-hover] group">
        <img
          src={images[activeIndex]}
          alt={`${altText} - View ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-pressed={isActive}
                aria-label={`View image ${index + 1}`}
                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]
                  ${isActive ? 'border-[--color-accent] opacity-100' : 'border-transparent opacity-70 hover:opacity-100 bg-[--color-surface-hover]'}`}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
