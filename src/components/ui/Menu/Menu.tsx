import { ComponentProps, ReactNode } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '~/lib/cn';
import { optionClasses, popoverClasses } from '../popoverClasses';

/* A menu of actions opened from a button, e.g. a row's "more" button */
export const Menu = DropdownMenu.Root;

/* Wraps the button that opens the menu */
export const MenuTrigger = (props: ComponentProps<typeof DropdownMenu.Trigger>) => (
  <DropdownMenu.Trigger asChild {...props} />
);

export const MenuContent = ({
  className,
  align = 'end',
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      align={align}
      sideOffset={8}
      collisionPadding={8}
      className={cn(
        popoverClasses,
        'flex min-w-[220px] flex-col gap-0.5 p-2 shadow-[0_22px_48px_-16px_var(--shadow)]',
        className
      )}
      {...props}
    />
  </DropdownMenu.Portal>
);

interface MenuItemProps extends ComponentProps<typeof DropdownMenu.Item> {
  icon?: ReactNode;
  // Destructive actions such as delete
  danger?: boolean;
}

export const MenuItem = ({
  icon,
  danger = false,
  className,
  children,
  ...props
}: MenuItemProps) => (
  <DropdownMenu.Item
    className={cn(
      optionClasses,
      'h-11 gap-2.5 whitespace-nowrap [&_svg]:shrink-0 [&_svg]:text-muted',
      danger && 'text-expense [&_svg]:text-expense',
      className
    )}
    {...props}>
    {icon}
    {children}
  </DropdownMenu.Item>
);
