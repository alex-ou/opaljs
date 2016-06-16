import createElement from 'src/web/create_element'
import h from 'src/vdom/create'

describe('createElement', () => {
  it('should create a single element', () => {
    var vtree = h('div', {'class': 'test'})
    var node = createElement(vtree)
    expect(node.tagName).toBe('DIV')
    expect(node.className).toBe('test')
  })

  it('should create an element with children', () => {
    var vtree = h('div', {'class': 'test'}, [
      h('span', {'color': 'red'}, 'span text'),
      h('a', {'href': '/link'})
    ])
    var node = createElement(vtree)
    expect(node.tagName).toBe('DIV')
    expect(node.className).toBe('test')
    expect(node.childNodes.length).toBe(2)

    var child = node.childNodes[0]
    expect(child.tagName).toBe('SPAN')
    expect(child.getAttribute('color')).toBe('red')
    expect(child.textContent).toBe('span text')

    child = node.childNodes[1]
    expect(child.tagName).toBe('A')
    expect(child.getAttribute('href')).toBe('/link')
  })

  it('should create an element with null', () => {
    var vtree = h('div', {}, null)
    var node = createElement(vtree)
    expect(node.innerHTML).toBe('<noscript></noscript>')
  })

  it('should create an input with value', () => {
    var vtree = h('input', {value: 10})
    var node = createElement(vtree)
    expect(node.value).toBe('10')
  })
})