// Configuration - MOT DE PASSE MODIFIABLE ICI
const ADMIN_PASSWORD = 'Andowl'; // CHANGEZ LE MOT DE PASSE ICI

// Variables globales
let isAuthenticated = false;
let currentTheme = 'glassmorphism';
let currentLang = 'es'; // Espagnol par défaut

// Textes multilingues
const texts = {
    es: {
        loginTitle: 'Acceso a Horarios',
        fullNamePlaceholder: 'Nombre completo (ej: Juan Pérez García)',
        passwordPlaceholder: 'Contraseña',
        loginButton: 'Iniciar Sesión',
        appTitle: 'Horarios Escolares',
        logout: 'Cerrar Sesión',
        classSchedule: 'Horario de Clases',
        breakSchedule: 'Horarios de Recreos, Almuerzo e Idas al Baño',
        subject: 'Materia',
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        grades: 'Cursos',
        recess1st: 'Hora Recreo 1er Tiempo y Cafetería',
        bathroom1st: 'Ida al Baño 1er Tiempo',
        lunch: 'Almuerzo',
        recess2nd: '2do Tiempo Cafetería',
        createdBy: 'Creado por',
        invalidName: 'Nombre inválido. Use su nombre completo (ej: Juan Pérez García)',
        wrongPassword: 'Contraseña incorrecta',
        securityAlert: 'Acceso no autorizado detectado'
    },
    fr: {
        loginTitle: 'Accès aux Horaires',
        fullNamePlaceholder: 'Nom complet (ex: Jean Dupont Martin)',
        passwordPlaceholder: 'Mot de passe',
        loginButton: 'Se connecter',
        appTitle: 'Horaires Scolaires',
        logout: 'Déconnexion',
        classSchedule: 'Horaire des Cours',
        breakSchedule: 'Horaires des Récréations, Déjeuner et Toilettes',
        subject: 'Matière',
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        grades: 'Classes',
        recess1st: 'Récréation 1er Temps et Cafétéria',
        bathroom1st: 'Toilettes 1er Temps',
        lunch: 'Déjeuner',
        recess2nd: '2ème Temps Cafétéria',
        createdBy: 'Créé par',
        invalidName: 'Nom invalide. Utilisez votre nom complet (ex: Jean Dupont Martin)',
        wrongPassword: 'Mot de passe incorrect',
        securityAlert: 'Accès non autorisé détecté'
    }
};

// Protection avancée contre les captures d'écran et enregistrements
class SecurityProtection {
    constructor() {
        this.isRecording = false;
        this.protectionLevel = 'high';
        this.init();
    }

    init() {
        this.preventDevTools();
        this.preventScreenCapture();
        this.preventContextMenu();
        this.preventSelection();
        this.detectScreenRecording();
        this.preventPrintScreen();
        this.monitorVisibility();
        this.preventDragDrop();
    }

    // Protection contre les outils de développement
    preventDevTools() {
        // Désactiver F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }
            
            // Ctrl+Shift+I (Outils de développement)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }
            
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }
            
            // Ctrl+U (Voir le code source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }
            
            // Ctrl+Shift+C (Inspecteur)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }

