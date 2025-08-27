import React from 'react';
import s from './Card.module.scss';

export function Card({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`${s.card} ${className ?? ''}`}>{children}</div>;
}

export function CardHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={s.header}>
      <div>
        <div className={s.title}>{title}</div>
        {sub && <div className={s.sub}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function CardContent({ children }: React.PropsWithChildren) {
  return <div className={s.content}>{children}</div>;
}

export function CardFooter({ children }: React.PropsWithChildren) {
  return <div className={s.footer}>{children}</div>;
}
