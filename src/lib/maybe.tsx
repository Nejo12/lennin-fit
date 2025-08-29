import React from 'react';

export function Maybe({
  if: cond,
  children,
}: {
  if: boolean;
  children: React.ReactNode;
}) {
  return cond ? children : null;
}
