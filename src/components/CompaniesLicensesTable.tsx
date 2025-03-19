import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import { Edit24Regular } from "@fluentui/react-icons";
import { useState } from "react";
import TableHelper from "./TableHelper";

interface Company {
  id: number;
  name: string;
  license_key: string;
  license_start_date: string;
  license_end_date: string;
  status: string;
}

interface CompaniesLicensesTableProps {
  companies_licenses: Company[];
}

const CompaniesLicensesTable: React.FC<CompaniesLicensesTableProps> = ({ companies_licenses }) => {
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Filter companies based on search text across all fields
  const filteredLicenses = companies_licenses.filter(license => {
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      license.name.toLowerCase().includes(lowerCaseSearchText) ||
      license.license_key.toLowerCase().includes(lowerCaseSearchText) ||
      license.license_start_date.toLowerCase().includes(lowerCaseSearchText) ||
      license.license_end_date.toLowerCase().includes(lowerCaseSearchText) ||
      license.status.toLowerCase().includes(lowerCaseSearchText)
    );
  });

  // Sort licenses based on the selected column and direction
  const sortedLicenses = [...filteredLicenses].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn as keyof Company];
      const bValue = b[sortColumn as keyof Company];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? "↑" : "↓"; // You can replace with icons
  };

  return (
    <div>
      <TableHelper searchText={searchText} setSearchText={setSearchText} onAddUser={() => console.log("Add License clicked")} />
      <Table className="w-full border border-gray-200">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("name")} className="cursor-pointer">
              Company Name {getSortIcon("name")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("license_key")} className="cursor-pointer">
              License Key {getSortIcon("license_key")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("license_start_date")} className="cursor-pointer">
              License Start Date {getSortIcon("license_start_date")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("license_end_date")} className="cursor-pointer">
              License End Date {getSortIcon("license_end_date")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("status")} className="cursor-pointer">
              Status {getSortIcon("status")}
            </TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLicenses.map((license) => (
            <TableRow key={license.id} className="hover:bg-gray-50">
              <TableCell>{license.id}</TableCell>
              <TableCell>{license.name}</TableCell>
              <TableCell>{license.license_key}</TableCell>
              <TableCell>{license.license_start_date}</TableCell>
              <TableCell>{license.license_end_date}</TableCell>
              <TableCell>{license.status}</TableCell>
              <TableCell className="text-right">
                <Button icon={<Edit24Regular />} appearance="transparent" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesLicensesTable; 