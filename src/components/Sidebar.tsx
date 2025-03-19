import { Button } from "@fluentui/react-components";
import { PanelLeftContract24Regular, Grid24Regular } from "@fluentui/react-icons";
import { Link } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <div 
      className={`sidebar h-screen transition-all duration-300 border-r border-gray-200 ${
        isCollapsed ? "w-[48px]" : "w-[250px]"
      }`}
      style={{ background: "#f3f2f1" }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center h-[53px] border-b border-gray-200 px-2">
        <Button 
          appearance="transparent" 
          icon={<PanelLeftContract24Regular />} 
          onClick={onToggle}
          aria-label="Toggle sidebar"
        />
      </div>
      
      {/* Sidebar Content */}
      <div className="flex flex-col h-[calc(100%-53px)]">
        <div className="p-2">
          {!isCollapsed ? (
            <Link to="/manage-companies/companies" className="flex items-center p-2 my-1 hover:bg-gray-200 rounded cursor-pointer">
              <Grid24Regular  className="mr-2" />
              <span>Manage Companies</span>
            </Link>
          ) : (
            <div className="flex justify-center p-2 my-1 hover:bg-gray-200 rounded cursor-pointer">
              <Grid24Regular />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 