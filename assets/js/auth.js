// مدیریت تأیید هویت
import { showToast } from './utils.js';

let currentUser = null;

export function login(phone) {
    const code = Math.floor(100000 + Math.random() * 900000);
    // در نسخه واقعی، کد به شماره ارسال می‌شود
    showToast(`✅ کد تأیید: ${code} (برای تست)`, 'info');
    localStorage.setItem('poitx_code', code);
    localStorage.setItem('poitx_phone', phone);
    return code;
}

export function verifyCode(enteredCode) {
    const stored = localStorage.getItem('poitx_code');
    if (enteredCode === stored) {
        currentUser = { phone: localStorage.getItem('poitx_phone') };
        showToast('✅ تأیید شد!', 'success');
        return true;
    } else {
        showToast('❌ کد اشتباه است', 'error');
        return false;
    }
}

export function logout() {
    localStorage.removeItem('poitx_code');
    localStorage.removeItem('poitx_phone');
    currentUser = null;
    showToast('🔴 خروج از سیستم', 'info');
}
