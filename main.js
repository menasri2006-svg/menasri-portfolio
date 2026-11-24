(function () {
  "use strict";
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Contact form: set FORM_ENDPOINT (e.g. a Formspree or Web3Forms URL) to send in-page.
     Left empty, the form opens the visitor's email app with the message pre-filled. */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "menasri2006@gmail.com";

  // theme
  var themeBtn = $("#theme");
  themeBtn.addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    root.classList.add("theming");
    root.dataset.theme = next;
    setTimeout(function () { root.classList.remove("theming"); }, 600);
    try { localStorage.setItem("theme", next); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", next === "dark" ? "#0f1115" : "#f5f2ec");
  });

  // header shadow + mobile menu
  var header = $(".site-header");
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  var menu = $("#menu"), nav = $("#nav");
  function setMenu(open) { nav.classList.toggle("open", open); menu.setAttribute("aria-expanded", String(open)); }
  menu.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // active section link (computed from scroll position so it also clears at the top)
  var links = $$("#nav a"), secs = $$("main section[id]");
  function spy() {
    var cur = "", line = window.innerHeight * 0.35;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s.id; });
    links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + cur); });
  }
  var ind = $(".nav-ind");
  function moveInd() {
    var a = $("#nav a.active");
    if (!a || !ind || window.innerWidth <= 820) { if (ind) ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.width = (a.offsetWidth - 24) + "px";
    ind.style.transform = "translateX(" + (a.offsetLeft + 12) + "px)";
  }
  var lastCur = null;
  function spyAll() { spy(); var c = $("#nav a.active"); if (c !== lastCur) { lastCur = c; moveInd(); } }
  spyAll(); window.addEventListener("scroll", spyAll, { passive: true }); window.addEventListener("resize", moveInd);

  // word-by-word masked text (readable to screen readers via aria-label)
  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    var k = 0, out = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      var parts = n.nodeType === 3 ? n.textContent.split(/(\s+)/) : [n];
      parts.forEach(function (t) {
        if (typeof t === "string") { if (!t.trim()) { out.appendChild(document.createTextNode(" ")); return; } t = document.createTextNode(t); }
        var w = document.createElement("span"), i = document.createElement("span");
        w.className = "w"; w.setAttribute("aria-hidden", "true"); i.style.setProperty("--k", k++);
        i.appendChild(t.nodeType === 3 ? t : t.cloneNode(true)); w.appendChild(i); out.appendChild(w);
      });
    });
    el.textContent = ""; el.appendChild(out);
  }
  $$("h1.split, [data-split]").forEach(splitWords);

  // hero name: letter-by-letter
  (function () {
    var k = 0;
    $$(".hero-name .ln > span").forEach(function (sp) {
      var target = sp.querySelector("i") || sp;
      var txt = target.textContent; target.textContent = "";
      txt.split("").forEach(function (ch) { var c = document.createElement("span"); c.className = "c"; c.style.setProperty("--k", k++); c.textContent = ch; target.appendChild(c); });
    });
  })();

  // experience: interactive accordion ledger
  $$(".tl-item").forEach(function (item, idx) {
    var card = $(".tl-card", item), top = $(".tl-top", card), role = $(".tl-role", card);
    var more = document.createElement("div"), inner = document.createElement("div");
    more.className = "tl-more"; more.appendChild(inner);
    $$("ul, .tags", card).forEach(function (n) { inner.appendChild(n); });
    top.parentNode.insertBefore(more, role.nextSibling);
    top.setAttribute("role", "button"); top.setAttribute("tabindex", "0");
    function set(o) { item.classList.toggle("open", o); top.setAttribute("aria-expanded", String(o)); }
    $$(".tag", card).forEach(function (t, n) { t.style.setProperty("--t", n); });
    set(idx === 0);
    top.addEventListener("click", function () { set(!item.classList.contains("open")); });
    top.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(!item.classList.contains("open")); } });
  });

  // skill badges: monogram tiles (initials, not brand logos)
  var MONO = { "Python": "Py", "Java": "Jv", "JavaScript": "JS", "SQL": "SQL", "Flask": "Fl", "FastAPI": "FA", "Node.js": "No", "Express.js": "Ex", "REST APIs": "API", "JWT & session auth": "Au", "React.js": "Re", "HTML5": "H5", "CSS3": "C3", "Streamlit": "St", "SQLite": "SQ", "SQLAlchemy": "SA", "MySQL": "My", "MongoDB": "Mo", "scikit-learn": "sk", "NLP · TF-IDF": "NLP", "OpenCV": "CV", "Pandas": "Pd", "NumPy": "Np", "Groq API": "Gq", "OpenAI API": "AI", "Git & GitHub": "Git", "Docker": "Dk", "Postman": "Pm", "VS Code": "VS", "Jupyter": "Jp", "Figma": "Fg", "Linux (RHCSA)": "Lx", "LLM tool calling": "LLM", "Retrieval-augmented generation": "RAG", "Embeddings & semantic search": "Em" };
  $$(".chip").forEach(function (ch) {
    var t = ch.textContent.trim(), i = document.createElement("i");
    i.setAttribute("aria-hidden", "true"); i.textContent = MONO[t] || t.slice(0, 2); ch.insertBefore(i, ch.firstChild);
  });

  // pointer effects: magnetic buttons + card spotlight (fine pointers, motion allowed)
  var fine = window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !calm) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    var glow = document.createElement("div"); glow.className = "cursor-glow"; glow.setAttribute("aria-hidden", "true"); document.body.appendChild(glow);
    var gx = 0, gy = 0, tx = 0, ty = 0, gr = false;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY; glow.classList.add("on");
      if (!gr) { gr = true; requestAnimationFrame(function loop() { gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14; glow.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px)"; if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop); else gr = false; }); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { glow.classList.remove("on"); });
    $$(".p-media").forEach(function (m) {
      m.addEventListener("mousemove", function (e) {
        var r = m.getBoundingClientRect();
        m.style.setProperty("--tx", (((e.clientX - r.left) / r.width - 0.5) * -14).toFixed(1) + "px");
        m.style.setProperty("--ty", (((e.clientY - r.top) / r.height - 0.5) * -10).toFixed(1) + "px");
      });
      m.addEventListener("mouseleave", function () { m.style.setProperty("--tx", "0px"); m.style.setProperty("--ty", "0px"); });
    });
    $$(".project, .cert").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // timeline progress line + back-to-top
  var tl = $(".timeline"), toTop = $("#to-top"), ticking = false;
  function frame() {
    ticking = false;
    if (tl) {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      tl.style.setProperty("--p", p.toFixed(3));
    }
    toTop.classList.toggle("show", window.scrollY > 700);
    var po = $(".portrait-frame img"), gl = $(".glow");
    if (po && !calm && window.scrollY < window.innerHeight * 1.2) {
      po.style.setProperty("--py", Math.min(18, window.scrollY * 0.04).toFixed(1) + "px");
      if (gl) gl.style.translate = "0 " + (window.scrollY * 0.12).toFixed(0) + "px";
    }
    var ct = $(".contact");
    if (ct) { var cr = ct.getBoundingClientRect(); ct.style.setProperty("--cp", calm ? 1 : Math.min(1, Math.max(0, (window.innerHeight - cr.top) / (window.innerHeight * 0.7))).toFixed(3)); }
    var dh = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty("--sp", dh > 0 ? (window.scrollY / dh).toFixed(4) : 0);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  frame(); window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0 }); });

  // stagger groups: children reveal one after another (cap keeps delays short)
  function stagger(sel, kid, step) {
    $$(sel).forEach(function (g) {
      g.classList.remove("reveal");
      $$(kid, g).forEach(function (el, i) { el.classList.add("reveal", "stag"); el.style.setProperty("--d", Math.min(i, 5) * step + "ms"); });
    });
  }
  stagger(".skills", ".skill-card", 70);
  stagger("#certs", ".cert", 55);
  stagger(".honours", ".honour", 70);
  $$(".tl-item, .project").forEach(function (el) { el.classList.add("stag"); });

  if ("IntersectionObserver" in window) {
    // reveal on scroll (content stays visible if JS or IntersectionObserver is unavailable)
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      root.classList.add("reveal-ready");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { var t = en.target; t.classList.add("in"); io.unobserve(t); setTimeout(function () { t.classList.add("done"); }, 1000); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      $$(".reveal").forEach(function (el) { io.observe(el); });
    }
  }

  // dialogs (animated close)
  function openDialog(d) {
    if (!d) return;
    d.classList.remove("closing");
    if (d.open) return;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function closeDialog(d) {
    if (!d.open || d.classList.contains("closing")) return;
    if (calm) { d.close(); return; }
    d.classList.add("closing");
    setTimeout(function () { if (!d.classList.contains("closing")) return; d.classList.remove("closing"); d.close(); }, 170);
  }
  $$("dialog").forEach(function (d) {
    d.addEventListener("close", function () { if (!$("dialog[open]")) document.body.style.overflow = ""; });
    d.addEventListener("cancel", function (e) { e.preventDefault(); closeDialog(d); });
    d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); });
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { closeDialog(d); }); });
  });
  $$("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () { openDialog(document.getElementById(b.dataset.open)); });
  });

  // image-tool screenshot tabs
  $$("[data-shot]").forEach(function (b) {
    b.addEventListener("click", function () {
      var img = $("#shot-main"); img.classList.add("swap");
      setTimeout(function () { img.src = b.dataset.shot; img.alt = b.dataset.alt; img.onload = function () { img.classList.remove("swap"); }; setTimeout(function () { img.classList.remove("swap"); }, 400); }, 220);
      $$("[data-shot]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });

  // certificates: filter + lightbox
  $$(".filter[data-f]").forEach(function (f) {
    f.addEventListener("click", function () {
      $$(".filter[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); });
      var n = 0;
      $$("#certs .cert").forEach(function (c) {
        var hide = f.dataset.f !== "all" && c.dataset.cat !== f.dataset.f;
        c.hidden = hide; c.classList.remove("show");
        if (!hide) { c.style.setProperty("--d", Math.min(n++, 6) * 45 + "ms"); void c.offsetWidth; c.classList.add("show"); }
      });
    });
  });
  var lb = $("#lightbox"), cur = null;
  function visibleCerts() { return $$("#certs .cert").filter(function (c) { return !c.hidden; }); }
  function showCert(c) {
    cur = c;
    var img = $("#lb-img"); img.src = c.dataset.img; img.alt = c.dataset.title + " certificate";
    $(".lb-stage", lb).classList.remove("zoom");
    $("#lb-title").textContent = c.dataset.title; $("#lb-meta").textContent = c.dataset.meta;
    var v = $("#lb-verify");
    if (c.dataset.verify) { v.href = c.dataset.verify; v.hidden = false; } else { v.hidden = true; v.removeAttribute("href"); }
    var many = visibleCerts().length > 1; $("#lb-prev").hidden = !many; $("#lb-next").hidden = !many;
  }
  function step(d) { var l = visibleCerts(); if (!cur || l.length < 2) return; showCert(l[(l.indexOf(cur) + d + l.length) % l.length]); }
  $$("#certs .cert").forEach(function (c) { c.addEventListener("click", function () { showCert(c); openDialog(lb); }); });
  $("#lb-prev").addEventListener("click", function () { step(-1); });
  $("#lb-next").addEventListener("click", function () { step(1); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
  $(".lb-stage", lb).addEventListener("click", function (e) {
    var st = e.currentTarget, r = st.getBoundingClientRect();
    st.classList.toggle("zoom");
    if (st.classList.contains("zoom")) { st.scrollLeft = (e.clientX - r.left) * 0.7; st.scrollTop = (e.clientY - r.top) * 0.7; }
  });

  // copy email
  var cp = $(".copy");
  if (cp) cp.addEventListener("click", function () {
    var t = cp.dataset.copy;
    function done() { cp.classList.add("done"); $("#copy-status").textContent = "Email address copied"; setTimeout(function () { cp.classList.remove("done"); $("#copy-status").textContent = ""; }, 1800); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, function () { fallback(); });
    else fallback();
    function fallback() { var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { cp.querySelector(".copy-l").textContent = t; } document.body.removeChild(ta); }
  });

  // contact form
  var form = $("#contact-form"), note = $("#form-note"), sendBtn = $("button[type=submit]", form);
  var rules = {
    name: function (v) { return v ? "" : "Please enter your name."; },
    email: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "" : "Please enter a valid email address."; },
    message: function (v) { return v.length >= 5 ? "" : "Please write a short message."; }
  };
  function check(el) {
    var msg = rules[el.name](el.value.trim()), err = $(".err", el.parentNode);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    err.textContent = msg; err.classList.toggle("on", !!msg);
    return !msg;
  }
  ["name", "email", "message"].forEach(function (n) {
    var el = form[n];
    el.addEventListener("blur", function () { if (el.value) check(el); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") check(el); });
  });
  function setNote(text, kind) { note.textContent = text; note.className = "form-note" + (kind ? " " + kind : ""); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var oks = ["name", "email", "message"].map(function (n) { return check(form[n]); });
    if (oks.indexOf(false) !== -1) { setNote("Please fix the highlighted fields.", "bad"); var bad = $("[aria-invalid=true]", form); if (bad) bad.focus(); return; }
    var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
    if (FORM_ENDPOINT) {
      sendBtn.disabled = true; setNote("Sending…");
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name: name, email: email, message: msg }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); setNote("Thanks, your message was sent.", "ok"); form.reset(); })
        .catch(function () { setNote("Sorry, that did not send. Please email " + CONTACT_EMAIL + " directly.", "bad"); })
        .then(function () { sendBtn.disabled = false; });
    } else {
      var subject = encodeURIComponent("Portfolio enquiry from " + name);
      var body = encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")");
      setNote("Opening your email app. If nothing opens, write to " + CONTACT_EMAIL + ".", "ok");
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    }
  });

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
