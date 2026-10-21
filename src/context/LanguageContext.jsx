import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);
const languageNames = { en: 'English', fr: 'Français', sw: 'Kiswahili' };
const translations = {
  fr: {
    Home: 'Accueil', About: 'À propos', Background: 'Parcours', Skills: 'Compétences', Hobbies: 'Loisirs', Documents: 'Documents', Contact: 'Contact', Login: 'Connexion',
    'Open navigation menu': 'Ouvrir le menu de navigation', 'Close navigation menu': 'Fermer le menu de navigation',
    Overview: 'Vue générale', Downloads: 'Téléchargements', 'Landing page': 'Page d’accueil', 'Admin accounts': 'Comptes admin', 'My profile': 'Mon profil',
    WORKSPACE: 'ESPACE DE TRAVAIL', 'View site': 'Voir le site', 'Log out': 'Se déconnecter', 'Logging out…': 'Déconnexion…',
    'Choose where your image appears': 'Choisissez où votre image apparaît', 'Admin account': 'Compte admin', 'Public site': 'Site public',
    'Admin only': 'Admin uniquement', 'Both': 'Les deux', 'Public only': 'Public uniquement', 'Publish image': 'Publier l’image', 'Browse image': 'Choisir une image',
    'Your name': 'Votre nom', 'Email address': 'Adresse e-mail', 'Phone number': 'Numéro de téléphone', Message: 'Message',
    'Send Me a Message': 'Envoyez-moi un message', 'Send Message': 'Envoyer le message', 'Why do you need this document?': 'Pourquoi avez-vous besoin de ce document ?',
    'Get your document': 'Obtenir le document', 'Email address': 'Adresse e-mail', 'Secure document preview': 'Aperçu sécurisé du document',
    'Select country': 'Choisir le pays', 'Enter phone number': 'Saisir le numéro de téléphone', Language: 'Langue',
    Burundi: 'Burundi', 'DR Congo': 'Rép. dém. du Congo', Kenya: 'Kenya', Rwanda: 'Rwanda', Somalia: 'Somalie', 'South Sudan': 'Soudan du Sud', Tanzania: 'Tanzanie', Uganda: 'Ouganda',
    'Choose your East African country code and enter the number. This phone field does not restrict who can visit the website.': 'Choisissez l’indicatif de votre pays d’Afrique de l’Est et saisissez le numéro. Ce champ ne limite pas l’accès au site.',
    'Choose an East African country and enter a valid phone number.': 'Choisissez un pays d’Afrique de l’Est et saisissez un numéro valide.',
    'ADMINISTRATOR': 'ADMINISTRATEUR', 'PROFILE IMAGE': 'IMAGE DE PROFIL', 'Your signed-in admin details and the profile image shown across the portfolio.': 'Vos informations de compte et l’image affichée sur le portfolio.',
    'Dark': 'Sombre', Light: 'Clair', 'Switch to dark mode': 'Passer en mode sombre', 'Switch to light mode': 'Passer en mode clair', 'Toggle light/dark mode': 'Basculer entre les thèmes clair et sombre',
    'These details come from your secure admin session. Sign-in credentials are managed on the server and are never displayed here.': 'Ces informations proviennent de votre session sécurisée. Les identifiants sont gérés sur le serveur et ne sont pas affichés ici.',
    'Signed-in administrator': 'Administrateur connecté', Name: 'Nom', Role: 'Rôle', Session: 'Session', 'Active · secure': 'Active · sécurisée',
    'Choose a JPG, PNG, or WebP image up to 5 MB. Publish it to the public site and your admin account, or set it for the admin account only.': 'Choisissez une image JPG, PNG ou WebP de 5 Mo maximum. Publiez-la sur le site et le compte admin, ou réservez-la au compte admin.',
    'Show this image to': 'Afficher cette image pour', 'Image set for your admin account only.': 'Image réservée à votre compte admin.', 'Image published to the public site and admin account.': 'Image publiée sur le site et le compte admin.', 'Image published to the public site only.': 'Image publiée uniquement sur le site public.',
    'Choose an East African country and enter a valid phone number.': 'Choisissez un pays d’Afrique de l’Est et saisissez un numéro valide.',
    'Get In Touch': 'Me contacter', "Let's Connect": 'Restons en contact',
    'Back to portfolio': 'Retour au portfolio', 'PRIVATE WORKSPACE': 'ESPACE PRIVÉ', 'Welcome back': 'Bon retour', 'Sign in with your administrator credentials to continue.': 'Connectez-vous avec vos identifiants administrateur pour continuer.', Password: 'Mot de passe', 'Back to admin sign-in': 'Retour à la connexion admin',
    'ACCOUNT RECOVERY': 'RÉCUPÉRATION DU COMPTE', 'Reset password': 'Réinitialiser le mot de passe', 'Forgot password?': 'Mot de passe oublié ?', 'Choose a new password for your admin account.': 'Choisissez un nouveau mot de passe pour votre compte admin.', 'Enter your admin email and we will send a one-time reset link if the account exists.': 'Saisissez votre adresse e-mail admin. Si le compte existe, un lien unique de réinitialisation vous sera envoyé.', 'Admin email': 'E-mail admin', 'New password': 'Nouveau mot de passe', 'Confirm new password': 'Confirmer le nouveau mot de passe', 'Please wait…': 'Veuillez patienter…', 'Save new password': 'Enregistrer le nouveau mot de passe', 'Send reset link': 'Envoyer le lien de réinitialisation',
    "I'm always open to interesting conversations, collaboration opportunities, and new projects. Whether you have a question, want to discuss technology, or have an exciting opportunity, feel free to reach out.": 'Je suis toujours ouvert aux échanges intéressants, aux collaborations et aux nouveaux projets. N’hésitez pas à me contacter pour toute question ou opportunité.',
    'I typically respond within 24 hours and would love to hear from you!': 'Je réponds généralement sous 24 heures et serai ravi de vous lire !',
    'Connect on Social Media': 'Retrouvez-moi sur les réseaux sociaux', 'Find me on these platforms for more regular updates:': 'Retrouvez-moi sur ces plateformes pour des nouvelles régulières :', 'Response Time': 'Délai de réponse',
    'I check messages regularly and try to respond within 24 hours.': 'Je consulte régulièrement mes messages et réponds généralement sous 24 heures.', 'For urgent matters, WhatsApp is often the quickest way to reach me.': 'Pour les urgences, WhatsApp est souvent le moyen le plus rapide de me joindre.', 'Connect with me for professional networking and opportunities.': 'Retrouvez-moi sur LinkedIn pour échanger sur les opportunités professionnelles.',
    'About Me': 'À propos de moi', 'Student • Developer • Problem Solver': 'Étudiant • Développeur • Résolveur de problèmes', 'Discover my journey, passions, and what drives me as a computer science enthusiast.': 'Découvrez mon parcours, mes passions et ce qui me motive en informatique.',
    'My Background': 'Mon parcours', 'Education • Experience • Growth': 'Formation • Expérience • Évolution', 'From foundational education to practical experience, here’s the journey that shaped me as a developer and problem-solver.': 'De mes études à mes expériences pratiques, voici le parcours qui a fait de moi un développeur et un résolveur de problèmes.',
    'My Skills': 'Mes compétences', 'Technical Expertise • Languages • Frameworks': 'Expertise technique • Langages • Frameworks', 'A comprehensive overview of my technical abilities and proficiency levels.': 'Un aperçu complet de mes compétences techniques et de mes niveaux de maîtrise.',
    'My Hobbies': 'Mes loisirs', 'Interests • Passions • Activities': 'Centres d’intérêt • Passions • Activités', 'Beyond coding, here’s what makes me tick and fuels my creativity.': 'En dehors du code, découvrez ce qui m’anime et stimule ma créativité.',
    'Contact • Connect • Collaborate': 'Contact • Échange • Collaboration', "Let's talk! I'm always open to new opportunities and collaborations.": 'Parlons-en ! Je suis toujours ouvert aux nouvelles opportunités et collaborations.',
    'CV • Files • Resources': 'CV • Fichiers • Ressources', 'Access my CV, portfolio documents, and other important files.': 'Consultez mon CV, les documents de mon portfolio et d’autres fichiers importants.',
    'Enter a name (2 to 100 characters) and a message (10 to 3,000 characters).': 'Saisissez votre nom (2 à 100 caractères) et un message (10 à 3 000 caractères).',
    'Your message was delivered.': 'Votre message a été envoyé.', 'Failed to send. Please try again.': 'Échec de l’envoi. Veuillez réessayer.', 'Connection issue. Please try again later.': 'Problème de connexion. Réessayez plus tard.',
    'e.g. Jane Doe': 'ex. Jane Dupont', 'Sending...': 'Envoi…',
    'Review visitor activity and open the page responsible for each task.': 'Consultez l’activité des visiteurs et ouvrez la page adaptée à chaque tâche.',
    'Review visitor details and document request status.': 'Consultez les coordonnées des visiteurs et l’état des demandes de documents.',
    'Landing-page edits are saved on the server and visible to every visitor.': 'Les modifications de la page d’accueil sont enregistrées sur le serveur et visibles par tous.',
    'Published documents are stored privately and require visitor details before viewing or downloading.': 'Les documents publiés sont stockés de manière privée. Les visiteurs doivent fournir leurs coordonnées pour les consulter ou les télécharger.',
    'View administrator accounts and send secure, time-limited password reset links.': 'Consultez les comptes administrateur et envoyez des liens sécurisés de réinitialisation à durée limitée.',
    'Update your administrator details and profile image shown across the admin workspace.': 'Modifiez vos informations et l’image affichée dans l’espace administrateur.',
    'SECURE PREVIEW': 'APERÇU SÉCURISÉ', 'DOCUMENT REQUEST': 'DEMANDE DE DOCUMENT', 'Enter your email and verify it before viewing this document. Preview access is not added to the admin request list.': 'Saisissez et vérifiez votre e-mail avant de consulter le document. La consultation ne sera pas ajoutée aux demandes admin.',
    'Enter your contact details and verify your email before downloading this document. Your request is recorded for the administrator.': 'Saisissez vos coordonnées et vérifiez votre e-mail avant le téléchargement. Votre demande sera enregistrée pour l’administrateur.',
    'Send code to this email': 'Envoyer un code à cette adresse', 'Why do you need this document?': 'Pourquoi avez-vous besoin de ce document ?',
    'Enter a valid email address.': 'Saisissez une adresse e-mail valide.', 'We’ll send a six-digit verification code to this address.': 'Nous enverrons un code de vérification à six chiffres à cette adresse.'
  },
  sw: {
    Home: 'Mwanzo', About: 'Kuhusu', Background: 'Historia', Skills: 'Ujuzi', Hobbies: 'Burudani', Documents: 'Nyaraka', Contact: 'Mawasiliano', Login: 'Ingia',
    'Open navigation menu': 'Fungua menyu ya urambazaji', 'Close navigation menu': 'Funga menyu ya urambazaji',
    Overview: 'Muhtasari', Downloads: 'Vipakuliwa', 'Landing page': 'Ukurasa wa mwanzo', 'Admin accounts': 'Akaunti za msimamizi', 'My profile': 'Wasifu wangu',
    WORKSPACE: 'ENEO LA KAZI', 'View site': 'Tazama tovuti', 'Log out': 'Toka', 'Logging out…': 'Inatoka…',
    'Choose where your image appears': 'Chagua sehemu picha yako itaonekana', 'Admin account': 'Akaunti ya msimamizi', 'Public site': 'Tovuti ya umma',
    'Admin only': 'Msimamizi pekee', Both: 'Zote mbili', 'Public only': 'Umma pekee', 'Publish image': 'Chapisha picha', 'Browse image': 'Chagua picha',
    'Your name': 'Jina lako', 'Email address': 'Anwani ya barua pepe', 'Phone number': 'Nambari ya simu', Message: 'Ujumbe',
    'Send Me a Message': 'Nitumie ujumbe', 'Send Message': 'Tuma ujumbe', 'Why do you need this document?': 'Kwa nini unahitaji hati hii?',
    'Get your document': 'Pata hati yako', 'Secure document preview': 'Hakiki salama ya hati', 'Select country': 'Chagua nchi', 'Enter phone number': 'Weka nambari ya simu', Language: 'Lugha',
    Burundi: 'Burundi', 'DR Congo': 'DR Kongo', Kenya: 'Kenya', Rwanda: 'Rwanda', Somalia: 'Somalia', 'South Sudan': 'Sudan Kusini', Tanzania: 'Tanzania', Uganda: 'Uganda',
    'Choose your East African country code and enter the number. This phone field does not restrict who can visit the website.': 'Chagua msimbo wa nchi ya Afrika Mashariki na uweke nambari. Sehemu hii haizuii mtu yeyote kutembelea tovuti.',
    'Choose an East African country and enter a valid phone number.': 'Chagua nchi ya Afrika Mashariki na uweke nambari sahihi ya simu.',
    'ADMINISTRATOR': 'MSIMAMIZI', 'PROFILE IMAGE': 'PICHA YA WASIFU', 'Your signed-in admin details and the profile image shown across the portfolio.': 'Maelezo ya akaunti yako na picha inayoonekana kwenye tovuti.',
    Dark: 'Giza', Light: 'Mwanga', 'Switch to dark mode': 'Badili hadi hali ya giza', 'Switch to light mode': 'Badili hadi hali ya mwanga', 'Toggle light/dark mode': 'Badili kati ya mandhari ya mwanga na giza',
    'These details come from your secure admin session. Sign-in credentials are managed on the server and are never displayed here.': 'Maelezo haya yanatoka kwenye kipindi chako salama cha msimamizi. Taarifa za kuingia huhifadhiwa kwenye seva na hazionyeshwi hapa.',
    'Signed-in administrator': 'Msimamizi aliyeingia', Name: 'Jina', Role: 'Jukumu', Session: 'Kipindi', 'Active · secure': 'Hai · salama',
    'Choose a JPG, PNG, or WebP image up to 5 MB. Publish it to the public site and your admin account, or set it for the admin account only.': 'Chagua picha ya JPG, PNG au WebP isiyozidi MB 5. Ichapishe kwenye tovuti na akaunti yako au kwenye akaunti pekee.',
    'Show this image to': 'Onyesha picha hii kwa', 'Image set for your admin account only.': 'Picha imewekwa kwa akaunti yako ya msimamizi pekee.', 'Image published to the public site and admin account.': 'Picha imechapishwa kwenye tovuti na akaunti ya msimamizi.', 'Image published to the public site only.': 'Picha imechapishwa kwenye tovuti ya umma pekee.',
    'Get In Touch': 'Wasiliana nami', "Let's Connect": 'Tuungane',
    'Back to portfolio': 'Rudi kwenye tovuti', 'PRIVATE WORKSPACE': 'ENEO LA MSIMAMIZI', 'Welcome back': 'Karibu tena', 'Sign in with your administrator credentials to continue.': 'Ingia kwa kutumia taarifa za msimamizi ili kuendelea.', Password: 'Nenosiri', 'Back to admin sign-in': 'Rudi kwenye kuingia kwa msimamizi',
    'ACCOUNT RECOVERY': 'UREJESHAJI WA AKAUNTI', 'Reset password': 'Weka upya nenosiri', 'Forgot password?': 'Umesahau nenosiri?', 'Choose a new password for your admin account.': 'Chagua nenosiri jipya la akaunti yako ya msimamizi.', 'Enter your admin email and we will send a one-time reset link if the account exists.': 'Weka barua pepe ya msimamizi. Tutatuma kiungo cha kuweka upya nenosiri ikiwa akaunti ipo.', 'Admin email': 'Barua pepe ya msimamizi', 'New password': 'Nenosiri jipya', 'Confirm new password': 'Thibitisha nenosiri jipya', 'Please wait…': 'Subiri tafadhali…', 'Save new password': 'Hifadhi nenosiri jipya', 'Send reset link': 'Tuma kiungo cha kuweka upya',
    "I'm always open to interesting conversations, collaboration opportunities, and new projects. Whether you have a question, want to discuss technology, or have an exciting opportunity, feel free to reach out.": 'Niko tayari kwa mazungumzo, ushirikiano na miradi mipya. Wasiliana nami ukiwa na swali au fursa.',
    'I typically respond within 24 hours and would love to hear from you!': 'Kwa kawaida hujibu ndani ya saa 24 na nitafurahi kusikia kutoka kwako!',
    'Connect on Social Media': 'Ungana nami kwenye mitandao ya kijamii', 'Find me on these platforms for more regular updates:': 'Nipate kwenye majukwaa haya kwa taarifa za mara kwa mara:', 'Response Time': 'Muda wa kujibu',
    'I check messages regularly and try to respond within 24 hours.': 'Ninaangalia ujumbe mara kwa mara na hujibu ndani ya saa 24.', 'For urgent matters, WhatsApp is often the quickest way to reach me.': 'Kwa mambo ya dharura, WhatsApp ndiyo njia ya haraka zaidi kunifikia.', 'Connect with me for professional networking and opportunities.': 'Ungana nami kwenye LinkedIn kwa fursa za kitaaluma.',
    'About Me': 'Kuhusu mimi', 'Student • Developer • Problem Solver': 'Mwanafunzi • Msanidi • Mtatatuzi wa matatizo', 'Discover my journey, passions, and what drives me as a computer science enthusiast.': 'Jifunze kuhusu safari yangu, mambo ninayopenda na kinachonipa msukumo katika sayansi ya kompyuta.',
    'My Background': 'Historia yangu', 'Education • Experience • Growth': 'Elimu • Uzoefu • Maendeleo', 'From foundational education to practical experience, here’s the journey that shaped me as a developer and problem-solver.': 'Kuanzia elimu ya msingi hadi uzoefu wa vitendo, hii ndiyo safari iliyonijenga kuwa msanidi na mtatuzi wa matatizo.',
    'My Skills': 'Ujuzi wangu', 'Technical Expertise • Languages • Frameworks': 'Utaalamu wa teknolojia • Lugha • Mifumo', 'A comprehensive overview of my technical abilities and proficiency levels.': 'Muhtasari wa uwezo wangu wa kiufundi na viwango vya ujuzi.',
    'My Hobbies': 'Burudani zangu', 'Interests • Passions • Activities': 'Mapendeleo • Mambo ninayopenda • Shughuli', 'Beyond coding, here’s what makes me tick and fuels my creativity.': 'Zaidi ya kuandika programu, haya ndiyo mambo yanayonipa hamasa na ubunifu.',
    'Contact • Connect • Collaborate': 'Mawasiliano • Unganisha • Shirikiana', "Let's talk! I'm always open to new opportunities and collaborations.": 'Tuzungumze! Niko tayari kwa fursa mpya na ushirikiano.',
    'CV • Files • Resources': 'CV • Faili • Rasilimali', 'Access my CV, portfolio documents, and other important files.': 'Fungua CV yangu, hati za tovuti na faili nyingine muhimu.',
    'Enter a name (2 to 100 characters) and a message (10 to 3,000 characters).': 'Weka jina lako (herufi 2 hadi 100) na ujumbe (herufi 10 hadi 3,000).',
    'Your message was delivered.': 'Ujumbe wako umetumwa.', 'Failed to send. Please try again.': 'Imeshindikana kutuma. Tafadhali jaribu tena.', 'Connection issue. Please try again later.': 'Tatizo la muunganisho. Jaribu tena baadaye.',
    'e.g. Jane Doe': 'mf. Jane Doe', 'Sending...': 'Inatuma…',
    'Review visitor activity and open the page responsible for each task.': 'Kagua shughuli za wageni na ufungue ukurasa unaohusika na kila kazi.',
    'Review visitor details and document request status.': 'Kagua maelezo ya wageni na hali ya maombi ya hati.',
    'Landing-page edits are saved on the server and visible to every visitor.': 'Mabadiliko ya ukurasa wa mwanzo huhifadhiwa kwenye seva na kuonekana kwa wageni wote.',
    'Published documents are stored privately and require visitor details before viewing or downloading.': 'Hati zilizochapishwa huhifadhiwa kwa faragha. Wageni wanahitaji kutoa maelezo kabla ya kuzitazama au kupakua.',
    'View administrator accounts and send secure, time-limited password reset links.': 'Tazama akaunti za wasimamizi na utume viungo salama vya kuweka upya nenosiri vyenye muda maalum.',
    'Update your administrator details and profile image shown across the admin workspace.': 'Sasisha maelezo yako na picha inayoonekana katika eneo la msimamizi.',
    'SECURE PREVIEW': 'HAKIKI SALAMA', 'DOCUMENT REQUEST': 'OMBI LA HATI', 'Enter your email and verify it before viewing this document. Preview access is not added to the admin request list.': 'Weka na uthibitishe barua pepe yako kabla ya kutazama hati hii. Hakiki haitaongezwa kwenye orodha ya maombi ya msimamizi.',
    'Enter your contact details and verify your email before downloading this document. Your request is recorded for the administrator.': 'Weka maelezo yako ya mawasiliano na uthibitishe barua pepe kabla ya kupakua hati hii. Ombi lako litahifadhiwa kwa msimamizi.',
    'Send code to this email': 'Tuma msimbo kwenye barua pepe hii', 'Why do you need this document?': 'Kwa nini unahitaji hati hii?',
    'Enter a valid email address.': 'Weka anwani sahihi ya barua pepe.', 'We’ll send a six-digit verification code to this address.': 'Tutatuma msimbo wa uthibitisho wa tarakimu sita kwenye anwani hii.'
  }
};

export function LanguageProvider({ children }) {
  const isAdmin = typeof window !== 'undefined' && /admin(?:-|\.html|$)/.test(window.location.pathname.split('/').pop() || '');
  const storageKey = `kade-language-${isAdmin ? 'admin' : 'visitor'}`;
  const [language, setLanguage] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return Object.hasOwn(languageNames, saved) ? saved : 'en';
    } catch { return 'en'; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(storageKey, language); } catch { /* Language still applies for this page. */ }
    document.documentElement.lang = language;
  }, [language, storageKey]);
  const value = useMemo(() => ({ language, setLanguage, t: (text) => translations[language]?.[text] || text, languageNames }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider.');
  return context;
}