            // Ctrl+S (Sauvegarder)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }
        });

        // Détection de l'ouverture des DevTools
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                this.hideContent();
            }
        }, 500);
    }

    // Protection contre les captures d'écran
    preventScreenCapture() {
        // Protection contre Print Screen
        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 44) { // PrtSc
                this.hideContent();
                setTimeout(() => this.showContent(), 200);
            }
        });

        // Protection contre les raccourcis Windows
        document.addEventListener('keydown', (e) => {
            // Windows + Print Screen
            if (e.metaKey && e.keyCode === 44) {
                e.preventDefault();
                this.hideContent();
                return false;
            }
            
            // Alt + Print Screen
            if (e.altKey && e.keyCode === 44) {
                e.preventDefault();
                this.hideContent();
                return false;
            }
        });
    }

    // Détection d'enregistrement d'écran
    detectScreenRecording() {
        // Vérifier les API de capture d'écran
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
            navigator.mediaDevices.getDisplayMedia = function() {
                security.showSecurityAlert();
                security.hideContent();
                return Promise.reject(new Error('Capture d\'écran bloquée'));
            };
        }

        // Surveiller les changements de visibilité
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.hideContent();
            } else {
                setTimeout(() => this.showContent(), 100);
            }
        });

        // Détecter le changement de focus
        window.addEventListener('blur', () => {
            this.hideContent();
        });

        window.addEventListener('focus', () => {
            setTimeout(() => this.showContent(), 100);
        });
    }

    // Prévenir l'impression
    preventPrintScreen() {
        // Désactiver Ctrl+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.keyCode === 80) {
                e.preventDefault();
                this.showSecurityAlert();
                return false;
            }
        });

        // Masquer le contenu lors de l'impression
        window.addEventListener('beforeprint', (e) => {
            e.preventDefault();
            this.hideContent();
            return false;
        });
    }

    // Désactiver le menu contextuel
    preventContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSecurityAlert();
            return false;
        });
    }

    // Désactiver la sélection
    preventSelection() {
        document.onselectstart = () => false;
        document.onmousedown = () => false;
        
        // Désactiver la sélection avec le clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.keyCode === 65 || e.keyCode === 67)) { // Ctrl+A, Ctrl+C
                e.preventDefault();
                return false;
            }
        });
    }

    // Prévenir le glisser-déposer
    preventDragDrop() {
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            return false;
        });
    }

    // Surveiller la visibilité de la page
    monitorVisibility() {
        // Détecter les extensions de capture d'écran
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;
        
        setInterval(() => {
            try {
                const imageData = ctx.getImageData(0, 0, 1, 1);
                if (imageData.data.some(pixel => pixel !== 0)) {
                    this.hideContent();
                }
            } catch (e) {
                // Canvas contaminé - possible capture
                this.hideContent();
            }
        }, 1000);
    }

    // Masquer le contenu
    hideContent() {
        document.body.classList.add('temp-hide');
        const mainApp = document.getElementById('main-app');
        const loginScreen = document.getElementById('login-screen');
        
        if (mainApp && mainApp.style.display !== 'none') {
            mainApp.style.visibility = 'hidden';
        }
        if (loginScreen && loginScreen.style.display !== 'none') {
            loginScreen.style.visibility = 'hidden';
        }
    }

    // Afficher le contenu
    showContent() {
        document.body.classList.remove('temp-hide');
        const mainApp = document.getElementById('main-app');
        const loginScreen = document.getElementById('login-screen');
        
        if (mainApp && mainApp.style.display !== 'none') {
            mainApp.style.visibility = 'visible';
        }
        if (loginScreen && loginScreen.style.display !== 'none') {
            loginScreen.style.visibility = 'visible';
        }
    }

    // Alerte de sécurité
    showSecurityAlert() {
        const alertMsg = texts[currentLang].securityAlert;
        console.warn('🚨 TENTATIVE D\'ACCÈS NON AUTORISÉ DÉTECTÉE 🚨');
        
        // Masquer le contenu temporairement
        this.hideContent();
        
        // Afficher l'alerte après un délai
        setTimeout(() => {
            if (confirm(alertMsg + ' - Continuer ?')) {
                this.showContent();
            } else {
                window.location.href = 'about:blank';
            }
        }, 500);
    }
}

// Validation du nom complet
function isValidFullName(name) {
    // Vérifie que le nom contient au moins 2 mots séparés par des espaces
    // et ne contient pas de chiffres ou caractères spéciaux comme dans les surnoms
    const namePattern = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]{2,}$/;
    const words = name.trim().split(/\s+/);
    
    return namePattern.test(name) && 
           words.length >= 2 && 
           words.every(word => word.length >= 2) &&
           !/\d/.test(name) &&
           !/[^A-Za-zÀ-ÿ\u00f1\u00d1\s]/.test(name);
}

// Fonction de connexion
function login(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('full-name').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    errorDiv.style.display = 'none';
    
    if (!isValidFullName(fullName)) {
        showError(texts[currentLang].invalidName);
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        showError(texts[currentLang].wrongPassword);
        return;
    }
    
    // Connexion réussie
    isAuthenticated = true;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Réinitialiser le formulaire
    document.getElementById('full-name').value = '';
    document.getElementById('password').value = '';
    
    updateLanguage();
}

// Afficher une erreur
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Déconnexion
function logout() {
    isAuthenticated = false;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    
    // Réinitialiser les erreurs
    document.getElementById('error-message').style.display = 'none';
}

// Changer le thème
function changeTheme(theme) {
    currentTheme = theme;
    
    // Supprimer tous les thèmes existants
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    // Ajouter le nouveau thème
    document.body.classList.add('no-select', `theme-${theme}`);
}

