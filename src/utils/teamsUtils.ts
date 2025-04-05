import * as microsoftTeams from "@microsoft/teams-js";

export const isInTeams = (): boolean => {
  console.log('Checking if running in Teams...');
  console.log('Window parent:', window.parent);
  console.log('Window self:', window.self);
  console.log('Is parent different:', window.parent !== window.self);
  console.log('Current URL:', window.location.href);
  
  // Check if we're in Teams by looking for specific Teams context
  const isTeams = (
    // Check if we're in an iframe
    window.parent !== window.self ||
    // Check if we're in Teams web client
    window.location.href.includes('teams.microsoft.com') ||
    // Check if we're in Teams desktop client
    window.location.href.includes('teams.live.com') ||
    // Check if we're in Teams mobile web
    window.location.href.includes('teams.microsoft.com/_#') ||
    // Check if we're in Teams mobile app
    window.location.href.includes('teams.microsoft.com/l/') ||
    // Check if we're in Teams desktop app
    window.location.href.includes('teams.microsoft.com/_#/') ||
    // Check if we're in Teams desktop app (alternative URL)
    window.location.href.includes('teams.microsoft.com/_#/l/')
  );
  
  console.log('Is Teams URL:', isTeams);
  console.log('Is running in Teams:', isTeams);
  
  return isTeams;
};

export const initializeTeams = async (): Promise<void> => {
  if (isInTeams()) {
    console.log('Initializing Teams SDK...');
    try {
      await microsoftTeams.initialize();
      console.log('Teams SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Teams SDK:', error);
    }
  } else {
    console.log('Not running in Teams, skipping initialization');
  }
}; 