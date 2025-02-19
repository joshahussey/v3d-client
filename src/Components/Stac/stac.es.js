import { createComponent as c, delegateEvents as ie, use as ee, insert as u, memo as V, effect as O, setAttribute as D, template as h, addEventListener as Y, className as ne, mergeProps as re } from "solid-js/web";
import { createContext as ge, createSignal as _, useContext as he, createResource as te, createEffect as E, Suspense as ae, For as Q, Show as I, splitProps as _e, mergeProps as pe, on as G, createMemo as Ce, Switch as Se, Match as ue } from "solid-js";
const ve = ge(void 0);
function ye() {
  const [n, e] = _([]), [t, r] = _(null);
  return {
    collections: n,
    setCollections: e,
    setCallback: r,
    callback: t
  };
}
const xe = (n) => {
  const {
    collections: e,
    setCollections: t,
    callback: r,
    setCallback: l
  } = ye(), {
    bboxSignal: o,
    intersectsSignal: d,
    datetimeSignal: s
  } = n, [i, g] = o, [f, p] = d, [m, v] = s;
  return c(ve.Provider, {
    value: {
      collections: e,
      setCollections: t,
      callback: r,
      setCallback: l,
      bbox: i,
      setBbox: g,
      intersects: f,
      setIntersects: p,
      datetime: m,
      setDatetime: v
    },
    get children() {
      return n.children;
    }
  });
}, le = () => {
  const n = he(ve);
  if (!n)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return n;
};
async function ke(n) {
  return (await (await fetch(n + "/")).json()).id;
}
async function Pe(n) {
  const { setCollections: e } = le(), o = (await (await fetch(n + "/collections")).json()).collections;
  return e(o), o;
}
async function we(n) {
  return (await (await fetch(n)).json()).features;
}
var Ie = /* @__PURE__ */ h("<nav class=StacScroll>"), Te = /* @__PURE__ */ h("<p>Getting STAC Response"), Oe = /* @__PURE__ */ h("<div class=StacCollectionCard><h2></h2><p>"), Ve = /* @__PURE__ */ h("<nav class=collectionPageScroll>"), De = /* @__PURE__ */ h("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class>Back</span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), Ae = /* @__PURE__ */ h("<p>Getting Items"), Re = /* @__PURE__ */ h("<div class=StacItems>");
function Le(n) {
  const {
    url: e
  } = n, [t, r] = _(!1), [l, o] = _(null), [d] = te(() => e, Pe);
  let s, i;
  return E(() => {
    t() && s && i ? (s.classList.remove("collectionPage-hidden"), s.classList.add("collectionPage"), s.style.top = `${i.getBoundingClientRect().top}px`, s.focus()) : s && i && (s.classList.remove("collectionPage"), s.classList.add("collectionPage-hidden"), s.style.top = `${i.getBoundingClientRect().top}px`, s.focus());
  }), [c(ae, {
    get fallback() {
      return Te();
    },
    get children() {
      var g = Ie(), f = i;
      return typeof f == "function" ? ee(f, g) : i = g, u(g, c(Q, {
        get each() {
          return d();
        },
        children: (p) => c(Ne, {
          collection: p,
          setIsCollectionPage: r,
          setCollectionPage: o
        })
      })), g;
    }
  }), c(I, {
    get when() {
      return t();
    },
    get children() {
      return c(Fe, {
        ref(g) {
          var f = s;
          typeof f == "function" ? f(g) : s = g;
        },
        get collection() {
          return l();
        },
        setCollectionPage: o,
        setIsCollectionPage: r
      });
    }
  })];
}
function Ne(n) {
  const {
    collection: e,
    setIsCollectionPage: t,
    setCollectionPage: r
  } = n;
  function l() {
    r(e), t(!0);
  }
  return (() => {
    var o = Oe(), d = o.firstChild, s = d.nextSibling;
    return d.$$click = l, u(d, () => e.title), u(s, () => `ID: ${e.id}`), o;
  })();
}
function Fe(n) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: r,
    ref: l
  } = n;
  return (() => {
    var o = De(), d = o.firstChild, s = d.firstChild, i = s.firstChild, g = i.nextSibling, f = g.nextSibling, p = s.nextSibling, m = p.nextSibling, v = m.nextSibling, b = v.firstChild;
    b.firstChild;
    var P = b.nextSibling, y = P.nextSibling;
    return ee(l, o), i.$$click = () => {
      t(null), r(!1);
    }, u(f, () => `ID: ${e ? e.id : ""}`), u(p, () => e ? e.title : ""), u(m, () => e ? e.description : ""), u(b, () => `Keywords: ${e ? e.keywords?.join(", ") : ""}`, null), u(y, () => `License: ${e && e.license}`), u(o, c(ae, {
      get fallback() {
        return Ae();
      },
      get children() {
        var x = Ve();
        return u(x, (() => {
          var C = V(() => !!e?.links.find((k) => k.rel === "items"));
          return () => C() ? c(Ee, {
            get url() {
              return e.links.find((k) => k.rel === "items").href;
            }
          }) : null;
        })()), x;
      }
    }), null), O((x) => {
      var C = e ? e.keywords?.join(", ") : "", k = e ? e.license : "";
      return C !== x.e && D(b, "title", x.e = C), k !== x.t && D(y, "title", x.t = k), x;
    }, {
      e: void 0,
      t: void 0
    }), o;
  })();
}
function Ee(n) {
  const {
    url: e
  } = n, [t] = te(() => e, we);
  return (() => {
    var r = Re();
    return u(r, c(Q, {
      get each() {
        return t();
      },
      children: (l) => c(me, {
        feature: l
      })
    })), r;
  })();
}
ie(["click"]);
var Be = /* @__PURE__ */ h("<mark>"), Me = /* @__PURE__ */ h("<div>"), je = /* @__PURE__ */ h("<div class=solid-select-control>"), He = /* @__PURE__ */ h("<div class=solid-select-placeholder>"), ze = /* @__PURE__ */ h("<div class=solid-select-single-value>"), Ge = /* @__PURE__ */ h("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), qe = /* @__PURE__ */ h("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), Ke = /* @__PURE__ */ h("<div class=solid-select-list>"), de = /* @__PURE__ */ h("<div class=solid-select-list-placeholder>"), Ue = /* @__PURE__ */ h("<div class=solid-select-option>"), We = (n) => {
  const e = pe({
    multiple: !1,
    disabled: !1,
    optionToValue: (a) => a,
    isOptionDisabled: (a) => !1
  }, n), t = (a) => {
    if (e.multiple && Array.isArray(a))
      return a;
    if (!e.multiple && !Array.isArray(a))
      return a !== null ? [a] : [];
    throw new Error(`Incompatible value type for ${e.multiple ? "multple" : "single"} select.`);
  }, [r, l] = _(e.initialValue !== void 0 ? t(e.initialValue) : []), o = () => e.multiple ? r() : r()[0] || null, d = (a) => l(t(a)), s = () => l([]), i = () => !!(e.multiple ? o().length : o());
  E(G(r, () => e.onChange?.(o()), {
    defer: !0
  }));
  const [g, f] = _(""), p = () => f(""), m = () => !!g().length;
  E(G(g, (a) => e.onInput?.(a), {
    defer: !0
  })), E(G(g, (a) => {
    a && !C() && k(!0);
  }, {
    defer: !0
  }));
  const v = typeof e.options == "function" ? Ce(() => e.options(g()), e.options(g())) : () => e.options, b = () => v().length, P = (a) => {
    if (e.isOptionDisabled(a)) return;
    const $ = e.optionToValue(a);
    e.multiple ? d([...r(), $]) : (d($), x(!1)), k(!1);
  }, [y, x] = _(!1), [C, k] = _(!1), q = () => k(!C()), [L, R] = _(-1), A = () => v()[L()], W = (a) => a === A(), w = (a) => {
    b() || R(-1);
    const $ = b() - 1, T = a === "next" ? 1 : -1;
    let z = L() + T;
    z > $ && (z = 0), z < 0 && (z = $), R(z);
  }, S = () => w("previous"), N = () => w("next");
  E(G(v, (a) => {
    C() && R(Math.min(0, a.length - 1));
  }, {
    defer: !0
  })), E(G(() => e.disabled, (a) => {
    a && C() && k(!1);
  })), E(G(C, (a) => {
    a ? (L() === -1 && N(), x(!0)) : (L() > -1 && R(-1), f(""));
  }, {
    defer: !0
  })), E(G(L, (a) => {
    a > -1 && !C() && k(!0);
  }, {
    defer: !0
  }));
  const B = () => x(!0), j = () => {
    x(!1), k(!1);
  }, H = (a) => a.preventDefault(), K = (a) => {
    !e.disabled && !m() && q();
  }, F = (a) => {
    f(a.target.value);
  }, U = (a) => {
    switch (a.key) {
      case "ArrowDown":
        N();
        break;
      case "ArrowUp":
        S();
        break;
      case "Enter":
        if (C() && A()) {
          P(A());
          break;
        }
        return;
      case "Escape":
        if (C()) {
          k(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (g())
          return;
        if (e.multiple) {
          const $ = o();
          d([...$.slice(0, -1)]);
        } else
          s();
        break;
      case " ":
        if (g())
          return;
        C() ? A() && P(A()) : k(!0);
        break;
      case "Tab":
        if (A() && C()) {
          P(A());
          break;
        }
        return;
      default:
        return;
    }
    a.preventDefault(), a.stopPropagation();
  };
  return {
    options: v,
    value: o,
    setValue: d,
    hasValue: i,
    clearValue: s,
    inputValue: g,
    setInputValue: f,
    hasInputValue: m,
    clearInputValue: p,
    isOpen: C,
    setIsOpen: k,
    toggleOpen: q,
    isActive: y,
    setIsActive: x,
    get multiple() {
      return e.multiple;
    },
    get disabled() {
      return e.disabled;
    },
    pickOption: P,
    isOptionFocused: W,
    isOptionDisabled: e.isOptionDisabled,
    onFocusIn: B,
    onFocusOut: j,
    onMouseDown: H,
    onClick: K,
    onInput: F,
    onKeyDown: U
  };
}, J = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, Je = (n, e) => {
  let t = J.NO_MATCH, r = [];
  if (n.length <= e.length) {
    const l = Array.from(n.toLocaleLowerCase()), o = Array.from(e.toLocaleLowerCase());
    let d = J.START;
    e: for (let s = 0, i = 0; s < l.length; s++) {
      for (; i < o.length; )
        if (o[i] === l[s]) {
          r[i] = !0, d === J.MATCH && o[i - 1] === " " && o[i] !== " " && (d = J.WORD_START), t += d, d++, i++;
          continue e;
        } else
          d = J.MATCH, i++;
      t = J.NO_MATCH, r.length = 0;
    }
  }
  return {
    target: e,
    score: t,
    matches: r
  };
}, Qe = (n, e = (t) => (() => {
  var r = Be();
  return u(r, t), r;
})()) => {
  const t = n.target, r = n.matches, l = "\0", o = [];
  let d = !1;
  for (let s = 0; s < t.length; s++) {
    const i = t[s], g = r[s];
    !d && g ? (o.push(l), d = !0) : d && !g && (o.push(l), d = !1), o.push(i);
  }
  return d && (o.push(l), d = !1), V(() => o.join("").split(l).map((s, i) => i % 2 ? e(s) : s));
}, Xe = (n, e, t) => {
  const r = [];
  for (let l = 0; l < e.length; l++) {
    const o = e[l], d = o[t], s = Je(n, d);
    s.score && r.push({
      ...s,
      item: o,
      index: l
    });
  }
  return r.sort((l, o) => {
    let d = o.score - l.score;
    return d === 0 && (d = l.index - o.index), d;
  }), r;
}, Ye = (n, e, t) => e === "label" ? [V(() => t.prefix), V(() => t.highlight ?? n)] : n, oe = (n, e) => {
  const t = Object.assign({
    extractText: (i) => i.toString ? i.toString() : i,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const r = (i) => t.key ? i[t.key] : i, l = (i) => t.extractText(r(i)), o = (i, g, f) => {
    const p = r(i);
    return t.format ? t.format(p, g, f) : Ye(p, g, f);
  }, d = (i) => t.disable(r(i));
  return {
    options: (i) => {
      let f = (typeof n == "function" ? n(i) : n).map((p) => ({
        value: p,
        label: o(p, "label", {}),
        text: l(p),
        disabled: d(p)
      }));
      if (t.filterable && i && (typeof t.filterable == "function" ? f = t.filterable(i, f) : f = Xe(i, f, "text").map((p) => ({
        ...p.item,
        label: o(p.item.value, "label", {
          highlight: Qe(p)
        })
      }))), t.createable !== void 0) {
        const p = i.trim(), m = f.some((v) => Ze(i, v.text));
        if (p) {
          let v;
          if (typeof t.createable == "function" ? t.createable.length === 1 && m || (v = t.createable(p, m, f)) : m || (v = t.key ? {
            [t.key]: p
          } : p), v !== void 0) {
            const b = Array.isArray(v) ? v : [v], P = [];
            for (const y of b)
              P.push({
                value: y,
                label: o(y, "label", {
                  prefix: "Create "
                }),
                text: l(y),
                disabled: !1
              });
            f = [...f, ...P];
          }
        }
      }
      return f;
    },
    optionToValue: (i) => i.value,
    isOptionDisabled: (i) => i.disabled,
    format: (i, g) => g === "option" ? i.label : o(i, "value", {})
  };
}, Ze = (n, e) => n.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, $e = ge(), X = () => {
  const n = he($e);
  if (!n) throw new Error("No SelectContext found in ancestry.");
  return n;
}, Z = (n) => {
  const [e, t] = _e(pe({
    format: (l, o) => l,
    placeholder: "Select...",
    readonly: typeof n.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, n), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), r = We(e);
  return E(G(() => t.initialValue, (l) => l !== void 0 && r.setValue(l))), c($e.Provider, {
    value: r,
    get children() {
      return c(et, {
        get class() {
          return t.class;
        },
        get children() {
          return [c(tt, {
            get id() {
              return t.id;
            },
            get name() {
              return t.name;
            },
            get format() {
              return t.format;
            },
            get placeholder() {
              return t.placeholder;
            },
            get autofocus() {
              return t.autofocus;
            },
            get readonly() {
              return t.readonly;
            },
            ref(l) {
              var o = n.ref;
              typeof o == "function" ? o(l) : n.ref = l;
            }
          }), c(it, {
            get loading() {
              return t.loading;
            },
            get loadingPlaceholder() {
              return t.loadingPlaceholder;
            },
            get emptyPlaceholder() {
              return t.emptyPlaceholder;
            },
            get format() {
              return t.format;
            }
          })];
        }
      });
    }
  });
}, et = (n) => {
  const e = X();
  return (() => {
    var t = Me();
    return t.$$mousedown = (r) => {
      e.onMouseDown(r), r.currentTarget.getElementsByTagName("input")[0].focus();
    }, Y(t, "focusout", e.onFocusOut, !0), Y(t, "focusin", e.onFocusIn, !0), u(t, () => n.children), O((r) => {
      var l = `solid-select-container ${n.class !== void 0 ? n.class : ""}`, o = e.disabled;
      return l !== r.e && ne(t, r.e = l), o !== r.t && D(t, "data-disabled", r.t = o), r;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, tt = (n) => {
  const e = X(), t = (r) => {
    const l = e.value();
    e.setValue([...l.slice(0, r), ...l.slice(r + 1)]);
  };
  return (() => {
    var r = je();
    return Y(r, "click", e.onClick, !0), u(r, c(I, {
      get when() {
        return V(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return c(lt, {
          get children() {
            return n.placeholder;
          }
        });
      }
    }), null), u(r, c(I, {
      get when() {
        return V(() => !!(e.hasValue() && !e.multiple))() && !e.hasInputValue();
      },
      get children() {
        return c(nt, {
          get children() {
            return n.format(e.value(), "value");
          }
        });
      }
    }), null), u(r, c(I, {
      get when() {
        return e.hasValue() && e.multiple;
      },
      get children() {
        return c(Q, {
          get each() {
            return e.value();
          },
          children: (l, o) => c(rt, {
            onRemove: () => t(o()),
            get children() {
              return n.format(l, "value");
            }
          })
        });
      }
    }), null), u(r, c(ot, {
      get id() {
        return n.id;
      },
      get name() {
        return n.name;
      },
      get autofocus() {
        return n.autofocus;
      },
      get readonly() {
        return n.readonly;
      },
      ref(l) {
        var o = n.ref;
        typeof o == "function" ? o(l) : n.ref = l;
      }
    }), null), O((l) => {
      var o = e.multiple, d = e.hasValue(), s = e.disabled;
      return o !== l.e && D(r, "data-multiple", l.e = o), d !== l.t && D(r, "data-has-value", l.t = d), s !== l.a && D(r, "data-disabled", l.a = s), l;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
}, lt = (n) => (() => {
  var e = He();
  return u(e, () => n.children), e;
})(), nt = (n) => (() => {
  var e = ze();
  return u(e, () => n.children), e;
})(), rt = (n) => (X(), (() => {
  var e = Ge(), t = e.firstChild, r = t.nextSibling;
  return u(t, () => n.children), r.$$click = (l) => {
    l.stopPropagation(), n.onRemove();
  }, e;
})()), ot = (n) => {
  const e = X();
  return (() => {
    var t = qe();
    t.$$mousedown = (l) => {
      l.stopPropagation();
    }, t.$$keydown = (l) => {
      e.onKeyDown(l), l.defaultPrevented || l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), l.target.blur());
    }, Y(t, "input", e.onInput, !0);
    var r = n.ref;
    return typeof r == "function" ? ee(r, t) : n.ref = t, O((l) => {
      var o = n.id, d = n.name, s = e.multiple, i = e.isActive(), g = n.autofocus, f = n.readonly, p = e.disabled;
      return o !== l.e && D(t, "id", l.e = o), d !== l.t && D(t, "name", l.t = d), s !== l.a && D(t, "data-multiple", l.a = s), i !== l.o && D(t, "data-is-active", l.o = i), g !== l.i && (t.autofocus = l.i = g), f !== l.n && (t.readOnly = l.n = f), p !== l.s && (t.disabled = l.s = p), l;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0
    }), O(() => t.value = e.inputValue()), t;
  })();
}, it = (n) => {
  const e = X();
  return c(I, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = Ke();
      return u(t, c(I, {
        get when() {
          return !n.loading;
        },
        get fallback() {
          return (() => {
            var r = de();
            return u(r, () => n.loadingPlaceholder), r;
          })();
        },
        get children() {
          return c(Q, {
            get each() {
              return e.options();
            },
            get fallback() {
              return (() => {
                var r = de();
                return u(r, () => n.emptyPlaceholder), r;
              })();
            },
            children: (r) => c(at, {
              option: r,
              get children() {
                return n.format(r, "option");
              }
            })
          });
        }
      })), t;
    }
  });
}, at = (n) => {
  const e = X(), t = (r) => {
    E(() => {
      e.isOptionFocused(n.option) && r.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var r = Ue();
    return r.$$click = () => e.pickOption(n.option), ee(t, r), u(r, () => n.children), O((l) => {
      var o = e.isOptionDisabled(n.option), d = e.isOptionFocused(n.option);
      return o !== l.e && D(r, "data-disabled", l.e = o), d !== l.t && D(r, "data-focused", l.t = d), l;
    }, {
      e: void 0,
      t: void 0
    }), r;
  })();
};
ie(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var st = /* @__PURE__ */ h("<h1>"), ct = /* @__PURE__ */ h("<button>Search"), ut = /* @__PURE__ */ h("<button>Collections"), dt = /* @__PURE__ */ h("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), ft = /* @__PURE__ */ h("<p>Getting STAC Catalog"), gt = /* @__PURE__ */ h('<div class=StacSearchFilters><input placeholder="Bbox: minx, miny, maxx, maxy"><input type=datetime-local placeholder=Datetime><button>Search</button><button>Clear'), ht = /* @__PURE__ */ h("<p>Searching"), pt = /* @__PURE__ */ h("<p class=StacErrorText>ERROR SEARCHING STAC"), vt = /* @__PURE__ */ h("<div class=StacSearchResults>"), $t = /* @__PURE__ */ h("<button>Previous Page"), mt = /* @__PURE__ */ h("<span>Returned: "), bt = /* @__PURE__ */ h("<span>Limit: "), _t = /* @__PURE__ */ h("<span>Matched: "), Ct = /* @__PURE__ */ h("<button>Next Page"), St = /* @__PURE__ */ h("<div class=StacSearchPagingButtons>"), yt = /* @__PURE__ */ h("<div class=StacFeatureCollection>"), fe = /* @__PURE__ */ h("<p>"), xt = /* @__PURE__ */ h("<div class=StacFeature><div><p></p><p></p><span><button>Select"), kt = /* @__PURE__ */ h("<img class=stacFeatureThumbnail crossorigin=anonymous>"), Pt = /* @__PURE__ */ h("<p>No Thumbnail"), wt = /* @__PURE__ */ h("<div><label>Latitude:<input type=text></label><label>Longitude:<input type=text>"), It = /* @__PURE__ */ h("<div><button>Add Vertex"), Tt = /* @__PURE__ */ h("<div class=dialog-backdrop><div class=dialog-content><h2>Intersects</h2><div><label><input type=radio value=none>None</label><label><input type=radio value=point>Point</label><label><input type=radio value=polygon>Polygon</label></div><div><button>Cancel</button><button>Save"), Ot = /* @__PURE__ */ h("<p>Select a geometry type above."), Vt = /* @__PURE__ */ h("<div><label>Lat:<input type=text></label><label>Lon:<input type=text>"), Dt = /* @__PURE__ */ h("<button>Intersects…"), At = /* @__PURE__ */ h("<p>Current intersects: ");
function Rt(n) {
  const {
    url: e,
    selectCallback: t
  } = n, [r] = te(() => e, ke), {
    setCallback: l
  } = le();
  l(() => t);
  const [o, d] = _("collections");
  return (() => {
    var s = dt(), i = s.firstChild, g = i.firstChild;
    return u(i, c(ae, {
      get fallback() {
        return ft();
      },
      get children() {
        var f = st();
        return u(f, r), f;
      }
    }), g), u(g, c(I, {
      get when() {
        return o() === "collections";
      },
      get children() {
        var f = ct();
        return f.$$click = () => d("search"), f;
      }
    }), null), u(g, c(I, {
      get when() {
        return o() === "search";
      },
      get children() {
        var f = ut();
        return f.$$click = () => d("collections"), f;
      }
    }), null), u(s, c(I, {
      get when() {
        return o() === "search";
      },
      get children() {
        return c(Lt, {
          url: e
        });
      }
    }), null), u(s, c(I, {
      get when() {
        return o() === "collections";
      },
      get children() {
        return c(Le, {
          url: e
        });
      }
    }), null), s;
  })();
}
function Lt(n) {
  const {
    url: e
  } = n, t = `${e}/search`, [r, l] = _("", {
    equals: !1
  }), {
    collections: o,
    bbox: d,
    setBbox: s,
    intersects: i,
    setIntersects: g,
    datetime: f,
    setDatetime: p
  } = le(), m = oe(o().map((a) => a.id)), v = oe([], {
    createable: !0
  }), [b, P] = _([]), [y, x] = _([]), [C, k] = _(1e3), [q, L] = _(""), [R, A] = _(""), [W, w] = _(!1), [S, {
    refetch: N
  }] = te(r, F), [B, j] = _(""), [H, K] = _("");
  _("");
  async function F(a) {
    if (a.trim() === "") {
      w(!1);
      return;
    }
    new URL(a);
  }
  async function U(a) {
    l(a), await N();
  }
  return [(() => {
    var a = gt(), $ = a.firstChild, T = $.nextSibling, z = T.nextSibling, be = z.nextSibling;
    return u(a, c(Z, re({
      placeholder: "Select Collections. (Leave blank for all)",
      onChange: P,
      multiple: !0
    }, m)), $), u(a, c(Z, {
      placeholder: "Select Limit",
      onChange: k,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), $), u(a, c(Z, re({
      placeholder: "Add Item Ids",
      onChange: x,
      multiple: !0
    }, v)), $), $.$$input = (M) => s(M.currentTarget.value), u(a, c(Bt, {}), T), T.$$input = (M) => {
      p(M.currentTarget.value);
    }, z.$$click = () => {
      l(t), N(t);
    }, be.$$click = () => {
      A(""), L(""), w(!1), l("");
    }, O((M) => {
      var se = `StacBboxInput ${H()}`, ce = `StacDatetimeInput ${B()}`;
      return se !== M.e && ne($, M.e = se), ce !== M.t && ne(T, M.t = ce), M;
    }, {
      e: void 0,
      t: void 0
    }), O(() => $.value = d() ? d() : ""), O(() => T.value = f() ? f() : ""), a;
  })(), (() => {
    var a = vt();
    return u(a, c(I, {
      get when() {
        return S.loading;
      },
      get children() {
        return ht();
      }
    }), null), u(a, c(I, {
      get when() {
        return S.error;
      },
      get children() {
        return pt();
      }
    }), null), u(a, c(I, {
      get when() {
        return V(() => !!(W() && !S.loading && !S.error))() && S();
      },
      get children() {
        return c(Nt, {
          get searchResults() {
            return S();
          }
        });
      }
    }), null), a;
  })(), (() => {
    var a = St();
    return u(a, c(I, {
      get when() {
        return q().trim().length > 0;
      },
      get children() {
        var $ = $t();
        return $.$$click = () => {
          U(q());
        }, $;
      }
    }), null), u(a, c(I, {
      get when() {
        return V(() => !!(W() && !S.loading && !S.error))() && S();
      },
      get children() {
        return [(() => {
          var $ = mt();
          return $.firstChild, u($, (() => {
            var T = V(() => !!S().context);
            return () => T() ? S().context.returned : "Not Listed";
          })(), null), $;
        })(), (() => {
          var $ = bt();
          return $.firstChild, u($, (() => {
            var T = V(() => !!S().context);
            return () => T() ? S().context.limit : "Not Listed";
          })(), null), $;
        })(), (() => {
          var $ = _t();
          return $.firstChild, u($, (() => {
            var T = V(() => !!S().context);
            return () => T() ? S().context.matched : "Not Listed";
          })(), null), $;
        })()];
      }
    }), null), u(a, c(I, {
      get when() {
        return R().trim().length > 0;
      },
      get children() {
        var $ = Ct();
        return $.$$click = () => {
          U(R());
        }, $;
      }
    }), null), a;
  })()];
}
function Nt(n) {
  const {
    searchResults: e
  } = n;
  return c(Ft, {
    featureCollection: e
  });
}
function Ft(n) {
  const {
    featureCollection: e
  } = n;
  return (() => {
    var t = yt();
    return u(t, c(Q, {
      get each() {
        return e.features;
      },
      children: (r) => c(me, {
        feature: r
      })
    })), t;
  })();
}
function me(n) {
  const {
    feature: e
  } = n, {
    callback: t
  } = le();
  function r(i) {
    t()(l());
  }
  const [l, o] = _(""), d = Object.entries(e.assets).map(([i, g]) => ({
    name: i,
    value: g
  })).filter((i) => i.name !== "thumbnail"), s = oe(d, {
    key: "name"
  });
  return (() => {
    var i = xt(), g = i.firstChild, f = g.firstChild, p = f.nextSibling, m = p.nextSibling, v = m.firstChild;
    return u(i, (() => {
      var b = V(() => !!e.assets.thumbnail?.href);
      return () => b() ? (() => {
        var P = kt();
        return O((y) => {
          var x = e.assets.thumbnail.href, C = e.assets.thumbnail.title ? e.assets.thumbnail.title : "Thumbnail";
          return x !== y.e && D(P, "src", y.e = x), C !== y.t && D(P, "alt", y.t = C), y;
        }, {
          e: void 0,
          t: void 0
        }), P;
      })() : Pt();
    })(), g), g.style.setProperty("padding", "0.5rem"), u(f, () => "ID: " + e.id), u(p, () => "Bounding Box: " + e.bbox.join(", ")), u(g, c(I, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var b = fe();
        return u(b, () => e.properties.datetime ? "Date/Time: " + e.properties.datetime : ""), b;
      }
    }), m), u(g, c(I, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var b = fe();
        return u(b, () => e.properties.created ? "Creation Date: " + e.properties.created : ""), b;
      }
    }), m), u(m, c(Z, re(s, {
      placeholder: "Select Asset",
      onChange: (b) => {
        o(b.value);
      }
    })), v), v.$$click = r, i;
  })();
}
function Et(n) {
  const [e, t] = _("none"), [r, l] = _(""), [o, d] = _(""), [s, i] = _([{
    lat: "",
    lon: ""
  }]);
  function g() {
    i([...s(), {
      lat: "",
      lon: ""
    }]);
  }
  function f(m, v, b) {
    i((P) => {
      const y = [...P];
      return y[m] = {
        ...y[m],
        [v]: b
      }, y;
    });
  }
  function p() {
    let m = null;
    if (e() === "point") {
      const v = parseFloat(r()), b = parseFloat(o());
      !isNaN(v) && !isNaN(b) && (m = {
        type: "Point",
        coordinates: [b, v]
        // [lon, lat] per GeoJSON spec
      });
    } else if (e() === "polygon") {
      const v = s().map((b) => [parseFloat(b.lon), parseFloat(b.lat)]);
      v.length >= 3 && (v.push(v[0]), m = {
        type: "Polygon",
        coordinates: [v]
      });
    }
    n.onSave(m ? JSON.stringify(m) : null);
  }
  return (() => {
    var m = Tt(), v = m.firstChild, b = v.firstChild, P = b.nextSibling, y = P.firstChild, x = y.firstChild, C = y.nextSibling, k = C.firstChild, q = C.nextSibling, L = q.firstChild, R = P.nextSibling, A = R.firstChild, W = A.nextSibling;
    return x.$$input = (w) => t(w.currentTarget.value), k.$$input = (w) => t(w.currentTarget.value), L.$$input = (w) => t(w.currentTarget.value), u(v, c(Se, {
      get fallback() {
        return Ot();
      },
      get children() {
        return [c(ue, {
          get when() {
            return e() === "point";
          },
          get children() {
            var w = wt(), S = w.firstChild, N = S.firstChild, B = N.nextSibling, j = S.nextSibling, H = j.firstChild, K = H.nextSibling;
            return B.$$input = (F) => l(F.currentTarget.value), K.$$input = (F) => d(F.currentTarget.value), O(() => B.value = r()), O(() => K.value = o()), w;
          }
        }), c(ue, {
          get when() {
            return e() === "polygon";
          },
          get children() {
            var w = It(), S = w.firstChild;
            return u(w, c(Q, {
              get each() {
                return s();
              },
              children: (N, B) => (() => {
                var j = Vt(), H = j.firstChild, K = H.firstChild, F = K.nextSibling, U = H.nextSibling, a = U.firstChild, $ = a.nextSibling;
                return j.style.setProperty("margin-bottom", "4px"), F.$$input = (T) => f(B(), "lat", T.currentTarget.value), U.style.setProperty("margin-left", "8px"), $.$$input = (T) => f(B(), "lon", T.currentTarget.value), O(() => F.value = N.lat), O(() => $.value = N.lon), j;
              })()
            }), S), S.$$click = g, w;
          }
        })];
      }
    }), R), R.style.setProperty("margin-top", "16px"), Y(A, "click", n.onClose, !0), W.$$click = p, O(() => x.checked = e() === "none"), O(() => k.checked = e() === "point"), O(() => L.checked = e() === "polygon"), m;
  })();
}
function Bt() {
  const [n, e] = _(!1), [t, r] = _(null), l = (o) => {
    r(o), e(!1);
  };
  return [(() => {
    var o = Dt();
    return o.$$click = () => e(!0), o;
  })(), V(() => V(() => !!n())() && c(Et, {
    onClose: () => e(!1),
    onSave: l
  })), (() => {
    var o = At();
    return o.firstChild, u(o, () => t() ?? "None", null), o;
  })()];
}
ie(["click", "input"]);
function Ht(n) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: r,
    intersectsSignal: l,
    datetimeSignal: o
  } = n;
  return c(xe, {
    bboxSignal: r,
    intersectsSignal: l,
    datetimeSignal: o,
    get children() {
      return c(Rt, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Ht as Stac
};
