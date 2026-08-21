import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { backoffDelay } from '../machines/inventoryMachine';

const STATUS_CONFIG = {
  connected: {
    label: 'Live',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    Icon: Wifi,
  },
  connecting: {
    label: 'Connecting…',
    dotClass: 'bg-amber-500 animate-inventory-pulse',
    textClass: 'text-amber-600 dark:text-amber-400',
    Icon: Loader2,
  },
  reconnecting: {
    label: 'Reconnecting…',
    dotClass: 'bg-amber-500 animate-inventory-pulse',
    textClass: 'text-amber-600 dark:text-amber-400',
    Icon: Loader2,
  },
  disconnected: {
    label: 'Offline',
    dotClass: 'bg-red-500',
    textClass: 'text-red-600 dark:text-red-400',
    Icon: WifiOff,
  },
};

export function ConnectionStatus() {
  const { connectionStatus, retryCount } = useInventory();
  const [isSubtle, setIsSubtle] = useState(false);

  // After 3 seconds of being connected, fade to subtle mode
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const timer = setTimeout(() => setIsSubtle(true), 3000);
      return () => clearTimeout(timer);
    }
    setIsSubtle(false);
  }, [connectionStatus]);

  const config = STATUS_CONFIG[connectionStatus] || STATUS_CONFIG.disconnected;
  const { label, dotClass, textClass, Icon } = config;

  const isSpinning = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';
  const nextRetryMs = connectionStatus === 'reconnecting' ? backoffDelay(retryCount) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${label}`}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border border-[--color-line] bg-[--color-surface]
        transition-all duration-500 ease-in-out select-none
        ${isSubtle ? 'opacity-50 hover:opacity-100' : 'opacity-100'}
      `}
      title={
        nextRetryMs
          ? `Retrying in ${(nextRetryMs / 1000).toFixed(0)}s (attempt ${retryCount})`
          : label
      }
    >
      {/* Animated dot */}
      <span className="relative flex h-2 w-2">
        {connectionStatus === 'connected' && (
          <span
            className={`absolute inset-0 rounded-full ${dotClass} opacity-75 animate-ping`}
            style={{ animationDuration: '2s' }}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
      </span>

      {/* Icon */}
      <Icon
        className={`w-3 h-3 ${textClass} ${isSpinning ? 'animate-spin' : ''}`}
        style={isSpinning ? { animationDuration: '1.5s' } : undefined}
        aria-hidden="true"
      />

      {/* Label */}
      <span className={textClass}>
        {label}
      </span>
    </div>
  );
}
