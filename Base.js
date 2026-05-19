// Application SPA - Gestion de l'authentification

class AuthApp {
    constructor() {
        this.backendUrl = 'http://localhost:3000'; 
        this.currentUser = null;
        this.users = this.loadUsersFromStorage();
        this.initEventListeners();
        this.showPage('login');
    }

    // Initialise les écouteurs d'événements(ça permet de gérer les interactions utilisateur, genre si tu clic sur le bouton de connexion, ça va appeler la fonction handleLogin)
    initEventListeners() {
        // Formulaire de connexion
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Formulaire d'inscription
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Liens de navigation(affiches les pages de connexion ou d'inscription selon le lien cliqué)
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

    // Gère la connexion(définition des variables relatives à la connexion + validation des champs)
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Valide les champs
        if (!email || !password) {
            this.showLoginError('Veuillez remplir tous les champs.');
            return;
        }

        try {
            const user = await this.apiLogin(email, password);
            this.currentUser = user;

            if (rememberMe) {
                localStorage.setItem('rememberedUser', email.toLowerCase());
            }

            this.clearLoginForm();
            this.showPage('home');
            this.updateWelcomeMessage();
        } catch (error) {
            this.showLoginError(error?.message || 'Erreur de connexion au serveur.');
        }
    }

    // Gére l'inscription(même chose que au dessus mais avec des champs supplémentaires et des validations en plus)
    async handleRegister(event) {
        event.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Valide les champs
        if (!name || !email || !password || !confirmPassword) {
            this.showRegisterError('Veuillez remplir tous les champs.');
            return;
        }

        // Valide le format d'email
        if (!this.isValidEmail(email)) {
            this.showRegisterError('Veuillez entrer une adresse e-mail valide.');
            return;
        }

        // Vérifie que les mots de passe correspondent
        if (password !== confirmPassword) {
            this.showRegisterError('Les mots de passe ne correspondent pas.');
            return;
        }

        // Vérifie que le mot de passe a au moins 6 caractères
        if (password.length < 6) {
            this.showRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        // Vérifie que l'e-mail n'existe pas déjà
        if (this.users.some(u => u.email === email.toLowerCase())) {
            this.showRegisterError('Cette adresse e-mail est déjà utilisée.');
            return;
        }

        // Vérifie que le nom n'existe pas déjà
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

        try {
            await this.apiRegister(newUser);
            this.users.push(newUser);
            this.saveUsersToStorage();

            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            this.clearRegisterForm();
            this.showPage('login');
            this.clearErrors();
        } catch (error) {
            this.showRegisterError(error?.message || 'Erreur lors de l’inscription.');
        }
    }

    // Gère la déconnexion(simple logique pour réinitialiser les variables)
    logout() {
        this.apiLogout();
        this.currentUser = null;
        localStorage.removeItem('rememberedUser');
        this.clearLoginForm();
        this.clearRegisterForm();
        this.showPage('login');
    }

    async apiLogin(email, password) {
        const response = await fetch(`${this.backendUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || 'Adresse e-mail ou mot de passe incorrect.');
        }

        return response.json();
    }

    async apiRegister(user) {
        const response = await fetch(`${this.backendUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || 'Impossible de créer le compte.');
        }

        return response.json();
    }

    async apiLogout() {
        try {
            await fetch(`${this.backendUrl}/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.warn('Impossible de contacter le backend lors de la déconnexion.', error);
        }
    }

    // Affiche une page et masquer les autres
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

    // Met à jour le message de bienvenue
    updateWelcomeMessage() {
        if (this.currentUser) {
            document.getElementById('welcome-message').textContent = 
                `Vous êtes connecté en tant que ${this.currentUser.name}.`;
        }
    }

    // Affiche les erreurs de connexion
    showLoginError(message) {
        document.getElementById('login-error').textContent = message;
    }

    // Affiche les erreurs d'inscription
    showRegisterError(message) {
        document.getElementById('register-error').textContent = message;
    }

    // Efface les messages d'erreur
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

    // Charger les utilisateurs du localStorage(Pseudo API pour stocker les utilisateurs, ça permet de garder les données même après le 
    // rafraîchissement de la page. Içi on trouve les utilisateurs de test pour pouvoir tester la fonctionnalité de connexion sans devoir s'inscrire à chaque fois)
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

    // Sauvegarder les utilisateurs au localStorage(Ajoute des utilisateur au pseudo API)
    saveUsersToStorage() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new AuthApp();
});
