'use client';

import React from "react";

interface FilterOptionsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const FilterOptions: React.FC<FilterOptionsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="w-full">
      <select
        id="category"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="block w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition duration-150 focus:outline-none focus:border-ring focus:ring-2 focus:ring-muted focus:ring-offset-[2px] focus:ring-offset-background"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};
