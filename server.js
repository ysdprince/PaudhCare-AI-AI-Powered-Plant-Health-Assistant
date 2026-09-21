/**
 * PaudhCare AI — Node.js Local Server & Gemini Vision API Proxy
 * Supports zero-dependency native Node.js (http, fs, path, https).
 * Usage: node server.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

// Helper to dynamically read GEMINI_API_KEY from .env or process.env
function getGeminiApiKey() {
  const envFile = path.join(__dirname, ".env");
  if (fs.existsSync(envFile)) {
    try {
      const envContent = fs.readFileSync(envFile, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [k, ...v] = trimmed.split("=");
          if (k.trim() === "GEMINI_API_KEY") {
            let val = v.join("=").trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1).trim();
            }
            if (val && val !== "your_gemini_api_key_here" && val !== "PASTE_KEY_HERE" && !val.startsWith("<")) {
              return val;
            }
          }
        }
      }
    } catch (e) {}
  }
  let sysVal = (process.env.GEMINI_API_KEY || "").trim();
  if ((sysVal.startsWith('"') && sysVal.endsWith('"')) || (sysVal.startsWith("'") && sysVal.endsWith("'"))) {
    sysVal = sysVal.slice(1, -1).trim();
  }
  if (sysVal && sysVal !== "your_gemini_api_key_here" && sysVal !== "PASTE_KEY_HERE" && !sysVal.startsWith("<")) {
    return sysVal;
  }
  return "";
}

// Initial .env load for PORT and environment variables
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...v] = trimmed.split("=");
      let val = v.join("=").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      process.env[k.trim()] = val;
    }
  });
  console.log("Loaded environment settings from .env");
}

const PORT = parseInt(process.env.PORT, 10) || 8000;
const initialApiKey = getGeminiApiKey();

if (initialApiKey) {
  console.log("Gemini Vision AI Engine: Configured (API Key detected)");
} else {
  console.log("Gemini Vision API Key: NOT CONFIGURED in .env");
  console.log("  -> Please set GEMINI_API_KEY in .env or via the web UI settings modal.");
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf"
};

const LANG_NAMES = {
  hi: "Hindi (हिन्दी)",
  bn: "Bengali (বাংলা)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  ur: "Urdu (اردو)",
  or: "Odia (ଓଡ଼ିଆ)",
  as: "Assamese (অসমীয়া)",
  en: "English"
};

function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(jsonStr);
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = urlObj.pathname.replace(/^\/+/, "");
  if (!pathname) pathname = "index.html";

  // GET /api/health & GET /health
  if ((pathname === "api/health" || pathname === "health") && (req.method === "GET" || req.method === "HEAD")) {
    const activeKey = getGeminiApiKey();
    return sendJson(res, 200, {
      status: "ok",
      service: "PaudhCare AI Plant Health Platform",
      version: "2.0.0",
      geminiConfigured: !!activeKey,
      port: PORT
    });
  }

  // POST /api/analyze-plant & POST /api/analyze
  if ((pathname === "api/analyze-plant" || pathname === "api/analyze") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Cap at 20MB
      if (body.length > 20 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on("end", async () => {
      try {
        const jsonReq = JSON.parse(body);

        const configuredKey = getGeminiApiKey();
        let effectiveKey = configuredKey;
        if (!effectiveKey && jsonReq.apiKey) {
          let clientKey = jsonReq.apiKey.trim();
          if ((clientKey.startsWith('"') && clientKey.endsWith('"')) || (clientKey.startsWith("'") && clientKey.endsWith("'"))) {
            clientKey = clientKey.slice(1, -1).trim();
          }
          if (clientKey && clientKey !== "your_gemini_api_key_here" && clientKey !== "PASTE_KEY_HERE" && !clientKey.startsWith("<")) {
            effectiveKey = clientKey;
          }
        }

        if (!effectiveKey) {
          return sendJson(res, 200, {
            success: false,
            errorType: "MISSING_KEY",
            message: "AI analysis is not configured yet. Please configure GEMINI_API_KEY in the .env file."
          });
        }

        if (!jsonReq.image) {
          return sendJson(res, 400, {
            success: false,
            errorType: "INVALID_REQUEST",
            message: "No image data provided for analysis."
          });
        }

        const base64Data = jsonReq.image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
        let mimeType = "image/jpeg";
        const mimeMatch = jsonReq.image.match(/^data:(image\/[a-zA-Z]+);base64,/);
        if (mimeMatch) mimeType = mimeMatch[1];

        const targetLang = (jsonReq.language || "en").toLowerCase();
        const langName = LANG_NAMES[targetLang] || "English";

        const systemPrompt = `You are an expert plant pathologist and agronomist AI for PaudhCare AI (a plant health assessment platform supporting SDG 2: Zero Hunger).
Analyze the provided user image carefully.

CRITICAL INSTRUCTIONS:
1. TWO-STAGE EVALUATION:
   Stage 1: Image Validation
   - Determine if the image actually contains a real plant, crop, leaf, or agricultural foliage.
   - If the image depicts a human (selfie/portrait), animal (dog, cat, bird, etc.), vehicle, building, food dish, furniture, screenshot, paper document, or any random non-plant object:
     Set "isPlant": false, "canAnalyze": false, "validationState": "NOT_A_PLANT".
     Provide a clear, polite "rejectionReason" describing what is seen instead of a plant leaf.
     Provide helpful "userGuidance" on photographing a plant.
     Set diagnosis.name to "Analysis Unavailable — Non-Plant Subject".
     Leave symptoms, causes, and treatments empty/null. DO NOT invent or guess any plant disease.
   - If the image depicts a plant, but is too blurry, too dark, out of focus, taken from too far away, heavily obstructed, or foliar symptoms cannot be clearly seen:
     Set "isPlant": true, "canAnalyze": false, "validationState": "LOW_QUALITY" (or "INSUFFICIENT_EVIDENCE").
     Provide a clear "rejectionReason" (e.g. "Image quality is not sufficient for reliable plant-health analysis.") and specific "userGuidance".
     Set diagnosis.name to "Analysis Inconclusive — Low Quality Image".
     DO NOT guess or invent a disease for low quality images.
   
   Stage 2: Plant Identification and Diagnosis (ONLY if isPlant is true AND canAnalyze is true)
   - Identify the ACTUAL plant or crop (e.g., Tomato, Potato, Rice, Wheat, Chilli, Brinjal, Cotton, Maize, Mango, Guava, Rose, Sugarcane, Citrus, Apple, etc.).
     IMPORTANT: DO NOT assume Tomato. Tomato must only be identified if the image is actually a tomato plant. Support all plants equally.
     If the plant type cannot be reliably identified from the image:
     Set plant.commonName = "Plant type could not be reliably identified".
   - Evaluate the foliage for health or disease:
     * If the plant/leaf appears healthy with no significant disease symptoms:
       diagnosis.name = "No obvious disease detected (Healthy Foliage)"
       diagnosis.type = "healthy"
       diagnosis.certainty = "high"
     * If disease or pest symptoms are visible:
       Use cautious, evidence-based terminology: "Possible [Condition Name]" or "Likely [Condition Name]".
       Do NOT claim 100% certainty.
     * If symptoms are ambiguous or insufficient to determine a disease:
       diagnosis.name = "Unable to determine a reliable disease from this image"
       diagnosis.type = "uncertain"
   - Confidence:
     Only provide a numeric confidence between 0 and 100 if the model is genuinely confident based on distinct visual pathology.
     If confidence cannot be reliably determined, set "confidence": null. NEVER fabricate a percentage or random number.
   - Separate Fertilizer from Medicine:
     Fertilizer / Khad guidance must focus strictly on plant nutrition and soil vitality. State clearly that fertilizers are NOT medicines or cures for infectious plant disease.
   - Pesticide and Chemical Safety:
     Do NOT hallucinate chemical concoctions, brand names, or unverified dosages. Always state: "Use a locally approved product according to the official label and consult a qualified agricultural expert."
   - No 100% Diagnostic Claims:
     State clearly that image-based assessment is preliminary decision support, not guaranteed laboratory diagnosis.
   - LANGUAGE LOCALIZATION:
     Target Language: ${langName} (${targetLang}).
     All user-facing text values (rejectionReason, userGuidance, plant.commonName, diagnosis.name, observations, symptoms, possibleCauses, severity, recommendedActions, treatment fields, fertilizerGuidance, whatShouldBeAvoided, prevention, recovery, whatIsThisProblem, damageRisk, howSeriousIsIt, recoveryTime, canItBeFixed, analysisLimitations, whenToConsultExpert, sources) MUST be written in ${langName}.
     Keep technical JSON keys in English.

OUTPUT FORMAT: Strict JSON matching this schema:
{
  "isPlant": boolean,
  "canAnalyze": boolean,
  "imageQuality": "good" | "low_quality" | "blurry" | "dark" | "obstructed",
  "validationState": "VALID_PLANT" | "LOW_QUALITY" | "NOT_A_PLANT" | "INSUFFICIENT_EVIDENCE",
  "rejectionReason": string,
  "userGuidance": string,
  "plant": {
    "commonName": string,
    "scientificName": string
  },
  "diagnosis": {
    "name": string,
    "type": "disease" | "pest" | "nutrient_deficiency" | "environmental_stress" | "healthy" | "uncertain",
    "confidence": number | null,
    "certainty": "high" | "medium" | "low" | "uncertain"
  },
  "observations": [string],
  "symptoms": [string],
  "possibleCauses": [string],
  "severity": string,
  "recommendedActions": [string, string, string, string, string],
  "treatment": {
    "immediate": string,
    "nonChemical": string,
    "biological": string,
    "chemical": string,
    "safety": string
  },
  "fertilizerGuidance": string,
  "whatShouldBeAvoided": string,
  "prevention": [string],
  "recovery": string,
  "whatIsThisProblem": string,
  "damageRisk": string,
  "howSeriousIsIt": string,
  "recoveryTime": string,
  "canItBeFixed": string,
  "needsExpertConfirmation": boolean,
  "analysisLimitations": string,
  "whenToConsultExpert": string,
  "sources": string
}`;

        const payload = JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2
          }
        });

        const candidateModels = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"];

        function callGemini(modelIndex) {
          if (modelIndex >= candidateModels.length) {
            return sendJson(res, 200, {
              success: false,
              errorType: "API_UNAVAILABLE",
              message: "Plant analysis is temporarily unavailable. Please try again."
            });
          }

          const modelName = candidateModels[modelIndex];
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveKey}`;
          const urlParsed = new URL(geminiUrl);

          console.log(`[AI-API] Requesting multimodal vision diagnosis via ${modelName} (Language: ${targetLang})...`);

          const apiReq = https.request(
            {
              hostname: urlParsed.hostname,
              path: urlParsed.pathname + urlParsed.search,
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload)
              },
              timeout: 40000
            },
            (apiRes) => {
              let apiBody = "";
              apiRes.on("data", (c) => (apiBody += c));
              apiRes.on("end", () => {
                if (apiRes.statusCode === 404 || apiRes.statusCode === 503 || apiRes.statusCode === 500 || apiRes.statusCode === 502) {
                  console.warn(`[AI-API] ${modelName} returned ${apiRes.statusCode}, trying next candidate model...`);
                  return callGemini(modelIndex + 1);
                }

                if (apiRes.statusCode === 429) {
                  return sendJson(res, 200, {
                    success: false,
                    errorType: "RATE_LIMIT",
                    message: "AI analysis limit reached. Please try again later."
                  });
                }
                if (apiRes.statusCode === 400 || apiRes.statusCode === 403) {
                  return sendJson(res, 200, {
                    success: false,
                    errorType: "AUTH_ERROR",
                    message: "Invalid or unauthorized GEMINI_API_KEY. Please check your .env settings."
                  });
                }
                if (apiRes.statusCode !== 200) {
                  console.error(`[AI-API] Gemini returned status ${apiRes.statusCode}: ${apiBody}`);
                  return sendJson(res, 200, {
                    success: false,
                    errorType: "API_UNAVAILABLE",
                    message: "Plant analysis is temporarily unavailable. Please try again."
                  });
                }

                try {
                  const parsed = JSON.parse(apiBody);
                  const rawText = parsed.candidates[0].content.parts[0].text;
                  const resultObj = JSON.parse(rawText);
                  console.log(`[AI-API] Success: validationState=${resultObj.validationState}, plant=${resultObj.plant?.commonName}, condition=${resultObj.diagnosis?.name}`);
                  sendJson(res, 200, { success: true, result: resultObj });
                } catch (parseErr) {
                  console.error("[AI-API] Error parsing model response:", parseErr);
                  sendJson(res, 200, {
                    success: false,
                    errorType: "API_UNAVAILABLE",
                    message: "Plant analysis is temporarily unavailable. Please try again."
                  });
                }
              });
            }
          );

          apiReq.on("error", (err) => {
            console.error(`[AI-API] Network error calling ${modelName}:`, err.message);
            callGemini(modelIndex + 1);
          });

          apiReq.on("timeout", () => {
            apiReq.destroy();
            console.warn(`[AI-API] Timeout calling ${modelName}, trying next...`);
            callGemini(modelIndex + 1);
          });

          apiReq.write(payload);
          apiReq.end();
        }

        callGemini(0);
      } catch (err) {
        console.error("[SERVER] Request parsing error:", err);
        sendJson(res, 500, {
          success: false,
          errorType: "INTERNAL_ERROR",
          message: "Server error processing image."
        });
      }
    });
    return;
  }

  // Static File Serving
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  PaudhCare AI — Local Server running at http://localhost:${PORT}/`);
  console.log(`===================================================`);
});
