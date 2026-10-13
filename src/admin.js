document.addEventListener('DOMContentLoaded', async () => {
    try {
        const sessionResponse = await fetch(`${window.PORTFOLIO_API_BASE_URL}/auth/me`, { credentials: 'include' });
        if (sessionResponse.status === 401) {
            window.location.replace('admin-login.html');
            return;
        }
        if (!sessionResponse.ok) throw new Error('The admin session could not be verified.');
        const session = await sessionResponse.json();
        const displayName = session.user.displayName;
        const displayNameHeading = document.getElementById('admin-display-name');
        if (displayNameHeading) displayNameHeading.textContent = displayName;
        document.getElementById('admin-brand-name').textContent = displayName;
        document.getElementById('admin-account-name').textContent = displayName;
        document.getElementById('admin-account-email').textContent = session.user.email;
        document.body.classList.remove('auth-pending');
    } catch (error) {
        console.error('Could not verify the admin session:', error);
        window.location.replace('admin-login.html?session=unavailable');
        return;
    }

    const data = window.PortfolioPrototype;
    const form = document.getElementById('homepage-form');
    const search = document.getElementById('download-search');
    const uploadForm = document.getElementById('cv-upload-form');
    const fileInput = document.getElementById('cv-file-input');
    const certificateForm = document.getElementById('certificate-form');
    const certificateFileInput = document.getElementById('certificate-file-input');
    let managedDocuments = [];

    const todayDate = document.getElementById('today-date');
    if (todayDate) {
        todayDate.textContent = new Intl.DateTimeFormat(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        }).format(new Date());
    }

    function showFeedback(element, message, isError) {
        element.textContent = message;
        element.classList.toggle('error', Boolean(isError));
    }

    function loadHomepageForm() {
        if (!form) return;
        const content = data.getContent();
        form.elements.title.value = content.title;
        form.elements.subtitle.value = content.subtitle;
        form.elements.intro.value = content.intro;
    }

    async function renderDownloads() {
        const feedback = document.getElementById('downloads-feedback');
        if (feedback) feedback.textContent = '';
        const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads`, { credentials: 'include' });
        if (response.status === 401) {
            window.location.replace('admin-login.html');
            return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load download requests.');

        const downloads = result.downloads;
        const query = search ? search.value.trim().toLowerCase() : '';
        const filtered = downloads.filter((item) =>
            `${item.name} ${item.email || ''} ${item.phone || ''} ${item.document}`.toLowerCase().includes(query)
        );
        const rows = document.getElementById('download-rows');
        if (rows) rows.replaceChildren();
        const totalDownloads = document.getElementById('total-downloads');
        if (totalDownloads) totalDownloads.textContent = downloads.filter((item) => item.downloadedAt).length;
        const newDownloads = document.getElementById('new-downloads');
        if (newDownloads) newDownloads.textContent = downloads.filter((item) => !item.downloadedAt).length;
        const navDownloadCount = document.getElementById('nav-download-count');
        if (navDownloadCount) navDownloadCount.textContent = downloads.length;

        for (const item of filtered) {
            if (!rows) break;
            const row = document.createElement('tr');
            const visitor = document.createElement('td');
            visitor.innerHTML = `<div class="visitor-cell"><span class="visitor-avatar"></span><span class="visitor-name"></span></div>`;
            visitor.querySelector('.visitor-avatar').textContent = item.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
            visitor.querySelector('.visitor-name').textContent = item.name;

            const contact = document.createElement('td');
            const contactLabel = item.email || item.phone;
            contact.innerHTML = `<span class="contact-cell"><i class="fas ${item.email ? 'fa-envelope' : 'fa-phone'}"></i><span></span></span>`;
            contact.querySelector('.contact-cell > span').textContent = contactLabel;

            const documentCell = document.createElement('td');
            documentCell.textContent = item.document;
            const date = document.createElement('td');
            date.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.downloadedAt || item.requestedAt));
            const status = document.createElement('td');
            status.innerHTML = item.downloadedAt
                ? '<span class="status-badge">Downloaded</span>'
                : '<span class="status-badge">Requested</span>';
            row.append(visitor, contact, documentCell, date, status);
            rows.append(row);
        }

        const empty = document.getElementById('downloads-empty');
        if (!empty) return;
        empty.hidden = filtered.length > 0;
        if (downloads.length && !filtered.length) {
            empty.querySelector('h3').textContent = 'No matching enquiries';
            empty.querySelector('p').textContent = 'Try another name, email address, phone number or document.';
        } else {
            empty.querySelector('h3').textContent = 'No download enquiries yet';
            empty.querySelector('p').textContent = 'Visitor details and document requests are saved here by the backend.';
        }
    }

    async function showCurrentCV() {
        const cv = managedDocuments.find((document) => document.documentId === 'cv');
        if (!cv) throw new Error('The current CV details are unavailable.');
        const updatedDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(cv.updatedAt));
        const fileName = document.getElementById('cv-file-name');
        if (fileName) fileName.textContent = cv.filename;
        const fileDetails = document.getElementById('cv-file-details');
        if (fileDetails) fileDetails.textContent = `Published ${updatedDate}`;
        const currentCvStat = document.getElementById('current-cv-stat');
        if (currentCvStat) currentCvStat.textContent = 'Published';
        const currentCvDate = document.getElementById('current-cv-date');
        if (currentCvDate) currentCvDate.textContent = updatedDate;
    }

    async function loadManagedDocuments() {
        const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/documents`, { credentials: 'include' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load document details.');
        managedDocuments = result.documents;
        if (document.getElementById('certificate-admin-list')) renderCertificateList();
        await showCurrentCV();
    }

    function renderCertificateList() {
        const list = document.getElementById('certificate-admin-list');
        list.replaceChildren();
        const certificates = managedDocuments.filter((document) => document.type === 'certificate');
        if (!certificates.length) {
            const empty = document.createElement('p');
            empty.className = 'certificate-admin-empty';
            empty.textContent = 'No certificates have been added yet.';
            list.append(empty);
            return;
        }

        for (const certificate of certificates) {
            const item = document.createElement('article');
            item.className = 'certificate-admin-item';
            const details = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = certificate.title;
            const metadata = document.createElement('span');
            metadata.textContent = `${certificate.institution} · ${certificate.issuedAt}`;
            details.append(title, metadata);
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'admin-button quiet';
            editButton.dataset.editCertificate = certificate.documentId;
            editButton.textContent = 'Edit';
            item.append(details, editButton);
            list.append(item);
        }
    }

    function resetCertificateForm() {
        certificateForm.reset();
        document.getElementById('certificate-id').value = '';
        document.getElementById('certificate-file-hint').textContent = '(required for new certificates)';
        document.querySelector('label[for="certificate-file-input"] strong').textContent = 'Choose a certificate PDF';
        document.getElementById('certificate-submit-label').textContent = 'Add certificate';
        document.getElementById('certificate-reset').hidden = true;
        certificateFileInput.required = true;
    }

    function readPdfAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                resolve(result.slice(result.indexOf(',') + 1));
            };
            reader.onerror = () => reject(reader.error || new Error('Could not read the selected PDF.'));
            reader.readAsDataURL(file);
        });
    }

    if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        const feedback = document.getElementById('homepage-feedback');
        try {
            data.saveContent({
                title: form.elements.title.value,
                subtitle: form.elements.subtitle.value,
                intro: form.elements.intro.value
            });
            showFeedback(feedback, 'Homepage introduction saved in this browser.', false);
        } catch (error) {
            showFeedback(feedback, error.message, true);
        }
    });

    const resetHomepage = document.getElementById('reset-homepage');
    if (resetHomepage) resetHomepage.addEventListener('click', () => {
        const feedback = document.getElementById('homepage-feedback');
        try {
            data.resetContent();
            loadHomepageForm();
            showFeedback(feedback, 'Default homepage text restored in this browser.', false);
        } catch (error) {
            showFeedback(feedback, error.message, true);
        }
    });

    document.getElementById('admin-logout').addEventListener('click', async () => {
        try {
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('The server could not end this admin session.');
            window.location.replace('admin-login.html');
        } catch (error) {
            console.error('Admin logout failed:', error);
            const feedback = document.getElementById('homepage-feedback') || document.getElementById('cv-feedback');
            if (feedback) showFeedback(feedback, 'Could not log out. Check the connection and try again.', true);
        }
    });

    if (search) search.addEventListener('input', () => {
        renderDownloads().catch((error) => {
            console.error('Could not refresh download requests:', error);
            document.getElementById('downloads-feedback').textContent = 'Could not load download requests. Check the server connection and retry.';
        });
    });
    if (fileInput) fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) document.querySelector('.upload-dropzone strong').textContent = file.name;
    });

    if (uploadForm) uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('cv-feedback');
        const file = fileInput.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showFeedback(feedback, 'Choose a PDF file to update the CV.', true);
            return;
        }

        try {
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/documents/cv`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, file: await readPdfAsBase64(file) })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Could not publish the new CV.');
            managedDocuments = managedDocuments.map((document) => document.documentId === 'cv' ? result.document : document);
            await showCurrentCV();
            showFeedback(feedback, 'Latest CV published for all visitors.', false);
            uploadForm.reset();
            document.querySelector('.upload-dropzone strong').textContent = 'Choose a new CV file';
        } catch (error) {
            console.error('CV upload failed:', error);
            showFeedback(feedback, error.message, true);
        }
    });

    const certificateList = document.getElementById('certificate-admin-list');
    if (certificateList) certificateList.addEventListener('click', (event) => {
        const editButton = event.target.closest('[data-edit-certificate]');
        if (!editButton) return;
        const certificate = managedDocuments.find((item) => item.documentId === editButton.dataset.editCertificate);
        if (!certificate) return;

        document.getElementById('certificate-id').value = certificate.documentId;
        certificateForm.elements.title.value = certificate.title;
        certificateForm.elements.description.value = certificate.description;
        certificateForm.elements.issuedAt.value = certificate.issuedAt;
        certificateForm.elements.institution.value = certificate.institution;
        certificateFileInput.value = '';
        certificateFileInput.required = false;
        document.getElementById('certificate-file-hint').textContent = `(optional; current file: ${certificate.filename})`;
        document.getElementById('certificate-submit-label').textContent = 'Save changes';
        document.getElementById('certificate-reset').hidden = false;
        document.getElementById('certificate-feedback').textContent = '';
        certificateForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        certificateForm.elements.title.focus();
    });

    const certificateReset = document.getElementById('certificate-reset');
    if (certificateReset) certificateReset.addEventListener('click', resetCertificateForm);
    if (certificateFileInput) certificateFileInput.addEventListener('change', () => {
        const file = certificateFileInput.files[0];
        if (file) document.querySelector('label[for="certificate-file-input"] strong').textContent = file.name;
    });

    if (certificateForm) certificateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('certificate-feedback');
        const certificateId = document.getElementById('certificate-id').value;
        const file = certificateFileInput.files[0];
        if (!certificateId && !file) {
            showFeedback(feedback, 'Choose a PDF file for this certificate.', true);
            return;
        }
        if (file && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showFeedback(feedback, 'Choose a PDF file for this certificate.', true);
            return;
        }

        const submitButton = certificateForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const payload = {
                title: certificateForm.elements.title.value,
                description: certificateForm.elements.description.value,
                issuedAt: certificateForm.elements.issuedAt.value,
                institution: certificateForm.elements.institution.value
            };
            if (file) {
                payload.filename = file.name;
                payload.file = await readPdfAsBase64(file);
            }
            const response = await fetch(
                `${window.PORTFOLIO_API_BASE_URL}/documents/certificates${certificateId ? `/${encodeURIComponent(certificateId)}` : ''}`,
                {
                    method: certificateId ? 'PUT' : 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Could not save the certificate.');
            showFeedback(feedback, certificateId ? 'Certificate updated for all visitors.' : 'Certificate added for all visitors.', false);
            resetCertificateForm();
            await loadManagedDocuments();
        } catch (error) {
            console.error('Certificate update failed:', error);
            showFeedback(feedback, error.message || 'Could not save the certificate.', true);
        } finally {
            submitButton.disabled = false;
        }
    });

    try {
        loadHomepageForm();
        await renderDownloads();
        if (uploadForm || document.getElementById('current-cv-stat')) await loadManagedDocuments();
    } catch (error) {
        console.error('Could not initialize the admin dashboard:', error);
        const feedback = document.getElementById('downloads-feedback') || document.getElementById('cv-feedback');
        if (feedback) feedback.textContent = 'Could not load dashboard data. Check the server connection and retry.';
    }
});
