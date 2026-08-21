import { useState, useEffect, useRef, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Eye,
} from 'lucide-react';
import { Product3DViewerFallback } from './Product3DViewerFallback';
import { Product3DViewerSkeleton } from './Product3DViewerSkeleton';

/**
 * Utility to check if WebGL rendering is supported in the current environment.
 */
export function checkWebGLSupport() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
}

/**
 * Colorway material properties builder
 */
function getColorwayPalette(colorway = 'Matte Black') {
  const normalized = colorway.toLowerCase();
  if (normalized.includes('walnut')) {
    return { primary: '#5C3A21', secondary: '#70482D', metal: '#8F8F8F', roughness: 0.6, metalness: 0.1 };
  }
  if (normalized.includes('copper')) {
    return { primary: '#B86D43', secondary: '#D48455', metal: '#E5A075', roughness: 0.35, metalness: 0.85 };
  }
  if (normalized.includes('slate')) {
    return { primary: '#3A4048', secondary: '#4E5560', metal: '#A0AAB5', roughness: 0.4, metalness: 0.5 };
  }
  if (normalized.includes('cream')) {
    return { primary: '#EBE7DF', secondary: '#D9D3C7', metal: '#C0B8A8', roughness: 0.5, metalness: 0.2 };
  }
  // Default Matte Black
  return { primary: '#1F1F1F', secondary: '#2C2C2C', metal: '#666666', roughness: 0.4, metalness: 0.4 };
}

/* ─────────────────────────────────────────────────────────────
 * 3D PROCEDURAL MODELS PER CATEGORY
 * ───────────────────────────────────────────────────────────── */

