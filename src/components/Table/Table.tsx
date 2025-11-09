import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Table.css";
import Modal from "../Modal/Modal";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  exportLabel?: string;
  exportFormat?: (value: unknown) => string | number;
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
  enableSearch?: boolean;
  enableColumnFilters?: boolean;
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
  enableSearch = false,
  enableColumnFilters = false,
}: Props<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredData = useMemo(() => {
    let result = [...sortedData];

    if (enableSearch && searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key as keyof T];
          return val?.toString().toLowerCase().includes(lowerTerm);
        })
      );
    }

    if (enableColumnFilters) {
      result = result.filter((row) =>
        Object.entries(columnFilters).every(([key, filterValue]) => {
          if (!filterValue) return true;
          const cellValue = row[key as keyof T];
          return String(cellValue ?? "")
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        })
      );
    }

    return result;
  }, [sortedData, searchTerm, columnFilters, columns, enableSearch, enableColumnFilters]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayData = enablePagination
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;

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

  function handleColumnFilterChange(key: string, value: string) {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }

  function handleExport() {
    if (!filteredData || filteredData.length === 0) {
      setIsModalOpen(true);
      return;
    }

    const exportData = filteredData.map((row) => {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos filtrados");

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

      {enableSearch && (
        <div className="table-search-bar">
          <input
            type="text"
            value={searchTerm}
            placeholder="Buscar en todos los campos..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="table-search-input"
          />
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
            {enableColumnFilters && (
              <tr className="column-filters-row">
                {columns.map((col) => (
                  <th key={String(col.key)}>
                    <input
                      type="text"
                      className="column-filter-input"
                      placeholder={`Filtrar ${col.label.toLowerCase()}`}
                      value={columnFilters[col.key as string] || ""}
                      onChange={(e) =>
                        handleColumnFilterChange(String(col.key), e.target.value)
                      }
                    />
                  </th>
                ))}
                {actions.length > 0 && <th></th>}
              </tr>
            )}
          </thead>

          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="no-data">
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
                    <td key={String(col.key)}>{col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}</td>
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
                                if (!confirm(act.confirm.message ?? "¿Seguro?")) return;
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

      {enablePagination && filteredData.length > 0 && (
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
            {Math.min(currentPage * rowsPerPage, filteredData.length)} de{" "}
            {filteredData.length} registros
          </div>

          <div className="pagination-controls">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
              Primera
            </button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Siguiente
            </button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
              Última
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Aviso"
        message="No hay datos para exportar."
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}