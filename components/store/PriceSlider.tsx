'use client';

import React from 'react';
import * as Slider from '@radix-ui/react-slider';

interface PriceSliderProps {
  minPrice: number;
  maxPrice: number;
  ceilingPrice: number;
  onPriceChange: (min: number, max: number) => void;
  onPageReset?: () => void;
}

export const PriceSlider: React.FC<PriceSliderProps> = ({
  minPrice,
  maxPrice,
  ceilingPrice,
  onPriceChange,
  onPageReset,
}) => {
  const safeCeiling = Math.max(ceilingPrice, 10);
  const safeMin = Math.min(Math.max(0, minPrice), safeCeiling);
  const safeMax = Math.max(safeMin, Math.min(maxPrice, safeCeiling * 2));

  const handleSliderChange = ([newMin, newMax]: number[]) => {
    onPriceChange(newMin, newMax);
    if (onPageReset) onPageReset();
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Radix UI Dual-Thumb Interactive Slider */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
        value={[safeMin, safeMax]}
        max={safeCeiling}
        min={0}
        step={10}
        minStepsBetweenThumbs={1}
        onValueChange={handleSliderChange}
      >
        <Slider.Track className="bg-zinc-200 dark:bg-zinc-800 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-[#9ae600] rounded-full h-full" />
        </Slider.Track>

        {/* Min Thumb */}
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-zinc-900 rounded-full shadow-md hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
          aria-label="Minimum Price"
        />

        {/* Max Thumb */}
        <Slider.Thumb
          className="block w-5 h-5 bg-[#9ae600] border-2 border-black rounded-full shadow-md hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
          aria-label="Maximum Price"
        />
      </Slider.Root>

      {/* Editable Input Boxes */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Min Price Card */}
        <div className="p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex flex-col justify-between focus-within:border-[#9ae600] transition-colors">
          <label htmlFor="min-price-input" className="block text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-1">
            Min Price
          </label>
          <div className="flex items-center justify-between gap-1">
            <input
              id="min-price-input"
              type="number"
              min={0}
              max={safeMax}
              value={safeMin}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                onPriceChange(Math.min(val, safeMax), safeMax);
                if (onPageReset) onPageReset();
              }}
              className="w-full bg-transparent font-mono font-bold text-zinc-900 dark:text-white focus:outline-none text-xs"
            />
            <span className="font-mono text-[10px] font-extrabold bg-[#9ae600] text-black px-1.5 py-0.5 rounded shrink-0">
              MAD
            </span>
          </div>
        </div>

        {/* Max Price Card */}
        <div className="p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex flex-col justify-between focus-within:border-[#9ae600] transition-colors">
          <label htmlFor="max-price-input" className="block text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-1">
            Max Price
          </label>
          <div className="flex items-center justify-between gap-1">
            <input
              id="max-price-input"
              type="number"
              min={safeMin}
              max={safeCeiling * 2}
              value={safeMax}
              onChange={(e) => {
                const val = e.target.value === '' ? safeMin : Number(e.target.value);
                onPriceChange(safeMin, Math.max(val, safeMin));
                if (onPageReset) onPageReset();
              }}
              className="w-full bg-transparent font-mono font-bold text-zinc-900 dark:text-white focus:outline-none text-xs"
            />
            <span className="font-mono text-[10px] font-extrabold bg-[#9ae600] text-black px-1.5 py-0.5 rounded shrink-0">
              MAD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};