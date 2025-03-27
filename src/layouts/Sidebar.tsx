import React from 'react';
import { 
  PeopleTeamRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  GridRegular
} from '@fluentui/react-icons';
import { PageProps } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePageTitle: string;
  onPageChange: (title: string) => void;
  pagePropsList: PageProps[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activePageTitle,
  onPageChange,
  pagePropsList
}) => {

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-white shadow-ms z-10 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-80' : 'w-16'
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
          {pagePropsList.map((pageProps, index) => (
            <li key={index}>
              <button
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  activePageTitle === pageProps.title
                    ? 'bg-ms-blue bg-opacity-10 text-ms-blue'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onPageChange(pageProps.title)}
              >
                <span className="inline-flex items-center justify-center w-6 h-6">
                  {pageProps.icon}
                </span>
                {isOpen && <span className="ml-3">{pageProps.title}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 