(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Header: scroll state & mobile menu ---------- */
  const header = $(".header");
  const nav = $("#nav");
  const burger = $(".burger");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a, button", nav).forEach((el) => el.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* Active nav link */
  const links = $$('.nav > a[href^="#"]');
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Opening hours / live status (Europe/Berlin) ---------- */
  // [open, close] in minutes per weekday (0 = Sunday)
  const HOURS = {
    0: null,
    1: null,
    2: [510, 1170],
    3: [510, 1170],
    4: [510, 1170],
    5: [510, 1170],
    6: [510, 840],
  };
  // Special days: ISO date -> [open, close] or null (closed)
  const SPECIAL = { "2026-12-24": [510, 840] };
  const CLOSED_RANGES = [["2026-12-25", "2027-01-06"]];
  const DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  const berlinNow = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const iso = `${get("year")}-${get("month")}-${get("day")}`;
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { iso, wd, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
  };

  const addDays = (iso, n) => {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return { iso: d.toISOString().slice(0, 10), wd: d.getUTCDay() };
  };

  const hoursFor = (iso, wd) => {
    if (CLOSED_RANGES.some(([a, b]) => iso >= a && iso <= b)) return null;
    if (iso in SPECIAL) return SPECIAL[iso];
    return HOURS[wd];
  };

  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const renderStatus = () => {
    const now = berlinNow();
    const today = hoursFor(now.iso, now.wd);
    let open = false;
    let text;

    if (today && now.minutes >= today[0] && now.minutes < today[1]) {
      open = true;
      text = `Jetzt geöffnet · bis ${fmt(today[1])} Uhr`;
    } else if (today && now.minutes < today[0]) {
      text = `Geschlossen · öffnet heute um ${fmt(today[0])} Uhr`;
    } else {
      text = "Geschlossen";
      for (let i = 1; i <= 21; i++) {
        const d = addDays(now.iso, i);
        const h = hoursFor(d.iso, d.wd);
        if (h) {
          const label = i === 1 ? "morgen" : DAYS[d.wd];
          text = `Geschlossen · öffnet ${label} um ${fmt(h[0])} Uhr`;
          break;
        }
      }
    }

    $$("[data-status]").forEach((el) => {
      el.classList.toggle("is-open", open);
      el.classList.toggle("is-closed", !open);
      $(".status__text", el).textContent = text;
    });
    $$(".hours__table tr").forEach((tr) => tr.classList.toggle("is-today", Number(tr.dataset.day) === now.wd));
  };
  renderStatus();
  setInterval(renderStatus, 60 * 1000);

  /* ---------- Price tabs ---------- */
  const tabs = $$(".tab");
  const activate = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      activate(next);
    });
  });

  /* ---------- Cost calculator ---------- */
  const type = $("#calc-type");
  const days = $("#calc-days");
  const daysOut = $("#calc-days-out");
  const heavy = $("#calc-heavy");
  const total = $("#calc-total");
  const detail = $("#calc-detail");
  const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

  const calc = () => {
    const [base, included, perDay] = type.value.split("|").map(Number);
    const d = Number(days.value);
    const extraDays = Math.max(0, d - included);
    const sum = base + extraDays * perDay + (heavy.checked ? 2 : 0);
    daysOut.textContent = d;
    total.textContent = eur.format(sum);
    detail.textContent = extraDays
      ? `${included} Tage inkl. + ${extraDays} × ${eur.format(perDay)}`
      : `inkl. ${included} Tage Lagerzeit`;
  };
  [type, days, heavy].forEach((el) => el.addEventListener("input", calc));
  calc();

  /* ---------- Map (loaded on consent) ---------- */
  const mapBtn = $("[data-load-map]");
  mapBtn?.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10750.762190734686!2d8.5763299!3d47.65158!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x242d922d8ac917ac!2sM%C3%B6ssmer+Pakete!5e0!3m2!1sde!2sde!4v1510948571038";
    iframe.title = "Karte: Mössmer Pakete, Im See 2, 79798 Jestetten";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    mapBtn.replaceWith(iframe);
  });

  /* ---------- Login dialog ---------- */
  const dialog = $("#login");
  $$("[data-open-login]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
        $("input", dialog).focus();
      } else {
        window.location.href = "https://www.moessmer-pakete.de/";
      }
    })
  );
  dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".section__head, .step, .tile, .price, .fees__group, .calc, .card, .map, .faq details, .cta__inner");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealEls.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
