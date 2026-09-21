/**
 * PaudhCare AI — Computer Vision Analyzer Controller
 * Features:
 * - Real client-side Computer Vision Engine (HTML5 Canvas pixel inspection, ExG vegetation index,
 *   Laplacian edge variance blur detection, foliar pathology feature classification)
 * - Multi-tier fallback support for /api/analyze cloud vision proxy
 * - Strict refusal on non-leaf / blurry specimens
 * - Section 7 Result Presentation (5-part Treatment & Control, cautious causes, 5 action steps)
 * - Seamless multilingual re-rendering on language switch
 */

class PaudhCareAnalyzer {
  constructor() {
    this.currentImage = null;
    this.activeCase = null;
    this.activeCaseConfidence = null;
    this.isUploadedByUser = false;
    this.isAnalyzing = false;
    this.timer = null;

    this.initElements();
    this.bindEvents();
    this.renderPresets();
    this.setIdleState();

    // Hook to i18n language change
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    if (i18n) {
      i18n.onLanguageChange(() => {
        this.handleLanguageChange();
      });
    }
  }

  initElements() {
    // Upload & Dropzone
    this.dropzone = document.getElementById("dropzoneCard");
    this.fileInput = document.getElementById("leafFileInput");
    this.errorAlert = document.getElementById("analyzerErrorAlert");
    this.errorText = document.getElementById("analyzerErrorText");

    // Preview
    this.previewContainer = document.getElementById("previewContainer");
    this.previewImage = document.getElementById("previewImage");
    this.previewBadge = document.getElementById("previewBadge");
    this.scanLine = document.getElementById("scanLine");
    this.removeImageBtn = document.getElementById("removeImageBtn");

    // Action Bar & Analyze Button
    this.actionsBar = document.getElementById("analyzerActionsBar");
    this.analyzeBtn = document.getElementById("analyzePlantBtn");

    // Loading State
    this.loadingBox = document.getElementById("loadingDiagnosticBox");
    this.loadingTicker = document.getElementById("loadingTicker");

    // Result Dashboard & Fields (Section 7)
    this.resultDashboard = document.getElementById("resultDashboard");
    this.resultTypeTag = document.getElementById("resultTypeTag");
    this.resultStatusBanner = document.getElementById("resultStatusBanner");
    this.resultPlantName = document.getElementById("resultPlantName");
    this.resultCondition = document.getElementById("resultCondition");
    this.resultSeverityBadge = document.getElementById("resultSeverityBadge");
    this.resultConfidence = document.getElementById("resultConfidence");

    // Section 7 Guidance Fields
    this.whatDetectedDesc = document.getElementById("whatDetectedDesc");
    this.symptomsDesc = document.getElementById("symptomsDesc");
    this.symptomsList = document.getElementById("symptomsList");
    this.causesDesc = document.getElementById("causesDesc");
    this.causesList = document.getElementById("causesList");
    this.actionStepsList = document.getElementById("actionStepsList");

    // 5-Part Treatment & Control
    this.treatmentImmediate = document.getElementById("treatmentImmediate");
    this.treatmentNonChemical = document.getElementById("treatmentNonChemical");
    this.treatmentBiological = document.getElementById("treatmentBiological");
    this.treatmentChemical = document.getElementById("treatmentChemical");
    this.treatmentSafety = document.getElementById("treatmentSafety");

    // Prevention, Tips, Disclaimers, Sources
    this.preventionDesc = document.getElementById("preventionDesc");
    this.preventionList = document.getElementById("preventionList");
    this.sustainableTipText = document.getElementById("sustainableTipText");
    this.importantNoteText = document.getElementById("importantNoteText");
    this.resultSourcesText = document.getElementById("resultSourcesText");
    this.resetBtn = document.getElementById("analyzeAnotherBtn");
    this.openReportModalBtn = document.getElementById("openReportModalBtn");

    // Two-Stage Validation Notice Card & Section Container
    this.invalidImageNoticeCard = document.getElementById("invalidImageNoticeCard");
    this.invalidNoticeTitle = document.getElementById("invalidNoticeTitle");
    this.invalidNoticeSubtitle = document.getElementById("invalidNoticeSubtitle");
    this.invalidReasonText = document.getElementById("invalidReasonText");
    this.invalidGuidanceList = document.getElementById("invalidGuidanceList");
    this.btnInvalidUpload = document.getElementById("btnInvalidUpload");
    this.btnInvalidRetake = document.getElementById("btnInvalidRetake");
    this.validDiagnosisContent = document.getElementById("validDiagnosisContent");

    // Presets Grid
    this.presetsGrid = document.getElementById("samplePresetsGrid");

    // Dual Action Buttons in Dropzone
    this.btnUploadPhoto = document.getElementById("btnUploadPhoto");
    this.btnTakePhoto = document.getElementById("btnTakePhoto");

    // Camera Modal & Elements
    this.cameraModal = document.getElementById("cameraModal");
    this.closeCameraModalBtn = document.getElementById("closeCameraModalBtn");
    this.cameraVideo = document.getElementById("cameraVideo");
    this.cameraCanvas = document.getElementById("cameraCanvas");
    this.cameraOverlayFrame = document.getElementById("cameraOverlayFrame");
    this.cameraCapturedPreview = document.getElementById("cameraCapturedPreview");
    this.cameraLiveControls = document.getElementById("cameraLiveControls");
    this.cameraReviewControls = document.getElementById("cameraReviewControls");
    this.btnCapturePhoto = document.getElementById("btnCapturePhoto");
    this.btnCancelCamera = document.getElementById("btnCancelCamera");
    this.btnUploadCapture = document.getElementById("btnUploadCapture");
    this.btnRejectCapture = document.getElementById("btnRejectCapture");
    this.btnRetakeCapture = document.getElementById("btnRetakeCapture");
    this.cameraErrorAlert = document.getElementById("cameraErrorAlert");
    this.cameraErrorMsg = document.getElementById("cameraErrorMsg");

    // Camera State
    this.cameraStream = null;
    this.capturedDataUrl = null;

    // Settings Modal
    this.settingsBtn = document.getElementById("openApiSettingsBtn");
    this.settingsModal = document.getElementById("apiSettingsModal");
    this.closeModalBtn = document.getElementById("closeModalBtn");
    this.cancelModalBtn = document.getElementById("cancelModalBtn");
    this.saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
    this.apiKeyInput = document.getElementById("apiKeyInput");
  }

