/**
 * SHINE Authentication Logic
 * Uses localStorage to persist user data (since this is a static project).
 */

const AUTH_CONFIG = {
    USERS_KEY: 'shine_users',
    CURRENT_USER_KEY: 'shine_current_user'
};

// --- GATEKEEPER START ---
(function() {
    const user = localStorage.getItem(AUTH_CONFIG.CURRENT_USER_KEY);
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('signup.html');
    
    if (!user && !isAuthPage) {
        window.location.href = 'login.html';
    }
})();
// --- GATEKEEPER END ---

/**
 * Initialize the authentication state on every page load.
 */
function initAuth() {
    const currentUser = JSON.parse(localStorage.getItem(AUTH_CONFIG.CURRENT_USER_KEY));
    updateNavigation(currentUser);
    updateCartCount();
    initTicker();

    // Royal Welcome Check
    if (localStorage.getItem('show_welcome_modal') === 'true' && currentUser) {
        showWelcomeModal(currentUser.name);
        localStorage.removeItem('show_welcome_modal');
    }
}

/**
 * Announcement Bar Ticker Logic
 */
function initTicker() {
    const bar = document.querySelector('.announcement-bar');
    const widgets = document.querySelectorAll('.announcement-widget');
    if (widgets.length === 0 || !bar) return;

    let currentIndex = 0;
    let timer;
    
    // Set initial active
    widgets[0].classList.add('active');

    function showWidget(index) {
        widgets.forEach(w => w.classList.remove('active'));
        currentIndex = (index + widgets.length) % widgets.length;
        widgets[currentIndex].classList.add('active');
        
        // Reset timer if manual move
        stopTimer();
        startTimer();
    }

    function startTimer() {
        stopTimer(); // Ensure no duplicates
        timer = setInterval(() => {
            showWidget(currentIndex + 1);
        }, 5000); // Slightly slower rotation for larger content
    }

    function stopTimer() {
        if (timer) clearInterval(timer);
    }

    // Add manual controls if they exist
    const prevBtn = bar.querySelector('.prev');
    const nextBtn = bar.querySelector('.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showWidget(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showWidget(currentIndex + 1);
        });
    }

    bar.addEventListener('mouseenter', stopTimer);
    bar.addEventListener('mouseleave', startTimer);

    startTimer();
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
    localStorage.setItem('show_welcome_modal', 'true');
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
        
        localStorage.setItem('show_welcome_modal', 'true');
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

/**
 * Shows the premium Royal Welcome Modal.
 * @param {string} name 
 */
function showWelcomeModal(name) {
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    overlay.innerHTML = `
        <div class="welcome-modal">
            <span class="royal-icon">👑</span>
            <h2>Welcome Back, Your Highness</h2>
            <p>Greetings, Princess ${name}. Your radiant journey to timeless beauty continues. We have prepared your personalized ritual in the chamber of SHINE.</p>
            <button class="btn-royal" id="close-welcome">Continue to Ritual</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => overlay.classList.add('active'), 100);

    const closeBtn = overlay.querySelector('#close-welcome');
    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 600);
    });
}

// Automatically initialize auth on every script execution
document.addEventListener('DOMContentLoaded', initAuth);

// --- Global Product Modal ---
const MOCK_REVIEWS = [
    { stars: '★★★★★', text: "Absolute game changer. My skin has never felt this hydrated and glowing.", author: "Eleanor V. - Verified" },
    { stars: '★★★★★', text: "Worth every penny. The texture is luxurious and absorbs instantly without greasiness.", author: "Sophia M. - Verified" },
    { stars: '★★★★☆', text: "Beautiful packaging and great results. I noticed a visible difference within a week.", author: "Isabella R. - Verified" },
    { stars: '★★★★★', text: "My holy grail product. It layers beautifully under my makeup without pilling.", author: "Olivia C. - Verified" },
    { stars: '★★★★★', text: "Incredible formulation. It feels very light but packs a powerful punch of hydration.", author: "Victoria H. - Verified" },
    { stars: '★★★★☆', text: "Love the subtle scent and the radiant glow it leaves. Will definitely repurchase.", author: "Chloe S. - Verified" },
    { stars: '★★★★★', text: "I have sensitive skin and this didn't break me out at all. Highly recommend!", author: "Grace L. - Verified" }
];

function injectProductModal() {
    if (document.getElementById('product-modal')) return;

    const modalHTML = `
        <div id="product-modal" class="product-modal-overlay">
            <div class="product-modal-content">
                <span class="close-modal" onclick="closeProductModal()">&times;</span>
                <div class="modal-left">
                    <img id="modal-img" src="" alt="Product Image">
                </div>
                <div class="modal-right">
                    <h2 id="modal-title">Product Name</h2>
                    <p id="modal-price" class="price">₹0</p>
                    <div class="reviews-section">
                        <h3>Customer Reviews</h3>
                        <div id="modal-reviews-list"></div>
                    </div>
                    <button class="btn-primary" id="modal-add-btn" style="width: 100%;">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when clicking outside of it
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if(e.target === document.getElementById('product-modal')) closeProductModal();
    });
}

function openProductModal(name, price, image, size) {
    document.getElementById('modal-img').src = image;
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-price').innerText = `₹${price.toLocaleString('en-IN')}`;
    
    const shuffled = [...MOCK_REVIEWS].sort(() => 0.5 - Math.random());
    const numReviews = Math.floor(Math.random() * 2) + 2;
    const selected = shuffled.slice(0, numReviews);
    
    document.getElementById('modal-reviews-list').innerHTML = selected.map(r => `
        <div class="review-item">
            <div class="review-stars">${r.stars}</div>
            <p class="review-text">"${r.text}"</p>
            <span class="review-author">${r.author}</span>
        </div>
    `).join('');
    
    document.getElementById('modal-add-btn').onclick = () => {
        addToCart(name, price, image, size);
        closeProductModal();
    };
    
    document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function initProductCards() {
    const cards = document.querySelectorAll('.square-card, .product-card');
    cards.forEach(card => {
        if (card.querySelector('.clickable-wrapper')) return;

        const img = card.querySelector('img');
        const title = card.querySelector('h3');
        const btn = card.querySelector('button[onclick*="addToCart"]');
        const badge = card.querySelector('.offer-badge');
        
        if (btn && img && title) {
            const btnClick = btn.getAttribute('onclick');
            const argsMatch = btnClick ? btnClick.match(/'([^']*)',\s*(\d+),\s*'([^']*)',\s*'([^']*)'/) : null;
            
            if (argsMatch) {
                const name = argsMatch[1];
                const price = parseInt(argsMatch[2], 10);
                const image = argsMatch[3];
                const size = argsMatch[4];
                
                const wrapper = document.createElement('div');
                wrapper.className = 'clickable-wrapper';
                wrapper.style.cursor = 'pointer';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.flexGrow = '1';
                wrapper.style.alignItems = 'center';
                wrapper.style.width = '100%';
                wrapper.onclick = () => openProductModal(name, price, image, size);
                
                // Collect elements to wrap
                const elementsToWrap = [];
                for (let child of Array.from(card.childNodes)) {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        if (child.classList.contains('card-footer') || child.classList.contains('price') || child.tagName === 'BUTTON' || child.tagName === 'P') {
                            continue; // Skip footer, price, button, and description
                        }
                    }
                    if (child.tagName !== 'BUTTON') {
                        elementsToWrap.push(child);
                    }
                }
                
                elementsToWrap.forEach(el => wrapper.appendChild(el));
                card.insertBefore(wrapper, card.firstChild);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    injectProductModal();
    initProductCards();
});
