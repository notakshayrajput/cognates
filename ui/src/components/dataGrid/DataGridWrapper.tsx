import React, { useState, useEffect } from 'react'
import '@glideapps/glide-data-grid/dist/index.css'
import DataEditor, {
    EditableGridCell,
    GridCellKind,
    GridColumn,
    Item,
    GridCell,
} from '@glideapps/glide-data-grid'
import { ICultureInfo } from '@/types'

interface GridRow {
    key: string
    value: string | null
    isGroup: boolean
    collapsed?: boolean
    depth: number
}

interface DataGridWrapperProps {
    height?: string | number
    data: Record<string, any>
    onUpdate: (updatedData: Record<string, any>,defaultData: Record<string, any>) => void
    culture: ICultureInfo
    defaultCulture: ICultureInfo
    defaultCultureData: Record<string, any>
    theme: any
}

const flattenData = (
    defaultData: Record<string, any>,
    actualData: Record<string, any>,
    parentKey = '',
    depth = 0,
    collapsedState: Record<string, boolean> = {},
): GridRow[] => {
    let result: GridRow[] = []

    Object.keys(defaultData).forEach((key) => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key
        const defaultValue = defaultData[key]
        const actualValue = actualData?.[key] ?? null

        if (typeof defaultValue === 'object' && defaultValue !== null) {
            result.push({
                key: fullKey,
                value: null, // Groups have no values
                isGroup: true,
                collapsed: collapsedState[fullKey] ?? false,
                depth,
            })

            result = result.concat(
                flattenData(
                    defaultValue,
                    actualValue ?? {},
                    fullKey,
                    depth + 1,
                    collapsedState,
                ),
            )
        } else {
            result.push({
                key: fullKey,
                value: actualValue, // Use actual value if exists, else empty
                isGroup: false,
                depth,
            })
        }
    })

    return result
}

