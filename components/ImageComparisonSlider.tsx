import React, { useState, useRef, useCallback } from 'react';

interface ImageComparisonSliderProps {
  originalImage: string;
  transformedImage: string;
  transformedImageClassName?: string;
  transformedFilterClass?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  originalImage,
  transformedImage,
  transformedImageClassName = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    let newPos = ((clientX - rect.left) / rect.width) * 100;
    newPos = Math.max(0, Math.min(100, newPos));
    setSliderPosition(newPos);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      {/* Container - Solo deslizar original vs editada */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl select-none bg-zinc-950 border border-white/10 touch-none cursor-ew-resize"
        style={{ minHeight: '300px' }}
      >
        {/* Background Layer: Editada */}
        <img
          src={transformedImage}
          alt="Editada"
          className={`w-full h-auto max-h-[65vh] object-contain block mx-auto ${transformedImageClassName}`}
        />

        {/* Foreground Layer: Original (Recortada con clipPath interactivo) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-full object-contain block mx-auto"
          />
        </div>

        {/* Etiquetas flotantes Original y Editada */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/75 backdrop-blur-md text-white font-bold text-[11px] rounded-lg border border-white/20 pointer-events-none z-10">
          Original
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 bg-sky-600/90 backdrop-blur-md text-white font-bold text-[11px] rounded-lg border border-sky-400/30 pointer-events-none z-10 shadow-lg">
          Editada (IA)
        </span>

        {/* Línea divisoria y manija del deslizador */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{
            left: `${sliderPosition}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Línea vertical blanca */}
          <div className="w-[3px] h-full bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] mx-auto" />

          {/* Botón central redondo */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_18px_rgba(0,0,0,0.6)] flex items-center justify-center text-zinc-900 border-2 border-sky-500">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center">
        <span className="text-[11px] text-zinc-400 font-medium">
          ↔ Desliza hacia la izquierda o derecha para comparar la foto Original y Editada
        </span>
      </div>
    </div>
  );
};