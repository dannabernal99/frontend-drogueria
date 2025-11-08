import React, { useMemo, useState } from "react";
import "./Table.css";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

export type Action<T> = {
  label: string;
  onClick: (row: T) => void;
  className?: string;
  confirm?: { message?: string };
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  rowKey: keyof T | string;
  noDataMessage?: string;
  compact?: boolean;
  onRowClick?: (row: T) => void;
  rowsPerPageOptions?: number[];
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  actions = [],
  rowKey,
  noDataMessage = "No hay datos",
  compact = false,
  onRowClick,
  rowsPerPageOptions = [5, 10, 20],
}: Props<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const va = a[sortBy as keyof T];
      const vb = b[sortBy as keyof T];
      if (va == null && vb == null) return 0;
      if (va == null) return -1;
      if (vb == null) return 1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortBy, sortDir]);

  // --- Paginación ---
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function toggleSort(column: Column<T>) {
    const key = String(column.key);
    if (!column.sortable) return;
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir("asc");
    } else {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    }
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function handleRowsPerPageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }

  return (
    <div className={`az-table-wrapper ${compact ? "compact" : ""}`}>
      <div className="az-table-scroll">
        <table className="az-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={col.className || ""}>
                  <div
                    className={`az-th-content ${
                      col.sortable ? "sortable" : ""
                    }`}
                    onClick={() => toggleSort(col)}
                  >
                    <span>{col.label}</span>
                    {col.sortable && sortBy === String(col.key) && (
                      <span className="az-sort-indicator">
                        {sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {actions.length > 0 && <th className="actions-col">Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="no-data"
                >
                  {noDataMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={String(row[rowKey as keyof T] ?? idx)}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={col.className || ""}>
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="actions-cell">
                      <div className="actions-group">
                        {actions.map((act, i) => (
                          <button
                            key={i}
                            className={`action-btn ${act.className || ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (act.confirm) {
                                if (!confirm(act.confirm.message ?? "¿Seguro?"))
                                  return;
                              }
                              act.onClick(row);
                            }}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className="table-pagination">
          <div className="rows-per-page">
            <label>Filas por página:</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="rows-select"
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀ Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
