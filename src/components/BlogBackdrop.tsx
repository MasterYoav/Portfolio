import { useEffect, useState } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

/** Animated ShaderGradient behind the writing pages. Freezes under reduced motion. */
export function BlogBackdrop() {
  const [animate, setAnimate] = useState<'on' | 'off'>('on');

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setAnimate(mq.matches ? 'off' : 'on');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <ShaderGradientCanvas pixelDensity={2.4} fov={45} pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        {/* ponytail: export-tool props (format, frameRate, destination, axesHelper, gizmoHelper, embedMode) have no runtime effect, so they're omitted. */}
        <ShaderGradient
          control="props"
          animate={animate}
          brightness={1.2}
          cAzimuthAngle={180}
          cDistance={1.84}
          cPolarAngle={90}
          cameraZoom={1}
          color1="#6e97ff"
          color2="#d691db"
          color3="#b6c5e1"
          envPreset="city"
          grain="on"
          lightType="3d"
          positionX={-1.4}
          positionY={0}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          shader="defaults"
          type="plane"
          uAmplitude={1}
          uDensity={2.4}
          uFrequency={5.5}
          uSpeed={0.2}
          uStrength={1}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>
      {/* Scrim keeps body copy at AA contrast over the pastel gradient in both themes. */}
      <div className="absolute inset-0 bg-background/60 dark:bg-background/70" />
    </div>
  );
}
