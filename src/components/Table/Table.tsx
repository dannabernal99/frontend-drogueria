import React, { useMemo, useState } from "react";
import './Table.css';

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
};

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  actions = [],
  rowKey,
  noDataMessage = 'No hay datos',
  compact = false,
  onRowClick,
}: Props<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const va = a[sortBy as keyof T];
      const vb = b[sortBy as keyof T];
      if (va == null && vb == null) return 0;
      if (va == null) return -1;
      if (vb == null) return 1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortDir === 'asc' ? -1 : 1;
      if (sa > sb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortBy, sortDir]);

  function toggleSort(column: Column<T>) {
    const key = String(column.key);
    if (!column.sortable) return;
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir('asc');
    } else {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    }
  }

  return (
    <div className={`az-table-wrapper ${compact ? 'compact' : ''}`}>
      <div className="az-table-scroll">
        <table className="az-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className={col.className || ''}>
                  <div className={`az-th-content ${col.sortable ? 'sortable' : ''}`} onClick={() => toggleSort(col)}>
                    <span>{col.label}</span>
                    {col.sortable && sortBy === String(col.key) && (
                      <span className="az-sort-indicator">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}

              {actions.length > 0 && <th className="actions-col">Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="no-data">
                  {noDataMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={String(row[rowKey as keyof T] ?? idx)} onClick={() => onRowClick && onRowClick(row)}>
                  {columns.map(col => (
                    <td key={String(col.key)} className={col.className || ''}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="actions-cell">
                      <div className="actions-group">
                        {actions.map((act, i) => (
                          <button
                            key={i}
                            className={`action-btn ${act.className || ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (act.confirm) {
                                if (!confirm(act.confirm.message ?? '¿Estás segura?')) return;
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
    </div>
  );
}