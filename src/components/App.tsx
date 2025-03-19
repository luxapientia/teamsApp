// App component with Azure AD SSO and redirection
import {
  FluentProvider,
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme,
  Spinner,
  tokens,
} from "@fluentui/react-components";
import { HashRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "./Context";
import { ManageCompanies } from "./ManageCompanies";
import { Sidebar } from "./Sidebar";
import config from "./lib/config";
import { useState } from "react";

export default function App() {
  const { loading, theme, themeString, teamsUserCredential, error } = useTeamsUserCredential({
    initiateLoginEndpoint: config.initiateLoginEndpoint!,
    clientId: config.clientId!,
  });
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Error page for SSO failure
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold text-lg mb-2">Authentication Error</h2>
          <p>Failed to authenticate. Please refresh or try again later.</p>
          <p className="text-sm mt-2">Error details: {error.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsUserCredential }}>
      <FluentProvider
        theme={
          themeString === "dark"
            ? teamsDarkTheme
            : themeString === "contrast"
            ? teamsHighContrastTheme
            : {
                ...teamsLightTheme,
                colorNeutralBackground3: "#eeeeee",
              }
        }
        style={{ background: tokens.colorNeutralBackground3 }}
      >
        <div className="flex h-screen w-full overflow-hidden">
          <Router>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <div className={`flex-1 transition-all duration-300 overflow-auto`}>
              {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <Spinner className="text-brand-primary" size="large" label="Authenticating..." />
                </div>
              ) : (
                <Routes>
                  <Route path="/manage-companies" element={<ManageCompanies />} />
                  {/* Default route redirects to manage-companies */}
                  <Route path="*" element={<Navigate to="/manage-companies" />} />
                </Routes>
              )}
            </div>
          </Router>
        </div>
      </FluentProvider>
    </TeamsFxContext.Provider>
  );
} 