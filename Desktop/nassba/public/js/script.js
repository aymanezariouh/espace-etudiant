/* ==========================================
   AHAMMAR EVENT PLANNING — JAVASCRIPT
   Frontend connected to Node.js backend
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initStickyNavigation();
    initSmoothScrolling();
    initScrollAnimations();
    initAnimatedCounters();
    initContactForm();
    initScrollToTop();
    initActiveNavigation();
});


// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    if (!menuToggle || !mobileMenu) return;
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


// ==========================================
// STICKY NAVIGATION
// ==========================================
function initStickyNavigation() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    function handleScroll() {
        navbar.classList.toggle('sticky', window.scrollY > 100);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}


// ==========================================
// SMOOTH SCROLLING
// ==========================================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
            }
        });
    });
}


// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.service-card, .gallery-item, .testimonial-card, .about-box, .stat-card, .contact-item'
    );
    if (!elements.length) return;
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = Array.from(elements).indexOf(el) * 80;
                    setTimeout(() => {
                        el.classList.add('scroll-animate');
                        void el.offsetWidth;
                        el.classList.add('visible');
                    }, delay);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach(el => { el.classList.add('scroll-animate'); observer.observe(el); });
    } else {
        elements.forEach(el => el.classList.add('scroll-animate', 'visible'));
    }
}


// ==========================================
// ANIMATED COUNTERS
// ==========================================
function initAnimatedCounters() {
    const nums = document.querySelectorAll('.stat-number');
    if (!nums.length) return;
    const duration = 2000;
    const fps = 1000 / 60;
    function animate(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const frames = Math.round(duration / fps);
        let frame = 0;
        const timer = setInterval(() => {
            frame++;
            const ease = 1 - Math.pow(1 - frame / frames, 3);
            el.textContent = Math.round(ease * target);
            if (frame === frames) { clearInterval(timer); el.textContent = target; }
        }, fps);
    }
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
        }, { threshold: 0.5 });
        nums.forEach(n => obs.observe(n));
    } else {
        nums.forEach(animate);
    }
}


// ==========================================
// CONTACT FORM — CONNECTED TO BACKEND API
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput    = document.getElementById('name');
    const emailInput   = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const successMsg   = document.getElementById('formSuccess');
    const submitBtn    = form.querySelector('button[type="submit"]');

    // ── Validation rules ──
    const validators = {
        name:    v => !v.trim() ? 'Please enter your name'
                    : v.trim().length < 2 ? 'Name must be at least 2 characters' : '',
        email:   v => !v.trim() ? 'Please enter your email'
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : '',
        message: v => !v.trim() ? 'Please enter your message'
                    : v.trim().length < 10 ? 'Message must be at least 10 characters' : '',
    };

    function showError(input, errorId, msg) {
        const el = document.getElementById(errorId);
        if (el) { el.textContent = msg; el.classList.toggle('visible', !!msg); }
        if (input) input.style.borderColor = msg ? '#E74C3C' : '';
    }

    // ── Real-time validation ──
    [
        [nameInput,    'nameError',    'name'],
        [emailInput,   'emailError',   'email'],
        [messageInput, 'messageError', 'message'],
    ].forEach(([el, errId, field]) => {
        if (!el) return;
        el.addEventListener('blur', () => showError(el, errId, validators[field](el.value)));
        el.addEventListener('input', () => { if (el.value.trim()) showError(el, errId, ''); });
    });

    // ── Form submit → POST /api/contact ──
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nameErr    = validators.name(nameInput?.value || '');
        const emailErr   = validators.email(emailInput?.value || '');
        const messageErr = validators.message(messageInput?.value || '');

        showError(nameInput,    'nameError',    nameErr);
        showError(emailInput,   'emailError',   emailErr);
        showError(messageInput, 'messageError', messageErr);

        if (nameErr || emailErr || messageErr) {
            form.style.animation = 'shake 0.5s ease';
            setTimeout(() => form.style.animation = '', 500);
            return;
        }

        // Show loading state
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('i');
        submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Sending...';
        if (btnIcon) { btnIcon.className = ''; btnIcon.textContent = '⏳'; }

        try {
            const payload = {
                name:      nameInput.value.trim(),
                email:     emailInput.value.trim(),
                eventType: document.getElementById('eventType')?.value || '',
                message:   messageInput.value.trim(),
            };

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // ✅ Success
                if (successMsg) successMsg.classList.add('visible');
                form.reset();
                setTimeout(() => successMsg?.classList.remove('visible'), 6000);
            } else {
                // Server validation errors
                const errors = data.errors || [];
                errors.forEach(err => {
                    const fieldMap = { name: [nameInput, 'nameError'], email: [emailInput, 'emailError'], message: [messageInput, 'messageError'] };
                    if (fieldMap[err.field]) showError(...fieldMap[err.field], err.message);
                });
                if (!errors.length) {
                    showServerError(data.message || 'Something went wrong. Please try again.');
                }
            }

        } catch (err) {
            console.error('Network error:', err);
            showServerError('Network error. Please check your connection and try again.');
        } finally {
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Send Message';
            if (btnIcon) { btnIcon.textContent = ''; btnIcon.className = 'fas fa-paper-plane'; }
        }
    });

    function showServerError(msg) {
        let errEl = document.getElementById('serverError');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.id = 'serverError';
            errEl.style.cssText = 'color:#E74C3C;background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);padding:12px 16px;border-radius:6px;margin-top:12px;font-size:14px;';
            form.appendChild(errEl);
        }
        errEl.textContent = msg;
        errEl.style.display = 'block';
        setTimeout(() => { if (errEl) errEl.style.display = 'none'; }, 6000);
    }
}


// ==========================================
// SCROLL TO TOP
// ==========================================
function initScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


// ==========================================
// ACTIVE NAVIGATION HIGHLIGHTING
// ==========================================
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    if (!sections.length || !navLinks.length) return;
    const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
    function highlight() {
        const pos = window.scrollY + navHeight + 100;
        sections.forEach(sec => {
            if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
                const id = sec.getAttribute('id');
                navLinks.forEach(l => l.classList.remove('active'));
                mobileLinks.forEach(l => l.classList.remove('active'));
                document.querySelector(`.nav-link[href="#${id}"]`)?.classList.add('active');
                document.querySelector(`.mobile-nav-link[href="#${id}"]`)?.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', highlight, { passive: true });
    highlight();
}


// ==========================================
// INJECT ANIMATIONS
// ==========================================
(function() {
    const s = document.createElement('style');
    s.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(s);
})();
