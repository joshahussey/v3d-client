import { createComponent as u, delegateEvents as re, use as Y, insert as c, memo as T, effect as E, setAttribute as O, template as g, addEventListener as X, className as me, mergeProps as ne } from "solid-js/web";
import { createContext as ue, createSignal as S, useContext as de, createResource as Z, createEffect as R, Suspense as oe, For as U, Show as k, splitProps as $e, mergeProps as fe, on as F, createMemo as be } from "solid-js";
const he = ue(void 0);
function _e() {
  const [l, e] = S([]), [t, r] = S(null);
  return {
    collections: l,
    setCollections: e,
    setCallback: r,
    callback: t
  };
}
const Se = (l) => {
  const {
    collections: e,
    setCollections: t,
    callback: r,
    setCallback: n
  } = _e(), {
    bboxSignal: o,
    intersectsSignal: s,
    datetimeSignal: a
  } = l, [i, h] = o, [f, p] = s, [C, $] = a;
  return u(he.Provider, {
    value: {
      collections: e,
      setCollections: t,
      callback: r,
      setCallback: n,
      bbox: i,
      setBbox: h,
      intersects: f,
      setIntersects: p,
      datetime: C,
      setDatetime: $
    },
    get children() {
      return l.children;
    }
  });
}, ee = () => {
  const l = de(he);
  if (!l)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return l;
};
async function Ce(l) {
  return (await (await fetch(l + "/")).json()).id;
}
async function xe(l) {
  const { setCollections: e } = ee(), o = (await (await fetch(l + "/collections")).json()).collections;
  return e(o), o;
}
async function ye(l) {
  return (await (await fetch(l)).json()).features;
}
var ke = /* @__PURE__ */ g("<nav class=StacScroll>"), we = /* @__PURE__ */ g("<p>Getting STAC Response"), Pe = /* @__PURE__ */ g("<div class=StacCollectionCard><h2></h2><p>"), Ie = /* @__PURE__ */ g("<nav class=collectionPageScroll>"), Oe = /* @__PURE__ */ g("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class>Back</span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), Te = /* @__PURE__ */ g("<p>Getting Items"), Ve = /* @__PURE__ */ g("<div class=StacItems>");
function Re(l) {
  const {
    url: e
  } = l, [t, r] = S(!1), [n, o] = S(null), [s] = Z(() => e, xe);
  let a, i;
  return R(() => {
    t() && a && i ? (a.classList.remove("collectionPage-hidden"), a.classList.add("collectionPage"), a.style.top = `${i.getBoundingClientRect().top}px`, a.focus()) : a && i && (a.classList.remove("collectionPage"), a.classList.add("collectionPage-hidden"), a.style.top = `${i.getBoundingClientRect().top}px`, a.focus());
  }), [u(oe, {
    get fallback() {
      return we();
    },
    get children() {
      var h = ke(), f = i;
      return typeof f == "function" ? Y(f, h) : i = h, c(h, u(U, {
        get each() {
          return s();
        },
        children: (p) => u(Ae, {
          collection: p,
          setIsCollectionPage: r,
          setCollectionPage: o
        })
      })), h;
    }
  }), u(k, {
    get when() {
      return t();
    },
    get children() {
      return u(De, {
        ref(h) {
          var f = a;
          typeof f == "function" ? f(h) : a = h;
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
function Ae(l) {
  const {
    collection: e,
    setIsCollectionPage: t,
    setCollectionPage: r
  } = l;
  function n() {
    r(e), t(!0);
  }
  return (() => {
    var o = Pe(), s = o.firstChild, a = s.nextSibling;
    return s.$$click = n, c(s, () => e.title), c(a, () => `ID: ${e.id}`), o;
  })();
}
function De(l) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: r,
    ref: n
  } = l;
  return (() => {
    var o = Oe(), s = o.firstChild, a = s.firstChild, i = a.firstChild, h = i.nextSibling, f = h.nextSibling, p = a.nextSibling, C = p.nextSibling, $ = C.nextSibling, b = $.firstChild;
    b.firstChild;
    var I = b.nextSibling, w = I.nextSibling;
    return Y(n, o), i.$$click = () => {
      t(null), r(!1);
    }, c(f, () => `ID: ${e ? e.id : ""}`), c(p, () => e ? e.title : ""), c(C, () => e ? e.description : ""), c(b, () => `Keywords: ${e ? e.keywords?.join(", ") : ""}`, null), c(w, () => `License: ${e && e.license}`), c(o, u(oe, {
      get fallback() {
        return Te();
      },
      get children() {
        var x = Ie();
        return c(x, (() => {
          var _ = T(() => !!e?.links.find((y) => y.rel === "items"));
          return () => _() ? u(Le, {
            get url() {
              return e.links.find((y) => y.rel === "items").href;
            }
          }) : null;
        })()), x;
      }
    }), null), E((x) => {
      var _ = e ? e.keywords?.join(", ") : "", y = e ? e.license : "";
      return _ !== x.e && O(b, "title", x.e = _), y !== x.t && O(w, "title", x.t = y), x;
    }, {
      e: void 0,
      t: void 0
    }), o;
  })();
}
function Le(l) {
  const {
    url: e
  } = l, [t] = Z(() => e, ye);
  return (() => {
    var r = Ve();
    return c(r, u(U, {
      get each() {
        return t();
      },
      children: (n) => u(pe, {
        feature: n
      })
    })), r;
  })();
}
re(["click"]);
var Fe = /* @__PURE__ */ g("<mark>"), Ne = /* @__PURE__ */ g("<div>"), Ee = /* @__PURE__ */ g("<div class=solid-select-control>"), je = /* @__PURE__ */ g("<div class=solid-select-placeholder>"), Be = /* @__PURE__ */ g("<div class=solid-select-single-value>"), Me = /* @__PURE__ */ g("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), He = /* @__PURE__ */ g("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), qe = /* @__PURE__ */ g("<div class=solid-select-list>"), se = /* @__PURE__ */ g("<div class=solid-select-list-placeholder>"), ze = /* @__PURE__ */ g("<div class=solid-select-option>"), Ge = (l) => {
  const e = fe({
    multiple: !1,
    disabled: !1,
    optionToValue: (d) => d,
    isOptionDisabled: (d) => !1
  }, l), t = (d) => {
    if (e.multiple && Array.isArray(d))
      return d;
    if (!e.multiple && !Array.isArray(d))
      return d !== null ? [d] : [];
    throw new Error(`Incompatible value type for ${e.multiple ? "multple" : "single"} select.`);
  }, [r, n] = S(e.initialValue !== void 0 ? t(e.initialValue) : []), o = () => e.multiple ? r() : r()[0] || null, s = (d) => n(t(d)), a = () => n([]), i = () => !!(e.multiple ? o().length : o());
  R(F(r, () => e.onChange?.(o()), {
    defer: !0
  }));
  const [h, f] = S(""), p = () => f(""), C = () => !!h().length;
  R(F(h, (d) => e.onInput?.(d), {
    defer: !0
  })), R(F(h, (d) => {
    d && !_() && y(!0);
  }, {
    defer: !0
  }));
  const $ = typeof e.options == "function" ? be(() => e.options(h()), e.options(h())) : () => e.options, b = () => $().length, I = (d) => {
    if (e.isOptionDisabled(d)) return;
    const D = e.optionToValue(d);
    e.multiple ? s([...r(), D]) : (s(D), x(!1)), y(!1);
  }, [w, x] = S(!1), [_, y] = S(!1), H = () => y(!_()), [A, N] = S(-1), V = () => $()[A()], K = (d) => d === V(), j = (d) => {
    b() || N(-1);
    const D = b() - 1, z = d === "next" ? 1 : -1;
    let L = A() + z;
    L > D && (L = 0), L < 0 && (L = D), N(L);
  }, P = () => j("previous"), q = () => j("next");
  R(F($, (d) => {
    _() && N(Math.min(0, d.length - 1));
  }, {
    defer: !0
  })), R(F(() => e.disabled, (d) => {
    d && _() && y(!1);
  })), R(F(_, (d) => {
    d ? (A() === -1 && q(), x(!0)) : (A() > -1 && N(-1), f(""));
  }, {
    defer: !0
  })), R(F(A, (d) => {
    d > -1 && !_() && y(!0);
  }, {
    defer: !0
  }));
  const ie = () => x(!0), W = () => {
    x(!1), y(!1);
  }, te = (d) => d.preventDefault(), J = (d) => {
    !e.disabled && !C() && H();
  }, m = (d) => {
    f(d.target.value);
  }, v = (d) => {
    switch (d.key) {
      case "ArrowDown":
        q();
        break;
      case "ArrowUp":
        P();
        break;
      case "Enter":
        if (_() && V()) {
          I(V());
          break;
        }
        return;
      case "Escape":
        if (_()) {
          y(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (h())
          return;
        if (e.multiple) {
          const D = o();
          s([...D.slice(0, -1)]);
        } else
          a();
        break;
      case " ":
        if (h())
          return;
        _() ? V() && I(V()) : y(!0);
        break;
      case "Tab":
        if (V() && _()) {
          I(V());
          break;
        }
        return;
      default:
        return;
    }
    d.preventDefault(), d.stopPropagation();
  };
  return {
    options: $,
    value: o,
    setValue: s,
    hasValue: i,
    clearValue: a,
    inputValue: h,
    setInputValue: f,
    hasInputValue: C,
    clearInputValue: p,
    isOpen: _,
    setIsOpen: y,
    toggleOpen: H,
    isActive: w,
    setIsActive: x,
    get multiple() {
      return e.multiple;
    },
    get disabled() {
      return e.disabled;
    },
    pickOption: I,
    isOptionFocused: K,
    isOptionDisabled: e.isOptionDisabled,
    onFocusIn: ie,
    onFocusOut: W,
    onMouseDown: te,
    onClick: J,
    onInput: m,
    onKeyDown: v
  };
}, B = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, Ue = (l, e) => {
  let t = B.NO_MATCH, r = [];
  if (l.length <= e.length) {
    const n = Array.from(l.toLocaleLowerCase()), o = Array.from(e.toLocaleLowerCase());
    let s = B.START;
    e: for (let a = 0, i = 0; a < n.length; a++) {
      for (; i < o.length; )
        if (o[i] === n[a]) {
          r[i] = !0, s === B.MATCH && o[i - 1] === " " && o[i] !== " " && (s = B.WORD_START), t += s, s++, i++;
          continue e;
        } else
          s = B.MATCH, i++;
      t = B.NO_MATCH, r.length = 0;
    }
  }
  return {
    target: e,
    score: t,
    matches: r
  };
}, Ke = (l, e = (t) => (() => {
  var r = Fe();
  return c(r, t), r;
})()) => {
  const t = l.target, r = l.matches, n = "\0", o = [];
  let s = !1;
  for (let a = 0; a < t.length; a++) {
    const i = t[a], h = r[a];
    !s && h ? (o.push(n), s = !0) : s && !h && (o.push(n), s = !1), o.push(i);
  }
  return s && (o.push(n), s = !1), T(() => o.join("").split(n).map((a, i) => i % 2 ? e(a) : a));
}, We = (l, e, t) => {
  const r = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n], s = o[t], a = Ue(l, s);
    a.score && r.push({
      ...a,
      item: o,
      index: n
    });
  }
  return r.sort((n, o) => {
    let s = o.score - n.score;
    return s === 0 && (s = n.index - o.index), s;
  }), r;
}, Je = (l, e, t) => e === "label" ? [T(() => t.prefix), T(() => t.highlight ?? l)] : l, le = (l, e) => {
  const t = Object.assign({
    extractText: (i) => i.toString ? i.toString() : i,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const r = (i) => t.key ? i[t.key] : i, n = (i) => t.extractText(r(i)), o = (i, h, f) => {
    const p = r(i);
    return t.format ? t.format(p, h, f) : Je(p, h, f);
  }, s = (i) => t.disable(r(i));
  return {
    options: (i) => {
      let f = (typeof l == "function" ? l(i) : l).map((p) => ({
        value: p,
        label: o(p, "label", {}),
        text: n(p),
        disabled: s(p)
      }));
      if (t.filterable && i && (typeof t.filterable == "function" ? f = t.filterable(i, f) : f = We(i, f, "text").map((p) => ({
        ...p.item,
        label: o(p.item.value, "label", {
          highlight: Ke(p)
        })
      }))), t.createable !== void 0) {
        const p = i.trim(), C = f.some(($) => Qe(i, $.text));
        if (p) {
          let $;
          if (typeof t.createable == "function" ? t.createable.length === 1 && C || ($ = t.createable(p, C, f)) : C || ($ = t.key ? {
            [t.key]: p
          } : p), $ !== void 0) {
            const b = Array.isArray($) ? $ : [$], I = [];
            for (const w of b)
              I.push({
                value: w,
                label: o(w, "label", {
                  prefix: "Create "
                }),
                text: n(w),
                disabled: !1
              });
            f = [...f, ...I];
          }
        }
      }
      return f;
    },
    optionToValue: (i) => i.value,
    isOptionDisabled: (i) => i.disabled,
    format: (i, h) => h === "option" ? i.label : o(i, "value", {})
  };
}, Qe = (l, e) => l.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, ge = ue(), M = () => {
  const l = de(ge);
  if (!l) throw new Error("No SelectContext found in ancestry.");
  return l;
}, Q = (l) => {
  const [e, t] = $e(fe({
    format: (n, o) => n,
    placeholder: "Select...",
    readonly: typeof l.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, l), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), r = Ge(e);
  return R(F(() => t.initialValue, (n) => n !== void 0 && r.setValue(n))), u(ge.Provider, {
    value: r,
    get children() {
      return u(Xe, {
        get class() {
          return t.class;
        },
        get children() {
          return [u(Ye, {
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
          }), u(lt, {
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
}, Xe = (l) => {
  const e = M();
  return (() => {
    var t = Ne();
    return t.$$mousedown = (r) => {
      e.onMouseDown(r), r.currentTarget.getElementsByTagName("input")[0].focus();
    }, X(t, "focusout", e.onFocusOut, !0), X(t, "focusin", e.onFocusIn, !0), c(t, () => l.children), E((r) => {
      var n = `solid-select-container ${l.class !== void 0 ? l.class : ""}`, o = e.disabled;
      return n !== r.e && me(t, r.e = n), o !== r.t && O(t, "data-disabled", r.t = o), r;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, Ye = (l) => {
  const e = M(), t = (r) => {
    const n = e.value();
    e.setValue([...n.slice(0, r), ...n.slice(r + 1)]);
  };
  return (() => {
    var r = Ee();
    return X(r, "click", e.onClick, !0), c(r, u(k, {
      get when() {
        return T(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return u(Ze, {
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
        return u(et, {
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
        return u(U, {
          get each() {
            return e.value();
          },
          children: (n, o) => u(tt, {
            onRemove: () => t(o()),
            get children() {
              return l.format(n, "value");
            }
          })
        });
      }
    }), null), c(r, u(nt, {
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
    }), null), E((n) => {
      var o = e.multiple, s = e.hasValue(), a = e.disabled;
      return o !== n.e && O(r, "data-multiple", n.e = o), s !== n.t && O(r, "data-has-value", n.t = s), a !== n.a && O(r, "data-disabled", n.a = a), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
}, Ze = (l) => (() => {
  var e = je();
  return c(e, () => l.children), e;
})(), et = (l) => (() => {
  var e = Be();
  return c(e, () => l.children), e;
})(), tt = (l) => (M(), (() => {
  var e = Me(), t = e.firstChild, r = t.nextSibling;
  return c(t, () => l.children), r.$$click = (n) => {
    n.stopPropagation(), l.onRemove();
  }, e;
})()), nt = (l) => {
  const e = M();
  return (() => {
    var t = He();
    t.$$mousedown = (n) => {
      n.stopPropagation();
    }, t.$$keydown = (n) => {
      e.onKeyDown(n), n.defaultPrevented || n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
    }, X(t, "input", e.onInput, !0);
    var r = l.ref;
    return typeof r == "function" ? Y(r, t) : l.ref = t, E((n) => {
      var o = l.id, s = l.name, a = e.multiple, i = e.isActive(), h = l.autofocus, f = l.readonly, p = e.disabled;
      return o !== n.e && O(t, "id", n.e = o), s !== n.t && O(t, "name", n.t = s), a !== n.a && O(t, "data-multiple", n.a = a), i !== n.o && O(t, "data-is-active", n.o = i), h !== n.i && (t.autofocus = n.i = h), f !== n.n && (t.readOnly = n.n = f), p !== n.s && (t.disabled = n.s = p), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0
    }), E(() => t.value = e.inputValue()), t;
  })();
}, lt = (l) => {
  const e = M();
  return u(k, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = qe();
      return c(t, u(k, {
        get when() {
          return !l.loading;
        },
        get fallback() {
          return (() => {
            var r = se();
            return c(r, () => l.loadingPlaceholder), r;
          })();
        },
        get children() {
          return u(U, {
            get each() {
              return e.options();
            },
            get fallback() {
              return (() => {
                var r = se();
                return c(r, () => l.emptyPlaceholder), r;
              })();
            },
            children: (r) => u(rt, {
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
}, rt = (l) => {
  const e = M(), t = (r) => {
    R(() => {
      e.isOptionFocused(l.option) && r.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var r = ze();
    return r.$$click = () => e.pickOption(l.option), Y(t, r), c(r, () => l.children), E((n) => {
      var o = e.isOptionDisabled(l.option), s = e.isOptionFocused(l.option);
      return o !== n.e && O(r, "data-disabled", n.e = o), s !== n.t && O(r, "data-focused", n.t = s), n;
    }, {
      e: void 0,
      t: void 0
    }), r;
  })();
};
re(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var ot = /* @__PURE__ */ g("<h1>"), it = /* @__PURE__ */ g("<button>Search"), at = /* @__PURE__ */ g("<button>Collections"), st = /* @__PURE__ */ g("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), ct = /* @__PURE__ */ g("<p>Getting STAC Catalog"), ut = /* @__PURE__ */ g("<div class=StacSearchFilters><button>Search</button><button>Clear"), dt = /* @__PURE__ */ g("<p>Searching"), ft = /* @__PURE__ */ g("<p class=StacErrorText>ERROR SEARCHING STAC"), ht = /* @__PURE__ */ g("<div class=StacSearchResults>"), gt = /* @__PURE__ */ g("<button>Previous Page"), pt = /* @__PURE__ */ g("<span>Returned: "), vt = /* @__PURE__ */ g("<span>Limit: "), mt = /* @__PURE__ */ g("<span>Matched: "), $t = /* @__PURE__ */ g("<button>Next Page"), bt = /* @__PURE__ */ g("<div class=StacSearchPagingButtons>"), _t = /* @__PURE__ */ g("<div class=StacFeatureCollection>"), ce = /* @__PURE__ */ g("<p>"), St = /* @__PURE__ */ g("<div class=StacFeature><div><p></p><p></p><span><button>Select"), Ct = /* @__PURE__ */ g("<img class=stacFeatureThumbnail crossorigin=anonymous>"), xt = /* @__PURE__ */ g("<p>No Thumbnail");
function yt(l) {
  const {
    url: e,
    selectCallback: t
  } = l, [r] = Z(() => e, Ce), {
    setCallback: n
  } = ee();
  n(() => t);
  const [o, s] = S("collections");
  return (() => {
    var a = st(), i = a.firstChild, h = i.firstChild;
    return c(i, u(oe, {
      get fallback() {
        return ct();
      },
      get children() {
        var f = ot();
        return c(f, r), f;
      }
    }), h), c(h, u(k, {
      get when() {
        return o() === "collections";
      },
      get children() {
        var f = it();
        return f.$$click = () => s("search"), f;
      }
    }), null), c(h, u(k, {
      get when() {
        return o() === "search";
      },
      get children() {
        var f = at();
        return f.$$click = () => s("collections"), f;
      }
    }), null), c(a, u(k, {
      get when() {
        return o() === "search";
      },
      get children() {
        return u(kt, {
          url: e
        });
      }
    }), null), c(a, u(k, {
      get when() {
        return o() === "collections";
      },
      get children() {
        return u(Re, {
          url: e
        });
      }
    }), null), a;
  })();
}
function kt(l) {
  const {
    url: e
  } = l, t = `${e}/search`, [r, n] = S("", {
    equals: !1
  }), {
    collections: o,
    bbox: s,
    setBbox: a,
    intersects: i,
    setIntersects: h,
    datetime: f,
    setDatetime: p
  } = ee(), C = le(o().map((m) => m.id)), $ = le([], {
    createable: !0
  }), [b, I] = S([]), [w, x] = S([]), [_, y] = S(1e3), [H, A] = S(""), [N, V] = S(""), [K, j] = S(!1), [P, {
    refetch: q
  }] = Z(r, te);
  S("");
  const [ie, W] = S("");
  S("");
  async function te(m) {
    if (m.trim() === "") {
      j(!1);
      return;
    }
    j(!0);
    const v = new URL(m), d = {
      collections: b().join(","),
      limit: _()
    };
    if (w().length > 0 && (d.ids = w().join(",")), s()) {
      if (!It(s())) {
        W("StacSearchErrorInput");
        return;
      }
      W(""), d.bbox = s();
    }
    f() && console.log("datetime", f()), i() && console.log("intersects", i()), Object.entries(d).forEach(([G, ve]) => {
      v.searchParams.append(G, ve);
    });
    const z = await (await fetch(v, {
      method: "GET"
    })).json(), L = z.links.find((G) => G.rel === "next"), ae = z.links.find((G) => G.rel === "previous");
    return L?.href ? V(L.href) : V(""), ae?.href ? A(ae.href) : A(""), z;
  }
  async function J(m) {
    n(m), await q();
  }
  return [(() => {
    var m = ut(), v = m.firstChild, d = v.nextSibling;
    return c(m, u(Q, ne({
      placeholder: "Select Collections. (Leave blank for all)",
      onChange: I,
      multiple: !0
    }, C)), v), c(m, u(Q, {
      placeholder: "Select Limit",
      onChange: y,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), v), c(m, u(Q, ne({
      placeholder: "Add Item Ids",
      onChange: x,
      multiple: !0
    }, $)), v), v.$$click = () => {
      n(t), q(t);
    }, d.$$click = () => {
      V(""), A(""), j(!1), n("");
    }, m;
  })(), (() => {
    var m = ht();
    return c(m, u(k, {
      get when() {
        return P.loading;
      },
      get children() {
        return dt();
      }
    }), null), c(m, u(k, {
      get when() {
        return P.error;
      },
      get children() {
        return ft();
      }
    }), null), c(m, u(k, {
      get when() {
        return T(() => !!(K() && !P.loading && !P.error))() && P();
      },
      get children() {
        return u(wt, {
          get searchResults() {
            return P();
          }
        });
      }
    }), null), m;
  })(), (() => {
    var m = bt();
    return c(m, u(k, {
      get when() {
        return H().trim().length > 0;
      },
      get children() {
        var v = gt();
        return v.$$click = () => {
          J(H());
        }, v;
      }
    }), null), c(m, u(k, {
      get when() {
        return T(() => !!(K() && !P.loading && !P.error))() && P();
      },
      get children() {
        return [(() => {
          var v = pt();
          return v.firstChild, c(v, (() => {
            var d = T(() => !!P().context);
            return () => d() ? P().context.returned : "Not Listed";
          })(), null), v;
        })(), (() => {
          var v = vt();
          return v.firstChild, c(v, (() => {
            var d = T(() => !!P().context);
            return () => d() ? P().context.limit : "Not Listed";
          })(), null), v;
        })(), (() => {
          var v = mt();
          return v.firstChild, c(v, (() => {
            var d = T(() => !!P().context);
            return () => d() ? P().context.matched : "Not Listed";
          })(), null), v;
        })()];
      }
    }), null), c(m, u(k, {
      get when() {
        return N().trim().length > 0;
      },
      get children() {
        var v = $t();
        return v.$$click = () => {
          J(N());
        }, v;
      }
    }), null), m;
  })()];
}
function wt(l) {
  const {
    searchResults: e
  } = l;
  return u(Pt, {
    featureCollection: e
  });
}
function Pt(l) {
  const {
    featureCollection: e
  } = l;
  return (() => {
    var t = _t();
    return c(t, u(U, {
      get each() {
        return e.features;
      },
      children: (r) => u(pe, {
        feature: r
      })
    })), t;
  })();
}
function pe(l) {
  const {
    feature: e
  } = l, {
    callback: t
  } = ee();
  function r(i) {
    t()({
      asset: n(),
      feature: e
    });
  }
  const [n, o] = S(""), s = Object.entries(e.assets).map(([i, h]) => ({
    name: i,
    value: h
  })).filter((i) => i.name !== "thumbnail"), a = le(s, {
    key: "name"
  });
  return (() => {
    var i = St(), h = i.firstChild, f = h.firstChild, p = f.nextSibling, C = p.nextSibling, $ = C.firstChild;
    return c(i, (() => {
      var b = T(() => !!e.assets.thumbnail?.href);
      return () => b() ? (() => {
        var I = Ct();
        return E((w) => {
          var x = e.assets.thumbnail.href, _ = e.assets.thumbnail.title ? e.assets.thumbnail.title : "Thumbnail";
          return x !== w.e && O(I, "src", w.e = x), _ !== w.t && O(I, "alt", w.t = _), w;
        }, {
          e: void 0,
          t: void 0
        }), I;
      })() : xt();
    })(), h), h.style.setProperty("padding", "0.5rem"), c(f, () => "ID: " + e.id), c(p, () => "Bounding Box: " + e.bbox.join(", ")), c(h, u(k, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var b = ce();
        return c(b, () => e.properties.datetime ? "Date/Time: " + e.properties.datetime : ""), b;
      }
    }), C), c(h, u(k, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var b = ce();
        return c(b, () => e.properties.created ? "Creation Date: " + e.properties.created : ""), b;
      }
    }), C), c(C, u(Q, ne(a, {
      placeholder: "Select Asset",
      onChange: (b) => {
        o(b.value);
      }
    })), $), $.$$click = r, i;
  })();
}
function It(l) {
  const e = l.split(",").map((a) => parseFloat(a));
  if (e.length !== 4 || e.some((a) => isNaN(a)))
    return !1;
  const [t, r, n, o] = e;
  return !(t < -180 || t > 180 || n < -180 || n > 180 || r < -90 || r > 90 || o < -90 || o > 90 || t > n || r > o);
}
re(["click", "input"]);
function Vt(l) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: r,
    intersectsSignal: n,
    datetimeSignal: o
  } = l;
  return u(Se, {
    bboxSignal: r,
    intersectsSignal: n,
    datetimeSignal: o,
    get children() {
      return u(yt, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Vt as Stac
};
