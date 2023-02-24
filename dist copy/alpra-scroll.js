var a;
((e) => {
  e.BOTTOM = "kodex-bottom", e.BOTTOM_INVISIBLE = "kodex-bottom-invisible", e.CHILD = "kodex-child", e.CHILDREN_WRAPPER = "kodex-children-wrapper", e.CHILD_VISIBLE = "kodex-child-visible", e.HIDDEN = "kodex-hidden", e.HAS_NAV = "kodex-nav", e.PARENT = "kodex-parent", e.TOP = "kodex-top", e.TRANSITION_1000 = "kodex-transition-1000", e.TRANSITION_300 = "kodex-transition-300", e.TRANSITION_400 = "kodex-transition-400", e.TRANSITION_500 = "kodex-transition-500", e.TRANSITION_600 = "kodex-transition-600", e.TRANSITION_700 = "kodex-transition-700", e.TRANSITION_800 = "kodex-transition-800", e.TRANSITION_900 = "kodex-transition-900", e.TRANSITION_Y = "kodex-transitionY", e.TOOLTIP_LEFT = "kodex-tooltip-left", e.NAV_VERTICAL = "kodex-nav-vertical", e.NAV_ELEMENT_WRAPPER = "kodex-nav-element-wrapper", e.LOOP = "kodex-loop";
})(a || (a = {}));
var s;
((e) => {
  e.DOWN = "down", e.LEFT = "left", e.RIGHT = "right", e.UP = "up";
})(s || (s = {}));
var R;
((e) => {
  e.A = "a", e.DIV = "DIV", e.NAV = "nav", e.SPAN = "span";
})(R || (R = {}));
var L;
((e) => {
  e.NAV = "kodexNav", e.PARENT = "kodex-parent";
})(L || (L = {}));
var O;
((e) => {
  e.KEYUP = "keyup", e.RESIZE = "resize", e.TOUCHEND = "touchend", e.TOUCHMOVE = "touchmove", e.TOUCHSTART = "touchstart", e.WHEEL = "wheel", e.HASHCHANGE = "hashchange";
})(O || (O = {}));
var m;
((e) => {
  e.ARROW_DOWN = "ArrowDown", e.ARROW_LEFT = "ArrowLeft", e.ARROW_RIGHT = "ArrowRight", e.ARROW_UP = "ArrowUp", e.SPACE = "Space", e.ENTER = "Enter";
})(m || (m = {}));
var P;
((e) => {
  e.BODY = "BODY", e.INPUT = "INPUT", e.TEXTAREA = "TEXTAREA";
})(P || (P = {}));
function fe(e, u) {
  return e.length < u ? e : `${e.slice(0, u)}...`;
}
function j() {
  let e = new Date().getTime(), u = typeof performance < "u" && performance.now && performance.now() * 1e3 || 0;
  return "xxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(d) {
    let h = Math.random() * 16;
    return e > 0 ? (h = (e + h) % 16 | 0, e = Math.floor(e / 16)) : (h = (u + h) % 16 | 0, u = Math.floor(u / 16)), (d === "x" ? h : h & 3 | 8).toString(16);
  });
}
function Te(e) {
  let u = !1;
  return e.wheelDeltaY ? e.wheelDeltaY === e.deltaY * -3 && (u = !0) : e.deltaMode === 0 && (u = !0), u;
}
function v(e) {
  return document.getElementById(e);
}
function J(e) {
  return document.querySelector(`[data-slide="${e}"]`);
}
function Ae(e) {
  console.error("Alpra-scroll exception:", { error: e });
}
function $(e, u) {
  const d = e.findIndex((p) => Number(p.dataset.index) === u);
  if (u === -1)
    return e;
  const h = e.slice(d), T = e.slice(0, d);
  return [...h, ...T];
}
function Ne(e) {
  e.scrollHeight > e.clientHeight && e.setAttribute("tabindex", "0");
}
function b(e) {
  return document.createElement(e);
}
function Q(e, u) {
  for (u(e), e = e.firstChild; e; )
    Q(e, u), e = e.NextSibling;
}
const K = (e, u = {}) => {
  let d = 500;
  const h = a.PARENT;
  let T = !1, p = window.innerHeight, y, _, F, D, U, A, G = !1, ee = 30, S = Array.from(v(L.PARENT).classList).includes(a.LOOP), I = 1;
  window.onload = () => {
    ue();
  };
  function te() {
    se();
  }
  function x(t, r, i = 1) {
    t > 0 ? (I > o.length - 1 && (I = o.length - 1), E(-p * I), I += 1) : r <= -p && (E(r + p * i), I -= 1, I < 1 && (I = 1));
    const n = Array.from(o).find((c, f) => f === I - 1);
    setTimeout(() => {
      T = !1, k(n.id), B(n.id);
    }, d);
  }
  function re(t) {
    const r = t.code, i = t.target, n = i.scrollHeight > i.clientHeight, c = [P.TEXTAREA, P.INPUT].includes(i.nodeName), f = n && i.nodeName !== P.BODY;
    if ([c, f].includes(!0))
      return;
    const H = l.getBoundingClientRect().y, N = {
      loopDown: [m.ARROW_DOWN, m.SPACE].includes(r) && S,
      loopUp: [m.ARROW_UP].includes(r) && S,
      noLoopDown: [m.ARROW_DOWN, m.SPACE].includes(r) && !S && !T,
      noLoopUp: [m.ARROW_UP].includes(r) && !S && !T
    };
    switch (!0) {
      case N.loopDown:
        g(s.DOWN);
        break;
      case N.noLoopDown:
        T = !0, x(1, H);
        break;
      case N.loopUp:
        g(s.UP);
        break;
      case N.noLoopUp:
        T = !0, x(-1, H);
        break;
      default:
        return;
    }
  }
  function ie(t) {
    p = t.target.innerHeight;
  }
  function ne(t) {
    var r;
    _ = ((r = t.changedTouches) == null ? void 0 : r[0]) || _;
  }
  function oe(t) {
    const r = t.target.scrollHeight > t.target.clientHeight;
    if ([!Array.from(t.target.classList).includes(a.CHILD) && r].includes(!0))
      return;
    const n = (y == null ? void 0 : y.clientY) - (_ == null ? void 0 : _.clientY), c = l.getBoundingClientRect().y;
    if (!S && !T) {
      T = !0, x(n, c);
      return;
    }
    n > 0 ? g(s.DOWN) : n < 0 && g(s.UP);
  }
  function ae(t) {
    var r;
    y = ((r = t.changedTouches) == null ? void 0 : r[0]) || y;
  }
  function le(t) {
    G = Te(t);
    const r = t.target.scrollHeight > t.target.clientHeight;
    if (!Array.from(t.target.classList).includes(a.CHILD) && r)
      return;
    const i = l.getBoundingClientRect().y;
    if (!S && !T) {
      T = !0, x(t.deltaY, i);
      return;
    }
    if (!G && t.deltaY !== -0)
      if (t.deltaY && t.deltaY > 0) {
        if (t.deltaY < 7)
          return;
        g(s.DOWN);
      } else
        g(s.UP);
  }
  const q = [
    { target: document, trigger: O.KEYUP, method: re },
    { target: document, trigger: O.TOUCHEND, method: ne },
    { target: document, trigger: O.TOUCHMOVE, method: oe },
    { target: document, trigger: O.TOUCHSTART, method: ae },
    { target: document, trigger: O.WHEEL, method: le },
    { target: window, trigger: O.HASHCHANGE, method: te },
    { target: window, trigger: O.RESIZE, method: ie }
  ];
  q.forEach((t) => {
    t.target.addEventListener(t.trigger, t.method);
  }), window.onunload = function() {
    q.forEach((t) => {
      t.target.removeEventListener(t.trigger, t.method);
    });
  };
  const l = v(e);
  if (!l)
    return Ae("parent name not found: " + e);
  switch (!0) {
    case Array.from(l.classList).includes(a.TRANSITION_300):
      A = a.TRANSITION_300, d = 300;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_400):
      A = a.TRANSITION_400, d = 400;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_500):
      A = a.TRANSITION_500, d = 500;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_600):
      A = a.TRANSITION_600, d = 600;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_700):
      A = a.TRANSITION_700, d = 700;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_800):
      A = a.TRANSITION_800, d = 800;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_900):
      A = a.TRANSITION_900, d = 900;
      break;
    case Array.from(l.classList).includes(a.TRANSITION_1000):
      A = a.TRANSITION_1000, d = 1e3;
      break;
    default:
      A = a.TRANSITION_500;
      break;
  }
  l.classList.add(h);
  let o = l.children;
  for (let t = 0; t < o.length; t += 1) {
    const r = j(), i = o[t];
    i.classList.add(a.CHILD), i.dataset.slide = r, i.setAttribute("id", i.id || `slide-v-${t}`), i.dataset.index = `${t}`, Array.from(i.children).forEach((n) => Q(n, Ne));
  }
  function ce() {
    if (document.querySelectorAll(`#${L.NAV}`).length) {
      const r = v(L.NAV);
      document.body.removeChild(r);
    }
    if (Array.from(l.classList).includes(a.HAS_NAV)) {
      const r = b(R.NAV);
      r.setAttribute("id", L.NAV), r.classList.add(a.NAV_VERTICAL), Array.from(o).forEach((i, n) => {
        var C;
        const c = b(R.DIV);
        c.classList.add(a.NAV_ELEMENT_WRAPPER);
        const f = b(R.A);
        f.setAttribute("tabindex", "1"), f.dataset.index = i.dataset.index, f.addEventListener("click", () => W(n)), f.addEventListener("keyup", (w) => {
          [m.SPACE, m.ENTER].includes(w.key) && W(n);
        });
        const H = b(R.SPAN);
        H.innerHTML = "●", f.appendChild(H);
        const N = b(R.DIV);
        N.classList.add(a.TOOLTIP_LEFT), N.dataset.index = `${n}`;
        const M = (C = Array.from(o).find((w) => Number(w.dataset.index) === n)) == null ? void 0 : C.querySelectorAll("h1,h2,h3,h4")[0];
        M ? (N.setAttribute("style", `font-family:${getComputedStyle(M).fontFamily.split(",")[0]}`), N.innerHTML = fe(M.textContent, ee)) : (N.setAttribute("style", "font-family:Helvetica"), N.innerHTML = `${n}`), N.addEventListener("click", () => W(n)), [N, f].forEach((w) => c.appendChild(w)), r.appendChild(c);
      }), document.body.appendChild(r);
    }
  }
  function V() {
    var r, i;
    const t = window == null ? void 0 : window.location;
    return t != null && t.hash ? t == null ? void 0 : t.hash : ((r = o == null ? void 0 : o[0]) == null ? void 0 : r.id) || ((i = o == null ? void 0 : o[1]) == null ? void 0 : i.id);
  }
  function X(t, r) {
    var n;
    const i = (n = J(t)) == null ? void 0 : n.cloneNode(!0);
    i.dataset.slide = j(), r === s.DOWN ? l.appendChild(i) : r === s.UP && l.prepend(i);
  }
  function z(t) {
    T && (clearTimeout(F), F = setTimeout(() => {
      l.removeChild(J(t)), T = !1;
    }, d));
  }
  function Z(t, r, i) {
    i === s.DOWN ? (l.classList.add(A), E(-p), clearTimeout(D), D = setTimeout(() => l.classList.remove(A), d - d * 0.1), clearTimeout(U), U = setTimeout(() => E(0), d), z(t), B(r)) : i === s.UP && (l.classList.remove(A), E(-p), clearTimeout(D), D = setTimeout(() => l.classList.add(A), 50), clearTimeout(U), U = setTimeout(() => E(0), 50), z(t), B(r));
    const n = Array.from(o).find((c) => c.dataset.slide === r);
    [s.DOWN, s.UP].includes(i) && setTimeout(() => k(n.id), 600);
  }
  function E(t) {
    l.style.transform = `translateY(${t}px)`;
  }
  function g(t) {
    if (T)
      return;
    const r = V().replace("#slide-v-", "");
    Y(+r), T = !0;
    let i = o[0].dataset.slide, n = o[1].dataset.slide, c = o[o.length - 1].dataset.slide;
    t === s.DOWN ? (X(i, t), Z(i, n, t)) : t === s.UP && (X(c, t), Z(c, c, t));
  }
  function de() {
    o = $(Array.from(o), 0);
  }
  function W(t) {
    const r = Array.from(o).find((c) => Number(c.dataset.index) === t), i = Number(V().replace("#slide-v-", "")) || 0, n = l.getBoundingClientRect().y;
    if (!S) {
      const c = Math.abs(t - i);
      if (I = i + 1, Number(r.id.replace("slide-v-", "")) > i)
        for (let f = 0; f < c; f += 1)
          x(1, n);
      else
        for (let f = 0; f < c; f += 1)
          x(-1, n, c);
      return;
    }
    if (t === i + 1) {
      g(s.DOWN);
      return;
    }
    if (t === i - 1) {
      g(s.UP);
      return;
    }
    de(), r == null || r.scrollIntoView({ behavior: "smooth" }), setTimeout(() => {
      location.hash = r.id, k(r.id), Y(t);
    }, d);
  }
  function Y(t) {
    o = $(Array.from(o), t), l.innerHTML = "", o.forEach((r) => l.appendChild(r));
  }
  function k(t) {
    const r = v(L.NAV);
    location.hash = t;
    const i = Array.from(o).find((n) => n.id === t);
    r && Array.from(r.getElementsByTagName(R.A)).map((n) => {
      n.dataset.currentSlide = n.dataset.index === (i == null ? void 0 : i.dataset.index);
    });
  }
  function se() {
    let t = V().replace("#", "");
    k(t);
  }
  function B(t) {
    const r = location.href;
    location.href = `#${t}`, history.replaceState(null, "", r);
  }
  function ue() {
    var i;
    ce();
    let t = V().replace("#", "");
    const r = (i = Array.from(o).find((n) => n.id === t)) == null ? void 0 : i.dataset.index;
    S ? (o = $(Array.from(o), +r), Y(+r), k(t)) : (E(-p * Number(r)), k(t), I = +r + 1);
  }
};
typeof window < "u" && (window.mainFunc = K);
K("kodex-parent", {
  sectionClass: "kodex-child"
});
