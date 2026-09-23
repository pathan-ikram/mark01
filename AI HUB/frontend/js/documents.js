const API_BASE = "http://10.230.22.186:3000/api";

let documents = [];
let selectedDocId = null;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
});

// ── Load document history from backend ──────────────────────
async function loadHistory() {
    try {
        const res = await fetch(`${API_BASE}/documents/history`);
        const data = await res.json();

        if (!data.success) {
            showToast(data.message || "Failed to load documents", "error");
            return;
        }

        documents = data.documents;
        renderDocList();
        updateStats();
    } catch (err) {
        showToast("Could not reach server. Is the backend running?", "error");
    }
}

// ── Render document list ─────────────────────────────────────
function renderDocList() {
    const container = document.getElementById("doc-list");
    const countBadge = document.getElementById("all-count");

    if (countBadge) countBadge.textContent = documents.length;

    if (!container) return;

    if (documents.length === 0) {
        container.innerHTML = `
            <div class="empty-docs">
                <div class="empty-icon">📄</div>
                <h3>No documents yet</h3>
                <p>Upload a file or create a new document to get started</p>
                <button class="btn btn-primary" onclick="switchTab('create', null)">✏️ Create Document</button>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    documents.forEach((doc) => {
        const ext = (doc.original_name.split(".").pop() || "").toLowerCase();
        const iconClass = ext === "pdf" ? "pdf" : ext === "csv" ? "csv" :
                           (ext === "doc" || ext === "docx") ? "doc" : "txt";

        const sizeKB = (doc.file_size / 1024).toFixed(0);
        const date = new Date(doc.upload_date).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        });

        const item = document.createElement("div");
        item.className = "doc-item";
        item.dataset.id = doc.id;
        item.innerHTML = `
            <div class="doc-icon ${iconClass}">📄</div>
            <div class="doc-info">
                <div class="doc-name">${escapeHtml(doc.original_name)}</div>
                <div class="doc-meta">${date} · ${sizeKB} KB</div>
            </div>
            <div class="doc-actions">
                <button class="doc-btn" onclick="event.stopPropagation(); openDocument(${doc.id})">Analyze</button>
                <button class="doc-btn del" onclick="event.stopPropagation(); deleteDocument(${doc.id})">Delete</button>
            </div>
        `;
        item.addEventListener("click", () => openDocument(doc.id));
        container.appendChild(item);
    });
}

// ── Stats ─────────────────────────────────────────────────────
function updateStats() {
    const totalEl = document.getElementById("stat-total");
    const wordsEl = document.getElementById("stat-words");
    const analyzedEl = document.getElementById("stat-analyzed");

    if (totalEl) totalEl.textContent = documents.length;
    if (analyzedEl) analyzedEl.textContent = documents.length; // every saved doc has analysis

    if (wordsEl) {
        // Word count needs extracted_text, which history doesn't include (by design).
        // Leaving at 0 unless a document is opened; updated in openDocument().
        wordsEl.textContent = wordsEl.textContent || "0";
    }
}

// ── File upload (input + drag/drop) ─────────────────────────
function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    uploadFiles(files);
    event.target.value = ""; // allow re-uploading same file later
}

function dragOver(event) {
    event.preventDefault();
    const zone = document.getElementById("upload-zone");
    if (zone) zone.classList.add("drag-over");
}

function dragLeave(event) {
    const zone = document.getElementById("upload-zone");
    if (zone) zone.classList.remove("drag-over");
}

function dropFile(event) {
    event.preventDefault();
    const zone = document.getElementById("upload-zone");
    if (zone) zone.classList.remove("drag-over");

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        uploadFiles(files);
    }
}

async function uploadFiles(fileList) {
    for (const file of fileList) {
        await uploadSingleFile(file);
    }
    await loadHistory();
}

async function uploadSingleFile(file) {
    showToast(`Uploading ${file.name}…`, "info");

    const formData = new FormData();
    formData.append("document", file);

    try {
        const res = await fetch(`${API_BASE}/documents/upload`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!data.success) {
            showToast(`${file.name}: ${data.message}`, "error");
            return;
        }

        showToast(`${file.name} uploaded and analyzed`, "success");
    } catch (err) {
        showToast(`Failed to upload ${file.name}`, "error");
    }
}

// ── Open a document → load full detail + analysis ───────────
async function openDocument(id) {
    selectedDocId = id;

    try {
        const res = await fetch(`${API_BASE}/documents/${id}`);
        const data = await res.json();

        if (!data.success) {
            showToast(data.message || "Could not load document", "error");
            return;
        }

        const doc = data.document;

        // Update word count stat from extracted text
        const wordsEl = document.getElementById("stat-words");
        if (wordsEl && doc.extracted_text) {
            wordsEl.textContent = doc.extracted_text.trim().split(/\s+/).length;
        }

        // Put extracted text into the editor textarea, if present
        const editor = document.querySelector(".doc-editor");
        if (editor) editor.value = doc.extracted_text || "";

        renderAnalysis(doc.analysis);

        switchTab("workspace", null);
        highlightSelectedDoc(id);
    } catch (err) {
        showToast("Error loading document", "error");
    }
}

function highlightSelectedDoc(id) {
    document.querySelectorAll(".doc-item").forEach((el) => {
        el.classList.toggle("selected", Number(el.dataset.id) === Number(id));
    });
}

function renderAnalysis(analysis) {
    const output = document.getElementById("ai-output");
    if (!output || !analysis) return;

    output.classList.remove("placeholder");

    const lines = [];
    for (const [key, value] of Object.entries(analysis)) {
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        if (Array.isArray(value)) {
            lines.push(`${label}:\n` + value.map((v) => `  • ${v}`).join("\n"));
        } else {
            lines.push(`${label}: ${value}`);
        }
    }
    output.textContent = lines.join("\n\n");
}

// ── Delete document ──────────────────────────────────────────
async function deleteDocument(id) {
    if (!confirm("Delete this document? This cannot be undone.")) return;

    try {
        const res = await fetch(`${API_BASE}/documents/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (!data.success) {
            showToast(data.message || "Could not delete document", "error");
            return;
        }

        showToast("Document deleted", "success");
        await loadHistory();
    } catch (err) {
        showToast("Delete failed — check backend has a DELETE route", "error");
    }
}

