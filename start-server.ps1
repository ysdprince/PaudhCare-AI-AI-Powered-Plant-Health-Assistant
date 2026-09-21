# PaudhCare AI - Local Server & Gemini Multimodal Vision Proxy
param(
    [int]$Port = 8000,
    [switch]$NoBrowser = $false
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "===================================================" -ForegroundColor Green
Write-Host "  PaudhCare AI - Plant Health Assessment Platform" -ForegroundColor Green
Write-Host "  Zero Hunger Initiative | Real AI Vision Pipeline" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Ensure script working directory is current directory
if ($PSScriptRoot) {
    Set-Location -Path $PSScriptRoot
}

# Dynamic .env file and environment variable helpers
function Get-GeminiApiKey {
    $envFile = Join-Path $PSScriptRoot ".env"
    if (Test-Path $envFile) {
        try {
            $lines = Get-Content $envFile -Encoding utf8 -ErrorAction SilentlyContinue
            foreach ($line in $lines) {
                $trimmed = $line.Trim()
                if ($trimmed -and -not $trimmed.StartsWith("#") -and $trimmed.Contains("=")) {
                    $parts = $trimmed.Split("=", 2)
                    $k = $parts[0].Trim()
                    $v = $parts[1].Trim()
                    if ($k -eq "GEMINI_API_KEY") {
                        if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
                            if ($v.Length -ge 2) { $v = $v.Substring(1, $v.Length - 2).Trim() }
                        }
                        if ($v -and $v -ne "your_gemini_api_key_here" -and $v -ne "PASTE_KEY_HERE" -and -not $v.StartsWith("<")) {
                            return $v
                        }
                    }
                }
            }
        } catch {}
    }
    $sysVal = [System.Environment]::GetEnvironmentVariable("GEMINI_API_KEY")
    if ($sysVal) {
        $sysVal = $sysVal.Trim()
        if (($sysVal.StartsWith('"') -and $sysVal.EndsWith('"')) -or ($sysVal.StartsWith("'") -and $sysVal.EndsWith("'"))) {
            if ($sysVal.Length -ge 2) { $sysVal = $sysVal.Substring(1, $sysVal.Length - 2).Trim() }
        }
        if ($sysVal -and $sysVal -ne "your_gemini_api_key_here" -and $sysVal -ne "PASTE_KEY_HERE" -and -not $sysVal.StartsWith("<")) {
            return $sysVal
        }
    }
    return ""
}

function Get-PlantNetApiKey {
    $envFile = Join-Path $PSScriptRoot ".env"
    if (Test-Path $envFile) {
        try {
            $lines = Get-Content $envFile -Encoding utf8 -ErrorAction SilentlyContinue
            foreach ($line in $lines) {
                $trimmed = $line.Trim()
                if ($trimmed -and -not $trimmed.StartsWith("#") -and $trimmed.Contains("=")) {
                    $parts = $trimmed.Split("=", 2)
                    if ($parts[0].Trim() -eq "PLANTNET_API_KEY") {
                        $v = $parts[1].Trim()
                        if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
                            if ($v.Length -ge 2) { $v = $v.Substring(1, $v.Length - 2).Trim() }
                        }
                        if ($v -and $v -ne "your_plantnet_api_key_here") { return $v }
                    }
                }
            }
        } catch {}
    }
    $sysVal = [System.Environment]::GetEnvironmentVariable("PLANTNET_API_KEY")
    if ($sysVal) {
        $sysVal = $sysVal.Trim()
        if (($sysVal.StartsWith('"') -and $sysVal.EndsWith('"')) -or ($sysVal.StartsWith("'") -and $sysVal.EndsWith("'"))) {
            if ($sysVal.Length -ge 2) { $sysVal = $sysVal.Substring(1, $sysVal.Length - 2).Trim() }
        }
        if ($sysVal -and $sysVal -ne "your_plantnet_api_key_here") { return $sysVal }
    }
    return ""
}

# Initial .env parse for PORT and initial environment setup
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile -Encoding utf8 | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                if ($val.Length -ge 2) { $val = $val.Substring(1, $val.Length - 2).Trim() }
            }
            [System.Environment]::SetEnvironmentVariable($key, $val)
        }
    }
    Write-Host "Loaded environment settings from .env" -ForegroundColor Cyan
}

