import { Button, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { Edit24Regular } from "@fluentui/react-icons";
import { useState } from "react";
import TableHelper from "./TableHelper";
import AddSuperUserModal from "./AddSuperUserModal";



interface SuperUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  company: string;
  status: string;
}

interface CompaniesSuperUsersTableProps {
  super_users: SuperUser[];
}

const CompaniesSuperUsersTable: React.FC<CompaniesSuperUsersTableProps> = ({ super_users }) => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleAddSuperUser = () => {
    setIsModalOpen(true);
  };

  const handleSaveSuperUser = (userData: {
    name: string;
    surname: string;
    email: string;
    company: string;
    status: string;
  }) => {
    // Handle saving the new super user
    console.log("New Super User:", userData);
  };

  // Filter super users based on search text across all fields
  const filteredSuperUsers = super_users.filter(user => {
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      user.name.toLowerCase().includes(lowerCaseSearchText) ||
      user.surname.toLowerCase().includes(lowerCaseSearchText) ||
      user.email.toLowerCase().includes(lowerCaseSearchText) ||
      user.company.toLowerCase().includes(lowerCaseSearchText) ||
      user.status.toLowerCase().includes(lowerCaseSearchText)
    );
  });

  // Sort super users based on the selected column and direction
  const sortedSuperUsers = [...filteredSuperUsers].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn as keyof SuperUser];
      const bValue = b[sortColumn as keyof SuperUser];

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
      <TableHelper 
        searchText={searchText} 
        setSearchText={setSearchText} 
        onAddUser={handleAddSuperUser}
        buttonText="Add Super User"
      />
      
      <Table className="w-full border border-gray-200">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("name")} className="cursor-pointer">
              Name {getSortIcon("name")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("surname")} className="cursor-pointer">
              Surname {getSortIcon("surname")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("email")} className="cursor-pointer">
              Email {getSortIcon("email")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("company")} className="cursor-pointer">
              Company {getSortIcon("company")}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("status")} className="cursor-pointer">
              Status {getSortIcon("status")}
            </TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSuperUsers.map((superuser) => (
            <TableRow key={superuser.id} className="hover:bg-gray-50">
              <TableCell>{superuser.id}</TableCell>
              <TableCell>{superuser.name}</TableCell>
              <TableCell>{superuser.surname}</TableCell>
              <TableCell>{superuser.email}</TableCell>
              <TableCell>{superuser.company}</TableCell>
              <TableCell>{superuser.status}</TableCell>
              <TableCell className="text-right">
                <Button icon={<Edit24Regular />} appearance="transparent" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddSuperUserModal
        isOpen={isModalOpen}
        onDismiss={() => setIsModalOpen(false)}
        onSave={handleSaveSuperUser}
      />
    </div>
  );
};

export default CompaniesSuperUsersTable; 