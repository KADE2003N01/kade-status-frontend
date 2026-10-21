import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch, resolveApiAssetUrl } from '../../services/api.js';
import PhoneNumberField, { isValidEastAfricanPhone } from '../../components/PhoneNumberField.jsx';
import LanguageSelector from '../../components/LanguageSelector.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import TimedNotification from '../../components/TimedNotification.jsx';
import backgroundImageUrl from '../../assets/background image.jpeg';

const NAV_ITEMS = [
  ['Home', 'index.html', '../index.html'],
  ['About', 'src/about.html', 'about.html'],
  ['Background', 'src/background.html', 'background.html'],
  ['Skills', 'src/skills.html', 'skills.html'],
  ['Hobbies', 'src/hobbies.html', 'hobbies.html'],
  ['Documents', 'src/document.html', 'document.html'],
  ['Contact', 'src/contact.html', 'contact.html']
];

function safeUrl(value, allowContactSchemes = false) {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u0020\\]/.test(value)) return null;
  try {
    const url = new URL(value, window.location.href);
    if (['http:', 'https:'].includes(url.protocol)) return url.href;
    if (allowContactSchemes && ['mailto:', 'tel:'].includes(url.protocol)) return url.href;
  } catch (error) {
    console.error('Invalid portfolio URL:', error);
  }
  return null;
}

function safeAssetUrl(value) {
  const url = safeUrl(resolveApiAssetUrl(value));
  return url && !new URL(url).pathname.includes('/media/') ? url : null;
}

function ExpandableDescription({ children, className = '' }) {
  const descriptionRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const text = typeof children === 'string' ? children.trim() : '';

  useEffect(() => {
    const node = descriptionRef.current;
    if (!node || expanded) return undefined;
    const measure = () => setCanExpand(node.scrollHeight > node.clientHeight + 1);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [expanded, text]);

  if (!text) return null;
  return <div className={`expandable-description-wrap ${className}`}>
    <p ref={descriptionRef} className={`expandable-description${expanded ? ' expanded' : ''}`}>{text}</p>
    {(canExpand || expanded) && <button className="description-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      {expanded ? 'Read less' : 'Read more'} <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} aria-hidden="true"></i>
    </button>}
  </div>;
}

function usePublishedUpdateNotice(enabled = true) {
  const [message, setMessage] = useState('');
  const dismiss = useCallback(() => setMessage(''), []);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    let lastObserved = null;
    const storageKey = 'kade-last-seen-public-update';
    const checkForUpdate = async () => {
      try {
        const response = await apiFetch('/homepage');
        const result = await response.json();
        if (!response.ok || !result.updatedAt || !active) return;
        const updatedAt = String(result.updatedAt);
        let previouslySeen = '';
        try { previouslySeen = window.localStorage.getItem(storageKey) || ''; } catch { /* Storage may be disabled. */ }
        const isRecent = Date.now() - new Date(updatedAt).getTime() <= 10_000;
        if ((lastObserved !== null && lastObserved !== updatedAt) || (lastObserved === null && previouslySeen && previouslySeen !== updatedAt) || (lastObserved === null && !previouslySeen && isRecent)) {
          setMessage('The portfolio has new published changes.');
        }
        lastObserved = updatedAt;
        try { window.localStorage.setItem(storageKey, updatedAt); } catch { /* Notification still works for this page. */ }
      } catch (error) {
        console.error('Could not check for published portfolio changes:', error);
      }
    };

    checkForUpdate();
    const intervalId = window.setInterval(() => {
      if (!document.hidden) checkForUpdate();
    }, 5_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return [message, dismiss];
}

function useProfileImage(homepage = false) {
  const [profileImage, setProfileImage] = useState('');
  useEffect(() => {
    let active = true;
    apiFetch('/homepage')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load the published profile image.');
        const imageUrl = result.content?.brand?.imageUrl;
        const validImageUrl = safeAssetUrl(imageUrl);
        if (active && validImageUrl) setProfileImage(validImageUrl);
      })
      .catch((error) => console.error('Could not load the published profile image:', error));
    return () => { active = false; };
  }, []);
  return [profileImage, () => setProfileImage('')];
}

function ThemeToggle() {
  const { t } = useLanguage();
  const [light, setLight] = useState(() => {
    try {
      return window.localStorage.getItem('theme') !== 'dark';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', !light);
    document.documentElement.classList.toggle('light-theme', light);
    try {
      window.localStorage.setItem('theme', light ? 'light' : 'dark');
    } catch {
      // Theme still works for the current page when storage is unavailable.
    }
  }, [light]);
  return (
    <button className="theme-toggle" id="theme-toggle" aria-label={t('Toggle light/dark mode')} title={t('Toggle light/dark mode')} type="button" onClick={() => setLight((value) => !value)}>
      {light ? '🌙' : '☀️'}
    </button>
  );
}

function Navigation({ homepage = false, homepageContent }) {
  const { t } = useLanguage();
  const [image, clearImage] = useProfileImage(homepage);
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const currentFilename = typeof window === 'undefined' ? '' : window.location.pathname.split('/').pop();
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const closeWhenOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('click', closeWhenOutside);
    return () => document.removeEventListener('click', closeWhenOutside);
  }, []);

  const isInSrc = typeof window !== 'undefined' && window.location.pathname.includes('/src/');
  const homeHref = isInSrc ? '../index.html' : 'index.html';
  const loginHref = isInSrc ? 'admin-login.html' : 'src/admin-login.html';

  const items = homepage && Array.isArray(homepageContent?.navigation)
    ? homepageContent.navigation
    : NAV_ITEMS.map(([label, rootHref, srcHref]) => ({
        label,
        href: isInSrc ? srcHref : rootHref
      }));

  const navLinks = items.map(({ label, href }) => {
    let active = false;
    try {
      const destination = new URL(href, window.location.href);
      const destinationPath = destination.pathname.endsWith('/') ? `${destination.pathname}index.html` : destination.pathname;
      const currentPath = window.location.pathname.endsWith('/') ? `${window.location.pathname}index.html` : window.location.pathname;
      active = destination.origin === window.location.origin && destinationPath === currentPath;
    } catch {
      active = false;
    }
    const link = safeUrl(href, true) || '#';
    const isOffSite = /^https?:\/\//i.test(link) && !link.includes(window.location.host);
    return (
      <li key={`${label}:${href}`}>
        <a className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined} href={link} target={isOffSite ? '_blank' : undefined} rel={isOffSite ? 'noopener noreferrer' : undefined} onClick={closeMenu}>
          {t(label)}
        </a>
      </li>
    );
  });

  return (
    <nav ref={navRef}>
      <a className="nav-logo" href={homeHref} aria-label="David KWIZERA home">
        {image ? (
          <img src={image} alt="Kade" className="nav-avatar" onError={clearImage} />
        ) : (
          <span className="nav-avatar-fallback">K</span>
        )}
      </a>
      <ul className={`nav-links${open ? ' open' : ''}`} onClick={(event) => {
        if (event.target.closest('a')) closeMenu();
      }}>
        {navLinks}
      </ul>
      <div className="nav-actions">
        <a className="nav-login" href={loginHref}>
          <i className="fas fa-lock" aria-hidden="true"></i> {t(homepageContent?.loginLabel || 'Login')}
        </a>
        <LanguageSelector compact />
        <ThemeToggle />
        <button
          className={`hamburger${open ? ' open' : ''}`}
          id="hamburger"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}

