import { License, LicenseStatus } from '../types';

export const checkLicenseStatus = (license: License): LicenseStatus => {
  const today = new Date();
  const endDate = new Date(license.endDate);
  return endDate < today ? 'expired' : 'active';
};

export const updateLicenseStatuses = (licenses: License[]): License[] => {
  return licenses.map(license => {
    const newStatus = checkLicenseStatus(license);
    if (newStatus === 'expired' && license.status !== 'expired') {
      // Clear the license key when the license expires
      return { ...license, status: newStatus, licenseKey: '' };
    }
    return { ...license, status: newStatus };
  });
};

// Function to start the daily license check
export const startDailyLicenseCheck = (
  licenses: License[],
  updateLicenses: (updatedLicenses: License[]) => void
): () => void => {
  // Perform initial check
  const updatedLicenses = updateLicenseStatuses(licenses);
  updateLicenses(updatedLicenses);

  // Calculate time until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  // Set up the daily check
  let dailyInterval: NodeJS.Timeout;
  const timeoutId = setTimeout(() => {
    // First check after midnight
    const updatedLicenses = updateLicenseStatuses(licenses);
    updateLicenses(updatedLicenses);

    // Then set up recurring daily checks
    dailyInterval = setInterval(() => {
      const updatedLicenses = updateLicenseStatuses(licenses);
      updateLicenses(updatedLicenses);
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, timeUntilMidnight);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    if (dailyInterval) {
      clearInterval(dailyInterval);
    }
  };
}; 