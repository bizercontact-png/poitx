// هسته اصلی اپلیکیشن
import { login, verifyCode, logout } from './auth.js';
import { sendMessage, renderMessages } from './chat.js';
import { addFile, renderInbox } from './inbox.js';
import { showToast, loadComponent } from './utils.js';

// متغیرهای وضعیت
let currentView = 'chat'; // chat | inbox | auth

// بارگذاری اولیه
async function initApp() {
    const app = document.getElementById('app');

    // بررسی وضعیت احراز هویت
    const isLoggedIn = localStorage.getItem('poitx_phone') && localStorage.getItem('poitx_code');
    if (!isLoggedIn) {
        await showAuthPage();
    } else {
        await showMainApp();
    }
}

// صفحه احراز هویت
async function showAuthPage() {
    const app = document.getElementById('app');
    const html = `
        <div style="padding:40px 20px; text-align:center; flex:1; display:flex; flex-direction:column; justify-content:center;">
            <h1 style="color:#00f0ff; text-shadow:0 0 20px #00f0ff;">🔐 POITX</h1>
            <p style="color:#888; margin:10px 0 30px;">ورود به شبکه سایبر</p>
            <input type="text" id="phoneInput" placeholder="شماره تلفن" class="cyber-input" style="margin-bottom:12px;" value="09123456789">
            <div id="codeSection" style="display:none;">
                <input type="text" id="codeInput" placeholder="کد ۶ رقمی" class="cyber-input" style="margin-bottom:12px;">
                <button class="cyber-btn" id="verifyBtn" style="width:100%;">✅ تأیید کد</button>
            </div>
            <button class="cyber-btn" id="loginBtn" style="width:100%;">📱 دریافت کد</button>
        </div>
    `;
    app.innerHTML = html;

    // رویدادها
    document.getElementById('loginBtn').onclick = () => {
        const phone = document.getElementById('phoneInput').value;
        if (phone.length < 10) {
            showToast('❌ شماره نامعتبر', 'error');
            return;
        }
        const code = login(phone);
        document.getElementById('codeSection').style.display = 'block';
        document.getElementById('loginBtn').textContent = '🔄 ارسال مجدد';
        showToast(`📱 کد: ${code} (برای تست)`, 'info');
    };

    document.getElementById('verifyBtn')?.addEventListener('click', () => {
        const entered = document.getElementById('codeInput').value;
        if (verifyCode(entered)) {
            showToast('✅ وارد شدید', 'success');
            initApp();
        }
    });
}

// صفحه اصلی چت و صندوق
async function showMainApp() {
    const app = document.getElementById('app');
    const chatTemplate = await loadComponent('components/templates/chat-template.html');
    const inboxTemplate = await loadComponent('components/templates/inbox-template.html');

    app.innerHTML = `
        <div class="cyber-header">
            <span>⚡ POITX</span>
            <span id="viewToggle" style="cursor:pointer; color:#00f0ff; font-size:14px;">
                📂 صندوق
            </span>
        </div>
        <div id="viewContainer" style="flex:1; overflow-y:auto; padding:8px 12px;">
            ${chatTemplate}
        </div>
        <div style="border-top:1px solid #00f0ff; padding:8px 12px; display:flex; gap:8px;">
            <input type="text" id="messageInput" placeholder="پیام..." class="cyber-input" style="flex:1;">
            <button class="cyber-btn" id="sendBtn">➤</button>
            <label style="color:#00f0ff; cursor:pointer; display:flex; align-items:center; gap:4px;">
                📎 <input type="file" id="fileInput" style="display:none;">
            </label>
        </div>
    `;

    // بارگذاری پیام‌ها
    renderMessages();

    // رویداد ارسال پیام
    document.getElementById('sendBtn').onclick = () => {
        const input = document.getElementById('messageInput');
        sendMessage(input.value);
        input.value = '';
    };
    document.getElementById('messageInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('sendBtn').click();
        }
    });

    // آپلود فایل
    document.getElementById('fileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            addFile(file);
        }
        e.target.value = '';
    };

    // تغییر بین چت و صندوق
    let showInbox = false;
    document.getElementById('viewToggle').onclick = () => {
        showInbox = !showInbox;
        const container = document.getElementById('viewContainer');
        if (showInbox) {
            container.innerHTML = inboxTemplate;
            renderInbox();
            document.getElementById('viewToggle').innerHTML = '💬 چت';
        } else {
            container.innerHTML = chatTemplate;
            renderMessages();
            document.getElementById('viewToggle').innerHTML = '📂 صندوق';
        }
    };
}

// شروع اپلیکیشن
initApp();
