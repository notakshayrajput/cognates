import React, { useState } from "react";
import "@glideapps/glide-data-grid/dist/index.css";
import DataEditor, { GridCellKind } from "@glideapps/glide-data-grid";

interface GridRow {
  key: string;
  value: string | null;
  isGroup: boolean;
  collapsed?: boolean;
}

interface DataGridWrapperProps {
  data: Record<string, any>;
  onUpdate: (updatedData: Record<string, any>) => void;
}

const flattenData = (data: Record<string, any>, parentKey = ""): GridRow[] => {
  let result: GridRow[] = [];
  Object.entries(data).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      result.push({ key: fullKey, value: null, isGroup: true, collapsed: false });
      result = result.concat(flattenData(value, fullKey));
    } else {
      result.push({ key: fullKey, value, isGroup: false });
    }
  });
  return result;
};

const DataGridWrapper: React.FC<DataGridWrapperProps> = ({ data, onUpdate }) => {
  const [gridData, setGridData] = useState<GridRow[]>(flattenData(data));

  const toggleGroup = (groupKey: string) => {
    setGridData((prev) =>
      prev.map((row) =>
        row.key === groupKey ? { ...row, collapsed: !row.collapsed } : row
      )
    );
  };

  const getVisibleRows = (): GridRow[] => {
    const visibleRows: GridRow[] = [];
    const collapsedGroups = new Set<string>();
    for (const row of gridData) {
      const parentGroup = row.key.split(".").slice(0, -1).join(".");
      if (collapsedGroups.has(parentGroup)) continue;
      if (row.isGroup && row.collapsed) collapsedGroups.add(row.key);
      visibleRows.push(row);
    }
    return visibleRows;
  };

  const onCellEdited = (cell: { row: number }, newValue: string) => {
    const { row } = cell;
    setGridData((prev) => {
      const updatedData = [...prev];
      updatedData[row].value = newValue;
      return updatedData;
    });
  };

  const columns = [{ title: "Key", id: "key" }, { title: "Value", id: "value" }];
  const rows = getVisibleRows();

  return (
    <DataEditor
      columns={columns}
      getCellContent={({ row , col }: { row: number; col: number }) => {
        const rowData = rows[row];
        if (col === 0) {
          return {
            kind: GridCellKind.Text,
            data: rowData.isGroup ? `▶ ${rowData.key}` : rowData.key,
          };
        }
        return {
          kind: GridCellKind.Text,
          data: rowData.value || "",
          allowOverlay: true,
        };
      }}
      onCellEdited={onCellEdited}
      rows={rows.length}
      onCellClicked={({ cell }: any) => {
        const [, row] = cell;
        const rowData = rows[row];
        if (rowData.isGroup) toggleGroup(rowData.key);
      }}
    />
  );
};

export default DataGridWrapper;