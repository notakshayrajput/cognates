import { useState } from 'react'
import "@glideapps/glide-data-grid/dist/index.css";
import LocalizeLayout from '../../layout/localize-layout/LocalizeLayout'
import DataGridWrapper from '@/components/dataGrid/DataGridWrapper'
import { DataEditor, GridCell, GridCellKind, GridColumn, Item } from '@glideapps/glide-data-grid'
import React from 'react'

interface DataRow {
    name: string;
    company: string;
    email: string;
    phone: string;
}
export default function Localize() {
    const data = [
        {
          "name": "Hines Fowler",
          "company": "BUZZNESS",
          "email": "hinesfowler@buzzness.com",
          "phone": "+1 (869) 405-3127"
        },
        {
          "name": "Hines Fowler",
          "company": "BUZZNESS",
          "email": "hinesfowler@buzzness.com",
          "phone": "+1 (869) 405-3127"
        },
        {
          "name": "Hines Fowler",
          "company": "BUZZNESS",
          "email": "hinesfowler@buzzness.com",
          "phone": "+1 (869) 405-3127"
        },
        {
          "name": "Hines Fowler",
          "company": "BUZZNESS",
          "email": "hinesfowler@buzzness.com",
          "phone": "+1 (869) 405-3127"
        },
        {
          "name": "Hines Fowler",
          "company": "BUZZNESS",
          "email": "hinesfowler@buzzness.com",
          "phone": "+1 (869) 405-3127"
        }
    ]
    const columns: GridColumn[] = [
        {
            title: "Name",
            id: "name"
        },
        {
            title: "Company",
            id: "company"
        },
        {
            title: "Email",
            id: "email"
        },
        {
            title: "Phone",
            id: "phone"
        }
    ]
    const getContent = React.useCallback((cell: Item): GridCell => {
        const [col, row] = cell;
        const dataRow = data[row];
        // dumb but simple way to do this
        const indexes: (keyof DataRow)[] = ["name", "company", "email", "phone"];
        const d = dataRow[indexes[col]]
        return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            displayData: d,
            data: d,
        };
    }, []);
  return (
      <LocalizeLayout>
          <div>
  <DataEditor getCellContent={getContent} columns={columns} rows={data.length} />
</div>

      </LocalizeLayout>
  );
}

