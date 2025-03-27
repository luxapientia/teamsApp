import React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Add24Regular } from '@fluentui/react-icons';

const Teams: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex justify-end items-center mb-4">
        <DefaultButton
          className="border border-black text-black flex items-center px-3 py-1 rounded"
        >
          <Add24Regular className="mr-2 w-4 h-4" />
          New
        </DefaultButton>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="py-2 px-4 border-b-2 border-gray-200 text-right text-sm font-semibold text-gray-700">
                {/* Empty header for Action column */}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                Human Capital
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm text-right">
                <PrimaryButton
                  text="View"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 text-sm rounded-full"
                  style={{ border: 'none' }}
                />
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teams;