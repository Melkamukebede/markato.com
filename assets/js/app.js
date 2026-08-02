
// Day 2: Cart, dynamic products, wishlist, modal

(function() {
    // PRODUCT DATA  
    const products = [
        { id: 1, name: 'Wireless Bluetooth Headphones Pro', category: 'electronics', price: 79.99, mrp: 129.99, rating: 4.5, reviews: 2847, prime: true, image: 'https://picsum.photos/seed/headphones/400/400', desc: 'Premium noise-cancelling wireless headphones with 40-hour battery life.' },
        { id: 2, name: '4K Ultra HD Smart TV 55"', category: 'electronics', price: 599.99, mrp: 849.99, rating: 4.7, reviews: 1523, prime: true, image: 'https://picsum.photos/seed/smarttv/400/400', desc: 'Stunning 4K with HDR10+, built-in apps.' },
        { id: 3, name: 'Laptop Pro 15.6" 16GB RAM', category: 'electronics', price: 1299.99, mrp: 1699.99, rating: 4.8, reviews: 987, prime: false, image: 'https://picsum.photos/seed/laptop/400/400', desc: 'Powerful laptop with retina display, 512GB SSD.' },
        { id: 4, name: 'Smartphone X Pro 5G', category: 'electronics', price: 899.99, mrp: 1099.99, rating: 4.6, reviews: 3456, prime: true, image: 'https://picsum.photos/seed/smartphone/400/400', desc: '108MP camera, 120Hz AMOLED.' },
        { id: 5, name: 'Wireless Charging Pad Fast', category: 'electronics', price: 29.99, mrp: 44.99, rating: 4.3, reviews: 5678, prime: false, image: 'https://picsum.photos/seed/charger/400/400', desc: 'Qi-compatible fast charging pad.' },
        { id: 6, name: "Men's Classic Fit Polo Shirt", category: 'clothing', price: 34.99, mrp: 59.99, rating: 4.4, reviews: 1234, prime: true, image: 'https://picsum.photos/seed/poloshirt/400/400', desc: 'Premium cotton, multiple colors.' },
        { id: 7, name: "Women's Running Shoes Ultra", category: 'clothing', price: 89.99, mrp: 139.99, rating: 4.6, reviews: 2100, prime: true, image: 'https://picsum.photos/seed/runningshoes/400/400', desc: 'Lightweight with responsive cushioning.' },
        { id: 8, name: 'Winter Jacket Insulated Parka', category: 'clothing', price: 129.99, mrp: 199.99, rating: 4.7, reviews: 876, prime: true, image: 'https://picsum.photos/seed/winterjacket/400/400', desc: 'Water-resistant, fleece lining.' },
        { id: 9, name: 'Casual Denim Jeans Slim Fit', category: 'clothing', price: 49.99, mrp: 79.99, rating: 4.3, reviews: 3456, prime: false, image: 'https://picsum.photos/seed/jeans/400/400', desc: 'Stretch comfort, classic style.' },
        { id: 10, name: 'Robot Vacuum Cleaner Smart', category: 'home-kitchen', price: 349.99, mrp: 499.99, rating: 4.5, reviews: 4321, prime: true, image: 'https://picsum.photos/seed/robotvacuum/400/400', desc: 'LiDAR navigation, auto-empty dock.' },
        { id: 11, name: 'Stainless Steel Cookware Set 10-Piece', category: 'home-kitchen', price: 159.99, mrp: 249.99, rating: 4.8, reviews: 1890, prime: true, image: 'https://picsum.photos/seed/cookware/400/400', desc: 'Tri-ply professional set.' },
        { id: 12, name: 'Coffee Maker Machine 12-Cup', category: 'home-kitchen', price: 79.99, mrp: 119.99, rating: 4.4, reviews: 2678, prime: true, image: 'https://picsum.photos/seed/coffeemaker/400/400', desc: 'Programmable with grinder.' },
        { id: 13, name: 'Air Fryer 5.8QT Digital', category: 'home-kitchen', price: 89.99, mrp: 139.99, rating: 4.6, reviews: 5432, prime: true, image: 'https://picsum.photos/seed/airfryer/400/400', desc: '8 presets, rapid air circulation.' },
        { id: 14, name: 'Best Seller Novel 2024 Edition', category: 'books', price: 14.99, mrp: 24.99, rating: 4.9, reviews: 8901, prime: true, image: 'https://picsum.photos/seed/novel/400/400', desc: '#1 New York Times bestseller.' },
        { id: 15, name: 'Complete Programming Guide 2024', category: 'books', price: 39.99, mrp: 59.99, rating: 4.7, reviews: 3456, prime: false, image: 'https://picsum.photos/seed/progbook/400/400', desc: 'Python, JavaScript, and more.' },
        { id: 16, name: 'Gourmet Cookbook Collection', category: 'books', price: 24.99, mrp: 39.99, rating: 4.5, reviews: 2100, prime: true, image: 'https://picsum.photos/seed/cookbook/400/400', desc: '200+ recipes.' },
        { id: 17, name: 'Vitamin C Facial Serum', category: 'beauty', price: 28.99, mrp: 44.99, rating: 4.6, reviews: 6543, prime: true, image: 'https://picsum.photos/seed/serum/400/400', desc: 'Hyaluronic acid, brightening.' },
        { id: 18, name: 'Electric Toothbrush Sonic', category: 'beauty', price: 49.99, mrp: 79.99, rating: 4.4, reviews: 4321, prime: true, image: 'https://picsum.photos/seed/toothbrush/400/400', desc: '5 modes, 2-minute timer.' },
        { id: 19, name: 'Professional Hair Dryer 2200W', category: 'beauty', price: 59.99, mrp: 94.99, rating: 4.5, reviews: 3210, prime: false, image: 'https://picsum.photos/seed/hairdryer/400/400', desc: 'Ionic technology, 3 heat settings.' },
        { id: 20, name: 'Smart Watch Fitness Tracker', category: 'electronics', price: 199.99, mrp: 279.99, rating: 4.6, reviews: 7890, prime: true, image: 'https://picsum.photos/seed/smartwatch/400/400', desc: 'GPS, heart rate, 7-day battery.' }
    ];

    //STATE
    let cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('shopmart_wishlist')) || [];
    let currentCategory = 'all';
    let currentSearch = '';
    let currentModalProductId = null;

    //DOM ELEMENTS
    const productGrid = document.getElementById('productGrid');
    const cartBadge = document.getElementById('cartBadge');
    const cartBody = document.getElementById('cartBody');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const noResults = document.getElementById('noResults');
    const toastContainer = document.getElementById('toastContainer');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalAddToCart = document.getElementById('modalAddToCart');
    const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));

    // RENDER PRODUCT
    function getFilteredProducts() {
        let filtered = products.filter(p => {
            const matchCategory = currentCategory === 'all' || p.category === currentCategory;
            const query = currentSearch.toLowerCase().trim();
            const matchSearch = !query || p.name.toLowerCase().includes(query) || p.category.includes(query) || p.desc.toLowerCase().includes(query);
            return matchCategory && matchSearch;
        });
        return filtered;
    }

    function generateStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        let html = '';
        for (let i = 0; i < full; i++) html += '<i class="bi bi-star-fill"></i>';
        if (half) html += '<i class="bi bi-star-half"></i>';
        for (let i = 0; i < empty; i++) html += '<i class="bi bi-star"></i>';
        return html;
    }

    function renderProducts() {
        const filtered = getFilteredProducts();
        if (filtered.length === 0) {
            productGrid.innerHTML = '';
            noResults.classList.remove('d-none');
        } else {
            noResults.classList.add('d-none');
            productGrid.innerHTML = filtered.map(p => {
                const savings = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
                const isLiked = wishlist.includes(p.id);
                return `
                <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                    <div class="product-card" data-product-id="${p.id}">
                        <div class="img-wrapper">
                            ${p.prime ? '<span class="prime-badge">PRIME</span>' : ''}
                            <span class="wishlist-icon ${isLiked ? 'liked' : ''}" data-wishlist="${p.id}">
                                <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                            </span>
                            ${savings > 0 ? `<span class="discount-badge">-${savings}%</span>` : ''}
                            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/f7f7f7/888?text=No+Image'">
                        </div>
                        <div class="card-body">
                            <div class="product-title">${p.name}</div>
                            <div class="rating">${generateStars(p.rating)} <span class="count">${p.reviews.toLocaleString()}</span></div>
                            <div class="price-wrapper">
                                <span class="price">$${p.price.toFixed(2)}</span>
                                ${savings > 0 ? `<span class="mrp">$${p.mrp.toFixed(2)}</span>` : ''}
                            </div>
                            <button class="btn-add-cart" data-add-cart="${p.id}"><i class="bi bi-cart-plus me-1"></i> Add to Cart</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
        attachProductEvents();
    }

    function attachProductEvents() {
        // Add to cart
        document.querySelectorAll('[data-add-cart]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.addCart);
                addToCart(id);
            });
        });
        // Wishlist
        document.querySelectorAll('[data-wishlist]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.wishlist);
                toggleWishlist(id);
            });
        });
        // Open modal on card click
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('[data-add-cart]') || e.target.closest('[data-wishlist]')) return;
                const id = parseInt(card.dataset.productId);
                openProductModal(id);
            });
        });
    }

    // ========== CART LOGIC ==========
    function addToCart(productId) {
        const existing = cart.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ productId, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        showToast('✅ Item added to cart');
        animateCartBadge();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.productId !== productId);
        saveCart();
        updateCartUI();
        showToast('🗑️ Item removed');
    }

    function updateQuantity(productId, delta) {
        const item = cart.find(item => item.productId === productId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCart();
        updateCartUI();
    }

    function getCartTotal() {
        return cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function saveCart() {
        localStorage.setItem('shopmart_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        const count = getCartCount();
        cartBadge.textContent = count;
        renderCartItems();
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="empty-cart-msg flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-cart-x"></i>
                    <h5>Your cart is empty</h5>
                    <p class="text-muted">Add items to get started</p>
                    <button class="btn btn-outline-dark rounded-pill px-4" onclick="document.querySelector('#cartOffcanvas .btn-close').click()">Continue Shopping</button>
                </div>`;
        } else {
            let html = '<div class="flex-grow-1 overflow-auto">';
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return;
                const itemTotal = (product.price * item.quantity).toFixed(2);
                html += `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/70/f7f7f7/888?text=N/A'">
                    <div class="item-details">
                        <div class="item-title">${product.name}</div>
                        <div class="item-price">$${itemTotal}</div>
                        <small class="text-muted">$${product.price.toFixed(2)} each</small>
                        <div class="qty-control">
                            <button onclick="window.cartUpdateQty(${product.id}, -1)">−</button>
                            <span>${item.quantity}</span>
                            <button onclick="window.cartUpdateQty(${product.id}, 1)">+</button>
                        </div>
                        <button class="btn-remove" onclick="window.cartRemove(${product.id})"><i class="bi bi-trash3 me-1"></i>Remove</button>
                    </div>
                </div>`;
            });
            html += '</div>';
            html += `
                <div class="mt-auto">
                    <div class="cart-subtotal">Subtotal: <span style="color:var(--amazon-red)">$${getCartTotal().toFixed(2)}</span></div>
                    <button class="btn-checkout" onclick="alert('Checkout will be implemented on Day 4!')">Proceed to Checkout</button>
                </div>`;
            cartBody.innerHTML = html;
        }
    }

    function animateCartBadge() {
        cartBadge.style.transform = 'scale(1.4)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
    }

    // Expose to global scope for cart item controls (used in onclick)
    window.cartUpdateQty = (id, delta) => updateQuantity(id, delta);
    window.cartRemove = (id) => removeFromCart(id);

    // ========== WISHLIST =======
