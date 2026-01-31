document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const card = document.querySelector('.login-card');
    const container = document.querySelector('.login-wrapper') || document.body;
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const spotlight = document.querySelector('.card-spotlight');

    // --- 3D Tilt & Spotlight Effect ---
    if (card && container) {
        container.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to card center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Calculate rotation (max 10 degrees)
            const rotateX = (y / (rect.height / 2)) * -10;
            const rotateY = (x / (rect.width / 2)) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Spotlight position relative to card top-left
            if (spotlight) {
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                spotlight.style.setProperty('--mouse-x', `${mouseX}px`);
                spotlight.style.setProperty('--mouse-y', `${mouseY}px`);
                spotlight.style.background = `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.1), transparent 40%)`;
            }
        });

        container.addEventListener('mouseleave', () => {
            // Reset position
            card.style.transition = 'transform 0.5s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

            if (spotlight) {
                spotlight.style.background = `radial-gradient(600px circle at 50% 50%, rgba(255, 255, 255, 0), transparent 40%)`;
            }

            setTimeout(() => {
                card.style.transition = ''; // Remove transition so mousemove is instant
            }, 500);
        });

        container.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    }

    // --- Password Toggle ---
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle opacity/icon style optionally
            togglePassword.style.opacity = type === 'text' ? '1' : '0.6';
        });
    }

    // --- Button Ripple Effect ---
    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            // Don't ripple if loading
            if (this.classList.contains('loading')) return;

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // --- Form Submission Loading Animation ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent immediate submission

            // Add loading state
            loginBtn.classList.add('loading');

            // Trigger Chicken Animation
            const chickenOverlay = document.getElementById('chicken-overlay');
            if (chickenOverlay) {
                chickenOverlay.classList.add('active');
            }

            // Wait for animation to finish (3 seconds based on CSS) + buffer
            setTimeout(() => {
                // Manual redirect as per the form action
                const action = loginForm.getAttribute('action');
                window.location.href = action;
            }, 3000); // 3s matches the css animation duration
        });
    }
});
