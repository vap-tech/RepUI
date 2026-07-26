function positiveInteger(value, name) {
  const number = Number.parseInt(value, 10);

  if (!Number.isInteger(number) || number < 1 || number > 100) {
    throw new RangeError(`${name} must be between 1 and 100`);
  }

  return number;
}

export function setColumns(grid, columns) {
  const value = positiveInteger(columns, "columns");
  grid.dataset.columns = String(value);
  grid.style.setProperty("--rui-grid-columns", String(value));
}

export function setRows(stack, rows) {
  const value = positiveInteger(rows, "rows");
  stack.dataset.rows = String(value);
  stack.style.setProperty("--rui-stack-rows", String(value));
}

export function setColumn(element, column) {
  const value = positiveInteger(column, "column");
  element.dataset.column = String(value);
  element.style.setProperty("--rui-layout-column", String(value));
}

export function setRow(element, row) {
  const value = positiveInteger(row, "row");
  element.dataset.row = String(value);
  element.style.setProperty("--rui-layout-row", String(value));
}

export function show(element) {
  element.hidden = false;
}

export function hide(element) {
  element.hidden = true;
}

export function toggle(element, force) {
  element.hidden = force === undefined ? !element.hidden : !force;
  return !element.hidden;
}

export function collapseSidebar({
  grid,
  sidebar,
  workspace,
  expandedColumns = 5,
  sidebarColumns = 1,
} = {}) {
  if (!grid || !sidebar || !workspace) {
    throw new TypeError("grid, sidebar and workspace are required");
  }

  const isOpen = !sidebar.hidden;

  if (isOpen) {
    hide(sidebar);
    setColumn(workspace, expandedColumns);
  } else {
    show(sidebar);
    setColumn(sidebar, sidebarColumns);
    setColumn(workspace, expandedColumns - sidebarColumns);
  }

  return !sidebar.hidden;
}