// Changer la langue
function changeLanguage(lang) {
    currentLang = lang;
    updateLanguage();
}

// Mettre à jour les textes selon la langue
function updateLanguage() {
    const elements = {
        'login-title': 'loginTitle',
        'app-title': 'appTitle',
        'class-schedule-title': 'classSchedule',
        'break-schedule-title': 'breakSchedule',
        'subject-header': 'subject',
        'monday-header': 'monday',
        'tuesday-header': 'tuesday',
        'wednesday-header': 'wednesday',
        'thursday-header': 'thursday',
        'friday-header': 'friday',
        'grades-header': 'grades',
        'recess1st-header': 'recess1st',
        'bathroom1st-header': 'bathroom1st',
        'lunch-header': 'lunch',
        'recess2nd-header': 'recess2nd',
        'created-by': 'createdBy',
        'logout-btn': 'logout',
        'login-btn': 'loginButton'
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = texts[currentLang][elements[id]];
        }
    });
    
    // Mettre à jour les placeholders
    const fullNameInput = document.getElementById('full-name');
    const passwordInput = document.getElementById('password');
    
    if (fullNameInput) {
        fullNameInput.placeholder = texts[currentLang].fullNamePlaceholder;
    }
    
    if (passwordInput) {
        passwordInput.placeholder = texts[currentLang].passwordPlaceholder;
    }
}

// Initialisation de l'application
function initApp() {
    // Initialiser la protection de sécurité
    window.security = new SecurityProtection();
    
    // Événements du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    // Événement de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Événements de changement de thème et langue
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            changeTheme(e.target.value);
        });
    }
    
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    const languageLogin = document.getElementById('language-login');
    if (languageLogin) {
        languageLogin.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    // Définir le thème et la langue par défaut
    changeTheme(currentTheme);
    changeLanguage(currentLang);
    
    // Définir les valeurs par défaut des sélecteurs
    if (themeSelector) themeSelector.value = currentTheme;
    if (languageSelector) languageSelector.value = currentLang;
    if (languageLogin) languageLogin.value = currentLang;
}

// Protection contre l'exécution de code malveillant
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
Object.freeze(Function.prototype);

// Protection contre les modifications du DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // Vérifier les scripts injectés
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'SCRIPT') {
                    node.remove();
                    if (window.security) {
                        window.security.showSecurityAlert();
                    }
                }
            });
        }
    });
});

// Démarrer l'observation
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Console warning
console.warn('🚨 ACCÈS NON AUTORISÉ 🚨');
console.warn('Cette application est protégée contre les captures d\'écran et l\'inspection.');
console.warn('Toute tentative de contournement sera détectée.');

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', initApp);

// Protection finale contre les tentatives de contournement
window.addEventListener('load', () => {
    // Masquer les barres de défilement pendant les captures
    let isHiding = false;
    
    const hideScrollbars = () => {
        if (!isHiding) {
            isHiding = true;
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                document.body.style.overflow = 'auto';
                isHiding = false;
            }, 100);
        }
    };
    
    // Écouter les événements de capture potentiels
    ['focus', 'blur', 'resize'].forEach(event => {
        window.addEventListener(event, hideScrollbars);
    });
    
    // Protection contre les raccourcis clavier avancés
    document.addEventListener('keydown', (e) => {
        // Empêcher Ctrl+Shift+K (Firefox Web Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 75) {
            e.preventDefault();
            if (window.security) {
                window.security.showSecurityAlert();
            }
            return false;
        }
        
        // Empêcher F1 (Aide)
        if (e.keyCode === 112) {
            e.preventDefault();
            return false;
        }
    });
    
    // Détection des changements de taille de fenêtre (DevTools)
    let lastInnerWidth = window.innerWidth;
    let lastInnerHeight = window.innerHeight;
    
    setInterval(() => {
        if (window.innerWidth !== lastInnerWidth || window.innerHeight !== lastInnerHeight) {
            if (window.security && 
                (Math.abs(window.innerWidth - lastInnerWidth) > 100 || 
                 Math.abs(window.innerHeight - lastInnerHeight) > 100)) {
                window.security.hideContent();
                setTimeout(() => {
                    if (window.security) {
                        window.security.showContent();
                    }
                }, 500);
            }
            lastInnerWidth = window.innerWidth;
            lastInnerHeight = window.innerHeight;
        }
    }, 100);
});