// ============================================================
//  AI HUB â€” image.js
//  Connected to ai-image.html + Pollinations AI (free, no key)
// ============================================================

// â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let currentImageUrl = '';
let currentPrompt   = '';
let gallery         = JSON.parse(localStorage.getItem('aihub-gallery') || '[]');

// â”€â”€ On page load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();

    // Ctrl+Enter to generate
    document.getElementById('prompt').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            generateImage();
        }
    });

    // Seed slider label
    document.getElementById('seed').addEventListener('input', function () {
        document.getElementById('seed-val').textContent =
            this.value == 0 ? 'Random' : this.value;
    });
});

// â”€â”€ Set prompt from suggestion chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setPrompt(text) {
    document.getElementById('prompt').value = text;
    document.getElementById('prompt').focus();
}

// â”€â”€ Show/hide UI states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setState(state) {
    document.getElementById('empty-state').style.display   = state === 'empty'   ? 'block' : 'none';
    document.getElementById('loading-state').style.display = state === 'loading' ? 'flex'  : 'none';
    document.getElementById('image-result').style.display  = state === 'result'  ? 'flex'  : 'none';
    document.getElementById('result-area').style.minHeight = state === 'result'  ? 'auto'  : '500px';
}

// â”€â”€ Loading button state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setLoading(on) {
    const btn = document.getElementById('gen-btn');
    btn.disabled = on;
    document.getElementById('btn-icon').style.display = on ? 'none'  : 'inline';
    document.getElementById('btn-text').textContent   = on ? 'Generatingâ€¦' : 'Generate Image';
    document.getElementById('spinner').style.display  = on ? 'block' : 'none';
}

// â”€â”€ Toast notification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showToast(msg, duration = 3500) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
}

// â”€â”€ Copy prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function copyPrompt() {
    if (!currentPrompt) return;
    navigator.clipboard.writeText(currentPrompt).then(() => {
        showToast('âœ… Prompt copied to clipboard!');
    });
}

// â”€â”€ MAIN: Generate image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function generateImage() {
    const promptEl = document.getElementById('prompt');
    const prompt   = promptEl.value.trim();

    if (!prompt) {
        promptEl.focus();
        showToast('âš ï¸ Please enter a prompt first!');
        return;
    }

    // Read settings
    const style  = document.getElementById('style').value;
    const ratio  = document.getElementById('ratio').value;
    const model  = document.getElementById('model').value;
    const seed   = document.getElementById('seed').value;

    // Build full prompt with style
    const fullPrompt = style ? `${prompt}, ${style} style` : prompt;

    // Get width & height from ratio
    const [width, height] = ratio.split('x').map(Number);

    // Pick seed
    const finalSeed = seed > 0
        ? seed
        : Math.floor(Math.random() * 99999);

    // Build Pollinations URL (free, no API key needed)
    const encoded  = encodeURIComponent(fullPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?model=${model}&width=${width}&height=${height}&seed=${finalSeed}&nologo=true`;

    // Save current state
    currentPrompt   = fullPrompt;
    currentImageUrl = imageUrl;

    // Show loading UI
    setState('loading');
    setLoading(true);
    document.getElementById('loading-prompt').textContent = `"${fullPrompt}"`;

    // Load image via JS (handles load/error events)
    const img = new Image();

    img.onload = () => {
        // Show result
        document.getElementById('generated-img').src             = imageUrl;
        document.getElementById('overlay-prompt').textContent    = fullPrompt;
        document.getElementById('download-btn').href             = imageUrl;
        setState('result');
        setLoading(false);
    };

    img.onerror = () => {
        setState('empty');
        setLoading(false);
        showToast('âŒ Failed to generate image. Check your connection and try again.');
    };

    img.src = imageUrl;
}

// â”€â”€ Gallery: save image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addToGallery() {
    if (!currentImageUrl) return;

    // Avoid duplicates
    if (gallery.find(g => g.url === currentImageUrl)) {
        showToast('Already saved in your gallery!');
        return;
    }

    gallery.unshift({
        url:    currentImageUrl,
        prompt: currentPrompt,
        date:   Date.now()
    });

    // Keep max 20 images
    if (gallery.length > 20) gallery = gallery.slice(0, 20);

    localStorage.setItem('aihub-gallery', JSON.stringify(gallery));
    renderGallery();
    showToast('âœ… Saved to your gallery!');
}

// â”€â”€ Gallery: render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderGallery() {
    const grid  = document.getElementById('gallery-grid');
    const count = document.getElementById('gallery-count');

    count.textContent = gallery.length + ' image' + (gallery.length !== 1 ? 's' : '');

    if (gallery.length === 0) {
        grid.innerHTML = '<div class="gallery-empty">Images you save will appear here</div>';
        return;
    }

    grid.innerHTML = gallery.map((item, i) => `
        <div class="gallery-item" onclick="loadFromGallery(${i})">
            <img src="${item.url}" alt="${item.prompt}" loading="lazy" />
            <div class="gallery-item-overlay">
                <span class="gallery-item-prompt">${item.prompt}</span>
            </div>
        </div>
    `).join('');
}

// â”€â”€ Gallery: load item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadFromGallery(index) {
    const item = gallery[index];
    if (!item) return;

    currentImageUrl = item.url;
    currentPrompt   = item.prompt;

    document.getElementById('prompt').value              = item.prompt;
    document.getElementById('generated-img').src         = item.url;
    document.getElementById('overlay-prompt').textContent = item.prompt;
    document.getElementById('download-btn').href         = item.url;

    setState('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


