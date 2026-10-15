/* Hub behavior: language memory, keyboard across the selected projects.
   prefers-reduced-motion skips the unused type line when that node is absent. */
(function () {
  "use strict";

  var CHOICE = "atm_lang_choice";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function readCopy() {
    var node = document.getElementById("hub-copy");
    if (!node) return null;
    try { return JSON.parse(node.textContent); } catch (e) { return null; }
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

  rememberLanguage();
  ready(function () {
    var copy = readCopy();
    var hub = document.getElementById("hub");
    if (hub) keyboard(hub);
    typeLine(copy);
  });
})();