function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    let message = '';
    
    if (idx > -1) {
        wishlist.splice(idx, 1);
        message = ' Removed from wishlist';
        // 🆕 Sync with auth system
        if (window.authSystem && authSystem.isLoggedIn()) {
            authSystem.removeFromWishlist(productId);
        }
    } else {
        wishlist.push(productId);
        message = ' Added to wishlist';
        // 🆕 Sync with auth system
        if (window.authSystem && authSystem.isLoggedIn()) {
            authSystem.addToWishlist(productId);
        }
    }
    
    localStorage.setItem('shopmart_wishlist', JSON.stringify(wishlist));
    renderProducts();
    showToast(message);
}

    // ========== PRODUCT MODAL ==========
    function openProductModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        currentModalProductId = productId;
        modalTitle.textContent = product.name;
        const savings = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
        modalBody.innerHTML = `
            <div class="row g-4">
                <div class="col-md-5 text-center">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid rounded-3" style="max-height:350px;object-fit:contain;background:#f9f9f9;padding:10px;">
                    ${product.prime ? '<span class="badge bg-info mt-2">PRIME Eligible</span>' : ''}
                </div>
                <div class="col-md-7">
                    <h5>${product.name}</h5>
                    <div class="rating mb-2">${generateStars(product.rating)} <span class="text-primary">(${product.reviews.toLocaleString()} reviews)</span></div>
                    <p class="text-muted">${product.desc}</p>
                    <div class="detail-price" style="font-size:1.8rem;font-weight:700;color:#b12704;">$${product.price.toFixed(2)}</div>
                    ${savings > 0 ? `<span class="text-decoration-line-through text-muted">$${product.mrp.toFixed(2)}</span> <span class="text-danger fw-bold">Save ${savings}%</span>` : ''}
                    <p class="mt-3"><span class="badge bg-secondary">${product.category.replace('-', ' & ')}</span></p>
                </div>
            </div>`;
        modalAddToCart.onclick = () => {
            addToCart(currentModalProductId);
            productModal.hide();
        };
        productModal.show();
    }

    // ========== FILTERING ==========
    function applyFilters() {
        currentSearch = searchInput.value;
        currentCategory = searchCategory.value;
        renderProducts();
        // Update active category link
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.category === currentCategory) link.classList.add('active');
        });
    }

    searchInput.addEventListener('input', applyFilters);
    searchCategory.addEventListener('change', applyFilters);
    document.getElementById('searchBtn').addEventListener('click', applyFilters);

    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        searchInput.value = '';
        searchCategory.value = 'all';
        currentCategory = 'all';
        currentSearch = '';
        renderProducts();
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        document.querySelector('.category-link[data-category="all"]').classList.add('active');
    });

    // Category links in sub nav
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategory = link.dataset.category;
            searchInput.value = '';
            currentSearch = '';
            searchCategory.value = currentCategory;
            renderProducts();
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
// 🆕 Place order function (add to app.js)
function placeOrder() {
    if (!window.authSystem || !authSystem.isLoggedIn()) {
        alert('Please login to place an order');
        window.location.href = 'pages/login.html';
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const orderItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            productId: item.productId,
            name: product ? product.name : 'Unknown Product',
            price: product ? product.price : 0,
            quantity: item.quantity
        };
    });
    
    const total = getCartTotal();
    
    const order = authSystem.addOrder({
        items: orderItems,
        total: total
    });
    
    if (order) {
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        renderCartItems();
        
        // Close cart offcanvas if open
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
        if (offcanvas) offcanvas.hide();
        
        showToast('🎉 Order placed successfully!');
        
        // Redirect to orders page
        setTimeout(() => {
            window.location.href = 'pages/account.html#orders';
        }, 1500);
    }
}

// Update the checkout button in renderCartItems()
// Find: <button class="btn-checkout" onclick="alert('Checkout will be implemented on Day 4!')">
// Replace with:
// <button class="btn-checkout" onclick="placeOrder()">Proceed to Checkout</button>
    // ========== TOAST NOTIFICATIONS ==========
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-custom';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 2200);
    }

    // ========== CART TOGGLE ==========
    document.getElementById('cartToggleBtn').addEventListener('click', () => {
        cartOffcanvas.toggle();
        renderCartItems();
    });

    // ========== INITIAL RENDER ==========
    renderProducts();
    updateCartUI();
})();
