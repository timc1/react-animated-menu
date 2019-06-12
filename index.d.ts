export type DynamicMenuProps = {
  children: React.ReactNode
  easeFn?: (t: number) => number
  easeDuration?: number
  initialOpenIndex?: number | number[]
  numberOfMenusThatCanBeOpenedAtOnce?: number
}

export type MenuItemProps = {
  children: (props?: any) => React.ReactNode
  [k: string]: any
}

declare module 'react-animated-menu' {
  export default function DynamicMenu(props: DynamicMenuProps): any
  export function MenuItem(props: MenuItemProps): any
}
