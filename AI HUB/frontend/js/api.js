// ============================================================
// AI HUB - CENTRAL API CONFIGURATION
// ============================================================

const AI_HUB_LOCAL_API = "http://10.143.172.186:3000";

// IMPORTANT:
// Replace this later with your deployed HTTPS backend.
// Example:
// const AI_HUB_PUBLIC_API = "https://api.aihub.com";
const AI_HUB_PUBLIC_API = "https://YOUR-PUBLIC-BACKEND-URL";

function getApiBase() {

    const hostname = window.location.hostname;

    // Running directly from laptop
    if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "10.143.172.186"
    ) {
        return AI_HUB_LOCAL_API;
    }

    // GitHub Pages / public website
    return AI_HUB_PUBLIC_API;
}

const API_BASE = getApiBase();

console.log("AI HUB API:", API_BASE);



