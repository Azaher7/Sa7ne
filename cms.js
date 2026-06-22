/*
 * Sa7ne — lightweight content hydration (no build, no dependencies).
 *
 * Reads JSON from /content and injects it into the EXISTING markup through
 * data-* attributes, so the design/markup stays byte-for-byte intact while the
 * text and images become editable from the Decap CMS at /admin.
 *
 * It is pure progressive enhancement: if a file or a key is missing (or JS is
 * disabled), the original HTML simply stays in place as a fallback.
 *
 * Attributes
 *   Singletons (anywhere on the page):
 *     data-cms="home.hero.title"        -> element.textContent
 *     data-cms-src="home.hero.image"    -> <img> src
 *     data-cms-alt="home.hero.image_alt"-> alt attribute
 *     data-cms-href="settings.contact.instagram_url" -> <a> href
 *     data-cms-href-mailto="settings.contact.email"  -> <a> href = "mailto:" + value
 *
 *   Repeatable lists (container holds ONE template child):
 *     data-cms-list="home.gallery"      -> rebuilds children from the array
 *       Inside the template, fields are relative to each array item:
 *         data-field="name"             -> textContent (or the item itself for
 *                                          string arrays via bare data-field)
 *         data-field-optional           -> remove the element if the value is empty
 *         data-field-src="image"        -> <img> src
 *         data-field-alt="alt"          -> alt attribute
 *         data-field-href="link"        -> <a> href
 *         data-field-class="avatar_class" -> add a CSS class
 *
 * Data namespaces: "settings" (content/settings.json) is always loaded. Pages
 * opt into extra files with <body data-cms-load="home=home"> meaning
 * "load content/home.json under the namespace home". Multiple files are
 * comma-separated, e.g. data-cms-load="page=collections/bowls".
 */
(function () {
  "use strict";

  function resolve(root, path) {
    if (!path) return undefined;
    var parts = path.split(".");
    var cur = root;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      var key = parts[i];
      var idx = null;
      var m = key.match(/^(.*?)\[(\d+)\]$/);
      if (m) { key = m[1]; idx = parseInt(m[2], 10); }
      if (key) cur = cur[key];
      if (idx != null && cur != null) cur = cur[idx];
    }
    return cur;
  }

  function applyFields(node, item) {
    var els = [node].concat(Array.prototype.slice.call(node.querySelectorAll("*")));
    els.forEach(function (el) {
      var f;
      if ((f = el.getAttribute("data-field")) != null) {
        var v = (item !== null && typeof item === "object") ? item[f] : item;
        if (el.hasAttribute("data-field-optional") && (v == null || v === "")) {
          el.parentNode && el.parentNode.removeChild(el);
          return;
        }
        if (v != null) el.textContent = String(v);
      }
      if ((f = el.getAttribute("data-field-src")) != null && item[f]) el.setAttribute("src", item[f]);
      if ((f = el.getAttribute("data-field-alt")) != null && item[f] != null) el.setAttribute("alt", item[f]);
      if ((f = el.getAttribute("data-field-href")) != null && item[f]) el.setAttribute("href", item[f]);
      if ((f = el.getAttribute("data-field-class")) != null && item[f]) el.classList.add(item[f]);
    });
  }

  function hydrate(data) {
    // Lists first so their cloned children don't get re-processed as singletons.
    Array.prototype.forEach.call(document.querySelectorAll("[data-cms-list]"), function (container) {
      var arr = resolve(data, container.getAttribute("data-cms-list"));
      if (!Array.isArray(arr) || !arr.length) return; // keep original markup as fallback
      var template = container.firstElementChild;
      if (!template) return;
      template = template.cloneNode(true);
      container.innerHTML = "";
      arr.forEach(function (item) {
        var node = template.cloneNode(true);
        applyFields(node, item);
        container.appendChild(node);
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-cms]"), function (el) {
      var v = resolve(data, el.getAttribute("data-cms"));
      if (v != null) el.textContent = String(v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cms-src]"), function (el) {
      var v = resolve(data, el.getAttribute("data-cms-src"));
      if (v) el.setAttribute("src", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cms-alt]"), function (el) {
      var v = resolve(data, el.getAttribute("data-cms-alt"));
      if (v != null) el.setAttribute("alt", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cms-href]"), function (el) {
      var v = resolve(data, el.getAttribute("data-cms-href"));
      if (v) el.setAttribute("href", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cms-href-mailto]"), function (el) {
      var v = resolve(data, el.getAttribute("data-cms-href-mailto"));
      if (v) el.setAttribute("href", "mailto:" + v);
    });
  }

  function load() {
    var toLoad = [["settings", "content/settings.json"]];
    var spec = document.body.getAttribute("data-cms-load");
    if (spec) {
      spec.split(",").forEach(function (pair) {
        var kv = pair.split("=");
        var ns = (kv[0] || "").trim();
        var path = (kv[1] || "").trim();
        if (ns && path) toLoad.push([ns, "content/" + path + ".json"]);
      });
    }
    // Optional draft preview: the /admin editor can save a draft to localStorage.
    // When the visitor turns preview on (same browser), overlay that draft.
    var preview = false;
    try { preview = localStorage.getItem("sa7ne:preview") === "on"; } catch (e) {}

    var data = {};
    Promise.all(toLoad.map(function (entry) {
      var ns = entry[0], url = entry[1];
      if (preview) {
        try {
          var dk = "sa7ne:content:" + url.replace(/^content\//, "").replace(/\.json$/, "");
          var raw = localStorage.getItem(dk);
          if (raw) { data[ns] = JSON.parse(raw); return Promise.resolve(); }
        } catch (e) { /* fall through to fetch */ }
      }
      return fetch(url, { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j) data[ns] = j; })
        .catch(function () { /* keep fallback markup */ });
    })).then(function () { hydrate(data); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
