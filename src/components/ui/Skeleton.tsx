import React from 'react';
import s from './Skeleton.module.scss';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  animated?: boolean;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({
  width,
  height,
  borderRadius,
  className,
  animated = true,
  variant = 'rectangular',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : '40px'),
    borderRadius: borderRadius || (variant === 'circular' ? '50%' : '4px'),
  };

  return (
    <div
      className={`${s.skeleton} ${animated ? s.animated : ''} ${s[variant]} ${className || ''}`}
      style={style}
      role="status"
      aria-label="Loading"
    />
  );
}

// Compound components for common use cases
Skeleton.Text = ({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={className}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height="1em"
        className={i === lines - 1 ? s.lastLine : ''}
      />
    ))}
  </div>
);

Skeleton.Avatar = ({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
);

Skeleton.Card = ({ className }: { className?: string }) => (
  <div className={`${s.card} ${className || ''}`}>
    <Skeleton height="200px" className={s.cardImage} />
    <div className={s.cardContent}>
      <Skeleton.Text lines={2} />
      <Skeleton height="60px" className={s.cardActions} />
    </div>
  </div>
);

Skeleton.List = ({
  items = 5,
  className,
}: {
  items?: number;
  className?: string;
}) => (
  <div className={className}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className={s.listItem}>
        <Skeleton.Avatar size={32} />
        <div className={s.listContent}>
          <Skeleton.Text lines={1} />
          <Skeleton.Text lines={1} />
        </div>
      </div>
    ))}
  </div>
);
