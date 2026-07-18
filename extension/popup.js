const titleEl = document.getElementById('title');
const urlEl = document.getElementById('url');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');

let currentTab = null;

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = 'status' + (kind ? ` ${kind}` : '');
}

async function getApiBase() {
  const stored = await chrome.storage.sync.get({ apiBase: 'http://localhost:3000' });
  return stored.apiBase.replace(/\/$/, '');
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  titleEl.textContent = tab?.title || 'Untitled';
  urlEl.textContent = tab?.url || '';

  if (!tab?.url || !(tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    saveBtn.disabled = true;
    setStatus('This page cannot be saved.', 'err');
  }
}

saveBtn.addEventListener('click', async () => {
  if (!currentTab?.url) return;
  saveBtn.disabled = true;
  setStatus('Saving…');

  try {
    const base = await getApiBase();
    const res = await fetch(`${base}/api/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: currentTab.url,
        title: currentTab.title || undefined,
      }),
    });
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
      err instanceof Error
        ? `${err.message} (Is DevMark running?)`
        : 'Save failed. Is DevMark running?',
      'err'
    );
  } finally {
    saveBtn.disabled = false;
  }
});

init();
