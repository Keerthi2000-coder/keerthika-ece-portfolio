// Keerthika Mohanmoorthy \u2014 ECE Portfolio
(function () {
  document.documentElement.classList.remove("no-js");

  // Always open pages at the top (no restored scroll position), unless a #section is linked
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  function toTop() {
    if (location.hash) return;
    var h = document.documentElement, prev = h.style.scrollBehavior;
    h.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    h.style.scrollBehavior = prev;
  }
  toTop();
  window.addEventListener("pageshow", toTop);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- Scroll progress + header state ----------
  var header = document.querySelector(".site-header");
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var timeline = document.querySelector(".timeline");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.setProperty("--p", max > 0 ? (h.scrollTop / max).toFixed(4) : 0);
      if (header) header.classList.toggle("scrolled", h.scrollTop > 8);
      if (timeline) {
        var r = timeline.getBoundingClientRect();
        var vh = window.innerHeight;
        var f = (vh * 0.65 - r.top) / r.height;
        timeline.style.setProperty("--fill", Math.max(0, Math.min(1, f)).toFixed(4));
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();


  // ---------- Page transitions ----------
  (function () {
    var html = document.documentElement;
    function clearArriving() {
      setTimeout(function () { html.classList.remove("pt-arriving"); }, 1000);
    }
    if (html.classList.contains("pt-arriving")) clearArriving();

    // Restored from back/forward cache: un-cover and play the reveal
    window.addEventListener("pageshow", function (e) {
      if (!e.persisted) return;
      html.classList.remove("pt-leaving");
      if (!reduce) { html.classList.add("pt-arriving"); clearArriving(); }
    });

    if (reduce) return;
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (/\.pdf($|[?#])/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin && location.protocol !== "file:") return;
      // Same page, only the hash differs: let the browser scroll normally
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      e.preventDefault();
      try { sessionStorage.setItem("km-pt", "1"); } catch (err) {}
      html.classList.remove("pt-arriving");
      html.classList.add("pt-leaving");
      setTimeout(function () { location.href = url.href; }, 620);
    });
  })();

  // ---------- Mobile navigation ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  // ---------- Split headline into words ----------
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span");
            w.className = "w";
            var inner = document.createElement("span");
            inner.style.setProperty("--i", i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el);
    el.classList.add("split-words");
  });

  // ---------- Stagger children ----------
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    Array.prototype.forEach.call(group.children, function (child, idx) {
      child.style.setProperty("--d", idx * step + "ms");
    });
  });

  // ---------- Count-up numbers ----------
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduce || isNaN(target)) { el.textContent = target; return; }
    var dur = 1600, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- Reveal on scroll ----------
  var items = document.querySelectorAll(".reveal, .reveal-scale, .split-words, .tl-item, [data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) {
      el.classList.add("in");
      if (el.hasAttribute("data-count")) el.textContent = el.getAttribute("data-count");
    });
  }

  if (!reduce && finePointer) {
    // ---------- Spotlight cards ----------
    document.querySelectorAll(".spot").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });

    // ---------- 3D tilt ----------
    document.querySelectorAll("[data-tilt]").forEach(function (wrap) {
      var target = wrap.querySelector(".tilt") || wrap;
      var frame = wrap.querySelector(".portrait-frame");
      wrap.addEventListener("pointermove", function (e) {
        var r = wrap.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = "rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 12).toFixed(2) + "deg)";
        if (frame) {
          frame.style.setProperty("--gx", (x + 0.5) * 100 + "%");
          frame.style.setProperty("--gy", (y + 0.5) * 100 + "%");
        }
      });
      wrap.addEventListener("pointerleave", function () { target.style.transform = ""; });
    });

    // ---------- Magnetic buttons ----------
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.18 + "px," + y * 0.3 + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    // ---------- Aurora parallax ----------
    var aurora = document.querySelector(".aurora");
    if (aurora) {
      window.addEventListener("pointermove", function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 30;
        var y = (e.clientY / window.innerHeight - 0.5) * 30;
        aurora.style.transform = "translate(" + x + "px," + y + "px)";
      }, { passive: true });
    }
  }


  // ---------- Kid-friendly floating emojis ----------
  var KID_SETS = {
    home: [
      ["\u{1f9f8}", "left:3%;top:72%", "3rem", "8s", "0s"],
      ["\u{1f308}", "left:4%;top:12%", "2.6rem", "9s", "-2s", "hide-sm"],
      ["\u{1f3a8}", "left:52%;top:7%", "2.4rem", "7s", "-1s"],
      ["\u{1f9e9}", "left:50%;bottom:9%", "2.3rem", "8.5s", "-4s", "hide-sm"],
      ["\u{2b50}", "right:4%;top:10%", "2.2rem", "6.5s", "-3s"],
      ["\u{1f58d}\u{fe0f}", "right:3%;bottom:14%", "2.6rem", "7.5s", "-5s"],
      ["\u{1f388}", "right:16%;top:4%", "2.2rem", "9.5s", "-6s", "hide-sm"]
    ],
    inner: [
      ["\u{1f9f8}", "right:14%;top:12%", "2.8rem", "8s", "0s"],
      ["\u{1f4da}", "right:31%;top:30%", "2.3rem", "7s", "-2s", "hide-sm"],
      ["\u{1f3a8}", "right:12%;bottom:12%", "2.5rem", "8.5s", "-4s"],
      ["\u{1f9e9}", "right:34%;bottom:12%", "2.1rem", "7.5s", "-1s", "hide-sm"],
      ["\u{1f308}", "right:2%;top:8%", "2.2rem", "9s", "-3s", "hide-sm"]
    ]
  };
  document.querySelectorAll(".hero, .page-hero").forEach(function (hero) {
    var set = hero.classList.contains("hero") ? KID_SETS.home : KID_SETS.inner;
    var wrap = document.createElement("div");
    wrap.className = "kid-emojis";
    wrap.setAttribute("aria-hidden", "true");
    set.forEach(function (e, i) {
      var s = document.createElement("span");
      s.textContent = e[0];
      s.style.cssText = e[1] + ";--s:" + e[2] + ";--t:" + e[3] + ";--dl:" + e[4] + ";--r0:" + (i % 2 ? "8deg" : "-8deg") + ";--r1:" + (i % 2 ? "-6deg" : "10deg");
      if (e[5]) s.className = e[5];
      wrap.appendChild(s);
    });
    hero.insertBefore(wrap, hero.firstChild.nextSibling);
    requestAnimationFrame(function () { wrap.classList.add("ready"); });
  });

  // ---------- Emoji burst on portrait / brand click ----------
  var BURST = ["\u{1f9f8}", "\u{1f3a8}", "\u{2b50}", "\u{1f308}", "\u{1f9e9}", "\u{1f4da}", "\u{1f388}", "\u{1f58d}\u{fe0f}", "\u{1f33b}", "\u{2764}\u{fe0f}"];
  function burst(x, y) {
    if (reduce) return;
    for (var i = 0; i < 14; i++) {
      (function (i) {
        var el = document.createElement("span");
        el.className = "emoji-burst";
        el.textContent = BURST[i % BURST.length];
        el.style.left = x + "px"; el.style.top = y + "px";
        document.body.appendChild(el);
        var ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        var dist = 90 + Math.random() * 90;
        var anim = el.animate([
          { transform: "translate(-50%,-50%) scale(.4)", opacity: 1 },
          { transform: "translate(calc(-50% + " + Math.cos(ang) * dist + "px), calc(-50% + " + (Math.sin(ang) * dist - 40) + "px)) scale(1.1) rotate(" + (Math.random() * 60 - 30) + "deg)", opacity: 1, offset: 0.6 },
          { transform: "translate(calc(-50% + " + Math.cos(ang) * dist * 1.15 + "px), calc(-50% + " + (Math.sin(ang) * dist + 60) + "px)) scale(.9)", opacity: 0 }
        ], { duration: 1300 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" });
        anim.onfinish = function () { el.remove(); };
      })(i);
    }
  }
  document.querySelectorAll(".portrait-frame, .brand-mark").forEach(function (el) {
    el.style.cursor = "pointer";
    el.addEventListener("click", function (e) {
      if (el.classList.contains("brand-mark")) return;
      burst(e.clientX, e.clientY);
    });
  });


  // ---------- Welcome avatar popup (once per visit) ----------
  (function () {
    var seen = false;
    try { seen = sessionStorage.getItem("km-welcome") === "1"; } catch (e) {}
    if (seen) return;
    var DUR = 8000;
    var box = document.createElement("aside");
    box.className = "welcome";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    box.style.setProperty("--dur", DUR + "ms");
    box.innerHTML =
      '<div class="welcome-avatar"><img src="assets/img/keerthika-avatar.jpg" alt="" width="68" height="68" />' +
      '<span class="wave-hand" aria-hidden="true">\u{1F44B}</span></div>' +
      '<div class="welcome-msg">' +
      '<div class="hi">Hi, I\u2019m Keerthika!</div>' +
      '<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<p hidden>Welcome to my portfolio \u{1F9F8} I\u2019m an Early Childhood Educator helping little learners grow through play.</p>' +
      '<div class="welcome-actions" hidden><a href="cover-letter.html">\u{1F4C4} Resume</a><a href="index.html#contact">\u{1F48C} Say hello</a></div>' +
      '</div>' +
      '<button class="welcome-close" type="button" aria-label="Close welcome message"><i class="fa-solid fa-xmark"></i></button>' +
      '<div class="welcome-timer" aria-hidden="true"><span></span></div>';
    var timer;
    function close() {
      clearTimeout(timer);
      box.classList.remove("show");
      box.classList.add("hide");
      setTimeout(function () { box.remove(); }, 500);
    }
    box.querySelector(".welcome-close").addEventListener("click", close);
    box.querySelector(".welcome-timer span").addEventListener("animationend", close);
    setTimeout(function () {
      document.body.appendChild(box);
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("show"); }); });
      setTimeout(function () {
        var t = box.querySelector(".typing"); if (t) t.remove();
        box.querySelector(".welcome-msg p").hidden = false;
        box.querySelector(".welcome-actions").hidden = false;
      }, reduce ? 0 : 1300);
      try { sessionStorage.setItem("km-welcome", "1"); } catch (e) {}
    }, reduce ? 300 : 1200);
  })();

  // ---------- Date-based progress bars ----------
  document.querySelectorAll("[data-progress-start]").forEach(function (el) {
    var s = new Date(el.getAttribute("data-progress-start")).getTime();
    var e = new Date(el.getAttribute("data-progress-end")).getTime();
    var pct = Math.round(Math.max(0, Math.min(1, (Date.now() - s) / (e - s))) * 100);
    el.setAttribute("aria-valuenow", pct);
    var fill = el.querySelector("span");
    var label = el.parentNode.querySelector("[data-progress-label]");
    if (label) label.textContent = pct + "%";
    setTimeout(function () { fill.style.transition = "width 1.6s cubic-bezier(.2,.75,.15,1)"; fill.style.width = pct + "%"; }, reduce ? 0 : 400);
  });

  // ---------- Footer year ----------
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
