/**
 * PaudhCare AI — Application UI Controller & Multilingual Switcher
 * Manages custom searchable language popover, mobile bottom sheet,
 * sticky navbar, mobile drawer, scroll spy, and RTL adaptations.
 */

function initApp() {
  if (window._paudhAppInitialized) return;
  window._paudhAppInitialized = true;
  window._agriAppInitialized = true;

  const i18n = window.PaudhCareI18n || window.AgriVisionI18n;

  // Initialize i18n
  if (i18n) {
    i18n.init();
    initSearchableLanguageSelectors();
  }

  // Sticky Navbar Blur Effect on Scroll
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }, { passive: true });

  // Mobile Menu Drawer Toggle
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileToggle.classList.toggle("open");
      navLinks.classList.toggle("mobile-open", isOpen);
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when clicking regular navigation links
    navLinks.querySelectorAll("a.nav-link, .nav-drawer-btn").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("open");
        navLinks.classList.remove("mobile-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active Link Scroll Spy using IntersectionObserver
  const sections = document.querySelectorAll("section[id]");
  const navItems = document.querySelectorAll(".nav-link");

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute("id");
          navItems.forEach(item => {
            const href = item.getAttribute("href");
            if (href === `#${currentId}` || (currentId === "responsible-ai" && href === "#responsible-ai")) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // Escape key closes modals, popovers, and drawers
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (typeof window.closeAllLanguageSelectors === "function") {
        window.closeAllLanguageSelectors();
      }
      const modal = document.getElementById("apiSettingsModal");
      if (modal && modal.classList.contains("open")) {
        modal.classList.remove("open");
      }
      if (mobileToggle && mobileToggle.classList.contains("open")) {
        mobileToggle.classList.remove("open");
        navLinks.classList.remove("mobile-open");
      }
    }
  });

  // Dynamic Year in Footer
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/**
 * Custom Searchable SaaS-Grade Language Selectors:
 * - Desktop: Floating popover dropdown with instant search filter
 * - Mobile: Modern bottom sheet modal opened from drawer
 * - Searchable by English name and native script
 * - Immediate in-place translation
 */
/**
 * Custom Searchable SaaS-Grade Language Selectors:
 * - Desktop: Floating popover dropdown with instant search filter & keyboard navigation
 * - Mobile: Modern bottom sheet modal opened from navbar pill button or drawer
 * - Searchable by English name, native script, and language code
 * - Keyboard navigation (ArrowDown/Up, Enter, Home, End, Escape)
 * - Smooth fade + small slide animations on open and close
 * - Immediate in-place translation and localStorage persistence
 */
