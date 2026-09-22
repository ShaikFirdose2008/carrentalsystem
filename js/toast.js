/* ==========================================================================
   ApexDrive - Toast Notification System
   Provides sleek non-blocking feedback for User & Admin interactions
   ========================================================================== */

(function () {
  function getOrCreateContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function (message, type = 'info', duration = 3500) {
    const container = getOrCreateContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-closing');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, duration);
  };
})();
