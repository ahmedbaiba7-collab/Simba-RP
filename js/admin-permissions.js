// نظام صلاحيات الأدمن - admin-permissions.js

// تعريف المستويات الوظيفية
const STAFF_ROLES = {
    OWNER: 'owner',          // المالك - كامل الصلاحيات
    ADMIN: 'admin',          // أدمن - صلاحيات عالية
    MODERATOR: 'moderator',  // مشرف - صلاحيات متوسطة
    HELPER: 'helper',        // مساعد - صلاحيات محدودة
    TRIAL: 'trial'           // تحت التجربة - صلاحيات قليلة
};

// صلاحيات كل مستوى وظيفي
const ROLE_PERMISSIONS = {
    [STAFF_ROLES.OWNER]: {
        canBan: true,
        canKick: true,
        canWarn: true,
        canMute: true,
        canManageStaff: true,
        canViewLogs: true,
        canEditConfig: true,
        canManageServer: true,
        canViewFinancials: true,
        canDeleteContent: true,
        canManageAnnouncements: true,
        canAccessAdvancedTools: true
    },
    [STAFF_ROLES.ADMIN]: {
        canBan: true,
        canKick: true,
        canWarn: true,
        canMute: true,
        canManageStaff: false,
        canViewLogs: true,
        canEditConfig: false,
        canManageServer: false,
        canViewFinancials: false,
        canDeleteContent: true,
        canManageAnnouncements: true,
        canAccessAdvancedTools: true
    },
    [STAFF_ROLES.MODERATOR]: {
        canBan: false,
        canKick: true,
        canWarn: true,
        canMute: true,
        canManageStaff: false,
        canViewLogs: true,
        canEditConfig: false,
        canManageServer: false,
        canViewFinancials: false,
        canDeleteContent: true,
        canManageAnnouncements: false,
        canAccessAdvancedTools: false
    },
    [STAFF_ROLES.HELPER]: {
        canBan: false,
        canKick: false,
        canWarn: true,
        canMute: true,
        canManageStaff: false,
        canViewLogs: false,
        canEditConfig: false,
        canManageServer: false,
        canViewFinancials: false,
        canDeleteContent: false,
        canManageAnnouncements: false,
        canAccessAdvancedTools: false
    },
    [STAFF_ROLES.TRIAL]: {
        canBan: false,
        canKick: false,
        canWarn: false,
        canMute: false,
        canManageStaff: false,
        canViewLogs: false,
        canEditConfig: false,
        canManageServer: false,
        canViewFinancials: false,
        canDeleteContent: false,
        canManageAnnouncements: false,
        canAccessAdvancedTools: false
    }
};

// بيانات المستخدمين (في حالة حقيقية تأتي من قاعدة بيانات)
const STAFF_MEMBERS = {
    "ADMIN_SIMBA": { 
        role: STAFF_ROLES.OWNER, 
        name: "Simba Admin",
        permissions: ROLE_PERMISSIONS[STAFF_ROLES.OWNER]
    },
    "ADMIN_ALEX": { 
        role: STAFF_ROLES.ADMIN, 
        name: "Alex Morgan",
        permissions: ROLE_PERMISSIONS[STAFF_ROLES.ADMIN]
    },
    "MOD_SARAH": { 
        role: STAFF_ROLES.MODERATOR, 
        name: "Sarah Chen",
        permissions: ROLE_PERMISSIONS[STAFF_ROLES.MODERATOR]
    },
    "HELPER_JOE": { 
        role: STAFF_ROLES.HELPER, 
        name: "Joe Wilson",
        permissions: ROLE_PERMISSIONS[STAFF_ROLES.HELPER]
    },
    "TRIAL_MARK": { 
        role: STAFF_ROLES.TRIAL, 
        name: "Mark Davis",
        permissions: ROLE_PERMISSIONS[STAFF_ROLES.TRIAL]
    }
};

// نظام حماية الأزرار
class ButtonGuard {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // تحميل بيانات المستخدم من localStorage
        this.loadUserData();
        
        // حماية الأزرار عند تحميل الصفحة
        this.protectButtons();
        
