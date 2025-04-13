import Link from 'next/link';
import { TableCell } from './table';
import React from 'react';
import { cn } from '@/lib/utils';

export const LinkableTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { href: string }
>(({ className, children, href, ...props }, ref) => (
  <TableCell className={cn('p-0', className)} {...props}>
    <Link className="p-4 block" href={href}>
      {children}
    </Link>
  </TableCell>
));
LinkableTableCell.displayName = 'LinkableTableCell';
