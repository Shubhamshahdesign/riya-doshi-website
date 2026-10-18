(function () {
  "use strict";

  // Her WhatsApp number in international format, digits only (India +91).
  var WHATSAPP_NUMBER = "916354197282";

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Surat time vs visitor's time */
  var suratEl = document.getElementById("time-surat");
  var localEl = document.getElementById("time-local");
  var localLabel = document.getElementById("time-local-label");
  if (suratEl && localEl) {
    var visitorZone = "";
    try { visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    var city = visitorZone.split("/").pop().replace(/_/g, " ");
    if (localLabel) {
      localLabel.textContent = visitorZone === "Asia/Kolkata" || visitorZone === "Asia/Calcutta"
        ? "Your time" : (city ? "Your time (" + city + ")" : "Your time");
    }
    var fmt = function (zone) {
      var opts = { hour: "2-digit", minute: "2-digit", hour12: false };
      if (zone) opts.timeZone = zone;
      try { return new Intl.DateTimeFormat("en-GB", opts).format(new Date()); }
      catch (e) { return new Date().toTimeString().slice(0, 5); }
    };
    var tick = function () {
      suratEl.textContent = fmt("Asia/Kolkata") + " IST";
      localEl.textContent = fmt(visitorZone || undefined);
    };
    tick();
    setInterval(tick, 20000);
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Pre-select a service from a link like book.html?service=Sports%20injury */
  var serviceSelect = document.getElementById("bk-service");
  if (serviceSelect && window.location.search) {
    try {
      var wanted = new URLSearchParams(window.location.search).get("service");
      if (wanted) {
        for (var i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].value === wanted) { serviceSelect.selectedIndex = i; break; }
        }
      }
    } catch (e) {}
  }

  /* Booking form -> WhatsApp */
  var form = document.getElementById("booking-form");
  if (!form) return;

  var fields = {
    name: document.getElementById("bk-name"),
    phone: document.getElementById("bk-phone"),
    service: document.getElementById("bk-service")
  };
  var result = document.getElementById("booking-result");

  function setError(input, msg) {
    var wrap = input.closest(".field");
    var err = wrap.querySelector(".error");
    wrap.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
  }

  function validate() {
    var ok = true;
    var name = fields.name.value.trim();
    var digits = fields.phone.value.replace(/[^\d]/g, "");
    if (name.length < 2) { setError(fields.name, "Enter your name."); ok = false; } else setError(fields.name, "");
    if (digits.length < 8 || digits.length > 15) {
      setError(fields.phone, "Enter a phone number with country code, for example +91 98250 12345 or +44 7700 900123.");
      ok = false;
    } else setError(fields.phone, "");
    if (!fields.service.value) { setError(fields.service, "Choose the service you need."); ok = false; } else setError(fields.service, "");
    return ok;
  }

  Object.keys(fields).forEach(function (k) {
    fields[k].addEventListener("change", function () {
      if (fields[k].closest(".field").classList.contains("has-error")) validate();
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstBad = form.querySelector("[aria-invalid='true']");
      if (firstBad) firstBad.focus();
      return;
    }

    var message =
      "Hello Dr. Riya, I would like to book a physiotherapy session.\n\n" +
      "Name: " + fields.name.value.trim() + "\n" +
      "Phone: " + fields.phone.value.trim() + "\n" +
      "Service: " + fields.service.value + "\n\n" +
      "(Sent from your website booking form)";

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

    var win = null;
    try { win = window.open(url, "_blank"); if (win) win.opener = null; } catch (err) { win = null; }

    if (result) {
      result.hidden = false;
      result.innerHTML = "";
      var strong = document.createElement("strong");
      strong.textContent = win ? "WhatsApp is opening with your booking details." : "Your booking message is ready.";
      var p = document.createElement("span");
      p.textContent = win
        ? "Press send in WhatsApp to deliver it. Riya will reply to confirm a time."
        : "Open WhatsApp and press send to deliver it. Riya will reply to confirm a time.";
      var a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      a.textContent = win ? "WhatsApp didn't open? Open it here" : "Open WhatsApp";
      result.appendChild(strong); result.appendChild(p); result.appendChild(a);
    }
    // Popup blocked on a normal page: go to WhatsApp in this tab instead.
    var framed = false;
    try { framed = window.top !== window.self; } catch (err) { framed = true; }
    if (!win && !framed) window.location.href = url;
  });
})();

