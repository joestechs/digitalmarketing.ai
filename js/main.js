// digitalmarketing.ai — shared site behavior
(function () {
  "use strict";

  /* Mobile sidebar toggle */
  var menuBtn = document.querySelector(".topbar__menu-btn");
  var sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("is-open");
    });
    document.addEventListener("click", function (e) {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove("is-open");
      }
    });
  }

  /* Collapsible sidebar groups */
  document.querySelectorAll(".side-group__title").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".side-group").classList.toggle("is-collapsed");
    });
  });

  /* Auto-expand the group containing the active link, collapse others on load */
  var activeLink = document.querySelector(".side-group__list a.is-active");
  if (activeLink) {
    document.querySelectorAll(".side-group").forEach(function (g) {
      if (!g.contains(activeLink)) g.classList.add("is-collapsed");
    });
  }

  /* Copy-to-clipboard for code blocks */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest(".code-block");
      var codeEl = block ? block.querySelector("pre code") : null;
      if (!codeEl) return;
      var text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(function () {
        var original = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("is-copied");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("is-copied");
        }, 1600);
      });
    });
  });

  /* Interview Q&A accordions */
  document.querySelectorAll(".qa__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".qa");
      var answer = item.querySelector(".qa__a");
      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : 0;
    });
  });

  /* Pill filters (used on interview + projects + tools pages) */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var pills = group.querySelectorAll(".pill");
    var targetSelector = group.getAttribute("data-filter-target");
    var targets = document.querySelectorAll(targetSelector);
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        var val = pill.getAttribute("data-filter");
        targets.forEach(function (t) {
          var tags = (t.getAttribute("data-tags") || "").split(",");
          t.style.display = val === "all" || tags.indexOf(val) > -1 ? "" : "none";
        });
      });
    });
  });

  /* Client-side search across SITE_INDEX (injected per-page) */
  var searchInput = document.querySelector(".topbar__search input");
  var resultsBox = document.querySelector(".search-results");
  if (searchInput && resultsBox && window.SITE_INDEX) {
    var render = function (items) {
      if (!items.length) {
        resultsBox.innerHTML = '<div class="empty">No matching pages yet.</div>';
        return;
      }
      resultsBox.innerHTML = items
        .slice(0, 8)
        .map(function (it) {
          return (
            '<a href="' + it.url + '">' + it.title +
            '<span class="cat">' + it.category + "</span></a>"
          );
        })
        .join("");
    };
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        resultsBox.classList.remove("is-open");
        return;
      }
      var matches = window.SITE_INDEX.filter(function (it) {
        return it.title.toLowerCase().indexOf(q) > -1 || it.category.toLowerCase().indexOf(q) > -1;
      });
      render(matches);
      resultsBox.classList.add("is-open");
    });
    document.addEventListener("click", function (e) {
      if (!resultsBox.contains(e.target) && e.target !== searchInput) {
        resultsBox.classList.remove("is-open");
      }
    });
  }

  /* Home hero — live campaign ticker count-up (illustrative dashboard data) */
  document.querySelectorAll("[data-count-to]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
