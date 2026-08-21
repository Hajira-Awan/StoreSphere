import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductGallery } from './ProductGallery';

describe('ProductGallery', () => {
  const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

  it('renders a fallback when images array is empty', () => {
    render(<ProductGallery images={[]} />);
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('renders the first image as the main image initially', () => {
    render(<ProductGallery images={images} altText="Test Product" />);
    const mainImg = screen.getByAltText('Test Product - View 1');
    expect(mainImg).toHaveAttribute('src', 'img1.jpg');
  });

  it('clicking a thumbnail updates the main image', () => {
    render(<ProductGallery images={images} altText="Test Product" />);
    
    // Click the third thumbnail
    const btn3 = screen.getByLabelText('View image 3');
    fireEvent.click(btn3);
    
    // Main image should now be the third one
    const mainImg = screen.getByAltText('Test Product - View 3');
    expect(mainImg).toHaveAttribute('src', 'img3.jpg');
    
    // Thumbnail 3 should be active
    expect(btn3).toHaveAttribute('aria-pressed', 'true');
  });

  it('keyboard activation (Enter/Space) on a thumbnail works', () => {
    render(<ProductGallery images={images} altText="Test Product" />);
    
    const btn2 = screen.getByLabelText('View image 2');
    
    // Press Space
    fireEvent.keyDown(btn2, { key: ' ' });
    let mainImg = screen.getByAltText('Test Product - View 2');
    expect(mainImg).toHaveAttribute('src', 'img2.jpg');

    const btn3 = screen.getByLabelText('View image 3');
    
    // Press Enter
    fireEvent.keyDown(btn3, { key: 'Enter' });
    mainImg = screen.getByAltText('Test Product - View 3');
    expect(mainImg).toHaveAttribute('src', 'img3.jpg');
  });
});
