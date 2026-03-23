/**
 * SHINE Authentication Logic
 * Uses localStorage to persist user data (since this is a static project).
 */

const AUTH_CONFIG = {
    USERS_KEY: 'shine_users',
    CURRENT_USER_KEY: 'shine_current_user'
};

/**
 * Initialize the authentication state on every page load.
 */
function initAuth() {
    const currentUser = JSON.parse(localStorage.getItem(AUTH_CONFIG.CURRENT_USER_KEY));
    updateNavigation(currentUser);
    updateCartCount();
    // Removed separate profile section update - now handled by drawer
}

/**
 * Updates the cart count in the navigation.
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('shine_cart') || '[]');
    const count = cart.length;
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.innerText = `Cart (${count})`;
    });
}

/**
 * Adds a product to the persistent cart.
 */
function addToCart(name, price, image, size = 'Standard Size') {
    const cart = JSON.parse(localStorage.getItem('shine_cart') || '[]');
    const id = Date.now();
    cart.push({ id, name, price, image, size, qty: 1, checked: true });
    localStorage.setItem('shine_cart', JSON.stringify(cart));
    
    updateCartCount();
    
    // Visual feedback
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; 
        background: var(--color-gold); color: white; 
        padding: 1rem 2rem; border-radius: 50px; 
        z-index: 3000; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        animation: fadeUp 0.5s ease;
    `;
    toast.innerText = `${name} added to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Updates the navigation bar to reflect the user's authentication status.
 * @param {Object|null} user The current user object or null.
 */
function updateNavigation(user) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (user) {
        // User is logged in - showing Profile Icon instead of text
        navActions.innerHTML = `
            <div class="user-menu">
                <a href="cart-orders.html" class="cart-btn">Cart</a>
                <div class="profile-icon-wrapper" id="profile-icon">
                    <svg viewBox="0 0 24 24" class="profile-icon-svg">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
            </div>
            <div id="profile-drawer" class="profile-drawer">
                <div class="drawer-header">
                    <h3>Your Profile</h3>
                    <span class="close-drawer" id="close-drawer">&times;</span>
                </div>
                <div class="drawer-content">
                    <div class="user-info">
                        <div class="info-group">
                            <label>Name</label>
                            <p>${user.name}</p>
                        </div>
                        <div class="info-group">
                            <label>Email</label>
                            <p>${user.email}</p>
                        </div>
                        <div class="info-group">
                            <label>Phone</label>
                            <p>${user.phone || 'Not provided'}</p>
                        </div>
                    </div>
                    <div class="orders-preview">
                        <label>Recent Orders</label>
                        <div class="order-item-mini">
                            <span>Order #SH-8492</span>
                            <span class="order-status">Processing</span>
                        </div>
                        <a href="cart-orders.html" class="view-all-orders">View All Orders</a>
                    </div>
                    <button id="logout-btn" class="btn-secondary logout-btn-drawer">Logout</button>
                </div>
            </div>
            <div id="drawer-overlay" class="drawer-overlay"></div>
        `;

        document.getElementById('profile-icon').addEventListener('click', toggleProfileDrawer);
        document.getElementById('close-drawer').addEventListener('click', toggleProfileDrawer);
        document.getElementById('drawer-overlay').addEventListener('click', toggleProfileDrawer);
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            signOut();
        });
    } else {
        // User is not logged in
        navActions.innerHTML = `
            <a href="login.html" class="login-link">Login / Sign Up</a>
            <a href="cart-orders.html" class="cart-btn">Cart (2)</a>
        `;
    }
}

/**
 * Toggles the profile drawer visibility.
 */
function toggleProfileDrawer() {
    const drawer = document.getElementById('profile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

/**
 * Sign Up a new user.
 * @param {string} name 
 * @param {string} email 
 * @param {string} phone
 * @param {string} password 
 * @returns {Object} { success: boolean, message: string }
 */
function signUp(name, email, phone, password) {
    const users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY) || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered.' };
    }

    const newUser = { name, email, phone, password };
    users.push(newUser);
    localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
    
    // Automatically log in after sign up
    signIn(email, password);
    
    return { success: true, message: 'Account created successfully!' };
}

/**
 * Sign In an existing user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { success: boolean, message: string }
 */
function signIn(email, password) {
    const users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem(AUTH_CONFIG.CURRENT_USER_KEY, JSON.stringify({ 
            name: user.name, 
            email: user.email,
            phone: user.phone || ''
        }));
        window.location.href = 'index.html'; // Redirect to home
        return { success: true, message: 'Signed in successfully!' };
    } else {
        return { success: false, message: 'Invalid email or password.' };
    }
}

/**
 * Sign Out the current user.
 */
function signOut() {
    localStorage.removeItem(AUTH_CONFIG.CURRENT_USER_KEY);
    window.location.reload();
}

// Automatically initialize auth on every script execution
document.addEventListener('DOMContentLoaded', initAuth);
