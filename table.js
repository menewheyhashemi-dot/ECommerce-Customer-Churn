// ---------- Get the page elements we need ----------
const tableContainer = document.getElementById("tableContainer");
const searchBox = document.getElementById("searchBox");
const rowCount = document.getElementById("rowCount");

// ---------- Column names are taken from the keys of the first object ----------
const columns = data.length > 0 ? Object.keys(data[0]) : [];

// ---------- Build the table for a given list of rows ----------
function renderTable(rows) {
  // Remove the old table before drawing a new one
  tableContainer.innerHTML = "";

  // Show how many rows are visible
  rowCount.textContent = "Showing " + rows.length + " of " + data.length + " customers";

  // If nothing matches, show a friendly message
  if (rows.length === 0) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.textContent = "No matching customers found.";
    tableContainer.appendChild(message);
    return;
  }

  const table = document.createElement("table");

  // Header row: one <th> per column
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach(function (column) {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body rows: one <tr> per customer, one <td> per column
  const tbody = document.createElement("tbody");
  rows.forEach(function (row) {
    const tr = document.createElement("tr");
    columns.forEach(function (column) {
      const td = document.createElement("td");
      td.textContent = row[column]; // textContent is safe (no HTML injection)
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableContainer.appendChild(table);
}

// ---------- Filter rows using the text typed in the search box ----------
function filterRows() {
  const query = searchBox.value.trim().toLowerCase();

  // Empty search: show everything
  if (query === "") {
    renderTable(data);
    return;
  }

  // Keep a row if ANY of its values contains the search text
  const filtered = data.filter(function (row) {
    return columns.some(function (column) {
      return String(row[column]).toLowerCase().includes(query);
    });
  });

  renderTable(filtered);
}

// ---------- Start: draw the full table, then filter live on every keystroke ----------
renderTable(data);
searchBox.addEventListener("input", filterRows);
