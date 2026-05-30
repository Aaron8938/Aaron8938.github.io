/* ============================================
   Aaron Portfolio — Scripts
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ─── Theme ───
  const THEME_KEY = "aaron-theme";
  const themeToggle = document.getElementById("theme-toggle");

  function getTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  // Init theme
  applyTheme(getTheme());

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  // Listen for system theme changes (only when no manual preference set)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(getTheme());
    }
  });

  // ─── Language ───
  const LANG_KEY = "aaron-lang";
  let currentLang = localStorage.getItem(LANG_KEY) || "en";

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.querySelectorAll("[data-en]").forEach(el => {
      const val = el.getAttribute(lang === "en" ? "data-en" : "data-zh");
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });
    // Update lang switch button text
    const btn = document.getElementById("lang-switch");
    if (btn) btn.textContent = lang === "en" ? "CN" : "英文";
    // Update document lang
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }

  document.getElementById("lang-switch").addEventListener("click", () => {
    setLang(currentLang === "en" ? "zh" : "en");
  });

  // Init language
  setLang(currentLang);

  // ─── Expand/Collapse ───
  document.querySelectorAll(".expand-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const grid = btn.parentElement.querySelector(".project-grid");
      const isExpanded = grid.classList.toggle("expanded");
      btn.classList.toggle("expanded", isExpanded);
      btn.querySelector(".expand-toggle__label").textContent = isExpanded
        ? btn.getAttribute(isExpanded ? "data-collapse-en" : "data-expand-en") || "Collapse"
        : btn.getAttribute("data-expand-en") || "View All";
      setTimeout(() => {
        // update with current lang
        const label = btn.querySelector(".expand-toggle__label");
        const lang = currentLang;
        const text = grid.classList.contains("expanded")
          ? (lang === "en" ? "Collapse" : "收起")
          : (lang === "en" ? btn.getAttribute("data-expand-en") : btn.getAttribute("data-expand-zh") || "View All");
        label.textContent = text;
      }, 50);
    });
  });

  // Dynamic expand label update on lang switch
  const origSetLang = setLang;
  setLang = function(lang) {
    origSetLang(lang);
    // Update expand toggle labels
    document.querySelectorAll(".expand-toggle").forEach(btn => {
      const grid = btn.parentElement.querySelector(".project-grid");
      const label = btn.querySelector(".expand-toggle__label");
      const isExpanded = grid.classList.contains("expanded");
      if (isExpanded) {
        label.textContent = lang === "en" ? "Collapse" : "收起";
      } else {
        label.textContent = lang === "en"
          ? btn.getAttribute("data-expand-en")
          : btn.getAttribute("data-expand-zh");
      }
    });
  };

  // ─── Dynamic footer year ───
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // ─── Counter animation ───
  let countersTriggered = false;
  function animateCounters() {
    document.querySelectorAll(".hero__metric-num [data-count]").forEach(el => {
      const target = parseInt(el.getAttribute("data-count"));
      const duration = 1200;
      const startTime = performance.now();
      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  // ─── Nav scroll-spy ───
  const nav = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav__links a:not(.lang-switch)");
  const sections = [...navLinks].map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  function updateActiveNav() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
    const scrollY = window.scrollY + 100;
    let current = sections[0];
    for (const s of sections) { if (s.offsetTop <= scrollY) current = s; }
    navLinks.forEach(a => {
      a.classList.remove("active");
      if (a.getAttribute("href") === "#" + current.id) a.classList.add("active");
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // ─── Back to top ───
  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");
  }, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ─── Email copy ───
  const copyBtn = document.getElementById("copy-email");
  const copyHint = document.getElementById("copy-hint");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("893861417@qq.com");
      copyBtn.classList.add("copied");
      copyHint.classList.add("visible");
      setTimeout(() => { copyBtn.classList.remove("copied"); copyHint.classList.remove("visible"); }, 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = "893861417@qq.com"; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      copyBtn.classList.add("copied"); copyHint.classList.add("visible");
      setTimeout(() => { copyBtn.classList.remove("copied"); copyHint.classList.remove("visible"); }, 1800);
    }
  });

  // ─── Intersection Observer ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
          el.style.transitionDelay = i * 0.06 + "s";
          el.classList.add("visible");
        });
        if (entry.target.id === "hero" && !countersTriggered) {
          countersTriggered = true;
          setTimeout(animateCounters, 200);
        }
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

  document.querySelectorAll(".section").forEach(s => observer.observe(s));
  document.querySelectorAll(".fade-up").forEach(el => {
    if (!el.closest(".section")) observer.observe(el);
  });

});
