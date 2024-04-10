/**
 * Fills the table with data.
 * @param {Object} args - Arguments object.
 * @param {string} args.tableContainerSelector - Selector of table with thead and tbody elements.
 * @param {number | undefined} args.cols - Number of columns.
 * @param {number | undefined} args.rows - Number of rows.
 */
function tableFill({ cols = 5, rows = 60, tableContainerSelector }) {
  const thead = document.querySelector(`${tableContainerSelector} > table > thead`);
  const tbody = document.querySelector(`${tableContainerSelector} > table > tbody`);
  // Clear table
  thead.replaceChildren();
  tbody.replaceChildren();
  // Fill table header
  const tr = thead.appendChild(document.createElement('tr'));
  for (let col = 1; col <= cols; ++col) {
    const th = document.createElement('th');
    th.textContent = `Column ${col}`;
    tr.appendChild(th);
  }
  // Fill table body
  for (let row = 1; row <= rows; ++row) {
    const tr = tbody.appendChild(document.createElement('tr'));
    for (let col = 1; col <= cols; ++col) {
      const td = document.createElement('td');
      td.textContent = col % 2 === 0
        ? 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium beatae commodi deserunt dolore eaque eos, et expedita fuga magni neque nisi nostrum numquam officiis placeat porro repellendus sapiente tempora voluptatibus.'
        : `Column ${col}, Row ${row}`;
      tr.appendChild(td);
    }
  }
}

/**
 * Makes the table resizable.
 * @param {string} tableContainerSelector - Selector of table container.
 */
function tableMakeResizable(tableContainerSelector) {
  // Prevent memory leaks on repeat calls of tableMakeResizable()
  // Assigned at the end of current function
  tableMakeResizable.removeListeners?.();

  /**
   * Change the width of the element and its next sibling.
   * @param {HTMLElement} el - Target element.
   * @param {number} widthNext - Width of the target element.
   * @param {number} sibWidthNext - Width of the next sibling element.
   */
  const resize = (el, widthNext, sibWidthNext = widthNext) => {
    el.style.width = `${widthNext}px`;
    el.style.minWidth = `${widthNext}px`;
    el.style.maxWidth = `${widthNext}px`;
    if (el.nextElementSibling) {
      el.nextElementSibling.style.width = `${sibWidthNext}px`;
      el.nextElementSibling.style.minWidth = `${sibWidthNext}px`;
      el.nextElementSibling.style.maxWidth = `${sibWidthNext}px`;
    }
  };

  const thMinWidth = 100; // Minimum width of the resizer element
  const tableContainer = document.querySelector(tableContainerSelector);
  const table = tableContainer.querySelector('table');
  const ths = Array.from((table.querySelectorAll('th')));
  const initWidths = ths.map(th => th.getBoundingClientRect().width);
  // Make each column resizable
  const listenersRemovers = ths.map((th, idx) => {
    // Disable text selection on the th element
    th.style.userSelect = 'none';
    // Memoize width of th element from the first column
    // for preventing interface jitters on first resizer movements
    resize(th, initWidths[idx]);

    // Create resizer element inside current th
    const resizer = th.appendChild(document.createElement('div'));
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.top = '0';
    resizer.style.width = '10px';
    resizer.style.marginRight = '-5px';
    resizer.style.zIndex = '1';
    resizer.style.cursor = 'col-resize';

    // Subscribe to `start of resizer movement` event
    const onStartColumnResize = (leftBtnDownEvent) => {
      // Memoize initial state on the start of resizer movement
      const initThWidth = th.getBoundingClientRect().width;
      let mouseX = leftBtnDownEvent.pageX;
      let sibThWidth = th.nextElementSibling?.getBoundingClientRect().width;

      /** Calc and change width of column and its next sibling */
      const onMouseMove = throttle(1000 / 60 /* 60 fps */, (moveEvent) => {
        const mouseXDelta = moveEvent.pageX - mouseX;
        const thWidthNext = th.getBoundingClientRect().width + mouseXDelta;
        if (thWidthNext < thMinWidth) return;
        const isNoTableXScroll = tableContainer.clientWidth >= table.clientWidth;
        const isThWidthBecameLower = thWidthNext >= initThWidth;
        const sibThWidthNext = isNoTableXScroll || isThWidthBecameLower ? sibThWidth - mouseXDelta : sibThWidth;
        resize(th, thWidthNext, sibThWidthNext);
        mouseX = moveEvent.pageX;
        sibThWidth = sibThWidthNext;
      });

      /** Unsubscribe from movements and end tracking */
      const onMouseUp = () => {
        document.documentElement.removeEventListener('mousemove', onMouseMove);
        document.documentElement.removeEventListener('mouseup', onMouseUp);
      };

      // Subscribe to series of movements and their end
      document.documentElement.addEventListener('mousemove', onMouseMove);
      document.documentElement.addEventListener('mouseup', onMouseUp);
    };

    resizer.addEventListener('mousedown', onStartColumnResize);
    return () => resizer.removeEventListener('mousedown', onStartColumnResize)
  });

  tableMakeResizable.removeListeners = () => listenersRemovers.forEach(removeListener => removeListener());
}

/**
 * Throttles the function.
 * @param {number} delay - Delay in milliseconds.
 * @param {Function} fn - Function to throttle.
 * @returns {Function} - Throttled function.
 */
function throttle(delay, fn) {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    return fn(...args);
  };
}

/**
 * Initializes buttons.
 * @param {string} tableContainerSelector - Selector of table with thead and tbody elements.
 */
function buttonsInitialize(tableContainerSelector) {
  document.querySelectorAll('[data-btn-cols]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tableFill({ cols: +btn.getAttribute('data-btn-cols'), tableContainerSelector });
      tableMakeResizable(tableContainerSelector);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const tableContainerSelector = '#table-container';
  tableFill({ tableContainerSelector });
  tableMakeResizable(tableContainerSelector);
  buttonsInitialize(tableContainerSelector);
});
