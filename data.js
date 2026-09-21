/**
 * PaudhCare AI — Agronomic Knowledge Base & Data Service
 * Standardized data schema for plant disease guidance conforming to Section 7
 * and Section 10 requirements. Includes 5-part Treatment & Control,
 * cautious contributing factors, 5 numbered action steps, and verified sources.
 */

const PaudhCareDataService = (function () {
  const diseaseProfiles = [
    {
      id: "tomato-late-blight",
      crop: "Tomato",
      plant: "Tomato (Solanum lycopersicum)",
      possibleCondition: "Possible Tomato Late Blight",
      scientificName: "Phytophthora infestans",
      confidence: null, // Displays "Confidence: Not available" unless provided by live model
      severity: "High Priority Attention",
      isHealthy: false,
      image: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07?auto=format&fit=crop&w=800&q=80",
      localFallback: "assets/images/sample-tomato.svg",
      whatWasDetected: "Irregular, water-soaked necrotic lesions observed on foliar tissue with chlorotic outer margins.",
      symptoms: "Dark, irregular water-soaked spots that expand rapidly in damp, cool conditions.",
      symptomsBullets: [
        "Rapidly expanding brown-to-black necrotic lesions on leaves and petioles",
        "Pale pale-green or yellow chlorotic halos surrounding mature lesion borders",
        "Delicate whitish downy fungal-like sporulation visible on leaf undersides in humid conditions",
        "Brittle, dark brown collapse of affected foliar stems during severe progression"
      ],
      causes: "May be associated with prolonged foliar moisture, cool-to-moderate temperatures (15–22°C), and high relative humidity (>90%).",
      causesBullets: [
        "High relative humidity combined with extended hours of free water on leaf surfaces",
        "Cool night temperatures followed by overcast, humid daytime conditions",
        "Spore dispersal via wind-driven rain or splashing from infected neighboring plants",
        "Overhead sprinkler irrigation that prolongs foliar dampness"
      ],
      actionSteps: [
        "Quarantine affected plants immediately and avoid walking through wet foliage to prevent spore transport.",
        "Sanitize all pruning shears with a 70% alcohol or 10% bleach solution before and after every cut.",
        "Carefully prune out heavily infected lower foliage, seal in bags, and dispose away from composting areas.",
        "Transition immediately to base-level drip irrigation to keep upper leaf surfaces completely dry.",
        "Consult a certified local agricultural extension officer to confirm pathogen presence and discuss approved options."
      ],
      treatmentControl: {
        immediate: "Immediately isolate affected plants, prune heavily diseased leaves with sterilized shears, and discard in sealed trash bags away from compost.",
        nonChemical: "Increase row spacing to at least 75 cm to maximize cross-canopy ventilation; stake or cage indeterminate vines to elevate foliage above damp ground.",
        biological: "Consider preventive foliar applications of bio-control agents such as Bacillus subtilis or Trichoderma harzianum strains where recommended locally.",
        chemical: "If disease pressure is severe and confirmed by extension specialists, consult locally registered protective fungicides (e.g., copper hydroxide or mancozeb). ALWAYS read and strictly follow the official product label for crop-specific dosage, dilution, pre-harvest intervals (PHI), and safety precautions. Do not fabricate application rates.",
        safety: "Wear appropriate personal protective equipment (PPE) including chemical-resistant gloves, protective eyewear, long-sleeved clothing, and a particulate respirator during all foliar treatments."
      },
      prevention: "Implement preventive cultural hygiene, wide plant spacing, drip irrigation, and resistant hybrid varieties.",
      preventionBullets: [
        "Rotate solanaceous crops (tomato, potato, pepper, eggplant) with non-host crops on a 3-year cycle",
        "Plant certified disease-free seeds and blight-resistant tomato cultivars",
        "Apply organic straw mulch around plant stems to prevent rain-splash from soil"
      ],
      whatIsThisProblem: "Late blight is a destructive, fast-spreading disease caused by the fungus-like oomycete pathogen Phytophthora infestans. It primarily attacks tomato and potato foliage, stems, and developing fruits, causing water-soaked rot that can rapidly collapse healthy canopies during cool, wet conditions.",
      damageRisk: "If left unmanaged under cool and humid weather, rapid foliar destruction can occur within 7 to 14 days, resulting in complete defoliation, brown leathery fruit rot, and severe harvest loss.",
      severityLevel: "High Priority Attention (Severe foliar risk under damp conditions)",
      howSeriousIsIt: "Assessment cannot confirm internal systemic spread from an image alone. Foliar damage is visible, and timely action is recommended to prevent spreading to healthy foliage and surrounding plants.",
      recoveryTime: "Recovery time cannot be reliably predicted from an image alone. Recovery depends on weather conditions, plant vigor, crop growth stage, and prompt execution of management measures. Typically new flush appears in 2–3 weeks under favorable conditions.",
      canItBeFixed: "Leaves already displaying necrosis or severe lesions cannot regain healthy green tissue. However, with recommended treatment and cultural care, new emerging shoots, leaves, and buds can grow completely healthy.",
      whatShouldBeAvoided: "Avoid overhead sprinkler irrigation that keeps leaves wet for hours. Avoid working in the field when foliage is wet. Avoid excessive chemical nitrogen fertilizer, which promotes soft susceptible tissue. Do not dump infected tomato foliage in open compost heaps.",
      fertilizerGuidance: "Maintain balanced N-P-K plant nutrition based on soil tests. Avoid excessive nitrogen fertilizers, which stimulate lush, succulent vegetative growth that is particularly susceptible to blight infection. Incorporate organic compost to support root health. Note: Late blight is an infectious pathogen, not a nutrient deficiency, and cannot be corrected with fertilizers alone.",
      whenToConsultExpert: "Consult a certified local agronomist or extension officer immediately if: (1) Lesions expand rapidly across multiple plants within 48 hours; (2) Weather forecasts predict prolonged rain and cool conditions; (3) You are considering registered chemical fungicides; or (4) Adjacent solanaceous crops (potato, pepper) show symptoms.",
      sustainableTip: "Fostering good airflow, drip irrigation, and proactive canopy pruning minimizes reliance on chemical fungicides while safeguarding soil ecology.",
      importantNote: "AI assessments are automated preliminary screenings. Always consult a certified local agronomist or extension professional before making chemical application decisions.",
      sources: "ICAR-IIHR Tomato Disease Management Guidelines; FAO Integrated Pest Management (IPM); TNAU Agritech Portal; Cornell Vegetable MD Online."
    },
    {
      id: "potato-early-blight",
      crop: "Potato",
      plant: "Potato (Solanum tuberosum)",
      possibleCondition: "Possible Potato Early Blight",
      scientificName: "Alternaria solani",
      confidence: null,
      severity: "Moderate Priority",
      isHealthy: false,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
      localFallback: "assets/images/sample-potato.svg",
      whatWasDetected: "Concentric circular necrotic rings ('target-board' pattern) with distinct yellow chlorotic rings on mature leaflets.",
      symptoms: "Small brown to dark circular spots with distinct concentric rings appearing on older lower foliage.",
      symptomsBullets: [
        "Circular to angular brown lesions displaying distinct concentric ridges ('target-board' appearance)",
        "Progressive yellow chlorosis developing around expanding necrotic areas",
        "Premature leaf senescence starting from the base of the plant moving upward",
        "Dark, sunken, dry lesions on tuber surfaces if spores wash into soil"
      ],
      causes: "May be associated with alternating wet and dry weather cycles, nutrient stress (low nitrogen/potassium), and aging plant tissue.",
      causesBullets: [
        "Alternating periods of heavy dew or light rain followed by warm, dry daytime weather",
        "Spore survival on infected solanaceous crop residues left in the soil",
        "Plant stress resulting from inadequate soil fertility, drought, or nematode feeding",
        "Overhead irrigation splashing fungal conidia onto lower leaf surfaces"
      ],
      actionSteps: [
        "Inspect the lowest leaves on several potato plants across the field to determine infection spread.",
        "Prune and safely destroy lower leaves exhibiting severe concentric rings to reduce sporulation.",
        "Verify soil potassium and nitrogen levels to relieve physiological nutrient stress.",
        "Switch from overhead watering to furrow or drip irrigation to limit foliar wetting hours.",
        "Reach out to your regional Krishi Vigyan Kendra (KVK) or extension specialist for local spray advisories."
      ],
      treatmentControl: {
        immediate: "Remove and burn or bury infected lower leaves that touch the soil surface to break the spore multiplication cycle.",
        nonChemical: "Apply a 5–7 cm layer of clean organic straw mulch around plant bases to suppress fungal splash from the soil bed.",
        biological: "Apply registered bio-fungicides containing Trichoderma viride or Pseudomonas fluorescens as soil amendments and foliar sprays in early morning.",
        chemical: "If recommended by an agricultural officer, apply approved contact protectants (such as copper oxychloride or chlorothalonil). ALWAYS check the registered container label for authorized dilution rates, safety intervals, and maximum application limits. Never guess chemical concentrations.",
        safety: "Always wear waterproof rubber gloves, protective goggles, long trousers, and a face covering when handling agricultural inputs."
      },
      prevention: "Maintain balanced soil fertility, apply clean mulch to prevent rain-splash from soil, and practice seasonal crop rotation.",
      preventionBullets: [
        "Practice a strict 3- to 4-year crop rotation avoiding solanaceous plants (potato, tomato, eggplant)",
        "Plant certified disease-free seed tubers with balanced basal fertilizer application",
        "Destroy all potato haulms and solanaceous volunteer weeds after harvest"
      ],
      whatIsThisProblem: "Early blight is a prevalent fungal disease caused by Alternaria solani. It primarily targets older, lower potato foliage and stems, producing distinctive concentric circular lesions. Under severe infection, it can also lead to dry, corky rot on developing tubers.",
      damageRisk: "Premature defoliation of lower and middle leaves reduces photosynthetic energy for tuber bulking, leading to smaller potato yields. In storage, infected tubers may develop dry, sunken rot.",
      severityLevel: "Moderate Priority (Progressive lower canopy infection)",
      howSeriousIsIt: "Visual screening cannot confirm internal systemic spread from an image alone. Early blight lesions reduce photosynthetic area, and prompt cultural management is needed to prevent progression up the canopy.",
      recoveryTime: "Recovery time cannot be reliably predicted from an image alone. Depends on ambient humidity, soil fertility, and canopy airflow. New healthy foliage typically emerges within 2 to 3 weeks if stress factors are corrected.",
      canItBeFixed: "Leaves with concentric necrotic target spots cannot heal damaged cells. Management stops pathogen spread so new upper leaves and developing tubers remain protected.",
      whatShouldBeAvoided: "Avoid overhead irrigation that splashes soil spores onto foliage. Avoid nitrogen deficiency followed by late-season over-fertilization. Do not leave harvested infected haulms on the field surface.",
      fertilizerGuidance: "Adequate potassium and nitrogen fertility helps prevent early physiological plant senescence, which makes foliage more vulnerable to Alternaria spores. Avoid applying excessive late-season nitrogen, and conduct annual soil testing. Never apply foliar fertilizer onto heavily diseased leaf tissue.",
      whenToConsultExpert: "Consult your local Krishi Vigyan Kendra (KVK) or extension specialist if: (1) Concentric lesions begin spreading to the upper plant canopy before tuber maturation; (2) Yield loss threatens commercial harvest; or (3) Weather conditions alternate between wet dews and warm dry periods.",
      sustainableTip: "Fostering biologically active soils with organic compost strengthens plant defenses and naturally suppresses fungal pathogen development.",
      importantNote: "Guidance is educational. Always follow regional plant protection advisories and verify recommendations with qualified agronomists.",
      sources: "ICAR-CPRI Potato Pathology Manual; TNAU Agritech Portal; PlantVillage Disease Guide; University of Idaho Extension."
    },
    {
      id: "corn-common-rust",
      crop: "Sweet Corn / Maize",
      plant: "Sweet Corn / Maize (Zea mays)",
      possibleCondition: "Possible Common Corn Rust",
      scientificName: "Puccinia sorghi",
      confidence: null,
      severity: "Moderate Priority",
      isHealthy: false,
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
      localFallback: "assets/images/sample-corn.svg",
      whatWasDetected: "Elevated cinnamon-brown to golden-orange pustules rupturing foliar epidermis on upper and lower blade surfaces.",
      symptoms: "Elongated, powdery golden-brown to cinnamon pustules scattered across both leaf surfaces.",
      symptomsBullets: [
        "Small, circular to elongated cinnamon-brown pustules (uredinia) on both upper and lower leaf surfaces",
        "Epidermal leaf skin rupturing around powdery fungal spores",
        "Pustules turning dark brownish-black late in the season as teliospores form",
        "Foliar yellowing and chlorotic streaking in heavily infected leaves"
      ],
      causes: "May be associated with moderate temperatures (16–25°C), high relative humidity (>95%), and windborne urediniospores.",
      causesBullets: [
        "Windborne rust spores carried from southern or warmer overwintering zones",
        "Cool to moderate temperatures coupled with 6 or more hours of continuous leaf wetness",
        "High planting densities reducing air circulation within the corn canopy",
        "Susceptible field corn or sweet corn hybrid varieties"
      ],
      actionSteps: [
        "Walk a 'W' or 'Z' pattern through the field to assess the percentage of leaves showing active pustules.",
        "Record the growth stage of the corn (pre-tasseling, silking, or grain-fill) to guide economic threshold decisions.",
        "Ensure uniform field drainage and avoid overhead irrigation during humid evenings.",
        "Document pustule density and compare with regional extension threshold bulletins.",
        "Contact your district agricultural extension officer to verify if treatment is economically justified."
      ],
      treatmentControl: {
        immediate: "Monitor pustule development every 3–4 days; remove severely infested isolated border leaves if planting is small-scale.",
        nonChemical: "Optimize crop row orientation to harness prevailing wind patterns and expedite morning canopy drying.",
        biological: "Explore beneficial bio-stimulants and foliar microbial inoculants that enhance systemic acquired resistance (SAR) in corn tissues.",
        chemical: "In sweet corn where cosmetic quality is vital, or high-value seed corn before silking, consult local extension for approved fungicides (such as azoxystrobin or propiconazole). ALWAYS refer to the official manufacturer's label for exact application timings, dilution rates, and pre-harvest intervals. Never use unapproved mixtures.",
        safety: "Wear personal protective equipment (PPE) including protective coveralls, chemical gloves, eye protection, and a respirator during foliar applications."
      },
      prevention: "Plant rust-resistant or tolerant corn hybrids and maintain balanced field fertility.",
      preventionBullets: [
        "Select certified corn hybrids with specific single-gene (Rp) or partial rust resistance",
        "Avoid late-season planting when airborne spore counts are highest",
        "Ensure balanced soil potassium to prevent premature stalk and leaf weakening"
      ],
      whatIsThisProblem: "Common corn rust is a foliar fungal disease caused by Puccinia sorghi. It produces powdery, cinnamon-brown pustules on both upper and lower leaf surfaces, weakening photosynthetic capacity and water retention in maize plants.",
      damageRisk: "Heavy pustule coverage on upper leaves during critical grain-filling stages reduces ear weight, decreases kernel test weight, and can predispose stalks to lodging and breakage.",
      severityLevel: "Moderate Priority (Airborne foliar pustule development)",
      howSeriousIsIt: "Image screening cannot evaluate total pustule coverage across the whole field canopy. However, active rust pustules on upper leaves can compromise photosynthesis during critical grain fill.",
      recoveryTime: "Recovery time cannot be reliably predicted from an image alone. Maize leaves do not shed rust pustules, but under warmer, drier conditions and appropriate intervention, secondary spore cycles decline within 10–14 days.",
      canItBeFixed: "Existing rust pustules remain visible as dry scars. Crop health recovery is measured by normal tasseling and grain development without widespread upper canopy blighting.",
      whatShouldBeAvoided: "Avoid excessively dense crop spacing that blocks wind penetration. Avoid overhead late-afternoon irrigation that extends leaf wetness through the night.",
      fertilizerGuidance: "Maintain balanced soil fertility, ensuring adequate potassium to reinforce plant cell walls and promote natural stalk strength. Avoid over-application of nitrogen, which prolongs lush, humid canopy conditions. Base all fertilizer additions on verified soil test results.",
      whenToConsultExpert: "Consult an agricultural extension specialist if: (1) Rust pustules appear on leaves above the ear leaf before or during silking; (2) High-value sweet corn or hybrid seed crops are affected; or (3) Regional disease advisories report high airborne spore counts.",
      sustainableTip: "Planting resistant hybrids is the most sustainable and cost-effective strategy to control corn rust without environmental disturbance.",
      importantNote: "Field threshold assessment is necessary before any intervention. Consult local extension authorities for economic threshold criteria in your region.",
      sources: "ICAR-IIMR Maize Pathology Division; Purdue Extension Field Crops IPM; CIMMYT Corn Disease Compendium; FAO Plant Production."
    },
    {
      id: "tomato-leaf-curl",
      crop: "Tomato",
      plant: "Tomato (Solanum lycopersicum)",
      possibleCondition: "Possible Tomato Leaf Curl Virus (ToLCV)",
      scientificName: "Tomato Leaf Curl Begomovirus",
      confidence: null,
      severity: "High Priority Attention",
      isHealthy: false,
      image: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07?auto=format&fit=crop&w=800&q=80",
      localFallback: "assets/images/sample-tomato.svg",
      whatWasDetected: "Pronounced upward curling and cupping of leaflet margins with interveinal chlorosis and stunted shoot growth.",
      symptoms: "Upward curling, puckering, and yellowing of young leaves accompanied by stunted plant habit.",
      symptomsBullets: [
        "Severe upward curling and cupping of leaflets, giving a crinkled appearance",
        "Interveinal chlorosis with pale yellowish margins on new growth",
        "Stunting of the main stem and shortened internodes creating a bushy habit",
        "Flower drop and significantly reduced fruit set if infected early in development"
      ],
      causes: "May be associated with whitefly (Bemisia tabaci) vector feeding during warm, dry conditions.",
      causesBullets: [
        "Transmission by the silverleaf whitefly (Bemisia tabaci) acting as an active insect vector",
        "Warm, dry microclimates that accelerate whitefly reproductive cycles",
        "Presence of infected solanaceous weed hosts (e.g., Datura, Solanum nigrum) near field borders",
        "Absence of insect barriers or physical row covers during seedling nursery stages"
      ],
      actionSteps: [
        "Rogue (uproot) and destroy severely infected stunted plants immediately to stop vector transmission.",
        "Install yellow sticky traps (1 trap per 100 sq meters) across the field to monitor whitefly population spikes.",
        "Inspect the undersides of young leaves with a hand lens for tiny whitefly nymphs and adults.",
        "Clear all broadleaf weeds from field borders and bunds that serve as alternate viral reservoirs.",
        "Consult your local Krishi Vigyan Kendra (KVK) for integrated whitefly vector management recommendations."
      ],
      treatmentControl: {
        immediate: "Rogue out infected plants, bag them in plastic on-site, and remove them completely from the field area.",
        nonChemical: "Erect 40-50 mesh insect-proof net covers in seedling nurseries; install reflective silver plastic mulch to disorient incoming whiteflies.",
        biological: "Conserve natural predators such as ladybird beetles, lacewings, and mirid bugs; spray registered neem oil (azadirachtin) or entomopathogenic fungi (Beauveria bassiana).",
        chemical: "To control high vector densities, consult certified agronomists for approved selective insecticides (such as imidacloprid or acetamiprid) applied at seedling/transplant stage. STRICTLY follow the manufacturer label for authorized dose, dilution rate, and withholding intervals. Do not apply broad-spectrum sprays that harm pollinators.",
        safety: "Wear protective gloves, protective goggles, long trousers, and a mask whenever preparing botanical or chemical sprays."
      },
      prevention: "Use viral-resistant hybrids, insect netting in nurseries, and weed-free border buffers.",
      preventionBullets: [
        "Grow ToLCV-resistant tomato hybrids (e.g., Arka Rakshak, Arka Abhed)",
        "Raise tomato nursery seedlings under 40-mesh insect-proof nylon nets",
        "Plant border barrier crops such as 3 rows of maize or pearl millet around the tomato field"
      ],
      whatIsThisProblem: "Tomato Leaf Curl is a serious viral disease caused by Tomato Leaf Curl Begomovirus (ToLCV) and transmitted between plants by the silverleaf whitefly (Bemisia tabaci). It causes severe leaf curling, stunting, and bushy vegetative growth.",
      damageRisk: "Early infection before flowering can cause near-complete crop failure, leading to severe blossom drop and negligible fruit production. Later infections cause stunted growth and unmarketable small, deformed fruit.",
      severityLevel: "High Priority Attention (Systemic viral infection with insect vector transmission)",
      howSeriousIsIt: "Visual screening confirms characteristic viral foliar symptoms. Because ToLCV is a systemic begomovirus, infected plants cannot be cured and pose an infection reservoir for surrounding crops.",
      recoveryTime: "Recovery time cannot be reliably predicted from an image alone. Once systemically infected, the plant itself does not recover, but prompt rogueing and vector control protect the remaining crop.",
      canItBeFixed: "Systemic viral diseases cannot be reversed in infected plants. Management focuses on rogueing infected specimens, insect netting, and controlling whitefly vectors to safeguard healthy plants.",
      whatShouldBeAvoided: "Avoid leaving infected stunted plants in the ground. Avoid uncontrolled broadleaf weeds around field margins that harbor whiteflies. Avoid excessive nitrogen applications that attract sap-feeding insects.",
      fertilizerGuidance: "Ensure balanced basal nutrition to keep plants vigorous, but do NOT apply extra fertilizer expecting to cure viral symptoms. Viral diseases are systemic infections that cannot be reversed by nutrients, and excess nitrogen will attract more sap-feeding whitefly vectors.",
      whenToConsultExpert: "Consult an agricultural extension officer or plant pathologist if: (1) Whitefly populations are visible on leaf undersides; (2) Symptoms appear in nursery beds or early transplants; or (3) Neighboring vegetable fields show widespread curling.",
      sustainableTip: "Reflective mulches, yellow sticky traps, and resistant cultivars effectively control viral vectors while preserving beneficial pollinators.",
      importantNote: "Plant viruses cannot be cured once inside the vascular system. Focus strictly on vector management and removing infected plants.",
      sources: "ICAR-IIHR Viral Disease Management; TNAU Agritech Crop Protection; FAO Integrated Vector Management; World Vegetable Center (AVRDC)."
    },
    {
      id: "healthy-foliage",
      crop: "Healthy Foliage",
      plant: "Crop Foliage (Solanum lycopersicum / Solanum tuberosum)",
      possibleCondition: "Healthy Plant Tissue",
      scientificName: "Normal Foliage (Intact Chlorophyll)",
      confidence: null,
      severity: "Optimal Health",
      isHealthy: true,
      image: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07?auto=format&fit=crop&w=800&q=80",
      localFallback: "assets/images/sample-healthy.svg",
      whatWasDetected: "Uniform, vibrant green chlorophyll distribution across the leaf blade with intact margins and no visible lesions.",
      symptoms: "Foliage exhibits vibrant, uniform green coloration with intact cellular margins and no visible lesions.",
      symptomsBullets: [
        "Even chlorophyll distribution across upper and lower blade surfaces",
        "Supple leaf petioles with strong cellular turgor and clear venation",
        "Intact leaf margins without necrotic spots, halos, curling, or sporulation",
        "Active photosynthetic growth without signs of pest feeding or pathogen colonization"
      ],
      causes: "Associated with balanced soil nutrients, adequate sunlight (6–8 hours), clean irrigation, and strong agronomic care.",
      causesBullets: [
        "Balanced soil nitrogen, phosphorus, and potassium levels supporting strong cell wall integrity",
        "Adequate ground moisture without waterlogging or root suffocation",
        "Optimal sunlight exposure driving active photosynthesis",
        "Routine cultural cleanliness and proactive crop scouting"
      ],
      actionSteps: [
        "Maintain current drip irrigation and soil moisture levels to avoid drought or overwatering stress.",
        "Conduct routine weekly visual inspections of leaf undersides to detect any emerging pest pressures early.",
        "Keep garden hand tools sanitized with alcohol after routine maintenance.",
        "Record baseline leaf color and vigor in your farm log for seasonal comparison.",
        "Continue balanced organic compost feeding to sustain soil microbial biodiversity."
      ],
      treatmentControl: {
        immediate: "No curative intervention required. Continue current proactive crop management routines.",
        nonChemical: "Maintain clean weed-free perimeter buffers and ensure uniform soil drainage across the field.",
        biological: "Apply compost tea or beneficial mycorrhizal root inoculants to enhance natural plant systemic vigor.",
        chemical: "No chemical treatment is indicated or recommended. Chemical applications on healthy foliage are wasteful, uneconomic, and can harm beneficial insects.",
        safety: "Standard garden hygiene: wash hands with soap and water after handling garden soil and equipment."
      },
      prevention: "Maintain consistent watering routines, ensure proper sunlight exposure, and sustain balanced soil nutrients.",
      preventionBullets: [
        "Water at ground level via drip lines early in the morning to keep foliage dry",
        "Apply organic straw or leaf mulch to preserve soil moisture and regulate root temperature",
        "Implement balanced organic soil nutrition with well-composted farmyard manure"
      ],
      whatIsThisProblem: "No pathogenic disease or foliar abnormality was detected. The analyzed leaf exhibits uniform chlorophyll distribution, healthy vascular venation, and intact cell structure.",
      damageRisk: "No current disease risk or yield loss detected. The crop demonstrates normal physiological vigor.",
      severityLevel: "Optimal Health (Intact cellular chlorophyll, no active lesions)",
      howSeriousIsIt: "No foliar disease detected. The plant exhibits normal vegetative health and photosynthetic vigor.",
      recoveryTime: "Not applicable. The plant is currently healthy. Continue standard irrigation and crop maintenance.",
      canItBeFixed: "Foliage is already healthy and intact. Routine scouting helps maintain this optimal state.",
      whatShouldBeAvoided: "Avoid overwatering or poorly drained soil conditions. Avoid overhead wetting in evening hours. Avoid applying unnecessary chemical pesticides to healthy crops.",
      fertilizerGuidance: "Continue standard balanced nutrient management based on crop growth stage and soil test recommendations. Incorporate organic compost and maintain moderate moisture to sustain living soil ecology.",
      whenToConsultExpert: "Consult an agricultural extension agent for routine seasonal soil testing, seasonal IPM planning, or if unfamiliar symptoms emerge later in the growing cycle.",
      sustainableTip: "Proactive weekly scouting and good cultural hygiene are the most cost-effective and eco-friendly defenses against plant disease.",
      importantNote: "Sustaining healthy plants through cultural stewardship avoids chemical costs and protects surrounding soil ecosystems.",
      sources: "ICAR Crop Production Manual; FAO Agroecology Guidelines; TNAU Organic Agriculture Guide; USDA Plant Health."
    },
    {
      id: "unsupported-or-non-plant",
      crop: "Out of Scope / Non-Plant",
      plant: "Subject Not Identified as Foliage",
      possibleCondition: "Unable to determine a reliable plant condition from this image.",
      scientificName: "Unrecognized Visual Subject",
      confidence: null,
      severity: "Not Evaluated",
      isHealthy: false,
      isOutOfScope: true,
      image: "assets/images/hero-leaf-graphic.svg",
      localFallback: "assets/images/hero-leaf-graphic.svg",
      whatWasDetected: "The uploaded photograph does not present recognizable foliar chlorophyll structures or supported agricultural leaf patterns.",
      symptoms: "The visual analysis engine could not detect characteristic leaf anatomy, venation, or foliar pathology.",
      symptomsBullets: [
        "Insufficient green or foliar chromatic index detected in the image pixels",
        "Lacks recognizable leaf margins, petiole structures, or vein architecture",
        "Image may depict non-agricultural objects, soil, background clutter, or unsupported flora"
      ],
      causes: "The input image does not match the agricultural crop domain trained in the PaudhCare AI vision system.",
      causesBullets: [
        "Photograph taken from too great a distance without clear focus on an individual leaf blade",
        "Subject matter is not an agricultural plant leaf (e.g., human, animal, household object, soil clod)",
        "Leaf obscured by severe glare, extreme shadow, or heavy background interference"
      ],
      actionSteps: [
        "Position the camera 15–25 cm away from a single, well-lit affected leaf blade.",
        "Ensure the leaf fills at least 60% of the camera frame with the symptomatic area clearly centered.",
        "Avoid bright backlighting, harsh reflections, or camera flash directly on the leaf surface.",
        "Keep the leaf steady against a neutral background (or gently hold the edge without covering lesions).",
        "Re-upload the clear close-up leaf photograph for automated diagnostic assessment."
      ],
      treatmentControl: {
        immediate: "No treatment recommendations can be provided for an unverified image.",
        nonChemical: "Take a clear, direct close-up photograph of the affected plant leaf in daylight.",
        biological: "N/A — Retake photo of actual plant foliage.",
        chemical: "DO NOT apply any agricultural chemicals or pesticides without verified diagnosis. Unverified chemical application wastes resources and can severely damage crops.",
        safety: "Always verify plant identity and symptoms before handling any crop protection products."
      },
      prevention: "For accurate AI screening, always capture clear, well-lit, close-up photographs of individual leaves.",
      preventionBullets: [
        "Photograph the specimen in soft, indirect natural morning light",
        "Capture both upper and lower leaf surfaces if symptoms appear on both sides",
        "Ensure camera lens is clean and focused precisely on the symptomatic tissue"
      ],
      whatIsThisProblem: "The uploaded photograph did not display recognizable agricultural leaf tissue or chlorophyll structures required for plant pathology screening.",
      damageRisk: "Diagnostic assessment unavailable for non-agricultural or non-leaf subjects.",
      severityLevel: "Severity: Not reliably determined (Visual subject not recognized as agricultural leaf)",
      howSeriousIsIt: "Cannot evaluate plant health because the uploaded image does not depict recognizable crop foliage.",
      recoveryTime: "Cannot be predicted without a valid plant specimen.",
      canItBeFixed: "Not applicable. Please photograph a real plant leaf.",
      whatShouldBeAvoided: "Avoid applying any chemical treatments or fertilizers based on an unrecognized image.",
      fertilizerGuidance: "No fertilizer recommendations can be made for unverified non-plant imagery.",
      whenToConsultExpert: "For plant health inquiries, please capture a clear close-up photograph of an affected agricultural crop leaf and re-submit, or bring a physical sample to your local extension office.",
      sustainableTip: "Accurate visual identification is the cornerstone of Integrated Pest Management (IPM), preventing premature or inappropriate interventions.",
      importantNote: "Safety First: PaudhCare AI strictly refuses to fabricate a diagnosis for non-plant or unverified subjects.",
      sources: "FAO Integrated Pest Management Standard Operating Procedures; ICAR Field Scouting Protocols."
    },
    {
      id: "poor-quality-or-blurry",
      crop: "Image Inconclusive",
      plant: "Plant Leaf (Unresolved Detail)",
      possibleCondition: "Please upload a clearer close-up image of the affected leaf.",
      scientificName: "Indeterminate / Low Visual Resolution",
      confidence: null,
      severity: "Assessment Inconclusive",
      isHealthy: false,
      isBlurry: true,
      image: "assets/images/hero-leaf-graphic.svg",
      localFallback: "assets/images/hero-leaf-graphic.svg",
      whatWasDetected: "The image contains excessive motion blur, low focus sharpness, or insufficient lighting to resolve diagnostic foliar symptoms.",
      symptoms: "Microscopic lesion details, margin rings, and spore textures could not be reliably resolved.",
      symptomsBullets: [
        "Edge variance and contrast gradient fall below diagnostic precision thresholds",
        "Symptomatic lesion borders are obscured by motion or lens defocus",
        "Fine foliar structures such as pustules, water-soaking, or concentric rings cannot be distinguished"
      ],
      causes: "Camera motion during capture, incorrect focal distance, smudged lens, or inadequate illumination.",
      causesBullets: [
        "Camera movement or wind blowing the leaf while the photograph was being snapped",
        "Camera autofocus locked onto the background soil or neighboring branches rather than the leaf",
        "Camera lens smudged with dust, moisture, or finger oils",
        "Low light conditions causing camera sensor noise and motion blur"
      ],
      actionSteps: [
        "Wipe your smartphone camera lens gently with a clean, dry microfiber cloth.",
        "Hold the camera with both hands or rest your elbows on a steady surface to prevent camera shake.",
        "Tap your phone screen directly on the diseased leaf spot to lock autofocus and exposure.",
        "Ensure sufficient natural daylight illuminates the leaf without harsh blinding sun glare.",
        "Take a new steady photograph and upload it to the PaudhCare AI analyzer."
      ],
      treatmentControl: {
        immediate: "Do not begin treatments based on an inconclusive image scan.",
        nonChemical: "Scout the plant in person to observe if symptoms are localized or spreading across multiple branches.",
        biological: "Re-take a clear leaf photo for accurate identification before selecting bio-agents.",
        chemical: "NEVER spray chemical treatments on an unconfirmed diagnosis. Unverified pesticide use can induce chemical phytotoxicity and build pest resistance.",
        safety: "Always identify the target problem accurately before considering any field intervention."
      },
      prevention: "Capture sharp, focused, well-lit close-up photographs for dependable automated visual analysis.",
      preventionBullets: [
        "Use natural outdoor shade or diffused sunlight for optimal contrast",
        "Keep the camera lens parallel to the leaf surface for uniform focal depth",
        "Ensure the affected area is sharply in focus before pressing the shutter"
      ],
      whatIsThisProblem: "The specimen photograph lacks sufficient optical sharpness or illumination to resolve microscopic foliar lesion margins, spores, or diagnostic patterns.",
      damageRisk: "Inconclusive assessment. Attempting field interventions based on an unverified image creates risk of incorrect chemical application and unnecessary expense.",
      severityLevel: "Severity: Not reliably determined (Image focus or lighting insufficient for diagnosis)",
      howSeriousIsIt: "Image sharpness and contrast are insufficient to confirm the presence, severity, or spread of any pathogen.",
      recoveryTime: "Cannot be predicted from an inconclusive photograph.",
      canItBeFixed: "Please take a clear, sharp close-up photo of the affected leaf in daylight.",
      whatShouldBeAvoided: "Avoid guessing treatments or spraying chemical pesticides based on a blurry image.",
      fertilizerGuidance: "Do not apply chemical fertilizers or pesticide treatments based on an inconclusive photo. Retake a sharp, focused photograph in natural daylight.",
      whenToConsultExpert: "If physical crop symptoms in your field are concerning or spreading quickly, take a fresh clear photograph or invite an agricultural extension officer for an in-field inspection.",
      sustainableTip: "A sharp photograph prevents misdiagnosis and avoids costly, unnecessary chemical applications in your field.",
      importantNote: "PaudhCare AI prioritizes safety and accuracy: we do not guess when image clarity is insufficient.",
      sources: "PlantVillage Field Protocol; ICAR Diagnostic Quality Guidelines; TNAU Digital Agriculture Standards."
    }
  ];

  return {
    getDemoCases: () => diseaseProfiles.filter((p) => !p.isOutOfScope && !p.isBlurry),
    getAllProfiles: () => diseaseProfiles,
    getCaseById: (id) => diseaseProfiles.find((c) => c.id === id) || null,
    getOutOfScopeCase: () => diseaseProfiles.find((c) => c.id === "unsupported-or-non-plant"),
    getBlurryCase: () => diseaseProfiles.find((c) => c.id === "poor-quality-or-blurry"),
    formatConfidence: (val) => {
      if (val !== null && val !== undefined && typeof val === "number" && !isNaN(val)) {
        return `${Math.round(val)}%`;
      }
      return "Confidence: Not available";
    }
  };
})();

// Attach to window object
if (typeof window !== "undefined") {
  window.PaudhCareDataService = PaudhCareDataService;
  window.paudhData = PaudhCareDataService;
  // Legacy backward-compatibility aliases
  window.AgriVisionDataService = PaudhCareDataService;
  window.agrivisionData = PaudhCareDataService;
}
