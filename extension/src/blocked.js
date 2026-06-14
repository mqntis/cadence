const coinCount = document.getElementById('coin-count');
const shopButton = document.getElementById('shop-button');

function renderCoinBalance(balance) {
  if (!coinCount) return;
  const amount = Number(balance ?? 0);
  coinCount.textContent = Number.isFinite(amount) ? amount.toLocaleString() : '0';
}

async function refreshCoinBalance() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (state && typeof state.coinBalance !== 'undefined') {
      renderCoinBalance(state.coinBalance);
      return;
    }
  } catch {}

  const store = await chrome.storage.local.get(['coinBalance']);
  renderCoinBalance(store.coinBalance);
}

refreshCoinBalance();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.coinBalance) return;
  renderCoinBalance(changes.coinBalance.newValue);
});

window.addEventListener('focus', () => {
  refreshCoinBalance();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    refreshCoinBalance();
  }
});

if (shopButton) {
  shopButton.setAttribute('href', chrome.runtime.getURL('src/dashboard/dashboard.html?page=shop'));
}
