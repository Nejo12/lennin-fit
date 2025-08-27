import React from 'react';
import { cx } from '@/utils/cx';
import s from './Button.module.scss';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        s.root,
        s[variant],
        s[size],
        block && s.block,
        (rest.disabled || loading) && s.disabled,
        className
      )}
      {...rest}
    >
      {loading ? '…' : children}
    </button>
  );
}
