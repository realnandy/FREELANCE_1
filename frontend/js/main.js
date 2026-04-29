document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. NAVBAR SCROLL EFFECT
       ========================================================================== */
    const header = document.querySelector('.header');
    
    const handleScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check immediately on page load

    /* ==========================================================================
       2. MOBILE MENU TOGGLE
       ========================================================================== */
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && nav) {
        const toggleMenu = () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from immediately closing it
            toggleMenu();
        });

        // Close menu when clicking anywhere outside of it
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('active');
            }
        });

        // Close menu when clicking a link inside it
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    nav.classList.remove('active');
                }
            });
        });
    }

    /* ==========================================================================
       3. DYNAMIC ACTIVE NAV LINK
       ========================================================================== */
    // Reads current URL and highlights the correct nav item
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html'; // Default to index.html if root
    
    navLinks.forEach(link => {
        // Clear any hardcoded active states
        link.classList.remove('active');
        
        const linkHref = link.getAttribute('href');
        if (linkHref === pageName) {
            link.classList.add('active');
        }
    });

    /* ==========================================================================
       4. SCROLL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of the element is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for very old browsers: just show the elements immediately
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    /* ==========================================================================
       5. CONTACT FORM LOGIC (Validation & URL Params)
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Pre-fill "Membership Interest" select box from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get('plan');
        const planSelect = document.getElementById('plan');
        
        if (planParam && planSelect) {
            // Check if the parameter matches a valid option before setting it
            const optionExists = Array.from(planSelect.options).some(opt => opt.value === planParam);
            if (optionExists) {
                planSelect.value = planParam;
            }
        }

        // Form Validation Utility Functions
        const showError = (inputId, message) => {
            const input = document.getElementById(inputId);
            const errorDiv = document.getElementById(`${inputId}-error`);
            input.classList.add('invalid');
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        };

        const clearErrors = () => {
            const inputs = contactForm.querySelectorAll('.form__input, .form__textarea, .form__select');
            const errorDivs = contactForm.querySelectorAll('.form__error');
            
            inputs.forEach(input => input.classList.remove('invalid'));
            errorDivs.forEach(div => {
                div.classList.remove('show');
                div.textContent = '';
            });
        };

        // Submit Event Handler
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
            let isValid = true;

            // 1. Name Validation
            const name = document.getElementById('name');
            if (!name.value.trim()) {
                showError('name', 'Full name is required.');
                isValid = false;
            }

            // 2. Email Validation
            const email = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                showError('email', 'Email address is required.');
                isValid = false;
            } else if (!emailRegex.test(email.value.trim())) {
                showError('email', 'Please enter a valid email address.');
                isValid = false;
            }

            // 3. Phone Validation (Must be 10 digits)
            const phone = document.getElementById('phone');
            // Remove all non-digit characters (e.g. spaces, dashes) to validate cleanly
            const cleanPhone = phone.value.replace(/\D/g, ''); 
            if (!phone.value.trim()) {
                showError('phone', 'Phone number is required.');
                isValid = false;
            } else if (cleanPhone.length !== 10) {
                showError('phone', 'Phone number must be exactly 10 digits.');
                isValid = false;
            }

            // 4. Plan/Membership Validation
            if (!planSelect.value) {
                showError('plan', 'Please select a membership interest.');
                isValid = false;
            }

            // 5. Message Validation
            const message = document.getElementById('message');
            if (!message.value.trim()) {
                showError('message', 'Message cannot be empty.');
                isValid = false;
            }

            // If valid, redirect to WhatsApp group
            if (isValid) {
                const name = document.getElementById('name').value.trim();
                const plan = planSelect.value;
                const waMessage = encodeURIComponent(`Hi HAWK FIT HUB! My name is ${name}. I'm interested in the ${plan} membership. Please guide me further.`);
                const waUrl = `https://wa.me/919353431899?text=${waMessage}`;
                window.open(waUrl, '_blank');
                contactForm.reset();
            }
        });
    }
});
