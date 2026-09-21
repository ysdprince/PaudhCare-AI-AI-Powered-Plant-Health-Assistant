/**
 * PaudhCare AI — Multilingual PDF Report Generator
 * High-Resolution Multi-Page PDF Generation Engine
 * Conforms to all 25 Agronomic Specimen & Advisory Standards
 * - Embeds user's actual uploaded leaf image with preserved resolution
 * - Complete agronomic sections A through M, Sources, and Safety Notice
 * - Supports RTL text alignment for Urdu and Sindhi
 * - Independent language selection without re-scanning
 */

const PaudhCareReportGenerator = (function () {
  let activeCase = null;
  let activeImage = null;
  let selectedLang = "en";
  let isGenerating = false;

  // DOM Elements cache
  let modal = null;
  let searchInput = null;
  let optionsContainer = null;
  let generateBtn = null;
  let cancelBtn = null;
  let closeBtn = null;

  function init() {
    modal = document.getElementById("reportLangModal");
    searchInput = document.getElementById("reportLangSearch");
    optionsContainer = document.getElementById("reportLangList");
    generateBtn = document.getElementById("confirmDownloadReportBtn");
    cancelBtn = document.getElementById("cancelReportModalBtn");
    closeBtn = document.getElementById("closeReportModalBtn");

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("open")) {
        closeModal();
      }
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderLanguages(e.target.value);
      });
    }

    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        if (!isGenerating) {
          executePDFGeneration();
        }
      });
    }
  }

  function getI18n() {
    return window.PaudhCareI18n || window.AgriVisionI18n;
  }

  function getDataService() {
    return window.PaudhCareDataService || window.AgriVisionDataService;
  }

  function openModal(caseData, userImage) {
    if (!caseData || caseData.canAnalyze === false || caseData.isPlant === false || caseData.isOutOfScope || caseData.isBlurry) {
      alert("Report unavailable\n\nPlease upload a clear image of a plant or leaf and complete a valid AI analysis before downloading the report.");
      return;
    }
    activeCase = caseData;
    activeImage = userImage || (activeCase ? (activeCase.localFallback || activeCase.image) : null);

    const i18n = getI18n();
    selectedLang = i18n ? i18n.getCurrentLanguage() : "en";

    if (searchInput) searchInput.value = "";
    renderLanguages();

    if (modal) {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 100);
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  function renderLanguages(query = "") {
    if (!optionsContainer) return;
    const i18n = getI18n();
    const languages = i18n ? i18n.getLanguages() : [];
    const q = query.trim().toLowerCase();

    optionsContainer.innerHTML = "";

    const filtered = languages.filter((l) => {
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      optionsContainer.innerHTML = `
        <div class="report-lang-empty">No matching language found</div>
      `;
      return;
    }

    filtered.forEach((l) => {
      const isSelected = l.code === selectedLang;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `report-lang-card ${isSelected ? "selected" : ""}`;
      btn.dataset.code = l.code;
      btn.innerHTML = `
        <div class="report-lang-card-main">
          <span class="report-lang-native">${l.nativeName}</span>
          <span class="report-lang-english">${l.name}</span>
        </div>
        ${
          isSelected
            ? `<svg class="report-lang-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : ""
        }
      `;

      btn.addEventListener("click", () => {
        selectedLang = l.code;
        renderLanguages(searchInput ? searchInput.value : "");
      });

      optionsContainer.appendChild(btn);
    });
  }

  // Builds the report data context with all localized agronomic fields
  function buildReportContext(caseData, userImage, lang) {
    const i18n = getI18n();
    const r = i18n && i18n.getReportTranslations ? i18n.getReportTranslations(lang) : {};
    const loc = (i18n && caseData && caseData.id && typeof caseData.id === "string" && !caseData.id.startsWith("ai-") && i18n.getLocalizedCase && i18n.getLocalizedCase(caseData.id, lang))
      ? i18n.getLocalizedCase(caseData.id, lang)
      : caseData;
    const languages = i18n ? i18n.getLanguages() : [];
    const langMeta = languages.find((l) => l.code === lang) || { dir: "ltr", nativeName: "English", name: "English" };
    const isRTL = langMeta.dir === "rtl";

    const localeMap = {
      hi: "hi-IN", bn: "bn-IN", te: "te-IN", ta: "ta-IN", mr: "mr-IN",
      gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN", ur: "ur-IN",
      sd: "sd-IN", as: "as-IN", or: "or-IN", sa: "sa-IN"
    };
    const locale = localeMap[lang] || "en-IN";
    const now = new Date();
    const dateStr = now.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: true });
    const rawId = (caseData && caseData.id) ? String(caseData.id) : "specimen";
    const specimenRef = `AGR-${Math.abs(rawId.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 90000 + 10000)}`;

    const confidenceDisplay =
      loc.confidence !== null && loc.confidence !== undefined && typeof loc.confidence === "number"
        ? `${Math.round(loc.confidence)}%`
        : (r.confidenceUnavailable || "Confidence: Not available");

    const tc = loc.treatmentControl || {};
    const severityDisplay = loc.severityLevel || loc.severity || (r.defaultSeverity || "Severity: Not reliably determined");
    const seriousDisplay = loc.howSeriousIsIt || r.defaultSerious || "Assessment cannot confirm internal systemic spread from an image alone. Foliar damage is visible, and timely action is recommended to prevent spreading to healthy foliage and surrounding plants.";
    const recoveryDisplay = loc.recoveryTime || r.defaultRecovery || "Recovery time cannot be reliably predicted from an image alone. Recovery depends on weather conditions, plant vigor, crop growth stage, and prompt execution of management measures. Typically new flush appears in 2–3 weeks under favorable conditions.";
    const canFixDisplay = loc.canItBeFixed || r.defaultCanFix || "Leaves already displaying necrosis or severe lesions cannot regain healthy green tissue. However, with recommended treatment and cultural care, new emerging shoots, leaves, and buds can grow completely healthy.";
    const avoidDisplay = loc.whatShouldBeAvoided || r.defaultAvoid || "Avoid overhead sprinkler irrigation that keeps leaves wet. Avoid handling infected wet plants. Avoid excessive chemical nitrogen fertilization which promotes soft susceptible tissue. Do not discard infected clippings in active compost or nearby fields.";

    return {
      caseData, loc, r, lang, langMeta, isRTL,
      dateStr, timeStr, specimenRef, confidenceDisplay, severityDisplay,
      seriousDisplay, recoveryDisplay, canFixDisplay, avoidDisplay, tc, userImage
    };
  }

  // Page 1: Welcome & Cover Page HTML
  function buildCoverPageHTML(ctx) {
    return `
      <div class="pdf-cover-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${ctx.r.coverVisualBadge || "Agronomic Diagnostic Report"}</span>
      </div>

      <h1 class="pdf-cover-title">PaudhCare AI</h1>
      <div class="pdf-cover-tagline">Smarter Plant Care. Powered by AI</div>
      <div class="pdf-cover-subtitle">Plant Health Report</div>
      <p class="pdf-cover-intro">${ctx.r.coverIntro || "This comprehensive agronomic report has been generated using PaudhCare AI vision intelligence to assess foliar symptoms, identify potential plant health anomalies, and provide evidence-based management guidance for sustainable agriculture."}</p>

      <div class="pdf-cover-illustration">
        <svg width="140" height="140" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="76" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
          <path d="M80 130V65" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
          <path d="M80 65C80 45 60 35 45 42C30 49 35 75 55 82C68 86 80 75 80 65Z" fill="#22c55e" fill-opacity="0.25" stroke="#15803d" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M80 85C80 70 100 58 115 65C130 72 125 98 105 102C92 105 80 95 80 85Z" fill="#16a34a" fill-opacity="0.3" stroke="#15803d" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="80" cy="40" r="8" fill="#eab308" fill-opacity="0.3" stroke="#ca8a04" stroke-width="2"/>
          <path d="M40 130H120" stroke="#166534" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <div class="pdf-cover-metadata-card">
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">${ctx.r.metaGeneratedOn || "Report generated on:"}</span>
          <span class="pdf-cover-meta-val">${ctx.dateStr}</span>
        </div>
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">${ctx.r.metaTime || "Time:"}</span>
          <span class="pdf-cover-meta-val">${ctx.timeStr}</span>
        </div>
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">${ctx.r.metaLanguage || "Language:"}</span>
          <span class="pdf-cover-meta-val">${ctx.langMeta.nativeName} (${ctx.langMeta.name})</span>
        </div>
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">${ctx.r.metaEvaluatedCrop || "Evaluated Crop:"}</span>
          <span class="pdf-cover-meta-val">${ctx.loc.plant}</span>
        </div>
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">${ctx.r.metaAssessedCondition || "Assessed Condition:"}</span>
          <span class="pdf-cover-meta-val">${ctx.loc.possibleCondition}</span>
        </div>
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">${ctx.r.metaReportRef || "Report Reference:"}</span>
          <span class="pdf-cover-meta-val">#${ctx.specimenRef}</span>
        </div>
      </div>

      <div class="pdf-footer-center" style="margin-top: 10px; border-top: none;">
        <span>PaudhCare AI</span>
      </div>
    `;
  }

  // Mini Top Header for Report Pages (Page 2+)
  function buildReportHeaderHTML(ctx) {
    return `
      <header class="pdf-header">
        <div class="pdf-header-left">
          <div class="pdf-logo-row">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14452f" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 12"></path>
            </svg>
            <div class="pdf-brand-titles">
              <span class="pdf-brand-main">PaudhCare AI</span>
              <span class="pdf-brand-sub">Smarter Plant Care. Powered by AI</span>
            </div>
          </div>
          <h2 class="pdf-report-page-title">${ctx.r.reportTitle || "Plant Health Assessment Report"}</h2>
        </div>
        <div class="pdf-header-meta">
          <div class="pdf-meta-pill"><strong>${ctx.r.refShort || "Ref"}:</strong> #${ctx.specimenRef}</div>
          <div class="pdf-meta-pill"><strong>${ctx.r.dateShort || "Date"}:</strong> ${ctx.dateStr}</div>
        </div>
      </header>
    `;
  }

  // Structured array of all 25 sections + images + safety notice
  function buildSectionDescriptors(ctx) {
    const loc = ctx.loc;
    const r = ctx.r;
    const tc = ctx.tc;

    return [
      // Primary Specimen & Secondary Diagnostic Model
      {
        id: "images",
        title: null,
        html: `
          <div class="pdf-images-container">
            <div class="pdf-image-card">
              <div class="pdf-img-frame">
                <img src="${ctx.userImage}" alt="User-provided plant image" class="pdf-leaf-image" />
              </div>
              <div class="pdf-img-caption">
                <strong>${r.userProvidedPlantImage || "User-provided plant image"}</strong>
                <p>${r.uploadedImageCaption || "Primary diagnostic evidence photographed by user and evaluated by AI foliar screening."}</p>
              </div>
            </div>
            <div class="pdf-image-card pdf-concept-card">
              <div class="pdf-img-frame pdf-concept-frame">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2d9365" stroke-width="1.8">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 12"></path>
                  <circle cx="12" cy="8" r="2" stroke="#d97706" fill="#fef3c7"></circle>
                  <circle cx="16" cy="11" r="1.5" stroke="#ef4444" fill="#fee2e2"></circle>
                </svg>
                <div class="pdf-concept-badge">${r.illustrativeModelBadge || "Illustrative image — not diagnostic evidence"}</div>
              </div>
              <div class="pdf-img-caption">
                <strong>${r.agronomicDiagnosticModel || "Agronomic Diagnostic Model"}</strong>
                <p>${r.conceptReferenceDiagram || "Concept pathology reference diagram — not user evidence."}</p>
              </div>
            </div>
          </div>
        `
      },
      // 1. Plant / Crop
      {
        id: "sec1",
        title: r.sec1Plant || "1. Plant / Crop",
        html: `
          <div class="pdf-grid-summary">
            <div class="pdf-summary-card">
              <span class="pdf-card-label">${r.commonCropName || "Common Crop Name"}</span>
              <span class="pdf-card-value pdf-val-plant">${loc.plant}</span>
            </div>
            <div class="pdf-summary-card">
              <span class="pdf-card-label">${r.classificationStatus || "Classification Status"}</span>
              <span class="pdf-card-value">${r.agronomicCropSpecimen || "Agronomic Crop Specimen"}</span>
            </div>
            <div class="pdf-summary-card">
              <span class="pdf-card-label">${r.modelAssessment || "Model Assessment"}</span>
              <span class="pdf-card-value">${ctx.confidenceDisplay}</span>
            </div>
          </div>
        `
      },
      // 2. Scientific Name
      {
        id: "sec2",
        title: r.sec2Scientific || "2. Scientific Name",
        html: `<div class="pdf-text-box"><p>${r.botanicalTaxon || "Botanical / Pathological Taxon"}: <em>${loc.scientificName || "Indeterminate botanical classification"}</em></p></div>`
      },
      // 3. Detected / Possible Problem
      {
        id: "sec3",
        title: r.sec3Problem || "3. Detected / Possible Problem",
        html: `<div class="pdf-text-box"><p><strong>${loc.possibleCondition}</strong></p><p style="margin-top: 4px; font-size: 0.76rem; color: #475569;">${r.foliarSymptomsNotice || "Image-based assessment suggests foliar symptoms consistent with this condition. Further confirmation may be required."}</p></div>`
      },
      // 4. Severity
      {
        id: "sec4",
        title: r.sec4Severity || "4. Severity",
        html: `<div class="pdf-text-box"><span class="pdf-badge ${loc.isHealthy ? "pdf-badge-green" : "pdf-badge-amber"}">${ctx.severityDisplay}</span></div>`
      },
      // 5. What Was Detected
      {
        id: "sec5",
        title: r.sec5Findings || "5. What Was Detected",
        html: `<div class="pdf-text-box"><p>${loc.whatWasDetected || r.defaultDetected || "Visual features were extracted and evaluated by the foliar classification engine."}</p></div>`
      },
      // 6. What Is This Problem?
      {
        id: "sec6",
        title: r.sec6WhatIsIt || "6. What Is This Problem?",
        html: `<div class="pdf-text-box"><p>${loc.whatIsThisProblem || loc.symptoms || r.defaultOverview || "Agronomic overview of the condition."}</p></div>`
      },
      // 7. How Did It Happen?
      {
        id: "sec7",
        title: r.sec7HowHappened || "7. How Did It Happen?",
        html: `<div class="pdf-text-box"><p class="pdf-lead-text">${r.infectionLeadText || "Foliar infection or stress is likely associated with environmental microclimate conditions:"}</p><p>${loc.causes}</p></div>`
      },
      // 8. Possible Causes
      {
        id: "sec8",
        title: r.sec8PossibleCauses || "8. Possible Causes",
        bullets: loc.causesBullets || [],
        fallbackHTML: `<div class="pdf-text-box"><p>${loc.causes}</p></div>`
      },
      // 9. Visible Symptoms
      {
        id: "sec9",
        title: r.sec9VisibleSymptoms || "9. Visible Symptoms",
        leadText: loc.symptoms,
        bullets: loc.symptomsBullets || [],
        fallbackHTML: `<div class="pdf-text-box"><p>${loc.symptoms}</p></div>`
      },
      // 10. Possible Damage / Crop Loss
      {
        id: "sec10",
        title: r.sec10CropLoss || "10. Possible Damage / Crop Loss",
        html: `<div class="pdf-text-box pdf-warning-box"><p>${loc.damageRisk || r.defaultDamage || "If unmanaged, progressive foliar infections can decrease crop photosynthetic vigor and yield potential."}</p></div>`
      },
      // 11. How Serious Is the Problem?
      {
        id: "sec11",
        title: r.sec11HowSerious || "11. How Serious Is the Problem?",
        html: `<div class="pdf-text-box"><p>${ctx.seriousDisplay}</p></div>`
      },
      // 12. What Should I Do Right Now?
      {
        id: "sec12",
        title: r.sec12ImmediateActions || "12. What Should I Do Right Now?",
        html: `<div class="pdf-text-box"><p>${loc.immediateActionAdvice || r.immediateActionAdvice || "Immediately physically isolate or inspect nearby plants. Avoid handling or working among plants while foliage is wet. Sanitize pruning shears with 70% alcohol between cuts, and discontinue overhead sprinkler watering."}</p></div>`
      },
      // 13. Step-by-Step Action Plan
      {
        id: "sec13",
        title: r.sec13ActionPlan || "13. Step-by-Step Action Plan",
        steps: loc.actionSteps || []
      },
      // 14. Treatment & Control
      {
        id: "sec14",
        title: r.sec14TreatmentControl || "14. Treatment & Control Overview",
        html: `<div class="pdf-text-box"><p>${r.treatmentControlOverview || "Effective plant health management requires an integrated approach combining cultural sanitation, biological suppression, and label-approved interventions where appropriate."}</p></div>`
      },
      // 15. Non-Chemical Treatment
      {
        id: "sec15",
        title: r.sec15NonChemical || "15. Non-Chemical Treatment",
        html: `<div class="pdf-text-box"><p>${tc.nonChemical || r.defaultNonChemical || "Maintain canopy aeration, sanitize pruning shears, and utilize drip irrigation rather than overhead sprinkling."}</p></div>`
      },
      // 16. Biological Control
      {
        id: "sec16",
        title: r.sec16Biological || "16. Biological Control",
        html: `<div class="pdf-text-box"><p>${tc.biological || r.defaultBiological || "Consider beneficial bio-protectants, microbial antagonists, and organic formulations where registered and recognized."}</p></div>`
      },
      // 17. Chemical / Medicine / Pesticide Guidance
      {
        id: "sec17",
        title: r.sec17Chemical || "17. Chemical / Medicine / Pesticide Guidance",
        html: `
          <div class="pdf-text-box pdf-chemical-card">
            <p>${tc.chemical || r.defaultChemical || "Consult registered crop protection inputs according to official agricultural guidelines."}</p>
            <div class="pdf-chemical-alert">
              <strong>${r.chemicalNotice || "CRITICAL SAFETY ADVISORY: Always read and follow the manufacturer's label instructions carefully. Use a locally approved product according to the official label and consult a qualified agricultural expert for crop-specific treatment. Never invent chemical mixtures, and wear appropriate protective equipment during application."}</strong>
            </div>
          </div>
        `
      },
      // 18. Fertilizer / Khad Guidance
      {
        id: "sec18",
        title: r.sec18Fertilizer || "18. Fertilizer / Khad Guidance",
        html: `
          <div class="pdf-text-box">
            <p>${loc.fertilizerGuidance || r.defaultFertilizer || "Maintain balanced basal nutrition based on periodic soil testing. Avoid excessive chemical nitrogen applications which promote soft, succulent foliage susceptible to disease."}</p>
            <p style="margin-top: 6px; font-size: 0.74rem; color: #64748b; font-style: italic;">${r.fertilizerNotice || "Note: Fertilizers and manures are for plant nutrition and vitality. They are NOT medicines or curative treatments for plant disease."}</p>
          </div>
        `
      },
      // 19. What Should Be Avoided?
      {
        id: "sec19",
        title: r.sec19WhatToAvoid || "19. What Should Be Avoided?",
        html: `<div class="pdf-text-box pdf-warning-box"><p>${ctx.avoidDisplay}</p></div>`
      },
      // 20. How Can I Prevent It?
      {
        id: "sec20",
        title: r.sec20Prevention || "20. How Can I Prevent It?",
        leadText: loc.prevention,
        bullets: loc.preventionBullets || [],
        fallbackHTML: `<div class="pdf-text-box"><p>${loc.prevention}</p></div>`
      },
      // 21. Sustainable Plant-Care Tips
      {
        id: "sec21",
        title: r.sec21SustainableTips || "21. Sustainable Plant-Care Tips (IPM)",
        html: `<div class="pdf-tip-box"><div class="pdf-tip-icon">🌱</div><p class="pdf-tip-content">${loc.sustainableTip}</p></div>`
      },
      // 22. Expected Recovery Time
      {
        id: "sec22",
        title: r.sec22Recovery || "22. Expected Recovery Time",
        html: `<div class="pdf-text-box"><p>${ctx.recoveryDisplay}</p></div>`
      },
      // 23. Can the Plant Recover Completely?
      {
        id: "sec23",
        title: r.sec23CanItBeFixed || "23. Can the Plant Recover Completely?",
        html: `<div class="pdf-text-box"><p>${ctx.canFixDisplay}</p></div>`
      },
      // 24. When To Contact An Agricultural Expert
      {
        id: "sec24",
        title: r.sec24Expert || "24. When To Contact An Agricultural Expert",
        html: `<div class="pdf-text-box pdf-expert-box"><p>${loc.whenToConsultExpert || r.defaultExpert || "Consult a certified local agronomist or extension officer immediately if symptoms spread rapidly across multiple plants, or before applying chemical treatments."}</p></div>`
      },
      // 25. Sources & References
      {
        id: "sec25",
        title: r.sec25Sources || "25. Sources & References",
        html: `<div class="pdf-sources-box"><p>${loc.sources || r.defaultSources || "ICAR, FAO Integrated Pest Management Guidelines, and recognized agricultural university plant pathology extensions."}</p></div>`
      },
      // Safety & Accuracy Notice
      {
        id: "disclaimer",
        title: null,
        html: `
          <div class="pdf-disclaimer-card">
            <div class="pdf-disclaimer-title">⚠️ ${r.safetyNoticeHeading || "Safety & Accuracy Notice"}</div>
            <p class="pdf-disclaimer-text">${r.safetyNoticeText || "Plant health assessment from an image can be uncertain. This report provides AI-based preliminary decision support and should not replace in-person professional agricultural diagnosis. Confirm serious crop-health or chemical-treatment decisions with a qualified agricultural professional and follow locally approved product labels."}</p>
          </div>
        `
      }
    ];
  }

  // Dynamic A4 Page-by-Page Layout Engine
  function renderPaginatedReport(caseData, userImage, lang, targetContainer) {
    const ctx = buildReportContext(caseData, userImage, lang);
    targetContainer.innerHTML = "";
    const langClass = lang ? `pdf-lang-${lang}` : "pdf-lang-en";
    targetContainer.className = `pdf-page-container ${langClass} ${ctx.isRTL ? "pdf-rtl" : ""}`;

    // Page 1: Welcome / Cover Page
    const page1 = document.createElement("div");
    page1.className = `pdf-page pdf-cover-page ${langClass} ${ctx.isRTL ? "pdf-rtl" : ""}`;
    page1.innerHTML = buildCoverPageHTML(ctx);
    targetContainer.appendChild(page1);

    // Measuring Probe attached to DOM with exact typography styling
    const probe = document.createElement("div");
    probe.className = `pdf-page-container pdf-page ${langClass} ${ctx.isRTL ? "pdf-rtl" : ""}`;
    probe.style.cssText = "width: 722px; position: absolute; top: -9999px; left: 0; visibility: hidden; pointer-events: none; padding: 0; margin: 0; height: auto; max-height: none; overflow: visible;";
    (document.body || document.documentElement).appendChild(probe);

    // Measure standard header height
    probe.innerHTML = buildReportHeaderHTML(ctx);
    const headerH = probe.firstElementChild.offsetHeight + 12;

    const MAX_CONTENT_H = 1100 - 32 - 48; // 1020px total printable area inside 1100px page
    const MAX_BODY_H = MAX_CONTENT_H - headerH; // ~950px available for sections on each page

    function createNewReportPage() {
      const p = document.createElement("div");
      p.className = `pdf-page ${langClass} ${ctx.isRTL ? "pdf-rtl" : ""}`;
      p.innerHTML = `
        ${buildReportHeaderHTML(ctx)}
        <div class="pdf-page-content"></div>
      `;
      targetContainer.appendChild(p);
      return p.querySelector(".pdf-page-content");
    }

    let currentPageContent = createNewReportPage();
    let currentHeight = 0;

    const sections = buildSectionDescriptors(ctx);

    for (const sec of sections) {
      // 1. If section has structured steps (Action Plan)
      if (sec.steps && sec.steps.length > 0) {
        let pendingSteps = [...sec.steps];
        let isFirstBatch = true;

        while (pendingSteps.length > 0) {
          let stepsToTake = 0;
          let bestHeight = 0;
          let bestHTML = "";

          for (let i = 1; i <= pendingSteps.length; i++) {
            const sub = pendingSteps.slice(0, i);
            const stepItemsHTML = sub.map((st, idx) => `
              <div class="pdf-step-item">
                <div class="pdf-step-num">${sec.steps.indexOf(st) + 1}</div>
                <div class="pdf-step-text">${st}</div>
              </div>
            `).join("");

            const trialHTML = `
              <section class="pdf-section">
                <div class="pdf-section-header">
                  <h3 class="pdf-section-title">${sec.title}${isFirstBatch ? "" : ` (${ctx.r.continued || "Continued"})`}</h3>
                </div>
                <div class="pdf-steps-track">${stepItemsHTML}</div>
              </section>
            `;
            probe.innerHTML = trialHTML;
            const trialH = probe.firstElementChild.offsetHeight + 12;

            if (currentHeight + trialH <= MAX_BODY_H || (currentHeight === 0 && i === 1)) {
              stepsToTake = i;
              bestHeight = trialH;
              bestHTML = trialHTML;
            } else {
              break;
            }
          }

          if (stepsToTake === 0) {
            currentPageContent = createNewReportPage();
            currentHeight = 0;
          } else {
            const el = document.createElement("div");
            el.innerHTML = bestHTML;
            currentPageContent.appendChild(el.firstElementChild);
            currentHeight += bestHeight;
            pendingSteps = pendingSteps.slice(stepsToTake);
            isFirstBatch = false;
            if (pendingSteps.length > 0) {
              currentPageContent = createNewReportPage();
              currentHeight = 0;
            }
          }
        }
        continue;
      }

      // 2. If section has bullet points (Symptoms, Causes, Prevention)
      if (sec.bullets && sec.bullets.length > 0) {
        let pendingBullets = [...sec.bullets];
        let isFirstBatch = true;

        while (pendingBullets.length > 0) {
          let bulletsToTake = 0;
          let bestHeight = 0;
          let bestHTML = "";

          for (let i = 1; i <= pendingBullets.length; i++) {
            const sub = pendingBullets.slice(0, i);
            const bulletsHTML = sub.map((b) => `<li>${b}</li>`).join("");

            const trialHTML = `
              <section class="pdf-section">
                <div class="pdf-section-header">
                  <h3 class="pdf-section-title">${sec.title}${isFirstBatch ? "" : ` (${ctx.r.continued || "Continued"})`}</h3>
                </div>
                <div class="pdf-text-box">
                  ${isFirstBatch && sec.leadText ? `<p class="pdf-lead-text">${sec.leadText}</p>` : ""}
                  <ul class="pdf-bullet-list">${bulletsHTML}</ul>
                </div>
              </section>
            `;
            probe.innerHTML = trialHTML;
            const trialH = probe.firstElementChild.offsetHeight + 12;

            if (currentHeight + trialH <= MAX_BODY_H || (currentHeight === 0 && i === 1)) {
              bulletsToTake = i;
              bestHeight = trialH;
              bestHTML = trialHTML;
            } else {
              break;
            }
          }

          if (bulletsToTake === 0) {
            currentPageContent = createNewReportPage();
            currentHeight = 0;
          } else {
            const el = document.createElement("div");
            el.innerHTML = bestHTML;
            currentPageContent.appendChild(el.firstElementChild);
            currentHeight += bestHeight;
            pendingBullets = pendingBullets.slice(bulletsToTake);
            isFirstBatch = false;
            if (pendingBullets.length > 0) {
              currentPageContent = createNewReportPage();
              currentHeight = 0;
            }
          }
        }
        continue;
      }

      // 3. Standard Single Section
      const sectionEl = document.createElement("section");
      sectionEl.className = "pdf-section";
      sectionEl.innerHTML = `
        ${sec.title ? `
          <div class="pdf-section-header">
            <h3 class="pdf-section-title">${sec.title}</h3>
          </div>
        ` : ""}
        ${sec.html || sec.fallbackHTML || ""}
      `;

      probe.innerHTML = "";
      probe.appendChild(sectionEl.cloneNode(true));
      const secH = probe.firstElementChild.offsetHeight + 12;

      if (currentHeight + secH > MAX_BODY_H && currentHeight > 0) {
        currentPageContent = createNewReportPage();
        currentHeight = 0;
      }

      currentPageContent.appendChild(sectionEl);
      currentHeight += secH;
    }

    probe.remove();

    // Clean up any trailing empty page
    const allPages = targetContainer.querySelectorAll(".pdf-page");
    if (allPages.length > 1) {
      const lastP = allPages[allPages.length - 1];
      const content = lastP.querySelector(".pdf-page-content");
      if (!content || content.children.length === 0) {
        lastP.remove();
      }
    }
  }

  // Generates clean paginated HTML template for A4 PDF rendering
  function buildReportHTML(caseData, userImage, lang) {
    const dummy = document.createElement("div");
    renderPaginatedReport(caseData, userImage, lang, dummy);
    return dummy.innerHTML;
  }

  // Executes PDF compilation using html2pdf.js with dynamic pagination
  async function executePDFGeneration() {
    if (!activeCase || !activeImage) {
      console.error("PDF generation aborted: activeCase or activeImage is missing.");
      alert("Unable to generate the report right now. Please try again.");
      return;
    }

    isGenerating = true;
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = `
        <span class="report-spinner"></span>
        <span>Generating Report...</span>
      `;
    }

    // Safe staging wrapper (hidden from viewport layout) and staging container
    let wrapper = document.getElementById("pdfStagingWrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "pdfStagingWrapper";
      wrapper.className = "pdf-staging-wrapper";
      document.body.appendChild(wrapper);
    }

    let container = document.getElementById("pdfRenderStaging");
    if (!container) {
      container = document.createElement("div");
      container.id = "pdfRenderStaging";
      container.className = "pdf-render-staging";
      wrapper.appendChild(container);
    }

    // Render paginated pages into staging container
    // Ensure web fonts are completely loaded before measuring and rendering
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn("Font loading wait warning:", e);
      }
    }

    renderPaginatedReport(activeCase, activeImage, selectedLang, container);

    // Wait for all images inside container to load cleanly
    await new Promise((resolve) => {
      const imgs = container.querySelectorAll("img");
      if (imgs.length === 0) return resolve();
      let loaded = 0;
      const onDone = () => {
        loaded++;
        if (loaded >= imgs.length) resolve();
      };
      imgs.forEach((img) => {
        if (img.complete) onDone();
        else {
          img.addEventListener("load", onDone);
          img.addEventListener("error", onDone);
        }
      });
      setTimeout(resolve, 1500);
    });

    // Exact filename requested: PaudhCare AI Plant Health Report.pdf
    const filename = "PaudhCare AI Plant Health Report.pdf";

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        letterRendering: false, // letterRendering: false preserves native complex text shaping (HarfBuzz/DirectWrite) for Indic ligatures and Arabic cursive
        logging: false,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    };

    try {
      if (window.html2pdf) {
        const worker = window.html2pdf().set(opt).from(container);
        const pdf = await worker.toPdf().get("pdf");
        const numPages = pdf.internal.getNumberOfPages();
        if (!numPages || numPages < 1) {
          throw new Error("Generated PDF has no pages.");
        }

        // Stamp "PaudhCare AI" bottom center and "Page X of Y" bottom right on EVERY page
        for (let i = 1; i <= numPages; i++) {
          pdf.setPage(i);
          const pageWidth = pdf.internal.pageSize.getWidth ? pdf.internal.pageSize.getWidth() : 210;
          const pageHeight = pdf.internal.pageSize.getHeight ? pdf.internal.pageSize.getHeight() : 297;

          // Bottom Center: PaudhCare AI
          pdf.setFontSize(8.5);
          pdf.setTextColor(20, 69, 47); // PaudhCare deep forest brand green #14452f
          try {
            pdf.text("PaudhCare AI", pageWidth / 2, pageHeight - 6, { align: "center" });
          } catch (e) {
            const tw = pdf.getTextWidth ? pdf.getTextWidth("PaudhCare AI") : 20;
            pdf.text("PaudhCare AI", (pageWidth - tw) / 2, pageHeight - 6);
          }

          // Bottom Right: Page X of Y
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139); // slate-500
          try {
            pdf.text(`Page ${i} of ${numPages}`, pageWidth - 14, pageHeight - 6, { align: "right" });
          } catch (e) {
            pdf.text(`Page ${i} of ${numPages}`, pageWidth - 32, pageHeight - 6);
          }
        }

        // Validate byte stream before download (ensure non-blank)
        const pdfDataUri = pdf.output("datauristring");
        if (!pdfDataUri || pdfDataUri.length < 50000) {
          throw new Error("Generated PDF output is suspiciously small or empty: " + (pdfDataUri ? pdfDataUri.length : 0) + " bytes");
        }

        await worker.save();
      } else {
        // Fallback to print
        window.print();
      }
      showReportSuccessToast(filename);
      closeModal();
    } catch (err) {
      console.error("Technical PDF Generation Error:", err);
      alert("Unable to generate the report right now. Please try again.");
    } finally {
      isGenerating = false;
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download PDF Report</span>
        `;
      }
      // Clean up staging container
      if (container) {
        container.innerHTML = "";
      }
    }
  }

  function showReportSuccessToast(filename) {
    const toast = document.createElement("div");
    toast.className = "report-toast-success";
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>Report downloaded successfully: <strong>${filename}</strong></span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  return {
    init,
    openModal,
    closeModal,
    buildReportHTML,
    renderPaginatedReport,
    executePDFGeneration
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", PaudhCareReportGenerator.init);
} else {
  PaudhCareReportGenerator.init();
}

window.PaudhCareReportGenerator = PaudhCareReportGenerator;
window.AgriVisionReportGenerator = PaudhCareReportGenerator;
