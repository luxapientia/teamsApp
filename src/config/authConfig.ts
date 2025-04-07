export const authConfig = {
  clientId: process.env.REACT_APP_CLIENT_ID || '38681428-5b78-4e82-97ff-e168419e7611',
  tenantId: process.env.REACT_APP_TENANT_ID || '987eaa8d-6b2d-4a86-9b2e-8af581ec8056',
  redirectUri: `${window.location.origin}/auth/callback`,
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  teamsResource: 'api://app.teamscorecards.online/38681428-5b78-4e82-97ff-e168419e7611',
  
  getLoginUrl: (isTeams = false) => {
    const params = new URLSearchParams({
      client_id: authConfig.clientId,
      response_type: 'code',
      redirect_uri: authConfig.redirectUri,
      scope: authConfig.scopes.join(' '),
      response_mode: 'query',
      prompt: 'select_account'
    });

    if (isTeams) {
      params.append('resource', authConfig.teamsResource);
    }
    
    return `https://login.microsoftonline.com/${authConfig.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }
}; 