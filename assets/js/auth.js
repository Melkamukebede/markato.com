/**
 * Merkato Auth Module
 * Handles: login, signup, session persistence, and header UI updates.
 * Uses localStorage key: 'shopmart_user' = { name, email, phone }
 */

(function () {
    'use strict';

    /* ─── Constants ─────────────────────────────────────── */
    const USER_KEY   = 'shopmart_user';
    const DEMO_EMAIL = 'demo@shopmart.com';
    const DEMO_PASS  = 'demo123';

    /* ─── Helpers ───────────────────────────────────────── */
    function getUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); }
        catch { return null; }
    }

    function setUser(u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
    }

    function clearUser() {
        localStorage.removeItem(USER_KEY);
    }

    function isOnPage(name) {
        return window.location.pathname.includes(name);
    }

    /* ─── Header Update ─────────────────────────────────── */
    /**
     * Call this on every page load.
     * If logged in: update "Hello, Guest" → "Hello, Name"
     *               "Account & Lists"     → links to account.html
     *               "Returns & Orders"    → links to orders.html
     * If logged out: show login link (default).
     */
    function updateHeader() {
        const user = getUser();

        // Determine path prefix (root vs pages/ subfolder)
        const inPages = window.location.pathname.includes('/pages/');
        const prefix  = inPages ? '' : 'pages/';

        /* --- Account link element --- */
        const accountLink = document.querySelector('a[href*="login.html"], a[href*="account.html"]');
        /* --- Orders link element --- */
        const ordersLink = document.querySelector('a[href*="Orders"], a[href*="orders.html"], .header-link:not([href*="login"])');

        if (user) {
            const firstName = (user.name || 'User').split(' ')[0];

            // Update account link
            if (accountLink) {
                accountLink.href = prefix + 'account.html';
                accountLink.innerHTML = `
                    Hello, ${escapeHtml(firstName)}
                    <span class="link-title">Account &amp; Lists <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i></span>
                `;
            }

            // Update orders link — it's the sibling "Returns & Orders" anchor
            const allHeaderLinks = document.querySelectorAll('.header-link, a.header-link');
            allHeaderLinks.forEach(el => {
                if (el.textContent.includes('Orders') || el.textContent.includes('Returns')) {
                    el.href = prefix + 'orders.html';
                }
            });

        } else {
            // Ensure account link points back to login
            if (accountLink && !accountLink.href.includes('login.html')) {
                accountLink.href = prefix + 'login.html';
                accountLink.innerHTML = `
                    Hello, Guest
                    <span class="link-title">Account &amp; Lists <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i></span>
                `;
            }
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    /* ─── Login Page Logic ──────────────────────────────── */
    function initLoginPage() {
        const form     = document.getElementById('loginForm');
        const emailEl  = document.getElementById('loginEmail');
        const passEl   = document.getElementById('loginPassword');
        const errEl    = document.getElementById('loginError');

        if (!form) return;

        // If already logged in, skip login page
        if (getUser()) {
            window.location.href = 'account.html';
            return;
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = emailEl.value.trim();
            const pass  = passEl.value;

            if (!email || !pass) {
                showError(errEl, 'Please fill in all fields.');
                return;
            }

            // Check demo credentials
            if (email === DEMO_EMAIL && pass === DEMO_PASS) {
                setUser({ name: 'Demo User', email: DEMO_EMAIL });
                redirectAfterAuth();
                return;
            }

            // Check stored registered users
            const users = JSON.parse(localStorage.getItem('shopmart_users') || '[]');
            const match = users.find(u => u.email === email && u.password === pass);
            if (match) {
                setUser({ name: match.name, email: match.email, phone: match.phone || '' });
                redirectAfterAuth();
            } else {
                showError(errEl, 'Incorrect email or password. <a href="forgot-password.html">Forgot password?</a>');
            }
        });
    }

    /* ─── Signup Page Logic ─────────────────────────────── */
    function initSignupPage() {
        const form     = document.getElementById('signupForm');
        const nameEl   = document.getElementById('signupName');
        const emailEl  = document.getElementById('signupEmail');
        const phoneEl  = document.getElementById('signupPhone');
        const passEl   = document.getElementById('signupPassword');
        const pass2El  = document.getElementById('signupPassword2');
        const errEl    = document.getElementById('signupError');

        if (!form) return;

        if (getUser()) {
            window.location.href = 'account.html';
            return;
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name  = nameEl ? nameEl.value.trim() : '';
            const email = emailEl ? emailEl.value.trim() : '';
            const phone = phoneEl ? phoneEl.value.trim() : '';
            const pass  = passEl ? passEl.value : '';
            const pass2 = pass2El ? pass2El.value : '';

            if (!name || !email || !pass) {
                showError(errEl, 'Please fill in all required fields.');
                return;
            }
            if (pass.length < 6) {
                showError(errEl, 'Password must be at least 6 characters.');
                return;
            }
            if (pass !== pass2) {
                showError(errEl, 'Passwords do not match.');
                return;
            }

            // Check duplicate email
            const users = JSON.parse(localStorage.getItem('shopmart_users') || '[]');
            if (users.find(u => u.email === email)) {
                showError(errEl, 'An account with that email already exists. <a href="login.html">Sign in</a>');
                return;
            }

            // Store new user
            users.push({ name, email, phone, password: pass });
            localStorage.setItem('shopmart_users', JSON.stringify(users));

            // Log them in immediately
            setUser({ name, email, phone });
            redirectAfterAuth();
        });
    }

    /* ─── Redirect after successful auth ───────────────── */
    function redirectAfterAuth() {
        const params   = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
            window.location.href = redirect;
        } else {
            window.location.href = 'account.html';
        }
    }

    /* ─── Error display helper ──────────────────────────── */
    function showError(el, msg) {
        if (!el) return;
        el.innerHTML = `<div class="alert alert-danger py-2 mb-0" role="alert">${msg}</div>`;
    }

    /* ─── Sign-out global helper ────────────────────────── */
    window.shopMartSignOut = function () {
        clearUser();
        window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    };

    /* ─── Bootstrap ─────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        updateHeader();

        if (isOnPage('login.html'))  initLoginPage();
        if (isOnPage('signup.html')) initSignupPage();
    });

})();
