/**
 * Fills the table with data.
 * @param {Object} args - The arguments object.
 * @param {number} args.cols - The number of columns.
 * @param {number} args.rows - The number of rows.
 */
function fillTable(args) {
  const thead = document.querySelector('#table>thead');
  const tbody = document.querySelector('#table>tbody');

  let headerRow = '<tr>';
  for (let i = 1; i <= args.cols; i++) {
    headerRow += `<th>col${i}</th>`;
  }
  headerRow += '</tr>';
  thead.innerHTML = headerRow;

  let bodyRows = '';
  for (let j = 1; j <= args.rows; j++) {
    let row = '<tr>';
    for (let i = 1; i <= args.cols; i++) {
      const text = i === 2
        ? 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium beatae commodi deserunt dolore eaque eos, et expedita fuga magni neque nisi nostrum numquam officiis placeat porro repellendus sapiente tempora voluptatibus.'
        : `Column ${i}, Row ${j}`;
      row += `<td>${text}</td>`;
    }
    row += '</tr>';
    bodyRows += row;
  }
  tbody.innerHTML = bodyRows;
}

/**
 * Makes the table resizable.
 */
function makeTableResizable() {
  /**
   * Change the width of the element and its next sibling.
   * @param {HTMLElement} el - Target element.
   * @param {number} elWidth - Width of the target element.
   * @param {number} nextSiblingWidth - Width of the next sibling element.
   */
  const resize = (el, elWidth, nextSiblingWidth = elWidth) => {
    el.style.width = `${elWidth}px`;
    el.style.maxWidth = `${elWidth}px`;
    if (el.nextElementSibling) {
      el.nextElementSibling.style.width = `${nextSiblingWidth}px`;
      el.nextElementSibling.style.maxWidth = `${nextSiblingWidth}px`;
    }
  };

  const ths = document.querySelectorAll('th');
  const initColWidth = ths[0]?.getBoundingClientRect().width;
  const minWidth = ths[0]?.style.minWidth.replace(/[^\d.]/g, '') || 100; // Minimum width of the resizer element
  ths.forEach(resizer => {
    resizer.style.userSelect = 'none'; // Disable text selection on the resizer element

    const resizerHandle = document.createElement('div');
    resizerHandle.style.position = 'absolute';
    resizerHandle.style.right = '0';
    resizerHandle.style.bottom = '0';
    resizerHandle.style.top = '0';
    resizerHandle.style.width = '10px';
    resizerHandle.style.marginRight = '-5px';
    resizerHandle.style.zIndex = '1';
    resizerHandle.style.cursor = 'col-resize';
    resizer.appendChild(resizerHandle);

    resize(resizer, initColWidth); // Set initial width for the resizer element

    resizerHandle.addEventListener('mousedown', (e) => {
      const startX = e.pageX; // Initial mouse position
      const startWidth = resizer.getBoundingClientRect().width; // Initial width of the resizer element
      const nextStartWidth = resizer.nextElementSibling?.getBoundingClientRect().width; // Initial width of the next sibling element

      const doDrag = (e) => {
        const deltaX = e.pageX - startX;
        const nextWidth = startWidth + deltaX;
        const nextSiblingWidth = nextStartWidth - deltaX;
        if (nextWidth < minWidth || nextSiblingWidth < minWidth) return;
        resize(resizer, nextWidth, nextSiblingWidth);
      };

      const stopDrag = () => {
        document.documentElement.removeEventListener('mousemove', doDrag);
        document.documentElement.removeEventListener('mouseup', stopDrag);
      };

      document.documentElement.addEventListener('mousemove', doDrag);
      document.documentElement.addEventListener('mouseup', stopDrag);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fillTable({ cols: 5, rows: 60 });
  makeTableResizable();
});
