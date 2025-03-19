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
  createdOn: string;
  status: string;
}

interface CompaniesTableProps {
  companies: Company[];
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({ companies }) => {
    const [searchText, setSearchText] = useState("");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

    const handleAddCompany = () => {
      // Logic to add a company
      console.log("Add Company clicked");
    };

    // Filter companies based on search text across all fields
    const filteredCompanies = companies.filter(company => {
      const lowerCaseSearchText = searchText.toLowerCase();
      return (
        company.name.toLowerCase().includes(lowerCaseSearchText) ||
        company.createdOn.toLowerCase().includes(lowerCaseSearchText) ||
        company.status.toLowerCase().includes(lowerCaseSearchText)
      );
    });

    // Sort companies based on the selected column and direction
    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
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
        <TableHelper searchText={searchText} setSearchText={setSearchText} onAddCompany={handleAddCompany} />
        <Table className="w-full border border-gray-200">
        <TableHeader>
            <TableRow className="bg-gray-50">
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("name")} className="cursor-pointer">
                Company Name {getSortIcon("name")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("createdOn")} className="cursor-pointer">
                Created On {getSortIcon("createdOn")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("status")} className="cursor-pointer">
                Status {getSortIcon("status")}
            </TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedCompanies.map((company) => (
            <TableRow key={company.id} className="hover:bg-gray-50">
                <TableCell>{company.id}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.createdOn}</TableCell>
                <TableCell>{company.status}</TableCell>
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

export default CompaniesTable; 