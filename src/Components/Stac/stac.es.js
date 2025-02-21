import { createComponent as u, delegateEvents as ne, template as g, insert as c, use as Q, memo as T, effect as N, setAttribute as I, addEventListener as J, className as _e, mergeProps as ee } from "solid-js/web";
import { createContext as he, createSignal as x, useContext as ge, createResource as X, createEffect as D, Suspense as le, For as G, Show as k, splitProps as Ce, mergeProps as pe, on as E, createMemo as Se } from "solid-js";
const me = he(void 0);
function xe() {
  const [l, e] = x([]), [t, r] = x(null);
  return {
    collections: l,
    setCollections: e,
    setCallback: r,
    callback: t
  };
}
const ye = (l) => {
  const {
    collections: e,
    setCollections: t,
    callback: r,
    setCallback: n
  } = xe(), {
    bboxSignal: o,
    intersectsSignal: a,
    datetimeSignal: i
  } = l, [s, f] = o, [d, p] = a, [y, $] = i;
  return u(me.Provider, {
    value: {
      collections: e,
      setCollections: t,
      callback: r,
      setCallback: n,
      bbox: s,
      setBbox: f,
      intersects: d,
      setIntersects: p,
      datetime: y,
      setDatetime: $
    },
    get children() {
      return l.children;
    }
  });
}, Y = () => {
  const l = ge(me);
  if (!l)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return l;
};
async function ke(l) {
  return (await (await fetch(l + "/")).json()).id;
}
async function we(l) {
  const { setCollections: e } = Y(), o = (await (await fetch(l + "/collections")).json()).collections;
  return e(o), o;
}
async function Pe(l) {
  return (await (await fetch(l)).json()).features;
}
var Ie = /* @__PURE__ */ g("<nav class=StacScroll>"), Oe = /* @__PURE__ */ g("<p>Getting STAC Response"), Te = /* @__PURE__ */ g("<div class=StacCollectionCard><h2></h2><p>"), Ae = /* @__PURE__ */ g("<nav class=collectionPageScroll>"), Ve = /* @__PURE__ */ g("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class>Back</span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), Re = /* @__PURE__ */ g("<p>Getting Items"), De = /* @__PURE__ */ g("<div class=StacItems>");
function Le(l) {
  const {
    url: e
  } = l, [t, r] = x(!1), [n, o] = x(null), [a] = X(() => e, we);
  let i, s;
  return D(() => {
    t() && i && s ? (i.classList.remove("collectionPage-hidden"), i.classList.add("collectionPage"), i.style.top = `${s.getBoundingClientRect().top}px`, i.focus()) : i && s && (i.classList.remove("collectionPage"), i.classList.add("collectionPage-hidden"), i.style.top = `${s.getBoundingClientRect().top}px`, i.focus());
  }), [u(le, {
    get fallback() {
      return Oe();
    },
    get children() {
      var f = Ie(), d = s;
      return typeof d == "function" ? Q(d, f) : s = f, c(f, u(G, {
        get each() {
          return a();
        },
        children: (p) => u(Ee, {
          collection: p,
          setIsCollectionPage: r,
          setCollectionPage: o
        })
      })), f;
    }
  }), u(k, {
    get when() {
      return t();
    },
    get children() {
      return u(Fe, {
        ref(f) {
          var d = i;
          typeof d == "function" ? d(f) : i = f;
        },
        get collection() {
          return n();
        },
        setCollectionPage: o,
        setIsCollectionPage: r
      });
    }
  })];
}
function Ee(l) {
  const {
    collection: e,
    setIsCollectionPage: t,
    setCollectionPage: r
  } = l;
  function n() {
    r(e), t(!0);
  }
  return (() => {
    var o = Te(), a = o.firstChild, i = a.nextSibling;
    return a.$$click = n, c(a, () => e.title), c(i, () => `ID: ${e.id}`), o;
  })();
}
function Fe(l) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: r,
    ref: n
  } = l;
  return (() => {
    var o = Ve(), a = o.firstChild, i = a.firstChild, s = i.firstChild, f = s.nextSibling, d = f.nextSibling, p = i.nextSibling, y = p.nextSibling, $ = y.nextSibling, O = $.firstChild;
    O.firstChild;
    var _ = O.nextSibling, P = _.nextSibling;
    return Q(n, o), s.$$click = () => {
      t(null), r(!1);
    }, c(d, () => `ID: ${e ? e.id : ""}`), c(p, () => e ? e.title : ""), c(y, () => e ? e.description : ""), c(O, () => `Keywords: ${e ? e.keywords?.join(", ") : ""}`, null), c(P, () => `License: ${e && e.license}`), c(o, u(le, {
      get fallback() {
        return Re();
      },
      get children() {
        var b = Ae();
        return c(b, (() => {
          var C = T(() => !!e?.links.find((S) => S.rel === "items"));
          return () => C() ? u(Ne, {
            get url() {
              return e.links.find((S) => S.rel === "items").href;
            }
          }) : null;
        })()), b;
      }
    }), null), N((b) => {
      var C = e ? e.keywords?.join(", ") : "", S = e ? e.license : "";
      return C !== b.e && I(O, "title", b.e = C), S !== b.t && I(P, "title", b.t = S), b;
    }, {
      e: void 0,
      t: void 0
    }), o;
  })();
}
function Ne(l) {
  const {
    url: e
  } = l, [t] = X(() => e, Pe);
  return (() => {
    var r = De();
    return c(r, u(G, {
      get each() {
        return t();
      },
      children: (n) => u($e, {
        feature: n
      })
    })), r;
  })();
}
ne(["click"]);
var je = /* @__PURE__ */ g("<mark>"), Be = /* @__PURE__ */ g("<div>"), Me = /* @__PURE__ */ g("<div class=solid-select-control>"), He = /* @__PURE__ */ g("<div class=solid-select-placeholder>"), qe = /* @__PURE__ */ g("<div class=solid-select-single-value>"), ze = /* @__PURE__ */ g("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), Ge = /* @__PURE__ */ g("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), Ue = /* @__PURE__ */ g("<div class=solid-select-list>"), de = /* @__PURE__ */ g("<div class=solid-select-list-placeholder>"), Ke = /* @__PURE__ */ g("<div class=solid-select-option>"), We = (l) => {
  const e = pe({
    multiple: !1,
    disabled: !1,
    optionToValue: (h) => h,
    isOptionDisabled: (h) => !1
  }, l), t = (h) => {
    if (e.multiple && Array.isArray(h))
      return h;
    if (!e.multiple && !Array.isArray(h))
      return h !== null ? [h] : [];
    throw new Error(`Incompatible value type for ${e.multiple ? "multple" : "single"} select.`);
  }, [r, n] = x(e.initialValue !== void 0 ? t(e.initialValue) : []), o = () => e.multiple ? r() : r()[0] || null, a = (h) => n(t(h)), i = () => n([]), s = () => !!(e.multiple ? o().length : o());
  D(E(r, () => e.onChange?.(o()), {
    defer: !0
  }));
  const [f, d] = x(""), p = () => d(""), y = () => !!f().length;
  D(E(f, (h) => e.onInput?.(h), {
    defer: !0
  })), D(E(f, (h) => {
    h && !C() && S(!0);
  }, {
    defer: !0
  }));
  const $ = typeof e.options == "function" ? Se(() => e.options(f()), e.options(f())) : () => e.options, O = () => $().length, _ = (h) => {
    if (e.isOptionDisabled(h)) return;
    const R = e.optionToValue(h);
    e.multiple ? a([...r(), R]) : (a(R), b(!1)), S(!1);
  }, [P, b] = x(!1), [C, S] = x(!1), H = () => S(!C()), [L, F] = x(-1), A = () => $()[L()], U = (h) => h === A(), j = (h) => {
    O() || F(-1);
    const R = O() - 1, v = h === "next" ? 1 : -1;
    let m = L() + v;
    m > R && (m = 0), m < 0 && (m = R), F(m);
  }, w = () => j("previous"), q = () => j("next");
  D(E($, (h) => {
    C() && F(Math.min(0, h.length - 1));
  }, {
    defer: !0
  })), D(E(() => e.disabled, (h) => {
    h && C() && S(!1);
  })), D(E(C, (h) => {
    h ? (L() === -1 && q(), b(!0)) : (L() > -1 && F(-1), d(""));
  }, {
    defer: !0
  })), D(E(L, (h) => {
    h > -1 && !C() && S(!0);
  }, {
    defer: !0
  }));
  const re = () => b(!0), oe = () => {
    b(!1), S(!1);
  }, se = (h) => h.preventDefault(), K = (h) => {
    !e.disabled && !y() && H();
  }, ie = (h) => {
    d(h.target.value);
  }, ae = (h) => {
    switch (h.key) {
      case "ArrowDown":
        q();
        break;
      case "ArrowUp":
        w();
        break;
      case "Enter":
        if (C() && A()) {
          _(A());
          break;
        }
        return;
      case "Escape":
        if (C()) {
          S(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (f())
          return;
        if (e.multiple) {
          const R = o();
          a([...R.slice(0, -1)]);
        } else
          i();
        break;
      case " ":
        if (f())
          return;
        C() ? A() && _(A()) : S(!0);
        break;
      case "Tab":
        if (A() && C()) {
          _(A());
          break;
        }
        return;
      default:
        return;
    }
    h.preventDefault(), h.stopPropagation();
  };
  return {
    options: $,
    value: o,
    setValue: a,
    hasValue: s,
    clearValue: i,
    inputValue: f,
    setInputValue: d,
    hasInputValue: y,
    clearInputValue: p,
    isOpen: C,
    setIsOpen: S,
    toggleOpen: H,
    isActive: P,
    setIsActive: b,
    get multiple() {
      return e.multiple;
    },
    get disabled() {
      return e.disabled;
    },
    pickOption: _,
    isOptionFocused: U,
    isOptionDisabled: e.isOptionDisabled,
    onFocusIn: re,
    onFocusOut: oe,
    onMouseDown: se,
    onClick: K,
    onInput: ie,
    onKeyDown: ae
  };
}, B = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, Je = (l, e) => {
  let t = B.NO_MATCH, r = [];
  if (l.length <= e.length) {
    const n = Array.from(l.toLocaleLowerCase()), o = Array.from(e.toLocaleLowerCase());
    let a = B.START;
    e: for (let i = 0, s = 0; i < n.length; i++) {
      for (; s < o.length; )
        if (o[s] === n[i]) {
          r[s] = !0, a === B.MATCH && o[s - 1] === " " && o[s] !== " " && (a = B.WORD_START), t += a, a++, s++;
          continue e;
        } else
          a = B.MATCH, s++;
      t = B.NO_MATCH, r.length = 0;
    }
  }
  return {
    target: e,
    score: t,
    matches: r
  };
}, Qe = (l, e = (t) => (() => {
  var r = je();
  return c(r, t), r;
})()) => {
  const t = l.target, r = l.matches, n = "\0", o = [];
  let a = !1;
  for (let i = 0; i < t.length; i++) {
    const s = t[i], f = r[i];
    !a && f ? (o.push(n), a = !0) : a && !f && (o.push(n), a = !1), o.push(s);
  }
  return a && (o.push(n), a = !1), T(() => o.join("").split(n).map((i, s) => s % 2 ? e(i) : i));
}, Xe = (l, e, t) => {
  const r = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n], a = o[t], i = Je(l, a);
    i.score && r.push({
      ...i,
      item: o,
      index: n
    });
  }
  return r.sort((n, o) => {
    let a = o.score - n.score;
    return a === 0 && (a = n.index - o.index), a;
  }), r;
}, Ye = (l, e, t) => e === "label" ? [T(() => t.prefix), T(() => t.highlight ?? l)] : l, te = (l, e) => {
  const t = Object.assign({
    extractText: (s) => s.toString ? s.toString() : s,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const r = (s) => t.key ? s[t.key] : s, n = (s) => t.extractText(r(s)), o = (s, f, d) => {
    const p = r(s);
    return t.format ? t.format(p, f, d) : Ye(p, f, d);
  }, a = (s) => t.disable(r(s));
  return {
    options: (s) => {
      let d = (typeof l == "function" ? l(s) : l).map((p) => ({
        value: p,
        label: o(p, "label", {}),
        text: n(p),
        disabled: a(p)
      }));
      if (t.filterable && s && (typeof t.filterable == "function" ? d = t.filterable(s, d) : d = Xe(s, d, "text").map((p) => ({
        ...p.item,
        label: o(p.item.value, "label", {
          highlight: Qe(p)
        })
      }))), t.createable !== void 0) {
        const p = s.trim(), y = d.some(($) => Ze(s, $.text));
        if (p) {
          let $;
          if (typeof t.createable == "function" ? t.createable.length === 1 && y || ($ = t.createable(p, y, d)) : y || ($ = t.key ? {
            [t.key]: p
          } : p), $ !== void 0) {
            const O = Array.isArray($) ? $ : [$], _ = [];
            for (const P of O)
              _.push({
                value: P,
                label: o(P, "label", {
                  prefix: "Create "
                }),
                text: n(P),
                disabled: !1
              });
            d = [...d, ..._];
          }
        }
      }
      return d;
    },
    optionToValue: (s) => s.value,
    isOptionDisabled: (s) => s.disabled,
    format: (s, f) => f === "option" ? s.label : o(s, "value", {})
  };
}, Ze = (l, e) => l.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, ve = he(), M = () => {
  const l = ge(ve);
  if (!l) throw new Error("No SelectContext found in ancestry.");
  return l;
}, W = (l) => {
  const [e, t] = Ce(pe({
    format: (n, o) => n,
    placeholder: "Select...",
    readonly: typeof l.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, l), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), r = We(e);
  return D(E(() => t.initialValue, (n) => n !== void 0 && r.setValue(n))), u(ve.Provider, {
    value: r,
    get children() {
      return u(et, {
        get class() {
          return t.class;
        },
        get children() {
          return [u(tt, {
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
            ref(n) {
              var o = l.ref;
              typeof o == "function" ? o(n) : l.ref = n;
            }
          }), u(st, {
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
}, et = (l) => {
  const e = M();
  return (() => {
    var t = Be();
    return t.$$mousedown = (r) => {
      e.onMouseDown(r), r.currentTarget.getElementsByTagName("input")[0].focus();
    }, J(t, "focusout", e.onFocusOut, !0), J(t, "focusin", e.onFocusIn, !0), c(t, () => l.children), N((r) => {
      var n = `solid-select-container ${l.class !== void 0 ? l.class : ""}`, o = e.disabled;
      return n !== r.e && _e(t, r.e = n), o !== r.t && I(t, "data-disabled", r.t = o), r;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, tt = (l) => {
  const e = M(), t = (r) => {
    const n = e.value();
    e.setValue([...n.slice(0, r), ...n.slice(r + 1)]);
  };
  return (() => {
    var r = Me();
    return J(r, "click", e.onClick, !0), c(r, u(k, {
      get when() {
        return T(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return u(nt, {
          get children() {
            return l.placeholder;
          }
        });
      }
    }), null), c(r, u(k, {
      get when() {
        return T(() => !!(e.hasValue() && !e.multiple))() && !e.hasInputValue();
      },
      get children() {
        return u(lt, {
          get children() {
            return l.format(e.value(), "value");
          }
        });
      }
    }), null), c(r, u(k, {
      get when() {
        return e.hasValue() && e.multiple;
      },
      get children() {
        return u(G, {
          get each() {
            return e.value();
          },
          children: (n, o) => u(rt, {
            onRemove: () => t(o()),
            get children() {
              return l.format(n, "value");
            }
          })
        });
      }
    }), null), c(r, u(ot, {
      get id() {
        return l.id;
      },
      get name() {
        return l.name;
      },
      get autofocus() {
        return l.autofocus;
      },
      get readonly() {
        return l.readonly;
      },
      ref(n) {
        var o = l.ref;
        typeof o == "function" ? o(n) : l.ref = n;
      }
    }), null), N((n) => {
      var o = e.multiple, a = e.hasValue(), i = e.disabled;
      return o !== n.e && I(r, "data-multiple", n.e = o), a !== n.t && I(r, "data-has-value", n.t = a), i !== n.a && I(r, "data-disabled", n.a = i), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
}, nt = (l) => (() => {
  var e = He();
  return c(e, () => l.children), e;
})(), lt = (l) => (() => {
  var e = qe();
  return c(e, () => l.children), e;
})(), rt = (l) => (M(), (() => {
  var e = ze(), t = e.firstChild, r = t.nextSibling;
  return c(t, () => l.children), r.$$click = (n) => {
    n.stopPropagation(), l.onRemove();
  }, e;
})()), ot = (l) => {
  const e = M();
  return (() => {
    var t = Ge();
    t.$$mousedown = (n) => {
      n.stopPropagation();
    }, t.$$keydown = (n) => {
      e.onKeyDown(n), n.defaultPrevented || n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
    }, J(t, "input", e.onInput, !0);
    var r = l.ref;
    return typeof r == "function" ? Q(r, t) : l.ref = t, N((n) => {
      var o = l.id, a = l.name, i = e.multiple, s = e.isActive(), f = l.autofocus, d = l.readonly, p = e.disabled;
      return o !== n.e && I(t, "id", n.e = o), a !== n.t && I(t, "name", n.t = a), i !== n.a && I(t, "data-multiple", n.a = i), s !== n.o && I(t, "data-is-active", n.o = s), f !== n.i && (t.autofocus = n.i = f), d !== n.n && (t.readOnly = n.n = d), p !== n.s && (t.disabled = n.s = p), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0
    }), N(() => t.value = e.inputValue()), t;
  })();
}, st = (l) => {
  const e = M();
  return u(k, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = Ue();
      return c(t, u(k, {
        get when() {
          return !l.loading;
        },
        get fallback() {
          return (() => {
            var r = de();
            return c(r, () => l.loadingPlaceholder), r;
          })();
        },
        get children() {
          return u(G, {
            get each() {
              return e.options();
            },
            get fallback() {
              return (() => {
                var r = de();
                return c(r, () => l.emptyPlaceholder), r;
              })();
            },
            children: (r) => u(it, {
              option: r,
              get children() {
                return l.format(r, "option");
              }
            })
          });
        }
      })), t;
    }
  });
}, it = (l) => {
  const e = M(), t = (r) => {
    D(() => {
      e.isOptionFocused(l.option) && r.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var r = Ke();
    return r.$$click = () => e.pickOption(l.option), Q(t, r), c(r, () => l.children), N((n) => {
      var o = e.isOptionDisabled(l.option), a = e.isOptionFocused(l.option);
      return o !== n.e && I(r, "data-disabled", n.e = o), a !== n.t && I(r, "data-focused", n.t = a), n;
    }, {
      e: void 0,
      t: void 0
    }), r;
  })();
};
ne(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var at = /* @__PURE__ */ g("<h1>"), ct = /* @__PURE__ */ g("<button>Search"), ut = /* @__PURE__ */ g("<button>Collections"), dt = /* @__PURE__ */ g("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), ft = /* @__PURE__ */ g("<p>Getting STAC Catalog"), ht = /* @__PURE__ */ g("<div class=StacSearchFilters><button>Search</button><button>Clear"), gt = /* @__PURE__ */ g("<p>Searching"), pt = /* @__PURE__ */ g("<p class=StacErrorText>ERROR SEARCHING STAC"), mt = /* @__PURE__ */ g("<div class=StacSearchResults>"), vt = /* @__PURE__ */ g("<button>Previous Page"), $t = /* @__PURE__ */ g("<span>Returned: "), bt = /* @__PURE__ */ g("<span>Limit: "), _t = /* @__PURE__ */ g("<span>Matched: "), Ct = /* @__PURE__ */ g("<button>Next Page"), St = /* @__PURE__ */ g("<div class=StacSearchPagingButtons>"), xt = /* @__PURE__ */ g("<div class=StacFeatureCollection>"), fe = /* @__PURE__ */ g("<p>"), yt = /* @__PURE__ */ g("<div class=StacFeature><div><p></p><p></p><div class=stacFeatureAssetSelectionDiv><p></p><button>Add To Map"), kt = /* @__PURE__ */ g("<img class=stacFeatureThumbnail crossorigin=anonymous>"), wt = /* @__PURE__ */ g("<p>No Thumbnail");
function Pt(l) {
  const {
    url: e,
    selectCallback: t
  } = l, [r] = X(() => e, ke), {
    setCallback: n
  } = Y();
  n(() => t);
  const [o, a] = x("collections");
  return (() => {
    var i = dt(), s = i.firstChild, f = s.firstChild;
    return c(s, u(le, {
      get fallback() {
        return ft();
      },
      get children() {
        var d = at();
        return c(d, r), d;
      }
    }), f), c(f, u(k, {
      get when() {
        return o() === "collections";
      },
      get children() {
        var d = ct();
        return d.$$click = () => a("search"), d;
      }
    }), null), c(f, u(k, {
      get when() {
        return o() === "search";
      },
      get children() {
        var d = ut();
        return d.$$click = () => a("collections"), d;
      }
    }), null), c(i, u(k, {
      get when() {
        return o() === "search";
      },
      get children() {
        return u(It, {
          url: e
        });
      }
    }), null), c(i, u(k, {
      get when() {
        return o() === "collections";
      },
      get children() {
        return u(Le, {
          url: e
        });
      }
    }), null), i;
  })();
}
function It(l) {
  const {
    url: e
  } = l, t = `${e}/search`, [r, n] = x("", {
    equals: !1
  }), {
    collections: o,
    bbox: a,
    setBbox: i,
    intersects: s,
    setIntersects: f,
    datetime: d,
    setDatetime: p
  } = Y(), y = te(o().map((v) => v.id)), $ = te([], {
    createable: !0
  }), [O, _] = x([]), [P, b] = x([]), [C, S] = x(1e3), [H, L] = x(""), [F, A] = x(""), [U, j] = x(!1), [w, {
    refetch: q
  }] = X(r, h), [re, oe] = x(""), [se, K] = x(""), [ie, ae] = x("");
  async function h(v) {
    if (v.trim() === "") {
      j(!1);
      return;
    }
    j(!0);
    const m = new URL(v), V = {
      collections: O().join(","),
      limit: C()
    };
    if (P().length > 0 && (V.ids = P().join(",")), a()) {
      if (!At(a())) {
        K("StacSearchErrorInput");
        return;
      }
      K(""), V.bbox = a();
    }
    d() && console.log("datetime", d()), s() && console.log("intersects", s()), Object.entries(V).forEach(([z, be]) => {
      m.searchParams.append(z, be);
    });
    const Z = await (await fetch(m, {
      method: "GET"
    })).json(), ce = Z.links.find((z) => z.rel === "next"), ue = Z.links.find((z) => z.rel === "previous");
    return ce?.href ? A(ce.href) : A(""), ue?.href ? L(ue.href) : L(""), Z;
  }
  async function R(v) {
    n(v), await q();
  }
  return [(() => {
    var v = ht(), m = v.firstChild, V = m.nextSibling;
    return c(v, u(W, ee({
      placeholder: "Select Collections. (Leave blank for all)",
      onChange: _,
      multiple: !0
    }, y)), m), c(v, u(W, {
      placeholder: "Select Limit",
      onChange: S,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), m), c(v, u(W, ee({
      placeholder: "Add Item Ids",
      onChange: b,
      multiple: !0
    }, $)), m), m.$$click = () => {
      n(t), q(t);
    }, V.$$click = () => {
      A(""), L(""), j(!1), n("");
    }, v;
  })(), (() => {
    var v = mt();
    return c(v, u(k, {
      get when() {
        return w.loading;
      },
      get children() {
        return gt();
      }
    }), null), c(v, u(k, {
      get when() {
        return w.error;
      },
      get children() {
        return pt();
      }
    }), null), c(v, u(k, {
      get when() {
        return T(() => !!(U() && !w.loading && !w.error))() && w();
      },
      get children() {
        return u(Ot, {
          get searchResults() {
            return w();
          }
        });
      }
    }), null), v;
  })(), (() => {
    var v = St();
    return c(v, u(k, {
      get when() {
        return H().trim().length > 0;
      },
      get children() {
        var m = vt();
        return m.$$click = () => {
          R(H());
        }, m;
      }
    }), null), c(v, u(k, {
      get when() {
        return T(() => !!(U() && !w.loading && !w.error))() && w();
      },
      get children() {
        return [(() => {
          var m = $t();
          return m.firstChild, c(m, (() => {
            var V = T(() => !!w().context);
            return () => V() ? w().context.returned : "Not Listed";
          })(), null), m;
        })(), (() => {
          var m = bt();
          return m.firstChild, c(m, (() => {
            var V = T(() => !!w().context);
            return () => V() ? w().context.limit : "Not Listed";
          })(), null), m;
        })(), (() => {
          var m = _t();
          return m.firstChild, c(m, (() => {
            var V = T(() => !!w().context);
            return () => V() ? w().context.matched : "Not Listed";
          })(), null), m;
        })()];
      }
    }), null), c(v, u(k, {
      get when() {
        return F().trim().length > 0;
      },
      get children() {
        var m = Ct();
        return m.$$click = () => {
          R(F());
        }, m;
      }
    }), null), v;
  })()];
}
function Ot(l) {
  const {
    searchResults: e
  } = l;
  return u(Tt, {
    featureCollection: e
  });
}
function Tt(l) {
  const {
    featureCollection: e
  } = l;
  return (() => {
    var t = xt();
    return c(t, u(G, {
      get each() {
        return e.features;
      },
      children: (r) => u($e, {
        feature: r
      })
    })), t;
  })();
}
function $e(l) {
  const {
    feature: e
  } = l, {
    callback: t
  } = Y();
  function r(s) {
    t()({
      asset: n(),
      feature: e
    });
  }
  const [n, o] = x(""), a = Object.entries(e.assets).map(([s, f]) => ({
    name: s,
    value: f
  })).filter((s) => s.name !== "thumbnail"), i = te(a, {
    key: "name"
  });
  return (() => {
    var s = yt(), f = s.firstChild, d = f.firstChild, p = d.nextSibling, y = p.nextSibling, $ = y.firstChild, O = $.nextSibling;
    return c(s, (() => {
      var _ = T(() => !!e.assets.thumbnail?.href);
      return () => _() ? (() => {
        var P = kt();
        return N((b) => {
          var C = e.assets.thumbnail.href, S = e.assets.thumbnail.title ? e.assets.thumbnail.title : "Thumbnail";
          return C !== b.e && I(P, "src", b.e = C), S !== b.t && I(P, "alt", b.t = S), b;
        }, {
          e: void 0,
          t: void 0
        }), P;
      })() : wt();
    })(), f), f.style.setProperty("padding", "0.5rem"), c(d, () => "ID: " + e.id), c(p, () => "Bounding Box: " + e.bbox.join(", ")), c(f, u(k, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var _ = fe();
        return c(_, () => e.properties.datetime ? "Date/Time: " + e.properties.datetime : ""), _;
      }
    }), y), c(f, u(k, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var _ = fe();
        return c(_, () => e.properties.created ? "Creation Date: " + e.properties.created : ""), _;
      }
    }), y), c(y, u(W, ee(i, {
      placeholder: "Select Asset",
      onChange: (_) => {
        o(_.value);
      }
    })), $), O.$$click = r, s;
  })();
}
function At(l) {
  const e = l.split(",").map((i) => parseFloat(i));
  if (e.length !== 4 || e.some((i) => isNaN(i)))
    return !1;
  const [t, r, n, o] = e;
  return !(t < -180 || t > 180 || n < -180 || n > 180 || r < -90 || r > 90 || o < -90 || o > 90 || t > n || r > o);
}
ne(["click", "input"]);
function Lt(l) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: r,
    intersectsSignal: n,
    datetimeSignal: o
  } = l;
  return u(ye, {
    bboxSignal: r,
    intersectsSignal: n,
    datetimeSignal: o,
    get children() {
      return u(Pt, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Lt as Stac
};
