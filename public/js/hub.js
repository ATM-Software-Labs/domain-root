/* Reachability of hub hosts from this browser.
   no-cors HEAD: an opaque response (status 0) still means the host answered.
   Do not read response.ok or response.status. Failures stay silent. */
(function () {
  "use strict";

  var HOSTS = [
    "labs",
    "guides",
    "ai",
    "rewrite",
    "nutri",
    "invest",
    "savings",
    "focusguard",
    "tools"
  ];
  var TIMEOUT_MS = 4500;
  var runId = 0;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function probe(slug) {
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, TIMEOUT_MS);
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

  ready(function () {
    var resumen = document.getElementById("estado-resumen");
    var button = document.getElementById("estado-btn");
    var table = document.getElementById("estado-tabla");
    if (!resumen || !button || !table) return;

    if (typeof fetch !== "function" || typeof AbortController !== "function") {
      resumen.textContent = "Este navegador no puede comprobar el alcance.";
      button.hidden = true;
      return;
    }

    function run() {
      var id = ++runId;
      var pending = HOSTS.length;
      var up = 0;
      button.disabled = true;
      table.setAttribute("aria-busy", "true");
      resumen.textContent = "Comprobando " + HOSTS.length + " hosts…";
      HOSTS.forEach(function (slug) {
        setRow(slug, "checking", "comprobando", null);
        probe(slug).then(function (result) {
          if (id !== runId) return;
          if (result.ok) up += 1;
          setRow(slug, result.ok ? "online" : "down", result.ok ? "en línea" : "sin respuesta", result.ok ? result.ms : null);
          pending -= 1;
          if (pending === 0) {
            var down = HOSTS.length - up;
            resumen.textContent = up + " en línea · " + down + " sin respuesta";
            button.disabled = false;
            table.setAttribute("aria-busy", "false");
          }
        });
      });
    }

    button.addEventListener("click", run);
    run();
  });
})();
