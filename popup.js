document.getElementById('openDashboardBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'dashboard.html' });
});