function initSearchableLanguageSelectors() {
  const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
  if (!i18n) return;

  const languages = i18n.getLanguages();

  // Elements: Desktop Popover
  const desktopBtn = document.getElementById("langSelectorDesktopBtn");
  const desktopPopover = document.getElementById("langPopover");
  const desktopSearchInput = document.getElementById("langSearchDesktopInput");
  const desktopOptionsList = document.getElementById("langOptionsListDesktop");
  const desktopCurrentLabel = document.getElementById("desktopCurrentLangLabel");

  // Elements: Mobile Bottom Sheet
  const mobileDrawerBtn = document.getElementById("mobileLangDrawerBtn");
  const mobileCurrentLabel = document.getElementById("mobileCurrentLangLabel");
  const mobileSheetBackdrop = document.getElementById("langBottomSheetBackdrop");
  const mobileSheet = document.getElementById("langBottomSheet");
  const mobileSheetCloseBtn = document.getElementById("closeLangSheetBtn");
  const mobileSearchInput = document.getElementById("langSearchMobileInput");
  const mobileOptionsList = document.getElementById("langOptionsListMobile");

  let isClosing = false;

  // Update current labels on triggers
  function updateTriggerLabels() {
    const curCode = i18n.getCurrentLanguage();
    const curMeta = languages.find(l => l.code === curCode) || languages[0];
    if (desktopCurrentLabel) desktopCurrentLabel.textContent = curMeta.nativeName;
    if (mobileCurrentLabel) mobileCurrentLabel.textContent = curMeta.nativeName;
    if (desktopBtn) {
      desktopBtn.setAttribute("aria-label", `Current language: ${curMeta.name} (${curMeta.nativeName}). Click to select language`);
    }
  }

  // Keyboard navigation helper for an options list
  function setupListKeyboardNav(container, searchInput) {
    if (!container) return;
    container.addEventListener("keydown", (e) => {
      const items = Array.from(container.querySelectorAll(".lang-option-item"));
      const currentIndex = items.indexOf(document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex <= 0 && searchInput) {
          searchInput.focus();
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        window.closeAllLanguageSelectors();
      }
    });

    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const firstItem = container.querySelector(".lang-option-item");
          firstItem?.focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          window.closeAllLanguageSelectors();
        }
      });
    }
  }

  // Render Language Option Buttons into a container
  function renderOptions(container, filterQuery = "", searchInput = null) {
    if (!container) return;
    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    const curCode = i18n ? i18n.getCurrentLanguage() : "en";
    const q = filterQuery.trim().toLowerCase();

    container.innerHTML = "";

    const filtered = languages.filter(l => {
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "lang-empty-state";
      emptyDiv.setAttribute("role", "status");
      emptyDiv.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 0.4rem auto; display: block; opacity: 0.5;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>No matching language found</span>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    filtered.forEach(l => {
      const isSelected = l.code === curCode;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `lang-option-item ${isSelected ? "selected" : ""}`;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
      btn.setAttribute("tabindex", "0");
      btn.dataset.code = l.code;

      btn.innerHTML = `
        <div class="lang-option-text">
          <span class="lang-native-script">${l.nativeName}</span>
          <span class="lang-english-name">${l.name}</span>
        </div>
        ${isSelected ? `
          <svg class="lang-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ` : ""}
      `;

      btn.addEventListener("click", () => {
        selectLanguage(l.code, btn);
      });

      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectLanguage(l.code, btn);
        }
      });

      container.appendChild(btn);
    });
  }

  // Language selection with visual feedback & zero-reload switch
  function selectLanguage(code, clickedBtn) {
    if (clickedBtn) {
      clickedBtn.classList.add("selecting");
    }

    const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
    if (i18n) i18n.setLanguage(code);
    updateTriggerLabels();

    // Close mobile menu if open
    const mobileToggle = document.getElementById("mobileToggle");
    const navLinks = document.getElementById("navLinks");
    if (mobileToggle && mobileToggle.classList.contains("open")) {
      mobileToggle.classList.remove("open");
      navLinks.classList.remove("mobile-open");
      mobileToggle.setAttribute("aria-expanded", "false");
    }

    // Refresh option lists
    renderOptions(desktopOptionsList, "", desktopSearchInput);
    renderOptions(mobileOptionsList, "", mobileSearchInput);

    setTimeout(() => {
      window.closeAllLanguageSelectors();
      desktopBtn?.focus();
    }, 120);
  }

  // Open / Close Desktop Popover
  function openDesktopPopover() {
    if (isClosing || !desktopPopover) return;
    desktopPopover.classList.remove("closing");
    desktopPopover.classList.add("open");
    desktopBtn?.setAttribute("aria-expanded", "true");
    renderOptions(desktopOptionsList, "", desktopSearchInput);
    if (desktopSearchInput) {
      desktopSearchInput.value = "";
      setTimeout(() => desktopSearchInput.focus(), 60);
    }
  }

  function closeDesktopPopover(immediate = false) {
    if (!desktopPopover || !desktopPopover.classList.contains("open")) return;
    if (immediate) {
      desktopPopover.classList.remove("open", "closing");
      desktopBtn?.setAttribute("aria-expanded", "false");
      return;
    }
    isClosing = true;
    desktopPopover.classList.add("closing");
    setTimeout(() => {
      desktopPopover.classList.remove("open", "closing");
      desktopBtn?.setAttribute("aria-expanded", "false");
      isClosing = false;
    }, 160);
  }

  function toggleDesktopPopover() {
    if (desktopPopover && desktopPopover.classList.contains("open")) {
      closeDesktopPopover();
    } else {
      openDesktopPopover();
    }
  }

  // Open / Close Mobile Bottom Sheet
  function openMobileBottomSheet() {
    if (isClosing || !mobileSheetBackdrop) return;
    mobileSheetBackdrop.classList.remove("closing");
    if (mobileSheet) mobileSheet.classList.remove("closing");
    mobileSheetBackdrop.classList.add("open");
    mobileSheetBackdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("sheet-open");
    renderOptions(mobileOptionsList, "", mobileSearchInput);
    if (mobileSearchInput) {
      mobileSearchInput.value = "";
      setTimeout(() => mobileSearchInput.focus(), 120);
    }
  }

  function closeMobileBottomSheet(immediate = false) {
    if (!mobileSheetBackdrop || !mobileSheetBackdrop.classList.contains("open")) return;
    if (immediate) {
      mobileSheetBackdrop.classList.remove("open", "closing");
      if (mobileSheet) mobileSheet.classList.remove("closing");
      mobileSheetBackdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("sheet-open");
      return;
    }
    isClosing = true;
    mobileSheetBackdrop.classList.add("closing");
    if (mobileSheet) mobileSheet.classList.add("closing");
    setTimeout(() => {
      mobileSheetBackdrop.classList.remove("open", "closing");
      if (mobileSheet) mobileSheet.classList.remove("closing");
      mobileSheetBackdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("sheet-open");
      isClosing = false;
    }, 200);
  }

  // Setup Keyboard Navigation
  setupListKeyboardNav(desktopOptionsList, desktopSearchInput);
  setupListKeyboardNav(mobileOptionsList, mobileSearchInput);

  // Desktop / Mobile Dual-mode Trigger on Navbar Pill Button
  if (desktopBtn) {
    desktopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.innerWidth < 768) {
        openMobileBottomSheet();
      } else {
        toggleDesktopPopover();
      }
    });
  }

  // Search input filtering: Desktop
  if (desktopSearchInput) {
    desktopSearchInput.addEventListener("input", (e) => {
      renderOptions(desktopOptionsList, e.target.value, desktopSearchInput);
    });
    desktopSearchInput.addEventListener("click", (e) => e.stopPropagation());
  }

  if (desktopPopover) {
    desktopPopover.addEventListener("click", (e) => e.stopPropagation());
  }

  // Mobile Drawer Button
  if (mobileDrawerBtn) {
    mobileDrawerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openMobileBottomSheet();
    });
  }

  // Mobile Bottom Sheet Close Button & Backdrop
  if (mobileSheetCloseBtn) {
    mobileSheetCloseBtn.addEventListener("click", () => {
      closeMobileBottomSheet();
    });
  }

  if (mobileSheetBackdrop) {
    mobileSheetBackdrop.addEventListener("click", (e) => {
      if (e.target === mobileSheetBackdrop) {
        closeMobileBottomSheet();
      }
    });

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("input", (e) => {
        renderOptions(mobileOptionsList, e.target.value, mobileSearchInput);
      });
    }
  }

  // Global Outside Click to close Desktop Popover
  document.addEventListener("click", (e) => {
    const container = document.getElementById("langDropdownContainer");
    if (container && !container.contains(e.target)) {
      closeDesktopPopover();
    }
  });

  // Listen to i18n change events
  const i18n = window.PaudhCareI18n || window.AgriVisionI18n;
  if (i18n) {
    i18n.onLanguageChange(() => {
      updateTriggerLabels();
      renderOptions(desktopOptionsList, "", desktopSearchInput);
      renderOptions(mobileOptionsList, "", mobileSearchInput);
    });
  }

  // Initial population
  updateTriggerLabels();
  renderOptions(desktopOptionsList, "", desktopSearchInput);
  renderOptions(mobileOptionsList, "", mobileSearchInput);

  // Expose closeAllLanguageSelectors globally
  window.closeAllLanguageSelectors = function (immediate = false) {
    closeDesktopPopover(immediate);
    closeMobileBottomSheet(immediate);
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
window.addEventListener("load", initApp);