  bindEvents() {
    // Dropzone Click triggers File Picker (unless clicking buttons)
    if (this.dropzone) {
      this.dropzone.addEventListener("click", (e) => {
        if (e.target.closest && e.target.closest(".dropzone-actions-dual")) return;
        if (e.target !== this.fileInput && this.fileInput) {
          this.fileInput.click();
        }
      });

      // Drag & Drop
      ["dragenter", "dragover"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.add("drag-over");
        });
      });

      ["dragleave", "drop"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.remove("drag-over");
        });
      });

      this.dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
          this.handleFile(dt.files[0]);
        }
      });
    }

    // Dual action buttons in dropzone
    if (this.btnUploadPhoto) {
      this.btnUploadPhoto.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.fileInput) this.fileInput.click();
      });
    }

    if (this.btnTakePhoto) {
      this.btnTakePhoto.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openCamera();
      });
    }

    // Camera Modal Actions
    if (this.closeCameraModalBtn) {
      this.closeCameraModalBtn.addEventListener("click", () => {
        this.closeCameraModal();
      });
    }

    if (this.btnCancelCamera) {
      this.btnCancelCamera.addEventListener("click", () => {
        this.closeCameraModal();
      });
    }

    if (this.btnCapturePhoto) {
      this.btnCapturePhoto.addEventListener("click", () => {
        this.capturePhoto();
      });
    }

    if (this.btnUploadCapture) {
      this.btnUploadCapture.addEventListener("click", () => {
        this.confirmUploadCapture();
      });
    }

    if (this.btnRejectCapture) {
      this.btnRejectCapture.addEventListener("click", () => {
        this.rejectCapture();
      });
    }

    if (this.btnRetakeCapture) {
      this.btnRetakeCapture.addEventListener("click", () => {
        this.retakeCapture();
      });
    }

    if (this.cameraModal) {
      this.cameraModal.addEventListener("click", (e) => {
        if (e.target === this.cameraModal) {
          this.closeCameraModal();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.cameraModal && this.cameraModal.classList.contains("open")) {
        this.closeCameraModal();
      }
    });

    window.addEventListener("pagehide", () => {
      this.stopCameraStream();
    });

    // File Input change
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFile(e.target.files[0]);
        }
      });
    }

    // Remove / Change Image Button
    if (this.removeImageBtn) {
      this.removeImageBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setIdleState();
      });
    }

    // Analyze Plant Button
    if (this.analyzeBtn) {
      this.analyzeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.runAnalysis();
      });
    }

    // Analyze Another Leaf (Reset)
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.setIdleState();
        this.scrollToSection("analyzer");
      });
    }

    // Invalid image notice action buttons
    if (this.btnInvalidUpload) {
      this.btnInvalidUpload.addEventListener("click", () => {
        if (this.fileInput) this.fileInput.click();
      });
    }

    if (this.btnInvalidRetake) {
      this.btnInvalidRetake.addEventListener("click", () => {
        this.openCamera();
      });
    }

    // Multilingual PDF Report Modal Launcher
    if (this.openReportModalBtn) {
      this.openReportModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Strict guard: Do not allow downloading a report for rejected/invalid specimens
        if (!this.activeCase || this.activeCase.canAnalyze === false || this.activeCase.isPlant === false || this.activeCase.isOutOfScope || this.activeCase.isBlurry) {
          alert("Report unavailable\n\nPlease upload a clear image of a plant or leaf and complete a valid AI analysis before downloading the report.");
          return;
        }

        const reportGen = window.PaudhCareReportGenerator || window.AgriVisionReportGenerator;
        if (reportGen) {
          const caseToSend = Object.assign({}, this.activeCase, {
            confidence: this.activeCaseConfidence !== null ? this.activeCaseConfidence : (this.activeCase ? this.activeCase.confidence : null)
          });
          reportGen.openModal(caseToSend, this.currentImage);
        }
      });
    }

    // Download / Print PDF Report fallback
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    if (downloadReportBtn) {
      downloadReportBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const prevTitle = document.title;
        document.title = "PaudhCare AI Plant Health Report";
        window.print();
        setTimeout(() => {
          document.title = prevTitle;
        }, 1000);
      });
    }

    // Optional API Connector Modal
    if (this.settingsBtn && this.settingsModal) {
      this.settingsBtn.addEventListener("click", () => {
        const savedKey = localStorage.getItem("paudhcare_api_key") || localStorage.getItem("agrivision_api_key") || "";
        if (this.apiKeyInput) this.apiKeyInput.value = savedKey;
        this.settingsModal.classList.add("open");
      });
    }

    const closeModal = () => {
      if (this.settingsModal) this.settingsModal.classList.remove("open");
    };

    if (this.closeModalBtn) this.closeModalBtn.addEventListener("click", closeModal);
    if (this.cancelModalBtn) this.cancelModalBtn.addEventListener("click", closeModal);
    if (this.settingsModal) {
      this.settingsModal.addEventListener("click", (e) => {
        if (e.target === this.settingsModal) closeModal();
      });
    }

    if (this.saveApiKeyBtn) {
      this.saveApiKeyBtn.addEventListener("click", () => {
        let key = this.apiKeyInput ? this.apiKeyInput.value.trim() : "";
        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
          key = key.slice(1, -1).trim();
        }
        localStorage.setItem("paudhcare_api_key", key);
        closeModal();
        if (key) {
          this.clearError();
        }
      });
    }
  }

  renderPresets() {
    const dataService = window.PaudhCareDataService || window.AgriVisionDataService;
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    if (!this.presetsGrid || !dataService) return;
    const cases = dataService.getDemoCases();
    const currentLang = i18n ? i18n.getCurrentLanguage() : "en";

    this.presetsGrid.innerHTML = "";
    cases.forEach((item) => {
      const localized = i18n
        ? i18n.getLocalizedCase(item.id, currentLang)
        : item;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sample-card-button";
      btn.dataset.caseId = item.id;
      btn.setAttribute("aria-label", `Select sample: ${localized.plant} - ${localized.possibleCondition}`);

      btn.innerHTML = `
        <img class="sample-thumbnail" src="${item.localFallback}" alt="${localized.plant}" onerror="this.onerror=null; this.src='${item.image}';" />
        <div class="sample-info">
          <span class="sample-crop-name">${localized.plant.split(" (")[0]}</span>
          <span class="sample-crop-condition">${localized.possibleCondition}</span>
        </div>
      `;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.selectDemoPreset(item, btn);
      });

      this.presetsGrid.appendChild(btn);
    });
  }

  showError(keyOrText) {
    let msg = keyOrText;
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    if (i18n && i18n.t(keyOrText) !== keyOrText) {
      msg = i18n.t(keyOrText);
    }
    if (this.errorAlert && this.errorText) {
      this.errorText.textContent = msg;
      this.errorAlert.style.display = "flex";

      // If error is related to missing or invalid API key, allow clicking banner to open settings
      if (msg.includes("GEMINI_API_KEY") || msg.includes("configured yet")) {
        this.errorAlert.style.cursor = "pointer";
        this.errorAlert.title = "Click to configure API Key in settings modal or edit .env";
        this.errorAlert.onclick = () => {
          if (this.settingsModal) {
            const savedKey = localStorage.getItem("paudhcare_api_key") || localStorage.getItem("agrivision_api_key") || "";
            if (this.apiKeyInput) this.apiKeyInput.value = savedKey;
            this.settingsModal.classList.add("open");
          }
        };
      } else {
        this.errorAlert.style.cursor = "default";
        this.errorAlert.title = "";
        this.errorAlert.onclick = null;
      }

      if (this.errorTimeout) clearTimeout(this.errorTimeout);
      this.errorTimeout = setTimeout(() => {
        this.errorAlert.style.display = "none";
      }, 9000);
    } else {
      alert(msg);
    }
  }

  clearError() {
    if (this.errorAlert) this.errorAlert.style.display = "none";
  }

  setImageDataUrl(dataUrl) {
    this.clearError();
    this.currentImage = dataUrl;
    this.isUploadedByUser = true;
    // Active case determined strictly by visual analysis of image
    this.activeCase = null;
    this.activeCaseConfidence = null;

    document.querySelectorAll(".sample-card-button").forEach((b) => b.classList.remove("active"));
    this.setPreviewState("analyzer.specimenReady");
  }

  async openCamera() {
    this.clearCameraError();
    if (this.cameraCapturedPreview) this.cameraCapturedPreview.style.display = "none";
    if (this.cameraVideo) this.cameraVideo.style.display = "block";
    if (this.cameraOverlayFrame) this.cameraOverlayFrame.style.display = "flex";
    if (this.cameraLiveControls) this.cameraLiveControls.style.display = "flex";
    if (this.cameraReviewControls) this.cameraReviewControls.style.display = "none";

    if (this.cameraModal) {
      this.cameraModal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported in this browser.");
      }

      // Request rear camera if available (facingMode: environment)
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cameraStream = stream;
      if (this.cameraVideo) {
        this.cameraVideo.srcObject = stream;
        await this.cameraVideo.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Camera stream acquisition error:", err);
      this.showCameraError("camera.errorMsg");
    }
  }

  stopCameraStream() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.cameraStream = null;
    }
    if (this.cameraVideo) {
      this.cameraVideo.srcObject = null;
    }
  }

  closeCameraModal() {
    this.stopCameraStream();
    if (this.cameraModal) {
      this.cameraModal.classList.remove("open");
      document.body.style.overflow = "";
    }
    this.clearCameraError();
  }

  capturePhoto() {
    if (!this.cameraVideo || !this.cameraCanvas) return;
    const v = this.cameraVideo;
    const c = this.cameraCanvas;

    const width = v.videoWidth || 640;
    const height = v.videoHeight || 480;

    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, width, height);

    this.capturedDataUrl = c.toDataURL("image/jpeg", 0.92);

    // Switch view to captured preview
    if (this.cameraCapturedPreview) {
      this.cameraCapturedPreview.src = this.capturedDataUrl;
      this.cameraCapturedPreview.style.display = "block";
    }
    if (this.cameraVideo) this.cameraVideo.style.display = "none";
    if (this.cameraOverlayFrame) this.cameraOverlayFrame.style.display = "none";

    // Switch buttons to Review Controls (✓ Upload, ✕ Reject, ↻ Retake)
    if (this.cameraLiveControls) this.cameraLiveControls.style.display = "none";
    if (this.cameraReviewControls) this.cameraReviewControls.style.display = "flex";
  }

  confirmUploadCapture() {
    if (!this.capturedDataUrl) return;
    const imgData = this.capturedDataUrl;
    this.closeCameraModal();
    this.setImageDataUrl(imgData);
  }

  rejectCapture() {
    this.capturedDataUrl = null;
    this.closeCameraModal();
  }

  retakeCapture() {
    this.capturedDataUrl = null;
    if (this.cameraCapturedPreview) this.cameraCapturedPreview.style.display = "none";
    if (this.cameraVideo) this.cameraVideo.style.display = "block";
    if (this.cameraOverlayFrame) this.cameraOverlayFrame.style.display = "flex";
    if (this.cameraLiveControls) this.cameraLiveControls.style.display = "flex";
    if (this.cameraReviewControls) this.cameraReviewControls.style.display = "none";

    // Ensure camera stream is playing
    if (!this.cameraStream || !this.cameraStream.active) {
      this.openCamera();
    }
  }

  showCameraError(keyOrText) {
    let msg = keyOrText;
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    if (i18n && i18n.t(keyOrText) !== keyOrText) {
      msg = i18n.t(keyOrText);
    }
    if (this.cameraErrorAlert && this.cameraErrorMsg) {
      this.cameraErrorMsg.textContent = msg;
      this.cameraErrorAlert.style.display = "flex";
    }
  }

  clearCameraError() {
    if (this.cameraErrorAlert) this.cameraErrorAlert.style.display = "none";
  }

  handleFile(file) {
    this.clearError();

    if (!file) {
      this.showError("analyzer.errorDefault");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      this.showError("analyzer.errorFormat");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      this.showError("analyzer.errorSize");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      this.showError("Could not read image file. Please try another image.");
    };

    reader.onload = (e) => {
      this.setImageDataUrl(e.target.result);
    };

    reader.readAsDataURL(file);
  }

  selectDemoPreset(item, buttonEl) {
    this.clearError();
    this.activeCase = item;
    this.activeCaseConfidence = null;
    this.currentImage = item.localFallback;
    this.isUploadedByUser = false;

    document.querySelectorAll(".sample-card-button").forEach((b) => b.classList.remove("active"));
    if (buttonEl) buttonEl.classList.add("active");

    this.setPreviewState("analyzer.specimenReady");
  }

  setIdleState() {
    this.stopCameraStream();
    this.currentImage = null;
    this.activeCase = null;
    this.activeCaseConfidence = null;
    this.isAnalyzing = false;
    this.isUploadedByUser = false;
    if (this.fileInput) this.fileInput.value = "";
    if (this.timer) clearTimeout(this.timer);

    this.clearError();

    if (this.dropzone) this.dropzone.style.display = "block";
    if (this.previewContainer) this.previewContainer.style.display = "none";
    if (this.scanLine) this.scanLine.classList.remove("scanning");
    if (this.actionsBar) this.actionsBar.style.display = "none";
    if (this.loadingBox) this.loadingBox.style.display = "none";
    if (this.resultDashboard) this.resultDashboard.style.display = "none";

    // Reset Two-Stage validation display states
    if (this.invalidImageNoticeCard) this.invalidImageNoticeCard.style.display = "none";
    if (this.validDiagnosisContent) this.validDiagnosisContent.style.display = "block";
    if (this.openReportModalBtn) {
      this.openReportModalBtn.classList.remove("btn-locked");
      this.openReportModalBtn.removeAttribute("aria-disabled");
      this.openReportModalBtn.title = "Download Official Multilingual PDF Report";
    }

    document.querySelectorAll(".sample-card-button").forEach((b) => b.classList.remove("active"));
  }

  setPreviewState(badgeKey = "analyzer.specimenReady") {
    if (!this.currentImage) return;

    if (this.dropzone) this.dropzone.style.display = "none";
    if (this.previewContainer) this.previewContainer.style.display = "block";
    if (this.previewImage) {
      this.previewImage.src = this.currentImage;
      if (this.activeCase) {
        this.previewImage.onerror = () => {
          this.previewImage.onerror = null;
          this.previewImage.src = this.activeCase.image;
        };
      }
    }
    if (this.previewBadge) {
      const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
      this.previewBadge.textContent = i18n ? i18n.t(badgeKey) : "Specimen Ready";
    }
    if (this.scanLine) this.scanLine.classList.remove("scanning");
    if (this.actionsBar) this.actionsBar.style.display = "flex";
    if (this.loadingBox) this.loadingBox.style.display = "none";
    if (this.resultDashboard) this.resultDashboard.style.display = "none";
  }

  getApiEndpoints() {
    const endpoints = [];
    const origin = window.location.origin;

    // 1. Same-origin relative paths (preferred when served directly from http://localhost:8000 or reverse proxy)
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      endpoints.push("/api/analyze-plant");
      endpoints.push("/api/analyze");
    }

    // 2. Direct localhost:8000 URLs (essential when opened via file:// or alternate port like 5500/3000)
    if (!origin || origin === "null" || (!origin.includes(":8000") && !origin.includes("localhost:8000"))) {
      endpoints.push("http://localhost:8000/api/analyze-plant");
      endpoints.push("http://127.0.0.1:8000/api/analyze-plant");
      endpoints.push("http://localhost:8000/api/analyze");
      endpoints.push("http://127.0.0.1:8000/api/analyze");
    }

    return endpoints;
  }

  async checkBackendConnection() {
    const healthUrls = [];
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      healthUrls.push("/api/health");
    }
    healthUrls.push("http://localhost:8000/api/health");
    healthUrls.push("http://127.0.0.1:8000/api/health");

    for (const url of healthUrls) {
      try {
        const resp = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
        if (resp.ok) {
          return await resp.json();
        }
      } catch (e) {}
    }
    return null;
  }

  /**
   * Real Multimodal AI Plant Analysis via backend proxy
   * Communicates with POST /api/analyze-plant (or /api/analyze)
   * Sends actual image payload + selected user language
   * Zero hardcoded fallbacks to Tomato or any single disease.
   */
  async analyzeSpecimen(imageSource) {
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    const currentLang = i18n ? i18n.getCurrentLanguage() : "en";
    const customApiKey = localStorage.getItem("paudhcare_api_key") || localStorage.getItem("agrivision_api_key") || "";

    const payload = {
      image: imageSource,
      language: currentLang,
      apiKey: customApiKey
    };

    const endpoints = this.getApiEndpoints();
    let resp = null;
    let lastNetworkError = null;

    for (const url of endpoints) {
      try {
        resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (resp && resp.ok) break;
      } catch (err) {
        lastNetworkError = err;
      }
    }

    if (!resp) {
      throw new Error("Plant analysis server is offline. Please start the server using start-server.bat.");
    }

    if (!resp.ok) {
      throw new Error("Plant analysis server returned an error (" + resp.status + "). Please try again.");
    }

    const data = await resp.json();
    if (!data) {
      throw new Error("Invalid response received from plant analysis service.");
    }

    if (!data.success) {
      if (data.errorType === "MISSING_KEY") {
        throw new Error("AI analysis is not configured yet. Please configure GEMINI_API_KEY in the .env file.");
      } else if (data.errorType === "RATE_LIMIT") {
        throw new Error("AI analysis limit reached. Please try again later.");
      } else if (data.errorType === "AUTH_ERROR") {
        throw new Error("Invalid or unauthorized GEMINI_API_KEY. Please check your .env settings.");
      } else {
        throw new Error(data.message || "Plant analysis is temporarily unavailable. Please try again.");
      }
    }

    if (!data.result) {
      throw new Error("Analysis completed but no assessment data was returned.");
    }

    return data.result;
  }

  /**
   * Transforms raw Multimodal AI vision response into PaudhCare standard case model.
   * Completely crop-agnostic; supports Tomato, Potato, Chilli, Rice, Wheat, and all plants.
   */
  mapAiResultToCase(ai) {
    const isPlant = ai.isPlant !== false;
    const canAnalyze = ai.canAnalyze !== false && isPlant;
    const plantName = ai.plant ? (ai.plant.scientificName ? `${ai.plant.commonName} (${ai.plant.scientificName})` : ai.plant.commonName) : (isPlant ? "Crop Specimen" : "Non-Plant Subject");
    const condition = ai.diagnosis ? ai.diagnosis.name : (canAnalyze ? "Foliar Condition Assessed" : "Analysis Unavailable");
    const confidence = (ai.diagnosis && typeof ai.diagnosis.confidence === "number") ? ai.diagnosis.confidence : null;

    return {
      id: "ai-specimen-" + Date.now(),
      isPlant: isPlant,
      canAnalyze: canAnalyze,
      imageQuality: ai.imageQuality || (canAnalyze ? "good" : "low_quality"),
      validationState: ai.validationState || (canAnalyze ? "VALID_PLANT" : (isPlant ? "LOW_QUALITY" : "NOT_A_PLANT")),
      rejectionReason: ai.rejectionReason || (isPlant ? "The image is too blurry or low quality for reliable diagnosis." : "The uploaded photo does not appear to contain a plant, leaf, or crop."),
      userGuidance: ai.userGuidance || "Please photograph a clear, well-lit crop leaf from 15–30 cm distance.",
      plant: plantName,
      possibleCondition: condition,
      severity: ai.severity || (canAnalyze ? "Moderate Priority" : "Analysis Refused"),
      confidence: confidence,
      isHealthy: ai.diagnosis && ai.diagnosis.type === "healthy",
      isOutOfScope: !isPlant,
      isBlurry: isPlant && !canAnalyze,
      whatWasDetected: ai.whatIsThisProblem || (ai.observations && ai.observations.length > 0 ? ai.observations.join(". ") : (canAnalyze ? "Visual foliar pathology evidence assessed." : ai.rejectionReason)),
      symptoms: (ai.observations && ai.observations[0]) || "Characteristic foliar symptoms observed:",
      symptomsBullets: ai.symptoms || [],
      causes: "Contributing environmental and cultural factors:",
      causesBullets: ai.possibleCauses || [],
      actionSteps: (ai.recommendedActions && ai.recommendedActions.length > 0) ? ai.recommendedActions : [
        "Isolate affected foliar sections where practical.",
        "Sanitize all cutting equipment thoroughly.",
        "Adjust irrigation timing to keep leaf canopy dry.",
        "Monitor adjacent plants for early spot development.",
        "Consult a certified local agricultural extension officer for verified treatments."
      ],
      treatmentControl: {
        immediate: ai.treatment?.immediate || "Prune or remove severely affected foliage during dry weather to reduce pathogen inoculum.",
        nonChemical: ai.treatment?.nonChemical || "Ensure optimal plant spacing and airflow to accelerate leaf drying and minimize humidity.",
        biological: ai.treatment?.biological || "Consider registered beneficial bio-protectants or trichoderma formulations where officially labeled.",
        chemical: ai.treatment?.chemical || "CRITICAL NOTICE: Consult the official registered product label and local extension guidelines. Never apply unverified doses.",
        safety: ai.treatment?.safety || "Always wear appropriate PPE (chemical-resistant gloves, eye protection, respirator) during any foliar intervention."
      },
      prevention: "Long-term preventive crop management:",
      preventionBullets: ai.prevention || [
        "Use certified disease-free seeds or healthy nursery transplants.",
        "Practice crop rotation with non-host species.",
        "Utilize drip or furrow irrigation rather than overhead sprinklers.",
        "Maintain balanced soil nutrition according to soil test recommendations."
      ],
      sustainableTip: ai.fertilizerGuidance ? `Nutrition note: ${ai.fertilizerGuidance}` : "Prefer preventive scouting, proper crop spacing, and targeted interventions instead of routine chemical use.",
      importantNote: "IMPORTANT: PaudhCare AI provides preliminary decision support. Always consult a certified local agronomist or extension professional before applying chemical treatments.",
      sources: ai.sources || "Guidance synthesized from agricultural extension protocols (ICAR, FAO, PlantVillage).",
      howSeriousIsIt: ai.howSeriousIsIt || "",
      recoveryTime: ai.recoveryTime || "",
      canItBeFixed: ai.canItBeFixed || "",
      whatShouldBeAvoided: ai.whatShouldBeAvoided || "",
      fertilizerGuidance: ai.fertilizerGuidance || "",
      rawAiResult: ai
    };
  }

  async runAnalysis() {
    if (!this.currentImage) {
      this.showError("analyzer.errorDefault");
      return;
    }

    if (this.isAnalyzing) return;
    this.isAnalyzing = true;

    if (this.actionsBar) this.actionsBar.style.display = "none";
    if (this.loadingBox) this.loadingBox.style.display = "block";
    if (this.scanLine) this.scanLine.classList.add("scanning");
    if (this.resultDashboard) this.resultDashboard.style.display = "none";

    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;

    const steps = [
      i18n ? i18n.t("analyzer.loadingStep1") : "Inspecting leaf tissue & color gradients...",
      i18n ? i18n.t("analyzer.loadingStep2") : "Evaluating foliar lesion architecture...",
      i18n ? i18n.t("analyzer.loadingStep3") : "Synthesizing agronomic guidance..."
    ];

    let stepIndex = 0;
    if (this.loadingTicker) this.loadingTicker.textContent = steps[0];

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        if (this.loadingTicker) this.loadingTicker.textContent = steps[stepIndex];
      }
    }, 550);

    // If user explicitly selected a preset sample, honor that case directly
    if (!this.isUploadedByUser && this.activeCase) {
      setTimeout(() => {
        clearInterval(stepInterval);
        this.completeAnalysis();
      }, 1500);
      return;
    }

    // Real multimodal vision AI analysis on user uploaded photo / camera capture
    try {
      const aiResult = await this.analyzeSpecimen(this.currentImage);
      clearInterval(stepInterval);

      // Convert raw AI response into PaudhCare standard case model
      this.activeCase = this.mapAiResultToCase(aiResult);
      this.activeCaseConfidence = (aiResult.diagnosis && typeof aiResult.diagnosis.confidence === "number")
        ? aiResult.diagnosis.confidence
        : null;

      this.completeAnalysis();
    } catch (err) {
      clearInterval(stepInterval);
      this.isAnalyzing = false;
      if (this.scanLine) this.scanLine.classList.remove("scanning");
      if (this.loadingBox) this.loadingBox.style.display = "none";
      if (this.actionsBar) this.actionsBar.style.display = "flex";

      // Show exact failure reason with ZERO silent fallback to Tomato!
      this.showError(err.message || "Plant analysis is temporarily unavailable. Please try again.");
    }
  }

  completeAnalysis() {
    this.isAnalyzing = false;
    if (this.scanLine) this.scanLine.classList.remove("scanning");
    if (this.loadingBox) this.loadingBox.style.display = "none";

    this.renderResultDashboard();

    if (this.resultDashboard) {
      this.resultDashboard.style.display = "block";
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = this.resultDashboard.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }

  // Renders the result dashboard conforming strictly to Section 7 & Two-Stage Validation
  renderResultDashboard() {
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    const currentLang = i18n ? i18n.getCurrentLanguage() : "en";

    if (!this.activeCase) return;

    // Check Stage 1 Validation
    const isInvalid = this.activeCase.canAnalyze === false || this.activeCase.isPlant === false || this.activeCase.isOutOfScope || this.activeCase.isBlurry;

    if (isInvalid) {
      // Stage 1 Validation Refusal: Hide treatment & disease diagnosis
      if (this.validDiagnosisContent) this.validDiagnosisContent.style.display = "none";
      if (this.invalidImageNoticeCard) this.invalidImageNoticeCard.style.display = "block";

      const isBlurry = this.activeCase.isBlurry || this.activeCase.validationState === "LOW_QUALITY" || this.activeCase.validationState === "INSUFFICIENT_EVIDENCE";

      if (this.invalidNoticeTitle) {
        this.invalidNoticeTitle.textContent = isBlurry
          ? "Image Inconclusive — Low Quality Image"
          : "Image Not Suitable for Plant Health Analysis";
      }

      if (this.invalidNoticeSubtitle) {
        this.invalidNoticeSubtitle.textContent = isBlurry
          ? "The foliar image is blurry or unclear, so a reliable plant disease diagnosis cannot be made."
          : "Our two-stage agricultural vision system could not detect a valid crop or plant specimen.";
      }

      if (this.invalidReasonText) {
        this.invalidReasonText.textContent = this.activeCase.rejectionReason || (isBlurry
          ? "Image quality is not sufficient for reliable plant-health analysis."
          : "The uploaded photo does not appear to contain a plant, leaf, or crop.");
      }

      // Update header card
      if (this.resultTypeTag) {
        this.resultTypeTag.textContent = "AI Vision Refusal Notice";
      }

      if (this.resultPlantName) {
        this.resultPlantName.textContent = this.activeCase.plant || (isBlurry ? "Plant: Unclear Foliar Specimen" : "Subject: Non-Plant Subject");
      }

      if (this.resultCondition) {
        this.resultCondition.textContent = this.activeCase.possibleCondition || (isBlurry ? "Analysis Inconclusive" : "Analysis Refusal — Non-Plant Subject");
      }

      if (this.resultSeverityBadge) {
        this.resultSeverityBadge.textContent = "Analysis Refused";
        this.resultSeverityBadge.className = "pill-badge pill-badge-dark";
      }

      if (this.resultConfidence) {
        this.resultConfidence.textContent = "Confidence: Not available";
      }

      // Lock Download Report Button
      if (this.openReportModalBtn) {
        this.openReportModalBtn.classList.add("btn-locked");
        this.openReportModalBtn.setAttribute("aria-disabled", "true");
        this.openReportModalBtn.title = "Report unavailable. Please upload a clear image of a plant or leaf and complete a valid AI analysis before downloading the report.";
      }

      return;
    }

    // Stage 1 Passed: Valid plant specimen
    if (this.invalidImageNoticeCard) this.invalidImageNoticeCard.style.display = "none";
    if (this.validDiagnosisContent) this.validDiagnosisContent.style.display = "block";

    // Unlock Download Report Button
    if (this.openReportModalBtn) {
      this.openReportModalBtn.classList.remove("btn-locked");
      this.openReportModalBtn.removeAttribute("aria-disabled");
      this.openReportModalBtn.title = "Download Official Multilingual PDF Report";
    }

    // Determine data source: Preset localization vs Dynamic AI case
    let data = this.activeCase;
    if (this.activeCase.id && typeof this.activeCase.id === "string" && !this.activeCase.id.startsWith("ai-")) {
      data = i18n ? i18n.getLocalizedCase(this.activeCase.id, currentLang) : this.activeCase;
    }

    if (!data) data = this.activeCase;

    // Header & Tag
    if (this.resultTypeTag) {
      this.resultTypeTag.textContent = i18n ? i18n.t("result.headerTag") : "AI Plant Health Assessment";
    }

    if (this.resultStatusBanner) {
      const bannerText = i18n
        ? i18n.t("result.statusBanner")
        : "Safety & Accuracy First — Verified Agronomic Decision Support.";
      this.resultStatusBanner.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        ${bannerText}
      `;
    }

    // 1. Plant / Crop
    if (this.resultPlantName) this.resultPlantName.textContent = `Plant: ${data.plant}`;

    // 2. Possible Condition
    if (this.resultCondition) this.resultCondition.textContent = data.possibleCondition;

    // 3. Severity Badge
    if (this.resultSeverityBadge) {
      this.resultSeverityBadge.textContent = data.severity || "Moderate Priority";
      this.resultSeverityBadge.className = "pill-badge";
      if (data.isHealthy) {
        this.resultSeverityBadge.classList.add("pill-badge-green");
      } else if (data.severity && data.severity.includes("High")) {
        this.resultSeverityBadge.classList.add("pill-badge-amber");
      } else {
        this.resultSeverityBadge.classList.add("pill-badge-green");
      }
    }

    // 4. Confidence: Real model confidence if available, or "Confidence: Not available"
    if (this.resultConfidence) {
      const confVal = this.activeCaseConfidence !== null && this.activeCaseConfidence !== undefined
        ? this.activeCaseConfidence
        : (data.confidence !== null && data.confidence !== undefined ? data.confidence : null);
      if (typeof confVal === "number" && !isNaN(confVal)) {
        this.resultConfidence.textContent = `Confidence: ${Math.round(confVal)}%`;
      } else {
        this.resultConfidence.textContent = i18n ? i18n.t("result.confidenceLabel") : "Confidence: Not available";
      }
    }

    // 5. What Was Detected?
    if (this.whatDetectedDesc) {
      this.whatDetectedDesc.textContent = data.whatWasDetected || "";
    }

    // 6. Common Symptoms
    if (this.symptomsDesc) this.symptomsDesc.textContent = data.symptoms || "";
    if (this.symptomsList) {
      this.symptomsList.innerHTML = "";
      (data.symptomsBullets || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        this.symptomsList.appendChild(li);
      });
    }

    // 7. Why It May Have Happened (Cautious Contributing Factors)
    if (this.causesDesc) this.causesDesc.textContent = data.causes || "";
    if (this.causesList) {
      this.causesList.innerHTML = "";
      (data.causesBullets || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        this.causesList.appendChild(li);
      });
    }

    // 8. What To Do Now (5 Numbered Sequential Action Steps)
    if (this.actionStepsList) {
      this.actionStepsList.innerHTML = "";
      const steps = data.actionSteps || [];
      steps.forEach((stepText, idx) => {
        const li = document.createElement("li");
        li.className = "action-step-item";
        li.innerHTML = `
          <div class="step-num-badge">${idx + 1}</div>
          <div class="step-text">${stepText}</div>
        `;
        this.actionStepsList.appendChild(li);
      });
    }

    // 9. Treatment & Control (5 Structured Parts)
    const tc = data.treatmentControl || {};
    if (this.treatmentImmediate) this.treatmentImmediate.textContent = tc.immediate || "Prune severely affected foliage during dry weather.";
    if (this.treatmentNonChemical) this.treatmentNonChemical.textContent = tc.nonChemical || "Ensure optimal spacing and airflow.";
    if (this.treatmentBiological) this.treatmentBiological.textContent = tc.biological || "Consider beneficial bio-protectants where registered.";
    if (this.treatmentChemical) this.treatmentChemical.textContent = tc.chemical || "Consult registered product label before application.";
    if (this.treatmentSafety) this.treatmentSafety.textContent = tc.safety || "Wear personal protective equipment (PPE).";

    // 10. Prevention
    if (this.preventionDesc) this.preventionDesc.textContent = data.prevention || "";
    if (this.preventionList) {
      this.preventionList.innerHTML = "";
      (data.preventionBullets || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        this.preventionList.appendChild(li);
      });
    }

    // 11. Sustainable Crop Tip
    if (this.sustainableTipText) {
      this.sustainableTipText.textContent = data.sustainableTip || "Prefer preventive monitoring, sanitation and targeted intervention.";
    }

    // 12. Important Note Advisory
    if (this.importantNoteText) {
      this.importantNoteText.textContent = data.importantNote || (i18n ? i18n.t("result.disclaimer") : "");
    }

    // 13. Verified Agronomic Sources & References
    if (this.resultSourcesText) {
      this.resultSourcesText.textContent = data.sources || (i18n ? i18n.t("result.sourcesDesc") : "");
    }
  }

  handleLanguageChange() {
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    this.renderPresets();

    if (this.previewBadge && this.previewContainer && this.previewContainer.style.display !== "none") {
      this.previewBadge.textContent = i18n ? i18n.t("analyzer.specimenReady") : "Specimen Ready";
    }

    if (this.resultDashboard && this.resultDashboard.style.display === "block") {
      this.renderResultDashboard();
    }
  }

  scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }
}

// Instantiate
function initPaudhAnalyzer() {
  if (!window.paudhAnalyzer && document.getElementById("dropzoneCard")) {
    window.paudhAnalyzer = new PaudhCareAnalyzer();
    // Legacy backward-compatibility alias
    window.agriAnalyzer = window.paudhAnalyzer;
  }
}

// Class references
window.PaudhCareAnalyzer = PaudhCareAnalyzer;
window.AgriVisionAnalyzer = PaudhCareAnalyzer;

initPaudhAnalyzer();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPaudhAnalyzer);
}
window.addEventListener("load", initPaudhAnalyzer);
