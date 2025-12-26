// admin-auth.js - نظام إدارة المصادقة

class AdminAuthSystem {
    constructor() {
        this.sessionKey = 'admin_session';
        this.maxSessionHours = 8; // مدة الجلسة بالساعات
        this.sessionWarningMinutes = 10; // تحذير قبل انتهاء الجلسة
    }
    
    // التحقق من الجلسة الحالية
    checkSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        
        if (!sessionData) {
            return { valid: false, reason: 'no_session' };
        }
        
        try {
            const session = JSON.parse(sessionData);
            const currentTime = new Date().getTime();
            const sessionAge = currentTime - session.timestamp;
            const maxSessionAge = this.maxSessionHours * 60 * 60 * 1000;
            
            // التحقق من بيانات الجلسة
            if (!session.authenticated || !session.user || !session.sessionId) {
                this.clearSession();
                return { valid: false, reason: 'invalid_session' };
            }
            
            // التحقق من مدة الجلسة
            if (sessionAge > maxSessionAge) {
                this.clearSession();
                return { valid: false, reason: 'session_expired' };
            }
            
            // التحقق من وقت التحذير
            const timeLeft = maxSessionAge - sessionAge;
            const minutesLeft = Math.floor(timeLeft / (60 * 1000));
            
            return {
                valid: true,
                session: session,
                minutesLeft: minutesLeft,
                needsWarning: minutesLeft <= this.sessionWarningMinutes
            };
            
        } catch (error) {
            this.clearSession();
            return { valid: false, reason: 'parse_error' };
        }
    }
    
    // إنشاء جلسة جديدة
    createSession(userData) {
        const session = {
            authenticated: true,
            timestamp: new Date().getTime(),
            user: userData,
            sessionId: 'simba_' + this.generateSessionId(),
            ip: this.getClientIP(),
            userAgent: navigator.userAgent
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        
        // تسجيل الجلسة في السجل
        this.logSession('login', session);
        
        return session;
    }
    
    // تحديث الجلسة
    refreshSession() {
        const check = this.checkSession();
        
        if (check.valid) {
            const session = check.session;
            session.timestamp = new Date().getTime();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            
            return { success: true, session: session };
        }
        
        return { success: false, reason: check.reason };
    }
    
    // إنهاء الجلسة
    clearSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.logSession('logout', session);
            } catch (error) {
                console.error('Error parsing session data:', error);
            }
        }
        
        localStorage.removeItem(this.sessionKey);
    }
    
    // إعادة توجيه للتحقق
    redirectToVerify() {
        window.location.href = "admin-verify.html";
    }
    
    // توليد معرف جلسة
    generateSessionId() {
        return Math.random().toString(36).substr(2, 9) + 
               Date.now().toString(36) + 
               Math.random().toString(36).substr(2, 5);
    }
    
    // الحصول على IP العميل (تقريبي)
    getClientIP() {
        // هذه دالة تقريبية، في بيئة حقيقية تأتي من السيرفر
        return 'user_' + Math.random().toString(36).substr(2, 8);
    }
    
    // تسجيل أحداث الجلسة
    logSession(action, session) {
        const logEntry = {
            action: action,
            timestamp: new Date().toISOString(),
            sessionId: session.sessionId,
            user: session.user.name,
            role: session.user.role,
            ip: session.ip,
            userAgent: session.userAgent
        };
        
        // حفظ في localStorage (في بيئة حقيقية ترسل للسيرفر)
        const logs = JSON.parse(localStorage.getItem('admin_security_logs') || '[]');
        logs.push(logEntry);
        
        // حفظ آخر 100 حدث فقط
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('admin_security_logs', JSON.stringify(logs));
        
        console.log(`[Admin Auth] ${action.toUpperCase()}: ${session.user.name} (${session.user.role})`);
    }
    
    // عرض تحذير انتهاء الجلسة
    showSessionWarning(minutesLeft) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'session-warning';
        warningDiv.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>تنبيه: الجلسة ستنتهي خلال ${minutesLeft} دقيقة</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(warningDiv);
        
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.classList.add('show');
            }
        }, 1000);
    }
    
    // تهيئة النظام
    init() {
        // التحقق التلقائي
        const sessionCheck = this.checkSession();
        
        if (!sessionCheck.valid) {
            this.redirectToVerify();
            return false;
        }
        
        // عرض تحذير إذا لزم
        if (sessionCheck.needsWarning) {
            this.showSessionWarning(sessionCheck.minutesLeft);
        }
        
        // تحديث الجلسة كل دقيقة
        setInterval(() => {
            this.refreshSession();
        }, 60000);
        
        return sessionCheck.session;
    }
}

// استخدام النظام
let authSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AdminAuthSystem();
    const session = authSystem.init();
    
    if (session) {
        // تهيئة الصفحة مع بيانات المستخدم
        initializeAdminPage(session);
    }
});

// تهيئة الصفحة
function initializeAdminPage(session) {
    // تحديث معلومات المستخدم
    const userElements = {
        '.user-avatar': session.user.avatar,
        '.user-info div:first-child': session.user.name,
        '.user-info small': session.user.role
    };
    
    Object.entries(userElements).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    });
    
    // إضافة زر تسجيل الخروج
    addLogoutButton();
    
    // حماية الصفحة
    setupPageProtection();
}

// إضافة زر تسجيل الخروج
function addLogoutButton() {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> تسجيل الخروج';
    logoutBtn.onclick = function() {
        if (confirm('هل تريد تسجيل الخروج من لوحة الإدارة؟')) {
            if (authSystem) {
                authSystem.clearSession();
            }
            window.location.href = "admin-verify.html";
        }
    };
    
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.appendChild(logoutBtn);
    }
}

// إعداد حماية الصفحة
function setupPageProtection() {
    // منع تصفح الصفحة بدون جلسة
    window.addEventListener('beforeunload', function() {
        if (authSystem) {
            authSystem.refreshSession();
        }
    });
}