$envPort = [System.Environment]::GetEnvironmentVariable("PORT")
if ($envPort -and [int]::TryParse($envPort, [ref]$Port)) {
    # Port overridden by .env
}

$initialKey = Get-GeminiApiKey
$initialPlantNet = Get-PlantNetApiKey

if ($initialKey -and $initialKey.Length -gt 0) {
    Write-Host "Gemini Vision AI Engine: Configured (API Key detected)" -ForegroundColor Green
} else {
    Write-Host "Gemini Vision API Key: NOT CONFIGURED in .env" -ForegroundColor Yellow
    Write-Host "  -> To enable live Gemini AI diagnosis, add your key to .env:" -ForegroundColor Yellow
    Write-Host "     GEMINI_API_KEY=AIzaSy..." -ForegroundColor Gray
    Write-Host "  -> Or configure it in the browser UI via 'AI Model Settings'." -ForegroundColor Yellow
}

if ($initialPlantNet -and $initialPlantNet.Length -gt 0) {
    Write-Host "PlantNet Species Cross-Check: Configured" -ForegroundColor Green
}

$urlLocalhost = "http://localhost:$Port/"
$urlLoopback  = "http://127.0.0.1:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($urlLocalhost)
$listener.Prefixes.Add($urlLoopback)

# Helper function to send JSON responses with proper headers and safe close
function Send-JsonResponse($respObj, $statusCode, $object) {
    try {
        $jsonStr = $object | ConvertTo-Json -Depth 10 -Compress
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
        $respObj.ContentType = "application/json; charset=utf-8"
        $respObj.StatusCode = $statusCode
        $respObj.AddHeader("Access-Control-Allow-Origin", "*")
        $respObj.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        $respObj.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept")
        $respObj.ContentLength64 = $buffer.Length
        $respObj.OutputStream.Write($buffer, 0, $buffer.Length)
        $respObj.OutputStream.Flush()
    } catch {
        # Catch and ignore stream errors on client disconnect
    } finally {
        try { $respObj.Close() } catch {}
    }
}

# Helper function to send static file responses safely
function Send-FileResponse($respObj, $statusCode, $contentType, $fileBytes) {
    try {
        $respObj.ContentType = $contentType
        $respObj.StatusCode = $statusCode
        $respObj.AddHeader("Access-Control-Allow-Origin", "*")
        $respObj.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        $respObj.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept")
        $respObj.ContentLength64 = $fileBytes.Length
        $respObj.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
        $respObj.OutputStream.Flush()
    } catch {
        # Catch and ignore stream errors on client disconnect
    } finally {
        try { $respObj.Close() } catch {}
    }
}

