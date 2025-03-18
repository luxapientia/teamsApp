import { useContext, useEffect, useState } from "react";
import { TeamsFxContext } from "./Context";

export function HelloWorld() {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUserInfo = async () => {
      if (teamsUserCredential) {
        try {
          const userInfo = await teamsUserCredential.getUserInfo();
          setUserName(userInfo.displayName || "User");
          setUserEmail(userInfo.preferredUserName || "");
        } catch (error) {
          console.error("Failed to get user info:", error);
        }
      }
    };
    getUserInfo();
  }, [teamsUserCredential]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden p-6 border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary mb-4">Hello, World!</h1>
          <p className="text-xl text-gray-700 mb-2">Welcome, {userName}!</p>
          {userEmail && <p className="text-sm text-gray-500 mb-6">{userEmail}</p>}
          
          <div className="mb-6 text-sm text-left bg-gray-100 p-3 rounded-md">
            <p className="mb-1"><strong>App Configuration:</strong></p>
            <p className="mb-1">Client ID: 38681428-5b78-4e82-97ff-e168419e7611</p>
            <p className="mb-1">Tenant ID: 987eaa8d-6b2d-4a86-9b2e-8af581ec8056</p>
            <p className="mb-1">Teams App ID: af138b87-5e67-40bd-ad03-575faf285d97</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-approved text-white p-3 rounded-md text-center">
              Approved
            </div>
            <div className="bg-brand-notApproved text-white p-3 rounded-md text-center">
              Not Approved
            </div>
            <div className="bg-brand-submitted text-black p-3 rounded-md text-center">
              Submitted
            </div>
            <div className="bg-brand-primary text-white p-3 rounded-md text-center">
              Primary
            </div>
          </div>
          <button className="bg-brand-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Click Me
          </button>
        </div>
      </div>
    </div>
  );
} 