(function () {
  "use strict";

  var header = document.querySelector(".header");
  var toTop = document.querySelector(".to-top");
  var hasIO = "IntersectionObserver" in window;
  var isRTL = document.documentElement.dir === "rtl";

  // ---------- UI strings per language ----------
  var STR = {
    ar: {
      menuOpen: "فتح القائمة",
      menuClose: "إغلاق القائمة",
      formError: "من فضلك أكمل الحقول المطلوبة بشكل صحيح.",
      formOk: "اضغط إرسال داخل واتساب لإتمام طلبك. إذا لم يفتح واتساب، اضغط الزر مرة أخرى.",
      waTitle: "طلب استشارة مجانية",
      waName: "الاسم: ",
      waPhone: "رقم الهاتف: ",
      waCompany: "الشركة / المنشأة: ",
      waService: "الخدمة المطلوبة: ",
      waDetails: "تفاصيل إضافية: ",
      notSet: "غير محدد",
      none: "لا توجد"
    },
    en: {
      menuOpen: "Open menu",
      menuClose: "Close menu",
      formError: "Please fill in the required fields correctly.",
      formOk: "Press send in WhatsApp to complete your request. If WhatsApp didn't open, press the button again.",
      waTitle: "Free consultation request",
      waName: "Name: ",
      waPhone: "Phone: ",
      waCompany: "Company / facility: ",
      waService: "Service needed: ",
      waDetails: "Additional details: ",
      notSet: "Not specified",
      none: "None"
    }
  };
  var t = STR[document.documentElement.lang] || STR.ar;

  // ---------- Header state + back-to-top ----------
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  // ---------- Mobile menu ----------
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? t.menuClose : t.menuOpen);
    document.body.classList.toggle("menu-open", open);
    header.classList.toggle("menu-active", open);
  }
  burger.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 991) setMenu(false); });

  // ---------- Active nav link on scroll ----------
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__list a[href^='#']:not([href='#'])"));
  var targets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (hasIO) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id === "top" ? "#top" : "#" + e.target.id;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { if (t.id !== "top") navObs.observe(t); });
    // the hero has no id of its own; treat it as #top
    var hero = document.querySelector(".hero");
    if (hero) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#top"); });
      }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
    }
  }

  // ---------- Reveal on scroll (with sibling stagger) ----------
  // Animate individual rows instead of hiding a whole, potentially tall group.
  document.querySelectorAll(".values.reveal, .company-records.reveal").forEach(function (group) {
    group.classList.remove("reveal");
    Array.prototype.forEach.call(group.children, function (el) { el.classList.add("reveal"); });
  });
  document.querySelectorAll(".contact__info, .contact .form, .footer__brand, .footer__col").forEach(function (el) {
    el.classList.add("reveal");
  });
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    var i = siblings.indexOf(el);
    el.style.setProperty("--d", Math.min(i * 0.07, 0.21) + "s");
  });
  if (hasIO) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -24px 0px" });
    document.documentElement.classList.add("reveal-ready");
    reveals.forEach(function (el) { revObs.observe(el); });
    document.addEventListener("focusin", function (event) {
      var el = event.target;
      while (el && el !== document.documentElement) {
        if (el.classList.contains("reveal")) {
          el.classList.add("visible");
          revObs.unobserve(el);
        }
        el = el.parentElement;
      }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  // ---------- Counters ----------
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var duration = 2000;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".counter");
  if (hasIO) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cObs.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-target"); });
  }

  // ---------- Clients marquee: duplicate the set for a seamless loop ----------
  var mTrack = document.querySelector(".marquee__track");
  if (mTrack) {
    Array.prototype.slice.call(mTrack.children).forEach(function (n) {
      var c = n.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.alt = "";
      mTrack.appendChild(c);
    });
  }

  // ---------- Service cards: glow follows the cursor ----------
  document.querySelectorAll(".service").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  // ---------- Contact form via WhatsApp ----------
  var form = document.getElementById("contactForm");
  if (form) {
    var note = form.querySelector(".form__note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var valid = f.checkValidity() && String(f.value).trim() !== "";
        f.closest(".field").classList.toggle("has-error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        note.textContent = t.formError;
        note.className = "form__note err";
        return;
      }
      var data = new FormData(form);
      var message = [
        t.waTitle,
        t.waName + String(data.get("name")).trim(),
        t.waPhone + String(data.get("phone")).trim(),
        t.waCompany + (String(data.get("company")).trim() || t.notSet),
        t.waService + data.get("service"),
        t.waDetails + (String(data.get("message")).trim() || t.none)
      ].join("\n");
      window.open("https://wa.me/201022097233?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
      note.textContent = t.formOk;
      note.className = "form__note ok";
    });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field) field.classList.remove("has-error");
    });
  }

  // ---------- Partners Category Filter & Modal ----------
  var pTabs = document.querySelectorAll(".partner-tab");
  var pCards = document.querySelectorAll(".partner-card");
  if (pTabs.length && pCards.length) {
    pTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-filter");
        pTabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        pCards.forEach(function (card) {
          var cat = card.getAttribute("data-category");
          var match = filter === "all" || cat === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  var pModal = document.getElementById("partnerModal");
  if (pModal) {
    var pClose = pModal.querySelector(".partner-modal__close");
    var mImg = pModal.querySelector(".partner-modal__img");
    var mTitle = pModal.querySelector(".partner-modal__title");
    var mSub = pModal.querySelector(".partner-modal__sub");
    var mBadge = pModal.querySelector(".partner-modal__badge");
    var mBody = pModal.querySelector(".partner-modal__body");
    var mScope = pModal.querySelector(".partner-modal__scope-text");
    var mCta = pModal.querySelector(".partner-modal__cta-btn");

    function openPartnerModal(card) {
      if (!card) return;
      var title = card.getAttribute("data-title") || "";
      var sub = card.getAttribute("data-sub") || "";
      var badge = card.getAttribute("data-badge") || "";
      var desc = card.getAttribute("data-desc") || "";
      var scope = card.getAttribute("data-scope") || "";
      var img = card.getAttribute("data-img") || "";

      if (mTitle) mTitle.textContent = title;
      if (mSub) mSub.textContent = sub;
      if (mBadge) mBadge.textContent = badge;
      if (mBody) mBody.textContent = desc;
      if (mScope) mScope.textContent = scope;
      if (mImg) {
        mImg.src = img;
        mImg.alt = title;
      }
      pModal.classList.add("is-open");
      pModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closePartnerModal() {
      pModal.classList.remove("is-open");
      pModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".partner-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openPartnerModal(card);
      });
    });

    if (pClose) {
      pClose.addEventListener("click", closePartnerModal);
    }
    pModal.addEventListener("click", function (e) {
      if (e.target === pModal) closePartnerModal();
    });
    if (mCta) {
      mCta.addEventListener("click", closePartnerModal);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && pModal.classList.contains("is-open")) {
        closePartnerModal();
      }
    });
  }

  // ---------- Footer year ----------
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
