// ============================================================
//  AI HUB — server.js
//  Ollama  → /api/chat        (AI Chat, Voice, Code)
//  Ollama  → /api/documents/upload  (Document text extraction + AI analysis)
//  ComfyUI → /api/generate-image  (AI Image generation)
// ============================================================
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const axios   = require("axios");
const path    = require("path");
const crypto  = require("crypto");
const fs      = require("fs");


const db = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const documentsRoutes = require("./routes/documentsRoutes");
const customerRoutes = require("./routes/customerRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const pdfParse = require("pdf-parse");
const smartsevaDocumentRoutes = require("./routes/smartsevaDocumentRoutes.JS");


const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use("/api/smartseva-documents", smartsevaDocumentRoutes);



app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/css", express.static(path.join(__dirname, "../css")));
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/memory", memoryRoutes);
const fileRoutes = require("./routes/fileRoutes");
app.use("/api/files", fileRoutes);



// ── Config ────────────────────────────────────────────────────
const OLLAMA_URL   = "http://127.0.0.1:11434";
const OLLAMA_MODEL = "llama3.2:latest";
const COMFY_URL    = "http://127.0.0.1:8188";
const WORKFLOW_FILE = path.join(__dirname, "workflows", "stable-cascade-api.json");

// ════════════════════════════════════════════════════════════
//  OLLAMA — Chat endpoint (used by chat.js, voice.js, code.js)
//  NOTE: Documents go through /api/documents/upload — NOT here.
// ════════════════════════════════════════════════════════════
app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
    }

    try {
        console.log(`📤 Ollama ← ${messages[messages.length - 1]?.content?.slice(0, 60)}…`);

        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model:    OLLAMA_MODEL,
                stream:   false,
                messages: messages.map(m => ({ role: m.role, content: m.content }))
            })
        });

        const rawText = await response.text();

        if (!rawText || rawText.trim() === "") {
            return res.status(502).json({ error: "Ollama returned empty response" });
        }

        const lines = rawText.trim().split("\n").filter(l => l.trim());
        const data  = JSON.parse(lines[lines.length - 1]);
        const reply = data?.message?.content;

        if (!reply) {
            console.error("❌ No content in Ollama response:", data);
            return res.status(502).json({ error: "No reply from Ollama" });
        }

        console.log(`✅ Ollama → ${reply.slice(0, 60)}…`);
        res.json({ reply });

    } catch (err) {
        if (err.message?.includes("ECONNREFUSED")) {
            return res.status(503).json({ error: "Ollama is not running. Start it with: ollama serve" });
        }
        console.error("❌ Ollama error:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// ════════════════════════════════════════════════════════════
//  COMFYUI — Queue image generation
// ════════════════════════════════════════════════════════════
app.post("/api/generate-image", async (req, res) => {
    const { prompt, negativePrompt = "" } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "prompt is required" });
    }

    if (!fs.existsSync(WORKFLOW_FILE)) {
        return res.status(500).json({
            error: `Workflow file not found at: ${WORKFLOW_FILE}`,
            hint:  "Create a 'workflows' folder next to server.js and put stable-cascade-api.json inside it"
        });
    }

    try {
        console.log(`🎨 ComfyUI ← "${prompt.slice(0, 60)}…"`);

        const workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, "utf8"));

        if (workflow["6"]?.inputs) workflow["6"].inputs.text = prompt;
        if (workflow["7"]?.inputs) workflow["7"].inputs.text = negativePrompt;

        const clientId = crypto.randomUUID();

        const queueRes = await axios.post(`${COMFY_URL}/prompt`, {
            prompt:    workflow,
            client_id: clientId
        });

        const promptId = queueRes.data.prompt_id;
        console.log(`✅ ComfyUI queued — prompt_id: ${promptId}`);

        res.json({
            success:   true,
            prompt_id: promptId,
            client_id: clientId,
            message:   "Image queued in ComfyUI"
        });

    } catch (err) {
        if (err.code === "ECONNREFUSED") {
            return res.status(503).json({
                error: "ComfyUI is not running.",
                hint:  "Start ComfyUI and make sure it runs at http://127.0.0.1:8188"
            });
        }
        console.error("❌ ComfyUI error:", err.response?.data || err.message);
        res.status(500).json({
            error:   "ComfyUI image generation failed",
            details: err.response?.data || err.message
        });
    }
});

