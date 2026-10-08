'use client';

import React from 'react';
import { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: number;
  onSelectCategory: (id: number) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3">
      <div className="flex items-center gap-2 px-4 max-w-4xl mx-auto min-w-max">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-semibold'
                  : 'bg-white text-zinc-700 hover:text-black dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
