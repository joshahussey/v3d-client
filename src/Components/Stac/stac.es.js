import { createComponent as s, delegateEvents as ae, template as g, insert as c, use as te, memo as V, effect as O, setAttribute as D, addEventListener as Z, className as re, mergeProps as oe } from "solid-js/web";
import { createContext as pe, createSignal as C, useContext as $e, createResource as ne, createEffect as B, Suspense as se, For as Q, Show as T, splitProps as Se, mergeProps as ve, on as q, createMemo as ye, Switch as xe, Match as fe } from "solid-js";
const me = pe(void 0);
function ke() {
  const [l, e] = C([]), [t, r] = C(null);
  return {
    collections: l,
    setCollections: e,
    setCallback: r,
    callback: t
  };
}
const Pe = (l) => {
  const {
    collections: e,
    setCollections: t,
    callback: r,
    setCallback: n
  } = ke(), {
    bboxSignal: o,
    intersectsSignal: u,
    datetimeSignal: a
  } = l, [i, f] = o, [d, p] = u, [m, $] = a;
  return s(me.Provider, {
    value: {
      collections: e,
      setCollections: t,
      callback: r,
      setCallback: n,
      bbox: i,
      setBbox: f,
      intersects: d,
      setIntersects: p,
      datetime: m,
      setDatetime: $
    },
    get children() {
      return l.children;
    }
  });
}, le = () => {
  const l = $e(me);
  if (!l)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return l;
};
async function we(l) {
  return (await (await fetch(l + "/")).json()).id;
}
async function Ie(l) {
  const { setCollections: e } = le(), o = (await (await fetch(l + "/collections")).json()).collections;
  return e(o), o;
}
async function Te(l) {
  const t = await (await fetch(l)).json();
  return console.log(t), t.features;
}
var Oe = /* @__PURE__ */ g("<nav class=StacScroll>"), Ve = /* @__PURE__ */ g("<p>Getting STAC Response"), De = /* @__PURE__ */ g("<div class=StacCollectionCard><h2></h2><p>"), Ae = /* @__PURE__ */ g("<nav class=collectionPageScroll>"), Re = /* @__PURE__ */ g("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class>Back</span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), Le = /* @__PURE__ */ g("<p>Getting Items"), Ne = /* @__PURE__ */ g("<div class=StacItems>");
function Fe(l) {
  const {
    url: e
  } = l, [t, r] = C(!1), [n, o] = C(null), [u] = ne(() => e, Ie);
  let a, i;
  return B(() => {
    t() && a && i ? (a.classList.remove("collectionPage-hidden"), a.classList.add("collectionPage"), a.style.top = `${i.getBoundingClientRect().top}px`, a.focus()) : a && i && (a.classList.remove("collectionPage"), a.classList.add("collectionPage-hidden"), a.style.top = `${i.getBoundingClientRect().top}px`, a.focus());
  }), [s(se, {
    get fallback() {
      return Ve();
    },
    get children() {
      var f = Oe(), d = i;
      return typeof d == "function" ? te(d, f) : i = f, c(f, s(Q, {
        get each() {
          return u();
        },
        children: (p) => s(Ee, {
          collection: p,
          setIsCollectionPage: r,
          setCollectionPage: o
        })
      })), f;
    }
  }), s(T, {
    get when() {
      return t();
    },
    get children() {
      return s(Be, {
        ref(f) {
          var d = a;
          typeof d == "function" ? d(f) : a = f;
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
    var o = De(), u = o.firstChild, a = u.nextSibling;
    return u.$$click = n, c(u, () => e.title), c(a, () => `ID: ${e.id}`), o;
  })();
}
function Be(l) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: r,
    ref: n
  } = l;
  return (() => {
    var o = Re(), u = o.firstChild, a = u.firstChild, i = a.firstChild, f = i.nextSibling, d = f.nextSibling, p = a.nextSibling, m = p.nextSibling, $ = m.nextSibling, b = $.firstChild;
    b.firstChild;
    var w = b.nextSibling, x = w.nextSibling;
    return te(n, o), i.$$click = () => {
      t(null), r(!1);
    }, c(d, () => `ID: ${e ? e.id : ""}`), c(p, () => e ? e.title : ""), c(m, () => e ? e.description : ""), c(b, () => `Keywords: ${e ? e.keywords?.join(", ") : ""}`, null), c(x, () => `License: ${e && e.license}`), c(o, s(se, {
      get fallback() {
        return Le();
      },
      get children() {
        var k = Ae();
        return c(k, (() => {
          var S = V(() => !!e?.links.find((P) => P.rel === "items"));
          return () => S() ? s(Me, {
            get url() {
              return e.links.find((P) => P.rel === "items").href;
            }
          }) : null;
        })()), k;
      }
    }), null), O((k) => {
      var S = e ? e.keywords?.join(", ") : "", P = e ? e.license : "";
      return S !== k.e && D(b, "title", k.e = S), P !== k.t && D(x, "title", k.t = P), k;
    }, {
      e: void 0,
      t: void 0
    }), o;
  })();
}
function Me(l) {
  const {
    url: e
  } = l, [t] = ne(() => e, Te);
  return (() => {
    var r = Ne();
    return c(r, s(Q, {
      get each() {
        return t();
      },
      children: (n) => s(_e, {
        feature: n
      })
    })), r;
  })();
}
ae(["click"]);
var je = /* @__PURE__ */ g("<mark>"), He = /* @__PURE__ */ g("<div>"), ze = /* @__PURE__ */ g("<div class=solid-select-control>"), Ge = /* @__PURE__ */ g("<div class=solid-select-placeholder>"), qe = /* @__PURE__ */ g("<div class=solid-select-single-value>"), Ke = /* @__PURE__ */ g("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), Ue = /* @__PURE__ */ g("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), We = /* @__PURE__ */ g("<div class=solid-select-list>"), ge = /* @__PURE__ */ g("<div class=solid-select-list-placeholder>"), Je = /* @__PURE__ */ g("<div class=solid-select-option>"), Qe = (l) => {
  const e = ve({
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
  }, [r, n] = C(e.initialValue !== void 0 ? t(e.initialValue) : []), o = () => e.multiple ? r() : r()[0] || null, u = (h) => n(t(h)), a = () => n([]), i = () => !!(e.multiple ? o().length : o());
  B(q(r, () => e.onChange?.(o()), {
    defer: !0
  }));
  const [f, d] = C(""), p = () => d(""), m = () => !!f().length;
  B(q(f, (h) => e.onInput?.(h), {
    defer: !0
  })), B(q(f, (h) => {
    h && !S() && P(!0);
  }, {
    defer: !0
  }));
  const $ = typeof e.options == "function" ? ye(() => e.options(f()), e.options(f())) : () => e.options, b = () => $().length, w = (h) => {
    if (e.isOptionDisabled(h)) return;
    const A = e.optionToValue(h);
    e.multiple ? u([...r(), A]) : (u(A), k(!1)), P(!1);
  }, [x, k] = C(!1), [S, P] = C(!1), K = () => P(!S()), [F, L] = C(-1), R = () => $()[F()], W = (h) => h === R(), I = (h) => {
    b() || L(-1);
    const A = b() - 1, _ = h === "next" ? 1 : -1;
    let v = F() + _;
    v > A && (v = 0), v < 0 && (v = A), L(v);
  }, y = () => I("previous"), E = () => I("next");
  B(q($, (h) => {
    S() && L(Math.min(0, h.length - 1));
  }, {
    defer: !0
  })), B(q(() => e.disabled, (h) => {
    h && S() && P(!1);
  })), B(q(S, (h) => {
    h ? (F() === -1 && E(), k(!0)) : (F() > -1 && L(-1), d(""));
  }, {
    defer: !0
  })), B(q(F, (h) => {
    h > -1 && !S() && P(!0);
  }, {
    defer: !0
  }));
  const M = () => k(!0), z = () => {
    k(!1), P(!1);
  }, G = (h) => h.preventDefault(), U = (h) => {
    !e.disabled && !m() && K();
  }, j = (h) => {
    d(h.target.value);
  }, Y = (h) => {
    switch (h.key) {
      case "ArrowDown":
        E();
        break;
      case "ArrowUp":
        y();
        break;
      case "Enter":
        if (S() && R()) {
          w(R());
          break;
        }
        return;
      case "Escape":
        if (S()) {
          P(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (f())
          return;
        if (e.multiple) {
          const A = o();
          u([...A.slice(0, -1)]);
        } else
          a();
        break;
      case " ":
        if (f())
          return;
        S() ? R() && w(R()) : P(!0);
        break;
      case "Tab":
        if (R() && S()) {
          w(R());
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
    setValue: u,
    hasValue: i,
    clearValue: a,
    inputValue: f,
    setInputValue: d,
    hasInputValue: m,
    clearInputValue: p,
    isOpen: S,
    setIsOpen: P,
    toggleOpen: K,
    isActive: x,
    setIsActive: k,
    get multiple() {
      return e.multiple;
    },
    get disabled() {
      return e.disabled;
    },
    pickOption: w,
    isOptionFocused: W,
    isOptionDisabled: e.isOptionDisabled,
    onFocusIn: M,
    onFocusOut: z,
    onMouseDown: G,
    onClick: U,
    onInput: j,
    onKeyDown: Y
  };
}, J = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, Xe = (l, e) => {
  let t = J.NO_MATCH, r = [];
  if (l.length <= e.length) {
    const n = Array.from(l.toLocaleLowerCase()), o = Array.from(e.toLocaleLowerCase());
    let u = J.START;
    e: for (let a = 0, i = 0; a < n.length; a++) {
      for (; i < o.length; )
        if (o[i] === n[a]) {
          r[i] = !0, u === J.MATCH && o[i - 1] === " " && o[i] !== " " && (u = J.WORD_START), t += u, u++, i++;
          continue e;
        } else
          u = J.MATCH, i++;
      t = J.NO_MATCH, r.length = 0;
    }
  }
  return {
    target: e,
    score: t,
    matches: r
  };
}, Ye = (l, e = (t) => (() => {
  var r = je();
  return c(r, t), r;
})()) => {
  const t = l.target, r = l.matches, n = "\0", o = [];
  let u = !1;
  for (let a = 0; a < t.length; a++) {
    const i = t[a], f = r[a];
    !u && f ? (o.push(n), u = !0) : u && !f && (o.push(n), u = !1), o.push(i);
  }
  return u && (o.push(n), u = !1), V(() => o.join("").split(n).map((a, i) => i % 2 ? e(a) : a));
}, Ze = (l, e, t) => {
  const r = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n], u = o[t], a = Xe(l, u);
    a.score && r.push({
      ...a,
      item: o,
      index: n
    });
  }
  return r.sort((n, o) => {
    let u = o.score - n.score;
    return u === 0 && (u = n.index - o.index), u;
  }), r;
}, et = (l, e, t) => e === "label" ? [V(() => t.prefix), V(() => t.highlight ?? l)] : l, ie = (l, e) => {
  const t = Object.assign({
    extractText: (i) => i.toString ? i.toString() : i,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const r = (i) => t.key ? i[t.key] : i, n = (i) => t.extractText(r(i)), o = (i, f, d) => {
    const p = r(i);
    return t.format ? t.format(p, f, d) : et(p, f, d);
  }, u = (i) => t.disable(r(i));
  return {
    options: (i) => {
      let d = (typeof l == "function" ? l(i) : l).map((p) => ({
        value: p,
        label: o(p, "label", {}),
        text: n(p),
        disabled: u(p)
      }));
      if (t.filterable && i && (typeof t.filterable == "function" ? d = t.filterable(i, d) : d = Ze(i, d, "text").map((p) => ({
        ...p.item,
        label: o(p.item.value, "label", {
          highlight: Ye(p)
        })
      }))), t.createable !== void 0) {
        const p = i.trim(), m = d.some(($) => tt(i, $.text));
        if (p) {
          let $;
          if (typeof t.createable == "function" ? t.createable.length === 1 && m || ($ = t.createable(p, m, d)) : m || ($ = t.key ? {
            [t.key]: p
          } : p), $ !== void 0) {
            const b = Array.isArray($) ? $ : [$], w = [];
            for (const x of b)
              w.push({
                value: x,
                label: o(x, "label", {
                  prefix: "Create "
                }),
                text: n(x),
                disabled: !1
              });
            d = [...d, ...w];
          }
        }
      }
      return d;
    },
    optionToValue: (i) => i.value,
    isOptionDisabled: (i) => i.disabled,
    format: (i, f) => f === "option" ? i.label : o(i, "value", {})
  };
}, tt = (l, e) => l.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, be = pe(), X = () => {
  const l = $e(be);
  if (!l) throw new Error("No SelectContext found in ancestry.");
  return l;
}, ee = (l) => {
  const [e, t] = Se(ve({
    format: (n, o) => n,
    placeholder: "Select...",
    readonly: typeof l.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, l), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), r = Qe(e);
  return B(q(() => t.initialValue, (n) => n !== void 0 && r.setValue(n))), s(be.Provider, {
    value: r,
    get children() {
      return s(nt, {
        get class() {
          return t.class;
        },
        get children() {
          return [s(lt, {
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
          }), s(st, {
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
}, nt = (l) => {
  const e = X();
  return (() => {
    var t = He();
    return t.$$mousedown = (r) => {
      e.onMouseDown(r), r.currentTarget.getElementsByTagName("input")[0].focus();
    }, Z(t, "focusout", e.onFocusOut, !0), Z(t, "focusin", e.onFocusIn, !0), c(t, () => l.children), O((r) => {
      var n = `solid-select-container ${l.class !== void 0 ? l.class : ""}`, o = e.disabled;
      return n !== r.e && re(t, r.e = n), o !== r.t && D(t, "data-disabled", r.t = o), r;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, lt = (l) => {
  const e = X(), t = (r) => {
    const n = e.value();
    e.setValue([...n.slice(0, r), ...n.slice(r + 1)]);
  };
  return (() => {
    var r = ze();
    return Z(r, "click", e.onClick, !0), c(r, s(T, {
      get when() {
        return V(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return s(rt, {
          get children() {
            return l.placeholder;
          }
        });
      }
    }), null), c(r, s(T, {
      get when() {
        return V(() => !!(e.hasValue() && !e.multiple))() && !e.hasInputValue();
      },
      get children() {
        return s(ot, {
          get children() {
            return l.format(e.value(), "value");
          }
        });
      }
    }), null), c(r, s(T, {
      get when() {
        return e.hasValue() && e.multiple;
      },
      get children() {
        return s(Q, {
          get each() {
            return e.value();
          },
          children: (n, o) => s(it, {
            onRemove: () => t(o()),
            get children() {
              return l.format(n, "value");
            }
          })
        });
      }
    }), null), c(r, s(at, {
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
    }), null), O((n) => {
      var o = e.multiple, u = e.hasValue(), a = e.disabled;
      return o !== n.e && D(r, "data-multiple", n.e = o), u !== n.t && D(r, "data-has-value", n.t = u), a !== n.a && D(r, "data-disabled", n.a = a), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
}, rt = (l) => (() => {
  var e = Ge();
  return c(e, () => l.children), e;
})(), ot = (l) => (() => {
  var e = qe();
  return c(e, () => l.children), e;
})(), it = (l) => (X(), (() => {
  var e = Ke(), t = e.firstChild, r = t.nextSibling;
  return c(t, () => l.children), r.$$click = (n) => {
    n.stopPropagation(), l.onRemove();
  }, e;
})()), at = (l) => {
  const e = X();
  return (() => {
    var t = Ue();
    t.$$mousedown = (n) => {
      n.stopPropagation();
    }, t.$$keydown = (n) => {
      e.onKeyDown(n), n.defaultPrevented || n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
    }, Z(t, "input", e.onInput, !0);
    var r = l.ref;
    return typeof r == "function" ? te(r, t) : l.ref = t, O((n) => {
      var o = l.id, u = l.name, a = e.multiple, i = e.isActive(), f = l.autofocus, d = l.readonly, p = e.disabled;
      return o !== n.e && D(t, "id", n.e = o), u !== n.t && D(t, "name", n.t = u), a !== n.a && D(t, "data-multiple", n.a = a), i !== n.o && D(t, "data-is-active", n.o = i), f !== n.i && (t.autofocus = n.i = f), d !== n.n && (t.readOnly = n.n = d), p !== n.s && (t.disabled = n.s = p), n;
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
}, st = (l) => {
  const e = X();
  return s(T, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = We();
      return c(t, s(T, {
        get when() {
          return !l.loading;
        },
        get fallback() {
          return (() => {
            var r = ge();
            return c(r, () => l.loadingPlaceholder), r;
          })();
        },
        get children() {
          return s(Q, {
            get each() {
              return e.options();
            },
            get fallback() {
              return (() => {
                var r = ge();
                return c(r, () => l.emptyPlaceholder), r;
              })();
            },
            children: (r) => s(ct, {
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
}, ct = (l) => {
  const e = X(), t = (r) => {
    B(() => {
      e.isOptionFocused(l.option) && r.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var r = Je();
    return r.$$click = () => e.pickOption(l.option), te(t, r), c(r, () => l.children), O((n) => {
      var o = e.isOptionDisabled(l.option), u = e.isOptionFocused(l.option);
      return o !== n.e && D(r, "data-disabled", n.e = o), u !== n.t && D(r, "data-focused", n.t = u), n;
    }, {
      e: void 0,
      t: void 0
    }), r;
  })();
};
ae(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var ut = /* @__PURE__ */ g("<h1>"), dt = /* @__PURE__ */ g("<button>Search"), ft = /* @__PURE__ */ g("<button>Collections"), gt = /* @__PURE__ */ g("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), ht = /* @__PURE__ */ g("<p>Getting STAC Catalog"), pt = /* @__PURE__ */ g('<div class=StacSearchFilters><input placeholder="Bbox: minx, miny, maxx, maxy"><input type=datetime-local placeholder=Datetime><button>Search</button><button>Clear'), $t = /* @__PURE__ */ g("<p>Searching"), vt = /* @__PURE__ */ g("<p class=StacErrorText>ERROR SEARCHING STAC"), mt = /* @__PURE__ */ g("<div class=StacSearchResults>"), bt = /* @__PURE__ */ g("<button>Previous Page"), _t = /* @__PURE__ */ g("<span>Returned: "), Ct = /* @__PURE__ */ g("<span>Limit: "), St = /* @__PURE__ */ g("<span>Matched: "), yt = /* @__PURE__ */ g("<button>Next Page"), xt = /* @__PURE__ */ g("<div class=StacSearchPagingButtons>"), kt = /* @__PURE__ */ g("<div class=StacFeatureCollection>"), he = /* @__PURE__ */ g("<p>"), Pt = /* @__PURE__ */ g("<div class=StacFeature><div><p></p><p></p><span><button>Select"), wt = /* @__PURE__ */ g("<img class=stacFeatureThumbnail crossorigin=anonymous>"), It = /* @__PURE__ */ g("<p>No Thumbnail"), Tt = /* @__PURE__ */ g("<div><label>Latitude:<input type=text></label><label>Longitude:<input type=text>"), Ot = /* @__PURE__ */ g("<div><button>Add Vertex"), Vt = /* @__PURE__ */ g("<div class=dialog-backdrop><div class=dialog-content><h2>Intersects</h2><div><label><input type=radio value=none>None</label><label><input type=radio value=point>Point</label><label><input type=radio value=polygon>Polygon</label></div><div><button>Cancel</button><button>Save"), Dt = /* @__PURE__ */ g("<p>Select a geometry type above."), At = /* @__PURE__ */ g("<div><label>Lat:<input type=text></label><label>Lon:<input type=text>"), Rt = /* @__PURE__ */ g("<button>Intersects…"), Lt = /* @__PURE__ */ g("<p>Current intersects: ");
function Nt(l) {
  const {
    url: e,
    selectCallback: t
  } = l, [r] = ne(() => e, we), {
    setCallback: n
  } = le();
  n(() => t);
  const [o, u] = C("collections");
  return (() => {
    var a = gt(), i = a.firstChild, f = i.firstChild;
    return c(i, s(se, {
      get fallback() {
        return ht();
      },
      get children() {
        var d = ut();
        return c(d, r), d;
      }
    }), f), c(f, s(T, {
      get when() {
        return o() === "collections";
      },
      get children() {
        var d = dt();
        return d.$$click = () => u("search"), d;
      }
    }), null), c(f, s(T, {
      get when() {
        return o() === "search";
      },
      get children() {
        var d = ft();
        return d.$$click = () => u("collections"), d;
      }
    }), null), c(a, s(T, {
      get when() {
        return o() === "search";
      },
      get children() {
        return s(Ft, {
          url: e
        });
      }
    }), null), c(a, s(T, {
      get when() {
        return o() === "collections";
      },
      get children() {
        return s(Fe, {
          url: e
        });
      }
    }), null), a;
  })();
}
function Ft(l) {
  const {
    url: e
  } = l, t = `${e}/search`, [r, n] = C("", {
    equals: !1
  }), {
    collections: o,
    bbox: u,
    setBbox: a,
    intersects: i,
    setIntersects: f,
    datetime: d,
    setDatetime: p
  } = le(), m = ie(o().map((_) => _.id)), $ = ie([], {
    createable: !0
  }), [b, w] = C([]), [x, k] = C([]), [S, P] = C(1e3), [K, F] = C(""), [L, R] = C(""), [W, I] = C(!1), [y, {
    refetch: E
  }] = ne(r, h), [M, z] = C(""), [G, U] = C(""), [j, Y] = C("");
  async function h(_) {
    if (_.trim() === "") {
      I(!1);
      return;
    }
    new URL(_);
  }
  async function A(_) {
    n(_), await E();
  }
  return [(() => {
    var _ = pt(), v = _.firstChild, N = v.nextSibling, ce = N.nextSibling, Ce = ce.nextSibling;
    return c(_, s(ee, oe({
      placeholder: "Select Collections. (Leave blank for all)",
      onChange: w,
      multiple: !0
    }, m)), v), c(_, s(ee, {
      placeholder: "Select Limit",
      onChange: P,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), v), c(_, s(ee, oe({
      placeholder: "Add Item Ids",
      onChange: k,
      multiple: !0
    }, $)), v), v.$$input = (H) => a(H.currentTarget.value), c(_, s(jt, {}), N), N.$$input = (H) => {
      p(H.currentTarget.value);
    }, ce.$$click = () => {
      n(t), E(t);
    }, Ce.$$click = () => {
      R(""), F(""), I(!1), n("");
    }, O((H) => {
      var ue = `StacBboxInput ${G()}`, de = `StacDatetimeInput ${M()}`;
      return ue !== H.e && re(v, H.e = ue), de !== H.t && re(N, H.t = de), H;
    }, {
      e: void 0,
      t: void 0
    }), O(() => v.value = u() ? u() : ""), O(() => N.value = d() ? d() : ""), _;
  })(), (() => {
    var _ = mt();
    return c(_, s(T, {
      get when() {
        return y.loading;
      },
      get children() {
        return $t();
      }
    }), null), c(_, s(T, {
      get when() {
        return y.error;
      },
      get children() {
        return vt();
      }
    }), null), c(_, s(T, {
      get when() {
        return V(() => !!(W() && !y.loading && !y.error))() && y();
      },
      get children() {
        return s(Et, {
          get searchResults() {
            return y();
          }
        });
      }
    }), null), _;
  })(), (() => {
    var _ = xt();
    return c(_, s(T, {
      get when() {
        return K().trim().length > 0;
      },
      get children() {
        var v = bt();
        return v.$$click = () => {
          A(K());
        }, v;
      }
    }), null), c(_, s(T, {
      get when() {
        return V(() => !!(W() && !y.loading && !y.error))() && y();
      },
      get children() {
        return [(() => {
          var v = _t();
          return v.firstChild, c(v, (() => {
            var N = V(() => !!y().context);
            return () => N() ? y().context.returned : "Not Listed";
          })(), null), v;
        })(), (() => {
          var v = Ct();
          return v.firstChild, c(v, (() => {
            var N = V(() => !!y().context);
            return () => N() ? y().context.limit : "Not Listed";
          })(), null), v;
        })(), (() => {
          var v = St();
          return v.firstChild, c(v, (() => {
            var N = V(() => !!y().context);
            return () => N() ? y().context.matched : "Not Listed";
          })(), null), v;
        })()];
      }
    }), null), c(_, s(T, {
      get when() {
        return L().trim().length > 0;
      },
      get children() {
        var v = yt();
        return v.$$click = () => {
          A(L());
        }, v;
      }
    }), null), _;
  })()];
}
function Et(l) {
  const {
    searchResults: e
  } = l;
  return s(Bt, {
    featureCollection: e
  });
}
function Bt(l) {
  const {
    featureCollection: e
  } = l;
  return (() => {
    var t = kt();
    return c(t, s(Q, {
      get each() {
        return e.features;
      },
      children: (r) => s(_e, {
        feature: r
      })
    })), t;
  })();
}
function _e(l) {
  const {
    feature: e
  } = l, {
    callback: t
  } = le();
  function r(i) {
    t()({
      asset: n(),
      feature: e
    });
  }
  const [n, o] = C(""), u = Object.entries(e.assets).map(([i, f]) => ({
    name: i,
    value: f
  })).filter((i) => i.name !== "thumbnail"), a = ie(u, {
    key: "name"
  });
  return (() => {
    var i = Pt(), f = i.firstChild, d = f.firstChild, p = d.nextSibling, m = p.nextSibling, $ = m.firstChild;
    return c(i, (() => {
      var b = V(() => !!e.assets.thumbnail?.href);
      return () => b() ? (() => {
        var w = wt();
        return O((x) => {
          var k = e.assets.thumbnail.href, S = e.assets.thumbnail.title ? e.assets.thumbnail.title : "Thumbnail";
          return k !== x.e && D(w, "src", x.e = k), S !== x.t && D(w, "alt", x.t = S), x;
        }, {
          e: void 0,
          t: void 0
        }), w;
      })() : It();
    })(), f), f.style.setProperty("padding", "0.5rem"), c(d, () => "ID: " + e.id), c(p, () => "Bounding Box: " + e.bbox.join(", ")), c(f, s(T, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var b = he();
        return c(b, () => e.properties.datetime ? "Date/Time: " + e.properties.datetime : ""), b;
      }
    }), m), c(f, s(T, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var b = he();
        return c(b, () => e.properties.created ? "Creation Date: " + e.properties.created : ""), b;
      }
    }), m), c(m, s(ee, oe(a, {
      placeholder: "Select Asset",
      onChange: (b) => {
        o(b.value);
      }
    })), $), $.$$click = r, i;
  })();
}
function Mt(l) {
  const [e, t] = C("none"), [r, n] = C(""), [o, u] = C(""), [a, i] = C([{
    lat: "",
    lon: ""
  }]);
  function f() {
    i([...a(), {
      lat: "",
      lon: ""
    }]);
  }
  function d(m, $, b) {
    i((w) => {
      const x = [...w];
      return x[m] = {
        ...x[m],
        [$]: b
      }, x;
    });
  }
  function p() {
    let m = null;
    if (e() === "point") {
      const $ = parseFloat(r()), b = parseFloat(o());
      !isNaN($) && !isNaN(b) && (m = {
        type: "Point",
        coordinates: [b, $]
        // [lon, lat] per GeoJSON spec
      });
    } else if (e() === "polygon") {
      const $ = a().map((b) => [parseFloat(b.lon), parseFloat(b.lat)]);
      $.length >= 3 && ($.push($[0]), m = {
        type: "Polygon",
        coordinates: [$]
      });
    }
    l.onSave(m ? JSON.stringify(m) : null);
  }
  return (() => {
    var m = Vt(), $ = m.firstChild, b = $.firstChild, w = b.nextSibling, x = w.firstChild, k = x.firstChild, S = x.nextSibling, P = S.firstChild, K = S.nextSibling, F = K.firstChild, L = w.nextSibling, R = L.firstChild, W = R.nextSibling;
    return k.$$input = (I) => t(I.currentTarget.value), P.$$input = (I) => t(I.currentTarget.value), F.$$input = (I) => t(I.currentTarget.value), c($, s(xe, {
      get fallback() {
        return Dt();
      },
      get children() {
        return [s(fe, {
          get when() {
            return e() === "point";
          },
          get children() {
            var I = Tt(), y = I.firstChild, E = y.firstChild, M = E.nextSibling, z = y.nextSibling, G = z.firstChild, U = G.nextSibling;
            return M.$$input = (j) => n(j.currentTarget.value), U.$$input = (j) => u(j.currentTarget.value), O(() => M.value = r()), O(() => U.value = o()), I;
          }
        }), s(fe, {
          get when() {
            return e() === "polygon";
          },
          get children() {
            var I = Ot(), y = I.firstChild;
            return c(I, s(Q, {
              get each() {
                return a();
              },
              children: (E, M) => (() => {
                var z = At(), G = z.firstChild, U = G.firstChild, j = U.nextSibling, Y = G.nextSibling, h = Y.firstChild, A = h.nextSibling;
                return z.style.setProperty("margin-bottom", "4px"), j.$$input = (_) => d(M(), "lat", _.currentTarget.value), Y.style.setProperty("margin-left", "8px"), A.$$input = (_) => d(M(), "lon", _.currentTarget.value), O(() => j.value = E.lat), O(() => A.value = E.lon), z;
              })()
            }), y), y.$$click = f, I;
          }
        })];
      }
    }), L), L.style.setProperty("margin-top", "16px"), Z(R, "click", l.onClose, !0), W.$$click = p, O(() => k.checked = e() === "none"), O(() => P.checked = e() === "point"), O(() => F.checked = e() === "polygon"), m;
  })();
}
function jt() {
  const [l, e] = C(!1), [t, r] = C(null), n = (o) => {
    r(o), e(!1);
  };
  return [(() => {
    var o = Rt();
    return o.$$click = () => e(!0), o;
  })(), V(() => V(() => !!l())() && s(Mt, {
    onClose: () => e(!1),
    onSave: n
  })), (() => {
    var o = Lt();
    return o.firstChild, c(o, () => t() ?? "None", null), o;
  })()];
}
ae(["click", "input"]);
function Gt(l) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: r,
    intersectsSignal: n,
    datetimeSignal: o
  } = l;
  return s(Pe, {
    bboxSignal: r,
    intersectsSignal: n,
    datetimeSignal: o,
    get children() {
      return s(Nt, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Gt as Stac
};
