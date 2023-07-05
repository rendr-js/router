import { ClickEvent, Slot, rendr, useAtomValue, useCallback } from '@rendrjs/core';
import { routeAtom, triggerNewPathEvent } from './Router';

export interface LinkProps {
    className?: string
    to: string
    slot: Slot
}

export let Link = ({ to, className, slot }: LinkProps) => {
  useAtomValue(routeAtom);

  let onclick = useCallback((e: ClickEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    history.pushState({}, '', to);
    triggerNewPathEvent();
  }, [to]);

  if (to === location.pathname) {
    className += ' active';
  }

  return rendr('a', {
    className,
    href: to,
    slot,
    onclick,
  });
};
