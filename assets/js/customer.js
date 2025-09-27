/**
 * Beadsyde 2.0 Customer Site - Simplified Version
 * Simple product browsing with category tabs and buy now functionality
 */

class BeadsydeCustomer {
    constructor() {
        this.cart = [];
        this.currentCategory = 'all';
        this.products = [
            {
                id: 1,
                name: 'Silver Infinity Necklace',
                price: 499,
                category: 'necklaces',
                image: 'assets/images/silver necklace.png',
                description: 'Premium Anti-Tarnish Stainless Steel • Waterproof'
            },
            {
                id: 2,
                name: 'Golden Infinity Necklace',
                price: 499,
                category: 'necklaces',
                image: 'assets/images/infinity necklace gold.jpg',
                description: 'Premium Anti-Tarnish Stainless Steel • Waterproof'
            },
            {
                id: 3,
                name: 'Silver Infinity Bracelet',
                price: 349,
                category: 'bracelets',
                image: 'assets/images/infinity bracelet silver.jpg',
                description: 'Premium Anti-Tarnish Stainless Steel • Waterproof'
            },
            {
                id: 4,
                name: 'Golden Infinity Bracelet',
                price: 349,
                category: 'bracelets',
                image: 'assets/images/infinity bracelet gold.jpg',
                description: 'Premium Anti-Tarnish Stainless Steel • Waterproof'
            }
        ];

        this.init();
    }

    init() {
        console.log('🚀 Beadsyde Customer Site Loading...');

        // Setup category tabs
        this.setupCategoryTabs();

        // Load products
        this.displayProducts();

        // Setup quantity controls
        this.setupQuantityControls();

        // Load cart from localStorage
        this.loadCart();

        // Update cart count
        this.updateCartCount();

        console.log('✅ Customer site ready!');
    }

    setupCategoryTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Get category
                const category = button.dataset.category;
                this.currentCategory = category;

                // Display filtered products
                this.displayProducts();
            });
        });
    }

    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        // Filter products by category
        let filteredProducts = this.products;
        if (this.currentCategory !== 'all') {
            filteredProducts = this.products.filter(p => p.category === this.currentCategory);
        }

        // Generate HTML
        const html = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='📿'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">₹${product.price}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="cart-controls">
                        <div class="quantity-selector">
                            <span class="quantity-label">Quantity:</span>
                            <div class="quantity-controls">
                                <button class="qty-btn minus-btn" data-product="${product.id}">−</button>
                                <input type="number" class="qty-display" value="1" min="1" max="5" readonly data-product="${product.id}">
                                <button class="qty-btn plus-btn" data-product="${product.id}">+</button>
                            </div>
                        </div>
                        <button class="add-to-cart-btn" data-product="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                            Add to Cart
                        </button>
                        <button class="remove-from-cart-btn" data-product="${product.id}" style="display: none;">
                            <i class="fas fa-trash"></i>
                            Remove from Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        productsGrid.innerHTML = html;
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Get quantity from selector
        const qtyInput = document.querySelector(`.qty-display[data-product="${productId}"]`);
        const quantity = parseInt(qtyInput.value) || 1;

        // Add to cart
        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity: quantity });
        }

        // Save to localStorage
        this.saveCart();
        this.updateCartCount();

        // Update UI
        this.updateProductUI(productId, true);

        // Show confirmation
        this.showCartNotification(product.name);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);

        // Save to localStorage
        this.saveCart();
        this.updateCartCount();

        // Update UI
        this.updateProductUI(productId, false);

        // Reset quantity to 1
        const qtyInput = document.querySelector(`.qty-display[data-product="${productId}"]`);
        if (qtyInput) {
            qtyInput.value = 1;
            this.updateQuantityButtons(productId);
        }
    }

    updateProductUI(productId, inCart) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) return;

        const addBtn = productCard.querySelector('.add-to-cart-btn');
        const removeBtn = productCard.querySelector('.remove-from-cart-btn');

        if (inCart) {
            addBtn.classList.add('added');
            addBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';

            setTimeout(() => {
                addBtn.style.display = 'none';
                removeBtn.style.display = 'block';
            }, 1000);
        } else {
            addBtn.style.display = 'block';
            addBtn.classList.remove('added');
            addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
            removeBtn.style.display = 'none';
        }
    }

    updateQuantityButtons(productId) {
        const qtyInput = document.querySelector(`.qty-display[data-product="${productId}"]`);
        const minusBtn = document.querySelector(`.minus-btn[data-product="${productId}"]`);
        const plusBtn = document.querySelector(`.plus-btn[data-product="${productId}"]`);

        if (!qtyInput || !minusBtn || !plusBtn) return;

        const currentQty = parseInt(qtyInput.value);
        minusBtn.disabled = currentQty <= 1;
        plusBtn.disabled = currentQty >= 5;
    }

    setupQuantityControls() {
        // Setup quantity button handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                const productId = parseInt(e.target.dataset.product);
                const qtyInput = document.querySelector(`.qty-display[data-product="${productId}"]`);
                let currentQty = parseInt(qtyInput.value);

                if (e.target.classList.contains('plus-btn')) {
                    if (currentQty < 5) {
                        currentQty++;
                        qtyInput.value = currentQty;
                    }
                } else if (e.target.classList.contains('minus-btn')) {
                    if (currentQty > 1) {
                        currentQty--;
                        qtyInput.value = currentQty;
                    }
                }

                this.updateQuantityButtons(productId);
            }
        });

        // Setup add to cart button handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const productId = parseInt(e.target.closest('.add-to-cart-btn').dataset.product);
                this.addToCart(productId);
            }
        });

        // Setup remove from cart button handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-from-cart-btn')) {
                const productId = parseInt(e.target.closest('.remove-from-cart-btn').dataset.product);
                this.removeFromCart(productId);
            }
        });
    }

    showCartNotification(productName) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${productName} added to cart!</span>
                <button onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    loadCart() {
        const savedCart = localStorage.getItem('beadsyde_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('beadsyde_cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    viewCart() {
        window.location.href = 'cart.html';
    }
}

// Global functions (no longer needed as we use event delegation)

// Cart icon click handler
document.addEventListener('DOMContentLoaded', () => {
    window.beadsydeCustomer = new BeadsydeCustomer();

    // Cart icon click
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.beadsydeCustomer.viewCart();
        });
    }
});