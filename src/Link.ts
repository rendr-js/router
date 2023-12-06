import { ClickEvent, Slot, a, useAtomValue, useCallback } from '@rendrjs/core';
import { routeAtom, triggerNewPathEvent } from './Router';

export interface LinkProps {
    class?: string
    to: string
    slot: Slot
}

export let Link = ({ to, class: className, slot }: LinkProps) => {
  useAtomValue(routeAtom);

  let onclick = useCallback((e: ClickEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    history.pushState({}, '', to);
    triggerNewPathEvent();
  }, [to]);

  if (to === location.pathname) {
    className += ' active';
  }

  return a({
    class: className,
    href: to,
    slot,
    onclick,
  });
};
