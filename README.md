<h1 align="center">
  react-animated-menu
</h1>
<p align="center" style="font-size: 1.5rem;">
  Simple primitives to build dynamic menu and list components.
</p>

<hr />

<p align="center">
<img src="https://github.com/timc1/react-animated-menu/blob/master/demo.gif" alt="demo" />
</p>

## Introduction
You want to build a sidebar for your app's dashboard — maybe create a table of contents for your documentation page.
When you click on a link in the sidebar you want to expand the contents. 

You also want to use a simple plug and play API that controls the opening/closing of menus items, lets you control 
the ease and duration of the menu animation, and allows you flexibility to build your UI however you'd like.

## This approach

`react-animated-menu` manages all menu state and user interactions for you so you can simply focus on building your UI.

It uses a single [compound component](https://kentcdodds.com/blog/compound-components-with-react-hooks) 
paired with a [render prop](https://reactjs.org/docs/render-props.html) to provide maximum flexibility, exposing only props
that are valuable for you.

> NOTE: This solution transforms the menu's `height` property. 
> Typically we should be animating CSS transforms; however,
> in this particular case, using plain Javascript to transition
> height is a lot simpler.

## Installation

Install this module as a dependency using `npm` or `yarn`

```
npm install --save react-animated-menu
```
or 
```
yarn add -D react-animated-menu
```

## Usage

There are 2 components that this module provides - simply use them like this:

```js
import DynamicMenu, { MenuItem } from 'react-animated-menu'

export default function Menu() {
  return (
    <aside>
      {/* Wrap the menu in a Higher Ordered Component */}
      <DynamicMenu
        initialOpenIndex={0}
        easeDuration={150}
        numberOfMenusThatCanBeOpenedAtOnce={1}
      >
      
        {/* Each menu toggler and the menu list content must be wrapped by a MenuItem
            render prop - and spreading the prop getters to their respective sections. */}
        <MenuItem>
          {({ isOpen, getToggleProps, getMenuProps, getLinkProps }) => (
            <>
              <button {...getToggleProps()} isOpen={isOpen}>
                Dashboard
              </button>
              <ul {...getMenuProps()}>
                {dashboardPaths.map(p => (
                  <li key={p.route}>
                    <Link to={`/${p.route}/`} {...getLinkProps()}>
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>              
            </>
          )}
        </MenuItem>
        
        {/* Same as above MenuItem! */}
        <MenuItem>
          {({ isOpen, getToggleProps, getMenuProps, getLinkProps }) => (
            <>
              <button {...getToggleProps()} isOpen={isOpen}>
                Settings
              </button>
              <ul {...getMenuProps()}>
                {settingPaths.map(p => (
                  <li key={p.route}>
                    <Link to={`/${p.route}/`} {...getLinkProps()}>
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>              
            </>
          )}
        </MenuItem>
      </DynamicMenu>
    </aside>
  )
}
```

## Basic Props

### children
The nested child elements.

### initialOpenIndex
> number | number[] - defaults to -1 (all menu items closed)

The initial MenuItem that should be open.

### numberOfMenusThatCanBeOpenedAtOnce
> number - defaults to 1

The number of menus that can be opened at once. 😀

### easeFn
> (t: number) => number

An easing function - see [https://gist.github.com/gre/1650294](https://gist.github.com/gre/1650294) for a list of options.

### easeDuration
> number - defaults to 150 (ms)

Duration of the menu transition.


## License

MIT









