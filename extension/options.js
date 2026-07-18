const input = document.getElementById('apiBase');
const statusEl = document.getElementById('status');

chrome.storage.sync.get({ apiBase: 'http://localhost:3000' }, (data) => {
  input.value = data.apiBase;
});

document.getElementById('save').addEventListener('click', () => {
  const apiBase = input.value.trim().replace(/\/$/, '') || 'http://localhost:3000';
  chrome.storage.sync.set({ apiBase }, () => {
    statusEl.textContent = 'Saved.';
  });
});
