import {setAttribute, removeAttribute} from './set_attribute'
import createElement from './create_element'
import {groupByKey} from '../vdom/vnode'
import diff, * as diffActions from '../vdom/diff'
import {has, isUndefined, isNull} from '../util/index'
import * as dom from './dom'

/**
 * Compare two virtual nodes and update the dom element
 */

export default function patchNode (domElem, oldVnode, newVnode) {
  // Skip updating this whole sub-tree
  if (oldVnode === newVnode) {
    return domElem
  }

  // Remove the DOM
  if (!isUndefined(oldVnode) && isUndefined(newVnode)) {
    // Unmount the components
    dom.removeChild(domElem.parentNode, domElem)
    return domElem
  }

  // Replace the DOM
  if (!isNull(oldVnode) && isNull(newVnode) || isNull(oldVnode) && !isNull(newVnode) || oldVnode.type !== newVnode.type) {
    return replaceNode(domElem, newVnode)
  }

  // Two nodes with the same type reaching this point

  // Element
  let newDomElem = domElem
  if (newVnode.isElement()) {
    if (oldVnode.tagName !== newVnode.tagName) {
      // Replace the whole DOM element
      newDomElem = replaceNode(domElem, newVnode)
    } else {
      // Same tagName, update the attributes
      updateAttributes(domElem, oldVnode, newVnode)
      patchChildren(domElem, oldVnode, newVnode)
    }
  } else if (newVnode.isText()) {
    // Text
    if (oldVnode.nodeValue !== newVnode.nodeValue) {
      setAttribute(domElem, 'nodeValue', newVnode.nodeValue, oldVnode.nodeValue)
    }
  }
  return newDomElem
}

export function patchChildren (parentElem, oldNode, newNode) {
  let { CREATE, UPDATE, MOVE, REMOVE } = diffActions
  let oldChildren = groupByKey(oldNode.children)
  let newChildren = groupByKey(newNode.children)
  let key = a => a.key

  // Make a copy of the references to children to be deleted
  let domChildNodes = Array.prototype.slice.call(dom.childNodes(parentElem))

  function effect (type, prev, next, pos) {
    switch (type) {
      case CREATE: {
        let newDomElem = createElement(next.item)
        dom.insertBefore(parentElem, newDomElem, dom.childNode(parentElem, pos))
        break
      }
      case UPDATE: {
        let domElem = dom.childNode(parentElem, prev.index)
        patchNode(domElem, prev.item, next.item)
        break
      }
      case MOVE: {
        let childDomElem = dom.childNode(parentElem, prev.index)
        patchNode(childDomElem, prev.item, next.item)
        dom.insertBefore(parentElem, childDomElem, dom.childNode(parentElem, pos))
        break
      }
      case REMOVE: {
        dom.removeChild(parentElem, domChildNodes[prev.index])
        break
      }
    }
  }

  diff(oldChildren, newChildren, effect, key)
}

/**
 * compare the attributes of the two virtual nodes and update the dom attributes and event handlers
 * @param domElem
 * @param oldNode
 * @param newNode
 */
function updateAttributes (domElem, oldNode, newNode) {
  let oldAttrs = oldNode.attrs
  let newAttrs = newNode.attrs

  for (let name in newAttrs) {
    if (newAttrs[name] !== oldAttrs[name]) {
      setAttribute(domElem, name, newAttrs[name], oldAttrs[name])
    }
  }

  for (let name in oldAttrs) {
    if (!has(name, newAttrs)) {
      removeAttribute(domElem, name, oldAttrs[name])
    }
  }
}

function replaceNode (domElem, newNode) {
  let newDomElem = createElement(newNode)
  dom.replaceNode(newDomElem, domElem)
  return newDomElem
}
