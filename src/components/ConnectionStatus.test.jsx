import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectionStatus } from './ConnectionStatus';
import { InventoryContext } from '../context/InventoryContext';

function renderWithInventory(connectionStatus, retryCount = 0) {
  const value = {
    connectionStatus,
    retryCount,
    overrides: {},
    getStockStatus: vi.fn((id, original) => ({ inStock: original, isRealTime: false })),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
  };

  return render(
    <InventoryContext.Provider value={value}>
      <ConnectionStatus />
    </InventoryContext.Provider>
  );
}

describe('ConnectionStatus', () => {
  it('renders "Live" label when connected', () => {
    renderWithInventory('connected');
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders "Connecting…" label when connecting', () => {
    renderWithInventory('connecting');
    expect(screen.getByText('Connecting…')).toBeInTheDocument();
  });

  it('renders "Reconnecting…" label when reconnecting', () => {
    renderWithInventory('reconnecting');
    expect(screen.getByText('Reconnecting…')).toBeInTheDocument();
  });

  it('renders "Offline" label when disconnected', () => {
    renderWithInventory('disconnected');
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('has an accessible status role with aria-live', () => {
    renderWithInventory('connected');
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('includes retry info in title when reconnecting', () => {
    renderWithInventory('reconnecting', 3);
    const status = screen.getByRole('status');
    // backoffDelay(3) = 8000ms = 8s
    expect(status.title).toContain('8s');
    expect(status.title).toContain('attempt 3');
  });

  it('shows correct aria-label for each status', () => {
    renderWithInventory('disconnected');
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Connection status: Offline');
  });
});
