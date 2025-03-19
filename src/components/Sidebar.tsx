import { Button } from "@fluentui/react-components";
import { Navigation24Regular, AppsListDetail24Regular } from "@fluentui/react-icons";

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
          icon={<Navigation24Regular />} 
          onClick={onToggle}
          aria-label="Toggle sidebar"
        />
      </div>
      
      {/* Sidebar Content */}
      <div className="flex flex-col h-[calc(100%-53px)]">
        <div className="p-2">
          {!isCollapsed ? (
            <div className="flex items-center p-2 my-1 hover:bg-gray-200 rounded cursor-pointer">
              <AppsListDetail24Regular className="mr-2" />
              <span>Manage Companies</span>
            </div>
          ) : (
            <div className="flex justify-center p-2 my-1 hover:bg-gray-200 rounded cursor-pointer">
              <AppsListDetail24Regular />
            </div>
          )}
        </div>
        
        {/* Footer section at bottom of sidebar */}
        <div className="mt-auto border-t border-gray-200 p-2">
          {!isCollapsed && (
            <div className="px-2 py-1 text-sm">
              <span>Manage Companies</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 