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

  useEffect(() => {
    setGridData(flattenData(data, "", 0, collapsedState));
  }, [data, collapsedState]);

  const toggleGroup = (groupKey: string) => {
    setCollapsedState((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const getVisibleRows = (): GridRow[] => {
    const visible: GridRow[] = [];
    const collapsedGroups = new Set<string>();

    gridData.forEach((row) => {
      for (let key of collapsedGroups) {
        if (row.key.startsWith(key + ".")) return;
      }
      if (row.isGroup && row.collapsed) {
        collapsedGroups.add(row.key);
      }
      visible.push(row);
    });

    return visible;
  };
  const updateNestedKey = (obj: Record<string, any>, oldKeyPath: string, newKeyPath: string) => {
    const keys = oldKeyPath.split(".");
    const parentKeys = keys.slice(0, -1);
    const newKey = newKeyPath.split(".").pop()!;
  
    let current = obj;
    for (let i = 0; i < parentKeys.length; i++) {
      if (!current[parentKeys[i]]) return obj;
      current = current[parentKeys[i]];
    }
  
    // Create a new ordered object
    const newObj: Record<string, any> = {};
    Object.keys(current).forEach((key) => {
      if (key === keys[keys.length - 1]) {
        newObj[newKey] = current[key]; // Move the renamed key in place
      } else {
        newObj[key] = current[key]; // Keep everything else in order
      }
    });
  
    // Apply the updated object
    parentKeys.reduce((acc, key, index) => {
      if (index === parentKeys.length - 1) {
        acc[key] = newObj;
      }
      return acc[key];
    }, obj);
  
    return { ...obj }; // Return a new object for reactivity
  };
  
  
  const updateNestedValue = (obj: Record<string, any>, keyPath: string, newValue: string | null) => {
    const keys = keyPath.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) return obj;
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = newValue;
    return { ...obj }; // Return new object for reactivity
  };
  
  const onCellEdited = (cell: Item, newValue: EditableGridCell) => {
    const [col, row] = cell;
  
    setGridData((prev) => {
      const updatedData = [...prev];
      const rowData = updatedData[row];
  
      if (!rowData) return prev;
  
      if (col === 0 && culture.code === defaultCulture.code && !rowData.isGroup) {
        // Editing the Key
        const newKeySegment = (newValue as { data: string }).data.trim();
        const keyParts = rowData.key.split(".");
        keyParts[keyParts.length - 1] = newKeySegment;
        const newKey = keyParts.join(".");
  
        // Update the key in the existing row
        updatedData[row] = { ...rowData, key: newKey };
  
        // Update the nested object & keep previous state
        const newStructuredData = updateNestedKey(data, rowData.key, newKey);
        onUpdate(newStructuredData);
  
        return updatedData; // Instead of regenerating `gridData`, update in-place
      }
  
      if (col === 1) {
        // Editing the Value
        updatedData[row] = { ...rowData, value: (newValue as { data: string }).data };
  
        // Update the original data structure
        const newStructuredData = updateNestedValue(data, rowData.key, updatedData[row].value);
        onUpdate(newStructuredData);
  
        return updatedData; // Keep current state to prevent re-renders breaking edits
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
        const rowData = getVisibleRows()[row];

        if (!rowData) {
          return {
            kind: GridCellKind.Text,
            data: "",
            displayData: "",
            allowOverlay: true,
          };
        }

        if (col === 0) {
          const indent = " ".repeat(rowData.depth * 4); // Keeps indentation static
          const displayKey = rowData.key.split(".").pop() || rowData.key;

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
      rows={getVisibleRows().length}
      onCellClicked={(item) => {
        const [, row] = item;
        const rowData = getVisibleRows()[row];
        if (rowData?.isGroup) {
          toggleGroup(rowData.key);
        }
      }}
    />
  );
};

export default DataGridWrapper;
