import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  AboutPage,
  BackgroundPage,
  ContactPage,
  DocumentsPage,
  HobbiesPage,
  Homepage,
  SkillsPage
} from './PublicPages.jsx';
import {
  AdminDocumentsPage,
  AdminDownloadsPage,
  AdminHomepagePage,
  AdminLoginPage,
  AdminOverviewPage,
  AdminProfilePage
} from './AdminPages.jsx';
import { API_BASE_URL } from './api.js';
import GlobalStyles from './GlobalStyles.jsx';

const publicPages = {
  'index.html': [Homepage, ''],
  'about.html': [AboutPage, ''],
  'background.html': [BackgroundPage, ''],
  'skills.html': [SkillsPage, ''],
  'hobbies.html': [HobbiesPage, ''],
  'document.html': [DocumentsPage, ''],
  'contact.html': [ContactPage, '']
};
const adminPages = {
  'admin-login.html': [AdminLoginPage, 'auth-page'],
  'admin.html': [AdminOverviewPage, 'admin-page auth-pending'],
  'admin-downloads.html': [AdminDownloadsPage, 'admin-page auth-pending'],
  'admin-homepage.html': [AdminHomepagePage, 'admin-page auth-pending'],
  'admin-documents.html': [AdminDocumentsPage, 'admin-page auth-pending'],
  'admin-profile.html': [AdminProfilePage, 'admin-page auth-pending']
};
const fileName = window.location.pathname.split('/').pop() || 'index.html';
const [Page, bodyClassName] = publicPages[fileName] || adminPages[fileName] || publicPages['index.html'];
window.PORTFOLIO_API_BASE_URL = API_BASE_URL;
document.body.className = bodyClassName;
document.title = document.querySelector('title')?.textContent || 'David KWIZERA | Portfolio';

createRoot(document.getElementById('root')).render(
  <>
    <GlobalStyles />
    <Page />
  </>
);
