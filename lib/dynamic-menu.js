var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
export default function DynamicMenu(_a) {
    var children = _a.children, _b = _a.easeFn, easeFn = _b === void 0 ? easeOutQuint : _b, _c = _a.easeDuration, easeDuration = _c === void 0 ? 150 : _c, _d = _a.initialOpenIndex, initialOpenIndex = _d === void 0 ? -1 : _d, _e = _a.numberOfMenusThatCanBeOpenedAtOnce, numberOfMenusThatCanBeOpenedAtOnce = _e === void 0 ? 1 : _e;
    initialOpenIndex =
        typeof initialOpenIndex === 'number' ? [initialOpenIndex] : initialOpenIndex;
    initialOpenIndex.splice(numberOfMenusThatCanBeOpenedAtOnce);
    var _f = React.useState(initialOpenIndex), currentOpenIndex = _f[0], setOpenIndex = _f[1];
    easeFn = React.useCallback(easeFn, []);
    var mapPropsToChildren = function (children) {
        var indexOfMatchedChildrenComponents = 0;
        var recursiveMap = function (children) {
            return React.Children.map(children, function (child) {
                if (!React.isValidElement(child)) {
                    return child;
                }
                if (child.type.displayName === MenuItem.displayName) {
                    var cachedIndex_1 = indexOfMatchedChildrenComponents;
                    child = React.cloneElement(child, {
                        onClick: function () {
                            var copy = currentOpenIndex.slice();
                            var indexOfItem = copy.indexOf(cachedIndex_1);
                            indexOfItem === -1
                                ? copy.unshift(cachedIndex_1)
                                : copy.splice(indexOfItem, 1);
                            copy.splice(numberOfMenusThatCanBeOpenedAtOnce);
                            setOpenIndex(copy);
                        },
                        isOpen: currentOpenIndex.includes(cachedIndex_1),
                        easeFn: easeFn,
                        easeDuration: easeDuration,
                    });
                    indexOfMatchedChildrenComponents++;
                    return child;
                }
                if (child.props.children) {
                    child = React.cloneElement(child, {
                        children: recursiveMap(child.props.children),
                    });
                }
                return child;
            });
        };
        return recursiveMap(children);
    };
    return mapPropsToChildren(children);
}
export function MenuItem(_a) {
    var children = _a.children, props = __rest(_a, ["children"]);
    var _b = React.useState(false), isAnimating = _b[0], setAnimating = _b[1];
    var isOpen = props.isOpen, onClick = props.onClick, easeFn = props.easeFn, easeDuration = props.easeDuration;
    var container = React.useRef();
    var initialRender = React.useRef(false);
    var cachedHeight = React.useRef(0);
    React.useLayoutEffect(function () {
        var node = container.current;
        if (!node) {
            throw new Error("The component that you apply getMenuProps to \n        will need to be wrapped in a React.forwardRef(). \n        Please see: https://reactjs.org/docs/forwarding-refs.html");
        }
        var animationId = -1;
        var animationStartTime = null;
        var from = 0;
        var to = 0;
        var animateHeight = function () {
            var difference = to - from;
            var elapsed = Date.now() - animationStartTime;
            animationId = requestAnimationFrame(animateHeight);
            if (elapsed < easeDuration) {
                cancelAnimationFrame(animationId);
                var ease = Number(easeFn(elapsed / easeDuration).toFixed(2));
                if (difference < 0) {
                    ease = 1 - ease;
                }
                var height = Math.abs(ease * difference) + 'px';
                node.style.height = height;
                node.style.opacity = String(ease);
                node.style.position = 'relative';
                animationId = requestAnimationFrame(animateHeight);
            }
            else {
                if (difference < 0) {
                    node.style.height = '0px';
                    node.style.opacity = '0';
                }
                else {
                    node.style.height = 'auto';
                    node.style.opacity = '1';
                }
                cancelAnimationFrame(animationId);
                setAnimating(false);
            }
        };
        if (initialRender.current) {
            animationStartTime = Date.now();
            setAnimating(true);
            if (isOpen) {
                from = 0;
                to = cachedHeight.current;
                animateHeight();
            }
            else {
                from = cachedHeight.current;
                to = 0;
                animateHeight();
            }
        }
        else {
            setTimeout(function () {
                cachedHeight.current = node.getBoundingClientRect().height;
                if (!isOpen && node)
                    node.style.height = '0px';
            }, 100);
            if (isOpen) {
                node.style.opacity = '1';
                node.style.position = 'relative';
            }
            else {
                node.style.opacity = '0';
                node.style.position = 'absolute';
            }
            node.style.overflow = 'hidden';
            initialRender.current = true;
        }
        return function () { return cancelAnimationFrame(animationId); };
    }, [isOpen, easeDuration, easeFn]);
    var getToggleProps = function () { return ({
        onClick: isAnimating ? function () { } : onClick,
        'aria-haspopup': true,
        'aria-expanded': isOpen,
    }); };
    var getMenuProps = function () { return ({
        ref: container,
        'aria-hidden': !isOpen,
    }); };
    var getLinkProps = function () { return ({
        tabIndex: isOpen ? '0' : '-1',
    }); };
    return children({
        getToggleProps: getToggleProps,
        getMenuProps: getMenuProps,
        getLinkProps: getLinkProps,
        isOpen: isOpen,
    });
}
MenuItem.displayName = "MenuItem";
function easeOutQuint(t) {
    return 1 + --t * t * t * t * t;
}
//# sourceMappingURL=dynamic-menu.js.map