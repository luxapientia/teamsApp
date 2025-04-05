import React from 'react';
import { Text, Button, Spinner } from '@fluentui/react-components';
import { useAuth } from '../contexts/AuthContext';

export const ConsentPage: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleConsent = async () => {
    setLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Error during consent:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Text size={800} weight="semibold" className="mb-4">
        Organization Consent Required
      </Text>
      <Text className="mb-6 text-center max-w-md">
        This application requires consent from your organization's administrator. 
        Click below to start the consent process.
      </Text>
      <Button 
        appearance="primary"
        onClick={handleConsent}
        disabled={loading}
      >
        {loading ? <Spinner size="tiny" /> : 'Request Consent'}
      </Button>
    </div>
  );
}; 