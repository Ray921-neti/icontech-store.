import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Zap, 
  Headphones, 
  BatteryCharging, 
  Watch, 
  Shield, 
  Sparkles, 
  Grid 
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { ProductCategory } from '../types';

interface CategoryGridProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'Tablet':
        return <Tablet className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-5 h-5" />;
      case 'Watch':
        return <Watch className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Grid className="w-5 h-5" />;
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            Explore Categories
          </h2>
          <p className="text-xs text-gray-500">Shop by gadget type and mobile accessories</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group p-3.5 bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition text-left flex flex-col justify-between h-32 relative overflow-hidden"
          >
            {/* Background subtle image */}
            <div className="absolute right-1 bottom-1 w-14 h-14 opacity-20 group-hover:opacity-40 transition duration-300">
              <img
                src={cat.localVectorImg || cat.featuredImg}
                alt={cat.label}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = cat.featuredImg;
                }}
                className="w-full h-full object-contain rounded-tl-xl"
              />
            </div>

            <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white transition flex items-center justify-center shadow-xs">
              {getCategoryIcon(cat.iconName)}
            </div>

            <div className="relative z-10">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-orange-600 transition leading-snug">
                {cat.label}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">
                {cat.itemCount}+ products
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
