import { Button, Input } from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";

interface TableHelperProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onAddCompany?: () => void;
  onAddUser?:() => void;
}

const TableHelper: React.FC<TableHelperProps> = ({ searchText, setSearchText, onAddCompany, onAddUser }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="relative">
        <Search24Regular className="mr-2" />
        <Input
          placeholder={onAddCompany !== undefined?"Search companies...":"Search super users..."}
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
        onClick={onAddCompany !== undefined?onAddCompany:onAddUser}
      >
        {onAddCompany !== undefined?"Add Company":"Add Super User"}
      </Button>
    </div>
  );
};

export default TableHelper; 