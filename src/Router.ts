import {
  element,
  useEffect,
  Slot,
  useMemo,
  createAtom,
  useAtom,
  useAtomValue,
  useAtomSetter,
} from '@rendrjs/core';

interface Route {
  path: string
  regexp?: RegExp
  slot: Slot
  disabled?: boolean
}

interface CompiledRoute {
  matcher: RegExp
  tester: RegExp
  params: string[]
  slot: Slot
  disabled: boolean
}

let pathRegExp = new RegExp('{([^/]+)}', 'g');

let compileRoute = (route: Route): CompiledRoute => {
  let matches = [...route.path.matchAll(pathRegExp)];
  let params = matches.map(match => match[1]);
  let finalRegExpStr = `^${route.path.replace(pathRegExp, '([^/]+)')}$`;
  return {
    params,
    slot: route.slot,
    disabled: route.disabled ?? false,
    matcher: route.path === '*' ? new RegExp('.+', 'g') : new RegExp(finalRegExpStr, 'g'),
    tester: route.path === '*' ? new RegExp('.+') : new RegExp(finalRegExpStr),
  };
};

let match = (routes: CompiledRoute[]): CompiledRoute | undefined => {
  for (let i = 0; i < routes.length; i++) {
    let rt = routes[i];
    if (!rt.disabled && rt.tester.test(location.pathname)) {
      return rt;
    }
  }
};

export let navigate = (path: string) => {
  if (location.pathname !== path) {
    history.pushState({}, '', path);
    triggerNewPathEvent();
  }
};

export let triggerNewPathEvent = () => dispatchEvent(new PopStateEvent('popstate'));

export let routeAtom = createAtom<CompiledRoute | undefined>(undefined);
let pathnameAtom = createAtom<string>(location.pathname);

export interface RouterProps {
  routes: Route[]
  class?: string
  outlet?: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap
}

export let Router = ({ routes, outlet = 'div', class: className }: RouterProps) => {
  let [route, setRoute] = useAtom(routeAtom);
  let setPathname = useAtomSetter(pathnameAtom);
  let compiledRoutes = useMemo(() => routes.map(compileRoute), [routes]);

  useEffect(() => {
    let listener = () => {
      setRoute(match(compiledRoutes));
      setPathname(location.pathname);
    };
    listener();
    addEventListener('popstate', listener);
    return () => removeEventListener('popstate', listener);
  }, [compiledRoutes]);

  return element(outlet, { slot: route?.slot, class: className });
};

interface Params {
  [key: string]: string | undefined
}

export let usePathname = () => useAtomValue(pathnameAtom);

export let useParams = <T extends Params>(): T => {
  let route = useAtomValue(routeAtom);
  return useMemo(() => {
    let matches = [...location.pathname.matchAll(route!.matcher)];
    let params = {} as Params;
    for (let i = 0; i < route!.params.length; i++) {
      params[route!.params[i]] = matches[i][1];
    }
    return params as T;
  }, [route]);
};

