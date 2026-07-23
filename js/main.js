// Platinum Finance Advisory — shared behaviour (mobile nav, FAQ accordion, contact form)

document.addEventListener("DOMContentLoaded", () => {
  /* Mobile nav toggle */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      const expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      item.classList.toggle("open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* Contact / quote form validation (front-end only — see note in contact.html) */
  const form = document.querySelector("#enquiry-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll("[data-required]").forEach((field) => {
        const wrapper = field.closest(".field");
        const value = field.value.trim();
        let fieldValid = value.length > 0;

        if (field.type === "email" && value) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (field.type === "checkbox") {
          fieldValid = field.checked;
        }

        wrapper.classList.toggle("invalid", !fieldValid);
        if (!fieldValid) valid = false;
      });

      const status = document.querySelector("#form-status");
      if (!valid) {
        status.textContent = "Please fill in all required fields correctly before submitting.";
        status.className = "form-status error";
        return;
      }

      // NOTE: This form is front-end only. Wire it up to an email service
      // (e.g. Formspree, Netlify Forms) or your own backend before going live.
      status.textContent = "Thanks — your enquiry has been noted. (Demo only: connect this form to an email service or backend to actually receive enquiries.)";
      status.className = "form-status success";
      form.reset();
    });
  }

  /* Scroll-reveal for cards, tables and content blocks */
  const revealSelector = ".card, .stat-block, .testimonial-card, .service-card, .step, .network-group, .compare-table, .hero-card, .dnc-block, .process-grid";
  const revealTargets = document.querySelectorAll(revealSelector);
  if (revealTargets.length && "IntersectionObserver" in window) {
    revealTargets.forEach((el) => el.classList.add("reveal"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* Animated count-up for stat numbers (e.g. "20+", "24h", "S$0", "100%") */
  document.querySelectorAll(".stat-number").forEach((el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match || !("IntersectionObserver" in window)) return;
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(/,/g, ""));
    if (isNaN(target)) return;
    el.textContent = prefix + "0" + suffix;
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const duration = 1100;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = raw;
          }
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(el);
  });

  /* Sticky mobile "Get a Free Quote" bar (hidden on the Contact page itself) */
  if (!location.pathname.endsWith("contact.html")) {
    const stickyCta = document.createElement("div");
    stickyCta.className = "sticky-cta";
    stickyCta.innerHTML =
      '<span>Ready to compare your loan options?</span>' +
      '<a href="contact.html#quote-form" class="btn btn-primary">Get a Free Quote</a>';
    document.body.appendChild(stickyCta);
    window.addEventListener(
      "scroll",
      () => {
        stickyCta.classList.toggle("is-visible", window.scrollY > 420);
      },
      { passive: true }
    );
  }
});