        // إضافة event listeners لأزرار الأدمن
        this.setupButtonListeners();
    }
    
    loadUserData() {
        const savedUser = localStorage.getItem('admin_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        } else {
            // افتراضي: مستخدم تجريبي (يمكن تغييره)
            this.currentUser = {
                username: "MOD_SARAH",
                ...STAFF_MEMBERS["MOD_SARAH"]
            };
            localStorage.setItem('admin_current_user', JSON.stringify(this.currentUser));
        }
    }
    
    // التحقق من الصلاحية
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }
        return this.currentUser.permissions[permission] === true;
    }
    
    // حماية الأزرار
    protectButtons() {
        const protectedButtons = document.querySelectorAll('[data-permission]');
        
        protectedButtons.forEach(button => {
            const permission = button.getAttribute('data-permission');
            const requiredRole = button.getAttribute('data-role');
            
            let hasAccess = false;
            
            if (permission) {
                hasAccess = this.hasPermission(permission);
            }
            
            if (requiredRole) {
                hasAccess = this.currentUser.role === requiredRole;
            }
            
            if (!hasAccess) {
                this.disableButton(button);
            } else {
                this.enableButton(button);
            }
        });
    }
    
    disableButton(button) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
        button.title = 'غير مصرح - تحتاج صلاحية أعلى';
        
        // إضافة أيقونة القفل
        if (!button.querySelector('.permission-icon')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-lock permission-icon';
            icon.style.marginLeft = '5px';
            button.appendChild(icon);
        }
    }
    
    enableButton(button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.title = '';
        
        // إزالة أيقونة القفل
        const lockIcon = button.querySelector('.permission-icon');
        if (lockIcon) {
            lockIcon.remove();
        }
    }
    
    setupButtonListeners() {
        // أزرار الحظر
        document.querySelectorAll('[data-action="ban"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canBan')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية الحظر');
                    return;
                }
                this.confirmAction('حظر لاعب', 'هل أنت متأكد من حظر هذا اللاعب؟', () => {
                    this.executeBan(button.dataset.playerId);
                });
            });
        });
        
        // أزرار الطرد
        document.querySelectorAll('[data-action="kick"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canKick')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية الطرد');
                    return;
                }
                this.confirmAction('طرد لاعب', 'هل أنت متأكد من طرد هذا اللاعب؟', () => {
                    this.executeKick(button.dataset.playerId);
                });
            });
        });
        
        // أزرار التحذير
        document.querySelectorAll('[data-action="warn"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canWarn')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية إعطاء تحذير');
                    return;
                }
                this.showWarnDialog(button.dataset.playerId);
            });
        });
        
        // أزرار الصمت
        document.querySelectorAll('[data-action="mute"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canMute')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية الصمت');
                    return;
                }
                this.showMuteDialog(button.dataset.playerId);
            });
        });
        
        // أزرار الحذف
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canDeleteContent')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية الحذف');
                    return;
                }
                this.confirmAction('حذف محتوى', 'هل أنت متأكد من حذف هذا المحتوى؟', () => {
                    this.executeDelete(button.dataset.contentId);
                });
            });
        });
        
        // أزرار إدارة المشرفين
        document.querySelectorAll('[data-action="manage-staff"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canManageStaff')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية إدارة المشرفين');
                    return;
                }
                window.location.href = 'admin-staff-management.html';
            });
        });
        
        // أزرار السيرفر المتقدمة
        document.querySelectorAll('[data-action="server-tools"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.hasPermission('canAccessAdvancedTools')) {
                    e.preventDefault();
                    this.showPermissionError('لا تملك صلاحية الوصول للأدوات المتقدمة');
                    return;
                }
                window.location.href = 'admin-server-tools.html';
            });
        });
    }
    
    // تأكيد الإجراء
    confirmAction(title, message, confirmCallback) {
        const modal = document.createElement('div');
        modal.className = 'permission-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3><i class="fas fa-exclamation-triangle"></i> ${title}</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn-cancel">إلغاء</button>
                    <button class="btn-confirm">تأكيد</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.btn-confirm').addEventListener('click', () => {
            confirmCallback();
            document.body.removeChild(modal);
        });
    }
    
    // تنفيذ الإجراءات
    executeBan(playerId) {
        console.log(`حظر اللاعب: ${playerId}`);
        this.showSuccessMessage('تم حظر اللاعب بنجاح');
        // هنا أضف كود API الحقيقي
    }
    
    executeKick(playerId) {
        console.log(`طرد اللاعب: ${playerId}`);
        this.showSuccessMessage('تم طرد اللاعب بنجاح');
        // هنا أضف كود API الحقيقي
    }
    
    executeDelete(contentId) {
        console.log(`حذف المحتوى: ${contentId}`);
        this.showSuccessMessage('تم حذف المحتوى بنجاح');
        // هنا أضف كود API الحقيقي
    }
    
    // عرض رسالة الخطأ
    showPermissionError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'permission-error';
        errorDiv.innerHTML = `
            <i class="fas fa-ban"></i>
            <span>${message}</span>
            <button class="error-close">&times;</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.classList.add('show');
        }, 10);
        
        errorDiv.querySelector('.error-close').addEventListener('click', () => {
            errorDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        });
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.classList.remove('show');
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        document.body.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // عرض رسالة النجاح
    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'permission-success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => {
                if (successDiv.parentNode) {
                    document.body.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }
    
    // نوافذ التحذير والصمت
    showWarnDialog(playerId) {
        const reason = prompt('أدخل سبب التحذير:', 'سلوك غير لائق');
        if (reason) {
            console.log(`تحذير اللاعب ${playerId}: ${reason}`);
            this.showSuccessMessage('تم إرسال التحذير بنجاح');
        }
    }
    
    showMuteDialog(playerId) {
        const duration = prompt('أدخل مدة الصمت (بالدقائق):', '60');
        if (duration) {
            console.log(`صمت اللاعب ${playerId} لمدة ${duration} دقيقة`);
            this.showSuccessMessage('تم تطبيق الصمت بنجاح');
        }
    }
    
    // تبديل المستخدم (للتجربة)
    switchUser(username) {
        if (STAFF_MEMBERS[username]) {
            this.currentUser = {
                username,
                ...STAFF_MEMBERS[username]
            };
            localStorage.setItem('admin_current_user', JSON.stringify(this.currentUser));
            this.protectButtons();
            this.showSuccessMessage(`تم التبديل إلى: ${this.currentUser.name}`);
        }
    }
}

// تهيئة الحارس
let buttonGuard = null;
document.addEventListener('DOMContentLoaded', () => {
    buttonGuard = new ButtonGuard();
});

// للوصول من الكونسول للتجربة
window.ButtonGuard = ButtonGuard;