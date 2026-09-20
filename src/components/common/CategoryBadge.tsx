import React from 'react';
import type { ReceiptCategory } from '../../types';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';
import { cn } from '../../utils/cn';

interface CategoryBadgeProps {
  category: ReceiptCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
  className,
  onClick,
}) => {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.notes;
  const Icon = theme.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      id={`cat-badge-${category}`}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border whitespace-nowrap transition-all duration-200 select-none',
        theme.bgLight,
        theme.textColor,
        theme.borderColor,
        sizeStyles[size],
        onClick && 'cursor-pointer hover:brightness-125 active:scale-95',
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span>{theme.name}</span>
    </span>
  );
};
