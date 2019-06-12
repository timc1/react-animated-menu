import React from 'react'
import { DynamicMenuProps, MenuItemProps } from '../index.d'

// DynamicMenu uses React.Children.map to recursively check each
// child element. If a MenuItem component is found, it will apply
// the proper props to the component, in which MenuItem will take
// the updated props and render its children accordingly.
export default function DynamicMenu({
  children,
  easeFn = easeOutQuint,
  easeDuration = 150,
  initialOpenIndex = -1, // Can be array of numbers [1, 2, 3] or just a number 1
  numberOfMenusThatCanBeOpenedAtOnce = 1,
}: DynamicMenuProps) {
  // We'll always reference initialOpenIndex as an array of numbers.
  // This will allow us to have multiple menu items open at once.
  initialOpenIndex =
    typeof initialOpenIndex === 'number' ? [initialOpenIndex] : initialOpenIndex
  // Splice off the number of menu items that can be opened at once.
  initialOpenIndex.splice(numberOfMenusThatCanBeOpenedAtOnce)

  const [currentOpenIndex, setOpenIndex] = React.useState(initialOpenIndex)

  // We need to wrap our easeFn in a useCallback because since we
  // are using easeFn in MenuItem's useLayoutEffect, we need to
  // add it to its dependencies list. The problem with that is
  // referential equality (kentcdodds.com/blog/usememo-and-usecallback)
  // where easeFn will always be 'different' on each rerender.
  easeFn = React.useCallback(easeFn, [])

  const mapPropsToChildren = (children: React.ReactNode) => {
    let indexOfMatchedChildrenComponents = 0

    const recursiveMap = (children: React.ReactNode): any => {
      return React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
          return child
        }

        // @ts-ignore
        if (child.type.displayName === MenuItem.displayName) {
          const cachedIndex = indexOfMatchedChildrenComponents
          child = React.cloneElement(child, {
            onClick: () => {
              const copy = currentOpenIndex.slice()

              const indexOfItem = copy.indexOf(cachedIndex)

              indexOfItem === -1
                ? copy.unshift(cachedIndex)
                : copy.splice(indexOfItem, 1)

              // Splice off the number of menu items that can be opened
              // at once.
              copy.splice(numberOfMenusThatCanBeOpenedAtOnce)

              setOpenIndex(copy)
            },
            isOpen: currentOpenIndex.includes(cachedIndex),
            easeFn,
            easeDuration,
          })
          indexOfMatchedChildrenComponents++

          return child
        }

        if (child.props.children) {
          child = React.cloneElement(child, {
            children: recursiveMap(child.props.children),
          })
        }

        return child
      })
    }

    return recursiveMap(children)
  }
  return mapPropsToChildren(children)
}

export function MenuItem({ children, ...props }: MenuItemProps): any {
  // When we're animating, we want to allow the transition
  // to complete before triggering another animation. This
  // state value will help us accomplish that.
  const [isAnimating, setAnimating] = React.useState(false)

  const { isOpen, onClick, easeFn, easeDuration } = props
  const container = React.useRef<HTMLElement>()

  // A flag to tell if we are coming from an initial render.
  // On initial render we won't want to do any animating,
  // but just immediately set the position.
  const initialRender = React.useRef(false)
  // Cache the height of our menu item on initial load
  // so when we animate we'll know how much the target
  // height will be.
  const cachedHeight = React.useRef(0)
  React.useLayoutEffect(() => {
    const node = container.current
    if (!node) {
      throw new Error(
        `The component that you apply getMenuProps to 
        will need to be wrapped in a React.forwardRef(). 
        Please see: https://reactjs.org/docs/forwarding-refs.html`
      )
    }

    // I know, we should be animating transforms BUT
    // `transform: scaleY()` will require us to have to
    // calculate how much to translateY each MenuItem
    // that comes after this, also making it more confusing
    // when we have to allow multiple MenuItems to be open.
    // Let's not do that right now. 😳
    let animationId = -1
    let animationStartTime: any = null
    let from = 0
    let to = 0
    // We will use requestAnimationFrame to transition the
    // list's height.
    const animateHeight = () => {
      const difference = to - from
      const elapsed = Date.now() - animationStartTime

      animationId = requestAnimationFrame(animateHeight)

      if (elapsed < easeDuration) {
        cancelAnimationFrame(animationId)
        let ease: number = Number(easeFn(elapsed / easeDuration).toFixed(2))

        if (difference < 0) {
          ease = 1 - ease
        }

        const height = Math.abs(ease * difference) + 'px'
        node.style.height = height
        node.style.opacity = String(ease)
        node.style.position = 'relative'

        animationId = requestAnimationFrame(animateHeight)
      } else {
        // Reset height to auto if we're scaling up.
        if (difference < 0) {
          node.style.height = '0px'
          node.style.opacity = '0'
        } else {
          node.style.height = 'auto'
          node.style.opacity = '1'
        }

        cancelAnimationFrame(animationId)
        setAnimating(false)
      }
    }

    // We only animate after the component has already
    // initially rendered.
    if (initialRender.current) {
      animationStartTime = Date.now()
      setAnimating(true)

      if (isOpen) {
        // Animate open.
        from = 0
        to = cachedHeight.current
        animateHeight()
      } else {
        // Animate close.
        from = cachedHeight.current
        to = 0
        animateHeight()
      }
    } else {
      // We'll use setTimeout here because on initialRender,
      // it seems like getBoundingClientRect returns a slightly
      // off value for the element's size. With setTimeout,
      // we'll get an accurate size.
      setTimeout(() => {
        cachedHeight.current = node.getBoundingClientRect().height
        // Once we have the accurate height of the element, we'll
        // set its height to 0px. Since everything is hidden we
        // won't see any flashes.
        if (!isOpen && node) node.style.height = '0px'
      }, 100)

      if (isOpen) {
        node.style.opacity = '1'
        node.style.position = 'relative'
      } else {
        node.style.opacity = '0'
        node.style.position = 'absolute'
      }
      node.style.overflow = 'hidden'

      initialRender.current = true
    }

    // Cleanup.
    return () => cancelAnimationFrame(animationId)
  }, [isOpen, easeDuration, easeFn])

  const getToggleProps = () => ({
    onClick: isAnimating ? () => {} : onClick,
    'aria-haspopup': true,
    'aria-expanded': isOpen,
  })

  const getMenuProps = () => ({
    ref: container,
    'aria-hidden': !isOpen,
  })

  const getLinkProps = () => ({
    tabIndex: isOpen ? '0' : '-1',
  })

  return children({
    getToggleProps,
    getMenuProps,
    getLinkProps,
    isOpen,
  })
}

MenuItem.displayName = `MenuItem`

// Utils
// =====
function easeOutQuint(t: number): number {
  return 1 + --t * t * t * t * t
}
