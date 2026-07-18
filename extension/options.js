const apiBaseInput = document.getElementById('apiBase');
const supabaseUrlInput = document.getElementById('supabaseUrl');
const supabaseAnonKeyInput = document.getElementById('supabaseAnonKey');
const statusEl = document.getElementById('status');

chrome.storage.sync.get(
  {
    apiBase: 'http://localhost:3000',
    supabaseUrl: '',
    supabaseAnonKey: '',
  },
  (data) => {
    apiBaseInput.value = data.apiBase;
    supabaseUrlInput.value = data.supabaseUrl;
    supabaseAnonKeyInput.value = data.supabaseAnonKey;
  }
);

document.getElementById('save').addEventListener('click', () => {
  const apiBase = apiBaseInput.value.trim().replace(/\/$/, '') || 'http://localhost:3000';
  const supabaseUrl = supabaseUrlInput.value.trim().replace(/\/$/, '');
  const supabaseAnonKey = supabaseAnonKeyInput.value.trim();

  chrome.storage.sync.set({ apiBase, supabaseUrl, supabaseAnonKey }, () => {
    statusEl.textContent = 'Saved.';
  });
});
