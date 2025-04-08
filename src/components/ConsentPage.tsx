import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const ConsentPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract consent information from the state passed during navigation
    const state = location.state as any;
    
    if (state?.consentUrl) {
      setConsentUrl(state.consentUrl);
      setLoading(false);
    } else {
      setError('No consent URL provided');
      setLoading(false);
    }
  }, [location]);

  const handleCopyUrl = () => {
    if (consentUrl) {
      navigator.clipboard.writeText(consentUrl)
        .then(() => alert('Consent URL copied to clipboard'))
        .catch(() => alert('Failed to copy. Please select and copy the URL manually.'));
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Consent Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your tenant administrator needs to approve this application before you can sign in with Teams.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-700 mb-4">
                Please share this link with your tenant administrator to grant consent:
              </p>
              <div className="bg-white p-3 rounded border text-sm overflow-x-auto break-all">
                {consentUrl}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleCopyUrl}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Copy Consent URL
              </button>
              <button
                onClick={handleBack}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            </div>
            
            <div className="text-sm text-gray-500 mt-4">
              <p>After the administrator approves the application, you'll be able to sign in with Teams.</p>
              <p className="mt-2">If you're the administrator, click the link above to provide consent.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 