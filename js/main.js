// Main JavaScript file for SIMBA.RP

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initBackToTop();
    initSmoothScroll();
    initLanguageSwitcher();
    initForms();
    initModals();
    initAnimations();
    
    // Set current year in footer
    setCurrentYear();
    
    // Log initialization
    console.log('SIMBA.RP initialized successfully');
});

// Navigation
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && 
                !menuToggle.contains(event.target) && 
                navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Highlight current page in navigation
    highlightCurrentPage();
}

// Back to Top Button
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                const menuToggle = document.getElementById('menuToggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
                
                // Calculate scroll position (accounting for fixed header)
                const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Language Switcher
function initLanguageSwitcher() {
    const switcher = document.getElementById('languageSwitcher');
    
    if (switcher) {
        // Load saved language preference
        const savedLang = localStorage.getItem('simbaRP_language') || 'en';
        setActiveLanguageButton(savedLang);
        
        // Handle language button clicks
        switcher.addEventListener('click', function(e) {
            const button = e.target.closest('.lang-btn');
            if (button) {
                const lang = button.dataset.lang;
                if (lang) {
                    setLanguage(lang);
                    setActiveLanguageButton(lang);
                }
            }
        });
    }
}

function setActiveLanguageButton(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Form Initialization
function initForms() {
    // Character counter for textareas
    document.querySelectorAll('textarea[data-max-length]').forEach(textarea => {
        const maxLength = textarea.dataset.maxLength;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.textContent = `0/${maxLength}`;
        textarea.parentNode.appendChild(counter);
        
        textarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength * 0.9) {
                counter.style.color = 'var(--warning)';
            } else {
                counter.style.color = 'var(--text-gray)';
            }
        });
    });
    
    // Form validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showFormError(this, 'Please fill in all required fields correctly.');
            }
        });
    });
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            markFieldAsInvalid(field);
            isValid = false;
        } else {
            markFieldAsValid(field);
        }
        
        // Specific validations
        if (field.type === 'email' && field.value) {
            if (!isValidEmail(field.value)) {
                markFieldAsInvalid(field);
                isValid = false;
            }
        }
        
        if (field.dataset.validate === 'discord' && field.value) {
            if (!isValidDiscordUsername(field.value)) {
                markFieldAsInvalid(field);
                isValid = false;
            }
        }
        
        if (field.type === 'number' && field.dataset.min) {
            if (parseInt(field.value) < parseInt(field.dataset.min)) {
                markFieldAsInvalid(field);
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function markFieldAsInvalid(field) {
    field.parentElement.classList.add('error');
    field.parentElement.classList.remove('success');
    
    // Add error message if not exists
    if (!field.parentElement.querySelector('.error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = field.dataset.error || 'This field is required';
        field.parentElement.appendChild(errorMsg);
    }
}

function markFieldAsValid(field) {
    field.parentElement.classList.remove('error');
    field.parentElement.classList.add('success');
    
    // Remove error message if exists
    const errorMsg = field.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidDiscordUsername(username) {
    const re = /^.{3,32}#[0-9]{4}$/;
    return re.test(username);
}

// Modal Functions
function initModals() {
    // Close modals with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

// Animations
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right').forEach(el => {
        observer.observe(el);
    });
}

// Toast/Notification System
function showToast(message, type = 'success', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
}

// Utility Functions
function setCurrentYear() {
    document.querySelectorAll('#currentYear').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage.includes(href.replace('.html', '')) && href !== '#')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Server Status Functions
async function checkServerStatus(serverCode) {
    try {
        const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverCode}`);
        
        if (!response.ok) {
            throw new Error('Server not responding');
        }
        
        const data = await response.json();
        return {
            online: true,
            players: data.Data.clients || 0,
            maxPlayers: data.Data.sv_maxclients || 0,
            queue: data.Data.queue || 0,
            name: data.Data.hostname || 'SIMBA.RP',
            ping: data.Data.ping || 0,
            lastUpdate: new Date()
        };
    } catch (error) {
        console.error('Server status check failed:', error);
        return {
            online: false,
            players: 0,
            maxPlayers: 0,
            queue: 0,
            name: 'SIMBA.RP',
            ping: 0,
            lastUpdate: new Date()
        };
    }
}

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        showToast,
        checkServerStatus
    };
}