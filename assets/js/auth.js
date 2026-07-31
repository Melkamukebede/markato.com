// ShopMart - Authentication Module

const AuthManager = {
    // Get current user from localStorage
    getCurrentUser() {
        const userData = localStorage.getItem('shopmart_user');
        return userData ? JSON.parse(userData) : null;
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    },
    
    // Save user data
    saveUser(userData) {
        localStorage.setItem('shopmart_user', JSON.stringify(userData));
    },
    
    // Logout user
    logout() {
        localStorage.removeItem('shopmart_user');
        window.location.reload();
    },
    
    // Update header UI based on login state
    updateHeaderUI() {
        const user = this.getCurrentUser();
        const accountLink = document.querySelector('.header-link');
        
        if (user && accountLink) {
            accountLink.innerHTML = `
                Hello, ${user.displayName || 'User'}
                <span class="link-title">
                    ${user.photoURL ? 
                        `<img src="${user.photoURL}" class="user-avatar me-1" style="width:24px;height:24px;border-radius:50%;">` : 
                        '<i class="bi bi-person-circle me-1"></i>'}
                    Account & Lists <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i>
                </span>
            `;
            
            // Add logout option
            accountLink.addEventListener('click', (e) => {
                if (confirm('Do you want to logout?')) {
                    this.logout();
                }
            });
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateHeaderUI();
});

// Export for use in other modules
window.AuthManager = AuthManager;
