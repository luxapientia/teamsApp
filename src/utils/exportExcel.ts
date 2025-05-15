import * as XLSX from 'xlsx';
import React from 'react';

export function exportExcel(table: HTMLTableElement | null, fileName: string) {
  if (!table) return;
  const ws = XLSX.utils.table_to_sheet(table);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
} 