// ════════════════════════════════════════════════════════════
//  COMFYUI — Poll image status
// ════════════════════════════════════════════════════════════
app.get("/api/image-status/:promptId", async (req, res) => {
    const { promptId } = req.params;

    try {
        const histRes = await axios.get(`${COMFY_URL}/history/${promptId}`);
        const history = histRes.data[promptId];

        if (!history) {
            return res.json({ status: "pending", message: "Still generating…" });
        }

        if (history.status?.completed) {
            const outputs = history.outputs;
            const images = [];

            for (const nodeId in outputs) {
                const nodeOut = outputs[nodeId];
                if (nodeOut.images) {
                    for (const img of nodeOut.images) {
                        images.push({
                            url:      `/api/image-file?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`,
                            filename: img.filename
                        });
                    }
                }
            }

            console.log(`✅ ComfyUI image ready — ${images.length} image(s)`);
            return res.json({ status: "complete", images });
        }

        res.json({ status: "processing", message: "ComfyUI is generating…" });

    } catch (err) {
        console.error("❌ Status check error:", err.message);
        res.status(500).json({ error: "Could not check image status" });
    }
});

// ════════════════════════════════════════════════════════════
//  COMFYUI — Serve generated image file
// ════════════════════════════════════════════════════════════
app.get("/api/image-file", async (req, res) => {
    const { filename, subfolder = "", type = "output" } = req.query;

    try {
        const imgRes = await axios.get(`${COMFY_URL}/view`, {
            params:       { filename, subfolder, type },
            responseType: "arraybuffer"
        });

        res.set("Content-Type", "image/png");
        res.send(imgRes.data);

    } catch (err) {
        console.error("❌ Image fetch error:", err.message);
        res.status(500).json({ error: "Could not fetch image from ComfyUI" });
    }
});

// ════════════════════════════════════════════════════════════
//  COMFYUI — Get queue status
// ════════════════════════════════════════════════════════════
app.get("/api/queue-status", async (req, res) => {
    try {
        const queueRes = await axios.get(`${COMFY_URL}/queue`);
        const running = queueRes.data.queue_running?.length || 0;
        const pending = queueRes.data.queue_pending?.length || 0;
        res.json({ running, pending, total: running + pending });
    } catch (err) {
        res.status(503).json({ error: "ComfyUI not reachable" });
    }
});

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
    const health = { server: "ok", ollama: "unknown", comfyui: "unknown" };

    try {
        const r = await fetch(`${OLLAMA_URL}/api/tags`);
        health.ollama = r.ok ? "ok" : "error";
    } catch { health.ollama = "offline"; }

    try {
        const r = await axios.get(`${COMFY_URL}/system_stats`, { timeout: 2000 });
        health.comfyui = r.status === 200 ? "ok" : "error";
    } catch { health.comfyui = "offline"; }

    res.json(health);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Start ──────────────────────────────────────────────────────
async function startServer() {
    try {
        await db.query("SELECT 1");
        console.log("✅ MariaDB Connected");

        app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ AI HUB running at http://10.230.22.186:${PORT}`);
    console.log(`   Ollama  → ${OLLAMA_URL}`);
    console.log(`   ComfyUI → ${COMFY_URL}`);
    console.log(`   Health  → http://10.230.22.186:${PORT}/api/health`);
});

    } catch (err) {
        console.error("❌ Database Connection Failed");
        console.error(err);
    }
}

startServer();
