# PaudhCare AI — AI-Powered Plant Disease Detection and Sustainable Crop Support

**1M1B AI for Sustainability Virtual Internship**  
*In collaboration with IBM SkillsBuild & AICTE*  
**Primary SDG:** SDG 2 – Zero Hunger  

---

## 1. Project Overview
**PaudhCare AI** is an award-worthy, educational, and decision-support web platform designed to empower smallholder farmers, agricultural extension workers, and agronomy students with accessible plant pathology insights. By analyzing photographs of affected crop leaves, PaudhCare AI assists in the early detection of foliar pathogens and provides sustainable, eco-friendly crop care recommendations to mitigate avoidable harvest loss.

---

## 2. Problem Statement
Crop diseases represent one of the most critical threats to global food security. According to the Food and Agriculture Organization (FAO), plant diseases cost the global economy over $220 billion annually, with smallholder farmers bearing the heaviest burden due to:
- Lack of timely access to certified agricultural extension officers.
- Inability to accurately distinguish between early-stage fungal, bacterial, or physiological symptoms.
- Over-reliance on blanket chemical fungicides and pesticides, which degrades soil microbiomes, pollutes local water tables, and accelerates pathogen resistance.

Early, accessible, visual disease recognition paired with responsible cultural advice directly addresses this knowledge divide.

---

## 3. UN SDG Alignment: SDG 2 – Zero Hunger
PaudhCare AI directly advances **United Nations Sustainable Development Goal 2: Zero Hunger**, specifically addressing key sub-targets:

- **Target 2.4 (Sustainable Food Production Systems):** Encourages proactive cultural and biological disease management practices (such as canopy aeration, sanitizing pruning shears, and crop rotation) that protect crop yields without chemical soil depletion.
- **Target 2.3 (Smallholder Agricultural Productivity):** democratizes scientific agronomic advisory tools for small-scale family farmers who lack on-demand access to laboratory diagnostics.
- **Target 2.A (Agricultural Knowledge & Technology):** Bridges the digital divide by translating complex plant pathology research into intuitive, visual guidance.

*Ethical Disclosure:* In compliance with responsible reporting standards, this prototype does not assert unverified quantitative percentages regarding global yield increases; rather, it highlights qualitative decision-support enablement.

---

## 4. Target Users
1. **Smallholder & Community Farmers:** Requiring quick, field-level guidance to spot early symptoms before field-wide contagion occurs.
2. **Agricultural Extension Workers & Field Officers:** Utilizing a standardized digital reference to educate farming cooperatives.
3. **Agronomy & Agriculture Students:** Learning foliar disease identification and sustainable Integrated Pest Management (IPM) techniques.
4. **Urban & Greenhouse Growers:** Monitoring micro-climates and localized container crops.

---

## 5. The Role of Artificial Intelligence
PaudhCare AI harnesses a multimodal artificial intelligence architecture divided into four functional stages:
1. **Image Understanding:** Computer vision algorithms preprocess the leaf image, normalizing outdoor lighting variations and extracting foliar contours, venation networks, and chlorotic zones.
2. **Classification & Pattern Recognition:** Deep neural networks compare observed visual anomalies against structured symptom datasets (such as the PlantVillage repository).
3. **Agronomic Information Generation:** Language and reasoning models (such as IBM Granite or Google Gemini Vision) translate diagnostic probabilities into practical, plain-language agronomic instructions.
4. **Decision Support:** Serves strictly as an advisory co-pilot for human growers, preserving human agency and discouraging automated chemical interventions.

*Note on IBM Granite:* In production architectures, IBM Granite models function as enterprise foundation models for generating structured agronomic summaries and safety guidelines. In this client prototype, agronomic knowledge is deterministically structured in `js/data.js` to enable zero-dependency offline demonstration.

---

## 6. Technology Stack
- **Frontend Architecture:** Clean, modern Semantic HTML5 and Vanilla ES6+ JavaScript.
- **Design System:** Custom CSS3 with Apple-grade spacing, glassmorphism (`backdrop-filter`), CSS Grid/Flexbox, and responsive typography (Inter font family).
- **Zero External Dependencies:** Built without bulky frameworks (no React or Node build steps required), ensuring that any evaluator can run the application instantly in any browser.
- **Micro-Interactions & Animation:** CSS keyframe animations for laser scanning lines, pulsing radar nodes, and smooth state reveals.
- **Asset Pipeline:** Scalable Vector Graphics (SVG) crafted specifically for high-contrast botanical diagnostics, with remote high-definition Unsplash fallbacks.

---

## 7. How the Workflow Works
The user journey follows a 5-step intuitive pipeline:
```
[01 Upload] ➔ [02 AI Vision] ➔ [03 Identify] ➔ [04 Guide] ➔ [05 Act Sustainably]
```
- **01 Upload:** User snaps or uploads a clear leaf photo via drag-and-drop.
- **02 AI Vision:** The system scans the leaf surface for tissue necrosis and color shifts.
- **03 Identify:** The model correlates symptoms to identify potential pathogens.
- **04 Guide:** The dashboard surfaces categorized Symptoms, Prevention, and Suggested Actions.
- **05 Act Sustainably:** The grower implements cultural practices to arrest disease spread while protecting the agroecosystem.

---

## 8. Transparent Demo Mode
PaudhCare AI features a prominently labeled **Demo Mode** to allow evaluators to inspect the full UI/UX and agronomic response system without requiring external API keys:
- **Sample Presets:** Features 3 pre-configured agricultural case studies:
  1. **Tomato — Possible Late Blight** (*Phytophthora infestans*)
  2. **Potato — Possible Early Blight** (*Alternaria solani*)
  3. **Healthy Tomato Leaf** (*Normal Foliage*)
- **Confidence Integrity:** In Demo Mode, confidence is strictly displayed as:  
  `Confidence: Not available`  
  *No artificial percentages or simulated scores are ever displayed.*
- **Optional API Connector:** Includes an in-app **AI Model Settings** modal where evaluators can supply a live Vision API key (e.g. Gemini Vision API) to test live inference.

---

## 9. Responsible AI Framework
Built in alignment with ethical AI principles:
- **Fairness:** Highlights the necessity of multi-cultivar, multi-geographic training data to prevent regional diagnostic bias.
- **Transparency:** Clearly discloses whether results originate from the educational Demo Mode or live model inference.
- **Privacy:** Processes images statelessly on the client side without storing personal metadata or GPS tracking.
- **Human Oversight:** Mandates human verification. Prominently displays the official disclaimer:
  > *"This prototype provides AI-based educational and decision-support information. It is not a professional agricultural diagnosis."*

---

## 10. How to Run Locally

### Method 1: Instant Direct Launch (Recommended)
Double-click `index.html` or `start-server.bat` in the project root:
- The website opens immediately in Microsoft Edge, Google Chrome, Mozilla Firefox, or any modern web browser.
- No installation of Node.js, Python, or packages is required.

### Method 2: Via PowerShell
Run the included launcher:
```powershell
.\start-server.ps1
```

---

## 11. Future Scope
1. **Edge On-Device Inference:** Quantizing lightweight models (TensorFlow Lite / ONNX) to run real-time inference directly in mobile browsers without requiring internet connectivity.
2. **Multilingual Voice Support:** Integrating voice inputs and regional languages (Hindi, Spanish, Swahili, etc.) to aid non-literate smallholders.
3. **Weather & Microclimate Correlation:** Integrating localized meteorological APIs to alert farmers when humidity and temperature conditions favor fungal sporulation.
4. **Community Agronomist Verification Portal:** Enabling farmers to flag ambiguous images for asynchronous review by certified agricultural extension officers.
