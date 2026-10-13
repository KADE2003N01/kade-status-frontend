document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/homepage`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load landing-page content.');
        renderHomepage(result.content);
    } catch (error) {
        console.error('Could not load published landing-page content:', error);
    }
});

function safeHomepageUrl(value, allowContactSchemes = false) {
    if (typeof value !== 'string' || !value.trim() || /[\u0000-\u0020\\]/.test(value)) return null;
    try {
        const url = new URL(value, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol)) return url.href;
        if (allowContactSchemes && ['mailto:', 'tel:'].includes(url.protocol)) return url.href;
    } catch (error) {
        console.error('Invalid landing-page URL:', error);
    }
    return null;
}

function setHomepageText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

function setHomepageLink(element, label, href, className, iconClass) {
    element.replaceChildren();
    element.className = className;
    element.href = safeHomepageUrl(href, true) || '#';
    element.textContent = label;
    if (iconClass) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.setAttribute('aria-hidden', 'true');
        element.append(' ', icon);
    }
    if (/^https?:\/\//i.test(element.href)) {
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
    } else {
        element.removeAttribute('target');
        element.removeAttribute('rel');
    }
}

function renderLinkList(container, items, className) {
    container.replaceChildren();
    for (const item of items) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        setHomepageLink(link, item.label, item.href, '', '');
        listItem.append(link);
        container.append(listItem);
    }
    container.className = className;
}

function validIconClass(value) {
    return typeof value === 'string' && /^[a-z0-9-]+(?:\s+[a-z0-9-]+)*$/i.test(value)
        ? value
        : 'fas fa-circle';
}

function renderHomepage(content) {
    document.title = content.site.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = content.site.description;

    const logo = document.querySelector('.nav-logo .nav-avatar');
    const brand = document.querySelector('.nav-brand-name');
    if (logo) {
        const imageUrl = safeHomepageUrl(content.brand.imageUrl);
        logo.hidden = !imageUrl;
        if (imageUrl) logo.src = imageUrl;
    }
    if (brand) brand.textContent = content.brand.name;
    const login = document.querySelector('.nav-login');
    if (login) login.lastChild.textContent = ` ${content.brand.loginLabel}`;

    const navLinks = document.querySelector('.nav-links');
    navLinks.replaceChildren();
    for (const item of content.brand.navigation) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        setHomepageLink(link, item.label, item.href, '', '');
        listItem.append(link);
        navLinks.append(listItem);
    }
    const currentFile = window.location.pathname.split('/').pop();
    navLinks.querySelectorAll('a').forEach((link) => {
        if (new URL(link.href).pathname.split('/').pop() === currentFile) link.classList.add('active');
    });

    const hero = document.getElementById('home');
    hero.hidden = !content.hero.visible;
    setHomepageText('.home-kicker', content.hero.kicker);
    const title = document.getElementById('dynamic-title');
    title.textContent = content.hero.title;
    title.dataset.text = content.hero.title;
    setHomepageText('#homepage-subtitle', content.hero.subtitle);
    setHomepageText('#homepage-intro', content.hero.intro);
    const video = document.querySelector('.home-video');
    const source = video.querySelector('source');
    const videoUrl = safeHomepageUrl(content.hero.videoUrl);
    if (videoUrl) {
        source.src = videoUrl;
        video.hidden = false;
        video.load();
    } else {
        source.removeAttribute('src');
        video.hidden = true;
    }
    const backgroundUrl = safeHomepageUrl(content.hero.backgroundImageUrl);
    hero.style.backgroundImage = backgroundUrl ? `url("${backgroundUrl}")` : '';
    const heroButtons = document.querySelector('.home-content .btn-group');
    heroButtons.replaceChildren();
    for (const button of content.hero.buttons) {
        const link = document.createElement('a');
        const style = button.style === 'outline' ? 'btn btn-outline' : 'btn';
        setHomepageLink(link, button.label, button.href, style, '');
        heroButtons.append(link);
    }
    const contactLink = document.querySelector('.home-contact-link');
    contactLink.replaceChildren(document.createTextNode(`${content.hero.contactText} `));
    const contactLabel = document.createElement('span');
    contactLink.href = safeHomepageUrl(content.hero.contactHref, true) || '#';
    contactLabel.textContent = content.hero.contactLabel;
    const contactIcon = document.createElement('i');
    contactIcon.className = 'fas fa-arrow-right';
    contactIcon.setAttribute('aria-hidden', 'true');
    contactLabel.append(' ', contactIcon);
    contactLink.append(contactLabel);

    const intro = document.querySelector('.home-intro-section');
    intro.hidden = !content.introduction.visible;
    setHomepageText('.home-intro-copy .home-section-kicker', content.introduction.eyebrow);
    const introTitle = document.querySelector('.home-intro-copy .section-title');
    introTitle.replaceChildren(
        document.createTextNode(content.introduction.titleFirst),
        document.createElement('br')
    );
    const secondTitle = document.createElement('span');
    secondTitle.textContent = content.introduction.titleSecond;
    introTitle.append(secondTitle);
    setHomepageText('.home-intro-card > p', content.introduction.body);
    setHomepageLink(
        document.querySelector('.home-intro-card .text-link'),
        content.introduction.linkLabel,
        content.introduction.linkHref,
        'text-link',
        'fas fa-arrow-right'
    );

    const highlights = document.getElementById('home-highlights');
    highlights.hidden = !content.highlights.visible;
    setHomepageText('.home-highlights-heading .home-section-kicker', content.highlights.eyebrow);
    setHomepageText('.home-highlights-heading .section-title', content.highlights.title);
    setHomepageLink(
        document.querySelector('.home-highlights-heading .text-link'),
        content.highlights.linkLabel,
        content.highlights.linkHref,
        'text-link',
        'fas fa-arrow-right'
    );
    const cards = highlights.querySelector('.grid-responsive');
    cards.replaceChildren();
    for (const item of content.highlights.cards) {
        const card = document.createElement('article');
        card.className = 'card';
        const heading = document.createElement('h3');
        heading.className = 'home-card-title';
        const icon = document.createElement('i');
        icon.className = validIconClass(item.icon);
        icon.setAttribute('aria-hidden', 'true');
        heading.append(icon, document.createTextNode(` ${item.title}`));
        const description = document.createElement('p');
        description.textContent = item.description;
        card.append(heading, description);
        cards.append(card);
    }

    const documents = document.querySelector('.home-documents-cta');
    documents.hidden = !content.documents.visible;
    setHomepageText('.home-documents-cta .home-section-kicker', content.documents.eyebrow);
    setHomepageText('.home-documents-cta h2', content.documents.title);
    setHomepageText('.home-documents-cta p:not(.home-section-kicker)', content.documents.description);
    setHomepageLink(
        document.querySelector('.home-documents-cta .btn'),
        content.documents.buttonLabel,
        content.documents.buttonHref,
        'btn',
        'fas fa-arrow-right'
    );

    const footer = document.querySelector('body > footer');
    footer.hidden = !content.footer.visible;
    setHomepageText('.footer-brand .footer-logo', content.footer.brandName);
    setHomepageText('.footer-brand .footer-tagline', content.footer.tagline);
    setHomepageText('.footer-brand .footer-description', content.footer.description);
    const footerSections = footer.querySelectorAll('.footer-section');
    setHomepageText('.footer-section:nth-child(2) .footer-section-title', content.footer.quickLinksTitle);
    setHomepageText('.footer-section:nth-child(3) .footer-section-title', content.footer.servicesTitle);
    setHomepageText('.footer-section:nth-child(4) .footer-section-title', content.footer.socialTitle);
    renderLinkList(footerSections[1].querySelector('.footer-links'), content.footer.quickLinks, 'footer-links');
    renderLinkList(footerSections[2].querySelector('.footer-links'), content.footer.services, 'footer-links');
    const socialLinks = footer.querySelector('.footer-social');
    socialLinks.replaceChildren();
    for (const item of content.footer.socialLinks) {
        const link = document.createElement('a');
        setHomepageLink(link, '', item.href, '', '');
        link.title = item.label;
        link.setAttribute('aria-label', item.label);
        const icon = document.createElement('i');
        icon.className = validIconClass(item.icon);
        icon.setAttribute('aria-hidden', 'true');
        link.append(icon);
        socialLinks.append(link);
    }
    const contact = footer.querySelector('.footer-contact');
    contact.replaceChildren();
    const emailIcon = document.createElement('i');
    emailIcon.className = 'fas fa-envelope';
    emailIcon.setAttribute('aria-hidden', 'true');
    contact.append(emailIcon, document.createTextNode(` ${content.footer.email}`));
    contact.append(document.createElement('br'));
    const phoneIcon = document.createElement('i');
    phoneIcon.className = 'fas fa-phone';
    phoneIcon.setAttribute('aria-hidden', 'true');
    contact.append(phoneIcon, document.createTextNode(` ${content.footer.phone}`));
    setHomepageText('.footer-copy', content.footer.copyright);
    const built = footer.querySelector('.footer-built');
    built.replaceChildren(document.createTextNode(`${content.footer.builtBy} | `));
    const footerContactLink = document.createElement('a');
    setHomepageLink(footerContactLink, content.footer.contactLabel, content.footer.contactHref, '', '');
    built.append(footerContactLink, document.createTextNode(' | '));
    const sourceLink = document.createElement('a');
    setHomepageLink(sourceLink, content.footer.sourceCodeLabel, content.footer.sourceCodeHref, '', '');
    built.append(sourceLink);
}
