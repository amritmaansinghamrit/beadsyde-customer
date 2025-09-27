class CheckoutFlow {
    constructor() {
        this.currentStep = 1;
        this.cart = [];
        this.orderData = {};
        this.upiId = 'khemkakshama64-1@oksbi';
        this.orderId = this.generateOrderId();

        this.init();
    }

    init() {
        console.log('🛒 Checkout flow initialized');

        // Load cart from localStorage
        this.loadCart();

        // Display order summary
        this.displayOrderSummary();

        // Generate UPI QR code
        this.generateUPIQR();

        // Setup form listeners
        this.setupFormListeners();

        // Setup file upload
        this.setupFileUpload();
    }

    generateOrderId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `BDS${timestamp}${random}`;
    }

    loadCart() {
        const savedCart = localStorage.getItem('beadsyde_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }

        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            window.location.href = 'index.html';
            return;
        }

        console.log('📦 Cart loaded:', this.cart);
    }

    displayOrderSummary() {
        const orderItems = document.getElementById('orderItems');
        let subtotal = 0;

        const html = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            return `
                <div class="cart-item">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">Qty: ${item.quantity}</div>
                    </div>
                    <div class="item-price">₹${itemTotal}</div>
                </div>
            `;
        }).join('');

        orderItems.innerHTML = html;

        // Calculate totals
        const shipping = subtotal >= 999 ? 0 : 100;
        const total = subtotal + shipping;

        document.getElementById('subtotal').textContent = `₹${subtotal}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
        document.getElementById('total').textContent = `₹${total}`;
        document.getElementById('paymentAmount').textContent = total;

        this.orderData.subtotal = subtotal;
        this.orderData.shipping = shipping;
        this.orderData.total = total;
    }

    generateUPIQR() {
        const total = this.orderData.total || 0;

        // UPI deep link format
        const upiLink = `upi://pay?pa=${this.upiId}&am=${total}&cu=INR&tn=Beadsyde Order ${this.orderId}`;

        // Generate QR code
        const qrContainer = document.getElementById('qrcode');
        if (qrContainer && typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrContainer, upiLink, {
                width: 200,
                height: 200,
                color: {
                    dark: '#2E5BBA',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    console.error('QR generation failed:', error);
                    qrContainer.innerHTML = `<div style="width: 200px; height: 200px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; text-align: center; color: #666; font-size: 14px;">
                        <div>
                            <i class="fas fa-qrcode" style="font-size: 2em; margin-bottom: 10px; opacity: 0.5;"></i><br>
                            QR Code<br>
                            <a href="${upiLink}" style="color: var(--primary-blue);">Click to Pay</a>
                        </div>
                    </div>`;
                } else {
                    console.log('✅ UPI QR code generated');
                }
            });
        } else {
            // Fallback if QRCode library not loaded
            qrContainer.innerHTML = `<div style="width: 200px; height: 200px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; text-align: center; color: #666; font-size: 14px;">
                <div>
                    <i class="fas fa-qrcode" style="font-size: 2em; margin-bottom: 10px; opacity: 0.5;"></i><br>
                    QR Code<br>
                    <a href="${upiLink}" style="color: var(--primary-blue);">Click to Pay</a>
                </div>
            </div>`;
        }

        this.upiLink = upiLink;
    }

    openUPIApp(app) {
        const total = this.orderData.total || 0;
        let appUrl;

        switch(app) {
            case 'phonepe':
                appUrl = `phonepe://pay?pa=${this.upiId}&am=${total}&tn=Beadsyde Order ${this.orderId}`;
                break;
            case 'gpay':
                appUrl = `tez://upi/pay?pa=${this.upiId}&am=${total}&tn=Beadsyde Order ${this.orderId}`;
                break;
            case 'paytm':
                appUrl = `paytmmp://pay?pa=${this.upiId}&am=${total}&tn=Beadsyde Order ${this.orderId}`;
                break;
            case 'bhim':
                appUrl = `bhim://pay?pa=${this.upiId}&am=${total}&tn=Beadsyde Order ${this.orderId}`;
                break;
            default:
                appUrl = this.upiLink;
        }

        // Try to open the app
        const link = document.createElement('a');
        link.href = appUrl;
        link.click();

        // Fallback to UPI link after a delay
        setTimeout(() => {
            window.location.href = this.upiLink;
        }, 1000);

        console.log(`📱 Opening ${app} with amount: ₹${total}`);
    }

    setupFormListeners() {
        // Character counter for special message
        const specialMessage = document.getElementById('specialMessage');
        const charCount = document.getElementById('charCount');

        if (specialMessage && charCount) {
            specialMessage.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = count;

                const counter = charCount.parentNode;
                counter.style.color = '#888';
                if (count >= 90) counter.style.color = '#f59e0b';
                if (count >= 100) counter.style.color = '#EF4444';
            });
        }

        // Phone number validation
        const phoneInput = document.getElementById('customerPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                // Allow +91 and spaces, but clean for validation
                this.value = this.value.replace(/[^\d\+\s\-]/g, '').substring(0, 15);
            });
        }

        // PIN code validation
        const pincodeInput = document.getElementById('customerPincode');
        if (pincodeInput) {
            pincodeInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '').substring(0, 6);
            });
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('paymentScreenshot');
        const fileName = document.getElementById('fileName');

        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileName.textContent = `📎 ${this.files[0].name}`;
                fileName.style.color = '#10B981';
            } else {
                fileName.textContent = '';
            }
        });
    }

    nextStep() {
        if (this.currentStep === 1) {
            if (!this.validateContactForm()) {
                return;
            }
            this.saveContactData();
        }

        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress bar
        const progress = ((this.currentStep - 1) / 2) * 100;
        document.getElementById('stepProgress').style.width = `${progress}%`;

        // Show/hide step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            content.classList.remove('active');
            if (index + 1 === this.currentStep) {
                content.classList.add('active');
            }
        });

        console.log(`📍 Step ${this.currentStep} activated`);
    }

    validateContactForm() {
        const required = ['customerName', 'customerPhone', 'customerAddress', 'customerCity', 'customerState', 'customerPincode'];

        for (let field of required) {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                alert(`Please fill in ${element.previousElementSibling.textContent.replace(' *', '').replace(/\s*\*\s*$/, '')}`);
                element.focus();
                return false;
            }
        }

        // Validate phone number - allow for +91 and spaces
        const phone = document.getElementById('customerPhone').value.replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 12) {
            alert('Please enter a valid phone number');
            document.getElementById('customerPhone').focus();
            return false;
        }

        // Validate PIN code
        const pincode = document.getElementById('customerPincode').value;
        if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
            alert('Please enter a valid 6-digit PIN code');
            document.getElementById('customerPincode').focus();
            return false;
        }

        return true;
    }

    saveContactData() {
        this.orderData.customer = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('customerAddress').value,
            landmark: document.getElementById('customerLandmark').value,
            city: document.getElementById('customerCity').value,
            state: document.getElementById('customerState').value,
            pincode: document.getElementById('customerPincode').value,
            message: document.getElementById('specialMessage').value
        };

        console.log('📝 Contact data saved:', this.orderData.customer);
    }

    completeOrder() {
        const screenshot = document.getElementById('paymentScreenshot').files[0];

        if (!screenshot) {
            alert('Please upload your payment screenshot to complete the order');
            return;
        }

        // Generate WhatsApp message
        this.generateWhatsAppMessage();
    }

    generateWhatsAppMessage() {
        const customer = this.orderData.customer;

        let message = `🩵 NEW ORDER - BEADSYDE 🩵\\n\\n`;
        message += `🗓️ ${new Date().toLocaleString('en-IN')}\\n\\n`;
        message += `Name: ${customer.name}\\n`;
        message += `Phone: ${customer.phone}\\n`;

        // Format address
        const landmarkText = customer.landmark ? `, Near ${customer.landmark}` : '';
        message += `Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}${landmarkText}\\n\\n`;

        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `${index + 1}.⁠ ⁠${item.name} x${item.quantity} = Rs.${itemTotal}\\n\\n`;
        });

        message += `Items: Rs.${this.orderData.subtotal}\\n`;
        message += `Shipping: Rs.${this.orderData.shipping}\\n`;
        message += `FINAL TOTAL: Rs.${this.orderData.total} ✅\\n\\n`;

        message += `💬NOTES:`;
        if (customer.message) {
            message += ` ${customer.message}`;
        }

        message += `\\n\\n🚚 Delivering Pan India in 4-6 working days\\n\\n`;
        message += `💳 Pay to: ${this.upiId} (Beadsyde)\\n`;
        message += `Amount: Rs.${this.orderData.total}\\n`;
        message += `Share payment screenshot to confirm your order!`;

        // Open WhatsApp
        const whatsappUrl = `https://wa.me/918104563011?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Show success message and redirect
        setTimeout(() => {
            alert('🎉 Order placed successfully!\\n\\nPlease share your payment screenshot on WhatsApp to complete the order.\\n\\nYou will be redirected to the home page.');
            localStorage.removeItem('beadsyde_cart');
            window.location.href = 'index.html';
        }, 1000);

        console.log('✅ Order completed:', this.orderId);
    }
}

// Global functions
function nextStep() {
    window.checkoutFlow.nextStep();
}

function prevStep() {
    window.checkoutFlow.prevStep();
}

function goBack() {
    window.location.href = 'index.html';
}

function openUPIApp(app) {
    window.checkoutFlow.openUPIApp(app);
}

function completeOrder() {
    window.checkoutFlow.completeOrder();
}

// Initialize checkout flow when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutFlow = new CheckoutFlow();
});