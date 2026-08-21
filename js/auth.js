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

// Returns the signed-in account for use at form submission
function getCurrentUser() {
  return currentUser;
}

initAuth();
