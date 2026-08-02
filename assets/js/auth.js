// ============================================
// ShopMart - Authentication System (Day 3 - Fixed)
// Complete user management with wishlist & orders
// ============================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    async init() {
        await this.loadUsers();
        this.checkSession();
        this.updateHeaderUI();
        console.log('🔐 Auth System Initialized');
        console.log('📝 Logged in:', this.isLoggedIn() ? 'Yes' : 'No');
    }

    async loadUsers() {
        try {
            const response = await fetch('data/users.json');
            if (!response.ok) throw new Error('Failed to load users');
            const data = await response.json();
            this.users = data.users;
            console.log(`👥 Loaded ${this.users.length} users`);
        } catch (error) {
            console.warn('Could not load users.json, using demo data');
            this.users = [
                {
                    id: 'user_demo',
                    email: 'demo@shopmart.com',
                    password: 'demo123',
                    displayName: 'Demo User',
                    avatar: null,
                    phone: '',
                    address: '',
                    joinedDate: new Date().toISOString(),
                    orders: [],
                    wishlist: []
                }
            ];
        }
    }

// Update checkSession to be more robust
checkSession() {
    const sessionData = localStorage.getItem('shopmart_session');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            const now = new Date().getTime();
            const sessionAge = now - (session.timestamp || 0);
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days instead of 24 hours

            if (sessionAge < maxAge && session.user) {
                this.currentUser = session.user;
                console.log('👤 Session restored for:', this.currentUser.displayName);
                return true;
            } else {
                // Session expired
                this.logout(true);
                console.log('⏰ Session expired');
                return false;
            }
        } catch (error) {
            console.error('Session parse error:', error);
            this.logout(true);
            return false;
        }
    }
    return false;
}
            // Add this method right after checkSession()
