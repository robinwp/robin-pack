import a from './core/a';
import dayjs from 'dayjs';
import b from './core/b';
const calcjs = require('./calcjs');

require('./index.css');
a();
new b().className();

console.log(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'));

const textEl = document.getElementById('text');
const errorEl = document.getElementById('error');
const lexicalEl = document.getElementById('lexical-warp');
const treeEL = document.getElementById('tree');
const resutlEL = document.getElementById('resutl');
const config = {
  width: 50,
  widthSpace: 50,
  heightSpace: 40,
};
textEl.value = '-(5/13-7)*(17+9)';
handle(textEl.value);
textEl.addEventListener('blur', () => {
  handle(textEl.value);
});

function handle (value) {
  try {
    const { tree, list, result } = calcjs(value);
    lexicalEl.innerHTML = '';
    treeEL.innerHTML = '';
    const codeLIst = list.map((item) => {
      const li = document.createElement('li');
      li.innerText = item.value;
      return li;
    });
    codeLIst.forEach(item => {
      lexicalEl.appendChild(item);
    });
    resutlEL.innerText = result;
    calcBound(tree);
    let left = 0;
    if (tree.leftChild) {
      left = tree.leftChild.bound.clientWidth + config.widthSpace / 2 - config.width / 2;
    }
    layout(0, left, tree);
    const width = tree.bound.clientWidth + 2;
    const height = tree.bound.clientHeight + 2;
    treeEL.style.width = `${ width }px`;
    treeEL.style.height = `${ height }px`;
    treeEL.style.display = 'block';
    const svg = createSvgEl('svg', {
      width,
      height,
      style: 'position: absolute;left: 0;top: 0;',
    });
    treeEL.appendChild(svg);
    render(tree, treeEL, svg);
    errorEl.style.display = 'none';
  } catch (e) {
    lexicalEl.innerHTML = '';
    treeEL.innerHTML = '';
    treeEL.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.innerText = e.stack;
  }
}


/**
 * 渲染
 */
function render (tree, treeEL, svg) {
  const item = document.createElement('div');
  item.innerText = tree.value;
  item.className = 'item';
  item.style.left = `${ tree.position.left }px`;
  item.style.lineHeight = item.style.height = item.style.width = `${ config.width - 2 }px`;
  item.style.top = `${ tree.position.top }px`;
  treeEL.appendChild(item);
  if (tree.leftChild) {
    svg.appendChild(createSvgEl('line', {
      x1: tree.position.left + config.width / 2,
      y1: tree.position.top + config.width,
      x2: tree.leftChild.position.left + config.width / 2,
      y2: tree.leftChild.position.top,
      stroke: '#fe6549',
      'stroke-width': 1,
      fill: 'none',
    }));
    render(tree.leftChild, treeEL, svg);
  }
  if (tree.rightChild) {
    svg.appendChild(createSvgEl('line', {
      x1: tree.position.left + config.width / 2,
      y1: tree.position.top + config.width,
      x2: tree.rightChild.position.left + config.width / 2,
      y2: tree.rightChild.position.top,
      stroke: '#fe6549',
      'stroke-width': 1,
      fill: 'none',
    }));
    render(tree.rightChild, treeEL, svg);
  }
}

/**
 * 创建svg元素
 */
function createSvgEl (tagName, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  if (attrs) {
    for (let key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        el.setAttribute(key, attrs[key]);
      }
    }
  }
  return el;
}

/**
 * 布局
 */
function layout (top, left, tree) {
  const childTop = top + config.width + config.heightSpace;
  if (tree.leftChild) {
    let leftChildLeft = left + config.width / 2 - config.widthSpace / 2 - config.width;
    if (tree.leftChild.rightChild) {
      leftChildLeft = leftChildLeft - tree.leftChild.rightChild.bound.clientWidth - config.widthSpace / 2 + config.width / 2;
    }
    layout(childTop, leftChildLeft, tree.leftChild);
  }
  if (tree.rightChild) {
    let rightChildLeft = left + config.width / 2 + config.widthSpace / 2 - (left === 0 ? (config.width - config.widthSpace) / 2 : 0);
    if (tree.rightChild.leftChild) {
      rightChildLeft = rightChildLeft + tree.rightChild.leftChild.bound.clientWidth + config.widthSpace / 2 - config.width / 2;
    }
    layout(childTop, rightChildLeft, tree.rightChild);
  }
  tree.position = {
    top,
    left,
  };
}

/**
 * 计算宽度
 * @param tree
 */
function calcBound (tree) {
  const bound = {
    width: config.width,
    height: config.width,
    clientHeight: config.width,
    clientWidth: config.width,
  };

  let clientWidth = 0;
  let clientHeight = 0;
  if (tree.leftChild) {
    const leftChildBound = calcBound(tree.leftChild);
    clientWidth += leftChildBound.clientWidth;
    if (leftChildBound.clientHeight > clientHeight) {
      clientHeight = leftChildBound.clientHeight;
    }
  }
  if (tree.rightChild) {
    const rightChildBound = calcBound(tree.rightChild);
    clientWidth += rightChildBound.clientWidth;
    if (rightChildBound.clientHeight > clientHeight) {
      clientHeight = rightChildBound.clientHeight;
    }
  }
  bound.clientWidth = (clientWidth > 0) ? clientWidth + config.widthSpace : bound.clientWidth;
  bound.clientHeight = (clientHeight > 0) ? clientHeight + config.heightSpace + bound.clientHeight : bound.clientHeight;
  return tree.bound = bound;
}
