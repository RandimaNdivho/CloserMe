export class ModalManager {
  openCreateModal() {
    document.getElementById('createModal').style.display = 'flex';
    document.getElementById('postCaption').value = '';
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.value = '';
  }

  closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
  }

  toggleActivityFields() {
    const type = document.getElementById('contentType').value;
    const actFields = document.getElementById('activityFields');
    if (actFields) {
      actFields.style.display = type === 'activity' ? 'block' : 'none';
    }
  }

  showToast(message) {
    let toast = document.getElementById('toastNotification');
    
    // Create toast dynamically if it doesn't exist in index.html
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      document.body.appendChild(toast);
    }

    // Force strict styling so it never hides behind modals or loses text
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--text-main, #111);
      color: var(--bg-main,#fff);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      z-index: 100000;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      opacity: 1;
      transition: opacity 0.3s ease;
    `;

    toast.innerText = message;

    // Clear existing timer and fade out after 3 seconds
    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
    
    toast.hideTimeout = setTimeout(() => {
      toast.style.opacity = '0';
    }, 3000);
  }
}