// ── AI Workspace actions (correct, simplify, translate, etc.) ─
// Uses /api/chat with the currently selected document's text.
async function aiAction(type) {
    if (!selectedDocId) {
        showToast("Select a document first", "error");
        return;
    }

    const editor = document.querySelector(".doc-editor");
    const text = editor ? editor.value : "";

    if (!text.trim()) {
        showToast("No document text to work with", "error");
        return;
    }

    const instructions = {
        correct: "Correct all grammar, spelling, and punctuation errors in the following text. Return only the corrected text.",
        extract: "Extract the key points, important facts, and main ideas from the following text as a bullet list.",
        arrange: "Rearrange and format the following text for clarity, using headings and structure where useful.",
        expand: "Expand the following text with more detail and explanation, keeping the same meaning.",
        simplify: "Rewrite the following text in simple, easy-to-understand language.",
        translate: "Translate the following text to Hindi.",
        title: "Generate a short, clear title for the following text. Return only the title."
    };

    const instruction = instructions[type] || "Analyze the following text.";

    const output = document.getElementById("ai-output");
    if (output) {
        output.classList.remove("placeholder");
        output.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    }

    try {
        const res = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "user", content: `${instruction}\n\n${text}` }
                ]
            })
        });

        const data = await res.json();

        if (data.error) {
            if (output) output.textContent = `Error: ${data.error}`;
            showToast(data.error, "error");
            return;
        }

        if (output) output.textContent = data.reply;
    } catch (err) {
        if (output) output.textContent = "Request failed.";
        showToast("AI request failed", "error");
    }
}

// ── Output actions ───────────────────────────────────────────
function copyOutput() {
    const output = document.getElementById("ai-output");
    if (!output) return;
    navigator.clipboard.writeText(output.textContent);
    showToast("Copied to clipboard", "success");
}

function applyOutput() {
    const output = document.getElementById("ai-output");
    const editor = document.querySelector(".doc-editor");
    if (!output || !editor) return;
    editor.value = output.textContent;
    showToast("Applied to editor", "success");
}

function saveAsNew() {
    showToast("Save as new document is not implemented yet", "info");
}

// ── Tabs & sidebar ────────────────────────────────────────────
function switchTab(name, btn) {
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));

    const panel = document.getElementById(`tab-${name}`);
    if (panel) panel.classList.add("active");
    if (btn) btn.classList.add("active");
}

function switchSidebar(name, btn) {
    document.querySelectorAll(".sidebar-btn").forEach((b) => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (name === "recent") switchTab("create", null);
    else if (["analyze", "correct", "arrange", "summarize"].includes(name)) switchTab("workspace", null);
    else switchTab("docs", null);
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ── Utility ───────────────────────────────────────────────────
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function clearAll() {
    if (!confirm("Delete ALL documents? This cannot be undone.")) return;
    showToast("Bulk delete not implemented yet — delete documents individually for now", "info");
}