const DataGridWrapper: React.FC<DataGridWrapperProps> = ({
    height,
    data,
    onUpdate,
    culture,
    defaultCulture,
    theme = {},
    defaultCultureData,
}) => {
    const [collapsedState, setCollapsedState] = useState<
        Record<string, boolean>
    >({})
    const [gridData, setGridData] = useState<GridRow[]>(
        flattenData(defaultCultureData, data, '', 0, collapsedState),
    )

    useEffect(() => {
      setGridData((prevGridData) => {
          const newGridData = flattenData(defaultCultureData, data, '', 0, collapsedState);
  
          // Merge previous edits into the new grid
          return newGridData.map((newRow) => {
              const existingRow = prevGridData.find((r) => r.key === newRow.key);
              return existingRow && !newRow.isGroup
                  ? { ...newRow, value: existingRow.value } // Preserve previous edits
                  : newRow;
          });
      });
  }, [data, collapsedState]);
  
    const toggleGroup = (groupKey: string) => {
        setCollapsedState((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }))
    }

    const getVisibleRows = (): GridRow[] => {
        const visible: GridRow[] = []
        const collapsedGroups = new Set<string>()

        gridData.forEach((row) => {
            for (let key of collapsedGroups) {
                if (row.key.startsWith(key + '.')) return
            }
            if (row.isGroup && row.collapsed) {
                collapsedGroups.add(row.key)
            }
            visible.push(row)
        })

        return visible
    }
    const updateNestedKey = (
        obj: Record<string, any>,
        oldKeyPath: string,
        newKeyPath: string,
    ) => {
        const keys = oldKeyPath.split('.')
        const parentKeys = keys.slice(0, -1)
        const newKey = newKeyPath.split('.').pop()!

        let current = obj
        for (let i = 0; i < parentKeys.length; i++) {
            if (!current[parentKeys[i]]) return obj
            current = current[parentKeys[i]]
        }

        // Create a new ordered object
        const newObj: Record<string, any> = {}
        Object.keys(current).forEach((key) => {
            if (key === keys[keys.length - 1]) {
                newObj[newKey] = current[key] // Move the renamed key in place
            } else {
                newObj[key] = current[key] // Keep everything else in order
            }
        })

        // Apply the updated object
        parentKeys.reduce((acc, key, index) => {
            if (index === parentKeys.length - 1) {
                acc[key] = newObj
            }
            return acc[key]
        }, obj)

        return { ...obj } // Return a new object for reactivity
    }

    const updateNestedValue = (
      obj: Record<string, any>,
      keyPath: string,
      newValue: string | null
  ) => {
      const keys = keyPath.split('.');
      const newObj = { ...obj }; // Ensure immutability
      let current = newObj;
  
      for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {}; // Ensure path exists
          current = { ...current[keys[i]] }; // Spread to avoid mutation
      }
  
      current[keys[keys.length - 1]] = newValue;
      return newObj; // Return new reference
  };
  
    const columns: GridColumn[] = [
        { title: 'Key', id: 'key', width: 250 },
        { title: 'Value', id: 'value', width: 400 },
    ]
    const getNestedValue = (obj: Record<string, any>, path: string): any => {
      return path.split('.').reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : undefined, obj);
  };const addMissingNestedKey = (obj: any, keyPath: string) => {
    const keys = keyPath.split('.');
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (!current[key]) {
            current[key] = i === keys.length - 1 ? "" : {}; // Create an empty object or string
        }

        current = current[key];
    }

    return obj;
};

    return (
        <DataEditor
            height={height}
            columns={columns}
            getCellContent={(cell: Item): GridCell => {
                const [col, row] = cell
                const rowData = getVisibleRows()[row]

                if (!rowData) {
                    return {
                        kind: GridCellKind.Text,
                        data: '',
                        displayData: '',
                        allowOverlay: false,
                    }
                }

                if (col === 0) {
                    // Display key name without full path
                    const displayKey =
                        rowData.key.split('.').pop() || rowData.key
                    const prefix = rowData.isGroup
                        ? rowData.collapsed
                            ? '▶ '
                            : '▼ '
                        : '   '

                    return {
                        kind: GridCellKind.Text,
                        data: `${prefix}${displayKey}`,
                        displayData: `${prefix}${displayKey}`,
                        allowOverlay:
                            !rowData.isGroup &&
                            culture.code === defaultCulture.code, // Editable only in default culture
                        copyData: displayKey,
                        themeOverride:{
                          cellHorizontalPadding: 10 + rowData.depth * 15, //Add padding based on depth
                        }
                        
                        
                    }
                }

                if (col === 1) {
                    if (rowData.isGroup) {
                        return {
                            kind: GridCellKind.Text,
                            data: '',
                            displayData: '', // Empty value for groups
                            allowOverlay: false,
                            copyData: '',
                        }
                    }
                    const defaultValue = getNestedValue(defaultCultureData, rowData.key) ?? '' // Get default value if missing
                    const displayValue = rowData.value ?? defaultValue
                    const isUsingDefault = rowData.value === null

                    return {
                        kind: GridCellKind.Text,
                        data: rowData.value ?? "", //dont set value just display default value
                        style:isUsingDefault?"faded":"normal",
                        displayData: isUsingDefault? `${defaultValue}` : displayValue, // Italicize using Markdown-style `*`
                        allowOverlay: !rowData.isGroup, // Prevent editing in groups
                        copyData: displayValue,
                        allowWrapping:true
                    }
                }

                return {
                    kind: GridCellKind.Text,
                    data: '',
                    displayData: '',
                    allowOverlay: false,
                }
            }}
            theme={theme}
            rowMarkers="none"
            headerHeight={32}
            rowHeight={28}
            onCellEdited={(cell: Item, newValue: EditableGridCell) => {
              const [col, row] = cell;
              const rowData = getVisibleRows()[row];
          
              if (!rowData) return;
          
              setGridData((prev) => {
                  const updatedData = [...prev];
          
                  let newStructuredData = { ...data }; // Ensure we're working with a fresh copy
          
                  if (col === 0 && culture.code === defaultCulture.code && !rowData.isGroup) {
                      // Editing the Key
                      const newKeySegment = (newValue as { data: string }).data.trim();
                      const keyParts = rowData.key.split('.');
                      keyParts[keyParts.length - 1] = newKeySegment;
                      const newKey = keyParts.join('.');
                      let newStructuredData = updateNestedKey(
                        data,
                        rowData.key,
                        newKey,
                    );
                    
                    let newDefaultData = defaultCultureData;
                    if (culture.code === defaultCulture.code) {
                        newDefaultData = updateNestedKey(
                            defaultCultureData,
                            rowData.key,
                            newKey
                        );
                    }
                      updatedData[row] = { ...rowData, key: newKey };
                      onUpdate(newStructuredData, newDefaultData);
                  }
          
                  if (col === 1 && !rowData.isGroup) {
                      // Editing the Value
                      const newValueText = (newValue as { data: string }).data;
          
                      newStructuredData = addMissingNestedKey(newStructuredData, rowData.key);
                      newStructuredData = updateNestedValue(newStructuredData, rowData.key, newValueText);
          
                      updatedData[row] = {
                          ...rowData,
                          value: newValueText,
                      };
                      onUpdate(newStructuredData,defaultCultureData); // Update source data BEFORE calling setGridData
                  }
          
                  return updatedData;
              });
          }}
          
            rows={getVisibleRows().length}
            onCellClicked={(item) => {
                const [, row] = item
                const rowData = getVisibleRows()[row]
                if (rowData?.isGroup) {
                    toggleGroup(rowData.key)
                }
            }}
        />
    )
}

export default DataGridWrapper
