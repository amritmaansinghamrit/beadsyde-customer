/**
 * Beadsyde 2.0 Merchant Dashboard JavaScript
 * Handles admin functionality, product management, and analytics
 */

class BeadsydeMerchant {
    constructor() {
        this.currentSection = 'dashboard';
        this.products = [];
        this.categories = [];
        this.orders = [];
        this.analytics = {};

        this.init();
    }

    async init() {
        console.log('🏪 Beadsyde Merchant Dashboard Initializing...');

        // Load initial data
        await this.loadData();

        // Setup navigation
        this.setupNavigation();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize dashboard
        this.showSection('dashboard');

        console.log('✅ Merchant dashboard ready!');
    }

    async loadData() {
        try {
            // Mock data for testing - replace with API calls
            this.products = [
                {
                    id: 1,
                    name: 'Silver Infinity Necklace',
                    price: 499,
                    category: 'Infinity Collection',
                    stock: 15,
                    image: '📿'
                },
                {
                    id: 2,
                    name: 'Golden Infinity Bracelet',
                    price: 349,
                    category: 'Infinity Collection',
                    stock: 8,
                    image: '⚪'
                },
                {
                    id: 3,
                    name: 'Pearl Drop Earrings',
                    price: 299,
                    category: 'Earrings',
                    stock: 12,
                    image: '💎'
                }
            ];

            this.categories = [
                { id: 1, name: 'Infinity Collection', products: 4 },
                { id: 2, name: 'Necklaces', products: 8 },
                { id: 3, name: 'Bracelets', products: 6 },
                { id: 4, name: 'Earrings', products: 5 }
            ];

            this.orders = [
                {
                    id: 1,
                    orderNumber: 'ORD-001',
                    customer: 'John Doe',
                    total: 849,
                    status: 'processing',
                    date: '2023-12-01'
                },
                {
                    id: 2,
                    orderNumber: 'ORD-002',
                    customer: 'Jane Smith',
                    total: 299,
                    status: 'shipped',
                    date: '2023-12-02'
                }
            ];

            this.analytics = {
                totalOrders: 156,
                totalRevenue: 47250,
                totalVisitors: 1234,
                totalProducts: this.products.length,
                conversionRate: 3.2,
                avgOrderValue: 425
            };

        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    setupNavigation() {
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
    }

    setupEventListeners() {
        // Deploy button
        const deployBtn = document.getElementById('deployToProduction');
        if (deployBtn) {
            deployBtn.addEventListener('click', () => this.deployToProduction());
        }

        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showAddCategoryModal());
        }

        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Generate report button
        const generateReportBtn = document.getElementById('generateReport');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            products: 'Product Management',
            categories: 'Category Management',
            orders: 'Order Management',
            analytics: 'Analytics & Reports',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

        // Show section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Load section data
        this.loadSectionData(sectionName);
        this.currentSection = sectionName;
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'products':
                this.renderProductsTable();
                break;
            case 'categories':
                this.renderCategoriesGrid();
                break;
            case 'orders':
                this.renderOrdersTable();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }

    updateDashboardStats() {
        // Update stat cards
        document.getElementById('totalOrders').textContent = this.analytics.totalOrders;
        document.getElementById('totalRevenue').textContent = `₹${this.analytics.totalRevenue.toLocaleString()}`;
        document.getElementById('totalVisitors').textContent = this.analytics.totalVisitors.toLocaleString();
        document.getElementById('totalProducts').textContent = this.analytics.totalProducts;

        // Initialize charts (mock implementation)
        this.initializeCharts();
    }

