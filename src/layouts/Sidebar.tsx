import React from 'react';
import { 
  PeopleTeamRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  GridRegular
} from '@fluentui/react-icons';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
}) => {
  const menuItems = [
    { id: 'manage-companies', label: 'Manage Companies', icon: <GridRegular /> },
    { id: 'annual-corporate-scorecards', label: 'Annual Corporate Scorecards', icon: <PeopleTeamRegular /> },
    { id: 'admin-panel', label: 'Admin Panel', icon: <PeopleTeamRegular /> },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-white shadow-ms z-10 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {isOpen && <h1 className="text-ms-blue font-semibold">Teams Scorecards</h1>}
        <button
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={onToggle}
        >
          {isOpen ? <ChevronLeftRegular /> : <ChevronRightRegular />}
        </button>
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-ms-blue bg-opacity-10 text-ms-blue'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <span className="inline-flex items-center justify-center w-6 h-6">
                  {item.icon}
                </span>
                {isOpen && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 