/*
 * Sa7ne — standalone visual content editor.
 *
 * Reads the REAL content files (content/*.json — the same single source of
 * truth the public website reads through cms.js), renders every section and
 * image with live previews, and lets the client edit them.
 *
 * Saving: this is a static site with no backend, so "Save draft" writes to the
 * browser's localStorage (this browser only) and the public pages can overlay
 * that draft when "Preview" is on. To publish for everyone you Export the JSON
 * and commit it (or send it to the developer), or use Decap at /admin/cms/.
 */
(function () {
  "use strict";

  var FILES = [
    { key: "settings", group: "Site-wide", label: "Site Settings", file: "settings.json", path: "content/settings.json" },
    { key: "home", group: "Pages", label: "Home Page", file: "home.json", path: "content/home.json" },
    { key: "about", group: "Pages", label: "About Page", file: "about.json", path: "content/about.json" },
    { key: "contact", group: "Pages", label: "Contact Page", file: "contact.json", path: "content/contact.json" },
    { key: "collections/bowls", group: "Shop Collections", label: "Bowls", file: "bowls.json", path: "content/collections/bowls.json" },
    { key: "collections/platters", group: "Shop Collections", label: "Platters", file: "platters.json", path: "content/collections/platters.json" },
    { key: "collections/risers", group: "Shop Collections", label: "Plate Risers", file: "risers.json", path: "content/collections/risers.json" },
    { key: "collections/stands", group: "Shop Collections", label: "Cake Stands", file: "stands.json", path: "content/collections/stands.json" },
    { key: "collections/sets", group: "Shop Collections", label: "Customised Sets", file: "sets.json", path: "content/collections/sets.json" }
  ];

  var PRETTY = {
    tag: "Badge", desc: "Description", alt: "Image alt text", image_alt: "Image alt text",
    title_em: "Highlighted word", title_line1: "Title — line 1", title_line2: "Title — line 2",
    cta: "Call to action", instagram_handle: "Instagram handle", whatsapp_url: "WhatsApp link",
    instagram_url: "Instagram link", pinterest_url: "Pinterest link", email: "Email address",
    footer_description: "Footer description", brand_alt: "Logo alt text", avatar_class: "Avatar colour",
    primary_btn_label: "Primary button label", primary_btn_link: "Primary button link",
    secondary_btn_label: "Secondary button label", secondary_btn_link: "Secondary button link",
    button_label: "Button label", button_link: "Button link", count: "Count label", link: "Links to"
  };

  var published = {}; // key -> originally published object (for compare + reset)
  var state = {};     // key -> working object (draft or copy of published)
  var current = FILES[0].key;

  var $ = function (id) { return document.getElementById(id); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var draftKey = function (key) { return "sa7ne:content:" + key; };
  var fileOf = function (key) { for (var i = 0; i < FILES.length; i++) if (FILES[i].key === key) return FILES[i]; };

  function prettify(key) {
    if (PRETTY[key]) return PRETTY[key];
    var m = /^p(\d+)$/.exec(key);
    if (m) return "Paragraph " + m[1];
    m = /^line(\d+)$/.exec(key);
    if (m) return "Line " + m[1];
    return key.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function isImage(key, val) {
    if (key === "image" || key === "logo") return true;
    return typeof val === "string" && (/^\/?images\//.test(val) || /\.(jpe?g|png|webp|gif|svg)$/i.test(val));
  }

  function differs(key) {
    return JSON.stringify(state[key]) !== JSON.stringify(published[key]);
  }

  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  // ---- field renderers -------------------------------------------------------

  function imageField(parent, key, labelText) {
    var wrap = document.createElement("div"); wrap.className = "field";
    var label = document.createElement("label"); label.textContent = labelText; wrap.appendChild(label);
    var row = document.createElement("div"); row.className = "imgfield";

    var thumb = document.createElement("div"); thumb.className = "thumb";
    var img = document.createElement("img");
    var ph = document.createElement("div"); ph.className = "ph"; ph.textContent = "no image";
    function refresh(v) {
      if (v) { img.src = v; img.style.display = ""; if (ph.parentNode) thumb.removeChild(ph); }
      else { img.style.display = "none"; if (!ph.parentNode) thumb.appendChild(ph); }
    }
    img.onerror = function () { img.style.display = "none"; if (!ph.parentNode) { ph.textContent = "not found"; thumb.appendChild(ph); } };
    thumb.appendChild(img);

    var grow = document.createElement("div"); grow.className = "grow";
    var input = document.createElement("input"); input.type = "text"; input.value = parent[key] || "";
    input.placeholder = "/images/your-photo.jpg";
    input.addEventListener("input", function () { parent[key] = input.value; refresh(input.value); markDirty(); });
    var hint = document.createElement("div"); hint.className = "muted"; hint.style.marginTop = "5px";
    hint.textContent = "Path of an image in the site’s images folder (e.g. /images/image1.jpg).";
    grow.appendChild(input); grow.appendChild(hint);

    row.appendChild(thumb); row.appendChild(grow); wrap.appendChild(row);
    refresh(parent[key]);
    return wrap;
  }

  function textField(parent, key, labelText) {
    var v = parent[key];
    var wrap = document.createElement("div"); wrap.className = "field";
    var label = document.createElement("label"); label.textContent = labelText; wrap.appendChild(label);
    var long = typeof v === "string" && (v.length > 70 || v.indexOf("\n") >= 0);
    var input = document.createElement(long ? "textarea" : "input");
    if (!long) input.type = "text";
    input.value = v == null ? "" : String(v);
    input.addEventListener("input", function () {
      parent[key] = (typeof v === "number") ? (input.value === "" ? "" : Number(input.value)) : input.value;
      markDirty();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function arrayField(parentObj, key, labelText) {
    var arr = parentObj[key];
    var wrap = document.createElement("fieldset");
    var legend = document.createElement("legend"); legend.textContent = labelText + " (" + arr.length + ")"; wrap.appendChild(legend);
    var box = document.createElement("div"); box.className = "arr"; wrap.appendChild(box);

    arr.forEach(function (item, i) {
      var it = document.createElement("div"); it.className = "item";
      var hd = document.createElement("div"); hd.className = "itemhd";
      var ttl = document.createElement("div"); ttl.className = "ttl";
      ttl.textContent = "#" + (i + 1) + (item && typeof item === "object" ? " — " + (item.name || item.title || item.alt || "") : "");
      var rm = document.createElement("button"); rm.className = "btn ghost small"; rm.textContent = "Remove";
      rm.addEventListener("click", function () { arr.splice(i, 1); markDirty(); renderFile(current); });
      hd.appendChild(ttl); hd.appendChild(rm); it.appendChild(hd);

      if (item !== null && typeof item === "object") {
        Object.keys(item).forEach(function (k) { it.appendChild(renderNode(item, k)); });
      } else {
        it.appendChild(renderNode(arr, i, "Value"));
      }
      box.appendChild(it);
    });

    var add = document.createElement("button"); add.className = "btn small"; add.textContent = "+ Add " + singular(labelText);
    add.addEventListener("click", function () {
      var tmpl = arr.length ? blankClone(arr[arr.length - 1]) : "";
      arr.push(tmpl); markDirty(); renderFile(current);
    });
    wrap.appendChild(add);
    return wrap;
  }

  // Render parent[key] (key may be a string key or an array index)
  function renderNode(parent, key, labelOverride) {
    var v = parent[key];
    var labelText = labelOverride || prettify(String(key));
    if (Array.isArray(v)) return arrayField(parent, key, labelText);
    if (v !== null && typeof v === "object") {
      var fs = document.createElement("fieldset");
      var lg = document.createElement("legend"); lg.textContent = labelText; fs.appendChild(lg);
      Object.keys(v).forEach(function (k) { fs.appendChild(renderNode(v, k)); });
      return fs;
    }
    if (isImage(String(key), v)) return imageField(parent, key, labelText);
    return textField(parent, key, labelText);
  }

  function singular(label) {
    return label.replace(/\s*\(\d+\)\s*$/, "").replace(/s$/, "").toLowerCase() || "item";
  }
  function blankClone(v) {
    if (Array.isArray(v)) return [];
    if (v !== null && typeof v === "object") { var o = {}; Object.keys(v).forEach(function (k) { o[k] = blankClone(v[k]); }); return o; }
    return typeof v === "number" ? 0 : "";
  }

  // ---- panel + nav -----------------------------------------------------------

  function renderFile(key) {
    current = key;
    var f = fileOf(key);
    var panel = $("panel"); panel.innerHTML = "";
    var h = document.createElement("h2"); h.textContent = f.label; panel.appendChild(h);
    var sub = document.createElement("p"); sub.className = "sub";
    sub.innerHTML = "Editing <code>" + f.path + "</code> — the live content for this part of the site.";
    panel.appendChild(sub);

    var data = state[key];
    if (!data || typeof data !== "object") { panel.appendChild(Object.assign(document.createElement("p"), { className: "muted", textContent: "Could not load this file." })); return; }
    Object.keys(data).forEach(function (k) { panel.appendChild(renderNode(data, k)); });
    buildNav();
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  function buildNav() {
    var side = $("side"); side.innerHTML = "";
    var lastGroup = null;
    FILES.forEach(function (f) {
      if (f.group !== lastGroup) {
        var g = document.createElement("div"); g.className = "grp"; g.textContent = f.group; side.appendChild(g); lastGroup = f.group;
      }
      var b = document.createElement("button");
      b.className = f.key === current ? "active" : "";
      var name = document.createElement("span"); name.textContent = f.label; b.appendChild(name);
      if (differs(f.key)) { var d = document.createElement("span"); d.className = "dot"; d.textContent = "●"; d.title = "Has unsaved/edited changes"; b.appendChild(d); }
      b.addEventListener("click", function () { renderFile(f.key); });
      side.appendChild(b);
    });
  }

  function markDirty() { buildNav(); }

  // ---- persistence -----------------------------------------------------------

  function saveAll() {
    var n = 0;
    FILES.forEach(function (f) {
      try {
        if (differs(f.key)) { localStorage.setItem(draftKey(f.key), JSON.stringify(state[f.key])); n++; }
        else { localStorage.removeItem(draftKey(f.key)); }
      } catch (e) {}
    });
    toast(n ? "Draft saved in this browser (" + n + " file" + (n > 1 ? "s" : "") + ")" : "No changes to save");
    buildNav();
  }

  function download(filename, text) {
    var blob = new Blob([text], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportFile(key) { var f = fileOf(key); download(f.file, JSON.stringify(state[key], null, 2) + "\n"); }
  function exportAll() {
    var changed = FILES.filter(function (f) { return differs(f.key); });
    var list = changed.length ? changed : FILES;
    list.forEach(function (f, i) { setTimeout(function () { exportFile(f.key); }, i * 250); });
    toast("Exporting " + list.length + " file" + (list.length > 1 ? "s" : "") + "…");
  }

  function resetCurrent() {
    if (!confirm("Discard your edits to “" + fileOf(current).label + "” and reload the published content?")) return;
    state[current] = clone(published[current]);
    try { localStorage.removeItem(draftKey(current)); } catch (e) {}
    renderFile(current); toast("Section reset to published content");
  }

  function setPreview(on) {
    try { localStorage.setItem("sa7ne:preview", on ? "on" : "off"); } catch (e) {}
    if (on) { saveAll(); toast("Preview on — open the site in this browser to see your draft"); }
    else { toast("Preview off — the site shows the published content again"); }
  }

  // ---- boot ------------------------------------------------------------------

  function loadAll() {
    return Promise.all(FILES.map(function (f) {
      return fetch("/" + f.path, { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; })
        .then(function (j) {
          published[f.key] = j || {};
          var draft = null;
          try { var raw = localStorage.getItem(draftKey(f.key)); if (raw) draft = JSON.parse(raw); } catch (e) {}
          state[f.key] = draft || clone(published[f.key]);
        });
    }));
  }

  function init() {
    $("saveBtn").addEventListener("click", saveAll);
    $("exportBtn").addEventListener("click", function () { exportFile(current); });
    $("exportAllBtn").addEventListener("click", exportAll);
    $("resetBtn").addEventListener("click", resetCurrent);
    var pt = $("previewToggle");
    try { pt.checked = localStorage.getItem("sa7ne:preview") === "on"; } catch (e) {}
    pt.addEventListener("change", function () { setPreview(pt.checked); });
    loadAll().then(function () { renderFile(current); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
