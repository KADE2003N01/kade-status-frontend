(function () {
    document.addEventListener('DOMContentLoaded', () => {
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
            document.querySelector('#cv-public-title').textContent = cv.title;
            document.querySelector('#cv-public-file-name').textContent = cv.filename;
            document.querySelector('#cv-public-description').textContent = cv.description;
            const updatedDate = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(cv.updatedAt));
            document.querySelector('#cv-last-updated').textContent = updatedDate;
            document.querySelector('#cv-public-meta').textContent = [
                cv.institution,
                cv.issuedAt ? new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(`${cv.issuedAt}T00:00:00`)) : ''
            ].filter(Boolean).join(' · ') || 'Professional Resume';
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
                <div class="document-preview-heading"><h3></h3></div>
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
            window.previewDocument(certificate.documentId);
        });
        card.querySelector('[data-download]').addEventListener('click', () => {
            window.requestDocumentDownload(certificate.documentId);
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
        const requestFields = document.getElementById('download-request-fields');
        const verificationFields = document.getElementById('download-verification-fields');
        const codeActions = document.getElementById('download-code-actions');
        const verificationCode = document.getElementById('download-verification-code');
        const submitButton = document.getElementById('download-submit');
        const emailCodeButton = document.getElementById('send-email-code');
        const smsCodeButton = document.getElementById('send-sms-code');
        const verifyCodeButton = document.getElementById('verify-download-code');
        const changeContactButton = document.getElementById('download-change-email');
        const channelHint = document.getElementById('verification-channel-hint');
        const contactHint = document.getElementById('download-contact-hint');
        let challengeId = '';
        let verificationChannel = '';
        let verifiedAuthorization = null;

        function updateCodeButtons() {
            if (challengeId) {
                emailCodeButton.hidden = true;
                smsCodeButton.hidden = true;
                emailCodeButton.disabled = true;
                smsCodeButton.disabled = true;
                codeActions.hidden = true;
                return;
            }
            const hasEmail = Boolean(email.value.trim());
            const hasPhone = Boolean(phone.value.trim());
            const hasBoth = hasEmail && hasPhone;
            const validPhone = /^\+[1-9]\d{7,14}$/.test(phone.value.trim());
            emailCodeButton.hidden = !hasEmail || hasBoth;
            smsCodeButton.hidden = !hasPhone || hasBoth;
            emailCodeButton.disabled = !hasEmail || hasBoth || !email.checkValidity();
            smsCodeButton.disabled = !hasPhone || hasBoth || !validPhone;
            codeActions.hidden = hasBoth || (!hasEmail && !hasPhone);
            contactHint.classList.toggle('error', hasBoth || (hasEmail && !email.checkValidity()) || (hasPhone && !validPhone));
            if (hasBoth) {
                contactHint.textContent = 'Use one contact method only. Clear either the email or phone field to continue.';
            } else if (hasEmail && !email.checkValidity()) {
                contactHint.textContent = 'Enter a valid email address to receive your verification code.';
            } else if (hasPhone && !validPhone) {
                contactHint.textContent = 'Enter a valid phone number in international format, such as +250788123456.';
            } else if (hasEmail) {
                contactHint.textContent = 'We’ll send the verification code to this email address.';
            } else if (hasPhone) {
                contactHint.textContent = 'We’ll send the verification code to this phone number.';
            } else {
                contactHint.textContent = 'Enter either an email address or a phone number—not both.';
            }
        }

        function resetVerification() {
            challengeId = '';
            verificationChannel = '';
            verifiedAuthorization = null;
            requestFields.querySelectorAll('input, textarea').forEach((input) => { input.disabled = false; });
            requestFields.hidden = false;
            codeActions.hidden = false;
            updateCodeButtons();
            verificationFields.hidden = true;
            verificationCode.value = '';
            verificationCode.disabled = false;
            verificationCode.required = false;
            verifyCodeButton.hidden = false;
            changeContactButton.hidden = false;
            submitButton.hidden = true;
        }

        function resetFormState() {
            form.reset();
            resetVerification();
        }

        window.previewDocument = async (documentId) => {
            const panel = document.getElementById(`${documentId}-preview-panel`);
            const frame = document.getElementById(`${documentId}-preview-frame`);
            const feedback = document.getElementById('documents-feedback');
            if (!panel || !frame) {
                if (feedback) feedback.textContent = 'The preview area for this document is unavailable.';
                return;
            }
            if (feedback) feedback.textContent = 'Loading document preview…';
            try {
                const response = await fetch(
                    `${window.PORTFOLIO_API_BASE_URL}/downloads/preview/${encodeURIComponent(documentId)}`
                );
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'The document preview could not be loaded.');
                }
                const previewUrl = URL.createObjectURL(await response.blob());
                const oldPreviewUrl = previewUrls.get(documentId);
                if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
                previewUrls.set(documentId, previewUrl);
                frame.src = `${previewUrl}#toolbar=0`;
                panel.hidden = false;
                if (feedback) feedback.textContent = '';
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('Could not load the document preview:', error);
                if (feedback) feedback.textContent = error.message || 'The document preview could not be loaded.';
            }
        };

        window.requestDocumentDownload = (documentId) => {
            lastFocusedElement = document.activeElement;
            resetFormState();
            document.getElementById('requested-document-id').value = documentId;
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
        email.addEventListener('input', updateCodeButtons);
        phone.addEventListener('input', updateCodeButtons);
        email.addEventListener('change', updateCodeButtons);
        phone.addEventListener('change', updateCodeButtons);
        changeContactButton.addEventListener('click', () => {
            resetVerification();
            status.textContent = 'Update your email or phone number, then request another code.';
            status.classList.remove('success');
            email.focus();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.hidden) closeModal();
        });

        async function sendVerificationCode(channel) {
            status.classList.remove('success');
            const contact = channel === 'email' ? email : phone;
            if (!document.getElementById('download-name').checkValidity()) {
                document.getElementById('download-name').reportValidity();
                return;
            }
            if (!document.getElementById('download-reason').checkValidity()) {
                document.getElementById('download-reason').reportValidity();
                return;
            }
            if (!document.getElementById('download-consent').checked) {
                document.getElementById('download-consent').reportValidity();
                return;
            }
            if (!contact.value.trim() || !contact.checkValidity()) {
                contact.setCustomValidity(channel === 'sms' && !contact.value.trim()
                    ? 'Enter your phone number, including its country code.'
                    : '');
                contact.reportValidity();
                contact.setCustomValidity('');
                return;
            }
            const codeButton = channel === 'email' ? emailCodeButton : smsCodeButton;
            codeButton.disabled = true;
            codeButton.textContent = channel === 'email' ? 'Sending email code…' : 'Sending SMS…';
            let deliveryError;
            try {
                const documentId = document.getElementById('requested-document-id').value;
                const payload = {
                    documentId,
                    name: document.getElementById('download-name').value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    reason: document.getElementById('download-reason').value.trim(),
                    channel,
                    consent: document.getElementById('download-consent').checked
                };
                const requestResponse = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const requestResult = await requestResponse.json();
                if (!requestResponse.ok) {
                    throw Object.assign(
                        new Error(requestResult.error || 'No verification code was sent. Please check your contact details and try again.'),
                        { status: requestResponse.status }
                    );
                }

                challengeId = requestResult.challengeId;
                verificationChannel = channel;
                requestFields.hidden = true;
                requestFields.querySelectorAll('input, textarea').forEach((input) => { input.disabled = true; });
                codeActions.hidden = true;
                emailCodeButton.disabled = true;
                smsCodeButton.disabled = true;
                channelHint.textContent = channel === 'email' ? 'sent to your email' : 'sent by SMS';
                verificationCode.required = true;
                verificationFields.hidden = false;
                status.textContent = channel === 'email'
                    ? `A code was sent to ${requestResult.recipientPreview}. Enter the real six-digit code from that email below.`
                    : `A code was sent by SMS to ${requestResult.recipientPreview}. Enter the real six-digit code from that text message below.`;
                verificationCode.focus();
            } catch (error) {
                deliveryError = error;
                console.error(`Could not send the ${channel} verification code:`, error);
                status.textContent = error.message || 'No verification code was sent. Please check your contact details and try again.';
                status.classList.remove('success');
            } finally {
                codeButton.innerHTML = channel === 'email'
                    ? '<i class="fas fa-envelope"></i> Send code by email'
                    : '<i class="fas fa-comment-sms"></i> Send code by SMS';
                updateCodeButtons();
                if (deliveryError?.status === 503 && channel === 'sms') {
                    contactHint.textContent = 'SMS is unavailable right now. No code was sent. To use email, clear the phone field and enter your email.';
                    contactHint.classList.add('error');
                } else if (deliveryError?.status === 503 && channel === 'email') {
                    contactHint.textContent = 'Email delivery is unavailable right now. No code was sent. Try again later or use SMS if available.';
                    contactHint.classList.add('error');
                }
            }
        }

        async function verifyCode() {
            if (!challengeId) return;
            if (!verificationCode.checkValidity()) {
                verificationCode.reportValidity();
                return;
            }
            verifyCodeButton.disabled = true;
            verifyCodeButton.textContent = 'Verifying…';
            status.classList.remove('success');
            try {
                const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/downloads/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ challengeId, code: verificationCode.value.trim() })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Could not verify the code.');
                verifiedAuthorization = { token: result.downloadToken, filename: result.filename };
                verifyCodeButton.hidden = true;
                changeContactButton.hidden = true;
                verificationCode.disabled = true;
                submitButton.hidden = false;
                submitButton.focus();
                status.textContent = `Your ${verificationChannel === 'email' ? 'email address' : 'phone number'} is verified. Continue when you’re ready.`;
                status.classList.add('success');
            } catch (error) {
                console.error('Could not verify the download code:', error);
                status.textContent = error.message || 'Could not verify the code. Please try again.';
            } finally {
                verifyCodeButton.disabled = false;
                verifyCodeButton.textContent = 'Verify code';
            }
        }

        async function continueToDocument() {
            if (!verifiedAuthorization) return;
            const documentId = document.getElementById('requested-document-id').value;
            submitButton.disabled = true;
            submitButton.textContent = 'Opening document…';
            try {
                authorizedDownloads.set(documentId, verifiedAuthorization);
                await window.downloadAuthorizedDocument(documentId);
                status.textContent = 'Your verified download is starting.';
                status.classList.add('success');
                window.setTimeout(() => {
                    closeModal();
                    resetFormState();
                }, 1100);
            } catch (error) {
                console.error('Could not continue to the document:', error);
                status.textContent = error.message || 'Could not open the document. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Continue to download <i class="fas fa-arrow-right"></i>';
            }
        }

        emailCodeButton.addEventListener('click', () => sendVerificationCode('email'));
        smsCodeButton.addEventListener('click', () => sendVerificationCode('sms'));
        verifyCodeButton.addEventListener('click', verifyCode);
        submitButton.addEventListener('click', continueToDocument);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (verifiedAuthorization) continueToDocument();
            else if (challengeId) verifyCode();
            else sendVerificationCode(phone.value.trim() && !email.value.trim() ? 'sms' : 'email');
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
