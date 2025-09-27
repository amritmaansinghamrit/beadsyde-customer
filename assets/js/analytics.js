/**
 * Beadsyde 2.0 Visitor Analytics Tracking
 * Comprehensive visitor and behavior tracking system
 */

class BeadsydeAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = Date.now();
        this.isTracking = true;
        this.events = [];
        this.apiEndpoint = 'https://httpbin.org/post'; // Mock endpoint for testing

        this.init();
    }

    init() {
        // Track page view
        this.trackPageView();

        // Track page exit
        window.addEventListener('beforeunload', () => this.trackPageExit());

        // Track scroll depth
        this.trackScrollDepth();

        // Track clicks
        this.trackClicks();

        // Send data periodically
        setInterval(() => this.sendQueuedEvents(), 30000); // Every 30 seconds
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }

    getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';

        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            deviceType = 'tablet';
        } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
            deviceType = 'mobile';
        }

        return {
            deviceType,
            browser: this.getBrowser(ua),
            operatingSystem: this.getOS(ua),
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    getBrowser(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getOS(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    getUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_term: urlParams.get('utm_term'),
            utm_content: urlParams.get('utm_content')
        };
    }

    trackPageView() {
        const deviceInfo = this.getDeviceInfo();
        const utmParams = this.getUTMParameters();

        const eventData = {
            event_type: 'page_view',
            session_id: this.sessionId,
            page_url: window.location.href,
            page_title: document.title,
            referrer_url: document.referrer,
            visitor_ip: null, // Will be set server-side
            user_agent: navigator.userAgent,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            operating_system: deviceInfo.operatingSystem,
            screen_resolution: deviceInfo.screenResolution,
            viewport_size: deviceInfo.viewportSize,
            ...utmParams,
            timestamp: new Date().toISOString()
        };

        this.queueEvent(eventData);
    }

    trackPageExit() {
        const timeOnPage = Math.round((Date.now() - this.pageLoadTime) / 1000);

        const eventData = {
            event_type: 'page_exit',
            session_id: this.sessionId,
            page_url: window.location.href,
            time_on_page: timeOnPage,
            timestamp: new Date().toISOString()
        };

        // Send immediately on page exit
        this.sendEvent(eventData, true);
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const trackingPoints = [25, 50, 75, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            maxScroll = Math.max(maxScroll, scrollPercent);

            trackingPoints.forEach(point => {
                if (scrollPercent >= point && !tracked.has(point)) {
                    tracked.add(point);
                    this.queueEvent({
                        event_type: 'scroll_depth',
                        session_id: this.sessionId,
                        page_url: window.location.href,
                        scroll_percentage: point,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });
    }

    trackClicks() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            let elementInfo = {
                tag: element.tagName.toLowerCase(),
                id: element.id,
                classes: element.className,
                text: element.textContent?.substring(0, 100) || '',
                href: element.href
            };

            // Special tracking for important elements
            if (element.closest('.product-card')) {
                elementInfo.action = 'product_click';
                elementInfo.product_id = element.closest('.product-card').dataset.productId;
            } else if (element.closest('.add-to-cart-btn')) {
                elementInfo.action = 'add_to_cart_click';
                elementInfo.product_id = element.closest('.product-card')?.dataset.productId;
            } else if (element.closest('.cart-icon')) {
                elementInfo.action = 'cart_icon_click';
            } else if (element.matches('a[href]')) {
                elementInfo.action = 'link_click';
            }

            this.queueEvent({
                event_type: 'click',
                session_id: this.sessionId,
                page_url: window.location.href,
                element_info: JSON.stringify(elementInfo),
                timestamp: new Date().toISOString()
            });
        });
    }

    trackCustomEvent(eventName, eventData = {}) {
        this.queueEvent({
            event_type: 'custom',
            event_name: eventName,
            session_id: this.sessionId,
            page_url: window.location.href,
            custom_data: JSON.stringify(eventData),
            timestamp: new Date().toISOString()
        });
    }

    trackProductView(productId, productName, categoryId) {
        this.queueEvent({
            event_type: 'product_view',
            session_id: this.sessionId,
            product_id: productId,
            product_name: productName,
            category_id: categoryId,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    trackAddToCart(productId, quantity, price) {
        this.queueEvent({
            event_type: 'add_to_cart',
            session_id: this.sessionId,
            product_id: productId,
            quantity: quantity,
            price: price,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    trackPurchase(orderId, orderValue, products) {
        this.queueEvent({
            event_type: 'purchase',
            session_id: this.sessionId,
            order_id: orderId,
            order_value: orderValue,
            products: JSON.stringify(products),
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    queueEvent(eventData) {
        if (!this.isTracking) return;

        this.events.push(eventData);

        // If queue gets too large, send immediately
        if (this.events.length >= 10) {
            this.sendQueuedEvents();
        }
    }

    async sendQueuedEvents() {
        if (this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = [];

        try {
            await this.sendEvents(eventsToSend);
        } catch (error) {
            console.error('Failed to send analytics events:', error);
            // Re-queue failed events
            this.events.unshift(...eventsToSend);
        }
    }

    async sendEvent(eventData, immediate = false) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ events: [eventData] }),
                keepalive: immediate // For page exit events
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to send analytics event:', error);
        }
    }

    async sendEvents(events) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ events })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    }

    // Public methods for manual tracking
    disable() {
        this.isTracking = false;
    }

    enable() {
        this.isTracking = true;
    }

    setUserId(userId) {
        this.userId = userId;
    }
}

// Initialize analytics when DOM is ready
if (typeof window !== 'undefined') {
    window.BeadsydeAnalytics = BeadsydeAnalytics;

    document.addEventListener('DOMContentLoaded', () => {
        window.analytics = new BeadsydeAnalytics();

        // Make analytics available globally for manual tracking
        window.trackEvent = (eventName, data) => window.analytics.trackCustomEvent(eventName, data);
        window.trackProductView = (id, name, category) => window.analytics.trackProductView(id, name, category);
        window.trackAddToCart = (id, qty, price) => window.analytics.trackAddToCart(id, qty, price);
        window.trackPurchase = (orderId, value, products) => window.analytics.trackPurchase(orderId, value, products);
    });
}