import { useContext } from "react";
import { TeamsFxContext } from "./Context";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
  TabList,
  Tab as FluentTab,
  TabValue,
  Input,
} from "@fluentui/react-components";
import { Search24Regular, Add24Regular, Edit24Regular } from "@fluentui/react-icons";
import { useState } from "react";

// Sample data for companies
const sampleCompanies = [
  { id: 1, name: "NAMIFICA", createdOn: "Mar 18th 2022", status: "Active" },
  { id: 2, name: "Roads Authority", createdOn: "Oct 11th 2022", status: "Active" },
  { id: 3, name: "City of Windhoek", createdOn: "Feb 13th 2023", status: "Active" },
  { id: 4, name: "NAMIBIA", createdOn: "Mar 7th 2023", status: "Active" },
  { id: 5, name: "ABC Demo", createdOn: "Apr 9th 2023", status: "Active" },
];

export function ManageCompanies() {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const [selectedTab, setSelectedTab] = useState<TabValue>("companies");
  const [companies] = useState(sampleCompanies);
  const [searchText, setSearchText] = useState("");

  return (
    <div className="flex flex-col h-screen">
      {/* Header section */}
      <div className="border-b border-gray-200 p-2 bg-[#f3f2f1]">
        <Title1 className="px-4">Manage Companies</Title1>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-white">
        {/* Tabs */}
        <div className="mb-6">
          <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value)}>
            <FluentTab id="licenses" value="licenses">
              Companies Licenses
            </FluentTab>
            <FluentTab id="superUsers" value="superUsers">
              Companies Super Users
            </FluentTab>
            <FluentTab id="companies" value="companies">
              Companies
            </FluentTab>
          </TabList>
        </div>

        {/* Search and Add button row */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-1/3">
            <Input 
              contentBefore={<Search24Regular />}
              placeholder="Search this table"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full"
            />
          </div>
          <Button appearance="primary" icon={<Add24Regular />}>
            Add Company
          </Button>
        </div>

        {/* Table */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>Company Name</TableHeaderCell>
              <TableHeaderCell>Created On</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies
              .filter((company) => 
                company.name.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.id}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.createdOn}</TableCell>
                  <TableCell>{company.status}</TableCell>
                  <TableCell>
                    <Button icon={<Edit24Regular />} appearance="transparent" />
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
      
      {/* Footer with second sidebar if needed */}
      <div className="border-t border-gray-200 p-2 bg-[#f3f2f1] flex">
        <div className="font-bold px-4">Manage Companies</div>
      </div>
    </div>
  );
} 