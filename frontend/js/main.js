document.addEventListener('DOMContentLoaded', () => {
    // Navigation buttons
    const loginButton = document.querySelector('.nav-button.secondary');
    const registerButton = document.querySelector('.nav-button.primary');
    const startNowButton = document.querySelector('.hero-buttons .button.primary');
    
    // Forms
    const loginForm = document.querySelector('.login-form')?.parentElement;
    const registerForm = document.querySelector('.register-form')?.parentElement;
    
    // Sections
    const sections = {
        hero: document.querySelector('.hero'),
        about: document.querySelector('.about'),
        roleSelect: document.querySelector('.role-select'),
        dashboard: document.querySelector('.dashboard'),
        results: document.querySelector('.results'),
        documentManagement: document.querySelector('.document-management')
    };

    // Show/hide sections
    function showSection(sectionName) {
        Object.entries(sections).forEach(([name, element]) => {
            if (name === sectionName) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Form handling
    function showForm(formElement) {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (formElement) formElement.style.display = 'block';
    }

    // Event Listeners
    if (loginButton) {
        loginButton.addEventListener('click', () => showForm(loginForm));
    }

    if (registerButton) {
        registerButton.addEventListener('click', () => showForm(registerForm));
    }

    if (startNowButton) {
        startNowButton.addEventListener('click', () => showSection('roleSelect'));
    }

    // Role selection
    const roleButtons = document.querySelectorAll('.role-button');
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const role = button.dataset.role;
            if (role === 'teacher') {
                showSection('documentManagement');
            } else {
                showSection('dashboard');
            }
        });
    });

    // Close forms when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('form-container')) {
            e.target.style.display = 'none';
        }
    });

    // Handle form submissions
    if (loginForm) {
        loginForm.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            // Add login logic here
            showSection('roleSelect');
            showForm(null);
        });
    }

    if (registerForm) {
        registerForm.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            // Add registration logic here
            showSection('roleSelect');
            showForm(null);
        });
    }

    // Navigation menu handling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.textContent.toLowerCase();
            if (sections[section]) {
                showSection(section);
            }
        });
    });

    // Document management search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Add search logic here
            console.log('Searching for:', e.target.value);
        });
    }
});