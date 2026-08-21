import { Box } from 'lucide-react';

export function Product3DViewerSkeleton({ message = 'Loading 3D Viewer...' }) {
  return (
    <div
      role="status"
      aria-label={message}
      className="w-full aspect-square bg-[--color-surface-hover] border border-[--color-line] rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden animate-pulse"
    >
      <div className="flex flex-col items-center gap-3 text-[--color-ink-muted]">
        <div className="p-3 bg-[--color-surface] rounded-full border border-[--color-line] text-[--color-accent] animate-bounce">
          <Box className="w-6 h-6" aria-hidden="true" />
        </div>
        <span className="font-mono text-xs uppercase tracking-wider font-medium text-[--color-ink-faint]">
          {message}
        </span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-40">
        <div className="h-2 w-20 bg-[--color-line] rounded" />
        <div className="h-6 w-16 bg-[--color-line] rounded-md" />
      </div>
    </div>
  );
}
