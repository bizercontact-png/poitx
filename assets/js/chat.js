// مدیریت چت
import { getTime, generateId, showToast } from './utils.js';

let messages = [];
let chatPartner = 'مهدیار';

export function sendMessage(text) {
    if (!text.trim()) return;
    const msg = {
        id: generateId(),
        sender: 'من',
        text: text.trim(),
        time: getTime(),
        isSelf: true
    };
    messages.push(msg);
    renderMessages();
    // شبیه‌سازی پاسخ خودکار
    setTimeout(() => {
        const reply = {
            id: generateId(),
            sender: chatPartner,
            text: '📡 پیام دریافت شد. در تاریکی سایبر...',
            time: getTime(),
            isSelf: false
        };
        messages.push(reply);
        renderMessages();
    }, 1000);
}

export function renderMessages() {
    const container = document.getElementById('messageArea');
    if (!container) return;
    container.innerHTML = messages.map(msg => `
        <div class="cyber-card" style="
            border-left: 3px solid ${msg.isSelf ? '#00f0ff' : '#ff2d95'};
            text-align: ${msg.isSelf ? 'right' : 'left'};
            background: ${msg.isSelf ? 'rgba(0,240,255,0.05)' : 'rgba(255,45,149,0.05)'};
        ">
            <div style="color: ${msg.isSelf ? '#00f0ff' : '#ff2d95'}; font-size: 12px;">
                ${msg.sender} • ${msg.time}
            </div>
            <div style="font-size: 14px; margin-top: 4px;">${msg.text}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}