function TurntableModel({ palette, autoRotate }) {
  const recordRef = useRef();
  useFrame((_, delta) => {
    if (recordRef.current && autoRotate) {
      recordRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Plinth Base */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.25, 1.8]} />
        <meshStandardMaterial color={palette.primary} roughness={palette.roughness} metalness={palette.metalness} />
      </mesh>
      
      {/* Feet */}
      {[-1, 1].map((x) =>
        [-0.7, 0.7].map((z) => (
          <mesh key={`foot-${x}-${z}`} position={[x * 1, -0.16, z * 0.7]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.08, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Platter Base */}
      <mesh position={[-0.3, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 32]} />
        <meshStandardMaterial color={palette.metal} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Vinyl Record */}
      <group ref={recordRef} position={[-0.3, 0.2, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.02, 32]} />
          <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Record Label */}
        <mesh position={[0, 0.011, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.002, 32]} />
          <meshStandardMaterial color="#E8722C" roughness={0.4} />
        </mesh>
        {/* Center Spindle */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 16]} />
          <meshStandardMaterial color="#FFFFFF" metalness={1.0} roughness={0.1} />
        </mesh>
      </group>

      {/* Tonearm Assembly */}
      <group position={[0.75, 0.2, 0.4]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
          <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.4, 0.15, -0.3]} rotation={[0.2, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 16]} />
          <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.05, 0.12, 0.05]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function HeadphonesModel({ palette }) {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Headband Arc */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.9, 0.06, 16, 32, Math.PI]} />
        <meshStandardMaterial color={palette.primary} roughness={palette.roughness} metalness={palette.metalness} />
      </mesh>

      {/* Left Earcup Assembly */}
      <group position={[-0.9, 0, 0]} rotation={[0, 0, 0.15]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.45, 0.25, 32]} />
          <meshStandardMaterial color={palette.secondary} roughness={palette.roughness} metalness={palette.metalness} />
        </mesh>
        {/* Cushion Pad */}
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.35, 0.08, 16, 32]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
        </mesh>
        {/* Outer Accent Ring */}
        <mesh position={[-0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[0.2, 0.38, 32]} />
          <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Earcup Assembly */}
      <group position={[0.9, 0, 0]} rotation={[0, 0, -0.15]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.45, 0.25, 32]} />
          <meshStandardMaterial color={palette.secondary} roughness={palette.roughness} metalness={palette.metalness} />
        </mesh>
        {/* Cushion Pad */}
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.35, 0.08, 16, 32]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
        </mesh>
        {/* Outer Accent Ring */}
        <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[0.2, 0.38, 32]} />
          <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function AmplifierModel({ palette }) {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Main Body Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.9, 1.6]} />
        <meshStandardMaterial color={palette.primary} roughness={palette.roughness} metalness={palette.metalness} />
      </mesh>

      {/* Front Plate Accent */}
      <mesh position={[0, 0, 0.81]} castShadow>
        <boxGeometry args={[2.36, 0.86, 0.02]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Volume Knob */}
      <group position={[0.6, 0, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
          <meshStandardMaterial color={palette.metal} roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Indicator Notch */}
        <mesh position={[0, 0.041, 0.15]}>
          <boxGeometry args={[0.02, 0.01, 0.06]} />
          <meshStandardMaterial color="#E8722C" />
        </mesh>
      </group>

      {/* Selector Knobs */}
      {[-0.6, -0.2, 0.15].map((x, i) => (
        <mesh key={`knob-${i}`} position={[x, 0, 0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
          <meshStandardMaterial color={palette.metal} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Status LED Light */}
      <mesh position={[-0.95, 0.25, 0.83]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#E8722C" emissive="#E8722C" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function SpeakerModel({ palette }) {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Cabinet Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 2.2, 1.2]} />
        <meshStandardMaterial color={palette.primary} roughness={palette.roughness} metalness={palette.metalness} />
      </mesh>

      {/* Front Baffle */}
      <mesh position={[0, 0, 0.61]} castShadow>
        <boxGeometry args={[1.2, 2.1, 0.02]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.6} />
      </mesh>

      {/* Woofer Driver */}
      <group position={[0, -0.3, 0.63]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#151515" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={palette.metal} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* Tweeter Driver */}
      <group position={[0, 0.55, 0.63]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.03, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#222222" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#E8722C" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function CartridgeModel({ palette }) {
  return (
    <group position={[0, 0, 0]} rotation={[0.2, 0.4, 0]}>
      {/* Headshell Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.6, 1.2]} />
        <meshStandardMaterial color={palette.primary} roughness={palette.roughness} metalness={palette.metalness} />
      </mesh>
      
      {/* Lower Stylus Body */}
      <mesh position={[0, -0.35, 0.1]} castShadow>
        <boxGeometry args={[0.7, 0.35, 0.8]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Gold Terminal Pins */}
      {[-0.2, 0.2].map((x) =>
        [-0.1, 0.1].map((y) => (
          <mesh key={`pin-${x}-${y}`} position={[x, y, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 12]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
          </mesh>
        ))
      )}

      {/* Needle Cantilever */}
      <mesh position={[0, -0.55, 0.4]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
        <meshStandardMaterial color="#E8722C" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function CableModel({ palette }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Cable Coil Loop */}
      <mesh rotation={[Math.PI / 3, 0, 0]} castShadow>
        <torusGeometry args={[0.85, 0.09, 16, 64]} />
        <meshStandardMaterial color={palette.primary} roughness={palette.roughness} metalness={palette.metalness} />
      </mesh>

      {/* RCA Connectors */}
      <group position={[-0.8, -0.2, 0.5]} rotation={[0.4, -0.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.45, 24]} />
          <meshStandardMaterial color={palette.secondary} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 12]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      <group position={[0.8, 0.2, -0.5]} rotation={[-0.4, 0.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.45, 24]} />
          <meshStandardMaterial color={palette.secondary} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 12]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * GLTF External Model Loader component
 */
function ExternalGLTFModel({ url, onError }) {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

/**
 * Model Router Component: decides whether to load external GLTF or category model
 */
function ProductModel({ product, modelUrl, autoRotate }) {
  const [loadError, setLoadError] = useState(false);
  const palette = useMemo(() => getColorwayPalette(product?.colorway), [product?.colorway]);

  if (modelUrl && !loadError) {
    return <ExternalGLTFModel url={modelUrl} onError={() => setLoadError(true)} />;
  }

  const category = product?.category || 'Turntables';
  switch (category) {
    case 'Turntables':
      return <TurntableModel palette={palette} autoRotate={autoRotate} />;
    case 'Headphones':
      return <HeadphonesModel palette={palette} />;
    case 'Amplifiers':
      return <AmplifierModel palette={palette} />;
    case 'Speakers':
      return <SpeakerModel palette={palette} />;
    case 'Cartridges':
      return <CartridgeModel palette={palette} />;
    case 'Cables':
      return <CableModel palette={palette} />;
    default:
      return <TurntableModel palette={palette} autoRotate={autoRotate} />;
  }
}

/**
 * Internal ErrorBoundary to catch Canvas setup & render errors gracefully
 */
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Viewer Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Product3DViewerFallback
          reason="The 3D model could not be rendered on your device."
          images={this.props.images}
          altText={this.props.altText}
          onSwitchToImages={this.props.onSwitchToImages}
        />
      );
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────────────
 * MAIN REUSABLE Product3DViewer COMPONENT
 * ───────────────────────────────────────────────────────────── */

export function Product3DViewer({
  product,
  modelUrl = null,
  fallbackImages = [],
  onSwitchToImages = null,
  className = '',
}) {
  const [webglSupported, setWebglSupported] = useState(true);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);

  // Reduced motion preference detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const isSupported = checkWebGLSupport();
    setWebglSupported(isSupported);

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const matches = !!mediaQuery?.matches;
      setPrefersReducedMotion(matches);
      if (matches) {
        setAutoRotate(false);
      }
      const listener = (e) => {
        setPrefersReducedMotion(!!e.matches);
        if (e.matches) setAutoRotate(false);
      };
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // Keyboard navigation & accessibility handlers
  const handleKeyDown = (e) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    
    // Prevent default scroll behavior when using navigation keys on active viewer
    const activeKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '=', '-', '_', 'r', 'R'];
    if (activeKeys.includes(e.key)) {
      e.preventDefault();
    }

    const rotateAngle = 0.15;
    switch (e.key) {
      case 'ArrowLeft':
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() - rotateAngle);
        controls.update();
        break;
      case 'ArrowRight':
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() + rotateAngle);
        controls.update();
        break;
      case 'ArrowUp':
        controls.setPolarAngle(Math.max(0.1, controls.getPolarAngle() - rotateAngle));
        controls.update();
        break;
      case 'ArrowDown':
        controls.setPolarAngle(Math.min(Math.PI - 0.1, controls.getPolarAngle() + rotateAngle));
        controls.update();
        break;
      case '+':
      case '=':
        controls.dollyIn(1.2);
        controls.update();
        break;
      case '-':
      case '_':
        controls.dollyOut(1.2);
        controls.update();
        break;
      case 'r':
      case 'R':
        handleResetView();
        break;
      default:
        break;
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleZoom = (direction) => {
    if (!controlsRef.current) return;
    if (direction === 'in') controlsRef.current.dollyIn(1.25);
    else controlsRef.current.dollyOut(1.25);
    controlsRef.current.update();
  };

  const handleRotateManual = (direction) => {
    if (!controlsRef.current) return;
    const angle = 0.3;
    if (direction === 'left') controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() - angle);
    if (direction === 'right') controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + angle);
    if (direction === 'up') controlsRef.current.setPolarAngle(Math.max(0.1, controlsRef.current.getPolarAngle() - angle));
    if (direction === 'down') controlsRef.current.setPolarAngle(Math.min(Math.PI - 0.1, controlsRef.current.getPolarAngle() + angle));
    controlsRef.current.update();
  };

  if (!webglSupported) {
    return (
      <Product3DViewerFallback
        reason="3D view isn't supported on this device or browser."
        images={fallbackImages.length ? fallbackImages : product?.images || [product?.image]}
        altText={product?.name}
        onSwitchToImages={onSwitchToImages}
      />
    );
  }

  const productName = product?.name || 'Product';
  const descId = `3d-viewer-desc-${product?.id || 'default'}`;

  return (
    <CanvasErrorBoundary images={fallbackImages} altText={productName} onSwitchToImages={onSwitchToImages}>
      <div
        ref={containerRef}
        role="region"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`Interactive 3D viewer for ${productName}`}
        aria-describedby={descId}
        className={`w-full aspect-square relative rounded-lg overflow-hidden border border-[--color-line] bg-[--color-surface-hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] ${className}`}
      >
        {/* Screen Reader Instructions */}
        <p id={descId} className="sr-only">
          Interactive 3D product viewer. Use left and right arrow keys to rotate horizontally, up and down arrow keys to rotate vertically, plus and minus keys to zoom, and R to reset the camera view.
        </p>

        {/* 3D WebGL Canvas */}
        <Suspense fallback={<Product3DViewerSkeleton message="Rendering 3D Model..." />}>
          <Canvas
            shadows
            dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)]}
            camera={{ position: [0, 1.2, 3.5], fov: 45 }}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              // Ensure proper cleanup on unmount
              gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
            }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-5, 3, -5]} intensity={0.4} />

            <Stage environment="city" intensity={0.5} shadow={false} adjustCamera={false}>
              <ProductModel product={product} modelUrl={modelUrl} autoRotate={autoRotate && !prefersReducedMotion} />
            </Stage>

            <OrbitControls
              ref={controlsRef}
              enableZoom={true}
              enablePan={false}
              enableDamping={!prefersReducedMotion}
              dampingFactor={0.05}
              rotateSpeed={0.8}
              minDistance={1.8}
              maxDistance={6.0}
              maxPolarAngle={Math.PI / 2 + 0.1}
              autoRotate={autoRotate && !prefersReducedMotion}
              autoRotateSpeed={1.5}
            />
          </Canvas>
        </Suspense>

        {/* Control Overlay Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[--color-surface]/90 backdrop-blur-md p-1.5 rounded-lg border border-[--color-line] shadow-md z-10">
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Reset 3D camera view"
            title="Reset View (R)"
            className="p-1.5 text-[--color-ink-muted] hover:text-[--color-accent] hover:bg-[--color-surface-hover] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[--color-line]" />

          <button
            type="button"
            onClick={() => handleZoom('in')}
            aria-label="Zoom in 3D model"
            title="Zoom In (+)"
            className="p-1.5 text-[--color-ink-muted] hover:text-[--color-accent] hover:bg-[--color-surface-hover] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleZoom('out')}
            aria-label="Zoom out 3D model"
            title="Zoom Out (-)"
            className="p-1.5 text-[--color-ink-muted] hover:text-[--color-accent] hover:bg-[--color-surface-hover] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[--color-line]" />

          <button
            type="button"
            onClick={() => handleRotateManual('left')}
            aria-label="Rotate left"
            title="Rotate Left (Left Arrow)"
            className="p-1.5 text-[--color-ink-muted] hover:text-[--color-accent] hover:bg-[--color-surface-hover] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleRotateManual('right')}
            aria-label="Rotate right"
            title="Rotate Right (Right Arrow)"
            className="p-1.5 text-[--color-ink-muted] hover:text-[--color-accent] hover:bg-[--color-surface-hover] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {!prefersReducedMotion && (
            <>
              <div className="h-4 w-px bg-[--color-line]" />
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                aria-pressed={autoRotate}
                aria-label={autoRotate ? 'Pause 3D auto rotation' : 'Start 3D auto rotation'}
                title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
                className={`p-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] ${
                  autoRotate ? 'text-[--color-accent] bg-[--color-accent]/10' : 'text-[--color-ink-muted] hover:bg-[--color-surface-hover]'
                }`}
              >
                <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
              </button>
            </>
          )}
        </div>

        {/* Floating Interactive Badge */}
        <div className="absolute top-3 left-3 bg-[--color-surface]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[--color-line] text-[11px] font-mono text-[--color-ink-muted] flex items-center gap-1.5 pointer-events-none">
          <Eye className="w-3.5 h-3.5 text-[--color-accent]" />
          <span>3D Interactive</span>
        </div>
      </div>
    </CanvasErrorBoundary>
  );
}

export default Product3DViewer;
