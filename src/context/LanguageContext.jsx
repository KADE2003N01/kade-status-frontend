import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);
const languageNames = { en: 'English', fr: 'Français', sw: 'Kiswahili' };
const translatedTextNodes = new WeakMap();
const translatedAttributes = new WeakMap();
const translations = {
  fr: {
    'Homepage content language': 'Langue du contenu de la page d’accueil', 'Add a French and Kiswahili version for each text field. Existing translations from the language catalog are prefilled where available.': 'Ajoutez une version française et kiswahili à chaque texte. Les traductions existantes du catalogue sont préremplies lorsqu’elles sont disponibles.', 'This field is empty in English.': 'Ce champ est vide en anglais.', 'No catalog translation yet. Add a translation here to avoid English appearing in this language.': 'Aucune traduction du catalogue n’est disponible. Ajoutez une traduction ici pour éviter que le texte reste en anglais.', 'Load the homepage content before adding translations.': 'Chargez le contenu de la page d’accueil avant d’ajouter des traductions.', 'Title': 'Titre', 'Tagline': 'Slogan', 'Brand Name': 'Nom de marque', 'Login Label': 'Libellé de connexion', 'Contact Text': 'Texte de contact', 'Contact Label': 'Libellé de contact', 'Button Label': 'Libellé du bouton', 'Eyebrow': 'Sur-titre', 'Title First': 'Première partie du titre', 'Title Second': 'Deuxième partie du titre', 'Admin Name': 'Nom de l’administrateur', 'Built By': 'Réalisé par', 'Quick Links Title': 'Titre des liens rapides', 'Services Title': 'Titre des services', 'Social Title': 'Titre des réseaux sociaux', 'Copyright': 'Droits d’auteur', 'Summary': 'Résumé',
    'Copyright {year} {name}. All rights reserved.': '© {year} {name}. Tous droits réservés.',
    'Computer Science Student | Frontend Developer': 'Étudiant en informatique | Développeur frontend', 'I build responsive, user-friendly web experiences and keep learning how thoughtful software can solve real problems.': 'Je crée des expériences web adaptatives et faciles à utiliser, et j’apprends comment des logiciels bien conçus peuvent résoudre des problèmes concrets.', 'Explore my documents': 'Consulter mes documents', 'My background': 'Mon parcours', 'Have a project or opportunity?': 'Vous avez un projet ou une opportunité ?', 'Let\'s connect': 'Entrons en contact', 'A LITTLE ABOUT ME': 'UN PEU À MON SUJET', 'Curious by nature.': 'Curieux de nature.', 'Developer by choice.': 'Développeur par choix.', 'I\'m David KWIZERA, a Computer Science student at the University of Rwanda. I enjoy turning ideas into clear, useful digital experiences and growing my skills through hands-on projects.': 'Je suis David KWIZERA, étudiant en informatique à l’Université du Rwanda. J’aime transformer des idées en expériences numériques claires et utiles et développer mes compétences grâce à des projets pratiques.', 'Get to know me': 'En savoir plus sur moi', 'WELCOME': 'BIENVENUE', 'Hey there — I\'m glad you stopped by 👋': 'Bonjour, ravi de votre visite 👋', 'Pull up a chair and look around. This space holds my story, the things I\'m learning, and the work I\'m proud of. Take your time — there\'s plenty to explore.': 'Installez-vous et découvrez mon parcours, ce que j’apprends et les projets dont je suis fier. Prenez votre temps, il y a beaucoup à découvrir.', 'Need my CV or certificates?': 'Besoin de mon CV ou de mes certificats ?', 'Browse and download the latest documents from the portfolio document center.': 'Consultez et téléchargez les derniers documents du centre de documents du portfolio.', 'Visit document center': 'Visiter le centre de documents', 'Building elegant solutions through code': 'Créer des solutions élégantes avec le code', 'Computer Science student | Frontend Developer | Problem Solver': 'Étudiant en informatique | Développeur frontend | Résolution de problèmes', 'Quick Links': 'Liens rapides', 'Services': 'Services', 'Connect With Me': 'Me contacter', 'Web Development': 'Développement web', 'UI/UX Design': 'Conception UI/UX', 'Consulting': 'Conseil', 'GitHub': 'GitHub', 'LinkedIn': 'LinkedIn', 'WhatsApp': 'WhatsApp', 'Facebook': 'Facebook', 'Built by KadeTech': 'Réalisé par KadeTech', 'All rights reserved.': 'Tous droits réservés.',
    'Welcome to My': 'Bienvenue dans mon', 'Document Center': 'espace de documents', 'Thank you for your interest in my professional profile. Submit your contact details before previewing or downloading documents.': 'Merci de votre intérêt pour mon profil professionnel. Saisissez vos coordonnées avant de consulter ou télécharger les documents.', 'About These Documents': 'À propos de ces documents', 'Professional & Up-to-Date': 'Professionnels et à jour', 'My curriculum vitae contains comprehensive information about my educational background, professional experience, technical skills, and notable achievements. All documents are regularly updated and formatted for professional review.': 'Mon curriculum vitæ présente ma formation, mon expérience professionnelle, mes compétences techniques et mes principales réalisations. Tous les documents sont régulièrement mis à jour et préparés pour une consultation professionnelle.', 'Secure Download': 'Téléchargement sécurisé', 'Always Current': 'Toujours à jour', 'PDF Format': 'Format PDF', 'Published CVs': 'CV publiés', 'Curriculum Vitae': 'Curriculum vitæ', 'Latest': 'Le plus récent', 'Virus Free': 'Sans virus', 'Secure': 'Sécurisé', 'Professional certificate': 'Certificat professionnel', 'No certificates added yet': 'Aucun certificat ajouté', 'Certificates will appear here as soon as they are added.': 'Les certificats apparaîtront ici dès leur ajout.', 'View': 'Consulter', 'Download': 'Télécharger', 'Close form': 'Fermer le formulaire', 'Verification code': 'Code de vérification', 'Verify code': 'Vérifier le code', 'Resend code': 'Renvoyer le code', 'Change email address': 'Modifier l’adresse e-mail', 'Preparing download…': 'Préparation du téléchargement…', 'Opening preview…': 'Ouverture de l’aperçu…', 'Open secure preview': 'Ouvrir l’aperçu sécurisé', 'Continue to download': 'Continuer le téléchargement', 'Your verified download is starting.': 'Votre téléchargement vérifié démarre.', 'Could not open the document. Please try again.': 'Impossible d’ouvrir le document. Veuillez réessayer.', 'Update your email address, then request another code.': 'Modifiez votre adresse e-mail, puis demandez un nouveau code.', 'Enter the six-digit verification code.': 'Saisissez le code de vérification à six chiffres.', 'Your email address is verified. Continue when you’re ready.': 'Votre adresse e-mail est vérifiée. Vous pouvez continuer.', 'I agree to use my email address to verify preview access. It will not be added to the admin request list.': 'J’accepte d’utiliser mon adresse e-mail pour vérifier l’accès à l’aperçu. Elle ne sera pas ajoutée à la liste des demandes admin.', 'I agree to have my contact details and reason saved for this download request.': 'J’accepte que mes coordonnées et le motif soient enregistrés pour cette demande de téléchargement.', 'sent to your': 'envoyé à votre', 'Please agree to email verification before requesting a code.': 'Veuillez accepter la vérification par e-mail avant de demander un code.', 'Please complete your name, phone number, reason, and consent before requesting a code.': 'Veuillez renseigner votre nom, votre numéro de téléphone, le motif et votre consentement avant de demander un code.',
    'My Journey': 'Mon parcours', 'What Drives Me': 'Ce qui me motive', 'Career Vision': 'Mon projet professionnel',
    'I am a Computer Science student at the University of Rwanda with a strong passion for backend development, artificial intelligence, and mobile applications.': 'Je suis étudiant en informatique à l’Université du Rwanda et passionné par le développement backend, l’intelligence artificielle et les applications mobiles.',
    "I enjoy turning complex problems into clean, efficient solutions — whether that's building REST APIs, training ML models, or crafting mobile experiences with Flutter.": 'J’aime transformer des problèmes complexes en solutions claires et efficaces, qu’il s’agisse de créer des API REST, d’entraîner des modèles d’apprentissage automatique ou de concevoir des applications mobiles avec Flutter.',
    "When I'm not coding, I'm exploring new technologies, contributing to open source, or sharpening my problem-solving skills on competitive platforms.": 'Quand je ne code pas, je découvre de nouvelles technologies, contribue à des projets open source ou perfectionne ma résolution de problèmes sur des plateformes de compétition.',
    'I started my programming journey in high school with Java and C++, quickly realizing my passion for solving real-world problems through code. Over the years, I\'ve expanded my skill set to cover full-stack web development, data structures, algorithms, and emerging technologies like AI and machine learning.': 'J’ai commencé la programmation au lycée avec Java et C++, puis j’ai découvert ma passion pour la résolution de problèmes concrets grâce au code. J’ai depuis développé mes compétences en développement web full stack, structures de données, algorithmes, intelligence artificielle et apprentissage automatique.',
    'My academic path at University of Rwanda has been instrumental in deepening my understanding of computer science principles. I\'ve worked on various projects ranging from desktop GUI applications using Java Swing to responsive web interfaces with modern frontend frameworks.': 'Mon parcours à l’Université du Rwanda a approfondi ma compréhension des principes de l’informatique. J’ai travaillé sur des projets variés, des applications de bureau avec Java Swing aux interfaces web adaptatives avec des outils frontend modernes.',
    "I'm fascinated by emerging technologies and how they can transform industries and improve lives.": 'Les nouvelles technologies me passionnent par leur capacité à transformer les secteurs et à améliorer la vie quotidienne.', 'I love tackling challenging problems and finding elegant, efficient solutions.': 'J’aime relever des défis et trouver des solutions élégantes et efficaces.', 'Technology is ever-evolving, and I\'m committed to staying updated with the latest tools and best practices.': 'La technologie évolue sans cesse et je tiens à suivre les derniers outils et les meilleures pratiques.', 'I believe in the power of teamwork and contributing to communities that push technology forward.': 'Je crois au travail d’équipe et à la contribution aux communautés qui font progresser la technologie.', 'Innovation:': 'Innovation :', 'Problem-Solving:': 'Résolution de problèmes :', 'Continuous Learning:': 'Apprentissage continu :', 'Collaboration:': 'Collaboration :',
    'My goal is to become a full-stack developer capable of architecting scalable systems and mentoring junior developers. I aspire to work on impactful projects that leverage AI and modern web technologies to solve meaningful problems in education, healthcare, and social impact sectors.': 'Mon objectif est de devenir développeur full stack, de concevoir des systèmes évolutifs et d’accompagner de jeunes développeurs. Je souhaite contribuer à des projets utiles qui s’appuient sur l’IA et les technologies web modernes pour répondre à des enjeux importants dans l’éducation, la santé et le développement social.',
    'Education & Experience Journey': 'Parcours scolaire et professionnel', 'University': 'Université', 'High School': 'Lycée', 'Experience': 'Expérience', 'BSc Computer Science': 'Licence en informatique', 'Secondary Education Foundation': 'Formation secondaire', 'Pursuing a degree in Computer Science with a strong focus on:': 'Études en informatique avec une spécialisation en :', 'Core algorithms and data structures': 'Algorithmes fondamentaux et structures de données', 'Database design and management systems': 'Conception de bases de données et systèmes de gestion', 'Software engineering principles and practices': 'Principes et pratiques du génie logiciel', 'Web and mobile application development': 'Développement d’applications web et mobiles', 'Computer networks and systems': 'Réseaux et systèmes informatiques', 'This foundation is shaping my ability to write efficient, scalable, and maintainable code across various domains.': 'Cette formation m’aide à écrire du code efficace, évolutif et facile à maintenir dans différents domaines.', 'A-Level Certificate': 'Certificat de fin d’études secondaires', 'During these formative years, I developed a strong interest in science and technology. This period was crucial in discovering my passion for problem-solving and logical thinking. I was exposed to mathematics, physics, and computer fundamentals that sparked my interest in pursuing Computer Science at the university level.': 'Durant ces années formatrices, j’ai développé un vif intérêt pour les sciences et la technologie. J’y ai découvert ma passion pour la résolution de problèmes et la logique, grâce aux mathématiques, à la physique et aux bases de l’informatique, ce qui m’a conduit à poursuivre des études universitaires en informatique.', 'This foundation laid the groundwork for my technical journey and helped me understand the importance of continuous learning.': 'Cette formation a posé les bases de mon parcours technique et m’a montré l’importance de l’apprentissage continu.',
    'Frontend Development': 'Développement frontend', 'Java Swing Development': 'Développement Java Swing', 'Linux Basics': 'Bases de Linux', 'Ongoing': 'En cours', 'Familiar': 'Notions', 'Adaptability': 'Adaptabilité', 'Problem-Solving': 'Résolution de problèmes', 'Full-Stack Thinking': 'Vision full stack', 'Learned to quickly adapt to new tools, frameworks, and technologies as the tech landscape evolves.': 'J’ai appris à m’adapter rapidement aux nouveaux outils, frameworks et technologies.', 'Developed a systematic approach to breaking down complex problems into manageable solutions.': 'J’ai développé une méthode pour décomposer les problèmes complexes en solutions concrètes.', 'Gained experience working with teams in hackathons and group projects, improving communication and teamwork.': 'Les hackathons et projets de groupe m’ont appris à mieux communiquer et à travailler en équipe.', 'Moved from single-technology focus to understanding how frontend, backend, and databases work together.': 'Je suis passé d’une spécialisation unique à une compréhension des liens entre frontend, backend et bases de données.',
    'Technical Expertise': 'Expertise technique', 'I\'ve cultivated a diverse skill set across multiple domains of software development. My expertise spans programming languages, frameworks, and industry best practices that enable me to build robust, scalable applications from concept to deployment.': 'J’ai développé des compétences variées en programmation, frameworks et bonnes pratiques professionnelles, qui me permettent de créer des applications robustes et évolutives, de la conception au déploiement.', 'Proficiency Levels': 'Niveaux de maîtrise', 'Advanced (75-90%):': 'Avancé (75–90 %) :', 'Intermediate (60-75%):': 'Intermédiaire (60–75 %) :', 'Beginner-Intermediate (50-60%):': 'Débutant à intermédiaire (50–60 %) :', 'Languages': 'Langages', 'Frontend': 'Frontend', 'Backend': 'Backend', 'Core Concepts': 'Concepts fondamentaux', 'AI & Productivity Tools': 'IA et outils de productivité', 'Core programming languages with proficiency levels': 'Langages de programmation fondamentaux et niveaux de maîtrise', 'Web interface and user experience technologies': 'Technologies d’interface web et d’expérience utilisateur', 'Server-side and database technologies': 'Technologies serveur et bases de données', 'Fundamental computer science knowledge': 'Connaissances fondamentales en informatique', 'Tools that enhance productivity and innovation': 'Outils qui améliorent la productivité et l’innovation',
    'Beyond the Code': 'Au-delà du code', 'While I\'m passionate about technology and programming, I believe in maintaining a balanced lifestyle. My hobbies help me stay creative, sharp, and connected with the world around me. They\'ve also taught me valuable lessons that I apply to my work as a developer.': 'Même si la technologie et la programmation me passionnent, je tiens à garder un mode de vie équilibré. Mes loisirs entretiennent ma créativité, ma concentration et mon lien avec le monde. Ils m’apportent aussi des leçons utiles dans mon travail de développeur.', 'Why These Matter': 'Pourquoi ces activités comptent', 'Reading': 'Lecture', 'Praying': 'Prière', 'Singing': 'Chant', 'Meditation': 'Méditation', 'Gaming': 'Jeux vidéo', 'Playing Football': 'Football', 'Exploring ideas through books on technology, philosophy, and personal development': 'Découvrir des idées grâce à des livres sur la technologie, la philosophie et le développement personnel', 'Finding peace and clarity through spiritual practice': 'Trouver la paix et la clarté grâce à la spiritualité', 'Expressing creativity and emotion through music': 'Exprimer ma créativité et mes émotions à travers la musique', 'Building mental clarity and emotional resilience': 'Renforcer la clarté d’esprit et la résilience émotionnelle', 'Enjoying strategic thinking and interactive storytelling': 'Apprécier la stratégie et les récits interactifs', 'Staying active and enjoying team collaboration': 'Rester actif et apprécier l’esprit d’équipe', 'Keeps me updated and inspires new approaches to problem-solving.': 'La lecture m’informe et m’inspire de nouvelles façons de résoudre les problèmes.', 'Helps maintain focus and emotional balance during challenging projects.': 'La spiritualité et la méditation m’aident à garder ma concentration et mon équilibre.', 'Enhances creative thinking which directly impacts my coding approach.': 'La musique stimule ma créativité et influence directement ma façon de coder.', 'Maintains health and teaches discipline and teamwork.': 'Le sport préserve ma santé et m’apprend la discipline et le travail d’équipe.',
    'Dismiss notification': 'Fermer la notification', 'Read less': 'Lire moins', 'Read more': 'Lire la suite', 'David KWIZERA home': 'Accueil de David KWIZERA', 'ADMIN': 'ADMIN', 'Admin sections': 'Sections admin', 'published CVs and certificates': 'CV et certificats publiés', 'Signed-in administrator profile': 'Profil de l’administrateur connecté', 'View administrator accounts': 'Voir les comptes administrateur', 'Protected by administrator': 'Protégé par l’administrateur', 'Administrator profile': 'Profil administrateur',
    'Checking credentials…': 'Vérification des identifiants…', 'Sign in to admin': 'Connexion administrateur', 'Forgot your password?': 'Mot de passe oublié ?', 'Hide password': 'Masquer le mot de passe', 'Show password': 'Afficher le mot de passe', 'Secure sign-in · Administrator access only': 'Connexion sécurisée · Accès réservé à l’administrateur', 'Email': 'E-mail',
    'PORTFOLIO CONTROL CENTER': 'CENTRE DE CONTRÔLE DU PORTFOLIO', 'Welcome Back,': 'Bon retour,', 'Review visitor activity and published document counts.': 'Consultez l’activité des visiteurs et le nombre de documents publiés.', 'Portfolio statistics': 'Statistiques du portfolio', 'Total downloads': 'Téléchargements totaux', 'database records': 'enregistrements dans la base de données', 'New enquiries': 'Nouvelles demandes', 'database requests': 'demandes dans la base de données', 'CVs published': 'CV publiés', 'published CVs': 'CV publiés', 'Certificates published': 'Certificats publiés', 'published certificates': 'certificats publiés', 'QUICK ACCESS': 'ACCÈS RAPIDE', 'Manage your portfolio': 'Gérer votre portfolio', 'Review visitor requests and contacts': 'Consulter les demandes et coordonnées des visiteurs', 'Manage public landing-page content': 'Gérer le contenu de la page d’accueil publique', 'Manage your admin details and image': 'Gérer vos coordonnées et votre image administrateur', 'DOCUMENT MANAGEMENT': 'GESTION DES DOCUMENTS', 'Manage published documents': 'Gérer les documents publiés', 'Add or manage CVs and certificates on the Documents page.': 'Ajoutez ou gérez les CV et certificats sur la page Documents.',
    'Delete this visitor download request? This cannot be undone.': 'Supprimer cette demande de téléchargement ? Cette action est irréversible.', 'VISITOR ACTIVITY': 'ACTIVITÉ DES VISITEURS', 'Downloads & enquiries': 'Téléchargements et demandes', 'Visitor contact information and document request history.': 'Coordonnées des visiteurs et historique des demandes de documents.', 'REQUEST HISTORY': 'HISTORIQUE DES DEMANDES', 'Recent downloads': 'Téléchargements récents', 'Search downloads': 'Rechercher des téléchargements', 'Search by name, contact or purpose': 'Rechercher par nom, coordonnées ou motif', 'Collapse list': 'Réduire la liste', 'Expand list': 'Développer la liste', 'Refresh': 'Actualiser', 'Live clock': 'Horloge en direct', 'Last refreshed': 'Dernière actualisation', 'Not yet': 'Pas encore', 'VISITOR': 'VISITEUR', 'CONTACT': 'COORDONNÉES', 'DOCUMENT TYPE': 'TYPE DE DOCUMENT', 'DOCUMENT & PURPOSE': 'DOCUMENT ET MOTIF', 'DATE': 'DATE', 'STATUS': 'STATUT', 'ACTION': 'ACTION', 'Cert': 'Certificat', 'Download completed': 'Téléchargement terminé', 'Download failed': 'Échec du téléchargement', 'Awaiting download': 'En attente du téléchargement', 'Requested': 'Demandé', 'Delete request': 'Supprimer la demande', 'No matching enquiries': 'Aucune demande correspondante', 'No download enquiries yet': 'Aucune demande de téléchargement pour le moment', 'Try another name, email address, phone number or document.': 'Essayez un autre nom, une autre adresse e-mail, un numéro de téléphone ou un document.', 'Visitor details and document requests are saved here by the backend.': 'Les coordonnées des visiteurs et les demandes de documents sont enregistrées ici.', 'Open the visitor documents page': 'Ouvrir la page des documents visiteurs', 'Requests are collapsed. Expand the list to view them.': 'Les demandes sont réduites. Développez la liste pour les consulter.',
    'Footer administrator name': 'Nom de l’administrateur dans le pied de page', 'Administrator name shown in the footer': 'Nom de l’administrateur affiché dans le pied de page', 'Leave this blank to use the name of the most recently signed-in administrator. Enter a name to keep a custom footer name across future sign-ins.': 'Laissez ce champ vide pour utiliser le nom du dernier administrateur connecté. Saisissez un nom pour le conserver lors des prochaines connexions.', 'Display this section on the landing page': 'Afficher cette section sur la page d’accueil', 'Social link': 'Lien social', 'Remove': 'Supprimer', 'Add social link': 'Ajouter un lien social', 'Name (e.g. GitHub)': 'Nom (ex. GitHub)', 'Icon (e.g. fab fa-github)': 'Icône (ex. fab fa-github)', 'URL (https://…)': 'URL (https://…)', 'Enter a name, a Font Awesome icon class (for example fab fa-github, fab fa-linkedin, or fab fa-whatsapp), and the full profile URL. You can leave a field blank or remove a link.': 'Saisissez un nom, une classe d’icône Font Awesome (par exemple fab fa-github, fab fa-linkedin ou fab fa-whatsapp) et l’URL complète du profil. Vous pouvez laisser un champ vide ou supprimer un lien.', 'Edit this list as JSON. Keep each item’s fields, such as label and href.': 'Modifiez cette liste au format JSON. Conservez les champs de chaque élément, comme label et href.', 'Save and review the homepage before publishing.': 'Enregistrez et prévisualisez la page d’accueil avant publication.', 'Homepage preview is ready for review.': 'L’aperçu de la page d’accueil est prêt.', 'Publish to homepage': 'Publier sur la page d’accueil', 'Back to editing': 'Retour à la modification', 'Publishing…': 'Publication…', 'Restore the default landing-page content for all visitors?': 'Restaurer le contenu par défaut de la page d’accueil pour tous les visiteurs ?', 'Default landing-page content restored for all visitors.': 'Le contenu par défaut de la page d’accueil a été restauré pour tous les visiteurs.', 'PUBLIC CONTENT': 'CONTENU PUBLIC', 'Manage the text, links, images, cards, and visibility of every landing-page section.': 'Gérez les textes, liens, images, cartes et la visibilité de chaque section de la page d’accueil.', 'LANDING PAGE CONTENT': 'CONTENU DE LA PAGE D’ACCUEIL', 'Edit published content': 'Modifier le contenu publié', 'Save your edits to review the complete homepage before publishing.': 'Enregistrez vos modifications pour prévisualiser la page complète avant publication.', 'Preview homepage': 'Prévisualiser la page d’accueil', 'Could not prepare the homepage preview.': 'Impossible de préparer l’aperçu de la page d’accueil.',
    'WORKSPACE SECURITY': 'SÉCURITÉ DE L’ESPACE DE TRAVAIL', 'Loading accounts from the database…': 'Chargement des comptes depuis la base de données…', 'Could not load accounts from the database.': 'Impossible de charger les comptes depuis la base de données.', 'administrator account': 'compte administrateur', 'administrator accounts': 'comptes administrateur', 'stored in the database.': 'enregistrés dans la base de données.', 'DATABASE ACCOUNTS': 'COMPTES DE LA BASE DE DONNÉES', 'Administrator directory': 'Répertoire des administrateurs', 'Password hashes are never shown in the browser. Send a time-limited recovery link to reset an account password.': 'Les empreintes de mot de passe ne sont jamais affichées dans le navigateur. Envoyez un lien de récupération temporaire pour réinitialiser un mot de passe.', 'NAME': 'NOM', 'PHONE': 'TÉLÉPHONE', 'EMAIL': 'E-MAIL', 'PASSWORD': 'MOT DE PASSE', 'RESET': 'RÉINITIALISATION', 'Protected': 'Protégé', 'Sending…': 'Envoi…', 'No administrator accounts were returned.': 'Aucun compte administrateur n’a été trouvé.', 'The passwords do not match.': 'Les mots de passe ne correspondent pas.', 'Return to sign in': 'Retour à la connexion',
    'ACCOUNT DETAILS': 'DÉTAILS DU COMPTE', 'Administrator': 'Administrateur', 'Choose a profile image first.': 'Choisissez d’abord une image de profil.', 'Choose a JPG, PNG, or WebP image no larger than 5 MB.': 'Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.', 'CV & certificates': 'CV et certificats', 'Publish a CV and manage certificate details shown to visitors.': 'Publiez un CV et gérez les informations des certificats visibles par les visiteurs.', 'Curriculum vitae': 'Curriculum vitæ', 'Add a CV with its title, summary, date, and institution. Edit or delete any CV at any time — adding keeps the existing ones.': 'Ajoutez un CV avec son titre, résumé, date et établissement. Modifiez ou supprimez vos CV à tout moment ; l’ajout conserve ceux qui existent.', 'Edit this CV': 'Modifier ce CV', 'Upload a CV': 'Téléverser un CV', 'Update this CV’s details or replace its PDF.': 'Modifiez les informations de ce CV ou remplacez son PDF.', 'Add a new CV with its details and PDF file.': 'Ajoutez un CV avec ses informations et son fichier PDF.', 'CV title': 'Titre du CV', 'Description': 'Description', 'Date issued': 'Date de délivrance', 'Institution': 'Établissement', '(optional)': '(facultatif)', 'Browse PDF (optional - keeps current)': 'Choisir un PDF (facultatif, conserve le fichier actuel)', 'Browse CV PDF (required)': 'Choisir le PDF du CV (obligatoire)', 'Save changes': 'Enregistrer les modifications', 'Cancel edit': 'Annuler la modification', 'Add CV': 'Ajouter un CV', 'OTHER DOCUMENTS': 'AUTRES DOCUMENTS', 'Standalone documents shown in the visitor document center. Edit the details, replace the PDF, or delete any entry you no longer want visitors to see.': 'Documents individuels affichés dans l’espace visiteurs. Modifiez leurs informations, remplacez le PDF ou supprimez ceux que vous ne souhaitez plus afficher.', 'CERTIFICATE LIBRARY': 'BIBLIOTHÈQUE DE CERTIFICATS', 'Add certificates with their title, description, issue date, institution, and PDF. Edit the details, replace the PDF, or delete any entry.': 'Ajoutez des certificats avec leur titre, description, date de délivrance, établissement et PDF. Modifiez les informations, remplacez le PDF ou supprimez une entrée.', 'Upload a certificate': 'Téléverser un certificat', 'Update the document details or replace its PDF file.': 'Modifiez les informations du document ou remplacez son fichier PDF.', 'Add a certificate with its title, institution, issue date, and PDF file.': 'Ajoutez un certificat avec son titre, établissement, date de délivrance et fichier PDF.', 'Certificate title': 'Titre du certificat', 'Browse certificate PDF (optional - keeps current)': 'Choisir le PDF du certificat (facultatif, conserve le fichier actuel)', 'Browse certificate PDF (required)': 'Choisir le PDF du certificat (obligatoire)', 'Add certificate': 'Ajouter un certificat', 'No certificates have been added yet.': 'Aucun certificat n’a encore été ajouté.', 'No CV has been added yet.': 'Aucun CV n’a encore été ajouté.', 'Other document': 'Autre document', 'Certificate': 'Certificat', 'Uploaded': 'Téléversé', 'Edit': 'Modifier', 'Delete': 'Supprimer', 'DOCUMENT LIBRARY': 'BIBLIOTHÈQUE DE DOCUMENTS',
    'Your message was sent. A confirmation email is on its way.': 'Votre message a été envoyé. Un e-mail de confirmation est en route.',
    'Your message was sent, but the confirmation email could not be delivered.': 'Votre message a été envoyé, mais l’e-mail de confirmation n’a pas pu être remis.',
    'Choose your country code and enter the number. This phone field does not restrict who can visit the website.': 'Choisissez votre indicatif pays et saisissez le numéro. Ce champ ne limite pas l’accès au site.',
    'Choose a country and enter a valid phone number.': 'Choisissez un pays et saisissez un numéro de téléphone valide.',
    'Enter a valid international phone number with its country calling code.': 'Saisissez un numéro international valide avec son indicatif pays.',
    'Enter a valid international phone number with its country calling code before reviewing.': 'Saisissez un numéro international valide avec son indicatif pays avant de continuer.',
    Home: 'Accueil', About: 'À propos', Background: 'Parcours', Skills: 'Compétences', Hobbies: 'Loisirs', Documents: 'Documents', Contact: 'Contact', Login: 'Connexion',
    'Open navigation menu': 'Ouvrir le menu de navigation', 'Close navigation menu': 'Fermer le menu de navigation',
    Overview: 'Vue générale', Downloads: 'Téléchargements', 'Landing page': 'Page d’accueil', 'Admin accounts': 'Comptes admin', 'My profile': 'Mon profil',
    WORKSPACE: 'ESPACE DE TRAVAIL', 'View site': 'Voir le site', 'Log out': 'Se déconnecter', 'Logging out…': 'Déconnexion…',
    'Choose where your image appears': 'Choisissez où votre image apparaît', 'Admin account': 'Compte admin', 'Public site': 'Site public',
    'Admin only': 'Admin uniquement', 'Both': 'Les deux', 'Public only': 'Public uniquement', 'Publish image': 'Publier l’image', 'Browse image': 'Choisir une image',
    'Your name': 'Votre nom', 'Phone number': 'Numéro de téléphone', Message: 'Message',
    'Send Me a Message': 'Envoyez-moi un message', 'Send Message': 'Envoyer le message',
    'Get your document': 'Obtenir le document', 'Email address': 'Adresse e-mail', 'Secure document preview': 'Aperçu sécurisé du document',
    'Select country': 'Choisir le pays', 'Enter phone number': 'Saisir le numéro de téléphone', Language: 'Langue',
    Burundi: 'Burundi', 'DR Congo': 'Rép. dém. du Congo', Kenya: 'Kenya', Rwanda: 'Rwanda', Somalia: 'Somalie', 'South Sudan': 'Soudan du Sud', Tanzania: 'Tanzanie', Uganda: 'Ouganda',
    'Choose your East African country code and enter the number. This phone field does not restrict who can visit the website.': 'Choisissez l’indicatif de votre pays d’Afrique de l’Est et saisissez le numéro. Ce champ ne limite pas l’accès au site.',
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
    , 'A code was sent to {recipient}. Enter the six-digit code from that email below.': 'Un code a été envoyé à {recipient}. Saisissez ci-dessous le code à six chiffres reçu par e-mail.',
    'Delete "{title}" permanently? Visitors will no longer see this document. This cannot be undone.': 'Supprimer définitivement « {title} » ? Les visiteurs ne verront plus ce document. Cette action est irréversible.'
  },
  sw: {
    'Homepage content language': 'Lugha ya maudhui ya ukurasa wa mwanzo', 'Add a French and Kiswahili version for each text field. Existing translations from the language catalog are prefilled where available.': 'Ongeza tafsiri ya Kifaransa na Kiswahili kwa kila maandishi. Tafsiri zilizopo hujazwa moja kwa moja zinapopatikana.', 'This field is empty in English.': 'Sehemu hii haina maandishi ya Kiingereza.', 'No catalog translation yet. Add a translation here to avoid English appearing in this language.': 'Bado hakuna tafsiri kwenye orodha. Ongeza tafsiri hapa ili maandishi yasionekane kwa Kiingereza.', 'Load the homepage content before adding translations.': 'Pakia maudhui ya ukurasa wa mwanzo kabla ya kuongeza tafsiri.', 'Title': 'Kichwa', 'Tagline': 'Kauli mbiu', 'Brand Name': 'Jina la chapa', 'Login Label': 'Maandishi ya kuingia', 'Contact Text': 'Maandishi ya mawasiliano', 'Contact Label': 'Jina la mawasiliano', 'Button Label': 'Maandishi ya kitufe', 'Eyebrow': 'Kichwa kidogo', 'Title First': 'Sehemu ya kwanza ya kichwa', 'Title Second': 'Sehemu ya pili ya kichwa', 'Admin Name': 'Jina la msimamizi', 'Built By': 'Imetengenezwa na', 'Quick Links Title': 'Kichwa cha viungo vya haraka', 'Services Title': 'Kichwa cha huduma', 'Social Title': 'Kichwa cha mitandao ya kijamii', 'Copyright': 'Hakimiliki', 'Summary': 'Muhtasari',
    'Copyright {year} {name}. All rights reserved.': '© {year} {name}. Haki zote zimehifadhiwa.',
    'Computer Science Student | Frontend Developer': 'Mwanafunzi wa Sayansi ya Kompyuta | Msanidi wa frontend', 'I build responsive, user-friendly web experiences and keep learning how thoughtful software can solve real problems.': 'Ninaunda tovuti zinazojirekebisha na rahisi kutumia, huku nikijifunza jinsi programu bora zinavyoweza kutatua matatizo halisi.', 'Explore my documents': 'Angalia hati zangu', 'My background': 'Historia yangu', 'Have a project or opportunity?': 'Una mradi au fursa?', 'Let\'s connect': 'Tuungane', 'A LITTLE ABOUT ME': 'KIDOGO KUHUSU MIMI', 'Curious by nature.': 'Mwenye udadisi kwa asili.', 'Developer by choice.': 'Msanidi kwa hiari.', 'I\'m David KWIZERA, a Computer Science student at the University of Rwanda. I enjoy turning ideas into clear, useful digital experiences and growing my skills through hands-on projects.': 'Mimi ni David KWIZERA, mwanafunzi wa sayansi ya kompyuta katika Chuo Kikuu cha Rwanda. Ninafurahia kubadilisha mawazo kuwa huduma za kidijitali zilizo wazi na zenye manufaa, na kuboresha ujuzi kupitia miradi ya vitendo.', 'Get to know me': 'Nifahamu zaidi', 'WELCOME': 'KARIBU', 'Hey there — I\'m glad you stopped by 👋': 'Habari, ninafurahi umetembelea 👋', 'Pull up a chair and look around. This space holds my story, the things I\'m learning, and the work I\'m proud of. Take your time — there\'s plenty to explore.': 'Karibu uchunguze safari yangu, ninachojifunza na kazi ninazojivunia. Chukua muda wako, kuna mengi ya kuona.', 'Need my CV or certificates?': 'Unahitaji CV au vyeti vyangu?', 'Browse and download the latest documents from the portfolio document center.': 'Tazama na upakue hati za hivi karibuni kwenye kituo cha hati cha portfolio.', 'Visit document center': 'Tembelea kituo cha hati', 'Building elegant solutions through code': 'Kuunda suluhisho bora kwa kutumia msimbo', 'Computer Science student | Frontend Developer | Problem Solver': 'Mwanafunzi wa Sayansi ya Kompyuta | Msanidi wa frontend | Mtatuzi wa matatizo', 'Quick Links': 'Viungo vya haraka', 'Services': 'Huduma', 'Connect With Me': 'Wasiliana nami', 'Web Development': 'Uundaji wa wavuti', 'UI/UX Design': 'Ubunifu wa UI/UX', 'Consulting': 'Ushauri', 'GitHub': 'GitHub', 'LinkedIn': 'LinkedIn', 'WhatsApp': 'WhatsApp', 'Facebook': 'Facebook', 'Built by KadeTech': 'Imetengenezwa na KadeTech', 'All rights reserved.': 'Haki zote zimehifadhiwa.',
    'A code was sent to {recipient}. Enter the six-digit code from that email below.': 'Msimbo umetumwa kwa {recipient}. Weka hapa chini msimbo wa tarakimu sita uliotumwa kwa barua pepe.',
    'Delete "{title}" permanently? Visitors will no longer see this document. This cannot be undone.': 'Ufute kabisa "{title}"? Wageni hawataiona tena hati hii. Huwezi kutendua hatua hii.',
    'Welcome to My': 'Karibu kwenye', 'Document Center': 'kituo changu cha hati', 'Thank you for your interest in my professional profile. Submit your contact details before previewing or downloading documents.': 'Asante kwa kuvutiwa na wasifu wangu wa kitaaluma. Weka maelezo yako ya mawasiliano kabla ya kuona au kupakua hati.', 'About These Documents': 'Kuhusu hati hizi', 'Professional & Up-to-Date': 'Za kitaaluma na za sasa', 'My curriculum vitae contains comprehensive information about my educational background, professional experience, technical skills, and notable achievements. All documents are regularly updated and formatted for professional review.': 'Wasifu wangu wa CV una maelezo kuhusu elimu, uzoefu wa kazi, ujuzi wa kiufundi na mafanikio muhimu. Hati zote husasishwa mara kwa mara na kutayarishwa kwa ukaguzi wa kitaaluma.', 'Secure Download': 'Upakuaji salama', 'Always Current': 'Zinasasishwa kila wakati', 'PDF Format': 'Muundo wa PDF', 'Published CVs': 'CV zilizochapishwa', 'Curriculum Vitae': 'Wasifu wa CV', 'Latest': 'Ya hivi karibuni', 'Virus Free': 'Haina virusi', 'Secure': 'Salama', 'Professional certificate': 'Cheti cha kitaaluma', 'No certificates added yet': 'Bado hakuna vyeti', 'Certificates will appear here as soon as they are added.': 'Vyeti vitaonekana hapa vikiongezwa.', 'View': 'Tazama', 'Download': 'Pakua', 'Close form': 'Funga fomu', 'Verification code': 'Msimbo wa uthibitisho', 'Verify code': 'Thibitisha msimbo', 'Resend code': 'Tuma msimbo tena', 'Change email address': 'Badilisha anwani ya barua pepe', 'Preparing download…': 'Inaandaa upakuaji…', 'Opening preview…': 'Inafungua hakiki…', 'Open secure preview': 'Fungua hakiki salama', 'Continue to download': 'Endelea kupakua', 'Your verified download is starting.': 'Upakuaji uliothibitishwa unaanza.', 'Could not open the document. Please try again.': 'Imeshindikana kufungua hati. Jaribu tena.', 'Update your email address, then request another code.': 'Sasisha anwani yako ya barua pepe kisha uombe msimbo mwingine.', 'Enter the six-digit verification code.': 'Weka msimbo wa uthibitisho wa tarakimu sita.', 'Your email address is verified. Continue when you’re ready.': 'Anwani yako ya barua pepe imethibitishwa. Endelea ukiwa tayari.', 'I agree to use my email address to verify preview access. It will not be added to the admin request list.': 'Ninakubali kutumia anwani yangu ya barua pepe kuthibitisha hakiki. Haitaongezwa kwenye orodha ya maombi ya msimamizi.', 'I agree to have my contact details and reason saved for this download request.': 'Ninakubali maelezo yangu ya mawasiliano na sababu zihifadhiwe kwa ombi hili la upakuaji.', 'sent to your': 'imetumwa kwa', 'Please agree to email verification before requesting a code.': 'Kubali uthibitishaji wa barua pepe kabla ya kuomba msimbo.', 'Please complete your name, phone number, reason, and consent before requesting a code.': 'Jaza jina, nambari ya simu, sababu na ridhaa yako kabla ya kuomba msimbo.',
    'My Journey': 'Safari yangu', 'What Drives Me': 'Kinachonipa msukumo', 'Career Vision': 'Maono ya kazi yangu',
    'I am a Computer Science student at the University of Rwanda with a strong passion for backend development, artificial intelligence, and mobile applications.': 'Mimi ni mwanafunzi wa sayansi ya kompyuta katika Chuo Kikuu cha Rwanda, ninayependa sana uundaji wa mifumo ya backend, akili bandia na programu za simu.',
    "I enjoy turning complex problems into clean, efficient solutions — whether that's building REST APIs, training ML models, or crafting mobile experiences with Flutter.": 'Ninafurahia kubadilisha matatizo magumu kuwa suluhisho bora na rahisi, kama kutengeneza REST API, kufundisha modeli za mashine kujifunza au kuunda programu za simu kwa Flutter.',
    "When I'm not coding, I'm exploring new technologies, contributing to open source, or sharpening my problem-solving skills on competitive platforms.": 'Nisipoandika programu, ninachunguza teknolojia mpya, kuchangia miradi huria au kuboresha ujuzi wangu wa kutatua matatizo kwenye mashindano.',
    'I started my programming journey in high school with Java and C++, quickly realizing my passion for solving real-world problems through code. Over the years, I\'ve expanded my skill set to cover full-stack web development, data structures, algorithms, and emerging technologies like AI and machine learning.': 'Nilianza safari yangu ya programu katika shule ya sekondari kwa Java na C++, na nikagundua haraka kuwa napenda kutatua matatizo halisi kwa kutumia msimbo. Baadaye nilijifunza uundaji wa wavuti wa full-stack, miundo ya data, algoriti, akili bandia na machine learning.',
    'My academic path at University of Rwanda has been instrumental in deepening my understanding of computer science principles. I\'ve worked on various projects ranging from desktop GUI applications using Java Swing to responsive web interfaces with modern frontend frameworks.': 'Masomo yangu katika Chuo Kikuu cha Rwanda yameimarisha uelewa wangu wa misingi ya sayansi ya kompyuta. Nimefanya miradi mbalimbali kuanzia programu za desktop za Java Swing hadi violesura vya wavuti vinavyobadilika kulingana na skrini.',
    "I'm fascinated by emerging technologies and how they can transform industries and improve lives.": 'Ninavutiwa na teknolojia mpya na jinsi zinavyoweza kubadilisha sekta na kuboresha maisha.', 'I love tackling challenging problems and finding elegant, efficient solutions.': 'Ninapenda kukabiliana na changamoto na kupata suluhisho bora na rahisi.', 'Technology is ever-evolving, and I\'m committed to staying updated with the latest tools and best practices.': 'Teknolojia hubadilika kila wakati, nami hujitahidi kujifunza zana na mbinu bora za hivi karibuni.', 'I believe in the power of teamwork and contributing to communities that push technology forward.': 'Ninaamini katika nguvu ya ushirikiano na kuchangia jamii zinazoendeleza teknolojia.', 'Innovation:': 'Ubunifu:', 'Problem-Solving:': 'Utatuzi wa matatizo:', 'Continuous Learning:': 'Kujifunza daima:', 'Collaboration:': 'Ushirikiano:',
    'My goal is to become a full-stack developer capable of architecting scalable systems and mentoring junior developers. I aspire to work on impactful projects that leverage AI and modern web technologies to solve meaningful problems in education, healthcare, and social impact sectors.': 'Lengo langu ni kuwa msanidi wa full-stack anayeweza kubuni mifumo inayokua na kuelekeza wasanidi wapya. Natamani kushiriki katika miradi yenye manufaa inayotumia AI na teknolojia za kisasa kutatua changamoto za elimu, afya na maendeleo ya jamii.',
    'Education & Experience Journey': 'Safari ya elimu na uzoefu', 'University': 'Chuo kikuu', 'High School': 'Shule ya sekondari', 'Experience': 'Uzoefu', 'BSc Computer Science': 'Shahada ya Sayansi ya Kompyuta', 'Secondary Education Foundation': 'Msingi wa elimu ya sekondari', 'Pursuing a degree in Computer Science with a strong focus on:': 'Ninasomea sayansi ya kompyuta nikizingatia zaidi:', 'Core algorithms and data structures': 'Algoriti na miundo ya data ya msingi', 'Database design and management systems': 'Ubunifu wa hifadhidata na mifumo ya usimamizi', 'Software engineering principles and practices': 'Kanuni na mbinu za uhandisi wa programu', 'Web and mobile application development': 'Uundaji wa programu za wavuti na simu', 'Computer networks and systems': 'Mitandao na mifumo ya kompyuta', 'This foundation is shaping my ability to write efficient, scalable, and maintainable code across various domains.': 'Msingi huu unaniwezesha kuandika msimbo bora, unaokua na unaoweza kudumishwa katika nyanja mbalimbali.', 'A-Level Certificate': 'Cheti cha A-Level', 'During these formative years, I developed a strong interest in science and technology. This period was crucial in discovering my passion for problem-solving and logical thinking. I was exposed to mathematics, physics, and computer fundamentals that sparked my interest in pursuing Computer Science at the university level.': 'Katika miaka hii muhimu nilipendezwa sana na sayansi na teknolojia. Hapo niligundua kupenda utatuzi wa matatizo na fikra za kimantiki kupitia hisabati, fizikia na misingi ya kompyuta, na nikachagua kusomea sayansi ya kompyuta chuoni.', 'This foundation laid the groundwork for my technical journey and helped me understand the importance of continuous learning.': 'Msingi huu ulijenga safari yangu ya teknolojia na kunionyesha umuhimu wa kujifunza daima.',
    'Frontend Development': 'Uundaji wa frontend', 'Java Swing Development': 'Uundaji wa Java Swing', 'Linux Basics': 'Misingi ya Linux', 'Ongoing': 'Inaendelea', 'Familiar': 'Ninaifahamu', 'Adaptability': 'Uwezo wa kubadilika', 'Problem-Solving': 'Utatuzi wa matatizo', 'Full-Stack Thinking': 'Fikra za full-stack', 'Learned to quickly adapt to new tools, frameworks, and technologies as the tech landscape evolves.': 'Nilijifunza kuzoea haraka zana, mifumo na teknolojia mpya zinapobadilika.', 'Developed a systematic approach to breaking down complex problems into manageable solutions.': 'Nilijenga mbinu ya kugawanya matatizo magumu kuwa suluhisho linaloweza kutekelezwa.', 'Gained experience working with teams in hackathons and group projects, improving communication and teamwork.': 'Nilipata uzoefu wa kufanya kazi na timu kwenye hackathon na miradi ya vikundi, na kuboresha mawasiliano na ushirikiano.', 'Moved from single-technology focus to understanding how frontend, backend, and databases work together.': 'Nilipanua uelewa kutoka teknolojia moja hadi jinsi frontend, backend na hifadhidata zinavyofanya kazi pamoja.',
    'Technical Expertise': 'Utaalamu wa kiufundi', 'I\'ve cultivated a diverse skill set across multiple domains of software development. My expertise spans programming languages, frameworks, and industry best practices that enable me to build robust, scalable applications from concept to deployment.': 'Nimejenga ujuzi katika nyanja mbalimbali za uundaji wa programu. Ujuzi wangu wa lugha za programu, mifumo na mbinu bora hunisaidia kujenga programu imara zinazoweza kukua kuanzia wazo hadi matumizi.', 'Proficiency Levels': 'Viwango vya umahiri', 'Advanced (75-90%):': 'Juu (75–90%):', 'Intermediate (60-75%):': 'Wastani (60–75%):', 'Beginner-Intermediate (50-60%):': 'Mwanzo hadi wastani (50–60%):', 'Languages': 'Lugha', 'Frontend': 'Frontend', 'Backend': 'Backend', 'Core Concepts': 'Dhana za msingi', 'AI & Productivity Tools': 'AI na zana za tija', 'Core programming languages with proficiency levels': 'Lugha kuu za programu na viwango vyake', 'Web interface and user experience technologies': 'Teknolojia za violesura vya wavuti na uzoefu wa mtumiaji', 'Server-side and database technologies': 'Teknolojia za seva na hifadhidata', 'Fundamental computer science knowledge': 'Maarifa ya msingi ya sayansi ya kompyuta', 'Tools that enhance productivity and innovation': 'Zana zinazoongeza tija na ubunifu',
    'Beyond the Code': 'Zaidi ya msimbo', 'While I\'m passionate about technology and programming, I believe in maintaining a balanced lifestyle. My hobbies help me stay creative, sharp, and connected with the world around me. They\'ve also taught me valuable lessons that I apply to my work as a developer.': 'Ingawa ninapenda teknolojia na programu, naamini katika maisha yenye uwiano. Burudani zangu hunisaidia kuwa mbunifu, makini na kuhusiana na ulimwengu. Pia hunifundisha mambo ninayotumia katika kazi yangu ya usanidi.', 'Why These Matter': 'Kwa nini haya ni muhimu', 'Reading': 'Kusoma', 'Praying': 'Kusali', 'Singing': 'Kuimba', 'Meditation': 'Kutafakari', 'Gaming': 'Michezo ya kompyuta', 'Playing Football': 'Kucheza mpira wa miguu', 'Exploring ideas through books on technology, philosophy, and personal development': 'Kuchunguza mawazo kupitia vitabu vya teknolojia, falsafa na maendeleo binafsi', 'Finding peace and clarity through spiritual practice': 'Kupata amani na uwazi wa mawazo kupitia ibada', 'Expressing creativity and emotion through music': 'Kuonyesha ubunifu na hisia kupitia muziki', 'Building mental clarity and emotional resilience': 'Kuimarisha uwazi wa mawazo na ustahimilivu wa kihisia', 'Enjoying strategic thinking and interactive storytelling': 'Kufurahia fikra za kimkakati na hadithi shirikishi', 'Staying active and enjoying team collaboration': 'Kuwa na shughuli na kufurahia ushirikiano wa timu', 'Keeps me updated and inspires new approaches to problem-solving.': 'Hunipa maarifa mapya na kunihamasisha kutatua matatizo kwa njia tofauti.', 'Helps maintain focus and emotional balance during challenging projects.': 'Husaidia kudumisha umakini na usawa wa hisia katika miradi migumu.', 'Enhances creative thinking which directly impacts my coding approach.': 'Huongeza ubunifu unaoathiri moja kwa moja namna ninavyoandika msimbo.', 'Maintains health and teaches discipline and teamwork.': 'Hudumisha afya na kufundisha nidhamu na ushirikiano.',
    'Dismiss notification': 'Funga arifa', 'Read less': 'Soma kidogo', 'Read more': 'Soma zaidi', 'David KWIZERA home': 'Ukurasa wa mwanzo wa David KWIZERA', 'ADMIN': 'MSIMAMIZI', 'Admin sections': 'Sehemu za msimamizi', 'published CVs and certificates': 'CV na vyeti vilivyochapishwa', 'Signed-in administrator profile': 'Wasifu wa msimamizi aliyeingia', 'View administrator accounts': 'Tazama akaunti za wasimamizi', 'Protected by administrator': 'Imelindwa na msimamizi', 'Administrator profile': 'Wasifu wa msimamizi',
    'Checking credentials…': 'Inathibitisha taarifa…', 'Sign in to admin': 'Ingia kama msimamizi', 'Forgot your password?': 'Umesahau nenosiri?', 'Hide password': 'Ficha nenosiri', 'Show password': 'Onyesha nenosiri', 'Secure sign-in · Administrator access only': 'Kuingia salama · Wasimamizi pekee', 'Email': 'Barua pepe',
    'PORTFOLIO CONTROL CENTER': 'KITUO CHA USIMAMIZI WA PORTFOLIO', 'Welcome Back,': 'Karibu tena,', 'Review visitor activity and published document counts.': 'Kagua shughuli za wageni na idadi ya hati zilizochapishwa.', 'Portfolio statistics': 'Takwimu za portfolio', 'Total downloads': 'Jumla ya vipakuliwa', 'database records': 'rekodi kwenye hifadhidata', 'New enquiries': 'Maombi mapya', 'database requests': 'maombi kwenye hifadhidata', 'CVs published': 'CV zilizochapishwa', 'published CVs': 'CV zilizochapishwa', 'Certificates published': 'Vyeti vilivyochapishwa', 'published certificates': 'vyeti vilivyochapishwa', 'QUICK ACCESS': 'UFIKIAJI WA HARAKA', 'Manage your portfolio': 'Dhibiti portfolio yako', 'Review visitor requests and contacts': 'Kagua maombi na mawasiliano ya wageni', 'Manage public landing-page content': 'Dhibiti maudhui ya ukurasa wa mwanzo', 'Manage your admin details and image': 'Dhibiti maelezo na picha za akaunti yako', 'DOCUMENT MANAGEMENT': 'USIMAMIZI WA HATI', 'Manage published documents': 'Dhibiti hati zilizochapishwa', 'Add or manage CVs and certificates on the Documents page.': 'Ongeza au dhibiti CV na vyeti kwenye ukurasa wa Hati.',
    'Delete this visitor download request? This cannot be undone.': 'Ufute ombi hili la upakuaji? Huwezi kutendua hatua hii.', 'VISITOR ACTIVITY': 'SHUGHULI ZA WAGENI', 'Downloads & enquiries': 'Vipakuliwa na maombi', 'Visitor contact information and document request history.': 'Maelezo ya mawasiliano ya wageni na historia ya maombi ya hati.', 'REQUEST HISTORY': 'HISTORIA YA MAOMBI', 'Recent downloads': 'Vipakuliwa vya hivi karibuni', 'Search downloads': 'Tafuta vipakuliwa', 'Search by name, contact or purpose': 'Tafuta kwa jina, mawasiliano au sababu', 'Collapse list': 'Kunja orodha', 'Expand list': 'Panua orodha', 'Refresh': 'Onyesha upya', 'Live clock': 'Saa ya moja kwa moja', 'Last refreshed': 'Ilisasishwa mwisho', 'Not yet': 'Bado', 'VISITOR': 'MGENI', 'CONTACT': 'MAWASILIANO', 'DOCUMENT TYPE': 'AINA YA HATI', 'DOCUMENT & PURPOSE': 'HATI NA SABABU', 'DATE': 'TAREHE', 'STATUS': 'HALI', 'ACTION': 'KITENDO', 'Cert': 'Cheti', 'Download completed': 'Upakuaji umekamilika', 'Download failed': 'Upakuaji umeshindikana', 'Awaiting download': 'Inasubiri kupakuliwa', 'Requested': 'Imeombwa', 'Delete request': 'Futa ombi', 'No matching enquiries': 'Hakuna maombi yanayolingana', 'No download enquiries yet': 'Bado hakuna maombi ya upakuaji', 'Try another name, email address, phone number or document.': 'Jaribu jina, barua pepe, nambari ya simu au hati nyingine.', 'Visitor details and document requests are saved here by the backend.': 'Maelezo ya wageni na maombi ya hati huhifadhiwa hapa.', 'Open the visitor documents page': 'Fungua ukurasa wa hati za wageni', 'Requests are collapsed. Expand the list to view them.': 'Maombi yamekunjwa. Panua orodha ili kuyaona.',
    'Footer administrator name': 'Jina la msimamizi kwenye sehemu ya chini', 'Administrator name shown in the footer': 'Jina la msimamizi linaloonyeshwa chini ya ukurasa', 'Leave this blank to use the name of the most recently signed-in administrator. Enter a name to keep a custom footer name across future sign-ins.': 'Acha wazi kutumia jina la msimamizi aliyeingia hivi karibuni. Weka jina ili libaki kwenye sehemu ya chini hata baada ya kuingia tena.', 'Display this section on the landing page': 'Onyesha sehemu hii kwenye ukurasa wa mwanzo', 'Social link': 'Kiungo cha mtandao wa kijamii', 'Remove': 'Ondoa', 'Add social link': 'Ongeza kiungo cha mtandao wa kijamii', 'Name (e.g. GitHub)': 'Jina (mf. GitHub)', 'Icon (e.g. fab fa-github)': 'Aikoni (mf. fab fa-github)', 'URL (https://…)': 'URL (https://…)', 'Enter a name, a Font Awesome icon class (for example fab fa-github, fab fa-linkedin, or fab fa-whatsapp), and the full profile URL. You can leave a field blank or remove a link.': 'Weka jina, darasa la aikoni ya Font Awesome (mfano fab fa-github, fab fa-linkedin au fab fa-whatsapp), na URL kamili ya wasifu. Unaweza kuacha sehemu wazi au kuondoa kiungo.', 'Edit this list as JSON. Keep each item’s fields, such as label and href.': 'Hariri orodha hii kama JSON. Hifadhi sehemu za kila kipengee kama label na href.', 'Save and review the homepage before publishing.': 'Hifadhi na uhakiki ukurasa wa mwanzo kabla ya kuchapisha.', 'Homepage preview is ready for review.': 'Hakiki ya ukurasa wa mwanzo iko tayari.', 'Publish to homepage': 'Chapisha kwenye ukurasa wa mwanzo', 'Back to editing': 'Rudi kuhariri', 'Publishing…': 'Inachapisha…', 'Restore the default landing-page content for all visitors?': 'Urudishe maudhui chaguomsingi ya ukurasa wa mwanzo kwa wageni wote?', 'Default landing-page content restored for all visitors.': 'Maudhui chaguomsingi ya ukurasa wa mwanzo yamerejeshwa kwa wageni wote.', 'PUBLIC CONTENT': 'MAUDHUI YA UMMA', 'Manage the text, links, images, cards, and visibility of every landing-page section.': 'Dhibiti maandishi, viungo, picha, kadi na mwonekano wa kila sehemu ya ukurasa wa mwanzo.', 'LANDING PAGE CONTENT': 'MAUDHUI YA UKURASA WA MWANZO', 'Edit published content': 'Hariri maudhui yaliyochapishwa', 'Save your edits to review the complete homepage before publishing.': 'Hifadhi mabadiliko yako ili uhakiki ukurasa mzima kabla ya kuchapisha.', 'Preview homepage': 'Hakiki ukurasa wa mwanzo', 'Could not prepare the homepage preview.': 'Imeshindikana kuandaa hakiki ya ukurasa wa mwanzo.',
    'WORKSPACE SECURITY': 'USALAMA WA ENEO LA KAZI', 'Loading accounts from the database…': 'Inapakia akaunti kutoka hifadhidata…', 'Could not load accounts from the database.': 'Imeshindikana kupakia akaunti kutoka hifadhidata.', 'administrator account': 'akaunti ya msimamizi', 'administrator accounts': 'akaunti za wasimamizi', 'stored in the database.': 'zilizohifadhiwa kwenye hifadhidata.', 'DATABASE ACCOUNTS': 'AKAUNTI ZA HIFADHIDATA', 'Administrator directory': 'Orodha ya wasimamizi', 'Password hashes are never shown in the browser. Send a time-limited recovery link to reset an account password.': 'Nenosiri lililosimbwa halionyeshwi kwenye kivinjari. Tuma kiungo cha muda cha kurejesha akaunti ili kuweka upya nenosiri.', 'NAME': 'JINA', 'PHONE': 'SIMU', 'EMAIL': 'BARUA PEPE', 'PASSWORD': 'NENOSIRI', 'RESET': 'WEKA UPYA', 'Protected': 'Imelindwa', 'Sending…': 'Inatuma…', 'No administrator accounts were returned.': 'Hakuna akaunti za wasimamizi zilizopatikana.', 'The passwords do not match.': 'Manenosiri hayalingani.', 'Return to sign in': 'Rudi kwenye kuingia',
    'ACCOUNT DETAILS': 'MAELEZO YA AKAUNTI', 'Administrator': 'Msimamizi', 'Choose a profile image first.': 'Chagua picha ya wasifu kwanza.', 'Choose a JPG, PNG, or WebP image no larger than 5 MB.': 'Chagua picha ya JPG, PNG au WebP isiyozidi MB 5.', 'DOCUMENT LIBRARY': 'MAKTABA YA HATI', 'CV & certificates': 'CV na vyeti', 'Publish a CV and manage certificate details shown to visitors.': 'Chapisha CV na udhibiti maelezo ya vyeti vinavyoonekana kwa wageni.', 'Curriculum vitae': 'Wasifu wa CV', 'Add a CV with its title, summary, date, and institution. Edit or delete any CV at any time — adding keeps the existing ones.': 'Ongeza CV yenye kichwa, muhtasari, tarehe na taasisi. Hariri au futa CV wakati wowote; kuongeza hakufuti zilizopo.', 'Edit this CV': 'Hariri CV hii', 'Upload a CV': 'Pakia CV', 'Update this CV’s details or replace its PDF.': 'Sasisha maelezo ya CV hii au badilisha PDF yake.', 'Add a new CV with its details and PDF file.': 'Ongeza CV mpya pamoja na maelezo na faili lake la PDF.', 'CV title': 'Kichwa cha CV', 'Description': 'Maelezo', 'Date issued': 'Tarehe iliyotolewa', 'Institution': 'Taasisi', '(optional)': '(si lazima)', 'Browse PDF (optional - keeps current)': 'Chagua PDF (si lazima, hifadhi ya sasa)', 'Browse CV PDF (required)': 'Chagua PDF ya CV (inahitajika)', 'Save changes': 'Hifadhi mabadiliko', 'Cancel edit': 'Ghairi uhariri', 'Add CV': 'Ongeza CV', 'OTHER DOCUMENTS': 'HATI NYINGINE', 'Standalone documents shown in the visitor document center. Edit the details, replace the PDF, or delete any entry you no longer want visitors to see.': 'Hati zinazoonyeshwa kwenye kituo cha hati za wageni. Hariri maelezo, badilisha PDF au futa hati usizotaka wageni waone.', 'CERTIFICATE LIBRARY': 'MAKTABA YA VYETI', 'Add certificates with their title, description, issue date, institution, and PDF. Edit the details, replace the PDF, or delete any entry.': 'Ongeza vyeti pamoja na kichwa, maelezo, tarehe, taasisi na PDF. Hariri maelezo, badilisha PDF au futa kipengee.', 'Upload a certificate': 'Pakia cheti', 'Update the document details or replace its PDF file.': 'Sasisha maelezo ya hati au badilisha faili lake la PDF.', 'Add a certificate with its title, institution, issue date, and PDF file.': 'Ongeza cheti chenye kichwa, taasisi, tarehe na faili la PDF.', 'Certificate title': 'Kichwa cha cheti', 'Browse certificate PDF (optional - keeps current)': 'Chagua PDF ya cheti (si lazima, hifadhi ya sasa)', 'Browse certificate PDF (required)': 'Chagua PDF ya cheti (inahitajika)', 'Add certificate': 'Ongeza cheti', 'No certificates have been added yet.': 'Bado hakuna vyeti vilivyoongezwa.', 'No CV has been added yet.': 'Bado hakuna CV iliyoongezwa.', 'Other document': 'Hati nyingine', 'Certificate': 'Cheti', 'Uploaded': 'Imepakiwa', 'Edit': 'Hariri', 'Delete': 'Futa',
    'Your message was sent. A confirmation email is on its way.': 'Ujumbe wako umetumwa. Barua pepe ya uthibitisho inatumwa.',
    'Your message was sent, but the confirmation email could not be delivered.': 'Ujumbe wako umetumwa, lakini barua pepe ya uthibitisho haikuweza kutumwa.',
    'Choose your country code and enter the number. This phone field does not restrict who can visit the website.': 'Chagua msimbo wa nchi yako na uweke nambari. Sehemu hii haizuii mtu yeyote kutembelea tovuti.',
    'Choose a country and enter a valid phone number.': 'Chagua nchi na uweke nambari sahihi ya simu.',
    'Enter a valid international phone number with its country calling code.': 'Weka nambari sahihi ya kimataifa pamoja na msimbo wa nchi.',
    'Enter a valid international phone number with its country calling code before reviewing.': 'Weka nambari sahihi ya kimataifa pamoja na msimbo wa nchi kabla ya kuendelea.',
    Home: 'Mwanzo', About: 'Kuhusu', Background: 'Historia', Skills: 'Ujuzi', Hobbies: 'Burudani', Documents: 'Nyaraka', Contact: 'Mawasiliano', Login: 'Ingia',
    'Open navigation menu': 'Fungua menyu ya urambazaji', 'Close navigation menu': 'Funga menyu ya urambazaji',
    Overview: 'Muhtasari', Downloads: 'Vipakuliwa', 'Landing page': 'Ukurasa wa mwanzo', 'Admin accounts': 'Akaunti za msimamizi', 'My profile': 'Wasifu wangu',
    WORKSPACE: 'ENEO LA KAZI', 'View site': 'Tazama tovuti', 'Log out': 'Toka', 'Logging out…': 'Inatoka…',
    'Choose where your image appears': 'Chagua sehemu picha yako itaonekana', 'Admin account': 'Akaunti ya msimamizi', 'Public site': 'Tovuti ya umma',
    'Admin only': 'Msimamizi pekee', Both: 'Zote mbili', 'Public only': 'Umma pekee', 'Publish image': 'Chapisha picha', 'Browse image': 'Chagua picha',
    'Your name': 'Jina lako', 'Email address': 'Anwani ya barua pepe', 'Phone number': 'Nambari ya simu', Message: 'Ujumbe',
    'Send Me a Message': 'Nitumie ujumbe', 'Send Message': 'Tuma ujumbe',
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

Object.assign(translations.fr, {
  'David KWIZERA | Portfolio': 'Portfolio de David KWIZERA',
  "Explore David KWIZERA's portfolio, background, skills, projects and professional documents.": 'Découvrez le portfolio de David KWIZERA, son parcours, ses compétences, ses projets et ses documents professionnels.',
  'Login': 'Connexion',
  "I'm a Developer": 'Je suis développeur',
  'Computer Science Student | Frontend Developer': 'Étudiant en informatique | Développeur frontend',
  'DOCUMENTS & RESOURCES': 'DOCUMENTS ET RESSOURCES',
  'Need my CV or certificates?': 'Besoin de mon CV ou de mes certificats ?',
  'Visit document center': 'Visiter le centre de documents',
  'Computer Science student | Frontend Developer | Problem Solver': 'Étudiant en informatique | Développeur frontend | Résolution de problèmes',
  'David KWIZERA home': 'Accueil de David KWIZERA',
  'Complete both French and Kiswahili translations before publishing. Remaining fields: {count}.': 'Complétez les traductions française et kiswahili avant la publication. Champs restants : {count}.',
  'Email': 'E-mail',
  'Contact': 'Contact',
  'Privacy': 'Confidentialité',
  'Profile': 'Profil'
});

Object.assign(translations.sw, {
  'David KWIZERA | Portfolio': 'Wasifu wa David KWIZERA',
  "Explore David KWIZERA's portfolio, background, skills, projects and professional documents.": 'Tazama wasifu wa David KWIZERA, historia yake, ujuzi, miradi na nyaraka za kitaaluma.',
  'Login': 'Ingia',
  "I'm a Developer": 'Mimi ni Msanidi Programu',
  'Computer Science Student | Frontend Developer': 'Mwanafunzi wa Sayansi ya Kompyuta | Msanidi wa Frontend',
  'DOCUMENTS & RESOURCES': 'NYARAKA NA RASILIMALI',
  'Need my CV or certificates?': 'Unahitaji CV au vyeti vyangu?',
  'Visit document center': 'Tembelea kituo cha nyaraka',
  'Computer Science student | Frontend Developer | Problem Solver': 'Mwanafunzi wa Sayansi ya Kompyuta | Msanidi wa Frontend | Mtatuzi wa Matatizo',
  'David KWIZERA home': 'Mwanzo wa David KWIZERA',
  'Complete both French and Kiswahili translations before publishing. Remaining fields: {count}.': 'Kamilisha tafsiri za Kifaransa na Kiswahili kabla ya kuchapisha. Sehemu zilizobaki: {count}.',
  'Email': 'Barua pepe',
  'Contact': 'Mawasiliano',
  'Privacy': 'Faragha',
  'Profile': 'Wasifu'
});

Object.assign(translations.fr, {
  'DAVID KWIZERA · COMPUTER SCIENCE': 'DAVID KWIZERA · INFORMATIQUE',
  'WHAT I BRING': 'MES ATOUTS',
  'My focus areas': 'Mes domaines de prédilection',
  'Education': 'Formation',
  'BSc Computer Science at University of Rwanda. Strong foundation in algorithms, data structures, databases, and modern software engineering practices.': 'Licence en informatique à l’Université du Rwanda. Solides bases en algorithmes, structures de données, bases de données et pratiques modernes du génie logiciel.',
  'Frontend development': 'Développement frontend',
  'Experienced in building responsive, user-friendly web interfaces using HTML, CSS, JavaScript, and modern frameworks like React.': 'Expérience dans la création d’interfaces web adaptatives et faciles à utiliser avec HTML, CSS, JavaScript et des frameworks modernes comme React.',
  'Backend & databases': 'Backend et bases de données',
  'Proficient in Python, Java, and database design with PostgreSQL and MySQL. Building scalable server-side solutions.': 'Maîtrise de Python, Java et de la conception de bases de données avec PostgreSQL et MySQL. Création de solutions serveur évolutives.',
  'AI & machine learning': 'IA et apprentissage automatique',
  'Actively exploring artificial intelligence and machine learning applications in modern software development.': 'Exploration active des applications de l’intelligence artificielle et de l’apprentissage automatique dans le développement logiciel moderne.',
  'Problem solving': 'Résolution de problèmes',
  'Strong algorithmic foundation and competitive programming experience with focus on efficient, elegant solutions.': 'Solides bases en algorithmique et expérience en programmation compétitive, avec un souci d’efficacité et d’élégance.',
  'Always learning': 'Toujours en apprentissage',
  'Committed to staying updated with emerging technologies and best practices in the tech industry.': 'Déterminé à suivre les nouvelles technologies et les meilleures pratiques du secteur.',
  'Explore my skills': 'Découvrir mes compétences',
  'Site description': 'Découvrez le portfolio de David KWIZERA, son parcours, ses compétences, ses projets et ses documents professionnels.',
  'From my high school days exploring the fundamentals, to now pursuing a degree in Computer Science, I\'ve constantly sought to deepen my understanding of software development, algorithms, and emerging technologies. Each experience has shaped my problem-solving approach and reinforced my passion for building meaningful applications.': 'Depuis mes premières découvertes au lycée jusqu’à mes études actuelles en informatique, j’ai toujours cherché à approfondir mes connaissances en développement logiciel, en algorithmique et en technologies émergentes. Chaque expérience a façonné ma méthode de résolution de problèmes et renforcé mon envie de créer des applications utiles.',
  'Below, you\'ll find my academic milestones and professional experiences that have defined my career path:': 'Voici les étapes de ma formation et mes expériences professionnelles qui ont marqué mon parcours :',
  'This foundation is shaping my ability to write efficient, scalable, and maintainable code across various domains.': 'Cette formation m’aide à écrire du code efficace, évolutif et facile à maintenir dans différents domaines.',
  'Currently participating in a Google Developer Group (GDG) hackathon — collaborating with a team to build a real-world solution under time pressure. Gaining hands-on experience with modern tools and technologies.': 'Participation à un hackathon du Google Developer Group (GDG) : collaboration en équipe pour créer une solution concrète dans un temps limité et acquérir une expérience pratique des outils modernes.',
  'Currently building responsive web interfaces using HTML, CSS, and JavaScript. Worked on': 'Création actuelle d’interfaces web adaptatives avec HTML, CSS et JavaScript. Projet réalisé :',
  'Built desktop GUI applications using Java Swing, focusing on clean UI design and event-driven programming.': 'Création d’applications de bureau avec Java Swing, en privilégiant une interface claire et une programmation événementielle.',
  'Familiar with Linux fundamentals — navigating the terminal, managing files and directories, file permissions, process management, and installing packages via apt. Comfortable working in a Linux environment for development tasks.': 'Connaissances des bases de Linux : terminal, fichiers et dossiers, permissions, gestion des processus et installation de paquets avec apt. À l’aise dans un environnement Linux pour le développement.',
  'Key Learning & Growth Points': 'Principaux apprentissages et progrès',
  'No catalog translation yet. Add a translation here to avoid English appearing in this language.': 'Aucune traduction du catalogue n’est disponible. Ajoutez une traduction ici pour éviter que le texte reste en anglais.',
  'The action could not be completed.': 'Impossible de terminer cette action.',
  'Your admin session has expired. Sign in again to continue.': 'Votre session administrateur a expiré. Reconnectez-vous pour continuer.',
  'The admin profile is missing a name or email address.': 'Le profil administrateur ne contient pas de nom ou d’adresse e-mail.',
  'The server could not end this admin session.': 'Le serveur n’a pas pu fermer cette session administrateur.',
  'Download requests refreshed successfully.': 'Les demandes de téléchargement ont été actualisées.',
  'Could not refresh download requests.': 'Impossible d’actualiser les demandes de téléchargement.',
  'Could not verify your previous session. Sign in again to continue.': 'Impossible de vérifier votre session précédente. Reconnectez-vous pour continuer.',
  'Could not verify the admin session.': 'Impossible de vérifier la session administrateur.',
  'Could not verify the sign-in service. Check the connection and try again.': 'Impossible de vérifier le service de connexion. Vérifiez la connexion et réessayez.',
  'Could not sign in. Please try again.': 'Connexion impossible. Veuillez réessayer.',
  'Could not load the admin profile image.': 'Impossible de charger l’image du profil administrateur.',
  'Homepage changes published successfully.': 'Les modifications de la page d’accueil ont été publiées.',
  'Homepage defaults restored successfully.': 'Le contenu par défaut de la page d’accueil a été restauré.',
  'Profile image published successfully.': 'L’image de profil a été publiée.',
  'CV published successfully.': 'Le CV a été publié.',
  'Certificate updated successfully.': 'Le certificat a été mis à jour.',
  'Certificate saved successfully.': 'Le certificat a été enregistré.',
  'Document deleted successfully.': 'Le document a été supprimé.',
  'Download request deleted successfully.': 'La demande de téléchargement a été supprimée.',
  'Signed out successfully.': 'Déconnexion réussie.',
  'Changes saved successfully.': 'Modifications enregistrées.',
  'No document details are available.': 'Aucune information sur le document n’est disponible.',
  'Choose a PDF file no larger than 10 MB.': 'Choisissez un fichier PDF de 10 Mo maximum.',
  'Choose a PDF file for this certificate.': 'Choisissez un fichier PDF pour ce certificat.',
  'Choose a PDF file no larger than 10 MB for this certificate.': 'Choisissez un fichier PDF de 10 Mo maximum pour ce certificat.',
  'Choose a JPG, PNG, or WebP image up to 5 MB.': 'Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.',
  'Current profile image': 'Image de profil actuelle',
  'Profile image': 'Image de profil',
  'Change the image and choose who can see it from your profile settings.': 'Modifiez l’image et choisissez qui peut la voir dans les paramètres de votre profil.',
  'Manage image visibility': 'Gérer la visibilité de l’image',
  'A list contains invalid JSON. Correct it and try again.': 'Une liste contient du JSON invalide. Corrigez-la puis réessayez.',
  'Save and review the homepage before publishing.': 'Enregistrez et prévisualisez la page d’accueil avant publication.',
  'Homepage changes were published successfully and are now visible to visitors.': 'Les modifications de la page d’accueil ont été publiées et sont visibles par les visiteurs.',
  'Could not restore homepage content.': 'Impossible de restaurer le contenu de la page d’accueil.',
  'Could not load administrator accounts.': 'Impossible de charger les comptes administrateur.',
  'Could not send a password reset link.': 'Impossible d’envoyer le lien de réinitialisation du mot de passe.',
  'Passwords do not match.': 'Les mots de passe ne correspondent pas.',
  'Choose a profile image first.': 'Choisissez d’abord une image de profil.',
  'Choose a PDF file to publish the CV.': 'Choisissez un fichier PDF pour publier le CV.',
  'No certificates have been added yet.': 'Aucun certificat n’a encore été ajouté.',
  'No CV has been added yet.': 'Aucun CV n’a encore été ajouté.',
  'optional - keeps current': 'facultatif, conserve le fichier actuel',
  'required': 'obligatoire',
  'optional': 'facultatif'
});

Object.assign(translations.sw, {
  'DAVID KWIZERA · COMPUTER SCIENCE': 'DAVID KWIZERA · SAYANSI YA KOMPYUTA',
  'WHAT I BRING': 'NINACHOLETEA',
  'My focus areas': 'Maeneo ninayolenga',
  'Education': 'Elimu',
  'BSc Computer Science at University of Rwanda. Strong foundation in algorithms, data structures, databases, and modern software engineering practices.': 'Shahada ya Sayansi ya Kompyuta katika Chuo Kikuu cha Rwanda. Msingi mzuri wa algoriti, miundo ya data, hifadhidata na mbinu za kisasa za uhandisi wa programu.',
  'Frontend development': 'Uundaji wa frontend',
  'Experienced in building responsive, user-friendly web interfaces using HTML, CSS, JavaScript, and modern frameworks like React.': 'Uzoefu wa kuunda violesura vya wavuti vinavyojirekebisha na rahisi kutumia kwa HTML, CSS, JavaScript na mifumo kama React.',
  'Backend & databases': 'Backend na hifadhidata',
  'Proficient in Python, Java, and database design with PostgreSQL and MySQL. Building scalable server-side solutions.': 'Ujuzi wa Python, Java na usanifu wa hifadhidata kwa PostgreSQL na MySQL. Ujenzi wa mifumo ya seva inayoweza kukua.',
  'AI & machine learning': 'AI na machine learning',
  'Actively exploring artificial intelligence and machine learning applications in modern software development.': 'Ninachunguza matumizi ya akili bandia na machine learning katika uundaji wa programu za kisasa.',
  'Problem solving': 'Utatuzi wa matatizo',
  'Strong algorithmic foundation and competitive programming experience with focus on efficient, elegant solutions.': 'Msingi mzuri wa algoriti na uzoefu wa mashindano ya programu, nikilenga suluhisho bora na rahisi.',
  'Always learning': 'Kujifunza daima',
  'Committed to staying updated with emerging technologies and best practices in the tech industry.': 'Ninajitahidi kufuatilia teknolojia mpya na mbinu bora za tasnia ya teknolojia.',
  'Explore my skills': 'Angalia ujuzi wangu',
  'Site description': 'Gundua wasifu wa David KWIZERA, historia yake, ujuzi, miradi na hati za kitaaluma.',
  'From my high school days exploring the fundamentals, to now pursuing a degree in Computer Science, I\'ve constantly sought to deepen my understanding of software development, algorithms, and emerging technologies. Each experience has shaped my problem-solving approach and reinforced my passion for building meaningful applications.': 'Tangu nilipoanza kuchunguza misingi ya teknolojia shuleni hadi sasa ninaposomea sayansi ya kompyuta, nimeendelea kuongeza uelewa wangu wa uundaji wa programu, algoriti na teknolojia mpya. Kila uzoefu umeimarisha namna ninavyotatua matatizo na hamu yangu ya kuunda programu zenye manufaa.',
  'Below, you\'ll find my academic milestones and professional experiences that have defined my career path:': 'Hapa chini kuna hatua za elimu na uzoefu wa kazi zilizoelekeza safari yangu:',
  'Key Learning & Growth Points': 'Mambo muhimu niliyojifunza na kuboresha',
  'No catalog translation yet. Add a translation here to avoid English appearing in this language.': 'Bado hakuna tafsiri kwenye orodha. Ongeza tafsiri hapa ili maandishi yasionekane kwa Kiingereza.',
  'The action could not be completed.': 'Kitendo hiki hakikuweza kukamilishwa.',
  'Your admin session has expired. Sign in again to continue.': 'Kipindi chako cha msimamizi kimeisha. Ingia tena ili kuendelea.',
  'The admin profile is missing a name or email address.': 'Wasifu wa msimamizi hauna jina au anwani ya barua pepe.',
  'The server could not end this admin session.': 'Seva haikuweza kufunga kipindi hiki cha msimamizi.',
  'Download requests refreshed successfully.': 'Maombi ya upakuaji yameonyeshwa upya.',
  'Could not refresh download requests.': 'Imeshindikana kuonyesha upya maombi ya upakuaji.',
  'Could not verify your previous session. Sign in again to continue.': 'Imeshindikana kuthibitisha kipindi chako kilichopita. Ingia tena ili kuendelea.',
  'Could not verify the admin session.': 'Imeshindikana kuthibitisha kipindi cha msimamizi.',
  'Could not verify the sign-in service. Check the connection and try again.': 'Imeshindikana kuthibitisha huduma ya kuingia. Kagua muunganisho kisha ujaribu tena.',
  'Could not sign in. Please try again.': 'Imeshindikana kuingia. Jaribu tena.',
  'Could not load the admin profile image.': 'Imeshindikana kupakia picha ya wasifu wa msimamizi.',
  'Homepage changes published successfully.': 'Mabadiliko ya ukurasa wa mwanzo yamechapishwa.',
  'Homepage defaults restored successfully.': 'Maudhui chaguomsingi ya ukurasa wa mwanzo yamerejeshwa.',
  'Profile image published successfully.': 'Picha ya wasifu imechapishwa.',
  'CV published successfully.': 'CV imechapishwa.',
  'Certificate updated successfully.': 'Cheti kimesasishwa.',
  'Certificate saved successfully.': 'Cheti kimehifadhiwa.',
  'Document deleted successfully.': 'Hati imefutwa.',
  'Download request deleted successfully.': 'Ombi la upakuaji limefutwa.',
  'Signed out successfully.': 'Umetoka kwenye akaunti.',
  'Changes saved successfully.': 'Mabadiliko yamehifadhiwa.',
  'Choose a PDF file to publish the CV.': 'Chagua faili la PDF ili kuchapisha CV.',
  'Choose a PDF file no larger than 10 MB.': 'Chagua faili la PDF lisilozidi MB 10.',
  'Choose a PDF file for this certificate.': 'Chagua faili la PDF la cheti hiki.',
  'Choose a PDF file no larger than 10 MB for this certificate.': 'Chagua faili la PDF lisilozidi MB 10 kwa cheti hiki.',
  'Choose a JPG, PNG, or WebP image up to 5 MB.': 'Chagua picha ya JPG, PNG au WebP isiyozidi MB 5.',
  'Choose a profile image first.': 'Chagua picha ya wasifu kwanza.',
  'Current profile image': 'Picha ya sasa ya wasifu',
  'Profile image': 'Picha ya wasifu',
  'Change the image and choose who can see it from your profile settings.': 'Badilisha picha na uchague anayeweza kuiona kwenye mipangilio ya wasifu.',
  'Manage image visibility': 'Dhibiti mwonekano wa picha',
  'A list contains invalid JSON. Correct it and try again.': 'Orodha ina JSON isiyo sahihi. Irekebishe kisha ujaribu tena.',
  'Homepage changes were published successfully and are now visible to visitors.': 'Mabadiliko ya ukurasa wa mwanzo yamechapishwa na sasa yanaonekana kwa wageni.',
  'Could not restore homepage content.': 'Imeshindikana kurejesha maudhui ya ukurasa wa mwanzo.',
  'Could not load administrator accounts.': 'Imeshindikana kupakia akaunti za wasimamizi.',
  'Could not send a password reset link.': 'Imeshindikana kutuma kiungo cha kuweka upya nenosiri.',
  'No certificates have been added yet.': 'Bado hakuna vyeti vilivyoongezwa.',
  'No CV has been added yet.': 'Bado hakuna CV iliyoongezwa.',
  'optional - keeps current': 'si lazima, huhifadhi faili la sasa',
  'required': 'inahitajika',
  'optional': 'si lazima'
});

Object.assign(translations.fr, {
  'Admins': 'Administrateurs',
  'Administrator count': 'Nombre d’administrateurs : {count}',
  'WORKSPACE SECURITY': 'SÉCURITÉ DE L’ESPACE DE TRAVAIL',
  'DATABASE ACCOUNTS': 'COMPTES DE LA BASE DE DONNÉES',
  'Administrator directory': 'Répertoire des administrateurs',
  'Password hashes are never shown in the browser. Send a time-limited recovery link to reset an account password.': 'Les mots de passe chiffrés ne sont jamais affichés dans le navigateur. Envoyez un lien de récupération temporaire pour réinitialiser un mot de passe.',
  'NAME': 'NOM', 'PHONE': 'TÉLÉPHONE', 'EMAIL': 'E-MAIL', 'PASSWORD': 'MOT DE PASSE', 'RESET': 'RÉINITIALISER',
  'Not provided': 'Non renseigné', 'Protected': 'Protégé', 'Sending…': 'Envoi…', 'Send reset link': 'Envoyer le lien de réinitialisation',
  'No administrator accounts were returned.': 'Aucun compte administrateur n’a été renvoyé.',
  '{count} administrator account stored in the database.': '{count} compte administrateur enregistré dans la base de données.',
  '{count} administrator accounts stored in the database.': '{count} comptes administrateur enregistrés dans la base de données.',
  'Loading accounts from the database…': 'Chargement des comptes depuis la base de données…',
  'Could not load accounts from the database.': 'Impossible de charger les comptes depuis la base de données.',
  'View administrator accounts': 'Voir les comptes administrateur',
  'Signed-in administrator profile': 'Profil de l’administrateur connecté',
  'Admin sections': 'Rubriques d’administration',
  'Secure sign-in · Administrator access only': 'Connexion sécurisée · Accès réservé aux administrateurs',
  'Protected by administrator': 'Protégé par l’administrateur',
  'Review visitor activity and published document counts.': 'Consultez l’activité des visiteurs et le nombre de documents publiés.',
  'Total downloads': 'Téléchargements au total',
  'database records': 'enregistrements dans la base de données',
  'PUBLIC CONTENT': 'CONTENU PUBLIC',
  'Manage the text, links, images, cards, and visibility of every landing-page section.': 'Gérez les textes, liens, images, cartes et la visibilité de chaque section de la page d’accueil.',
  'ACCOUNT DETAILS': 'DÉTAILS DU COMPTE',
  'Signed-in administrator': 'Administrateur connecté',
  'These details come from your secure admin session. Sign-in credentials are managed on the server and are never displayed here.': 'Ces informations proviennent de votre session sécurisée. Les identifiants sont gérés sur le serveur et ne sont jamais affichés ici.',
  'Role': 'Rôle', 'Administrator': 'Administrateur', 'Session': 'Session', 'Active · secure': 'Active · sécurisée'
});

Object.assign(translations.sw, {
  'Admins': 'Wasimamizi',
  'Administrator count': 'Idadi ya wasimamizi: {count}',
  'WORKSPACE SECURITY': 'USALAMA WA ENEO LA KAZI',
  'DATABASE ACCOUNTS': 'AKAUNTI ZA HIFADHIDATA',
  'Administrator directory': 'Orodha ya wasimamizi',
  'Password hashes are never shown in the browser. Send a time-limited recovery link to reset an account password.': 'Nenosiri yaliyosimbwa hayaonyeshwi kwenye kivinjari. Tuma kiungo cha muda cha kurejesha akaunti ili kuweka upya nenosiri.',
  'NAME': 'JINA', 'PHONE': 'SIMU', 'EMAIL': 'BARUA PEPE', 'PASSWORD': 'NENOSIRI', 'RESET': 'WEKA UPYA',
  'Not provided': 'Haijatolewa', 'Protected': 'Imelindwa', 'Sending…': 'Inatuma…', 'Send reset link': 'Tuma kiungo cha kuweka upya',
  'No administrator accounts were returned.': 'Hakuna akaunti za wasimamizi zilizopatikana.',
  '{count} administrator account stored in the database.': 'Akaunti {count} ya msimamizi imehifadhiwa kwenye hifadhidata.',
  '{count} administrator accounts stored in the database.': 'Akaunti {count} za wasimamizi zimehifadhiwa kwenye hifadhidata.',
  'Loading accounts from the database…': 'Inapakia akaunti kutoka hifadhidata…',
  'Could not load accounts from the database.': 'Imeshindikana kupakia akaunti kutoka hifadhidata.',
  'View administrator accounts': 'Tazama akaunti za wasimamizi',
  'Signed-in administrator profile': 'Wasifu wa msimamizi aliyeingia',
  'Admin sections': 'Sehemu za usimamizi',
  'Secure sign-in · Administrator access only': 'Kuingia salama · Wasimamizi pekee',
  'Protected by administrator': 'Imelindwa na msimamizi',
  'Review visitor activity and published document counts.': 'Kagua shughuli za wageni na idadi ya nyaraka zilizochapishwa.',
  'Total downloads': 'Jumla ya vipakuliwa',
  'database records': 'rekodi za hifadhidata',
  'PUBLIC CONTENT': 'MAUDHUI YA UMMA',
  'Manage the text, links, images, cards, and visibility of every landing-page section.': 'Dhibiti maandishi, viungo, picha, kadi na mwonekano wa kila sehemu ya ukurasa wa mwanzo.',
  'ACCOUNT DETAILS': 'MAELEZO YA AKAUNTI',
  'Signed-in administrator': 'Msimamizi aliyeingia',
  'These details come from your secure admin session. Sign-in credentials are managed on the server and are never displayed here.': 'Maelezo haya yanatoka kwenye kipindi chako salama cha msimamizi. Taarifa za kuingia hudhibitiwa kwenye seva na hazionyeshwi hapa.',
  'Role': 'Jukumu', 'Administrator': 'Msimamizi', 'Session': 'Kipindi', 'Active · secure': 'Hai · salama'
});

Object.assign(translations.fr, {
  'Administrator access': 'Accès administrateur',
  'Enter your password': 'Saisissez votre mot de passe',
  'New administrator? Your account is created by invitation. Check your email for the setup link, or request a fresh one.': 'Nouveau administrateur ? Votre compte est créé sur invitation. Consultez votre e-mail pour le lien de configuration ou demandez-en un nouveau.',
  'Request a setup link': 'Demander un lien de configuration',
  'Set up your password': 'Créer votre mot de passe',
  'NEW ADMIN ACCOUNT': 'NOUVEAU COMPTE ADMINISTRATEUR',
  'Enter your admin email. If the account exists, we will email a one-time link. For a new invite, this link lets you finish setting up your account.': 'Saisissez votre e-mail administrateur. Si le compte existe, nous enverrons un lien à usage unique. Pour une nouvelle invitation, ce lien vous permettra de terminer la configuration du compte.',
  'Choose a password to activate your administrator account.': 'Choisissez un mot de passe pour activer votre compte administrateur.',
  'Checking your secure link…': 'Vérification de votre lien sécurisé…',
  'This link has expired or already been used.': 'Ce lien a expiré ou a déjà été utilisé.',
  'Request a fresh setup or reset link with your admin email.': 'Demandez un nouveau lien de configuration ou de réinitialisation avec votre e-mail administrateur.',
  'Request a new link': 'Demander un nouveau lien',
  'Use at least 8 characters. A longer, unique password is safer.': 'Utilisez au moins 8 caractères. Un mot de passe long et unique est plus sûr.',
  'Set password and activate': 'Créer le mot de passe et activer',
  'Email me a secure link': 'M’envoyer un lien sécurisé',
  'Secure, one-time link · Expires after 30 minutes': 'Lien sécurisé à usage unique · Expire après 30 minutes',
  'Continue to sign in': 'Continuer vers la connexion',
  'Check your inbox and spam folder. If no message arrives, ask the platform owner to confirm your invitation.': 'Vérifiez votre boîte de réception et vos courriers indésirables. Si aucun message n’arrive, demandez au propriétaire de la plateforme de confirmer votre invitation.',
  'Use a different email': 'Utiliser une autre adresse e-mail',
  'If this email belongs to an admin, a reset link will be sent shortly.': 'Si cette adresse appartient à un administrateur, un lien de réinitialisation sera envoyé sous peu.',
  'Your password is set and your admin account is active. You can now sign in.': 'Votre mot de passe est créé et votre compte administrateur est actif. Vous pouvez vous connecter.',
  'Your password was updated, but this admin account is inactive. Contact the platform owner for access.': 'Votre mot de passe a été modifié, mais ce compte administrateur est inactif. Contactez le propriétaire de la plateforme pour obtenir l’accès.',
  'Your password has been updated. Sign in with your new password.': 'Votre mot de passe a été modifié. Connectez-vous avec votre nouveau mot de passe.'
});

Object.assign(translations.sw, {
  'Administrator access': 'Ufikiaji wa msimamizi',
  'Enter your password': 'Weka nenosiri lako',
  'New administrator? Your account is created by invitation. Check your email for the setup link, or request a fresh one.': 'Msimamizi mpya? Akaunti yako huundwa kwa mwaliko. Angalia barua pepe yako kwa kiungo cha kuanzisha akaunti au omba kiungo kipya.',
  'Request a setup link': 'Omba kiungo cha kuanzisha akaunti',
  'Set up your password': 'Weka nenosiri lako',
  'NEW ADMIN ACCOUNT': 'AKAUNTI MPYA YA MSIMAMIZI',
  'Enter your admin email. If the account exists, we will email a one-time link. For a new invite, this link lets you finish setting up your account.': 'Weka barua pepe yako ya msimamizi. Ikiwa akaunti ipo, tutatuma kiungo cha matumizi mara moja. Kwa mwaliko mpya, kiungo hiki kitakusaidia kukamilisha usanidi wa akaunti.',
  'Choose a password to activate your administrator account.': 'Chagua nenosiri ili kuwasha akaunti yako ya msimamizi.',
  'Checking your secure link…': 'Inakagua kiungo chako salama…',
  'This link has expired or already been used.': 'Kiungo hiki kimeisha muda au tayari kimetumika.',
  'Request a fresh setup or reset link with your admin email.': 'Omba kiungo kipya cha usanidi au kuweka upya kwa kutumia barua pepe yako ya msimamizi.',
  'Request a new link': 'Omba kiungo kipya',
  'Use at least 8 characters. A longer, unique password is safer.': 'Tumia angalau herufi 8. Nenosiri refu na la kipekee ni salama zaidi.',
  'Set password and activate': 'Weka nenosiri na uwashe akaunti',
  'Email me a secure link': 'Nitumie kiungo salama kwa barua pepe',
  'Secure, one-time link · Expires after 30 minutes': 'Kiungo salama cha matumizi mara moja · Huisha baada ya dakika 30',
  'Continue to sign in': 'Endelea kuingia',
  'Check your inbox and spam folder. If no message arrives, ask the platform owner to confirm your invitation.': 'Angalia kikasha chako na folda ya barua taka. Usipopokea ujumbe, mwombe mmiliki wa jukwaa athibitishe mwaliko wako.',
  'Use a different email': 'Tumia barua pepe nyingine',
  'If this email belongs to an admin, a reset link will be sent shortly.': 'Ikiwa barua pepe hii ni ya msimamizi, kiungo cha kuweka upya kitatumwa hivi karibuni.',
  'Your password is set and your admin account is active. You can now sign in.': 'Nenosiri limewekwa na akaunti yako ya msimamizi imewashwa. Sasa unaweza kuingia.',
  'Your password was updated, but this admin account is inactive. Contact the platform owner for access.': 'Nenosiri lako limesasishwa lakini akaunti hii ya msimamizi haijawashwa. Wasiliana na mmiliki wa jukwaa ili kupata ufikiaji.',
  'Your password has been updated. Sign in with your new password.': 'Nenosiri lako limesasishwa. Ingia kwa kutumia nenosiri jipya.'
});

Object.assign(translations.fr, {
  'This link has expired or already been used. Request a fresh link.': 'Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.',
  'This account is not active yet. Open the setup link sent to your email, or request a new one.': 'Ce compte n’est pas encore actif. Ouvrez le lien de configuration envoyé par e-mail ou demandez-en un nouveau.',
  'This administrator account is inactive. Contact the platform owner for access.': 'Ce compte administrateur est inactif. Contactez le propriétaire de la plateforme pour obtenir l’accès.',
  'A secure account setup link was sent to {email}.': 'Un lien sécurisé de configuration du compte a été envoyé à {email}.',
  'A one-time password reset link was sent to {email}.': 'Un lien unique de réinitialisation du mot de passe a été envoyé à {email}.',
  'A secure account setup link was sent.': 'Un lien sécurisé de configuration du compte a été envoyé.',
  'A one-time password reset link was sent.': 'Un lien unique de réinitialisation du mot de passe a été envoyé.',
  'Account setup link requested': 'Lien de configuration demandé',
  'Email or password is incorrect.': 'L’adresse e-mail ou le mot de passe est incorrect.',
  'This reset link is invalid or expired. Request a new one.': 'Ce lien de réinitialisation est invalide ou expiré. Demandez-en un nouveau.',
  'Choose a password with at least 8 characters.': 'Choisissez un mot de passe d’au moins 8 caractères.',
  'Enter your email and password.': 'Saisissez votre adresse e-mail et votre mot de passe.',
  'The sign-in service could not be reached. Check your connection and try again.': 'Le service de connexion est inaccessible. Vérifiez votre connexion et réessayez.',
  'Your browser could not verify the new session. Allow cookies for this site and try again.': 'Votre navigateur n’a pas pu vérifier la nouvelle session. Autorisez les cookies pour ce site et réessayez.',
  'Could not complete this request. Please try again.': 'Impossible de terminer cette demande. Veuillez réessayer.'
});
Object.assign(translations.sw, {
  'This link has expired or already been used. Request a fresh link.': 'Kiungo hiki kimeisha muda au tayari kimetumika. Omba kiungo kipya.',
  'This account is not active yet. Open the setup link sent to your email, or request a new one.': 'Akaunti hii bado haijawashwa. Fungua kiungo cha usanidi kilichotumwa kwenye barua pepe yako au omba kingine.',
  'This administrator account is inactive. Contact the platform owner for access.': 'Akaunti hii ya msimamizi haijawashwa. Wasiliana na mmiliki wa jukwaa ili kupata ufikiaji.',
  'A secure account setup link was sent to {email}.': 'Kiungo salama cha usanidi wa akaunti kimetumwa kwa {email}.',
  'A one-time password reset link was sent to {email}.': 'Kiungo cha mara moja cha kuweka upya nenosiri kimetumwa kwa {email}.',
  'A secure account setup link was sent.': 'Kiungo salama cha usanidi wa akaunti kimetumwa.',
  'A one-time password reset link was sent.': 'Kiungo cha mara moja cha kuweka upya nenosiri kimetumwa.',
  'Account setup link requested': 'Kiungo cha usanidi wa akaunti kimeombwa',
  'Email or password is incorrect.': 'Barua pepe au nenosiri si sahihi.',
  'This reset link is invalid or expired. Request a new one.': 'Kiungo hiki cha kuweka upya si sahihi au kimeisha muda. Omba kingine.',
  'Choose a password with at least 8 characters.': 'Chagua nenosiri lenye angalau herufi 8.',
  'Enter your email and password.': 'Weka barua pepe na nenosiri lako.',
  'The sign-in service could not be reached. Check your connection and try again.': 'Huduma ya kuingia haipatikani. Kagua muunganisho wako kisha ujaribu tena.',
  'Your browser could not verify the new session. Allow cookies for this site and try again.': 'Kivinjari chako hakikuweza kuthibitisha kipindi kipya. Ruhusu vidakuzi vya tovuti hii kisha ujaribu tena.',
  'Could not complete this request. Please try again.': 'Imeshindikana kukamilisha ombi hili. Tafadhali jaribu tena.'
});

Object.assign(translations.fr, {
  'New administrators join by invitation. If you have already been invited but cannot find your setup email, request another link.': 'Les nouveaux administrateurs rejoignent la plateforme sur invitation. Si vous avez déjà été invité mais ne trouvez pas l’e-mail de configuration, demandez un nouveau lien.',
  'Resend my setup link': 'Renvoyer mon lien de configuration',
  'Resend setup invitation': 'Renvoyer l’invitation de configuration',
  'Enter the email address that received your administrator invitation. We will send a new setup link if the invitation is still pending.': 'Saisissez l’adresse e-mail qui a reçu l’invitation administrateur. Nous renverrons un lien si l’invitation est toujours en attente.',
  'Enter your admin email. If it belongs to an active administrator account, we will email a one-time password reset link.': 'Saisissez votre e-mail administrateur. S’il correspond à un compte actif, nous enverrons un lien unique de réinitialisation du mot de passe.',
  'Resend setup email': 'Renvoyer l’e-mail de configuration',
  'Send password reset link': 'Envoyer le lien de réinitialisation',
  'Check your inbox and spam folder. If no setup email arrives, contact the person who invited you.': 'Vérifiez votre boîte de réception et vos courriers indésirables. Si l’e-mail de configuration n’arrive pas, contactez la personne qui vous a invité.',
  'Check your inbox and spam folder. If no reset email arrives, contact the platform owner.': 'Vérifiez votre boîte de réception et vos courriers indésirables. Si l’e-mail de réinitialisation n’arrive pas, contactez le propriétaire de la plateforme.',
  'If this email has a pending administrator invitation, a setup link will be sent shortly.': 'Si cette adresse correspond à une invitation administrateur en attente, un lien de configuration sera envoyé sous peu.',
  'If this email belongs to an active administrator, a password reset link will be sent shortly.': 'Si cette adresse appartient à un administrateur actif, un lien de réinitialisation sera envoyé sous peu.'
});

Object.assign(translations.sw, {
  'New administrators join by invitation. If you have already been invited but cannot find your setup email, request another link.': 'Wasimamizi wapya hujiunga kwa mwaliko. Ikiwa tayari umealikwa lakini huioni barua pepe ya usanidi, omba kiungo kingine.',
  'Resend my setup link': 'Tuma tena kiungo changu cha usanidi',
  'Resend setup invitation': 'Tuma tena mwaliko wa usanidi',
  'Enter the email address that received your administrator invitation. We will send a new setup link if the invitation is still pending.': 'Weka anwani ya barua pepe iliyopokea mwaliko wako wa msimamizi. Tutatuma kiungo kipya ikiwa mwaliko bado unasubiri.',
  'Enter your admin email. If it belongs to an active administrator account, we will email a one-time password reset link.': 'Weka barua pepe yako ya msimamizi. Ikiwa ni ya akaunti hai, tutatuma kiungo cha mara moja cha kuweka upya nenosiri.',
  'Resend setup email': 'Tuma tena barua pepe ya usanidi',
  'Send password reset link': 'Tuma kiungo cha kuweka upya nenosiri',
  'Check your inbox and spam folder. If no setup email arrives, contact the person who invited you.': 'Angalia kikasha na folda ya barua taka. Usipopokea barua pepe ya usanidi, wasiliana na mtu aliyekualika.',
  'Check your inbox and spam folder. If no reset email arrives, contact the platform owner.': 'Angalia kikasha na folda ya barua taka. Usipopokea barua pepe ya kuweka upya, wasiliana na mmiliki wa jukwaa.',
  'If this email has a pending administrator invitation, a setup link will be sent shortly.': 'Ikiwa barua pepe hii ina mwaliko wa msimamizi unaosubiri, kiungo cha usanidi kitatumwa hivi karibuni.',
  'If this email belongs to an active administrator, a password reset link will be sent shortly.': 'Ikiwa barua pepe hii ni ya msimamizi aliye hai, kiungo cha kuweka upya nenosiri kitatumwa hivi karibuni.'
});

Object.assign(translations.fr, {
  'Platform Owner Console': 'Console du propriétaire de la plateforme',
  'Open Platform Owner Console': 'Ouvrir la console du propriétaire de la plateforme',
  'Manage platform access and the administrators for rented accounts.': 'Gérez les accès à la plateforme et les administrateurs des comptes loués.'
});

Object.assign(translations.sw, {
  'Platform Owner Console': 'Dashibodi ya Mmiliki wa Jukwaa',
  'Open Platform Owner Console': 'Fungua dashibodi ya Mmiliki wa Jukwaa',
  'Manage platform access and the administrators for rented accounts.': 'Dhibiti ufikiaji wa jukwaa na wasimamizi wa akaunti zilizokodishwa.'
});

export function getTranslation(text, language) {
  return translations[language]?.[text] || text;
}

export function hasTranslation(text, language) {
  return Object.hasOwn(translations[language] || {}, text);
}

export function LanguageProvider({ children }) {
  const isAdmin = typeof window !== 'undefined' && /admin(?:-|\.html|$)/.test(window.location.pathname.split('/').pop() || '');
  const storageKey = `kade-language-${isAdmin ? 'admin' : 'visitor'}`;
  const [language, setLanguage] = useState(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get('lang');
      if (Object.hasOwn(languageNames, requested)) return requested;
      const saved = window.localStorage.getItem(storageKey);
      return Object.hasOwn(languageNames, saved) ? saved : 'en';
    } catch { return 'en'; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(storageKey, language); } catch { /* Language still applies for this page. */ }
    document.documentElement.lang = language;
  }, [language, storageKey]);
  useEffect(() => {
    const translateTextNode = (node) => {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, textarea, code, pre, [contenteditable="true"]')) return;
      const record = translatedTextNodes.get(node);
      const current = node.nodeValue;
      const original = record && current === record.displayed ? record.original : current;
      const translated = translations[language]?.[original.trim()];
      if (!translated) {
        if (record && current !== record.displayed) translatedTextNodes.delete(node);
        return;
      }
      const leading = original.slice(0, original.length - original.trimStart().length);
      const trailing = original.slice(original.trimEnd().length);
      const displayed = `${leading}${translated}${trailing}`;
      translatedTextNodes.set(node, { original, displayed });
      if (current !== displayed) node.nodeValue = displayed;
    };
    const translateAttribute = (element, name) => {
      const current = element.getAttribute(name);
      if (!current) return;
      let records = translatedAttributes.get(element);
      if (!records) {
        records = new Map();
        translatedAttributes.set(element, records);
      }
      const record = records.get(name);
      const original = record && current === record.displayed ? record.original : current;
      const translated = translations[language]?.[original.trim()];
      if (!translated) return;
      const leading = original.slice(0, original.length - original.trimStart().length);
      const trailing = original.slice(original.trimEnd().length);
      const displayed = `${leading}${translated}${trailing}`;
      records.set(name, { original, displayed });
      if (current !== displayed) element.setAttribute(name, displayed);
    };
    const translateTree = (root) => {
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return;
      const element = root.nodeType === Node.ELEMENT_NODE ? root : document.documentElement;
      for (const name of ['aria-label', 'title', 'placeholder', 'alt']) translateAttribute(element, name);
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) translateTextNode(walker.currentNode);
      for (const child of element.querySelectorAll('*')) {
        for (const name of ['aria-label', 'title', 'placeholder', 'alt']) translateAttribute(child, name);
      }
    };
    translateTree(document);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') translateTextNode(record.target);
        else if (record.type === 'attributes') translateAttribute(record.target, record.attributeName);
        else record.addedNodes.forEach(translateTree);
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt']
    });
    return () => observer.disconnect();
  }, [language]);
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (text, variables = {}) => Object.entries(variables).reduce(
      (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
      getTranslation(text, language)
    ),
    languageNames
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider.');
  return context;
}
