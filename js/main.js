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

  /* Submit a form via AJAX to its Formspree endpoint (set in the form's action="") */
  function submitToFormspree(form, status, { onSuccess, onError }) {
    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (response.ok) {
          onSuccess();
          form.reset();
        } else {
          onError();
        }
      })
      .catch(() => onError());
  }

  /* Enquiry / quote form: validate, then send via Formspree */
  const enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      enquiryForm.querySelectorAll("[data-required]").forEach((field) => {
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

      status.textContent = "Sending...";
      status.className = "form-status";
      submitToFormspree(enquiryForm, status, {
        onSuccess: () => {
          status.textContent = "Thanks — your enquiry has been received. An advisor will get back to you the same business day.";
          status.className = "form-status success";
        },
        onError: () => {
          status.textContent = "Something went wrong sending your enquiry. Please email us directly or try again.";
          status.className = "form-status error";
        },
      });
    });
  }

  /* PDPA Do Not Call opt-out form: send via Formspree */
  const dncForm = document.querySelector("#dnc-form");
  if (dncForm) {
    dncForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.querySelector("#dnc-form-status");
      const hasContact = ["dnc-name", "dnc-contact", "dnc-email"].some(
        (id) => document.getElementById(id).value.trim().length > 0
      );
      if (!hasContact) {
        status.textContent = "Please fill in at least your name and contact number or email.";
        status.className = "form-status error";
        return;
      }

      status.textContent = "Sending...";
      status.className = "form-status";
      submitToFormspree(dncForm, status, {
        onSuccess: () => {
          status.textContent = "Your opt-out request has been received.";
          status.className = "form-status success";
        },
        onError: () => {
          status.textContent = "Something went wrong sending your request. Please email us directly or try again.";
          status.className = "form-status error";
        },
      });
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

  /* Mouse-follow spotlight glow in the hero / page-hero banner */
  document.querySelectorAll(".hero, .page-hero").forEach((heroEl) => {
    heroEl.addEventListener("pointermove", (e) => {
      const rect = heroEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroEl.style.setProperty("--mx", x + "%");
      heroEl.style.setProperty("--my", y + "%");
    });
  });

  /* Scroll-aware navbar (subtle shadow + opacity once the page has scrolled) */
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    window.addEventListener(
      "scroll",
      () => {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 30);
      },
      { passive: true }
    );
  }

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
