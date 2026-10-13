document.addEventListener('DOMContentLoaded', async () => {
    const profileImages = document.querySelectorAll('.nav-avatar');
    if (!profileImages.length) return;

    try {
        const response = await fetch(`${window.PORTFOLIO_API_BASE_URL}/homepage`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load the published profile image.');
        const imageUrl = result.content?.brand?.imageUrl;
        if (typeof imageUrl !== 'string' || !imageUrl.trim()) return;
        profileImages.forEach((image) => { image.src = imageUrl; });
    } catch (error) {
        console.error('Could not load the published profile image:', error);
    }
});