    renderProductsTable() {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        const html = this.products.map(product => `
            <tr>
                <td>${product.image}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="action-button edit-button" onclick="editProduct(${product.id})">Edit</button>
                    <button class="action-button delete-button" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = html;
    }

    renderCategoriesGrid() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;

        const html = this.categories.map(category => `
            <div class="category-card">
                <h3>${category.name}</h3>
                <p>${category.products} products</p>
                <div style="margin-top: 15px;">
                    <button class="action-button edit-button" onclick="editCategory(${category.id})">Edit</button>
                    <button class="action-button delete-button" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            </div>
        `).join('');

        categoriesGrid.innerHTML = html;
    }

    renderOrdersTable() {
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;

        const html = this.orders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.customer}</td>
                <td>2 items</td>
                <td>₹${order.total}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>${order.date}</td>
                <td>
                    <button class="action-button view-button" onclick="viewOrder(${order.id})">View</button>
                    <button class="action-button edit-button" onclick="updateOrderStatus(${order.id})">Update</button>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = html;
    }

    renderAnalytics() {
        // Update analytics metrics
        document.getElementById('conversionRate').textContent = `${this.analytics.conversionRate}%`;
        document.getElementById('avgOrderValue').textContent = `₹${this.analytics.avgOrderValue}`;

        // Popular categories
        const popularCategories = document.getElementById('popularCategories');
        if (popularCategories) {
            const html = this.categories.slice(0, 3).map(cat =>
                `<div>${cat.name} (${cat.products})</div>`
            ).join('');
            popularCategories.innerHTML = html;
        }

        // Initialize analytics charts
        this.initializeAnalyticsCharts();
    }

    initializeCharts() {
        // Mock chart initialization
        console.log('📊 Initializing dashboard charts...');

        // In a real implementation, you would use Chart.js here
        // Example:
        // const ctx = document.getElementById('ordersChart').getContext('2d');
        // new Chart(ctx, { ... });
    }

    initializeAnalyticsCharts() {
        console.log('📈 Initializing analytics charts...');
        // Mock analytics chart initialization
    }

    // Action handlers
    deployToProduction() {
        if (confirm('Are you sure you want to deploy to production? This will make all changes live.')) {
            alert('🚀 Deployment initiated!\n\n1. Running tests...\n2. Backing up production...\n3. Deploying changes...\n\n(This is a simulation - deployment pipeline would run here)');
        }
    }

    showAddProductModal() {
        const name = prompt('Product Name:');
        const price = prompt('Price (₹):');
        const category = prompt('Category:');

        if (name && price && category) {
            const newProduct = {
                id: this.products.length + 1,
                name,
                price: parseInt(price),
                category,
                stock: 0,
                image: '📦'
            };

            this.products.push(newProduct);
            this.renderProductsTable();
            alert(`✅ Product "${name}" added successfully!`);
        }
    }

    showAddCategoryModal() {
        const name = prompt('Category Name:');

        if (name) {
            const newCategory = {
                id: this.categories.length + 1,
                name,
                products: 0
            };

            this.categories.push(newCategory);
            this.renderCategoriesGrid();
            alert(`✅ Category "${name}" added successfully!`);
        }
    }

    saveSettings() {
        const siteTitle = document.getElementById('siteTitle').value;
        const siteDescription = document.getElementById('siteDescription').value;

        alert(`💾 Settings saved!\n\nSite Title: ${siteTitle}\nDescription: ${siteDescription}\n\n(Settings would be saved to database)`);
    }

    generateReport() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        alert(`📊 Generating report...\n\nDate Range: ${startDate} to ${endDate}\n\n(Report generation would process analytics data)`);
    }

    // Public methods for external access
    getCurrentSection() {
        return this.currentSection;
    }

    getProducts() {
        return this.products;
    }

    getCategories() {
        return this.categories;
    }
}

// Global functions for button actions
window.editProduct = function(id) {
    alert(`✏️ Edit Product ID: ${id}\n\n(Product editing modal would open here)`);
};

window.deleteProduct = function(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        window.beadsydeMerchant.products = window.beadsydeMerchant.products.filter(p => p.id !== id);
        window.beadsydeMerchant.renderProductsTable();
        alert('🗑️ Product deleted successfully!');
    }
};

window.editCategory = function(id) {
    alert(`✏️ Edit Category ID: ${id}\n\n(Category editing modal would open here)`);
};

window.deleteCategory = function(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        window.beadsydeMerchant.categories = window.beadsydeMerchant.categories.filter(c => c.id !== id);
        window.beadsydeMerchant.renderCategoriesGrid();
        alert('🗑️ Category deleted successfully!');
    }
};

window.viewOrder = function(id) {
    alert(`👁️ View Order ID: ${id}\n\n(Order details modal would open here)`);
};

window.updateOrderStatus = function(id) {
    const newStatus = prompt('Enter new status (pending/processing/shipped/delivered):');
    if (newStatus) {
        alert(`📦 Order ${id} status updated to: ${newStatus}`);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.beadsydeMerchant = new BeadsydeMerchant();
});