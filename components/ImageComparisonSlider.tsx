import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageComparisonSliderProps {
    originalImage: string;
    transformedImage: string;
    transformedImageClassName?: string;
}

const LeftArrowIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const RightArrowIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({ originalImage, transformedImage, transformedImageClassName = '' }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newPosition = ((clientX - rect.left) / rect.width) * 100;
        newPosition = Math.max(0, Math.min(100, newPosition));
        setSliderPosition(newPosition);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true;
    };

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);
    
    const handleTouchEnd = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        handleMove(e.clientX);
    }, [handleMove]);
    
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging.current) return;
        handleMove(e.touches[0].clientX);
    }, [handleMove]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
        <div 
            ref={containerRef} 
            className="comparison-slider"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <img src={originalImage} alt="Original" className="rounded-lg" />
            <div className="transformed-image-wrapper" style={{ width: `${sliderPosition}%` }}>
                <img
                    src={transformedImage}
                    alt="Transformada"
                    className={`rounded-lg image-with-filter ${transformedImageClassName}`}
                    style={{ width: containerRef.current?.offsetWidth }}
                />
            </div>
            <div
                className="slider-handle"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="slider-handle-button">
                    <LeftArrowIcon />
                    <RightArrowIcon />
                </div>
            </div>
        </div>
    );
};