isReady() {
    return this.users.length > 0;
} 

    async login(email, password) {
        try {
            const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                throw new Error('No account found with this email address');
            }

            if (user.password !== password) {
                throw new Error('Incorrect password');
            }

            // 🆕 Merge localStorage wishlist with user wishlist
            const localWishlist = JSON.parse(localStorage.getItem('shopmart_wishlist') || '[]');
            const mergedWishlist = [...new Set([...user.wishlist, ...localWishlist])];

            const userData = {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar || null,
                phone: user.phone || '',
                address: user.address || '',
                joinedDate: user.joinedDate,
                wishlist: mergedWishlist,
                orders: JSON.parse(localStorage.getItem('shopmart_orders') || '[]')
            };

            this.currentUser = userData;
            this.saveSession(userData);
            this.updateHeaderUI();
            
            // Sync localStorage
            localStorage.setItem('shopmart_wishlist', JSON.stringify(mergedWishlist));

            return {
                success: true,
                message: `Welcome back, ${userData.displayName}!`,
                user: userData
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async signup(userData) {
        try {
            if (!this.isValidEmail(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            const existingUser = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
            if (existingUser) {
                throw new Error('An account with this email already exists');
            }

            if (userData.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // 🆕 Get existing localStorage data
            const existingWishlist = JSON.parse(localStorage.getItem('shopmart_wishlist') || '[]');
            const existingOrders = JSON.parse(localStorage.getItem('shopmart_orders') || '[]');
            const existingCart = JSON.parse(localStorage.getItem('shopmart_cart') || '[]');

            const newUser = {
                id: 'user_' + Date.now(),
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName || userData.email.split('@')[0],
                phone: userData.phone || '',
                address: userData.address || '',
                avatar: null,
                joinedDate: new Date().toISOString().split('T')[0],
                orders: existingOrders,
                wishlist: existingWishlist
            };

            this.users.push(newUser);

            const loginData = {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.displayName,
                avatar: null,
                phone: newUser.phone,
                address: newUser.address,
                joinedDate: newUser.joinedDate,
                wishlist: existingWishlist,
                orders: existingOrders
            };

            this.currentUser = loginData;
            this.saveSession(loginData);
            this.updateHeaderUI();

            return {
                success: true,
                message: `Welcome to ShopMart, ${newUser.displayName}!`,
                user: loginData
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // 🆕 Add to wishlist
    addToWishlist(productId) {
        if (!this.currentUser) return false;
        
        if (!this.currentUser.wishlist) {
            this.currentUser.wishlist = [];
        }
        
        if (!this.currentUser.wishlist.includes(productId)) {
            this.currentUser.wishlist.push(productId);
            this.saveSession(this.currentUser);
            localStorage.setItem('shopmart_wishlist', JSON.stringify(this.currentUser.wishlist));
            return true;
        }
        return false;
    }

    // 🆕 Remove from wishlist
    removeFromWishlist(productId) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.wishlist) {
            this.currentUser.wishlist = this.currentUser.wishlist.filter(id => id !== productId);
            this.saveSession(this.currentUser);
            localStorage.setItem('shopmart_wishlist', JSON.stringify(this.currentUser.wishlist));
            return true;
        }
        return false;
    }

    // 🆕 Get wishlist
    getWishlist() {
        return this.currentUser ? (this.currentUser.wishlist || []) : [];
    }

    // 🆕 Add order
    addOrder(orderData) {
        if (!this.currentUser) return false;
        
        if (!this.currentUser.orders) {
            this.currentUser.orders = [];
        }
        
        const order = {
            id: 'ORD' + Date.now(),
            date: new Date().toISOString(),
            items: orderData.items,
            total: orderData.total,
            status: 'Processing'
        };
        
        this.currentUser.orders.unshift(order);
        this.saveSession(this.currentUser);
        localStorage.setItem('shopmart_orders', JSON.stringify(this.currentUser.orders));
        return order;
    }

    // 🆕 Get orders
    getOrders() {
        return this.currentUser ? (this.currentUser.orders || []) : [];
    }

    async socialLogin(provider) {
        const existingWishlist = JSON.parse(localStorage.getItem('shopmart_wishlist') || '[]');
        
        const demoUser = {
            id: 'social_' + Date.now(),
            email: `demo@${provider.toLowerCase()}.com`,
            displayName: `${provider} User`,
            avatar: this.getProviderIcon(provider),
            phone: '',
            address: '',
            joinedDate: new Date().toISOString().split('T')[0],
            wishlist: existingWishlist,
            orders: []
        };

        this.currentUser = demoUser;
        this.saveSession(demoUser);
        this.updateHeaderUI();

        return {
            success: true,
            message: `Welcome, ${demoUser.displayName}!`,
            user: demoUser
        };
    }

    logout(silent = false) {
        this.currentUser = null;
        localStorage.removeItem('shopmart_session');
        this.updateHeaderUI();
        
        if (!silent) {
            alert('You have been logged out successfully.');
            window.location.href = 'index.html';
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    saveSession(userData) {
        const session = {
            user: userData,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('shopmart_session', JSON.stringify(session));
    }

    updateProfile(updates) {
        if (!this.currentUser) return false;

        Object.assign(this.currentUser, updates);
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            Object.assign(this.users[userIndex], updates);
        }

        this.saveSession(this.currentUser);
        this.updateHeaderUI();

        return true;
    }

    syncWishlist(wishlistItems) {
        if (wishlistItems && wishlistItems.length > 0) {
            localStorage.setItem('shopmart_wishlist', JSON.stringify(wishlistItems));
        }
    }

    updateHeaderUI() {
        const accountLinks = document.querySelectorAll('.header-link');
        
        accountLinks.forEach(link => {
            if (link.querySelector('.link-title') && 
                (link.textContent.includes('Account') || link.textContent.includes('Sign In'))) {
                
                if (this.currentUser) {
                    const avatar = this.currentUser.avatar 
                        ? `<img src="${this.currentUser.avatar}" style="width:24px;height:24px;border-radius:50%;margin-right:4px;vertical-align:middle;">` 
                        : '<i class="bi bi-person-circle me-1"></i>';
                    
                    link.innerHTML = `
                        Hello, ${this.currentUser.displayName.split(' ')[0]}
                        <span class="link-title">
                            ${avatar}
                            Account & Lists 
                            <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i>
                        </span>
                    `;
                    link.href = 'pages/account.html';
                    link.onclick = null;
                    
                    this.createAccountDropdown(link);
                } else {
                    link.innerHTML = `
                        Hello, Sign in
                        <span class="link-title">Account & Lists <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i></span>
                    `;
                    link.href = 'pages/login.html';
                    link.onclick = null;
                }
            }
        });
    }

    createAccountDropdown(linkElement) {
        const existingDropdown = document.querySelector('.account-dropdown');
        if (existingDropdown) existingDropdown.remove();

        const dropdown = document.createElement('div');
        dropdown.className = 'account-dropdown';
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            min-width: 200px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            border-radius: 8px;
            z-index: 1000;
            padding: 8px 0;
        `;

        dropdown.innerHTML = `
            <div style="padding: 12px 16px; border-bottom: 1px solid #eee;">
                <strong>${this.currentUser.displayName}</strong>
                <br>
                <small class="text-muted">${this.currentUser.email}</small>
            </div>
            <a href="pages/account.html" class="dropdown-item" style="display:block;padding:8px 16px;color:#333;text-decoration:none;">
                <i class="bi bi-person me-2"></i> Your Account
            </a>
            <a href="pages/account.html#orders" class="dropdown-item" style="display:block;padding:8px 16px;color:#333;text-decoration:none;">
                <i class="bi bi-box me-2"></i> Your Orders
            </a>
            <a href="#" class="dropdown-item" style="display:block;padding:8px 16px;color:#333;text-decoration:none;" onclick="event.preventDefault(); window.location.href='pages/account.html#wishlist'">
                <i class="bi bi-heart me-2"></i> Wishlist
            </a>
            <div style="border-top: 1px solid #eee; margin-top: 8px; padding-top: 8px;">
                <a href="#" class="dropdown-item text-danger" style="display:block;padding:8px 16px;text-decoration:none;" onclick="event.preventDefault(); authSystem.logout();">
                    <i class="bi bi-box-arrow-right me-2"></i> Sign Out
                </a>
            </div>
        `;

        linkElement.parentElement.style.position = 'relative';
        linkElement.parentElement.appendChild(dropdown);

        linkElement.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (!linkElement.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    requireAuth(redirectUrl = 'pages/login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getProviderIcon(provider) {
        const icons = {
            'Google': 'https://img.icons8.com/color/48/google-logo.png',
            'Facebook': 'https://img.icons8.com/color/48/facebook.png',
            'GitHub': 'https://img.icons8.com/ios-glyphs/48/github.png',
            'Microsoft': 'https://img.icons8.com/color/48/microsoft.png',
            'Twitter': 'https://img.icons8.com/color/48/twitter.png'
        };
        return icons[provider] || null;
    }

    async forgotPassword(email) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return {
                success: false,
                message: 'No account found with this email address'
            };
        }
        
        return {
            success: true,
            message: `Password reset link sent to ${email}. (Demo: password is "${user.password}")`
        };
    }
}

// Create global auth instance
const authSystem = new AuthSystem();

// Export for use in other modules
window.authSystem = authSystem;
