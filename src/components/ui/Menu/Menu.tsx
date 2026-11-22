import { ComponentProps, createContext, ReactNode, use, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '~/lib/cn';
import { optionClasses, popoverClasses } from '../popoverClasses';

// Whether the menu is open, so its button can open it on a tap
const MenuOpenContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(
  null
);

/* A menu of actions opened from a button, e.g. a row's "more" button */
export const Menu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <MenuOpenContext value={{ open, setOpen }}>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        {children}
      </DropdownMenu.Root>
    </MenuOpenContext>
  );
};

/*
 * Wraps the button that opens the menu. A mouse opens it on press, as Radix does. A finger opens it
 * on a tap instead, so a scroll that starts on the button doesn't open it: the browser sends no
 * click once the finger moves.
 */
export const MenuTrigger = ({
  onPointerDown,
  onClick,
  ...props
}: ComponentProps<typeof DropdownMenu.Trigger>) => {
  const menu = use(MenuOpenContext);
  const touched = useRef(false);
  return (
    <DropdownMenu.Trigger
      asChild
      onPointerDown={event => {
        onPointerDown?.(event);
        touched.current = event.pointerType !== 'mouse';
        // Stops Radix opening it on the press
        if (touched.current) event.preventDefault();
      }}
      onClick={event => {
        onClick?.(event);
        if (touched.current) menu?.setOpen(!menu.open);
      }}
      {...props}
    />
  );
};

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

/* A line between groups of items, e.g. before Delete */
export const MenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.Separator>) => (
  <DropdownMenu.Separator className={cn('mx-2 my-1 h-px bg-border', className)} {...props} />
);

/* One choice of several, e.g. what to sort by. The picked one shows a tick, or what's passed in. */
export const MenuRadioGroup = DropdownMenu.RadioGroup;

interface MenuRadioItemProps extends ComponentProps<typeof DropdownMenu.RadioItem> {
  // Shown at the end when picked, e.g. the sort direction
  indicator?: ReactNode;
}

export const MenuRadioItem = ({ indicator, className, children, ...props }: MenuRadioItemProps) => (
  <DropdownMenu.RadioItem
    className={cn(optionClasses, 'h-11 justify-between gap-2.5 whitespace-nowrap', className)}
    {...props}>
    {children}
    <DropdownMenu.ItemIndicator className="font-extrabold text-accent-text">
      {indicator}
    </DropdownMenu.ItemIndicator>
  </DropdownMenu.RadioItem>
);
