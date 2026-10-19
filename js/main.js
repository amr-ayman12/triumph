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
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i * 0.08, 0.48) + "s");
  });
  if (hasIO) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revObs.observe(el); });
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

  // ---------- Testimonials: arrow buttons + autoplay ----------
  var tWrap = document.querySelector(".tcards");
  if (tWrap) {
    var tTimer;
    function cardStep() {
      var card = tWrap.querySelector(".tcard");
      var gap = parseFloat(getComputedStyle(tWrap).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : tWrap.clientWidth;
    }
    function atEnd() {
      // RTL: scrollLeft goes from 0 to negative values; LTR: 0 to positive
      return Math.abs(tWrap.scrollLeft) + tWrap.clientWidth >= tWrap.scrollWidth - 4;
    }
    function move(dir) {
      if (dir > 0 && atEnd()) { tWrap.scrollTo({ left: 0 }); return; }
      tWrap.scrollBy({ left: (isRTL ? -dir : dir) * cardStep() });
    }
    function restart() {
      clearInterval(tTimer);
      tTimer = setInterval(function () { move(1); }, 5500);
    }
    document.querySelectorAll(".slider-btn").forEach(function (b) {
      b.addEventListener("click", function () { move(b.getAttribute("data-dir") === "next" ? 1 : -1); restart(); });
    });
    tWrap.addEventListener("pointerenter", function () { clearInterval(tTimer); });
    tWrap.addEventListener("pointerleave", restart);
    restart();
  }

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

  // ---------- Footer year ----------
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
