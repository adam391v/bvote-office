import { ReactNode } from "react";

// ==================== TYPES ====================
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyIcon?: ReactNode;
  emptyMessage?: string;
}

// Mapping align prop sang Tailwind class
const alignClass: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// ==================== SERVER COMPONENT ====================
export default function DataTable<T>({
  columns,
  data,
  emptyIcon,
  emptyMessage = "Không có dữ liệu",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="empty-state mt-8">
        {emptyIcon}
        <p className="mt-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={alignClass[col.align || "left"]}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key} className={alignClass[col.align || "left"]}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
