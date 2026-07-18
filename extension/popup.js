const loginView = document.getElementById('login-view');
const saveView = document.getElementById('save-view');
const titleEl = document.getElementById('title');
const urlEl = document.getElementById('url');
const userEmailEl = document.getElementById('user-email');
const saveBtn = document.getElementById('save');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const statusEl = document.getElementById('status');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const webLoginLink = document.getElementById('web-login');

let currentTab = null;

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = 'status' + (kind ? ` ${kind}` : '');
}

async function getSettings() {
  return chrome.storage.sync.get({
    apiBase: 'http://localhost:3000',
    supabaseUrl: '',
    supabaseAnonKey: '',
    accessToken: '',
    refreshToken: '',
    userEmail: '',
  });
}

async function setAuth(session) {
  await chrome.storage.sync.set({
    accessToken: session?.access_token || '',
    refreshToken: session?.refresh_token || '',
    userEmail: session?.user?.email || '',
  });
}

function showLoggedIn(settings) {
  loginView.classList.add('hidden');
  saveView.classList.remove('hidden');
  userEmailEl.textContent = settings.userEmail || 'Signed in';
}

function showLoggedOut() {
  loginView.classList.remove('hidden');
  saveView.classList.add('hidden');
}

async function signInWithPassword(email, password, settings) {
  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    throw new Error('Set Supabase URL + anon key in Settings first.');
  }

  const res = await fetch(
    `${settings.supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: settings.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.error || 'Login failed');
  }

  await setAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: { email: data.user?.email || email },
  });
}

async function refreshSession(settings) {
  if (!settings.refreshToken || !settings.supabaseUrl || !settings.supabaseAnonKey) {
    return null;
  }

  const res = await fetch(
    `${settings.supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        apikey: settings.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: settings.refreshToken }),
    }
  );

  const data = await res.json();
  if (!res.ok) return null;

  await setAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: { email: data.user?.email || settings.userEmail },
  });

  return data.access_token;
}

async function init() {
  const settings = await getSettings();
  webLoginLink.href = `${settings.apiBase.replace(/\/$/, '')}/login`;

  if (settings.accessToken) {
    showLoggedIn(settings);
  } else {
    showLoggedOut();
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  titleEl.textContent = tab?.title || 'Untitled';
  urlEl.textContent = tab?.url || '';

  if (!tab?.url || !(tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    saveBtn.disabled = true;
    setStatus('This page cannot be saved.', 'err');
  }
}

loginBtn.addEventListener('click', async () => {
  loginBtn.disabled = true;
  setStatus('Signing in…');
  try {
    const settings = await getSettings();
    await signInWithPassword(emailInput.value.trim(), passwordInput.value, settings);
    const next = await getSettings();
    showLoggedIn(next);
    setStatus('Signed in.', 'ok');
  } catch (err) {
    setStatus(err instanceof Error ? err.message : 'Login failed', 'err');
  } finally {
    loginBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', async () => {
  await setAuth(null);
  showLoggedOut();
  setStatus('Signed out.');
});

saveBtn.addEventListener('click', async () => {
  if (!currentTab?.url) return;
  saveBtn.disabled = true;
  setStatus('Saving…');

  try {
    let settings = await getSettings();
    if (!settings.accessToken) {
      throw new Error('Not signed in');
    }

    let token = settings.accessToken;
    const base = settings.apiBase.replace(/\/$/, '');

    let res = await fetch(`${base}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: currentTab.url,
        title: currentTab.title || undefined,
      }),
    });

    // Retry once after refresh if unauthorized
    if (res.status === 401) {
      token = await refreshSession(settings);
      if (!token) throw new Error('Session expired. Sign in again.');
      res = await fetch(`${base}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: currentTab.url,
          title: currentTab.title || undefined,
        }),
      });
    }

    const data = await res.json();
    if (res.status === 409) {
      setStatus('Already saved in DevMark.', 'err');
      return;
    }
    if (!res.ok) {
      throw new Error(data.error || 'Save failed');
    }
    setStatus('Saved!', 'ok');
  } catch (err) {
    setStatus(
      err instanceof Error ? err.message : 'Save failed. Check Settings + app URL.',
      'err'
    );
  } finally {
    saveBtn.disabled = false;
  }
});

init();
