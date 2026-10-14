import React from 'react';

const styles = `
:root {
  color-scheme: light;
  --bg: #ffffff;
  --bg-soft: #f4f8fe;
  --bg-subtle: #ebf3fd;
  --panel: #ffffff;
  --panel-solid: #ffffff;
  --panel-raised: #f8faff;
  --panel-hover: #f0f6ff;
  --accent: #1d4ed8;
  --accent-strong: #1e40af;
  --accent-light: #3b82f6;
  --accent-soft: #eff6ff;
  --accent-dim: #dbeafe;
  --blue-badge: #e0edff;
  --blue-pill-text: #1d4ed8;
  --text: #091a36;
  --text-muted: #33537e;
  --muted: #33537e;
  --faint: #5d7eab;
  --border: #dbeafe;
  --border-strong: #bfdbfe;
  --border-hover: #93c5fd;
  --card-bg: #ffffff;
  --white: #ffffff;
  --shadow-sm: 0 2px 8px rgba(29, 78, 216, 0.05);
  --shadow: 0 10px 30px -4px rgba(29, 78, 216, 0.08), 0 4px 12px -2px rgba(29, 78, 216, 0.04);
  --shadow-hover: 0 18px 38px -6px rgba(29, 78, 216, 0.16), 0 8px 16px -3px rgba(29, 78, 216, 0.08);
  --shadow-modal: 0 25px 60px -10px rgba(9, 26, 54, 0.25);
  --font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-family: var(--font);
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

html.dark-theme {
  color-scheme: dark;
  --bg: #070e1e;
  --bg-soft: #0c1733;
  --bg-subtle: #122249;
  --panel: #0e1b3a;
  --panel-solid: #0e1b3a;
  --panel-raised: #14254f;
  --panel-hover: #182c5e;
  --accent: #3b82f6;
  --accent-strong: #2563eb;
  --accent-light: #60a5fa;
  --accent-soft: rgba(59, 130, 246, 0.16);
  --accent-dim: rgba(147, 197, 253, 0.22);
  --blue-badge: rgba(59, 130, 246, 0.22);
  --blue-pill-text: #bfdbfe;
  --text: #ffffff;
  --text-muted: #93b5dd;
  --muted: #93b5dd;
  --faint: #6e93bf;
  --border: rgba(147, 197, 253, 0.2);
  --border-strong: rgba(147, 197, 253, 0.35);
  --border-hover: rgba(147, 197, 253, 0.55);
  --card-bg: #0e1b3a;
  --white: #ffffff;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow: 0 14px 40px rgba(0, 8, 28, 0.55);
  --shadow-hover: 0 22px 50px rgba(0, 8, 28, 0.75);
  --shadow-modal: 0 30px 80px rgba(0, 4, 16, 0.88);
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 86px;
  overflow-x: hidden;
}

body {
  min-height: 100vh;
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  line-height: 1.65;
  overflow-x: hidden;
  transition: background 0.25s ease, color 0.25s ease;
}

body, button, input, textarea, select {
  font-family: var(--font);
}

button, input, textarea, select {
  font-size: inherit;
}

button, a {
  -webkit-tap-highlight-color: transparent;
}

button {
  color: inherit;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

img, video {
  max-width: 100%;
  height: auto;
}

img {
  display: block;
}

::selection {
  color: #ffffff;
  background: #1d4ed8;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--bg-soft);
}
::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--accent-light);
}

/* =========================================================
   1. NAVIGATION BAR
   ========================================================= */
nav {
  position: sticky;
  z-index: 50;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 72px;
  padding: 10px clamp(16px, 5vw, 64px);
  border-bottom: 1px solid rgba(16, 105, 38, 0.45);
  background: #15803d;
  color: #ffffff;
  box-shadow: 0 2px 14px rgba(21, 128, 61, 0.35);
  transition: background 0.25s ease;
}

.nav-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 1.12rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-logo:hover .nav-brand-name {
  color: var(--accent);
}

.nav-avatar {
  width: 46px;
  height: 46px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  object-fit: cover;
  background: var(--accent-soft);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s;
}

.nav-avatar-fallback {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #ffffff;
  color: #15803d;
  font-weight: 850;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.nav-brand-name {
  letter-spacing: 0.1em;
  transition: color 0.2s ease;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(8px, 1.8vw, 24px);
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}

.nav-links li {
  margin: 0;
  padding: 0;
}

.nav-links a {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  color: #dbeafe;
  font-size: 0.88rem;
  font-weight: 650;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav-links a::after {
  position: absolute;
  right: 12px;
  bottom: 2px;
  left: 12px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  content: "";
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
}

.nav-links a:hover::after,
.nav-links a.active::after {
  transform: scaleX(1);
}

.nav-links a::after {
  background: #ffffff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-login,
.theme-toggle,
.hamburger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-soft);
  color: var(--accent);
  font-weight: 700;
  transition: all 0.2s ease;
}

.nav-login {
  gap: 8px;
  padding: 0 14px;
  font-size: 0.82rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: none;
}

.nav-login:hover {
  background: #ffffff;
  color: #15803d;
  border-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.theme-toggle,
.hamburger {
  width: 40px;
  padding: 0;
  font-size: 1.05rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.4);
}

.theme-toggle:hover,
.hamburger:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: #ffffff;
}

.hamburger {
  display: none;
}

/* =========================================================
   2. HERO SECTIONS & PUBLIC BANNERS
   ========================================================= */
#home, #about, #background, #skills, #hobbies, #contact, #others {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: min(560px, 72vh);
  overflow: hidden;
  place-items: center;
  padding: clamp(60px, 10vh, 100px) clamp(18px, 6vw, 80px);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background:
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12), transparent 45%),
    radial-gradient(circle at 15% 85%, rgba(29, 78, 216, 0.08), transparent 40%),
    linear-gradient(180deg, var(--bg-soft) 0%, var(--bg) 100%);
  border-bottom: 1px solid var(--border);
}

/* Hero background image (set inline on #home) */
#home[style*="background-image"] {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 18%, transparent), color-mix(in srgb, var(--bg) 45%, transparent)),
    var(--hero-bg, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

html.dark-theme #home,
html.dark-theme #about,
html.dark-theme #background,
html.dark-theme #skills,
html.dark-theme #hobbies,
html.dark-theme #contact,
html.dark-theme #others {
  background:
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.25), transparent 45%),
    radial-gradient(circle at 15% 85%, rgba(29, 78, 216, 0.3), transparent 40%),
    linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
}

#home::before, #about::before, #background::before, #skills::before, #hobbies::before, #contact::before, #others::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.045) 1px, transparent 1px);
  background-size: 44px 44px;
  content: "";
  mask-image: linear-gradient(to bottom, #000 60%, transparent 100%);
}

html.dark-theme #home::before,
html.dark-theme #about::before,
html.dark-theme #background::before,
html.dark-theme #skills::before,
html.dark-theme #hobbies::before,
html.dark-theme #contact::before,
html.dark-theme #others::before {
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.07) 1px, transparent 1px);
}

.home-video {
  position: absolute;
  z-index: -2;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.15;
}

.home-overlay {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 30%, transparent), color-mix(in srgb, var(--bg) 60%, transparent));
}

.home-wrapper {
  width: min(1120px, 100%);
  min-width: 0;
}

.home-content {
  max-width: 780px;
  min-width: 0;
  animation: rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.section-content {
  max-width: 780px;
  text-align: center;
  margin-inline: auto;
}

.home-kicker,
.home-section-kicker,
.admin-eyebrow,
.auth-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 4px 12px;
  border-radius: 99px;
  background: var(--accent-soft);
  border: 1px solid var(--border-strong);
  color: var(--accent);
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.home-kicker span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-light);
}

.glitch {
  max-width: 100%;
  margin: 0;
  font-size: clamp(2.3rem, 6vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
  overflow-wrap: anywhere;
  text-wrap: balance;
  color: var(--text);
  background: linear-gradient(135deg, var(--text) 40%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  margin: 18px 0 10px;
  color: var(--accent);
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  font-weight: 700;
}

.intro {
  max-width: 680px;
  margin: 0;
  color: var(--muted);
  font-size: clamp(0.96rem, 1.5vw, 1.1rem);
  line-height: 1.8;
}

.section-content .intro {
  margin-inline: auto;
}

/* Buttons */
.btn-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}

.btn,
.small-action,
.admin-button.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  padding: 11px 22px;
  border: 1px solid var(--accent-strong);
  border-radius: 11px;
  color: #ffffff !important;
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  font-size: 0.88rem;
  font-weight: 750;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(29, 78, 216, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  cursor: pointer;
}

.btn:hover,
.small-action:hover,
.admin-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(29, 78, 216, 0.32);
  filter: brightness(1.06);
}

.btn-outline {
  color: var(--accent) !important;
  background: var(--panel);
  border: 1.5px solid var(--accent);
  box-shadow: var(--shadow-sm);
}

.btn-outline:hover {
  background: var(--accent-soft);
  color: var(--accent-strong) !important;
  border-color: var(--accent-strong);
}

.home-contact-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 26px;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.88rem;
}

.home-contact-link span {
  color: var(--accent);
  font-weight: 750;
}

.home-contact-link i {
  color: var(--accent);
  transition: transform 0.2s;
}

.home-contact-link:hover i {
  transform: translateX(4px);
}

/* Sections Container */
#root > section:not(#home):not(#about):not(#background):not(#skills):not(#hobbies):not(#contact):not(#others):not(.doc-welcome-section) {
  width: min(1120px, calc(100% - 36px));
  margin: 0 auto;
}

.home-intro-section {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  align-items: center;
  gap: clamp(24px, 5vw, 64px);
  padding-block: clamp(50px, 8vw, 90px);
}

.home-intro-copy .section-title,
.home-highlights-heading .section-title {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.9rem, 4vw, 3.2rem);
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.home-intro-copy .section-title span {
  color: var(--accent);
}

.home-intro-card {
  padding: clamp(22px, 3.5vw, 36px);
}

.home-intro-card p {
  margin-top: 0;
  color: var(--muted);
  font-size: 1.02rem;
  line-height: 1.75;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 750;
  transition: gap 0.2s ease, color 0.2s ease;
}

.text-link:hover {
  color: var(--accent-strong);
  gap: 12px;
}

#home-highlights {
  padding-block: 20px clamp(50px, 8vw, 84px);
}

.welcome-banner {
  position: relative;
  overflow: hidden;
  width: min(1120px, calc(100% - 36px));
  margin: 0 auto;
  padding: clamp(30px, 5vw, 56px);
  border: 1px solid var(--border);
  border-radius: 24px;
  background:
    radial-gradient(900px 300px at 85% -40%, var(--accent-soft), transparent 70%),
    linear-gradient(180deg, var(--accent-dim), transparent 55%),
    var(--panel);
  box-shadow: var(--shadow);
  text-align: center;
}

.welcome-banner-glow {
  position: absolute;
  inset: -60% 30% auto;
  height: 260px;
  background: radial-gradient(closest-side, var(--accent-soft), transparent);
  opacity: 0.8;
  pointer-events: none;
}

.welcome-banner .home-section-kicker {
  position: relative;
  justify-content: center;
  margin-bottom: 10px;
}

.welcome-banner-title {
  position: relative;
  margin: 0 0 14px;
  font-size: clamp(1.7rem, 4.2vw, 2.6rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--text);
}

.welcome-banner-copy {
  position: relative;
  max-width: 640px;
  margin: 0 auto 22px;
  font-size: clamp(1rem, 2vw, 1.12rem);
  line-height: 1.75;
  color: var(--muted);
}

.welcome-banner-actions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.home-highlights-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.home-highlights-heading .home-section-kicker {
  margin-bottom: 8px;
}

.home-documents-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  margin-block: 0 clamp(50px, 8vw, 84px) !important;
  padding: clamp(24px, 5vw, 48px);
  border: 1px solid var(--border-strong);
  border-radius: 22px;
  background: linear-gradient(135deg, var(--panel), var(--bg-subtle));
  box-shadow: var(--shadow);
}

.home-documents-cta h2 {
  margin: 0 0 8px;
  color: var(--text);
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  letter-spacing: -0.035em;
}

.home-documents-cta p:not(.home-section-kicker) {
  margin: 0;
  color: var(--muted);
  font-size: 0.98rem;
}

/* =========================================================
   3. CARDS, GRIDS & INNER PAGES
   ========================================================= */
.container,
.section-padding {
  padding-block: 54px;
}

.section-padding {
  padding-inline: 0;
}

.card,
.skill-card,
.hobby-card,
.document-file-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--panel);
  box-shadow: var(--shadow);
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.card {
  padding: clamp(20px, 3.2vw, 32px);
}

.card p,
.document-file-card p {
  color: var(--muted);
  line-height: 1.75;
}

.card p:last-child {
  margin-bottom: 0;
}

.card-title {
  margin: 0 0 12px;
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 20px;
}

.grid-responsive > .card {
  min-height: 190px;
}

.grid-responsive > .card:hover,
.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-hover);
}

.home-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 750;
}

.home-card-title i {
  color: var(--accent);
  font-size: 1.15rem;
}

.mt-lg {
  margin-top: 32px;
}

.mb-lg {
  margin-bottom: 24px;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-accent {
  color: var(--accent);
}

.mr-sm {
  margin-right: 8px;
}

.section-title {
  letter-spacing: -0.035em;
  color: var(--text);
}

/* Timeline (Background page) */
.bg-group {
  margin-top: 36px;
}

.bg-group-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 1.25rem;
  font-weight: 800;
}

.timeline {
  position: relative;
  border-left: 2px solid var(--border-strong);
  margin-left: 12px;
  padding-left: 28px;
}

.timeline-item {
  position: relative;
  padding-bottom: 22px;
}

.timeline-dot {
  position: absolute;
  top: 6px;
  left: -36px;
  width: 14px;
  height: 14px;
  border: 3px solid var(--accent);
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 0 0 5px var(--accent-soft);
}

.timeline-content {
  padding: 22px 26px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--panel);
  box-shadow: var(--shadow-sm);
}

.timeline-content h3 {
  margin: 6px 0;
  color: var(--text);
  font-size: 1.15rem;
}

.timeline-content p,
.timeline-content li {
  color: var(--muted);
  font-size: 0.94rem;
}

.timeline-date {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.timeline-link {
  color: var(--accent);
  font-weight: 700;
  text-decoration: underline;
}

/* Skills Page */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
  gap: 20px;
}

.skill-card {
  padding: 26px;
}

.skill-card h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.15rem;
  font-weight: 800;
}

.skill-subtitle {
  margin: 6px 0 20px;
  color: var(--muted);
  font-size: 0.85rem;
}

.skill-list {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-list li {
  display: grid;
  grid-template-columns: minmax(110px, 0.65fr) 1fr;
  align-items: center;
  gap: 14px;
}

.skill-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
}

.xp-bar {
  height: 9px;
  overflow: hidden;
  border-radius: 99px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
}

.xp-bar .fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-light), var(--accent));
  animation: grow-bar 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Hobbies Page */
.hobbies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 18px;
}

.hobby-card {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
}

.hobby-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
}

.hobby-card > i {
  display: grid;
  width: 46px;
  height: 46px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--border);
  font-size: 1.2rem;
}

.hobby-card > span {
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 800;
}

.hobby-card p {
  margin-bottom: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

/* =========================================================
   4. CONTACT FORM & SOCIALS
   ========================================================= */
.contact-card {
  max-width: 780px;
  margin-inline: auto;
}

.contact-form {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.contact-form input,
.contact-form textarea,
.download-request-form input:not([type="hidden"]),
.download-request-form textarea {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 11px;
  outline: none;
  color: var(--text);
  background: var(--bg-soft);
  font: inherit;
  font-size: 0.92rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.contact-form textarea,
.download-request-form textarea {
  min-height: 120px;
  resize: vertical;
}

.contact-form input:focus,
.contact-form textarea:focus,
.download-request-form input:focus,
.download-request-form textarea:focus {
  border-color: var(--accent);
  background: var(--panel);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.contact-form button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.footer-social {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-social a {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
  background: var(--bg-soft);
  text-decoration: none;
  font-size: 1.05rem;
  transition: all 0.2s ease;
}

.footer-social a:hover {
  color: #ffffff;
  border-color: var(--accent);
  background: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
}

/* =========================================================
   5. SITE FOOTER
   ========================================================= */
footer:not(.admin-footer) {
  margin-top: 60px;
  border-top: 1px solid rgba(29, 78, 216, 0.5);
  background: #1d4ed8;
  color: #ffffff;
}

footer:not(.admin-footer) .footer-logo,
footer:not(.admin-footer) .footer-section-title,
footer:not(.admin-footer) .footer-tagline,
footer:not(.admin-footer) .footer-description,
footer:not(.admin-footer) .footer-contact,
footer:not(.admin-footer) .footer-links a {
  color: #ffffff;
}

footer:not(.admin-footer) .footer-links a::before {
  color: #bfdbfe;
}

footer:not(.admin-footer) .footer-links a:hover {
  color: #bfdbfe;
}

footer:not(.admin-footer) .footer-social a {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
}

footer:not(.admin-footer) .footer-social a:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: #ffffff;
}

footer:not(.admin-footer) .footer-contact i {
  color: #bfdbfe;
}

footer:not(.admin-footer) .footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  color: #dbeafe;
}

footer:not(.admin-footer) .footer-built a {
  color: #bfdbfe;
}

.footer-container {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.3fr;
  gap: clamp(24px, 4vw, 40px);
  width: min(1120px, calc(100% - 36px));
  margin: auto;
  padding: clamp(40px, 6vw, 64px) 0 40px;
}

.footer-logo {
  margin-bottom: 12px;
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.footer-tagline {
  margin: 0 0 6px;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.95rem;
}

.footer-description,
.footer-contact {
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.8;
}

.footer-section-title {
  margin: 0 0 16px;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.footer-links {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 600;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-links a::before {
  content: "→";
  margin-right: 8px;
  color: var(--accent);
}

.footer-links a:hover {
  color: var(--accent);
  transform: translateX(3px);
}

.footer-contact {
  margin-bottom: 0;
  overflow-wrap: anywhere;
}

.footer-contact i {
  margin-right: 8px;
  color: var(--accent);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  width: min(1120px, calc(100% - 36px));
  margin: auto;
  padding: 20px 0 28px;
  border-top: 1px solid var(--border);
  color: var(--faint);
  font-size: 0.78rem;
}

.footer-bottom p {
  margin: 0;
}

.footer-built a {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
}

.footer-built a:hover {
  text-decoration: underline;
}

/* =========================================================
   6. DOCUMENT CENTER & DOWNLOAD DIALOG
   ========================================================= */
.doc-welcome-section {
  padding-block: 40px 20px;
  width: min(1120px, calc(100% - 36px));
  margin: 0 auto;
}

.doc-hero-container {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 36px;
}

.doc-hero-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 850;
  letter-spacing: -0.04em;
  margin: 0 0 10px;
  color: var(--text);
}

.doc-hero-copy {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

.doc-card-info {
  padding: clamp(20px, 3.5vw, 32px);
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--panel);
  box-shadow: var(--shadow);
  margin-bottom: 30px;
}

.doc-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.doc-title-main {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
}

.doc-title-main i {
  color: var(--accent);
}

.doc-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 4px 12px;
  border-radius: 99px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--border-strong);
  font-size: 0.78rem;
  font-weight: 750;
}

.doc-description {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.75;
  margin: 0 0 18px;
}

.doc-feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.doc-feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 0.88rem;
}

.doc-feature-item i {
  color: var(--accent);
  font-size: 1.1rem;
}

.doc-card-cv-section {
  padding: clamp(22px, 4vw, 36px);
  border: 1.5px solid var(--border-strong);
  border-radius: 20px;
  background: var(--panel);
  box-shadow: var(--shadow);
  margin-bottom: 30px;
}

.doc-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.74rem;
  font-weight: 750;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--border);
}

.doc-tag i {
  color: var(--accent);
}

.document-file-card {
  position: relative;
  padding: 26px;
}

.document-file-card h3,
.document-file-card h4 {
  color: var(--text);
  margin: 0;
}

.public-certificate-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.public-certificate-heading h3 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 800;
}

.public-certificate-icon,
.document-add-icon,
.download-dialog-icon,
.section-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 14px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--border);
}

.public-certificate-icon,
.document-add-icon {
  width: 48px;
  height: 48px;
  font-size: 1.25rem;
}

.public-certificate-type,
.public-certificate-meta {
  color: var(--muted);
  font-size: 0.82rem;
}

.public-certificate-description {
  min-height: 3em;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.7;
}

.public-document-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0;
}

.doc-card-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 9px 16px;
  border: 1.5px solid var(--border-strong);
  border-radius: 10px;
  color: var(--accent);
  background: var(--bg-soft);
  font-size: 0.82rem;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.doc-card-button:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  transform: translateY(-1px);
}

.doc-card-button:active {
  transform: translateY(0);
}

.doc-card-button.doc-btn-outline:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.doc-btn-primary {
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  color: #ffffff !important;
  border-color: var(--accent-strong);
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
}

.doc-btn-primary:hover {
  filter: brightness(1.06);
  color: #ffffff !important;
  transform: translateY(-2px);
}

.doc-btn-outline {
  color: var(--accent);
  border-color: var(--border-strong);
}

.public-certificate-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.document-add-slot {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: 26px;
  border: 2px dashed var(--border-strong);
  border-radius: 18px;
  background: var(--bg-soft);
}

.document-add-slot h3,
.document-add-slot p {
  margin: 0;
}

.document-add-slot h3 {
  color: var(--text);
  font-size: 1.05rem;
}

.document-add-slot p {
  color: var(--muted);
  font-size: 0.86rem;
}

.cv-add-slot {
  margin-bottom: 24px;
}

.documents-feedback {
  min-height: 1.3em;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
}

.document-preview-panel {
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  background: var(--bg-soft);
}

.document-preview-heading {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-subtle);
}

.document-preview-heading h3 {
  margin: 0;
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 750;
}

.document-preview-frame {
  display: block;
  width: 100%;
  height: min(70vh, 750px);
  min-height: 340px;
  border: 0;
  background: var(--panel);
}

/* Larger full-document preview on wide screens */
@media (min-width: 1200px) {
  .document-preview-panel {
    margin-top: 24px;
    border-radius: 16px;
    box-shadow: var(--shadow);
  }

  .document-preview-frame {
    height: calc(100vh - 260px);
    max-height: 1100px;
    min-height: 560px;
  }
}

@media (min-width: 1500px) {
  .document-preview-frame {
    height: calc(100vh - 220px);
  }
}

/* Full-screen preview: panel fills the viewport when opened full screen */
.document-preview-panel:fullscreen,
.document-preview-panel:-webkit-full-screen {
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.document-preview-panel:fullscreen .document-preview-frame,
.document-preview-panel:-webkit-full-screen .document-preview-frame {
  flex: 1;
  height: 100%;
  max-height: none;
  min-height: 0;
}

.document-preview-panel:fullscreen .document-preview-heading,
.document-preview-panel:-webkit-full-screen .document-preview-heading {
  border-bottom: 1px solid var(--border);
  padding: 14px 20px;
}

.doc-card-button.doc-btn-primary {
  border-color: var(--accent-strong);
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
}

.doc-card-button.doc-btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  border-color: var(--accent-strong);
  color: #ffffff;
  filter: brightness(1.08);
  box-shadow: 0 8px 20px rgba(29, 78, 216, 0.3);
  transform: translateY(-2px);
}

.doc-card-button.doc-btn-primary:focus-visible {
  outline: 2px solid var(--accent-light);
  outline-offset: 2px;
}

/* Modal Dialog */
.download-modal[hidden] {
  display: none;
}

.download-modal {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 16px;
}

.download-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(9, 26, 54, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.download-dialog {
  position: relative;
  z-index: 1;
  width: min(100%, 490px);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: clamp(22px, 5vw, 34px);
  border: 1px solid var(--border-strong);
  border-radius: 22px;
  background: var(--panel-solid);
  box-shadow: var(--shadow-modal);
  animation: rise-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.download-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--muted);
  background: var(--bg-soft);
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s;
}

.download-modal-close:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.download-dialog-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  font-size: 1.25rem;
}

.download-dialog-kicker {
  margin: 0;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.15em;
}

.download-dialog h2 {
  margin: 4px 0 8px;
  color: var(--text);
  font-size: 1.6rem;
  letter-spacing: -0.04em;
}

.download-dialog-copy {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.65;
}

.download-request-form,
.download-request-form > div:not(.download-code-actions) {
  display: grid;
  gap: 10px;
}

.download-request-form > div[hidden],
.download-request-form [hidden] {
  display: none !important;
}

.download-request-form label:not(.download-consent) {
  margin-top: 4px;
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 750;
}

.download-request-form label span {
  color: var(--faint);
  font-weight: 450;
}

.download-contact-hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.76rem;
}

.download-contact-hint.error,
.form-feedback.error,
.documents-feedback.error {
  color: var(--accent);
  font-weight: 600;
}

.download-consent {
  display: grid;
  grid-template-columns: 18px 1fr;
  align-items: start;
  gap: 10px;
  margin: 6px 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.download-consent input {
  margin: 3px 0 0;
  accent-color: var(--accent);
}

.download-code-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.download-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--accent-strong);
  border-radius: 10px;
  color: #ffffff;
  background: var(--accent);
  font-size: 0.82rem;
  font-weight: 750;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
  transition: all 0.2s;
}

.download-submit:hover {
  background: var(--accent-strong);
  box-shadow: 0 6px 16px rgba(29, 78, 216, 0.3);
}

.download-submit.secondary {
  border-color: var(--border-strong);
  color: var(--accent);
  background: var(--accent-soft);
  box-shadow: none;
}

.download-submit.secondary:hover {
  background: var(--border-strong);
}

.download-submit:disabled {
  cursor: wait;
  opacity: 0.55;
}

.download-code-actions > .download-submit {
  width: 100%;
}

.download-change-email {
  justify-self: start;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  background: transparent;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}

.download-change-email:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.download-form-status {
  min-height: 18px;
  margin: 4px 0;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
}

.download-form-status.success {
  color: var(--accent-strong);
}

.download-continue {
  width: 100%;
}

/* =========================================================
   7. ADMIN WORKSPACE (White & Blue)
   ========================================================= */
.admin-page {
  min-height: 100vh;
  color: var(--text);
  background: var(--bg);
}

.admin-topbar {
  position: sticky;
  z-index: 40;
  top: 0;
  display: flex;
  height: 70px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 clamp(16px, 4vw, 54px);
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Brand group: profile image sits top-left, next to the Kade brand */
.admin-brand-group {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.admin-brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--text);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.admin-brand-sub {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0;
}

.admin-topbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.prototype-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 99px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.prototype-pill > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-light);
}

.admin-view-site {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 700;
  transition: color 0.2s;
}

.admin-view-site:hover {
  color: var(--accent);
}

.admin-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 28px;
  width: min(1440px, 100%);
  min-height: calc(100vh - 70px);
  margin: auto;
  padding: 24px clamp(16px, 3vw, 40px) 32px;
}

.admin-sidebar {
  position: sticky;
  top: 92px;
  display: flex;
  height: calc(100vh - 120px);
  min-height: 560px;
  flex-direction: column;
  align-items: stretch;
  padding: 18px 12px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.admin-nav-label {
  margin: 6px 12px 10px;
  color: var(--faint);
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  margin: 2px 0;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 650;
  transition: all 0.2s;
}

.admin-nav-link i {
  width: 18px;
  color: var(--faint);
  text-align: center;
  transition: color 0.2s;
}

.admin-nav-link:hover,
.admin-nav-link.active {
  border-color: var(--border-strong);
  color: var(--accent);
  background: var(--accent-soft);
}

.admin-nav-link.active i,
.admin-nav-link:hover i {
  color: var(--accent);
}

.nav-count {
  display: grid;
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  place-items: center;
  border-radius: 99px;
  color: var(--accent);
  background: var(--border);
  font-size: 0.7rem;
  font-weight: 750;
}

.admin-sidebar-note {
  display: flex;
  gap: 10px;
  margin: 20px 2px auto;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 0.82rem;
}

.admin-sidebar-note p {
  margin: 0;
  color: var(--muted);
  font-size: 0.74rem;
  line-height: 1.5;
}

.admin-account {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 14px 6px 0;
  border-top: 1px solid var(--border);
}

.admin-account-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  font-size: 0.78rem;
  font-weight: 850;
}

.admin-account-details {
  display: grid;
  min-width: 0;
}

.admin-account-details strong {
  overflow: hidden;
  color: var(--text);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-account-details small {
  overflow: hidden;
  color: var(--faint);
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-logout {
  min-height: 40px;
  margin-top: 10px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--accent);
  background: var(--bg-soft);
  font-size: 0.78rem;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.2s;
}

/* Pin the logout button to the bottom-left corner of the sidebar */
.admin-sidebar-spacer {
  flex: 1;
}

/* Top-right avatar in the admin topbar */
.admin-avatar-link {
  display: inline-flex;
  flex-shrink: 0;
}

.admin-avatar-img,
.admin-avatar-topbar {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-strong);
  border-radius: 50%;
  object-fit: cover;
}

.admin-avatar-topbar {
  display: grid;
  place-items: center;
  color: #ffffff;
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  font-size: 0.78rem;
  font-weight: 850;
}

.admin-avatar-link:hover .admin-avatar-img,
.admin-avatar-link:hover .admin-avatar-topbar {
  border-color: var(--accent);
}

/* Profile image shown in the sidebar account row */
.admin-account-img {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-strong);
}

.admin-profile-upload-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 750;
  text-decoration: none;
}

.admin-profile-upload-link:hover {
  text-decoration: underline;
}

/* Profile page (admin-profile.html) — same card look as the other panels */
.profile-page-list {
  display: grid;
  gap: 10px;
  margin: 0;
  max-width: 560px;
}

.profile-page-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
}

.profile-page-list dt {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.profile-page-list dd {
  margin: 0;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 650;
  text-align: right;
}

.profile-page-list .admin-profile-session-ok {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #16a34a;
  font-size: 0.8rem;
}

@media (max-width: 520px) {
  .profile-page-list > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .profile-page-list dd {
    text-align: left;
  }
}

/* Overview quick-manage list */
.overview-document-list {
  display: grid;
  gap: 10px;
}

.overview-document-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
}

.overview-document-row .file-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 1.05rem;
}

.overview-document-info {
  display: grid;
  min-width: 0;
  flex: 1;
}

.overview-document-info strong {
  overflow: hidden;
  color: var(--text);
  font-size: 0.86rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-document-info span {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Social link URL rows in the landing-page editor */
.social-links-editor {
  display: grid;
  gap: 8px;
}

.social-link-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 8px;
}

.social-link-row input {
  min-height: 38px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-strong);
  border-radius: 10px;
  background: var(--panel);
  color: var(--text);
  font-size: 0.82rem;
}

.social-link-row input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.profile-image-url-form {
  margin-top: 8px;
}

.profile-image-url-form input {
  flex: 1;
  min-width: 200px;
  min-height: 38px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-strong);
  border-radius: 10px;
  background: var(--panel);
  color: var(--text);
  font-size: 0.8rem;
}

.profile-image-url-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* Logout pinned to the bottom-left of the sidebar with a red warning hover */
.admin-logout {
  position: relative;
}

.admin-logout::after {
  content: 'End your admin session';
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  z-index: 20;
  padding: 5px 10px;
  border-radius: 8px;
  color: #ffffff;
  background: #b91c1c;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 0.18s, transform 0.18s;
}

.admin-logout:hover::after,
.admin-logout:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.admin-logout:hover {
  color: #ffffff;
  border-color: #dc2626;
  background: #dc2626;
}

.admin-theme-toggle {
  position: static;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  min-height: 38px;
  font-size: 1rem;
  border-radius: 10px;
}

.admin-profile-card {
  margin-top: 10px;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
}

.admin-profile-title {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.admin-profile-list {
  display: grid;
  gap: 7px;
  margin: 0;
}

.admin-profile-list div {
  display: grid;
  gap: 1px;
}

.admin-profile-list dt {
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-profile-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 650;
}

.admin-profile-session-ok {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #15803d;
  font-weight: 700;
}

html.dark-theme .admin-profile-session-ok {
  color: #4ade80;
}

.admin-content {
  min-width: 0;
  padding: 8px 0;
}

.admin-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin: 8px 0 24px;
}

.admin-eyebrow {
  margin-bottom: 6px;
  font-size: 0.68rem;
}

.admin-heading h1 {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  letter-spacing: -0.04em;
  line-height: 1.2;
}

.admin-heading h1 span {
  color: var(--accent);
}

.admin-subheading {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.admin-date {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 0.78rem;
}

.admin-date i {
  margin-right: 6px;
  color: var(--accent);
}

.prototype-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
  padding: 14px 18px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 0.84rem;
}

.prototype-alert p {
  margin: 0;
  color: var(--muted);
}

.prototype-alert strong {
  color: var(--text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.stat-card {
  position: relative;
  display: grid;
  grid-template-columns: 46px 1fr;
  align-items: center;
  gap: 14px;
  min-height: 110px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.stat-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--border);
  font-size: 1.1rem;
}

.stat-icon.blue,
.stat-icon.violet,
.stat-icon.green {
  color: var(--accent);
  background: var(--accent-soft);
}

.stat-card p {
  margin: 0 0 2px;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 600;
}

.stat-card strong {
  color: var(--text);
  font-size: 1.4rem;
  letter-spacing: -0.03em;
}

.stat-caption {
  grid-column: 2;
  color: var(--faint);
  font-size: 0.68rem;
}

.admin-panel {
  min-width: 0;
  padding: clamp(18px, 3vw, 28px);
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.panel-heading h2 {
  margin: 0;
  color: var(--text);
  font-size: 1.22rem;
  letter-spacing: -0.025em;
}

.panel-heading .admin-eyebrow {
  margin-bottom: 4px;
}

.panel-description {
  max-width: 900px;
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.7;
}

.section-icon {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.overview-links {
  margin-top: 20px;
}

.overview-link-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-soft);
  text-decoration: none;
  transition: all 0.2s;
}

.overview-link-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: var(--shadow-sm);
}

.overview-link-card > span:nth-child(2) {
  display: grid;
  min-width: 0;
}

.overview-link-card strong {
  color: var(--text);
  font-size: 0.84rem;
}

.overview-link-card small {
  color: var(--muted);
  font-size: 0.72rem;
  line-height: 1.5;
}

.overview-link-card > i:last-child {
  margin-left: auto;
  color: var(--accent);
  font-size: 0.8rem;
}

.admin-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 28px;
  padding: 16px 2px;
  color: var(--faint);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
}

.admin-footer span:first-child {
  color: var(--muted);
  font-weight: 850;
}

/* Admin Tables, Forms & Uploads */
.download-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--faint);
  background: var(--bg-soft);
}

.search-box input {
  width: min(260px, 25vw);
  border: 0;
  outline: 0;
  color: var(--text);
  background: transparent;
  font-size: 0.8rem;
}

.downloads-updated {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin: 10px 0;
  color: var(--faint);
  font-size: 0.74rem;
}

.downloads-updated span {
  margin-left: auto;
}

.form-feedback {
  min-height: 1.3em;
  margin: 8px 0;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.download-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.download-table th {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-soft);
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.download-table td {
  max-width: 240px;
  padding: 14px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.8rem;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.download-table td strong {
  display: block;
  color: var(--text);
  font-size: 0.84rem;
}

.download-table td small {
  display: block;
  margin-top: 4px;
  color: var(--faint);
}

.download-table button {
  padding: 6px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.download-table button:hover {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.empty-state {
  padding: 48px 20px;
  text-align: center;
}

.empty-icon {
  display: inline-grid;
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  place-items: center;
  border-radius: 16px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 1.3rem;
}

.empty-state h3 {
  margin: 0 0 6px;
  color: var(--text);
  font-size: 1.05rem;
}

.empty-state p {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 0.84rem;
}

.admin-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  background: var(--bg-soft);
  font-size: 0.78rem;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-button:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.admin-button.quiet {
  color: var(--muted);
}

.admin-button.danger {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fef2f2;
}

.admin-button.danger:hover {
  color: #ffffff;
  border-color: #dc2626;
  background: #dc2626;
}

html.dark-theme .admin-button.danger {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.35);
  background: rgba(248, 113, 113, 0.12);
}

html.dark-theme .admin-button.danger:hover {
  color: #ffffff;
  border-color: #ef4444;
  background: #ef4444;
}

.certificate-admin-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.certificate-admin-item small {
  display: block;
  color: var(--faint);
  font-size: 0.72rem;
  font-weight: 600;
}

.admin-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.admin-form {
  display: grid;
  gap: 12px;
}

.admin-form label:not(.upload-dropzone) {
  margin-top: 6px;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 750;
}

.admin-form label span {
  color: var(--faint);
  font-weight: 450;
}

.admin-form input:not([type="file"]):not([type="checkbox"]):not([type="hidden"]),
.admin-form textarea,
.homepage-editor-field textarea,
.auth-form input {
  width: 100%;
  min-height: 42px;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  outline: none;
  color: var(--text);
  background: var(--bg-soft);
  font: inherit;
  font-size: 0.84rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.admin-form textarea,
.homepage-editor-field textarea {
  min-height: 96px;
  resize: vertical;
}

.admin-form input:focus,
.admin-form textarea:focus,
.homepage-editor-field textarea:focus,
.auth-form input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
  background: var(--panel);
}

.admin-form input[type="file"] {
  width: 100%;
  color: var(--muted);
  font-size: 0.78rem;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.profile-image-upload {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 20px;
  margin: 20px 0 25px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-soft);
}

.profile-image-preview {
  display: grid;
  width: 100px;
  height: 100px;
  overflow: hidden;
  place-items: center;
  border: 2px solid var(--border-strong);
  border-radius: 16px;
  background: var(--panel);
}

.profile-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-preview:empty::before {
  color: var(--accent-light);
  font-family: "Font Awesome 6 Free";
  font-size: 1.8rem;
  font-weight: 900;
  content: "\\f2bd";
}

.profile-image-upload h3 {
  margin: 0 0 4px;
  color: var(--text);
  font-size: 1rem;
}

.profile-image-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.homepage-editor-fields {
  display: grid;
  gap: 16px;
}

.homepage-editor-section {
  min-width: 0;
  margin: 0;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.homepage-editor-section legend {
  padding: 0 10px;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 800;
}

.homepage-editor-field {
  display: grid;
  gap: 7px;
  margin-top: 10px;
}

.homepage-editor-field label {
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 700;
}

.homepage-editor-field small {
  color: var(--faint);
  font-size: 0.72rem;
}

.homepage-editor-toggle {
  display: flex;
  align-items: center;
}

.homepage-editor-toggle label {
  display: flex;
  align-items: center;
  gap: 9px;
}

.homepage-editor-toggle input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.current-file-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 18px 0 22px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
}

.file-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--border);
  font-size: 1.15rem;
}

.file-info {
  display: grid;
  min-width: 0;
}

.file-info strong {
  overflow: hidden;
  color: var(--text);
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info span {
  color: var(--muted);
  font-size: 0.72rem;
}

.file-status {
  margin-left: auto;
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 750;
  white-space: nowrap;
}

.upload-form {
  max-width: 760px;
}

/* The visible "Browse …" label triggers these; keep the raw widget out of sight */
#cv-file-input,
#certificate-file-input {
  display: none;
}

.browse-button {
  justify-content: flex-start;
  width: fit-content;
  max-width: 100%;
}

.browse-button i {
  color: var(--accent);
}

.upload-dropzone {
  display: grid;
  min-height: 110px;
  place-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 20px;
  border: 2px dashed var(--border-strong);
  border-radius: 14px;
  color: var(--accent);
  background: var(--accent-soft);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-dropzone:hover {
  border-color: var(--accent);
  background: var(--bg-subtle);
}

.upload-dropzone strong {
  color: var(--text);
  font-size: 0.82rem;
}

.upload-dropzone span {
  color: var(--muted);
  font-size: 0.72rem;
}

.certificate-admin-section {
  margin-top: 40px;
  padding-top: 26px;
  border-top: 1px solid var(--border);
}

.certificate-admin-list {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.certificate-admin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
}

.certificate-admin-card h3 {
  margin: 0;
  color: var(--text);
  font-size: 0.88rem;
}

.certificate-admin-card p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.74rem;
}

.certificate-admin-actions {
  display: flex;
  gap: 8px;
}

.certificate-admin-actions button {
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  background: var(--panel);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.certificate-admin-actions button:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* =========================================================
   8. ADMINISTRATOR AUTH / SIGN-IN
   ========================================================= */
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 15%, rgba(59, 130, 246, 0.12), transparent 45%),
    var(--bg);
}

.auth-layout {
  display: grid;
  min-height: 100vh;
  align-content: center;
  justify-items: center;
  padding: 32px 18px;
}

.auth-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
  width: min(440px, 100%);
  margin: 0 auto 18px;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 650;
  transition: color 0.2s;
}

.auth-back-link:hover {
  color: var(--accent);
}

.auth-card {
  width: min(440px, 100%);
  padding: clamp(26px, 6vw, 42px);
  border: 1px solid var(--border-strong);
  border-radius: 22px;
  background: var(--panel-solid);
  box-shadow: var(--shadow-modal);
}

.auth-heading {
  text-align: center;
}

.auth-icon {
  display: grid;
  width: 54px;
  height: 54px;
  margin: 0 auto 16px;
  place-items: center;
  border-radius: 16px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--border);
  font-size: 1.35rem;
}

.auth-heading h1 {
  margin: 0;
  color: var(--text);
  font-size: 1.85rem;
  letter-spacing: -0.04em;
}

.auth-heading > p:last-child {
  margin: 8px 0 24px;
  color: var(--muted);
  font-size: 0.86rem;
}

.auth-form {
  display: grid;
  gap: 11px;
}

.auth-form label {
  margin-top: 4px;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 750;
}

.auth-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-wrap > i {
  position: absolute;
  left: 14px;
  z-index: 1;
  color: var(--faint);
  font-size: 0.88rem;
}

.auth-form input {
  padding-left: 40px;
}

.auth-input-wrap > button {
  position: absolute;
  right: 6px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-input-wrap > button:hover {
  color: var(--accent);
  background: var(--accent-soft);
}

.auth-feedback {
  min-height: 18px;
  margin: 4px 0;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
}

.auth-submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  margin-top: 6px;
  padding: 0 18px;
  border: 1px solid var(--accent-strong);
  border-radius: 11px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  font-size: 0.86rem;
  font-weight: 750;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.25);
  transition: all 0.2s;
}

.auth-submit:hover {
  filter: brightness(1.06);
  box-shadow: 0 6px 18px rgba(29, 78, 216, 0.35);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: wait;
}

.auth-footnote {
  margin: 20px 0 0;
  color: var(--faint);
  text-align: center;
  font-size: 0.72rem;
}

.auth-footnote i {
  margin-right: 6px;
  color: var(--accent);
}

.auth-footer {
  margin: 22px 0 0;
  color: var(--faint);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
}

.auth-pending .admin-shell {
  visibility: hidden;
}

/* =========================================================
   9. KEYFRAMES & RESPONSIVE BREAKPOINTS
   ========================================================= */
@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes grow-bar {
  from {
    width: 0;
  }
}

/* Tablet & Smaller Laptops (<= 1040px) */
@media (max-width: 1040px) {
  nav {
    gap: 14px;
    padding-inline: 20px;
  }
  .nav-links {
    gap: 12px;
  }
  .nav-links a {
    padding: 7px 8px;
    font-size: 0.82rem;
  }
  .admin-shell {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 20px;
    padding-inline: 18px;
  }
  .footer-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Mobile & Tablet Portrait (<= 768px) */
@media (max-width: 768px) {
  html {
    scroll-padding-top: 74px;
  }
  nav {
    min-height: 68px;
    padding-inline: 16px;
  }
  .nav-links {
    position: absolute;
    top: calc(100% + 8px);
    right: 14px;
    left: 14px;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    margin: 0;
    padding: 12px;
    border: 1px solid var(--border-strong);
    border-radius: 16px;
    background: var(--panel-solid);
    box-shadow: var(--shadow-modal);
  }
  .nav-links.open {
    display: flex;
    animation: rise-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .nav-links a {
    display: flex;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 0.92rem;
  }
  .nav-links a::after {
    display: none;
  }
  .nav-links a:hover,
  .nav-links a.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .hamburger {
    display: inline-flex;
  }
  .nav-login {
    min-height: 38px;
    padding-inline: 11px;
    font-size: 0.78rem;
  }
  .nav-avatar {
    width: 40px;
    height: 40px;
  }
  .nav-avatar-fallback {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  #home, #about, #background, #skills, #hobbies, #contact, #others {
    min-height: 480px;
    padding: 60px 18px;
  }
  .home-intro-section {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-block: 54px;
  }
  #home-highlights {
    padding-block: 20px 54px;
  }
  .welcome-banner {
    width: min(100% - 28px, 1120px);
    padding: 26px 18px;
    border-radius: 20px;
  }
  .welcome-banner-actions .btn {
    width: 100%;
    justify-content: center;
  }
  .home-highlights-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .home-documents-cta {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 54px !important;
  }
  .admin-shell {
    display: block;
    padding: 16px;
  }
  .admin-sidebar {
    position: static;
    display: grid;
    height: auto;
    min-height: 0;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 6px;
    margin-bottom: 22px;
    padding: 8px;
  }
  .admin-nav-label,
  .admin-sidebar-note,
  .admin-account {
    display: none;
  }
  .admin-nav-link {
    justify-content: center;
    flex-direction: column;
    min-height: 48px;
    gap: 4px;
    margin: 0;
    padding: 6px;
    font-size: 0.68rem;
    text-align: center;
  }
  .admin-nav-link i {
    width: auto;
    font-size: 0.95rem;
  }
  .admin-nav-link .nav-count {
    display: none;
  }
  .admin-logout {
    grid-column: 1 / -1;
    min-height: 36px;
    margin-top: 6px;
  }
  .admin-logout::after {
    left: 50%;
    bottom: calc(100% + 6px);
    transform: translate(-50%, 4px);
  }
  .admin-logout:hover::after,
  .admin-logout:focus-visible::after {
    transform: translate(-50%, 0);
  }
  .admin-topbar {
    height: 64px;
    padding-inline: 16px;
  }
  .admin-topbar-actions {
    gap: 8px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .stat-card {
    min-height: 84px;
  }
  .overview-link-grid {
    grid-template-columns: 1fr;
  }
  .admin-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
  .download-tools {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }
  .search-box input {
    width: 100%;
  }
  .download-table {
    min-width: 680px;
  }
}

/* Small Smartphone Screen (<= 520px) */
@media (max-width: 520px) {
  .welcome-banner {
    width: min(100% - 24px, 1120px);
    padding: 24px 14px;
    border-radius: 16px;
  }
  .welcome-banner-title {
    font-size: clamp(1.4rem, 7vw, 1.9rem);
  }
  .welcome-banner-copy {
    font-size: 0.98rem;
  }
  .glitch {
    font-size: clamp(2rem, 9.5vw, 2.9rem);
  }
  .btn-group {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .btn-group .btn {
    width: 100%;
  }
  .grid-responsive,
  .skills-grid,
  .hobbies-grid {
    grid-template-columns: 1fr;
  }
  .skill-list li {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .footer-container {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-block: 36px 26px;
  }
  .footer-bottom {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
  #root > section:not(#home):not(#about):not(#background):not(#skills):not(#hobbies):not(#contact):not(#others):not(.doc-welcome-section) {
    width: min(100% - 28px, 1120px);
  }
  .doc-welcome-section {
    width: min(100% - 28px, 1120px);
  }
  .timeline {
    margin-left: 6px;
    padding-left: 20px;
  }
  .timeline-dot {
    left: -28px;
    width: 12px;
    height: 12px;
  }
  .timeline-content {
    padding: 16px;
  }
  .download-dialog {
    padding: 22px 16px;
  }
  .download-code-actions {
    grid-template-columns: 1fr;
  }
  .download-submit {
    width: 100%;
  }
  .profile-image-upload {
    grid-template-columns: 1fr;
  }
  .profile-image-preview {
    width: 86px;
    height: 86px;
  }
  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .admin-panel {
    padding: 16px;
  }
  .certificate-admin-card {
    align-items: flex-start;
    flex-direction: column;
  }
  .auth-card {
    padding: 24px 18px;
  }
}

/* Reduced Motion Preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default function GlobalStyles() {
  return <style data-react-global-styles>{styles}</style>;
}
