import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductARViewer } from '../components/ProductARViewer';

describe('ProductARViewer', () => {
  it('renders model-viewer and AR button', () => {
    render(<ProductARViewer name="Test Product" modelUrl="/test.glb" />);
    expect(screen.getByText('View in AR')).toBeInTheDocument();
    expect(document.querySelector('model-viewer')).toBeInTheDocument();
  });

  it('disables AR button if not supported', () => {
    Object.defineProperty(window.navigator, 'xr', { value: undefined, configurable: true });
    render(<ProductARViewer name="Test Product" modelUrl="/test.glb" />);
    expect(screen.getByTestId('ar-button')).toBeDisabled();
  });

  it('shows AR not supported message', () => {
    Object.defineProperty(window.navigator, 'xr', { value: undefined, configurable: true });
    render(<ProductARViewer name="Test Product" modelUrl="/test.glb" />);
    expect(screen.getByText(/AR not supported/)).toBeInTheDocument();
  });

  it('fires ar-button-click event on button click', () => {
    render(<ProductARViewer name="Test Product" modelUrl="/test.glb" />);
    const button = screen.getByTestId('ar-button');
    const modelViewer = document.querySelector('model-viewer');
    const handler = jest.fn();
    modelViewer?.addEventListener('ar-button-click', handler);
    fireEvent.click(button!);
    expect(handler).toHaveBeenCalled();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductARViewer, { isArSupported } from '../components/ProductARViewer';
import '@testing-library/jest-dom/extend-expect';

jest.mock('model-viewer', () => ({}));

describe('ProductARViewer', () => {
  const props = {
    id: '1',
    name: 'Test Product',
    price: 123000,
    modelUrl: 'https://cdn.example.com/models/test.glb',
  };

  beforeEach(() => {
    // default to AR supported for tests
    jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone)');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders product name and price', () => {
    render(<ProductARViewer {...props} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/IRR/)).toBeInTheDocument();
  });

  it('shows View in AR button when supported', () => {
    render(<ProductARViewer {...props} />);
    expect(screen.getByRole('button', { name: /View in AR/i })).toBeInTheDocument();
  });

  it('shows AR not supported message when not supported', () => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('');
    render(<ProductARViewer {...props} />);
    expect(screen.getByText(/AR not supported on this device/i)).toBeInTheDocument();
  });

  it('invokes AR activation when clicking button', () => {
    const activateMock = jest.fn();
    const { container } = render(<ProductARViewer {...props} />);
    const mv = container.querySelector('model-viewer') as any;
    if (mv) {
      mv.activateAR = activateMock;
    }
    const btn = screen.getByRole('button', { name: /View in AR/i });
    fireEvent.click(btn);
    expect(activateMock).toHaveBeenCalled();
  });
});
