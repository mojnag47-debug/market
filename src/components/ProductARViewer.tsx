declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}
import '@google/model-viewer';
import React from 'react';

export interface ProductARViewerProps {
  name: string;
  modelUrl: string;
}

function ProductARViewer({ name, modelUrl }: ProductARViewerProps) {
  const [arSupported, setArSupported] = React.useState(false);

  React.useEffect(() => {
    setArSupported(
      'xr' in navigator ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <model-viewer
        src={modelUrl}
        alt={name}
        ar
        ar-modes="scene-viewer quick-look webxr"
        camera-controls
        shadow-intensity="1"
        style={{ width: '100%', height: '400px', background: '#f9fafb' }}
        ios-src={modelUrl}
        auto-rotate
        poster="/ar-poster.png"
      />
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!arSupported}
        onClick={() => {
          document.querySelector('model-viewer')?.dispatchEvent(new CustomEvent('ar-button-click'));
        }}
        data-testid="ar-button"
      >
        View in AR
      </button>
      {!arSupported && (
        <p className="mt-2 text-sm text-gray-500">AR not supported on this device.</p>
      )}
    </div>
  );
}

export default ProductARViewer;