try {
    $listener.Start()
    Write-Host "Local Server running at: $urlLocalhost ($urlLoopback)" -ForegroundColor Green
    Write-Host "Health Check: ${urlLocalhost}api/health" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray

    # Launch browser to application URL if not disabled
    if (-not $NoBrowser) {
        try { Start-Process $urlLocalhost -ErrorAction SilentlyContinue } catch {}
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS preflight
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept")
            $response.StatusCode = 200
            try { $response.Close() } catch {}
            continue
        }

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if (-not $rawPath) { $rawPath = "index.html" }

        # =====================================================================
        # HEALTH CHECK ENDPOINT: GET /api/health or GET /health
        # =====================================================================
        if (($rawPath -eq "api/health" -or $rawPath -eq "health") -and ($request.HttpMethod -eq "GET" -or $request.HttpMethod -eq "HEAD")) {
            $activeKey = Get-GeminiApiKey
            $activePlantNet = Get-PlantNetApiKey
            Send-JsonResponse $response 200 @{
                status = "ok"
                service = "PaudhCare AI Plant Health Assessment Platform"
                version = "2.0.0"
                geminiConfigured = [bool]($activeKey -and $activeKey.Length -gt 0)
                plantNetConfigured = [bool]($activePlantNet -and $activePlantNet.Length -gt 0)
                port = $Port
            }
            continue
        }

        # =====================================================================
        # REAL MULTIMODAL PLANT ANALYSIS API: POST /api/analyze-plant & /api/analyze
        # =====================================================================
        if (($rawPath -eq "api/analyze-plant" -or $rawPath -eq "api/analyze") -and $request.HttpMethod -eq "POST") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $bodyText = $reader.ReadToEnd()
                $jsonReq = $bodyText | ConvertFrom-Json

                # Effective API Key: check .env dynamically first, then request payload
                $effectiveKey = Get-GeminiApiKey
                if (-not $effectiveKey -and $jsonReq.apiKey -and $jsonReq.apiKey.ToString().Trim().Length -gt 0) {
                    $candidateKey = $jsonReq.apiKey.ToString().Trim()
                    if (($candidateKey.StartsWith('"') -and $candidateKey.EndsWith('"')) -or ($candidateKey.StartsWith("'") -and $candidateKey.EndsWith("'"))) {
                        if ($candidateKey.Length -ge 2) { $candidateKey = $candidateKey.Substring(1, $candidateKey.Length - 2).Trim() }
                    }
                    if ($candidateKey -and $candidateKey -ne "your_gemini_api_key_here" -and $candidateKey -ne "PASTE_KEY_HERE" -and -not $candidateKey.StartsWith("<")) {
                        $effectiveKey = $candidateKey
                    }
                }

                # Verify API Key is present and valid
                if (-not $effectiveKey -or $effectiveKey.Length -eq 0) {
                    Send-JsonResponse $response 200 @{
                        success = $false
                        errorType = "MISSING_KEY"
                        message = "AI analysis is not configured yet. Please configure GEMINI_API_KEY in the .env file."
                    }
                    continue
                }

                # Validate image input
                if (-not $jsonReq.image) {
                    Send-JsonResponse $response 400 @{
                        success = $false
                        errorType = "INVALID_REQUEST"
                        message = "No image data provided for analysis."
                    }
                    continue
                }

                # Parse base64 and MIME type
                $base64Data = $jsonReq.image -replace '^data:image\/[a-zA-Z]+;base64,', ''
                $mimeType = "image/jpeg"
                if ($jsonReq.image -match '^data:(image\/[a-zA-Z]+);base64,') {
                    $mimeType = $matches[1]
                }

                # Language name mapping for prompt localization (Pure ASCII keys and values)
                $targetLang = if ($jsonReq.language) { $jsonReq.language.ToString().ToLower() } else { "en" }
                $langNames = @{
                    "hi" = "Hindi"; "bn" = "Bengali"; "te" = "Telugu";
                    "ta" = "Tamil"; "mr" = "Marathi"; "gu" = "Gujarati";
                    "kn" = "Kannada"; "ml" = "Malayalam"; "pa" = "Punjabi";
                    "ur" = "Urdu"; "or" = "Odia"; "as" = "Assamese";
                    "en" = "English"
                }
                $langName = if ($langNames.ContainsKey($targetLang)) { $langNames[$targetLang] } else { "English" }

                # Optional PlantNet species identification cross-check
                $plantNetKey = Get-PlantNetApiKey
                $plantNetHint = ""
                if ($plantNetKey -and $plantNetKey.Length -gt 0) {
                    try {
                        $pnBytes = [Convert]::FromBase64String($base64Data)
                        $pnBoundary = [System.Guid]::NewGuid().ToString()
                        $pnUrl = "https://my-api.plantnet.org/v2/identify/all?api-key=$plantNetKey"
                        
                        $pnReq = [System.Net.HttpWebRequest]::Create($pnUrl)
                        $pnReq.Method = "POST"
                        $pnReq.ContentType = "multipart/form-data; boundary=$pnBoundary"
                        $pnReq.Timeout = 8000

                        $pnStream = $pnReq.GetRequestStream()
                        $pnHeader = "--$pnBoundary`r`nContent-Disposition: form-data; name=`"images`"; filename=`"leaf.jpg`"`r`nContent-Type: image/jpeg`r`n`r`n"
                        $pnHeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($pnHeader)
                        $pnStream.Write($pnHeaderBytes, 0, $pnHeaderBytes.Length)
                        $pnStream.Write($pnBytes, 0, $pnBytes.Length)
                        $pnFooter = "`r`n--$pnBoundary--`r`n"
                        $pnFooterBytes = [System.Text.Encoding]::ASCII.GetBytes($pnFooter)
                        $pnStream.Write($pnFooterBytes, 0, $pnFooterBytes.Length)
                        $pnStream.Close()

                        $pnResp = $pnReq.GetResponse()
                        $pnReader = New-Object System.IO.StreamReader($pnResp.GetResponseStream())
                        $pnJson = $pnReader.ReadToEnd() | ConvertFrom-Json
                        if ($pnJson.results -and $pnJson.results.Count -gt 0) {
                            $bestMatch = $pnJson.results[0]
                            $scientific = $bestMatch.species.scientificNameWithoutAuthor
                            $common = if ($bestMatch.species.commonNames -and $bestMatch.species.commonNames.Count -gt 0) { $bestMatch.species.commonNames[0] } else { $scientific }
                            $score = [Math]::Round($bestMatch.score * 100, 1)
                            $plantNetHint = "PlantNet independent species signal: $common ($scientific) with $score% confidence."
                            Write-Host "PlantNet Signal: $plantNetHint" -ForegroundColor Cyan
                        }
                    } catch {
                        Write-Host "PlantNet API skipped or timed out: $($_.Exception.Message)" -ForegroundColor DarkGray
                    }
                }

                # Construct Two-Stage Gemini Vision Prompt
                $systemPrompt = @"
You are an expert plant pathologist and agronomist AI for PaudhCare AI (a plant health assessment platform supporting SDG 2: Zero Hunger).
Analyze the provided user image carefully.

CRITICAL INSTRUCTIONS:
1. TWO-STAGE EVALUATION:
   Stage 1: Image Validation
   - Determine if the image actually contains a real plant, crop, leaf, or agricultural foliage.
   - If the image depicts a human (selfie/portrait), animal (dog, cat, bird, etc.), vehicle, building, food dish, furniture, screenshot, paper document, or any random non-plant object:
     Set "isPlant": false, "canAnalyze": false, "validationState": "NOT_A_PLANT".
     Provide a clear, polite "rejectionReason" describing what is seen instead of a plant leaf.
     Provide helpful "userGuidance" on photographing a plant.
     Set diagnosis.name to "Analysis Unavailable - Non-Plant Subject".
     Leave symptoms, causes, and treatments empty/null. DO NOT invent or guess any plant disease.
   - If the image depicts a plant, but is too blurry, too dark, out of focus, taken from too far away, heavily obstructed, or foliar symptoms cannot be clearly seen:
     Set "isPlant": true, "canAnalyze": false, "validationState": "LOW_QUALITY" (or "INSUFFICIENT_EVIDENCE").
     Provide a clear "rejectionReason" (e.g. "Image quality is not sufficient for reliable plant-health analysis.") and specific "userGuidance".
     Set diagnosis.name to "Analysis Inconclusive - Low Quality Image".
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
       diagnosis.certainty = "high" or "medium"
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
     Fertilizer guidance must focus strictly on plant nutrition and soil vitality. State clearly that fertilizers are NOT medicines or cures for infectious plant disease.
   - Pesticide and Chemical Safety:
     Do NOT hallucinate chemical concoctions, brand names, or unverified dosages. Always state: "Use a locally approved product according to the official label and consult a qualified agricultural expert."
   - No 100% Diagnostic Claims:
     State clearly that image-based assessment is preliminary decision support, not guaranteed laboratory diagnosis.
   - LANGUAGE LOCALIZATION:
     Target Language: $langName ($targetLang).
     All user-facing text values (rejectionReason, userGuidance, plant.commonName, diagnosis.name, observations, symptoms, possibleCauses, severity, recommendedActions, treatment fields, fertilizerGuidance, whatShouldBeAvoided, prevention, recovery, whatIsThisProblem, damageRisk, howSeriousIsIt, recoveryTime, canItBeFixed, analysisLimitations, whenToConsultExpert, sources) MUST be written in $langName.
     Keep technical JSON keys in English.
$plantNetHint

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
  "observations": [string, ...],
  "symptoms": [string, ...],
  "possibleCauses": [string, ...],
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
  "prevention": [string, ...],
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
}
"@

                $payload = @{
                    contents = @(
                        @{
                            parts = @(
                                @{ text = $systemPrompt },
                                @{
                                    inline_data = @{
                                        mime_type = $mimeType
                                        data = $base64Data
                                    }
                                }
                            )
                        }
                    )
                    generationConfig = @{
                        response_mime_type = "application/json"
                        temperature = 0.2
                    }
                } | ConvertTo-Json -Depth 8

                # Candidate multimodal vision models in priority order
                $candidateModels = @("gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash")
                $apiRes = $null
                $lastStatus = 500
                $lastErrMsg = ""

                foreach ($modelName in $candidateModels) {
                    $geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=$effectiveKey"
                    Write-Host "[AI-API] Requesting multimodal vision diagnosis via $modelName (Language: $targetLang)..." -ForegroundColor Yellow
                    try {
                        $apiRes = Invoke-RestMethod -Uri $geminiUrl -Method Post -Body $payload -ContentType "application/json; charset=utf-8" -TimeoutSec 40
                        if ($apiRes -and $apiRes.candidates -and $apiRes.candidates.Count -gt 0) {
                            Write-Host "[AI-API] Success with $modelName" -ForegroundColor Green
                            break
                        }
                    } catch {
                        $lastErrMsg = $_.Exception.Message
                        $status = 500
                        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
                            $status = $_.Exception.Response.StatusCode.value__
                        }
                        $lastStatus = $status
                        Write-Host "[AI-API] $modelName returned status $status - $lastErrMsg" -ForegroundColor DarkYellow
                        # For 400/403 (invalid key / auth failure) or 429 (quota rate limit exceeded), do not retry other models
                        if ($status -eq 400 -or $status -eq 403 -or $status -eq 429) {
                            break
                        }
                        # For 404 (model deprecated) or 503/500/502 (temporary capacity spike), try next candidate model
                    }
                }

                if ($apiRes -and $apiRes.candidates -and $apiRes.candidates.Count -gt 0) {
                    $rawText = $apiRes.candidates[0].content.parts[0].text
                    
                    # Parse and sanitize returned JSON
                    $parsedResult = $rawText | ConvertFrom-Json
                    Write-Host "[AI-API] Assessment complete: validationState=$($parsedResult.validationState), plant=$($parsedResult.plant.commonName), diagnosis=$($parsedResult.diagnosis.name)" -ForegroundColor Green

                    Send-JsonResponse $response 200 @{
                        success = $true
                        result = $parsedResult
                    }
                } else {
                    Write-Host "[AI-API] All candidate Gemini models failed (Last Status: $lastStatus): $lastErrMsg" -ForegroundColor Red
                    
                    if ($lastStatus -eq 429) {
                        Send-JsonResponse $response 200 @{
                            success = $false
                            errorType = "RATE_LIMIT"
                            message = "AI analysis limit reached. Please try again later."
                        }
                    } elseif ($lastStatus -eq 400 -or $lastStatus -eq 403) {
                        Send-JsonResponse $response 200 @{
                            success = $false
                            errorType = "AUTH_ERROR"
                            message = "Invalid or unauthorized GEMINI_API_KEY. Please check your .env settings."
                        }
                    } else {
                        Send-JsonResponse $response 200 @{
                            success = $false
                            errorType = "API_UNAVAILABLE"
                            message = "Plant analysis is temporarily unavailable. Please try again."
                        }
                    }
                }
            } catch {
                Write-Host "[SERVER ERROR] $($_.Exception.Message)" -ForegroundColor Red
                Send-JsonResponse $response 500 @{
                    success = $false
                    errorType = "INTERNAL_ERROR"
                    message = "Server error processing image. Please try again."
                }
            }
            continue
        }

        # =====================================================================
        # STATIC FILE SERVING
        # =====================================================================
        $filePath = Join-Path $PSScriptRoot $rawPath
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentTypes = @{
                ".html" = "text/html; charset=utf-8"
                ".css"  = "text/css; charset=utf-8"
                ".js"   = "application/javascript; charset=utf-8"
                ".json" = "application/json; charset=utf-8"
                ".svg"  = "image/svg+xml"
                ".png"  = "image/png"
                ".jpg"  = "image/jpeg"
                ".jpeg" = "image/jpeg"
                ".webp" = "image/webp"
                ".ico"  = "image/x-icon"
                ".pdf"  = "application/pdf"
            }
            $cType = if ($contentTypes.ContainsKey($ext)) { $contentTypes[$ext] } else { "application/octet-stream" }
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            Send-FileResponse $response 200 $cType $fileBytes
        } else {
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            Send-FileResponse $response 404 "text/plain; charset=utf-8" $notFoundBytes
        }
    }
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
        Write-Host "Server stopped." -ForegroundColor Yellow
    }
}
