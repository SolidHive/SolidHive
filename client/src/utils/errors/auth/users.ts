export const userErrorMessages = {
    required: {
        email: "L'adresse email est requise",
        password: 'Le mot de passe est requis',
        name: 'Le nom est requis',
        firstname: 'Le prénom est requis',
        confirmPassword: 'La confirmation du mot de passe est requise',
        siret: 'Le numéro SIRET est requis'
    },
    format: {
        email: 'Veuillez fournir une adresse email valide',
        confirmPassword: 'Les mots de passe ne correspondent pas',
        phone: 'Format de téléphone français invalide (10 chiffres commençant par 0)',
        siret: 'Le SIRET doit contenir exactement 14 chiffres',
        businessEmail: 'Veuillez utiliser une adresse email professionnelle'
    },
    password: {
        invalid:
            'Le mot de passe doit contenir au moins 10 caractères, une minuscule, une majuscule, un chiffre et un symbole'
    },
    patterns: {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        password:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/,
        phone: /^0[1-9][0-9]{8}$/,
        siret: /^\d{14}$/
    },
    auth: {
        invalidCredentials: 'Échec de la connexion. Vérifiez vos identifiants.'
    },
    length: {
        name: 'Le nom doit contenir entre 1 et 50 caractères',
        firstname: 'Le prénom doit contenir entre 1 et 50 caractères',
        phone: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
        siret: 'Le SIRET doit contenir exactement 14 chiffres'
    },
    apiErrors: {
        400: 'Données invalides, veuillez vérifier le formulaire.',
        401: "Votre compte n'est pas vérifié. Veuillez vérifier votre email avant de vous connecter.",
        409: "L'inscription a échoué. Vérifiez vos informations ou contactez le support.",
        429: 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.',
        500: 'Erreur serveur, veuillez réessayer plus tard.',
        unknown: "Une erreur est survenue lors de l'inscription."
    },
    personalEmailDomains: [
        'gmail.com',
        'yahoo.com',
        'yahoo.fr',
        'hotmail.com',
        'hotmail.fr',
        'outlook.com',
        'outlook.fr',
        'live.com',
        'live.fr',
        'aol.com',
        'orange.fr',
        'wanadoo.fr',
        'free.fr',
        'sfr.fr',
        'laposte.net',
        'protonmail.com',
        'mail.com',
        'gmx.com',
        'icloud.com',
        'me.com'
    ]
};
