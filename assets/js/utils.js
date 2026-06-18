// ابزارهای کمکی
export function getTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' +
           now.getMinutes().toString().padStart(2, '0');
}

export function generateId() {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
}

export function loadComponent(path) {
    return fetch(path).then(res => res.text());
}

export function showToast(msg, type = 'info') {
    const colors = { info: '#00f0ff', error: '#ff2d95', success: '#00ff41' };
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #14141e; color: ${colors[type] || '#fff'};
        border: 1px solid ${colors[type] || '#fff'};
        padding: 12px 24px; border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        z-index: 9999;
        box-shadow: 0 0 30px rgba(0,0,0,0.8);
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
