import React from 'react';
import { CATEGORIES } from '../data/categories';
import { ProductCategory } from '../types';

interface CategoryGridProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="w-full">
      {/* 10 Clean Category Cards - Real Studio Product Photographs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group bg-[#FFFFFF] rounded-2xl border border-[#E5ECF5] hover:border-[#075CE5] shadow-xs hover:shadow-md transition-all duration-200 p-2.5 sm:p-3 flex flex-col items-center justify-between h-[138px] sm:h-[144px] text-center cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Realistic Studio Product Photograph */}
            <div className="w-full h-[82px] sm:h-[86px] flex items-center justify-center p-1 overflow-hidden">
              <img
                src={cat.localVectorImg || cat.featuredImg}
                alt={cat.label}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = cat.featuredImg;
                }}
                className="max-h-[76px] sm:max-h-[80px] w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Category Name Underneath */}
            <div className="w-full pt-1.5 flex items-center justify-center min-h-[32px]">
              <span className="text-[11px] sm:text-xs font-bold text-[#10264D] group-hover:text-[#075CE5] transition-colors leading-tight line-clamp-2">
                {cat.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
