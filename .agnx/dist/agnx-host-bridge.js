// 场景：Screen Toys 静态站 → 宿主 Tab 导航同步；强制合集内/外链均在同一 frame 打开，禁止弹新窗。
(function () {
  if (typeof window === "undefined") {
    return;
  }
  var TYPE = "agnx-screentoys:nav";

  function postNavPayload(path, title) {
    try {
      var payload = {
        type: TYPE,
        path: path || window.location.href || window.location.pathname || "/",
        title: title || document.title || "",
      };
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }
      if (
        window.ReactNativeWebView &&
        typeof window.ReactNativeWebView.postMessage === "function"
      ) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    } catch (_) {
      // ignore
    }
  }

  function postNav() {
    postNavPayload(window.location.href || window.location.pathname || "/", document.title || "");
  }

  function rewritePortalLinks() {
    try {
      var anchors = document.querySelectorAll("a[href]");
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var href = a.getAttribute("href") || "";
        if (/screen\.toys/i.test(href)) {
          a.setAttribute("href", "../");
        }
        if (a.classList && a.classList.contains("toy-item")) {
          a.setAttribute("target", "_self");
          a.removeAttribute("rel");
        } else if (
          a.getAttribute("target") === "_blank" &&
          /screen\.toys|fivepenguins|shapiro500/i.test(href)
        ) {
          a.setAttribute("target", "_self");
          a.removeAttribute("rel");
        }
      }
    } catch (_) {
      // ignore
    }
  }

  function forceEmbedNavigation(url) {
    if (!url) {
      return false;
    }
    try {
      window.location.assign(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  try {
    window.open = function (url) {
      if (typeof url === "string" && url) {
        postNavPayload(url, "");
        forceEmbedNavigation(url);
      }
      return null;
    };
  } catch (_) {
    // ignore
  }

  document.addEventListener(
    "click",
    function (event) {
      try {
        var el = event.target;
        while (el && el.tagName !== "A") {
          el = el.parentElement;
        }
        if (!el || el.tagName !== "A") {
          return;
        }
        var href = el.getAttribute("href");
        if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) {
          return;
        }
        var resolved = el.href || href;
        var isToyItem = el.classList && el.classList.contains("toy-item");
        var isExternalToy = /fivepenguins\.party|shapiro500\.com/i.test(resolved);
        if (!isToyItem && !isExternalToy) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        var titleEl = el.querySelector ? el.querySelector(".toy-title") : null;
        var title = (titleEl && titleEl.textContent) || el.getAttribute("title") || "";
        // 外链玩具离开我们源后拿不到 location，必须在跳转前同步宿主。
        postNavPayload(resolved, title);
        forceEmbedNavigation(resolved);
      } catch (_) {
        // ignore
      }
    },
    true,
  );

  function onReady() {
    rewritePortalLinks();
    postNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  window.addEventListener("pageshow", postNav);
  window.addEventListener("hashchange", postNav);
  window.addEventListener("popstate", postNav);
})();
