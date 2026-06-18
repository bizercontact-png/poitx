// مدیریت صندوق فایل‌ها
let inboxFiles = [];

export function addFile(file) {
    const entry = {
        id: 'file-' + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        date: new Date().toLocaleString()
    };
    inboxFiles.push(entry);
    renderInbox();
    showToast(`📁 فایل ${file.name} در صندوق ذخیره شد`, 'success');
}

export function removeFile(id) {
    inboxFiles = inboxFiles.filter(f => f.id !== id);
    renderInbox();
    showToast('🗑️ فایل حذف شد', 'info');
}

export function renderInbox() {
    const container = document.getElementById('inboxList');
    if (!container) return;
    if (inboxFiles.length === 0) {
        container.innerHTML = `<div style="color: #555; text-align:center; padding: 40px 0;">
            📭 صندوق خالی است
        </div>`;
        return;
    }
    container.innerHTML = inboxFiles.map(f => `
        <div class="cyber-card" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="color:#00f0ff;">📄 ${f.name}</div>
                <div style="font-size:11px; color:#888;">${f.size} bytes • ${f.date}</div>
            </div>
            <button onclick="removeFile('${f.id}')" style="
                background:transparent; border:1px solid #ff2d95; color:#ff2d95;
                padding:4px 12px; cursor:pointer;
            ">🗑️</button>
        </div>
    `).join('');
}
// در دسترس قرار دادن برای onclick
window.removeFile = removeFile;
