import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Table.css";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  exportLabel?: string; // Label personalizado para Excel
  exportFormat?: (value: unknown) => string | number; // Formato para Excel
};

export type Action<T> = {
  label: string;
  onClick: (row: T) => void;
  className?: string;
  confirm?: { message?: string };
};

export type TableHeader = {
  title: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
  showExportButton?: boolean;
  exportFileName?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  rowKey: keyof T | string;
  noDataMessage?: string;
  compact?: boolean;
  onRowClick?: (row: T) => void;
  
  header?: TableHeader;
  
  enablePagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  actions = [],
  rowKey,
  noDataMessage = "No hay datos",
  compact = false,
  onRowClick,
  header,
  enablePagination = false,
  rowsPerPageOptions = [5, 10, 20, 50],
  defaultRowsPerPage = 10,
}: Props<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

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

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const displayData = enablePagination
    ? sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : sortedData;

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

  function handleExport() {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const exportData = data.map((row) => {
      const exportRow: Record<string, string | number> = {};
      
      columns.forEach((col) => {
        const label = col.exportLabel || col.label;
        const value = row[col.key as keyof T];
        
        exportRow[label] = col.exportFormat
          ? col.exportFormat(value)
          : String(value ?? "");
      });
      
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    const maxWidth = 50;
    const colWidths = columns.map((col) => {
      const label = col.exportLabel || col.label;
      const maxLength = Math.max(
        label.length,
        ...exportData.map((row) => String(row[label] ?? "").length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = header?.exportFileName || "export";
    saveAs(blob, `${fileName}_${timestamp}.xlsx`);
  }

  return (
    <div className={`az-table-wrapper ${compact ? "compact" : ""}`}>
      {header && (
        <div className="table-header">
          <h2 className="table-title">{header.title}</h2>
          <div className="table-header-actions">
            {header.showExportButton && (
              <button
                onClick={handleExport}
                className="table-btn table-btn-secondary"
                disabled={data.length === 0}
              >
                Exportar Excel
              </button>
            )}
            {header.showCreateButton && header.onCreateClick && (
              <button
                onClick={header.onCreateClick}
                className="table-btn table-btn-primary"
              >
                {header.createButtonText || "+ Crear"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="az-table-scroll">
        <table className="az-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={col.className || ""}>
                  <div
                    className={`az-th-content ${col.sortable ? "sortable" : ""}`}
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
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="no-data"
                >
                  {noDataMessage}
                </td>
              </tr>
            ) : (
              displayData.map((row, idx) => (
                <tr
                  key={String(row[rowKey as keyof T] ?? idx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? "clickable-row" : ""}
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

      {enablePagination && sortedData.length > 0 && (
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

          <div className="pagination-info">
            Mostrando {(currentPage - 1) * rowsPerPage + 1} -{" "}
            {Math.min(currentPage * rowsPerPage, sortedData.length)} de{" "}
            {sortedData.length} registros
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ⏮ Primera
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ◀ Anterior
            </button>
            <span className="page-indicator">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Siguiente ▶
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Última ⏭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}