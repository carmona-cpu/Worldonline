/* SkyStore — interacciones del tema.
   Usa la API de carrito de Shopify (/cart/add.js, /cart/change.js) y la
   Section Rendering API para refrescar el carrito lateral sin recargar. */
(function () {
  'use strict';
  var S = window.SkyStore || { routes: {}, strings: {}, cartType: 'drawer' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- aviso flotante ---------- */
  function toast(msg) {
    var t = $('#Toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- menú móvil ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#Burger');
    if (!b) return;
    var m = $('#MobileNav');
    var open = m.classList.toggle('open');
    b.setAttribute('aria-expanded', open);
  });

  /* ---------- carrito lateral ---------- */
  var drawer = $('#CartDrawer');
  var scrim = $('#CartScrim');
  var lastFocus = null;
  function openCart() {
    if (!drawer) { window.location.href = S.routes.cart_url; return; }
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    scrim && scrim.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.focus();
  }
  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove('open');
    scrim && scrim.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }
  function renderCart(sections) {
    if (!sections || !sections['cart-drawer']) return;
    var doc = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html');
    var fresh = doc.querySelector('#CartDrawerInner');
    var current = $('#CartDrawerInner');
    if (fresh && current) current.replaceWith(fresh);
    var count = doc.querySelector('[data-cart-count]');
    var badge = $('#CartCount');
    if (count && badge) badge.textContent = count.textContent.trim();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('#CartToggle') && S.cartType === 'drawer' && drawer) {
      e.preventDefault();
      openCart();
    }
    if (e.target.closest('[data-cart-close]')) closeCart();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  /* ---------- agregar al carrito ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-product-form]');
    if (!form) return;
    if (!window.fetch) return;
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    var err = form.querySelector('[data-form-error]');
    if (btn) btn.classList.add('is-loading');
    if (err) err.hidden = true;
    var data = new FormData(form);
    if (drawer) data.append('sections', 'cart-drawer');
    data.append('sections_url', window.location.pathname);
    fetch(S.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: data
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok || res.body.status) {
          var msg = res.body.description || res.body.message || S.strings.error;
          if (err) { err.textContent = msg; err.hidden = false; } else { toast(msg); }
          return;
        }
        if (S.cartType === 'drawer' && drawer) {
          renderCart(res.body.sections);
          openCart();
        } else {
          window.location.href = S.routes.cart_url;
        }
      })
      .catch(function () { toast(S.strings.error); })
      .finally(function () { if (btn) btn.classList.remove('is-loading'); });
  });

  /* ---------- cambiar cantidades ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-line-change]');
    if (!a || !window.fetch) return;
    e.preventDefault();
    var box = a.closest('.d-body') || a.closest('#CartPage');
    if (box) box.classList.add('is-loading');
    fetch(S.routes.cart_change_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        line: parseInt(a.dataset.lineChange, 10),
        quantity: parseInt(a.dataset.quantity, 10),
        sections: drawer ? ['cart-drawer'] : [],
        sections_url: window.location.pathname
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (body) {
        if (body.status) { toast(body.description || S.strings.error); }
        if (document.body.classList.contains('template-cart')) { window.location.reload(); return; }
        renderCart(body.sections);
      })
      .catch(function () { toast(S.strings.error); })
      .finally(function () { var b = $('.d-body'); if (b) b.classList.remove('is-loading'); });
  });

  /* ---------- selector de variantes ---------- */
  function initProduct(root) {
    var jsonEl = root.querySelector('[data-product-json]');
    var form = root.querySelector('[data-product-form]');
    if (!jsonEl || !form) return;
    var product;
    try { product = JSON.parse(jsonEl.textContent); } catch (err) { return; }
    var groups = $$('[data-option-index]', root);
    var idInput = form.querySelector('[data-variant-id]');
    var priceEl = root.querySelector('[data-price]');
    var addBtn = form.querySelector('[data-add-button]');
    var isPage = !!root.closest('.pdp--page');
    var bar = root.querySelector('[data-buybar]');
    var barPrice = bar && bar.querySelector('[data-buybar-price]');
    var barBtn = bar && bar.querySelector('[data-buybar-btn]');
    if (bar && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        var past = !e.isIntersecting && e.boundingClientRect.top < 0;
        bar.classList.toggle('show', past);
        bar.setAttribute('aria-hidden', past ? 'false' : 'true');
        barBtn.tabIndex = past ? 0 : -1;
      }).observe(addBtn);
      barBtn.addEventListener('click', function () {
        if (form.requestSubmit) form.requestSubmit(addBtn); else addBtn.click();
      });
    }

    function selected() {
      return groups.map(function (g) {
        var b = g.querySelector('[aria-pressed="true"]');
        return b ? b.dataset.value : null;
      });
    }
    function findVariant(sel) {
      return product.variants.find(function (v) {
        return v.options.every(function (o, i) { return sel[i] === null || o === sel[i]; });
      });
    }
    function markAvailability(sel) {
      groups.forEach(function (g, gi) {
        $$('button[data-value]', g).forEach(function (b) {
          var test = sel.slice();
          test[gi] = b.dataset.value;
          var ok = product.variants.some(function (v) {
            return v.available && v.options.every(function (o, i) { return o === test[i]; });
          });
          b.classList.toggle('is-unavailable', !ok);
        });
      });
    }
    function update() {
      var sel = selected();
      var v = findVariant(sel);
      markAvailability(sel);
      groups.forEach(function (g) {
        var lbl = g.querySelector('[data-option-label]');
        var b = g.querySelector('[aria-pressed="true"]');
        if (lbl && b) lbl.textContent = b.dataset.value;
      });
      if (!v) {
        addBtn.disabled = true;
        addBtn.textContent = S.strings.unavailable;
        if (barBtn) { barBtn.disabled = true; barBtn.textContent = S.strings.unavailable; }
        return;
      }
      idInput.value = v.id;
      idInput.dispatchEvent(new Event('change', { bubbles: true }));
      if (priceEl) priceEl.innerHTML = v.price_html;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? S.strings.addToCart : S.strings.soldOut;
      if (barPrice) barPrice.innerHTML = v.price_html;
      if (barBtn) { barBtn.disabled = !v.available; barBtn.textContent = v.available ? S.strings.addShort : S.strings.soldOut; }
      if (v.media_id) showMedia(root, String(v.media_id));
      if (isPage && window.history.replaceState) {
        window.history.replaceState({}, '', product.url + '?variant=' + v.id);
      }
    }
    groups.forEach(function (g) {
      g.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-value]');
        if (!b) return;
        $$('button[data-value]', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        update();
      });
    });
    markAvailability(selected());
  }

  /* ---------- galería ---------- */
  function swapStage(root, btn) {
    var img = root.querySelector('.stage-img');
    if (!img || !btn) return;
    $$('.thumbs button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === btn); });
    img.style.opacity = 0;
    setTimeout(function () {
      img.src = btn.dataset.src;
      if (btn.dataset.srcset) img.srcset = btn.dataset.srcset; else img.removeAttribute('srcset');
      img.style.opacity = 1;
    }, 180);
  }
  function showMedia(root, id) {
    var btn = root.querySelector('.thumbs button[data-media-id="' + id + '"]');
    if (btn) swapStage(root, btn);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.thumbs button');
    if (!b) return;
    swapStage(b.closest('[data-product-root]') || document, b);
  });

  /* ---------- cantidad ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qty]');
    if (!b) return;
    var input = b.parentElement.querySelector('input');
    var n = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.qty, 10));
    input.value = n;
  });

  /* ---------- filtros de colección ---------- */
  document.addEventListener('change', function (e) {
    var form = e.target.closest('[data-autosubmit]');
    if (!form) return;
    if (e.target.type === 'number') return;
    form.submit();
  });

  /* ---------- recomendados ---------- */
  function loadRecommendations() {
    $$('[data-recommendations]').forEach(function (el) {
      if (!window.fetch || !el.dataset.url) return;
      fetch(el.dataset.url)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) el.innerHTML = fresh.innerHTML;
        })
        .catch(function () {});
    });
  }

  /* ocultar categorías que apuntan a secciones vacías (ocultas) */
  function pruneCategories() {
    $$('.cat[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id && !document.getElementById(id)) a.hidden = true;
    });
    $$('.cats').forEach(function (sec) {
      if (!$$('.cat', sec).some(function (a) { return !a.hidden; })) sec.hidden = true;
    });
  }

  function init() {
    $$('[data-product-root]').forEach(initProduct);
    pruneCategories();
    loadRecommendations();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  /* El editor de temas recarga secciones: volver a inicializar */
  document.addEventListener('shopify:section:load', function (e) {
    $$('[data-product-root]', e.target).forEach(initProduct);
  });
})();
