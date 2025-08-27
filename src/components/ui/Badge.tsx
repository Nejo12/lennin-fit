import React from 'react';
import { cx } from '../../utils/cx';
import s from './Badge.module.scss';

type Variant = 'default' | 'brand' | 'ghost';

export default function Badge({
  children,
  variant = 'default',
  className,
}: React.PropsWithChildren<{ variant?: Variant; className?: string }>) {
  return (
    <span
      className={cx(
        s.badge,
        variant === 'brand' && s.brand,
        variant === 'ghost' && s.ghost,
        className
      )}
    >
      {children}
    </span>
  );
}
