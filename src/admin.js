document.addEventListener('DOMContentLoaded', async () => {
    try {
        const sessionResponse = await fetch(`${window.PORTFOLIO_API_BASE_URL}/auth/me`, { credentials: 'include' });
        if (sessionResponse.status === 401) {
            window.location.replace('admin-login.html');
            return;
        }
        if (!sessionResponse.ok) throw new Error('The admin session could not be verified.');
        const session = await sessionResponse.json();
        const displayName = typeof session.user?.displayName === 'string' ? session.user.displayName.trim() : '';
        const email = typeof session.user?.email === 'string' ? session.user.email.trim() : '';
        if (!displayName || !email) throw new Error('The admin profile is missing a name or email address.');
        const displayNameHeading = document.getElementById('admin-display-name');
        if (displayNameHeading) displayNameHeading.textContent = displayName;
        document.getElementById('admin-brand-name').textContent = displayName;
        document.getElementById('admin-account-name').textContent = displayName;
        document.getElementById('admin-account-email').textContent = email;
        const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
        const accountAvatar = document.getElementById('admin-account-avatar');
        if (accountAvatar) accountAvatar.textContent = initials;
        document.body.classList.remove('auth-pending');
    } catch (error) {
        console.error('Could not verify the admin session:', error);
        window.location.replace('admin-login.html?session=unavailable');
        return;
    }

    const form = document.getElementById('homepage-form');
    const homepageFields = document.getElementById('homepage-fields');
    const search = document.getElementById('download-search');
    const uploadForm = document.getElementById('cv-upload-form');
    const fileInput = document.getElementById('cv-file-input');
    const profileImageForm = document.getElementById('profile-image-form');
    const profileImageInput = document.getElementById('profile-image-input');
    const certificateForm = document.getElementById('certificate-form');
    const certificateFileInput = document.getElementById('certificate-file-input');
    let managedDocuments = [];
    let homepageContent;
    let profilePreviewUrl = '';
    let currentProfileImageUrl = '';

    const todayDate = document.getElementById('today-date');
    const formatLocalDateTime = (date, includeSeconds = false) => new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        ...(includeSeconds ? { second: '2-digit' } : {}),
        timeZoneName: 'short'
    }).format(date);

    function showFeedback(element, message, isError) {
        element.textContent = message;
        element.classList.toggle('error', Boolean(isError));
    }

    function formatFieldLabel(key) {
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
            .replace(/^\w/, (letter) => letter.toUpperCase());
    }

    function createHomepageField(key, value, path = []) {
        const field = document.createElement('div');
        field.className = 'homepage-editor-field';
        const labelText = formatFieldLabel(key);
        const fieldPath = JSON.stringify([...path, key]);
        const fieldId = `homepage-field-${[...path, key].join('-')}`;

        if (typeof value === 'boolean') {
            field.classList.add('homepage-editor-toggle');
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = fieldId;
            input.checked = value;
            input.dataset.homepagePath = fieldPath;
            input.dataset.homepageType = 'boolean';
            label.append(input, document.createTextNode(key === 'visible'
                ? ' Display this section on the landing page'
                : ` Enable ${labelText.toLowerCase()}`));
            field.append(label);
            return field;
        }

        const label = document.createElement('label');
        label.htmlFor = fieldId;
        label.textContent = labelText;
        if (Array.isArray(value)) {
            const input = document.createElement('textarea');
            input.id = fieldId;
            input.rows = Math.min(Math.max(value.length * 3, 5), 14);
            input.value = JSON.stringify(value, null, 2);
            input.dataset.homepagePath = fieldPath;
            input.dataset.homepageType = 'json';
            input.spellcheck = false;
            field.append(label, input);
            const hint = document.createElement('small');
            hint.textContent = 'Edit this list as JSON. Keep each item’s fields, such as label and href.';
            field.append(hint);
            return field;
        }

        const input = document.createElement('textarea');
        input.id = fieldId;
        input.rows = value.length > 120 ? 4 : 2;
        input.maxLength = 2000;
        input.value = value;
        input.dataset.homepagePath = fieldPath;
        input.dataset.homepageType = 'string';
        field.append(label, input);
        return field;
    }

    function renderHomepageFields(content) {
        homepageFields.replaceChildren();
        for (const [section, fields] of Object.entries(content)) {
            const group = document.createElement('fieldset');
            group.className = 'homepage-editor-section';
            const legend = document.createElement('legend');
            legend.textContent = formatFieldLabel(section);
            group.append(legend);
            for (const [key, value] of Object.entries(fields)) {
                group.append(createHomepageField(key, value, [section]));
            }
            homepageFields.append(group);
        }
    }

    function setNestedValue(target, path, value) {
        const parent = path.slice(0, -1).reduce((current, key) => current[key], target);
        parent[path[path.length - 1]] = value;
    }

    async function loadHomepageForm() {
        if (!form) return;
        const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/homepage`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load homepage content.');
        homepageContent = result.content;
        renderHomepageFields(result.content);
        const profilePreview = document.getElementById('profile-image-preview');
        if (profilePreview) {
            currentProfileImageUrl = result.content.brand.imageUrl;
            profilePreview.src = currentProfileImageUrl;
        }
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
            `${item.name} ${item.email || ''} ${item.phone || ''} ${item.document} ${item.reason || ''}`.toLowerCase().includes(query)
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
            const documentTitle = document.createElement('strong');
            documentTitle.textContent = item.document;
            const reason = document.createElement('small');
            reason.className = 'download-reason';
            reason.textContent = item.reason || 'No purpose provided';
            documentCell.append(documentTitle, reason);
            const date = document.createElement('td');
            date.textContent = formatLocalDateTime(new Date(item.downloadedAt || item.requestedAt));
            const status = document.createElement('td');
            status.innerHTML = item.downloadedAt
                ? '<span class="status-badge">Downloaded</span>'
                : '<span class="status-badge">Requested</span>';
            const action = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'download-delete-button';
            deleteButton.dataset.deleteDownload = item.id;
            deleteButton.setAttribute('aria-label', `Delete request from ${item.name}`);
            deleteButton.innerHTML = '<i class="fas fa-trash-can" aria-hidden="true"></i><span>Delete</span>';
            action.append(deleteButton);
            row.append(visitor, contact, documentCell, date, status, action);
            rows.append(row);
        }

        const lastUpdated = document.getElementById('downloads-last-updated');
        if (lastUpdated) lastUpdated.textContent = formatLocalDateTime(new Date());
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
        const cvFields = {
            title: document.getElementById('cv-title'),
            description: document.getElementById('cv-description'),
            issuedAt: document.getElementById('cv-issued-at'),
            institution: document.getElementById('cv-institution')
        };
        for (const [key, field] of Object.entries(cvFields)) {
            if (field && !field.value) field.value = cv[key] || '';
        }
        const updatedDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(cv.updatedAt));
        const fileName = document.getElementById('cv-file-name');
        if (fileName) fileName.textContent = `${cv.title} · ${cv.filename}`;
        const fileDetails = document.getElementById('cv-file-details');
        if (fileDetails) fileDetails.textContent = `${cv.description} · Published ${updatedDate}`;
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

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(reader.error || new Error('Could not read the selected image.'));
            reader.readAsDataURL(file);
        });
    }

    if (form) form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('homepage-feedback');
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const content = JSON.parse(JSON.stringify(homepageContent));
            for (const input of homepageFields.querySelectorAll('[data-homepage-path]')) {
                const path = JSON.parse(input.dataset.homepagePath);
                let value;
                if (input.dataset.homepageType === 'boolean') {
                    value = input.checked;
                } else if (input.dataset.homepageType === 'json') {
                    value = JSON.parse(input.value);
                } else {
                    value = input.value;
                }
                setNestedValue(content, path, value);
            }
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/homepage`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const result = await response.json();
            if (response.status === 401) {
                window.location.replace('admin-login.html');
                return;
            }
            if (!response.ok) throw new Error(result.error || 'Could not save homepage content.');
            homepageContent = result.content;
            renderHomepageFields(result.content);
            showFeedback(feedback, 'Homepage changes are now live for all visitors.', false);
        } catch (error) {
            console.error('Homepage content update failed:', error);
            showFeedback(feedback, error instanceof SyntaxError
                ? 'A list contains invalid JSON. Correct it and try again.'
                : error.message || 'Could not save homepage content.', true);
        } finally {
            submitButton.disabled = false;
        }
    });

    const resetHomepage = document.getElementById('reset-homepage');
    if (resetHomepage) resetHomepage.addEventListener('click', async () => {
        const feedback = document.getElementById('homepage-feedback');
        if (!window.confirm('Restore the default landing-page content for all visitors?')) return;
        resetHomepage.disabled = true;
        try {
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/homepage/reset`, {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();
            if (response.status === 401) {
                window.location.replace('admin-login.html');
                return;
            }
            if (!response.ok) throw new Error(result.error || 'Could not restore default homepage content.');
            homepageContent = result.content;
            renderHomepageFields(result.content);
            showFeedback(feedback, 'Default landing-page content restored for all visitors.', false);
        } catch (error) {
            console.error('Homepage content reset failed:', error);
            showFeedback(feedback, error.message || 'Could not restore homepage content.', true);
        } finally {
            resetHomepage.disabled = false;
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
    const downloadRows = document.getElementById('download-rows');
    if (downloadRows) downloadRows.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-delete-download]');
        if (!button) return;
        const downloadId = button.dataset.deleteDownload;
        if (!window.confirm('Delete this visitor download request? This cannot be undone.')) return;
        button.disabled = true;
        try {
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads/${encodeURIComponent(downloadId)}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await response.json();
            if (response.status === 401) {
                window.location.replace('admin-login.html');
                return;
            }
            if (!response.ok) throw new Error(result.error || 'Could not delete this request.');
            await renderDownloads();
        } catch (error) {
            console.error('Download request deletion failed:', error);
            const feedback = document.getElementById('downloads-feedback');
            if (feedback) showFeedback(feedback, error.message || 'Could not delete this request.', true);
            button.disabled = false;
        }
    });

    const refreshDownloadsButton = document.getElementById('refresh-downloads');
    if (refreshDownloadsButton) refreshDownloadsButton.addEventListener('click', async () => {
        refreshDownloadsButton.disabled = true;
        try {
            await renderDownloads();
        } catch (error) {
            console.error('Download refresh failed:', error);
            showFeedback(document.getElementById('downloads-feedback'), error.message || 'Could not refresh requests.', true);
        } finally {
            refreshDownloadsButton.disabled = false;
        }
    });

    const dashboardClock = document.getElementById('dashboard-clock');
    if (dashboardClock) {
        const updateClock = () => {
            const now = new Date();
            dashboardClock.dateTime = now.toISOString();
            dashboardClock.textContent = formatLocalDateTime(now, true);
            if (todayDate) {
                todayDate.textContent = new Intl.DateTimeFormat(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                }).format(now);
            }
        };
        updateClock();
        window.setInterval(updateClock, 1000);
    }
    window.setInterval(() => {
        if (!document.hidden) {
            renderDownloads().catch((error) => {
                console.error('Automatic download refresh failed:', error);
                const feedback = document.getElementById('downloads-feedback');
                if (feedback) showFeedback(feedback, 'Could not refresh requests. Check the connection and retry.', true);
            });
        }
    }, 30000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            renderDownloads().catch((error) => {
                console.error('Download refresh after returning to the page failed:', error);
                const feedback = document.getElementById('downloads-feedback');
                if (feedback) showFeedback(feedback, 'Could not refresh requests. Check the connection and retry.', true);
            });
        }
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
        if ((file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) || file.size > 10 * 1024 * 1024) {
            showFeedback(feedback, 'Choose a PDF file no larger than 10 MB to update the CV.', true);
            return;
        }

        try {
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/documents/cv`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: uploadForm.elements.title.value,
                    description: uploadForm.elements.description.value,
                    issuedAt: uploadForm.elements.issuedAt.value,
                    institution: uploadForm.elements.institution.value,
                    filename: file.name,
                    file: await readPdfAsBase64(file)
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Could not publish the new CV.');
            managedDocuments = managedDocuments.map((document) => document.documentId === 'cv' ? result.document : document);
            uploadForm.reset();
            await showCurrentCV();
            showFeedback(feedback, 'Latest CV published for all visitors.', false);
            document.querySelector('.upload-dropzone strong').textContent = 'Choose a new CV file';
        } catch (error) {
            console.error('CV upload failed:', error);
            showFeedback(feedback, error.message, true);
        }
    });

    if (profileImageInput) profileImageInput.addEventListener('change', () => {
        const file = profileImageInput.files[0];
        if (!file) return;
        const feedback = document.getElementById('profile-image-feedback');
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
            profilePreviewUrl = '';
            document.getElementById('profile-image-preview').src = currentProfileImageUrl;
            showFeedback(feedback, 'Choose a JPG, PNG, or WebP image no larger than 5 MB.', true);
            profileImageInput.value = '';
            return;
        }
        if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
        profilePreviewUrl = URL.createObjectURL(file);
        document.getElementById('profile-image-preview').src = profilePreviewUrl;
        showFeedback(feedback, `${file.name} is ready to publish.`, false);
    });

    if (profileImageForm) profileImageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('profile-image-feedback');
        const file = profileImageInput.files[0];
        if (!file) {
            showFeedback(feedback, 'Choose a profile image first.', true);
            return;
        }
        const submitButton = profileImageForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/homepage/profile-image`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: await readFileAsDataUrl(file) })
            });
            const result = await response.json();
            if (response.status === 401) {
                window.location.replace('admin-login.html');
                return;
            }
            if (!response.ok) throw new Error(result.error || 'Could not publish the profile image.');
            homepageContent.brand.imageUrl = result.imageUrl;
            currentProfileImageUrl = result.imageUrl;
            const imageField = homepageFields.querySelector('[data-homepage-path=\'["brand","imageUrl"]\']');
            if (imageField) imageField.value = result.imageUrl;
            document.getElementById('profile-image-preview').src = result.imageUrl;
            if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
            profilePreviewUrl = '';
            profileImageForm.reset();
            showFeedback(feedback, 'Profile image published for all visitors.', false);
        } catch (error) {
            console.error('Profile image upload failed:', error);
            showFeedback(feedback, error.message || 'Could not publish the profile image.', true);
        } finally {
            submitButton.disabled = false;
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
        await loadHomepageForm();
        await renderDownloads();
        if (uploadForm || document.getElementById('current-cv-stat')) await loadManagedDocuments();
    } catch (error) {
        console.error('Could not initialize the admin dashboard:', error);
        const feedback = document.getElementById('homepage-feedback')
            || document.getElementById('downloads-feedback')
            || document.getElementById('cv-feedback');
        if (feedback) showFeedback(feedback, error.message || 'Could not load dashboard data. Check the server connection and retry.', true);
    }
});
