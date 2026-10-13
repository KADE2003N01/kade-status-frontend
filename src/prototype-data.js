(function () {
    const CONTENT_KEY = 'kade-portfolio-content';

    const defaultContent = {
        title: "I'm a Developer",
        subtitle: 'Computer Science Student | Frontend Developer',
        intro: 'I build responsive and modern web interfaces. Turning ideas into clean, user-friendly experiences through code.'
    };

    function readJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error(`Could not read prototype data for ${key}:`, error);
            throw new Error('Saved portfolio data could not be read in this browser.');
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Could not save prototype data for ${key}:`, error);
            throw new Error('Portfolio data could not be saved in this browser.');
        }
    }

    window.PortfolioPrototype = {
        defaultContent,
        getContent() {
            return { ...defaultContent, ...readJson(CONTENT_KEY, {}) };
        },
        saveContent(content) {
            writeJson(CONTENT_KEY, {
                title: String(content.title).trim(),
                subtitle: String(content.subtitle).trim(),
                intro: String(content.intro).trim()
            });
        },
        resetContent() {
            localStorage.removeItem(CONTENT_KEY);
        },
    };

    document.addEventListener('DOMContentLoaded', () => {
        const title = document.getElementById('dynamic-title');
        const subtitle = document.getElementById('homepage-subtitle');
        const intro = document.getElementById('homepage-intro');
        if (title || subtitle || intro) {
            try {
                const content = window.PortfolioPrototype.getContent();
                if (title) {
                    title.textContent = content.title;
                    title.dataset.text = content.title;
                }
                if (subtitle) subtitle.textContent = content.subtitle;
                if (intro) intro.textContent = content.intro;
            } catch (error) {
                console.error('Could not load the homepage preview content:', error);
            }
        }

        const requestForm = document.getElementById('download-request-form');
        if (requestForm) initializeDownloadForm(requestForm);
        const certificateList = document.querySelector('.certificate-add-slot')?.parentElement;
        if (certificateList) {
            loadPublicDocuments(certificateList).catch((error) => {
                console.error('Could not load public documents:', error);
                const feedback = document.getElementById('documents-feedback');
                if (feedback) feedback.textContent = 'Could not load document details. Please refresh the page or try again later.';
            });
        }
    });

    let lastFocusedElement = null;
    const authorizedDownloads = new Map();
    const previewUrls = new Map();

    async function loadPublicDocuments(certificateList) {
        const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/documents`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load document details.');

        const cv = result.documents.find((item) => item.documentId === 'cv');
        if (cv) {
            document.querySelector('#cv-public-file-name').textContent = cv.filename;
            document.querySelector('#cv-public-description').textContent = cv.description;
            const updatedDate = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(cv.updatedAt));
            document.querySelector('#cv-last-updated').textContent = updatedDate;
        }

        const ebc = result.documents.find((item) => item.documentId === 'ebc');
        if (ebc) {
            const ebcCard = document.querySelector('[data-document-id="ebc"]');
            ebcCard.querySelector('[data-document-title]').textContent = ebc.title;
            ebcCard.querySelector('[data-document-description]').textContent = ebc.description;
            ebcCard.querySelector('[data-document-long-description]').textContent = ebc.description;
            ebcCard.querySelector('[data-document-issued]').textContent = ebc.issuedAt?.slice(0, 4) || '';
            ebcCard.querySelector('[data-document-institution]').textContent = ebc.institution || '';
        }

        certificateList.querySelectorAll('[data-certificate-card]').forEach((card) => card.remove());
        const placeholder = certificateList.querySelector('.certificate-add-slot');
        for (const certificate of result.documents.filter((item) => item.type === 'certificate')) {
            const card = createCertificateCard(certificate);
            certificateList.insertBefore(card, placeholder);
        }
    }

    function createCertificateCard(certificate) {
        const card = document.createElement('article');
        card.className = 'document-file-card';
        card.dataset.certificateCard = '';
        card.innerHTML = `
            <div class="public-certificate-heading">
                <span class="public-certificate-icon"><i class="fas fa-certificate" aria-hidden="true"></i></span>
                <div><h3></h3><span class="public-certificate-type">Professional certificate</span></div>
            </div>
            <p class="public-certificate-description"></p>
            <div class="public-document-actions">
                <button class="doc-card-button doc-btn-outline" type="button" data-preview><i class="fas fa-eye" aria-hidden="true"></i>View document</button>
                <button class="doc-card-button doc-btn-outline" type="button" data-download><i class="fas fa-download" aria-hidden="true"></i>Download</button>
            </div>
            <div class="document-preview-panel" hidden>
                <div class="document-preview-heading"><h3></h3><button type="button" class="doc-card-button doc-btn-outline" data-authorized-download><i class="fas fa-download" aria-hidden="true"></i>Download certificate</button></div>
                <iframe class="document-preview-frame" title="Certificate preview"></iframe>
            </div>
            <div class="public-certificate-meta"><span data-issued></span><span data-institution></span></div>
        `;
        const title = card.querySelector('.public-certificate-heading h3');
        title.textContent = certificate.title;
        card.querySelector('.public-certificate-description').textContent = certificate.description;
        card.querySelector('.document-preview-heading h3').textContent = `${certificate.title} preview`;
        card.querySelector('[data-issued]').textContent = `Issued ${certificate.issuedAt}`;
        card.querySelector('[data-institution]').textContent = certificate.institution;
        const previewPanel = card.querySelector('.document-preview-panel');
        const previewFrame = card.querySelector('iframe');

        card.querySelector('[data-preview]').addEventListener('click', () => {
            window.requestDocumentDownload(certificate.documentId, 'preview');
        });
        card.querySelector('[data-download]').addEventListener('click', () => {
            window.requestDocumentDownload(certificate.documentId, 'download');
        });
        card.querySelector('[data-authorized-download]').addEventListener('click', () => {
            window.downloadAuthorizedDocument(certificate.documentId);
        });
        card.dataset.previewPanel = `${certificate.documentId}-preview-panel`;
        card.dataset.previewFrame = `${certificate.documentId}-preview-frame`;
        previewPanel.id = card.dataset.previewPanel;
        previewFrame.id = card.dataset.previewFrame;
        return card;
    }

    function initializeDownloadForm(form) {
        const modal = document.getElementById('download-request-modal');
        const status = document.getElementById('download-form-status');
        const email = document.getElementById('download-email');
        const phone = document.getElementById('download-phone');

        window.requestDocumentDownload = (documentId, action = 'download') => {
            lastFocusedElement = document.activeElement;
            form.reset();
            document.getElementById('requested-document-id').value = documentId;
            document.getElementById('requested-document-action').value = action;
            status.textContent = '';
            status.classList.remove('success');
            modal.hidden = false;
            document.getElementById('download-name').focus();
        };

        function closeModal() {
            modal.hidden = true;
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
        }

        modal.querySelectorAll('[data-close-download]').forEach((element) => element.addEventListener('click', closeModal));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.hidden) closeModal();
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            status.classList.remove('success');
            if (!email.value.trim() && !phone.value.trim()) {
                status.textContent = 'Enter an email address or a phone number to continue.';
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving request…';
            try {
                const documentId = document.getElementById('requested-document-id').value;
                const requestResponse = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        documentId,
                        name: document.getElementById('download-name').value.trim(),
                        email: email.value.trim(),
                        phone: phone.value.trim(),
                        consent: document.getElementById('download-consent').checked
                    })
                });
                const requestResult = await requestResponse.json();
                if (!requestResponse.ok) {
                    throw new Error(requestResult.error || 'Could not save your download request.');
                }

                authorizedDownloads.set(documentId, {
                    token: requestResult.downloadToken,
                    filename: requestResult.filename
                });
                const action = document.getElementById('requested-document-action').value;
                if (action === 'preview') {
                    submitButton.textContent = 'Loading document preview…';
                    const previewResponse = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads/preview`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: requestResult.downloadToken })
                    });
                    if (!previewResponse.ok) {
                        const previewResult = await previewResponse.json();
                        throw new Error(previewResult.error || 'Your details were saved, but the preview could not be loaded.');
                    }
                    const previewUrl = URL.createObjectURL(await previewResponse.blob());
                    const oldPreviewUrl = previewUrls.get(documentId);
                    if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
                    previewUrls.set(documentId, previewUrl);
                    document.getElementById(`${documentId}-preview-frame`).src = `${previewUrl}#toolbar=0`;
                    document.getElementById(`${documentId}-preview-panel`).hidden = false;
                    status.textContent = requestResult.notificationSent
                        ? 'Your details were saved and the document preview is ready. Download is now enabled.'
                        : 'Your details were saved. The document preview is ready; email notification is unavailable.';
                    status.classList.add('success');
                    closeModal();
                    form.reset();
                    return;
                }

                await window.downloadAuthorizedDocument(documentId);
                status.textContent = requestResult.notificationSent
                    ? 'Your request was saved and the download is starting.'
                    : 'Your request was saved to the admin dashboard and the download is starting. Email notification is unavailable.';
                status.classList.add('success');
                window.setTimeout(() => {
                    closeModal();
                    form.reset();
                }, 1100);
            } catch (error) {
                console.error('Could not prepare the document download:', error);
                status.textContent = error.message || 'Could not prepare the download. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Continue to download <i class="fas fa-arrow-right"></i>';
            }
        });

        window.downloadAuthorizedDocument = async (documentId) => {
            const authorization = authorizedDownloads.get(documentId);
            if (!authorization) {
                window.requestDocumentDownload(documentId, 'download');
                return;
            }

            try {
                const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads/file`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: authorization.token })
                });
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'Your download authorization has expired.');
                }

                const url = URL.createObjectURL(await response.blob());
                const link = document.createElement('a');
                link.href = url;
                link.download = authorization.filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                authorizedDownloads.delete(documentId);
                window.setTimeout(() => URL.revokeObjectURL(url), 60000);
            } catch (error) {
                console.error('Could not download the authorized document:', error);
                authorizedDownloads.delete(documentId);
                window.requestDocumentDownload(documentId, 'download');
                status.textContent = 'The download authorization could not be used. Submit your details again to retry.';
            }
        };
    }
})();
