/* Hub behavior: language memory, terminal line, keyboard grid, no-cors reachability.
   An opaque no-cors response means the host answered. Do not read response.ok. */
(function () {
  "use strict";

  var CHOICE = "atm_lang_choice";
  var TIMEOUT_MS = 4500;
  var runId = 0;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function readCopy() {
    var node = document.getElementById("hub-copy");
    if (!node) return null;
    try { return JSON.parse(node.textContent); } catch (e) { return null; }
  }

  function fill(template, map) {
    return String(template || "").replace(/\{(\w+)\}/g, function (_, key) {
      return map[key] == null ? "" : String(map[key]);
    });
  }

  function rememberLanguage() {
    document.addEventListener("click", function (event) {
      var node = event.target;
      while (node && node !== document) {
        if (node.getAttribute && node.getAttribute("data-lang-switch")) {
          try { localStorage.setItem(CHOICE, node.getAttribute("data-lang-switch")); } catch (e) {}
          return;
        }
        node = node.parentNode;
      }
    });
  }

  function columns(items) {
    if (items.length < 2) return 1;
    var top = items[0].getBoundingClientRect().top;
    var count = 1;
    for (var i = 1; i < items.length; i += 1) {
      if (Math.abs(items[i].getBoundingClientRect().top - top) > 8) break;
      count += 1;
    }
    return count;
  }

  function keyboard(hub) {
    hub.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
      var items = Array.prototype.slice.call(hub.querySelectorAll("[data-hub-item]"));
      var index = items.indexOf(document.activeElement);
      if (index < 0) return;
      var cols = columns(items);
      var next = index;
      if (key === "ArrowRight") next = index + 1;
      else if (key === "ArrowLeft") next = index - 1;
      else if (key === "ArrowDown") next = index + cols;
      else if (key === "ArrowUp") next = index - cols;
      else if (key === "Home") next = 0;
      else if (key === "End") next = items.length - 1;
      if (next < 0 || next >= items.length || next === index) return;
      event.preventDefault();
      items[next].focus();
    });
  }

  function typeLine(copy) {
    var line = document.getElementById("term-line");
    var phrases = copy && copy.phrases;
    if (!line || !phrases || !phrases.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      line.textContent = phrases.join("  ·  ");
      var caret = line.parentNode && line.parentNode.querySelector(".caret");
      if (caret) caret.remove();
      return;
    }
    var phrase = 0;
    var char = 0;
    var deleting = false;
    function tick() {
      var text = phrases[phrase];
      if (!deleting) {
        char += 1;
        line.textContent = text.slice(0, char);
        if (char >= text.length) {
          deleting = true;
          setTimeout(tick, 1100);
          return;
        }
        setTimeout(tick, 46);
        return;
      }
      char -= 1;
      line.textContent = text.slice(0, Math.max(char, 0));
      if (char <= 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        setTimeout(tick, 280);
        return;
      }
      setTimeout(tick, 28);
    }
    tick();
  }

  function probe(slug) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var started = performance.now();
    return fetch("https://" + slug + ".trujillomingorance.com/", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      redirect: "follow",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal
    }).then(
      function () {
        clearTimeout(timer);
        return { ok: true, ms: Math.max(0, Math.round(performance.now() - started)) };
      },
      function () {
        clearTimeout(timer);
        return { ok: false, ms: null };
      }
    );
  }

  function setRow(slug, state, label, ms) {
    var row = document.querySelector('tr[data-slug="' + slug + '"]');
    if (!row) return;
    row.setAttribute("data-state", state);
    var stateEl = row.querySelector(".js-label");
    var msEl = row.querySelector(".js-ms");
    if (stateEl) stateEl.textContent = label;
    if (msEl) msEl.textContent = ms == null ? "—" : ms + " ms";
  }

  function status(copy) {
    var resumen = document.getElementById("estado-resumen");
    var button = document.getElementById("estado-btn");
    var table = document.getElementById("estado-tabla");
    if (!resumen || !button || !table || !copy) return;
    var hosts = Array.prototype.map.call(table.querySelectorAll("tr[data-probe]"), function (row) {
      return row.getAttribute("data-slug");
    });
    if (typeof fetch !== "function" || typeof AbortController !== "function") {
      resumen.textContent = copy.browser || "";
      button.hidden = true;
      return;
    }
    function run() {
      var id = ++runId;
      var pending = hosts.length;
      var up = 0;
      button.disabled = true;
      table.setAttribute("aria-busy", "true");
      resumen.textContent = fill(copy.checking, { n: hosts.length });
      hosts.forEach(function (slug) {
        setRow(slug, "checking", copy.checkingLabel, null);
        probe(slug).then(function (result) {
          if (id !== runId) return;
          if (result.ok) up += 1;
          setRow(slug, result.ok ? "online" : "down", result.ok ? copy.online : copy.offline, result.ok ? result.ms : null);
          pending -= 1;
          if (pending === 0) {
            resumen.textContent = fill(copy.summary, { up: up, down: hosts.length - up });
            button.disabled = false;
            table.setAttribute("aria-busy", "false");
          }
        });
      });
    }
    button.addEventListener("click", run);
    run();
  }

  rememberLanguage();
  ready(function () {
    var copy = readCopy();
    var hub = document.getElementById("hub");
    if (hub) keyboard(hub);
    typeLine(copy);
    status(copy);
  });
})();