function usePublicFooter() {
  const [footerContent, setFooterContent] = useState({ footer: null, adminName: '' });
  useEffect(() => {
    let active = true;
    apiFetch('/homepage')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load published footer content.');
        if (active && result.content) {
          setFooterContent({
            footer: result.content.footer || null,
            adminName: typeof result.content.adminName === 'string' ? result.content.adminName.trim() : ''
          });
        }
      })
      .catch((error) => console.error('Could not load published footer content:', error));
    return () => { active = false; };
  }, []);
  return footerContent;
}

function Footer({ homepage = false, content, adminName: publishedAdminName }) {
  const { t } = useLanguage();
  const defaults = {
    brandName: 'David',
    tagline: 'Building elegant solutions through code',
    description: 'Computer Science student | Frontend Developer | Problem Solver',
    quickLinksTitle: 'Quick Links',
    servicesTitle: 'Services',
    socialTitle: 'Connect With Me',
    quickLinks: [
      ['Home', homepage ? 'index.html' : '../index.html'],
      ['About Me', homepage ? 'src/about.html' : 'about.html'],
      ['Background', homepage ? 'src/background.html' : 'background.html'],
      ['Skills', homepage ? 'src/skills.html' : 'skills.html']
    ],
    services: [
      ['Web Development', homepage ? '/src/skills.html' : 'skills.html'],
      ['UI/UX Design', homepage ? '/src/skills.html' : 'skills.html'],
      ['Consulting', homepage ? '/src/background.html' : 'background.html'],
      ['Contact', homepage ? '/src/contact.html' : 'contact.html']
    ],
    socialLinks: [
      ['GitHub', 'https://github.com/KADE2003N01/kade-status', 'fab fa-github'],
      ['LinkedIn', 'https://www.linkedin.com/feed/', 'fab fa-linkedin'],
      ['WhatsApp', 'https://wa.me/+250788950833', 'fab fa-whatsapp'],
      ['Facebook', 'https://facebook.com/', 'fab fa-facebook']
    ],
    email: 'kadecomputerscience@gmail.com',
    phone: '+250 788 950 833',
    copyright: `© ${new Date().getFullYear()} David KWIZERA. All rights reserved.`,
    builtBy: 'Built by KadeTech',
    contactLabel: 'Contact',
    contactHref: 'tel:+250788950833',
    adminName: 'David KWIZERA'
  };
  const value = content ? {
    ...defaults,
    ...content,
    quickLinks: Array.isArray(content.quickLinks) ? content.quickLinks
      .filter((item) => item && typeof item.label === 'string' && item.label.trim() && typeof item.href === 'string' && item.href.trim())
      .map((item) => [item.label, item.href]) : defaults.quickLinks,
    services: Array.isArray(content.services) ? content.services
      .filter((item) => item && typeof item.label === 'string' && item.label.trim() && typeof item.href === 'string' && item.href.trim())
      .map((item) => [item.label, item.href]) : defaults.services,
    socialLinks: Array.isArray(content.socialLinks) ? content.socialLinks
      .filter((item) => item && typeof item.label === 'string' && item.label.trim() && typeof item.href === 'string' && item.href.trim())
      .map((item) => [item.label, item.href, item.icon]) : defaults.socialLinks
  } : defaults;
  const dynamicLink = (href) => {
    if (typeof href !== 'string' || !safeUrl(href, true)) return '#';
    const target = href.trim();
    if (/^(?:[a-z]+:|\/|#)/i.test(target)) return target;
    if (!homepage) {
      return target.startsWith('src/') ? target.slice(4) : `../${target}`;
    }
    return target;
  };
  const adminName = (typeof content?.adminName === 'string' && content.adminName.trim())
    || (typeof publishedAdminName === 'string' && publishedAdminName.trim() ? publishedAdminName.trim() : '')
    || 'David KWIZERA';
  // Always computed at render time: current year + the name of the admin who signed in last.
  const copyright = `© ${new Date().getFullYear()} ${adminName}. All rights reserved.`;
  const footerEmail = typeof content?.email === 'string' && content.email.includes('@') ? content.email.trim() : 'kadecomputerscience@gmail.com';
  return (
    <footer data-home-section={homepage ? 'footer' : undefined} hidden={value.visible === false}>
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <div className="footer-logo">{value.brandName || adminName.split(/\s+/)[0]}</div>
          <p className="footer-tagline">{value.tagline}</p>
          <p className="footer-description">{value.description}</p>
        </div>
        <div className="footer-section">
          <h4 className="footer-section-title">{t(value.quickLinksTitle)}</h4>
          <ul className="footer-links">{value.quickLinks.map(([label, href]) => <li key={label}><a href={dynamicLink(href)}>{t(label)}</a></li>)}</ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-section-title">{t(value.servicesTitle)}</h4>
          <ul className="footer-links">{value.services.map(([label, href]) => <li key={label}><a href={dynamicLink(href)}>{t(label)}</a></li>)}</ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-section-title">{t(value.socialTitle)}</h4>
          <div className="footer-social">{value.socialLinks.map(([label, href, icon]) => (
            <a key={label} href={dynamicLink(href)} target="_blank" rel="noopener noreferrer" title={label} aria-label={label}>
              <i className={/^[a-z0-9-]+(?:\s+[a-z0-9-]+)*$/i.test(icon || '') ? icon : 'fas fa-circle'} aria-hidden="true"></i>
            </a>
          ))}</div>
          <p className="footer-contact"><i className="fas fa-envelope"></i> {value.email}<br /><i className="fas fa-phone"></i> {value.phone}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">{copyright}</p>
        <p className="footer-built">{value.builtBy} | <a href={dynamicLink(value.contactHref)}>{value.contactLabel}</a> | <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(footerEmail)}`} target="_blank" rel="noopener noreferrer">Email</a></p>
      </div>
    </footer>
  );
}

function Hero({ id, title, subtitle, intro, homepage = false, videoUrl }) {
  const { t } = useLanguage();
  return (
    <section id={id}>
      {videoUrl && <video className="home-video" autoPlay muted loop playsInline><source src={videoUrl} type="video/mp4" /></video>}
      <div className="home-overlay"></div>
      <div className="home-wrapper">
        <div className={`home-content${homepage ? '' : ' section-content'}`}>
          {homepage && <p className="home-kicker"><span></span> {t(title.kicker)}</p>}
          <h1 className="glitch" data-text={t(title.text)} id={homepage ? 'dynamic-title' : undefined}>{t(title.text)}</h1>
          {homepage ? (
            <>
              <p className="subtitle" id="homepage-subtitle">{t(subtitle)}</p>
              <p className="intro" id="homepage-intro">{t(intro)}</p>
            </>
          ) : (
            <>
              <p className="subtitle">{t(subtitle)}</p>
              <p className="intro">{t(intro)}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function InnerPage({ title, subtitle, intro, id, children }) {
  const { t } = useLanguage();
  const { footer, adminName } = usePublicFooter();
  const [notice, dismissNotice] = usePublishedUpdateNotice();
  return (
    <>
      <TimedNotification message={notice} tone="success" onClose={dismissNotice} />
      <Navigation />
      <Hero id={id} title={{ text: t(title) }} subtitle={t(subtitle)} intro={t(intro)} />
      {children}
      <Footer content={footer} adminName={adminName} />
    </>
  );
}

function HomepageFooter({ content }) {
  return <Footer homepage content={content} />;
}

const homepageFallback = {
  site: { title: 'David KWIZERA | Portfolio', description: "Explore David KWIZERA's portfolio, background, skills, projects and professional documents." },
  brand: {
    name: 'KADE', imageUrl: '', loginLabel: 'Login',
    navigation: NAV_ITEMS.map(([label, href]) => ({ label, href }))
  },
  hero: {
    visible: true, kicker: 'DAVID KWIZERA · COMPUTER SCIENCE', title: "I'm a Developer",
    subtitle: 'Computer Science Student | Frontend Developer',
    intro: 'I build responsive, user-friendly web experiences and keep learning how thoughtful software can solve real problems.',
    videoUrl: '', backgroundImageUrl: '',
    buttons: [
      { label: 'Explore my documents', href: 'src/document.html', style: 'primary' },
      { label: 'My background', href: 'src/background.html', style: 'outline' }
    ],
    contactText: 'Have a project or opportunity?', contactHref: 'src/contact.html', contactLabel: "Let's connect"
  },
  introduction: {
    visible: true, eyebrow: 'A LITTLE ABOUT ME', titleFirst: 'Curious by nature.', titleSecond: 'Developer by choice.',
    body: "I'm David KWIZERA, a Computer Science student at the University of Rwanda. I enjoy turning ideas into clear, useful digital experiences and growing my skills through hands-on projects.",
    linkLabel: 'Get to know me', linkHref: 'src/about.html'
  },
  highlights: {
    visible: true, eyebrow: 'WELCOME', title: "Hey there — I'm glad you stopped by 👋",
    message: "Pull up a chair and look around. This space holds my story, the things I'm learning, and the work I'm proud of. Take your time — there's plenty to explore.",
    linkLabel: 'Get to know me', linkHref: 'src/skills.html'
  },
  documents: {
    visible: true, eyebrow: 'DOCUMENTS & RESOURCES', title: 'Need my CV or certificates?',
    description: 'Browse and download the latest documents from the portfolio document center.',
    buttonLabel: 'Visit document center', buttonHref: 'src/document.html'
  },
  footer: {
    visible: true, brandName: 'David', tagline: 'Building elegant solutions through code',
    description: 'Computer Science student | Frontend Developer | Problem Solver',
    quickLinksTitle: 'Quick Links', servicesTitle: 'Services', socialTitle: 'Connect With Me',
    quickLinks: [
      { label: 'Home', href: 'index.html' }, { label: 'About Me', href: 'src/about.html' },
      { label: 'Background', href: 'src/background.html' }, { label: 'Skills', href: 'src/skills.html' }
    ],
    services: [
      { label: 'Web Development', href: '/src/skills.html' }, { label: 'UI/UX Design', href: '/src/skills.html' },
      { label: 'Consulting', href: '/src/background.html' }, { label: 'Contact', href: '/src/contact.html' }
    ],
    socialLinks: [
      { label: 'GitHub', href: 'https://github.com/KADE2003N01/kade-status', icon: 'fab fa-github' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/feed/', icon: 'fab fa-linkedin' },
      { label: 'WhatsApp', href: 'https://wa.me/+250788950833', icon: 'fab fa-whatsapp' },
      { label: 'Facebook', href: 'https://facebook.com/', icon: 'fab fa-facebook' }
    ],
    email: 'kadecomputerscience@gmail.com', phone: '+250 788 950 833',
    copyright: `© ${new Date().getFullYear()} David KWIZERA. All rights reserved.`, builtBy: 'Built by KadeTech',
    contactLabel: 'Contact', contactHref: 'tel:+250788950833',
    adminName: 'David KWIZERA'
  }
};

function Homepage() {
  const [content, setContent] = useState(homepageFallback);
  const isReviewPreview = new URLSearchParams(window.location.search).has('homepagePreview');
  const [notice, dismissNotice] = usePublishedUpdateNotice(!isReviewPreview);
  useEffect(() => {
    if (isReviewPreview) {
      try {
        const draft = localStorage.getItem('kade-homepage-review-draft');
        if (draft) setContent(JSON.parse(draft));
      } catch (error) {
        console.error('Could not load homepage review draft:', error);
      }
      return undefined;
    }
    let active = true;
    apiFetch('/homepage')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load landing-page content.');
        if (active && result.content) setContent(result.content);
      })
      .catch((error) => console.error('Could not load published landing-page content:', error));
    return () => { active = false; };
  }, [isReviewPreview]);
  const c = { ...homepageFallback, ...content };
  useEffect(() => {
    if (c.site?.title) document.title = c.site.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && c.site?.description) meta.content = c.site.description;
  }, [c.site?.title, c.site?.description]);
  const hero = c.hero || homepageFallback.hero;
  const introduction = c.introduction || homepageFallback.introduction;
  const highlights = c.highlights || homepageFallback.highlights;
  const documents = c.documents || homepageFallback.documents;
  const brand = c.brand || homepageFallback.brand;
  const footer = { ...homepageFallback.footer, ...(c.footer || {}), adminName: typeof c.adminName === 'string' && c.adminName.trim() ? c.adminName.trim() : 'David KWIZERA' };
  const videoUrl = safeAssetUrl(hero.videoUrl);
  const heroBackground = safeAssetUrl(hero.backgroundImageUrl) || backgroundImageUrl;
  const validIcon = (icon) => typeof icon === 'string' && /^[a-z0-9-]+(?:\s+[a-z0-9-]+)*$/i.test(icon) ? icon : 'fas fa-circle';
  const linkUrl = (href) => safeUrl(href, true) || '#';
  return (
    <>
      <TimedNotification message={notice} tone="success" onClose={dismissNotice} />
      <Navigation homepage homepageContent={brand} />
      <section id="home" data-home-section="hero" hidden={!hero.visible} style={{ backgroundImage: `url("${heroBackground}")` }}>
        {videoUrl && <video className="home-video" autoPlay muted loop playsInline><source src={videoUrl} type="video/mp4" /></video>}
        <div className="home-overlay"></div>
        <div className="home-wrapper">
          <div className="home-content">
            <p className="home-kicker"><span></span> {hero.kicker}</p>
            <h1 className="glitch" data-text={hero.title} id="dynamic-title">{hero.title}</h1>
            <p className="subtitle" id="homepage-subtitle">{hero.subtitle}</p>
            <p className="intro" id="homepage-intro">{hero.intro}</p>
            <div className="btn-group">{(hero.buttons || []).map((button) => (
              <a key={`${button.label}:${button.href}`} href={linkUrl(button.href)} className={button.style === 'outline' ? 'btn btn-outline' : 'btn'}>
                {button.label === 'Explore my documents' && <i className="fas fa-folder-open" aria-hidden="true"></i>} {button.label}
              </a>
            ))}</div>
            <a className="home-contact-link" href={linkUrl(hero.contactHref)}>{hero.contactText} <span>{hero.contactLabel} <i className="fas fa-arrow-right" aria-hidden="true"></i></span></a>
          </div>
        </div>
      </section>
      <section className="home-intro-section" data-home-section="introduction" hidden={!introduction.visible}>
        <div className="home-intro-copy">
          <p className="home-section-kicker">{introduction.eyebrow}</p>
          <h2 className="section-title">{introduction.titleFirst}<br /><span>{introduction.titleSecond}</span></h2>
        </div>
        <div className="card home-intro-card">
          <p>{introduction.body}</p>
          <a className="text-link" href={linkUrl(introduction.linkHref)}>{introduction.linkLabel} <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
      </section>
      <section id="home-highlights" data-home-section="highlights" hidden={!highlights.visible}>
        <div className="welcome-banner">
          <div className="welcome-banner-glow" aria-hidden="true"></div>
          <p className="home-section-kicker">{highlights.eyebrow}</p>
          <h2 className="welcome-banner-title">{highlights.title}</h2>
          <p className="welcome-banner-copy">{highlights.message}</p>
          <div className="welcome-banner-actions">
            <a className="btn" href={linkUrl(highlights.linkHref)}>{highlights.linkLabel} <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
            <a className="btn btn-outline" href={linkUrl(documents.buttonHref)}>{documents.buttonLabel} <i className="fas fa-folder-open" aria-hidden="true"></i></a>
          </div>
        </div>
      </section>
      <section className="home-documents-cta" data-home-section="documents" hidden={!documents.visible}>
        <div><p className="home-section-kicker">{documents.eyebrow}</p><h2>{documents.title}</h2><p>{documents.description}</p></div>
        <a className="btn" href={linkUrl(documents.buttonHref)}>{documents.buttonLabel} <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
      </section>
      <HomepageFooter content={footer} />
    </>
  );
}

function AboutPage() {
  return <InnerPage title="About Me" id="about" subtitle="Student • Developer • Problem Solver" intro="Discover my journey, passions, and what drives me as a computer science enthusiast.">
    <section>
      <div className="card">
        <p>I am a Computer Science student at the <strong>University of Rwanda</strong> with a strong passion for backend development, artificial intelligence, and mobile applications.</p>
        <p>I enjoy turning complex problems into clean, efficient solutions — whether that's building REST APIs, training ML models, or crafting mobile experiences with Flutter.</p>
        <p>When I'm not coding, I'm exploring new technologies, contributing to open source, or sharpening my problem-solving skills on competitive platforms.</p>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: 16, fontSize: '1.3rem' }}>My Journey</h3>
        <p>I started my programming journey in high school with Java and C++, quickly realizing my passion for solving real-world problems through code. Over the years, I've expanded my skill set to cover full-stack web development, data structures, algorithms, and emerging technologies like AI and machine learning.</p>
        <p>My academic path at University of Rwanda has been instrumental in deepening my understanding of computer science principles. I've worked on various projects ranging from desktop GUI applications using Java Swing to responsive web interfaces with modern frontend frameworks.</p>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: 16, fontSize: '1.3rem' }}>What Drives Me</h3>
        <p><strong>Innovation:</strong> I'm fascinated by emerging technologies and how they can transform industries and improve lives.</p>
        <p><strong>Problem-Solving:</strong> I love tackling challenging problems and finding elegant, efficient solutions.</p>
        <p><strong>Continuous Learning:</strong> Technology is ever-evolving, and I'm committed to staying updated with the latest tools and best practices.</p>
        <p><strong>Collaboration:</strong> I believe in the power of teamwork and contributing to communities that push technology forward.</p>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: 16, fontSize: '1.3rem' }}>Career Vision</h3>
        <p>My goal is to become a full-stack developer capable of architecting scalable systems and mentoring junior developers. I aspire to work on impactful projects that leverage AI and modern web technologies to solve meaningful problems in education, healthcare, and social impact sectors.</p>
      </div>
    </section>
  </InnerPage>;
}

function BackgroundPage() {
  return <InnerPage title="My Background" id="background" subtitle="Education • Experience • Growth" intro="From foundational education to practical experience, here's the journey that shaped me as a developer and problem-solver.">
    <section>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Education &amp; Experience Journey</h3>
        <p>My journey in technology began with curiosity about how things work. From my high school days exploring the fundamentals, to now pursuing a degree in Computer Science, I've constantly sought to deepen my understanding of software development, algorithms, and emerging technologies. Each experience has shaped my problem-solving approach and reinforced my passion for building meaningful applications.</p>
        <p><strong>Below, you'll find my academic milestones and professional experiences that have defined my career path:</strong></p>
      </div>
      <div className="bg-group">
        <h3 className="bg-group-title"><i className="fas fa-graduation-cap"></i> University</h3>
        <div className="timeline"><div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content">
          <span className="timeline-date">2022 – Present</span><h3>BSc Computer Science</h3><p><strong>University of Rwanda</strong></p>
          <p>Pursuing a degree in Computer Science with a strong focus on:</p>
          <ul style={{ margin: '10px 0', paddingLeft: 20 }}><li>Core algorithms and data structures</li><li>Database design and management systems</li><li>Software engineering principles and practices</li><li>Web and mobile application development</li><li>Computer networks and systems</li></ul>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>This foundation is shaping my ability to write efficient, scalable, and maintainable code across various domains.</p>
        </div></div></div>
      </div>
      <div className="bg-group">
        <h3 className="bg-group-title"><i className="fas fa-school"></i> High School</h3>
        <div className="timeline"><div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content">
          <span className="timeline-date">2019 – 2021</span><h3>A-Level Certificate</h3><p><strong>Secondary Education Foundation</strong></p>
          <p>During these formative years, I developed a strong interest in science and technology. This period was crucial in discovering my passion for problem-solving and logical thinking. I was exposed to mathematics, physics, and computer fundamentals that sparked my interest in pursuing Computer Science at the university level.</p>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>This foundation laid the groundwork for my technical journey and helped me understand the importance of continuous learning.</p>
        </div></div></div>
      </div>
      <div className="bg-group">
        <h3 className="bg-group-title"><i className="fas fa-briefcase"></i> Experience</h3>
        <div className="timeline">
          <div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content"><span className="timeline-date">2026 March 29th</span><h3>GDG Hackathon <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>(Ongoing)</span></h3><p>Currently participating in a Google Developer Group (GDG) hackathon — collaborating with a team to build a real-world solution under time pressure. Gaining hands-on experience with modern tools and technologies.</p></div></div>
          <div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content"><span className="timeline-date">2026 January</span><h3>Frontend Development</h3><p>Currently building responsive web interfaces using HTML, CSS, and JavaScript. Worked on <a href="https://gs-kayumbutss2026.netlify.app/" className="timeline-link" target="blank">GS Kayumbu</a> — a real-world web project.</p></div></div>
          <div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content"><span className="timeline-date">2026</span><h3>Java Swing Development</h3><p>Built desktop GUI applications using Java Swing, focusing on clean UI design and event-driven programming.</p></div></div>
          <div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content"><span className="timeline-date">2026</span><h3>Linux Basics <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>(Familiar)</span></h3><p>Familiar with Linux fundamentals — navigating the terminal, managing files and directories, file permissions, process management, and installing packages via apt. Comfortable working in a Linux environment for development tasks.</p></div></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ color: 'var(--accent)', marginTop: 0, fontSize: '1.25rem', fontWeight: 800 }}>✦ Key Learning &amp; Growth Points</h3>
        <div className="grid-responsive" style={{ marginTop: 16 }}>
          <div style={{ padding: '16px 18px', background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '0.98rem', fontWeight: 750 }}>Adaptability</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Learned to quickly adapt to new tools, frameworks, and technologies as the tech landscape evolves.</p>
          </div>
          <div style={{ padding: '16px 18px', background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '0.98rem', fontWeight: 750 }}>Problem-Solving</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Developed a systematic approach to breaking down complex problems into manageable solutions.</p>
          </div>
          <div style={{ padding: '16px 18px', background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '0.98rem', fontWeight: 750 }}>Collaboration</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Gained experience working with teams in hackathons and group projects, improving communication and teamwork.</p>
          </div>
          <div style={{ padding: '16px 18px', background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '0.98rem', fontWeight: 750 }}>Full-Stack Thinking</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Moved from single-technology focus to understanding how frontend, backend, and databases work together.</p>
          </div>
        </div>
      </div>
    </section>
  </InnerPage>;
}

const skillGroups = [
  ['Languages', 'Core programming languages with proficiency levels', [['Python', 60], ['Java', 80], ['JavaScript', 86], ['C++', 70], ['C', 65]]],
  ['Frontend', 'Web interface and user experience technologies', [['HTML', 85], ['CSS', 80], ['JavaScript', 75], ['React', 65]]],
  ['Backend', 'Server-side and database technologies', [['Python', 60], ['Java', 80], ['PostgreSQL', 70], ['MySQL', 75]]],
  ['Core Concepts', 'Fundamental computer science knowledge', [['Data Structures', 80], ['Algorithms', 75], ['Database Design', 70], ['OOP', 85]]],
  ['AI & Productivity Tools', 'Tools that enhance productivity and innovation', [['ChatGPT', 90], ['Google GenAI', 80], ['Canva', 85], ['Amazon Q', 75]]]
];

function SkillsPage() {
  return <InnerPage title="My Skills" id="skills" subtitle="Technical Expertise • Languages • Frameworks" intro="A comprehensive overview of my technical abilities and proficiency levels.">
    <section className="container section-padding">
      <div className="card mb-lg"><h3 className="card-title">Technical Expertise</h3><p>I've cultivated a diverse skill set across multiple domains of software development. My expertise spans programming languages, frameworks, and industry best practices that enable me to build robust, scalable applications from concept to deployment.</p></div>
      <div className="skills-grid">{skillGroups.map(([title, subtitle, skills]) => (
        <div className="skill-card" key={title}><h3>{title}</h3><p className="skill-subtitle">{subtitle}</p><ul className="skill-list">{skills.map(([name, percent]) => (
          <li key={name}><span className="skill-name">{name}</span><div className="xp-bar"><div className="fill" style={{ width: `${percent}%` }}></div></div></li>
        ))}</ul></div>
      ))}</div>
      <div className="card mt-lg"><h3 className="card-title">Proficiency Levels</h3>
        <p><strong>Advanced (75-90%):</strong> Languages and technologies I use regularly in projects and feel confident solving complex problems.</p>
        <p><strong>Intermediate (60-75%):</strong> Skills with solid practical experience that I continue to develop and apply in learning projects.</p>
        <p><strong>Beginner-Intermediate (50-60%):</strong> Emerging skills I'm actively learning and exploring through side projects and coursework.</p>
      </div>
    </section>
  </InnerPage>;
}

const hobbies = [
  ['fas fa-book', 'Reading', 'Exploring ideas through books on technology, philosophy, and personal development'],
  ['fas fa-hands-praying', 'Praying', 'Finding peace and clarity through spiritual practice'],
  ['fas fa-music', 'Singing', 'Expressing creativity and emotion through music'],
  ['fas fa-person-walking', 'Meditation', 'Building mental clarity and emotional resilience'],
  ['fas fa-gamepad', 'Gaming', 'Enjoying strategic thinking and interactive storytelling'],
  ['fas fa-futbol', 'Playing Football', 'Staying active and enjoying team collaboration']
];

function HobbiesPage() {
  return <InnerPage title="My Hobbies" id="hobbies" subtitle="Interests • Passions • Activities" intro="Beyond coding, here's what makes me tick and fuels my creativity.">
    <section className="container section-padding" style={{ maxWidth: 960, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 24 }}><h3 style={{ color: 'var(--accent)', marginBottom: 12, fontSize: '1.25rem', fontWeight: 800 }}>Beyond the Code</h3><p>While I'm passionate about technology and programming, I believe in maintaining a balanced lifestyle. My hobbies help me stay creative, sharp, and connected with the world around me. They've also taught me valuable lessons that I apply to my work as a developer.</p></div>
      <div className="hobbies-grid">{hobbies.map(([icon, label, description]) => <div className="hobby-card" key={label}><i className={icon}></i><span>{label}</span><p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: 8 }}>{description}</p></div>)}</div>
      <div className="card" style={{ marginTop: 24 }}><h3 style={{ color: 'var(--accent)', marginBottom: 12, fontSize: '1.25rem', fontWeight: 800 }}>Why These Matter</h3>
        <p><strong>Reading:</strong> Keeps me updated and inspires new approaches to problem-solving.</p>
        <p><strong>Spirituality &amp; Meditation:</strong> Helps maintain focus and emotional balance during challenging projects.</p>
        <p><strong>Music &amp; Creativity:</strong> Enhances creative thinking which directly impacts my coding approach.</p>
        <p><strong>Sports &amp; Physical Activity:</strong> Maintains health and teaches discipline and teamwork.</p>
      </div>
    </section>
  </InnerPage>;
}

function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ text: '', color: '' });
  const [sending, setSending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: form.message.trim() };
    if (payload.name.length < 2 || payload.name.length > 100 || payload.message.length < 10 || payload.message.length > 3000) {
      setStatus({ text: t('Enter a name (2 to 100 characters) and a message (10 to 3,000 characters).'), error: true });
      return;
    }
    if (!isValidEastAfricanPhone(payload.phone)) {
      setStatus({ text: t('Choose an East African country and enter a valid phone number.'), error: true });
      return;
    }
    setSending(true);
    try {
      const response = await apiFetch('/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setStatus({ text: result.message || t('Your message was delivered.'), error: false });
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus({ text: t(result.error || 'Failed to send. Please try again.'), error: true });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus({ text: t('Connection issue. Please try again later.'), error: true });
    } finally {
      setSending(false);
    }
  };
  return <InnerPage title="Get In Touch" id="contact" subtitle="Contact • Connect • Collaborate" intro="Let's talk! I'm always open to new opportunities and collaborations.">
    <section>
      <div className="card" style={{ marginBottom: 24 }}><h3 style={{ color: 'var(--accent)', marginBottom: 12, fontSize: '1.25rem', fontWeight: 800 }}>{t("Let's Connect")}</h3><p>{t("I'm always open to interesting conversations, collaboration opportunities, and new projects. Whether you have a question, want to discuss technology, or have an exciting opportunity, feel free to reach out.")}</p><p>{t('I typically respond within 24 hours and would love to hear from you!')}</p></div>
      <div className="card contact-card">
        <h3 style={{ color: 'var(--accent)', marginBottom: 16, fontSize: '1.25rem', fontWeight: 800 }}>{t('Send Me a Message')}</h3>
        <p>Have a project, opportunity, or just want to say hi? Feel free to reach out — I'm always open to connecting.</p>
        <form className="contact-form" onSubmit={submit}>
          <label htmlFor="contact-name">{t('Your name')}</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" maxLength="100" placeholder={t('e.g. Jane Doe')} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <label htmlFor="contact-email">{t('Email address')}</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" maxLength="254" placeholder="name@example.com" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <label htmlFor="contact-phone">{t('Phone number')}</label>
          <PhoneNumberField id="contact-phone" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} required describedBy="contact-phone-hint" />
          <small id="contact-phone-hint">{t('Choose your East African country code and enter the number. This phone field does not restrict who can visit the website.')}</small>
          <label htmlFor="contact-message">{t('Message')}</label>
          <textarea id="contact-message" name="message" rows="5" minLength="10" maxLength="3000" placeholder="Describe your question, project, or opportunity..." required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })}></textarea>
          <span className="contact-message-count">{form.message.length}/3000 characters</span>
          <button type="submit" className="btn" disabled={sending}>{sending ? <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> {t('Sending...')}</> : <>{t('Send Message')} <i className="fas fa-paper-plane" aria-hidden="true" /></>}</button>
          <div id="form-status" className={status.error ? 'contact-status error' : 'contact-status'} role="status" aria-live="polite">{status.text}</div>
        </form>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: 16, fontSize: '1.25rem', fontWeight: 800 }}>{t('Connect on Social Media')}</h3><p style={{ marginBottom: 16 }}>{t('Find me on these platforms for more regular updates:')}</p>
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <a href="https://github.com/KADE2003N01/kade-status" target="_blank" rel="noopener noreferrer" style={socialStyle}><i className="fab fa-github"></i> GitHub</a>
          <a href="https://linkedin.com/in/david-kwizera" target="_blank" rel="noopener noreferrer" style={socialStyle}><i className="fab fa-linkedin"></i> LinkedIn</a>
          <a href="https://wa.me/+250788950833" target="_blank" rel="noopener noreferrer" style={socialStyle}><i className="fab fa-whatsapp"></i> WhatsApp</a>
        </div>
      </div>
      <div className="card" style={{ marginTop: 24 }}><h3 style={{ color: 'var(--accent)', marginBottom: 12, fontSize: '1.25rem', fontWeight: 800 }}>{t('Response Time')}</h3><p>📧 <strong>Email:</strong> {t('I check messages regularly and try to respond within 24 hours.')}</p><p>💬 <strong>WhatsApp/Messages:</strong> {t('For urgent matters, WhatsApp is often the quickest way to reach me.')}</p><p>🔗 <strong>LinkedIn:</strong> {t('Connect with me for professional networking and opportunities.')}</p></div>
    </section>
  </InnerPage>;
}

const socialStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--accent)', textDecoration: 'none', padding: '14px 18px', background: 'var(--bg-soft)', borderRadius: 12, border: '1.5px solid var(--border)', fontWeight: 700, fontSize: '0.92rem', transition: 'all 0.2s ease' };

function DocumentActionButtons({ documentId, onPreview, onDownload, primary = false }) {
  return <div className="public-document-actions" style={{ justifyContent: 'flex-start' }}>
    <button className={`doc-card-button ${primary ? 'doc-btn-primary' : 'doc-btn-outline'}`} type="button" onClick={() => onPreview(documentId)}><i className="fas fa-eye" aria-hidden="true"></i>View</button>
    <button className="doc-card-button doc-btn-outline" type="button" onClick={() => onDownload(documentId)}><i className="fas fa-download"></i>Download</button>
  </div>;
}

function DocumentMetadata({ document, dateFormat }) {
  const issuedDate = document.issuedAt
    ? dateFormat(`${document.issuedAt}T00:00:00`, { dateStyle: 'medium' }) || 'Not specified'
    : 'Not specified';
  const uploadDate = document.createdAt || document.updatedAt
    ? dateFormat(document.createdAt || document.updatedAt, { dateStyle: 'medium' }) || 'Not uploaded yet'
    : 'Not uploaded yet';
  const isCv = document.type === 'cv';
  const isFeatured = document.documentId === 'ebc';

  return (
    <div className="public-document-metadata" role="group" aria-label="Document details">
      <span className="public-document-meta-item" data-document-institution={isFeatured ? true : undefined}><i className="fas fa-building" aria-hidden="true" /> Institution: {document.institution || (isFeatured ? 'EBC Organization' : 'Not specified')}</span>
      <span className="public-document-meta-item" data-document-issued={isFeatured ? true : undefined}><i className="fas fa-calendar-alt" aria-hidden="true" /> Issued: {isFeatured && !document.issuedAt ? '2026' : issuedDate}</span>
      <span className="public-document-meta-item" data-cv-uploaded={isCv ? true : undefined}><i className="fas fa-cloud-arrow-up" aria-hidden="true" /> Uploaded: {uploadDate}</span>
      <span className="public-document-meta-item document-filename" data-cv-file-name={isCv ? true : undefined}><i className="fas fa-file" aria-hidden="true" /><span>File: {document.filename || (isCv ? 'CV.pdf' : 'Document.pdf')}</span></span>
    </div>
  );
}

function DownloadModal({ requestedDocumentId, onClose, mode = 'download', onPreviewReady }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [channel, setChannel] = useState('');
  const [authorization, setAuthorization] = useState(null);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState('');
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const codeRef = useRef(null);
  const lastFocused = useRef(null);
  const downloadLink = useRef(null);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const reset = useCallback(() => {
    setName('');
    setEmail('');
    setPhone('');
    setReason('');
    setConsent(false);
    setCode('');
    setChallengeId('');
    setChannel('');
    setAuthorization(null);
    setStatus('');
    setSuccess(false);
    setBusy('');
  }, []);
  const close = useCallback(() => {
    onClose();
    window.setTimeout(() => lastFocused.current?.focus?.(), 0);
  }, [onClose]);
  useEffect(() => {
    if (!requestedDocumentId) return;
    lastFocused.current = document.activeElement;
    reset();
    window.requestAnimationFrame(() => (mode === 'preview' ? emailRef.current : nameRef.current)?.focus());
  }, [requestedDocumentId, reset, mode]);
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && requestedDocumentId) close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [close, requestedDocumentId]);
  const sendCode = async (selectedChannel) => {
    if ((mode !== 'preview' && (name.trim().length < 2 || name.trim().length > 100 || reason.trim().length < 10 || reason.length > 1000)) || !consent) {
      setStatus(mode === 'preview' ? 'Please agree to email verification before requesting a code.' : 'Please complete your name, phone number, reason, and consent before requesting a code.');
      return;
    }
    if (mode !== 'preview' && !isValidEastAfricanPhone(phone)) {
      setStatus('Choose an East African country and enter a valid phone number.');
      return;
    }
    if (!emailValid) {
      setStatus('Enter a valid email address.');
      return;
    }
    setBusy(selectedChannel);
    setSuccess(false);
    try {
      const response = await apiFetch('/downloads/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: requestedDocumentId, purpose: mode, name: name.trim(), email: email.trim(), phone: phone.trim(), reason: reason.trim(), channel: 'email', consent })
      });
      const result = await response.json();
      if (!response.ok) {
        const error = new Error(result.error || 'No verification code was sent. Please check your contact details and try again.');
        error.status = response.status;
        throw error;
      }
      setChallengeId(result.challengeId);
      setChannel('email');
      setCode('');
      setStatus(`A code was sent to ${result.recipientPreview}. Enter the six-digit code from that email below.`);
      window.requestAnimationFrame(() => codeRef.current?.focus());
    } catch (error) {
      console.error(`Could not send the ${selectedChannel} verification code:`, error);
      setStatus(error.message || 'No verification code was sent. Please check your contact details and try again.');
    } finally {
      setBusy('');
    }
  };
  const verifyCode = async () => {
    if (!challengeId || !/^\d{6}$/.test(code)) {
      setStatus('Enter the six-digit verification code.');
      return;
    }
    setBusy('verify');
    setSuccess(false);
    try {
      const response = await apiFetch('/downloads/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code: code.trim() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not verify the code.');
      setAuthorization({ token: result.downloadToken, filename: result.filename, requestId: result.downloadRequestId });
      setSuccess(true);
      setStatus('Your email address is verified. Continue when you’re ready.');
    } catch (error) {
      console.error('Could not verify the download code:', error);
      setStatus(error.message || 'Could not verify the code. Please try again.');
    } finally {
      setBusy('');
    }
  };
  const continueRequest = async () => {
    if (!authorization) return;
    const isPreview = mode === 'preview';
    setBusy(isPreview ? 'preview' : 'download');
    try {
      const response = await apiFetch(isPreview ? '/downloads/preview' : '/downloads/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authorization.token })
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Your download authorization has expired.');
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      if (isPreview) {
        onPreviewReady?.(requestedDocumentId, blobUrl);
        onClose();
        reset();
        return;
      }
      const link = downloadLink.current;
      link.href = blobUrl;
      link.download = authorization.filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      setStatus('Your verified download is starting.');
      setSuccess(true);
      window.setTimeout(() => { onClose(); reset(); }, 1100);
    } catch (error) {
      console.error(isPreview ? 'Could not open the authorized preview:' : 'Could not download the authorized document:', error);
      if (!isPreview && authorization?.token) {
        apiFetch('/downloads/file-failed', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: authorization.token })
        }).catch((reportError) => console.error('Could not record the failed download attempt:', reportError));
      }
      setStatus(error.message || 'Could not open the document. Please try again.');
    } finally {
      setBusy('');
    }
  };
  const codeActionsVisible = !challengeId && Boolean(email.trim());
  return (
    <div id="download-request-modal" className="download-modal" hidden={!requestedDocumentId}>
      <a ref={downloadLink} hidden aria-hidden="true"></a>
      <div className="download-modal-backdrop" data-close-download onClick={close}></div>
      <section className="download-dialog" role="dialog" aria-modal="true" aria-labelledby="download-dialog-title">
        <button className="download-modal-close" type="button" aria-label="Close form" data-close-download onClick={close}>&times;</button>
        <div className="download-dialog-icon"><i className={`fas ${mode === 'preview' ? 'fa-eye' : 'fa-file-arrow-down'}`}></i></div>
        <p className="download-dialog-kicker">{t(mode === 'preview' ? 'SECURE PREVIEW' : 'DOCUMENT REQUEST')}</p>
        <h2 id="download-dialog-title">{t(mode === 'preview' ? 'Secure document preview' : 'Get your document')}</h2>
        <p className="download-dialog-copy">{t(mode === 'preview' ? 'Enter your email and verify it before viewing this document. Preview access is not added to the admin request list.' : 'Enter your contact details and verify your email before downloading this document. Your request is recorded for the administrator.')}</p>
        <form id="download-request-form" className="download-request-form" onSubmit={(event) => { event.preventDefault(); if (authorization) continueRequest(); else if (challengeId) verifyCode(); else sendCode('email'); }}>
          <input type="hidden" id="requested-document-id" value={requestedDocumentId || ''} readOnly />
          <div id="download-request-fields" hidden={Boolean(challengeId)}>
            <label htmlFor="download-name" hidden={mode === 'preview'}>{t('Your name')}</label>
            <input id="download-name" name="name" type="text" autoComplete="name" minLength="2" maxLength="100" required={mode !== 'preview'} disabled={Boolean(challengeId) || mode === 'preview'} hidden={mode === 'preview'} value={name} onChange={(event) => setName(event.target.value)} ref={nameRef} />
            <label htmlFor="download-email">{t('Email address')}</label>
            <input id="download-email" name="email" type="email" autoComplete="email" maxLength="254" required disabled={Boolean(challengeId)} value={email} onChange={(event) => setEmail(event.target.value)} ref={emailRef} />
            <p id="download-contact-hint" className={`download-contact-hint${email.trim() && !emailValid ? ' error' : ''}`} aria-live="polite">{email.trim() && !emailValid ? 'Enter a valid email address.' : 'We’ll send a six-digit verification code to this address.'}</p>
            <label htmlFor="download-phone" hidden={mode === 'preview'}>{t('Phone number')}</label>
            <PhoneNumberField id="download-phone" value={phone} onChange={setPhone} required={mode !== 'preview'} disabled={Boolean(challengeId) || mode === 'preview'} hidden={mode === 'preview'} />
            <label htmlFor="download-reason" hidden={mode === 'preview'}>{t('Why do you need this document?')}</label>
            <textarea id="download-reason" name="reason" rows="2" minLength="10" maxLength="1000" required={mode !== 'preview'} disabled={Boolean(challengeId) || mode === 'preview'} hidden={mode === 'preview'} value={reason} onChange={(event) => setReason(event.target.value)}></textarea>
            <label className="download-consent">
              <input id="download-consent" type="checkbox" required disabled={Boolean(challengeId)} checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>{mode === 'preview' ? 'I agree to use my email address to verify preview access. It will not be added to the admin request list.' : 'I agree to have my contact details and reason saved for this download request.'}</span>
            </label>
          </div>
          <div className="download-code-actions" id="download-code-actions" hidden={!codeActionsVisible}>
            <button className="download-submit" id="send-email-code" type="button" disabled={!emailValid || Boolean(busy)} onClick={() => sendCode('email')}><i className="fas fa-envelope"></i> {t('Send code to this email')}</button>
          </div>
          <div id="download-verification-fields" hidden={!challengeId}>
            <label htmlFor="download-verification-code">Verification code <span id="verification-channel-hint">{channel ? `sent to your ${channel}` : ''}</span></label>
            <input id="download-verification-code" name="verificationCode" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength="6" maxLength="6" required={Boolean(challengeId)} disabled={Boolean(authorization)} value={code} onChange={(event) => setCode(event.target.value)} ref={codeRef} />
            <div className="download-code-actions">
              {!authorization && <button className="download-submit" id="verify-download-code" type="button" disabled={Boolean(busy)} onClick={verifyCode}>{busy === 'verify' ? 'Verifying…' : 'Verify code'}</button>}
              {!authorization && <button className="download-change-email" id="download-resend-code" type="button" disabled={Boolean(busy)} onClick={() => sendCode('email')}>{busy === 'email' ? 'Sending…' : 'Resend code'}</button>}
              {!authorization && <button className="download-change-email" id="download-change-email" type="button" onClick={() => { setChallengeId(''); setCode(''); setAuthorization(null); setStatus('Update your email address, then request another code.'); setSuccess(false); window.requestAnimationFrame(() => emailRef.current?.focus()); }}>Change email address</button>}
            </div>
          </div>
          <p id="download-form-status" className={`download-form-status${success ? ' success' : ''}`} aria-live="polite">{status}</p>
          {authorization && <button className="download-submit download-continue" id="download-submit" type="button" disabled={Boolean(busy)} onClick={continueRequest}>{busy === 'download' ? 'Preparing download…' : busy === 'preview' ? 'Opening preview…' : mode === 'preview' ? <>Open secure preview <i className="fas fa-arrow-right"></i></> : <>Continue to download <i className="fas fa-arrow-right"></i></>}</button>}
        </form>
      </section>
    </div>
  );
}

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [previews, setPreviews] = useState({});
  const [activePreviewDocumentId, setActivePreviewDocumentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestedDocumentId, setRequestedDocumentId] = useState('');
  const [requestMode, setRequestMode] = useState('download');
  const previewUrls = useRef(new Map());
  const openDownload = (documentId) => {
    setRequestMode('download');
    setRequestedDocumentId(documentId);
  };
  const showPreview = (documentId) => {
    setFeedback('');
    setRequestMode('preview');
    setRequestedDocumentId(documentId);
  };
  const openAuthorizedPreview = useCallback((documentId, url) => {
    previewUrls.current.set(documentId, url);
    setPreviews({ [documentId]: `${url}#toolbar=0&navpanes=0` });
    setActivePreviewDocumentId(documentId);
  }, []);
  const closePreview = useCallback(() => {
    const url = previewUrls.current.get(activePreviewDocumentId);
    if (url) URL.revokeObjectURL(url);
    previewUrls.current.delete(activePreviewDocumentId);
    setPreviews({});
    setActivePreviewDocumentId('');
  }, [activePreviewDocumentId]);
  useEffect(() => {
    let active = true;
    apiFetch('/documents')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load document details.');
        if (active) setDocuments(Array.isArray(result.documents) ? result.documents : []);
      })
      .catch((error) => {
        console.error('Could not load public documents:', error);
        if (active) setFeedback('Could not load document details. Please refresh the page or try again later.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  const cvList = documents.filter((item) => item.type === 'cv');
  const cv = cvList[0] || documents.find((item) => item.documentId === 'cv') || null;
  const ebc = documents.find((item) => item.documentId === 'ebc') || null;
  const certificates = documents.filter((item) => item.type === 'certificate');
  useEffect(() => {
    if (!activePreviewDocumentId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activePreviewDocumentId, closePreview]);
  const dateFormat = (date, options) => {
    if (!date) return '';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? '' : new Intl.DateTimeFormat(undefined, options).format(parsed);
  };
  return <>
    <InnerPage title="Documents" id="others" subtitle="CV • Files • Resources" intro="Access my CV, portfolio documents, and other important files.">
      <section className="doc-welcome-section">
        <div className="doc-hero-container"><h1 className="doc-hero-title">Welcome to My <span className="text-accent">Document Center</span></h1><p className="doc-hero-copy">Thank you for your interest in my professional profile. Submit your contact details before previewing or downloading documents.</p></div>
        <div className="doc-card-info">
          <div className="doc-info-header"><div><h2 className="doc-title-main">About These Documents</h2><p className="doc-status-tag">Professional &amp; Up-to-Date</p></div></div>
          <p className="doc-description">My curriculum vitae contains comprehensive information about my educational background, professional experience, technical skills, and notable achievements. All documents are regularly updated and formatted for professional review.</p>
          <div className="doc-feature-grid"><div className="doc-feature-item"><i className="fas fa-shield-alt text-accent"></i><span className="font-bold">Secure Download</span></div><div className="doc-feature-item"><i className="fas fa-clock text-accent"></i><span className="font-bold">Always Current</span></div><div className="doc-feature-item"><i className="fas fa-file-pdf text-accent"></i><span className="font-bold">PDF Format</span></div></div>
        </div>
        <div className="cv-section-heading"><h2><i className="fas fa-book-open" aria-hidden="true"></i> Curriculum vitae</h2><span>Published CVs</span></div>
        <div className="doc-card-cv-section">
          {cvList.length ? cvList.map((cvDoc, index) => (
          <div className="document-file-card public-cv-card" data-cv-card={cvDoc.documentId} key={cvDoc.documentId}>
            <div className="public-cv-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, background: 'var(--accent-soft)', border: '1.5px solid var(--border-strong)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fas fa-book-open" style={{ color: 'var(--accent)', fontSize: '1.75rem' }}></i>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 data-cv-title style={{ color: 'var(--text)', margin: '0 0 12px', fontSize: 'clamp(1rem, 2vw, 1.15rem)', fontWeight: 800, overflowWrap: 'anywhere' }}>{cvDoc.title || 'Curriculum Vitae'}{index === 0 && cvList.length > 1 ? ' (Latest)' : ''}</h4>
                </div>
              </div>
              <ExpandableDescription className="cv-card-description">{cvDoc.description}</ExpandableDescription>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="doc-tag"><i className="fas fa-check-circle"></i>Virus Free</span>
                  <span className="doc-tag"><i className="fas fa-lock"></i>Secure</span>
                  <span className="doc-tag"><i className="fas fa-file-pdf"></i>PDF</span>
                </div>
              </div>
              <div className="public-document-actions">
                <button className="doc-card-button doc-btn-outline" type="button" onClick={() => showPreview(cvDoc.documentId)}><i className="fas fa-eye" aria-hidden="true"></i>View</button>
                <button className="doc-card-button doc-btn-outline" type="button" onClick={() => openDownload(cvDoc.documentId)}><i className="fas fa-download" aria-hidden="true"></i>Download</button>
              </div>
              <DocumentMetadata document={cvDoc} dateFormat={dateFormat} />
            </div>
          </div>
          )) : (
          <div className="document-add-slot cv-add-slot"><span className="document-add-icon"><i className="fas fa-file-circle-xmark" aria-hidden="true"></i></span><h3>No CV added yet</h3><p>The curriculum vitae has not been published yet. It will appear here as soon as a CV is added.</p></div>
          )}
        </div>
        <p id="documents-feedback" className="documents-feedback" role="status" aria-live="polite">{loading ? '' : feedback}</p>
        <div className="mt-lg text-left">
          <div className="text-center mb-lg"><h2 className="doc-title-main" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}><i className="fas fa-certificate text-accent mr-sm"></i> Certificates &amp; Documents</h2>
          </div>
          <div className="grid-responsive document-library-scroll">
            {ebc && (
            <div className="document-file-card public-document-card" data-document-id="ebc" style={{ padding: 26 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                  <div style={{ width: 54, height: 54, background: 'var(--accent-soft)', border: '1.5px solid var(--border-strong)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fas fa-file-alt" style={{ color: 'var(--accent)', fontSize: '1.6rem' }}></i>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 data-document-title style={{ color: 'var(--text)', margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 800, overflowWrap: 'anywhere' }}>{ebc.title}</h4>
                    <p data-document-description style={{ color: 'var(--accent)', fontSize: '0.88rem', margin: 0, fontWeight: 700 }}>{ebc.description}</p>
                  </div>
                </div>
                <ExpandableDescription className="public-ebc-description">{ebc.longDescription || ebc.description}</ExpandableDescription>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="doc-tag"><i className="fas fa-file-pdf"></i>PDF</span>
                    <span className="doc-tag"><i className="fas fa-calendar"></i>{ebc.issuedAt?.slice(0, 4) || '2026'}</span>
                  </div>
                </div>
                <DocumentActionButtons documentId="ebc" onPreview={showPreview} onDownload={openDownload} />
                <DocumentMetadata document={ebc} dateFormat={dateFormat} />
              </div>
            </div>
            )}
            {certificates.map((certificate) => <article className="document-file-card public-document-card" data-certificate-card key={certificate.documentId}>
              <div className="public-certificate-heading"><span className="public-certificate-icon"><i className="fas fa-certificate" aria-hidden="true"></i></span><div className="public-certificate-title"><h3>{certificate.title}</h3><span className="public-certificate-type">Professional certificate</span></div></div>
              <ExpandableDescription className="public-certificate-description">{certificate.description}</ExpandableDescription>
              <div className="public-document-actions"><button className="doc-card-button doc-btn-outline" type="button" onClick={() => showPreview(certificate.documentId)}><i className="fas fa-eye" aria-hidden="true"></i>View</button><button className="doc-card-button doc-btn-outline" type="button" onClick={() => openDownload(certificate.documentId)}><i className="fas fa-download" aria-hidden="true"></i>Download</button></div>
              <DocumentMetadata document={certificate} dateFormat={dateFormat} />
            </article>)}
            {!certificates.length && (
            <div className="document-add-slot certificate-add-slot"><span className="document-add-icon"><i className="fas fa-certificate" aria-hidden="true"></i></span><h3>No certificates added yet</h3><p>Certificates will appear here as soon as they are added.</p></div>
            )}
          </div>
        </div>
      </section>
    </InnerPage>
    {activePreviewDocumentId && <div className="document-viewer-overlay" role="dialog" aria-modal="true" aria-label={`${documents.find((item) => item.documentId === activePreviewDocumentId)?.title || 'Document'} full-screen preview`}>
      <button className="document-viewer-close" type="button" aria-label="Close document and return to its card" onClick={closePreview}><i className="fas fa-xmark" aria-hidden="true" /></button>
      <iframe className="document-viewer-frame" title={`${documents.find((item) => item.documentId === activePreviewDocumentId)?.title || 'Document'} secure preview`} src={previews[activePreviewDocumentId]} onContextMenu={(event) => event.preventDefault()} />
    </div>}
    <DownloadModal requestedDocumentId={requestedDocumentId} onClose={() => setRequestedDocumentId('')} mode={requestMode} onPreviewReady={openAuthorizedPreview} />
  </>;
}

export { Homepage, AboutPage, BackgroundPage, SkillsPage, HobbiesPage, DocumentsPage, ContactPage };
