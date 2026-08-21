const msalConfig = {
  auth: {
    clientId: 'b08ded6e-6fa3-415f-960c-3ebbfe9fe4d6',
    authority: 'https://login.microsoftonline.com/3e32dd7c-41f6-492d-a1a3-c58eb02cf4f8',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
  }
};

const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
  extraQueryParameters: { prompt: 'select_account' }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

let currentUser = null;

async function initAuth() {
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      currentUser = response.account;
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        currentUser = accounts[0];
      } else {
        // No signed-in user — redirect to login immediately
        await msalInstance.loginRedirect(loginRequest);
        return;
      }
    }
    renderAuthUI();
  } catch (e) {
    console.error('MSAL init error:', e);
  }
}

function renderAuthUI() {
  const navActions = document.querySelector('.nav-actions');

  if (currentUser) {
    const claims = currentUser.idTokenClaims || {};
    const fullName = currentUser.name || currentUser.username;
    // Handle "Surname, Firstname" AD format
    const firstName = claims.given_name ||
      (fullName.includes(',') ? fullName.split(',')[1].trim() : fullName.split(' ')[0]);
    const initials = (claims.given_name?.[0] || firstName[0] || '') +
      (claims.family_name?.[0] || (fullName.includes(',') ? fullName[0] : (fullName.split(' ')[1]?.[0] || '')));
    const userEl = document.createElement('div');
    userEl.className = 'nav-user';
    userEl.innerHTML = `
      <div class="nav-user-avatar" title="${fullName}">${initials.toUpperCase()}</div>
      <span class="nav-user-name">${firstName}</span>
      <button class="btn btn-outline btn-sm" id="btn-signout">Sign out</button>
    `;
    navActions.prepend(userEl);
    document.getElementById('btn-signout').addEventListener('click', () => msalInstance.logoutRedirect());
  } else {
    const signInBtn = document.createElement('button');
    signInBtn.className = 'btn btn-outline btn-sm';
    signInBtn.textContent = 'Sign in';
    signInBtn.addEventListener('click', () => msalInstance.loginRedirect(loginRequest));
    navActions.prepend(signInBtn);
  }
}

// Extract or infer region automatically from AD claims / locale / timezone
function getUserRegion(user) {
  if (!user) return 'Global';
  const claims = user.idTokenClaims || {};
  
  // 1. Check direct AD claims (country, c, usageLocation, preferredLanguage)
  const country = (claims.country || claims.ctry || claims.c || claims.usageLocation || '').toUpperCase();
  if (['GB', 'UK', 'IE', 'IRL', 'UNITED KINGDOM', 'IRELAND'].includes(country)) return 'UKI';
  if (['US', 'USA', 'CA', 'CAN', 'UNITED STATES', 'CANADA'].includes(country)) return 'North America';
  if (['FR', 'FRA', 'FRANCE'].includes(country)) return 'France';
  if (['ES', 'ESP', 'PT', 'PRT', 'SPAIN', 'PORTUGAL'].includes(country)) return 'Iberia';
  if (['DE', 'DEU', 'AT', 'AUT', 'CH', 'CHE', 'PL', 'POL', 'GERMANY', 'AUSTRIA', 'SWITZERLAND', 'POLAND'].includes(country)) return 'CEU';
  if (['ZA', 'ZAF', 'AE', 'ARE', 'SAUDI', 'SOUTH AFRICA', 'UAE', 'AME'].includes(country)) return 'AME';

  // 2. Infer from browser timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Europe/London') || tz.includes('Europe/Dublin') || tz.includes('Europe/Belfast')) return 'UKI';
    if (tz.startsWith('America/') || tz.startsWith('US/') || tz.startsWith('Canada/')) return 'North America';
    if (tz.includes('Europe/Paris')) return 'France';
    if (tz.includes('Europe/Madrid') || tz.includes('Europe/Lisbon')) return 'Iberia';
    if (tz.includes('Europe/Berlin') || tz.includes('Europe/Warsaw') || tz.includes('Europe/Vienna') || tz.includes('Europe/Zurich')) return 'CEU';
    if (tz.includes('Africa/Johannesburg') || tz.includes('Asia/Dubai') || tz.includes('Asia/Riyadh')) return 'AME';
  } catch (e) {
    // Ignore error
  }

  return 'Global';
}

// Returns the signed-in account for use at form submission
function getCurrentUser() {
  return currentUser;
}

initAuth();
