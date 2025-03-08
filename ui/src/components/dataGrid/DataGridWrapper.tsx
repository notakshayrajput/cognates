import React, { useState, useEffect } from "react";
import "@glideapps/glide-data-grid/dist/index.css";
import DataEditor, { EditableGridCell, GridCellKind, GridColumn, Item, GridCell } from "@glideapps/glide-data-grid";
import { ICultureInfo } from "@/types";

interface GridRow {
  key: string;
  value: string | null;
  isGroup: boolean;
  collapsed?: boolean;
  depth: number;
}

interface DataGridWrapperProps {
  height?: string | number;
  data: Record<string, any>;
  onUpdate: (updatedData: Record<string, any>) => void;
  culture: ICultureInfo;
  defaultCulture: ICultureInfo;
}

const flattenData = (data: Record<string, any>, parentKey = "", depth = 0, collapsedState: Record<string, boolean> = {}): GridRow[] => {
  let result: GridRow[] = [];
  Object.entries(data).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      result.push({ key: fullKey, value: null, isGroup: true, collapsed: collapsedState[fullKey] ?? false, depth });
      result = result.concat(flattenData(value, fullKey, depth + 1, collapsedState));
    } else {
      result.push({ key: fullKey, value, isGroup: false, depth });
    }
  });
  return result;
};

const DataGridWrapper: React.FC<DataGridWrapperProps> = ({ height, data, onUpdate, culture, defaultCulture }) => {
  const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({});
  const [gridData, setGridData] = useState<GridRow[]>(flattenData(data, "", 0, collapsedState));
  const [visibleRows, setVisibleRows] = useState<GridRow[]>([]);

  useEffect(() => {
    setVisibleRows(getVisibleRows(gridData));
  }, [gridData, collapsedState]);

  const toggleGroup = (groupKey: string) => {
    setCollapsedState((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
    setGridData((prev) =>
      prev.map((row) =>
        row.key === groupKey ? { ...row, collapsed: !row.collapsed } : row
      )
    );
  };

  const getVisibleRows = (data: GridRow[]): GridRow[] => {
    const visible: GridRow[] = [];
    const collapsedGroups = new Set<string>();

    data.forEach((row) => {
      for (let key of collapsedGroups) {
        if (row.key.startsWith(key + ".")) {
          return;
        }
      }
      if (row.isGroup && row.collapsed) {
        collapsedGroups.add(row.key);
      }
      visible.push(row);
    });

    return visible;
  };

  const onCellEdited = (cell: Item, newValue: EditableGridCell) => {
    const [col, row] = cell;
    setGridData((prev) => {
      const updatedData = [...prev];
      if (col === 0 && culture.code === defaultCulture.code && !updatedData[row].isGroup) {
        updatedData[row].key = (newValue as { data: string }).data;
      } else if (col === 1) {
        updatedData[row].value = (newValue as { data: string }).data;
      }
      return updatedData;
    });
  };

  const columns: GridColumn[] = [
    { title: "Key", id: "key", width: 250 },
    { title: "Value", id: "value", width: 400 }
  ];

  return (
    <DataEditor
      height={height}
      columns={columns}
      getCellContent={(cell: Item): GridCell => {
        const [col, row] = cell;
        const rowData = visibleRows[row];

        if (!rowData) {
          return {
            kind: GridCellKind.Text,
            data: "",
            displayData: "",
            allowOverlay: true,
          };
        }

        if (col === 0) {
          const indent = "\u00A0".repeat(rowData.depth * 4);
          const displayKey = rowData.key.split(".").pop() || rowData.key; // Extract only the last part of the key
          return {
            kind: GridCellKind.Text,
            data: rowData.isGroup ? `${indent}${rowData.collapsed ? "▶" : "▼"} ${displayKey}` : `${indent}${displayKey}`,
            displayData: rowData.isGroup ? `${indent}${rowData.collapsed ? "▶" : "▼"} ${displayKey}` : `${indent}${displayKey}`,
            allowOverlay: culture.code === defaultCulture.code && !rowData.isGroup,
            copyData: displayKey,
          };
        }

        return {
          kind: GridCellKind.Text,
          data: rowData.value ?? "",
          displayData: rowData.value ?? "",
          allowOverlay: true,
          copyData: rowData.value ?? "",
        };
      }}
      onCellEdited={onCellEdited}
      rows={visibleRows.length}
      onCellClicked={(item, event) => {
        const [, row] = item;
        const rowData = visibleRows[row];
        if (rowData?.isGroup) {
          toggleGroup(rowData.key);
        }
      }}
    />
  );
};

export default DataGridWrapper;
