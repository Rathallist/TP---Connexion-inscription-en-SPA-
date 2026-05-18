// Application SPA - Gestion de l'authentification

class AuthApp {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsersFromStorage();
        this.initEventListeners();
        this.showPage('login');
    }

    // Initialiser les écouteurs d'événements
    initEventListeners() {
        // Formulaire de connexion
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Formulaire d'inscription
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Liens de navigation
        document.getElementById('to-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('register');
            this.clearErrors();
        });

        document.getElementById('to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('login');
            this.clearErrors();
        });

        // Bouton de déconnexion
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    // Gérer la connexion
    handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Valider les champs
        if (!email || !password) {
            this.showLoginError('Veuillez remplir tous les champs.');
            return;
        }

        // Vérifier les e-mails
        const user = this.users.find(u => u.email === email.toLowerCase());

        if (!user) {
            this.showLoginError('Adresse e-mail ou mot de passe incorrect.');
            return;
        }

        if (user.password !== password) {
            this.showLoginError('Adresse e-mail ou mot de passe incorrect.');
            return;
        }

        // Connexion réussie
        this.currentUser = user;
        if (rememberMe) {
            localStorage.setItem('rememberedUser', email.toLowerCase());
        }
        this.clearLoginForm();
        this.showPage('home');
        this.updateWelcomeMessage();
    }

    // Gérer l'inscription
    handleRegister(event) {
        event.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Valider les champs
        if (!name || !email || !password || !confirmPassword) {
            this.showRegisterError('Veuillez remplir tous les champs.');
            return;
        }

        // Valider le format d'email
        if (!this.isValidEmail(email)) {
            this.showRegisterError('Veuillez entrer une adresse e-mail valide.');
            return;
        }

        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            this.showRegisterError('Les mots de passe ne correspondent pas.');
            return;
        }

        // Vérifier que le mot de passe a au moins 6 caractères
        if (password.length < 6) {
            this.showRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        // Vérifier que l'e-mail n'existe pas déjà
        if (this.users.some(u => u.email === email.toLowerCase())) {
            this.showRegisterError('Cette adresse e-mail est déjà utilisée.');
            return;
        }

        // Vérifier que le nom n'existe pas déjà
        if (this.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
            this.showRegisterError('Ce nom est déjà utilisé.');
            return;
        }

        // Créer le nouvel utilisateur
        const newUser = {
            name: name,
            email: email.toLowerCase(),
            password: password
        };

        this.users.push(newUser);
        this.saveUsersToStorage();

        // Message de succès et redirection
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.clearRegisterForm();
        this.showPage('login');
        this.clearErrors();
    }

    // Gérer la déconnexion
    logout() {
        this.currentUser = null;
        localStorage.removeItem('rememberedUser');
        this.clearLoginForm();
        this.clearRegisterForm();
        this.showPage('login');
    }

    // Afficher une page et masquer les autres
    showPage(pageName) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        if (pageName === 'login') {
            document.getElementById('login-page').classList.add('active');
        } else if (pageName === 'register') {
            document.getElementById('register-page').classList.add('active');
        } else if (pageName === 'home') {
            document.getElementById('home-page').classList.add('active');
        }
    }

    // Mettre à jour le message de bienvenue
    updateWelcomeMessage() {
        if (this.currentUser) {
            document.getElementById('welcome-message').textContent = 
                `Vous êtes connecté en tant que ${this.currentUser.name}.`;
        }
    }

    // Afficher les erreurs de connexion
    showLoginError(message) {
        document.getElementById('login-error').textContent = message;
    }

    // Afficher les erreurs d'inscription
    showRegisterError(message) {
        document.getElementById('register-error').textContent = message;
    }

    // Effacer les messages d'erreur
    clearErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('register-error').textContent = '';
    }

    // Vider le formulaire de connexion
    clearLoginForm() {
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('remember-me').checked = false;
        document.getElementById('login-error').textContent = '';
    }

    // Vider le formulaire d'inscription
    clearRegisterForm() {
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm-password').value = '';
        document.getElementById('register-error').textContent = '';
    }

    // Valider le format d'email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Charger les utilisateurs du localStorage
    loadUsersFromStorage() {
        const stored = localStorage.getItem('users');
        if (stored) {
            return JSON.parse(stored);
        }
        // Utilisateurs de test
        return [
            { name: 'Test User', email: 'test@example.com', password: 'test123' },
            { name: 'Demo User', email: 'demo@example.com', password: 'demo123' }
        ];
    }

    // Sauvegarder les utilisateurs au localStorage
    saveUsersToStorage() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new AuthApp();
});
