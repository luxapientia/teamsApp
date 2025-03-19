import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Input,
} from "@fluentui/react-components";
import { Search24Regular, Edit24Regular, Grid28Regular, ChevronDown16Filled, ChevronUp16Filled } from "@fluentui/react-icons";
import { useState } from "react";

// Sample data for companies
const sampleCompanies = [
  { id: 1, name: "NAMIFICA", createdOn: "Mar 18th 2022", status: "Active" },
  { id: 2, name: "Roads Authority", createdOn: "Oct 11th 2022", status: "Active" },
  { id: 3, name: "City of Windhoek", createdOn: "Feb 13th 2023", status: "Active" },
  { id: 4, name: "NAMIBIA", createdOn: "Mar 7th 2023", status: "Active" },
  { id: 5, name: "ABC Demo", createdOn: "Apr 9th 2023", status: "Active" },
];

type SortDirection = "asc" | "desc" | null;
type SortColumn = "id" | "name" | "createdOn" | "status" | null;

export function ManageCompanies() {
  const [companies] = useState(sampleCompanies);
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column is clicked again
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
      if (sortDirection === "desc") {
        setSortColumn(null);
      }
    } else {
      // Set new column and direction to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortedData = () => {
    if (!sortColumn || !sortDirection) {
      return companies.filter((company) => 
        company.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return [...companies]
      .filter((company) => 
        company.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else {
          return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
      });
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <ChevronUp16Filled /> : <ChevronDown16Filled />;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header section */}
      <div className="gradual-border p-2 bg-[#f3f2f1] flex items-center justify-start shadow-md">
          <Grid28Regular className="mr-2" />
          <span className="text-xl font-bold">Manage Companies</span>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-white">
        {/* Search Input */}
        <div className="flex items-center mb-4">
          <Search24Regular className="mr-2" />
          <div className="border-l h-6 mx-2" style={{ borderColor: '#ccc' }}></div> {/* Vertical line */}
          
          {/* Tabs */}
          <div className="flex space-x-2 min-w-[600px]">
            <button className="border rounded-full px-4 py-2 hover:bg-gray-200">
              Companies Licenses
            </button>
            <button className="border rounded-full px-4 py-2 hover:bg-gray-200">
              Companies Super Users
            </button>
            <button className="border rounded-full px-4 py-2 hover:bg-gray-200">
              Companies
            </button>
          </div>
        </div>
        <div className="container mx-auto max-w-screen-lg min-w-[600px]">
          {/* Table search and add button */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search24Regular className="mr-2" />
              <Input 
                placeholder="Search companies..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
            </div>
            <Button 
              appearance="primary" 
              style={{
                backgroundColor: "#158F8F", // Custom teal color
                color: "white",
                borderRadius: "9999px", // Fully rounded
                padding: "8px 16px",
                fontWeight: 500, // Medium font
              }}
            >
              Add Company
            </Button>
          </div>
          {/* Table */}
          <Table className="w-full border border-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHeaderCell 
                  className=" cursor-pointer w-1/12"
                  onClick={() => handleSort("id")}
                >
                  # {getSortIcon("id")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className=" cursor-pointer w-6/12"
                  onClick={() => handleSort("name")}
                >
                  Company Name {getSortIcon("name")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className=" cursor-pointer w-3/12"
                  onClick={() => handleSort("createdOn")}
                >
                  Created On {getSortIcon("createdOn")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className=" cursor-pointer w-1/12"
                  onClick={() => handleSort("status")}
                >
                  Status {getSortIcon("status")}
                </TableHeaderCell>
                <TableHeaderCell className=""></TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedData().map((company) => (
                <TableRow key={company.id} className="hover:bg-gray-50">
                  <TableCell className="w-1/12">{company.id}</TableCell>
                  <TableCell className="w-6/12">{company.name}</TableCell>
                  <TableCell className="w-3/12">{company.createdOn}</TableCell>
                  <TableCell className="w-1/12">{company.status}</TableCell>
                  <TableCell className="text-right w-1/12">
                    <Button icon={<Edit24Regular />} appearance="transparent" />
                  </TableCell>
                </TableRow>
              ))}
              {getSortedData().length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 ">
                    No companies found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 