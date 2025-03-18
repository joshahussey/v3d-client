import { createComponent as u, delegateEvents as se, template as p, insert as a, use as ee, memo as F, effect as M, setAttribute as O, addEventListener as Y, className as _e, mergeProps as oe } from "solid-js/web";
import { createContext as ge, createSignal as y, useContext as he, createResource as te, createEffect as L, Suspense as ce, For as K, Show as w, splitProps as Se, mergeProps as me, on as B, createMemo as Ce } from "solid-js";
const pe = ge(void 0);
function xe() {
  const [r, e] = y([]), [t, l] = y(null);
  return {
    collections: r,
    setCollections: e,
    setCallback: l,
    callback: t
  };
}
const ye = (r) => {
  const {
    collections: e,
    setCollections: t,
    callback: l,
    setCallback: n
  } = xe(), {
    bboxSignal: i,
    intersectsSignal: c,
    datetimeSignal: s
  } = r, [o, f] = i, [d, m] = c, [x, $] = s;
  return u(pe.Provider, {
    value: {
      collections: e,
      setCollections: t,
      callback: l,
      setCallback: n,
      bbox: o,
      setBbox: f,
      intersects: d,
      setIntersects: m,
      datetime: x,
      setDatetime: $
    },
    get children() {
      return r.children;
    }
  });
}, ne = () => {
  const r = he(pe);
  if (!r)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return r;
};
async function ke(r) {
  return (await (await fetch(r + "/")).json()).id;
}
async function we(r) {
  const { setCollections: e } = ne(), i = (await (await fetch(r + "/collections")).json()).collections;
  return e(i), i;
}
async function Pe(r) {
  return (await (await fetch(r)).json()).features;
}
function b() {
  if (localStorage.getItem("userLanguage") == "en") return !0;
}
function ve() {
  return b() ? "Search" : "FR_Search";
}
function Re() {
  return b() ? "Collections" : "FR_Collections";
}
function Ie() {
  return b() ? "Back" : "FR_Back";
}
function Te() {
  return b() ? "Keywords: " : "FR_Keywords: ";
}
function Fe() {
  return b() ? "Getting STAC Catalog" : "FR_Getting STAC Catalog";
}
function Oe() {
  return b() ? "License: " : "FR_License: ";
}
function Ae() {
  return b() ? "Select Asset" : "FR_Select Asset";
}
function Ve() {
  return b() ? "Add To Map" : "FR_Add To Map";
}
function Le() {
  return b() ? "Select Collections. (Leave blank for all)" : "FR_Select Collections. (Leave blank for all)";
}
function De() {
  return b() ? "Select Limit" : "FR_Select Limit";
}
function Ne() {
  return b() ? "Add Item Ids" : "FR_Add Item Ids";
}
function Be() {
  return b() ? "Searching" : "FR_Searching";
}
function Ee() {
  return b() ? "Error Searching STAC" : "FR_Error Searching STAC";
}
function je() {
  return b() ? "Clear" : "FR_Clear";
}
function Me() {
  return b() ? "Previous Page" : "FR_Previous Page";
}
function qe() {
  return b() ? "Next Page" : "FR_Next Page";
}
function ze() {
  return b() ? "Returned: " : "FR_Returned: ";
}
function He() {
  return b() ? "Limit: " : "FR_Limit: ";
}
function Ge() {
  return b() ? "Matched: " : "FR_Matched: ";
}
function le() {
  return b() ? "Not Listed" : "FR_Not Listed";
}
function Ke() {
  return b() ? "Thumbnail" : "FR_Thumbnail";
}
function Ue() {
  return b() ? "No Thumbnail" : "FR_No Thumbnail";
}
function ue() {
  return b() ? "ID: " : "FR_ID: ";
}
function We() {
  return b() ? "Bounding Box: " : "FR_Bounding Box: ";
}
function Je() {
  return b() ? "Date/Time: " : "FR_Date/Time";
}
function Qe() {
  return b() ? "Creation Date: " : "FR_Creation Date: ";
}
var Xe = /* @__PURE__ */ p("<nav class=StacScroll>"), Ye = /* @__PURE__ */ p("<p>Getting STAC Response"), Ze = /* @__PURE__ */ p("<div class=StacCollectionCard><h2></h2><p>"), et = /* @__PURE__ */ p("<nav class=collectionPageScroll>"), tt = /* @__PURE__ */ p("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class></span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), nt = /* @__PURE__ */ p("<p>Getting Items"), rt = /* @__PURE__ */ p("<div class=StacItems>");
function lt(r) {
  const {
    url: e
  } = r, [t, l] = y(!1), [n, i] = y(null), [c] = te(() => e, we);
  let s, o;
  return L(() => {
    t() && s && o ? (s.classList.remove("collectionPage-hidden"), s.classList.add("collectionPage"), s.style.top = `${o.getBoundingClientRect().top}px`, s.focus()) : s && o && (s.classList.remove("collectionPage"), s.classList.add("collectionPage-hidden"), s.style.top = `${o.getBoundingClientRect().top}px`, s.focus());
  }), [u(ce, {
    get fallback() {
      return Ye();
    },
    get children() {
      var f = Xe(), d = o;
      return typeof d == "function" ? ee(d, f) : o = f, a(f, u(K, {
        get each() {
          return c();
        },
        children: (m) => u(it, {
          collection: m,
          setIsCollectionPage: l,
          setCollectionPage: i
        })
      })), f;
    }
  }), u(w, {
    get when() {
      return t();
    },
    get children() {
      return u(ot, {
        ref(f) {
          var d = s;
          typeof d == "function" ? d(f) : s = f;
        },
        get collection() {
          return n();
        },
        setCollectionPage: i,
        setIsCollectionPage: l
      });
    }
  })];
}
function it(r) {
  const {
    collection: e,
    setIsCollectionPage: t,
    setCollectionPage: l
  } = r;
  function n() {
    l(e), t(!0);
  }
  return (() => {
    var i = Ze(), c = i.firstChild, s = c.nextSibling;
    return c.$$click = n, a(c, () => e.title), a(s, () => `${ue()}${e.id}`), i;
  })();
}
function ot(r) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: l,
    ref: n
  } = r;
  return (() => {
    var i = tt(), c = i.firstChild, s = c.firstChild, o = s.firstChild, f = o.firstChild, d = o.nextSibling, m = d.nextSibling, x = s.nextSibling, $ = x.nextSibling, k = $.nextSibling, _ = k.firstChild;
    _.firstChild;
    var R = _.nextSibling, I = R.nextSibling;
    return ee(n, i), o.$$click = () => {
      t(null), l(!1);
    }, a(f, Ie), a(m, () => `${ue()}${e ? e.id : ""}`), a(x, () => e ? e.title : ""), a($, () => e ? e.description : ""), a(_, () => `${Te()}${e ? e.keywords?.join(", ") : ""}`, null), a(I, () => `${Oe()}${e && e.license}`), a(i, u(ce, {
      get fallback() {
        return nt();
      },
      get children() {
        var v = et();
        return a(v, (() => {
          var P = F(() => !!e?.links.find((A) => A.rel === "items"));
          return () => P() ? u(at, {
            get url() {
              return e.links.find((A) => A.rel === "items").href;
            }
          }) : null;
        })()), v;
      }
    }), null), M((v) => {
      var P = e ? e.keywords?.join(", ") : "", A = e ? e.license : "";
      return P !== v.e && O(_, "title", v.e = P), A !== v.t && O(I, "title", v.t = A), v;
    }, {
      e: void 0,
      t: void 0
    }), i;
  })();
}
function at(r) {
  const {
    url: e
  } = r, [t] = te(() => e, Pe);
  return (() => {
    var l = rt();
    return a(l, u(K, {
      get each() {
        return t();
      },
      children: (n) => u(be, {
        feature: n
      })
    })), l;
  })();
}
se(["click"]);
var st = /* @__PURE__ */ p("<mark>"), ct = /* @__PURE__ */ p("<div>"), ut = /* @__PURE__ */ p("<div class=solid-select-control>"), dt = /* @__PURE__ */ p("<div class=solid-select-placeholder>"), ft = /* @__PURE__ */ p("<div class=solid-select-single-value>"), gt = /* @__PURE__ */ p("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), ht = /* @__PURE__ */ p("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), mt = /* @__PURE__ */ p("<div class=solid-select-list>"), fe = /* @__PURE__ */ p("<div class=solid-select-list-placeholder>"), pt = /* @__PURE__ */ p("<div class=solid-select-option>"), vt = (r) => {
  const e = me({
    multiple: !1,
    disabled: !1,
    optionToValue: (g) => g,
    isOptionDisabled: (g) => !1
  }, r), t = (g) => {
    if (e.multiple && Array.isArray(g))
      return g;
    if (!e.multiple && !Array.isArray(g))
      return g !== null ? [g] : [];
    throw new Error(`Incompatible value type for ${e.multiple ? "multple" : "single"} select.`);
  }, [l, n] = y(e.initialValue !== void 0 ? t(e.initialValue) : []), i = () => e.multiple ? l() : l()[0] || null, c = (g) => n(t(g)), s = () => n([]), o = () => !!(e.multiple ? i().length : i());
  L(B(l, () => e.onChange?.(i()), {
    defer: !0
  }));
  const [f, d] = y(""), m = () => d(""), x = () => !!f().length;
  L(B(f, (g) => e.onInput?.(g), {
    defer: !0
  })), L(B(f, (g) => {
    g && !v() && P(!0);
  }, {
    defer: !0
  }));
  const $ = typeof e.options == "function" ? Ce(() => e.options(f()), e.options(f())) : () => e.options, k = () => $().length, _ = (g) => {
    if (e.isOptionDisabled(g)) return;
    const V = e.optionToValue(g);
    e.multiple ? c([...l(), V]) : (c(V), I(!1)), P(!1);
  }, [R, I] = y(!1), [v, P] = y(!1), A = () => P(!v()), [D, N] = y(-1), C = () => $()[D()], U = (g) => g === C(), re = (g) => {
    k() || N(-1);
    const V = k() - 1, E = g === "next" ? 1 : -1;
    let j = D() + E;
    j > V && (j = 0), j < 0 && (j = V), N(j);
  }, W = () => re("previous"), J = () => re("next");
  L(B($, (g) => {
    v() && N(Math.min(0, g.length - 1));
  }, {
    defer: !0
  })), L(B(() => e.disabled, (g) => {
    g && v() && P(!1);
  })), L(B(v, (g) => {
    g ? (D() === -1 && J(), I(!0)) : (D() > -1 && N(-1), d(""));
  }, {
    defer: !0
  })), L(B(D, (g) => {
    g > -1 && !v() && P(!0);
  }, {
    defer: !0
  }));
  const Q = () => I(!0), S = () => {
    I(!1), P(!1);
  }, h = (g) => g.preventDefault(), T = (g) => {
    !e.disabled && !x() && A();
  }, de = (g) => {
    d(g.target.value);
  }, H = (g) => {
    switch (g.key) {
      case "ArrowDown":
        J();
        break;
      case "ArrowUp":
        W();
        break;
      case "Enter":
        if (v() && C()) {
          _(C());
          break;
        }
        return;
      case "Escape":
        if (v()) {
          P(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (f())
          return;
        if (e.multiple) {
          const V = i();
          c([...V.slice(0, -1)]);
        } else
          s();
        break;
      case " ":
        if (f())
          return;
        v() ? C() && _(C()) : P(!0);
        break;
      case "Tab":
        if (C() && v()) {
          _(C());
          break;
        }
        return;
      default:
        return;
    }
    g.preventDefault(), g.stopPropagation();
  };
  return {
    options: $,
    value: i,
    setValue: c,
    hasValue: o,
    clearValue: s,
    inputValue: f,
    setInputValue: d,
    hasInputValue: x,
    clearInputValue: m,
    isOpen: v,
    setIsOpen: P,
    toggleOpen: A,
    isActive: R,
    setIsActive: I,
    get multiple() {
      return e.multiple;
    },
    get disabled() {
      return e.disabled;
    },
    pickOption: _,
    isOptionFocused: U,
    isOptionDisabled: e.isOptionDisabled,
    onFocusIn: Q,
    onFocusOut: S,
    onMouseDown: h,
    onClick: T,
    onInput: de,
    onKeyDown: H
  };
}, q = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, $t = (r, e) => {
  let t = q.NO_MATCH, l = [];
  if (r.length <= e.length) {
    const n = Array.from(r.toLocaleLowerCase()), i = Array.from(e.toLocaleLowerCase());
    let c = q.START;
    e: for (let s = 0, o = 0; s < n.length; s++) {
      for (; o < i.length; )
        if (i[o] === n[s]) {
          l[o] = !0, c === q.MATCH && i[o - 1] === " " && i[o] !== " " && (c = q.WORD_START), t += c, c++, o++;
          continue e;
        } else
          c = q.MATCH, o++;
      t = q.NO_MATCH, l.length = 0;
    }
  }
  return {
    target: e,
    score: t,
    matches: l
  };
}, bt = (r, e = (t) => (() => {
  var l = st();
  return a(l, t), l;
})()) => {
  const t = r.target, l = r.matches, n = "\0", i = [];
  let c = !1;
  for (let s = 0; s < t.length; s++) {
    const o = t[s], f = l[s];
    !c && f ? (i.push(n), c = !0) : c && !f && (i.push(n), c = !1), i.push(o);
  }
  return c && (i.push(n), c = !1), F(() => i.join("").split(n).map((s, o) => o % 2 ? e(s) : s));
}, _t = (r, e, t) => {
  const l = [];
  for (let n = 0; n < e.length; n++) {
    const i = e[n], c = i[t], s = $t(r, c);
    s.score && l.push({
      ...s,
      item: i,
      index: n
    });
  }
  return l.sort((n, i) => {
    let c = i.score - n.score;
    return c === 0 && (c = n.index - i.index), c;
  }), l;
}, St = (r, e, t) => e === "label" ? [F(() => t.prefix), F(() => t.highlight ?? r)] : r, ae = (r, e) => {
  const t = Object.assign({
    extractText: (o) => o.toString ? o.toString() : o,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const l = (o) => t.key ? o[t.key] : o, n = (o) => t.extractText(l(o)), i = (o, f, d) => {
    const m = l(o);
    return t.format ? t.format(m, f, d) : St(m, f, d);
  }, c = (o) => t.disable(l(o));
  return {
    options: (o) => {
      let d = (typeof r == "function" ? r(o) : r).map((m) => ({
        value: m,
        label: i(m, "label", {}),
        text: n(m),
        disabled: c(m)
      }));
      if (t.filterable && o && (typeof t.filterable == "function" ? d = t.filterable(o, d) : d = _t(o, d, "text").map((m) => ({
        ...m.item,
        label: i(m.item.value, "label", {
          highlight: bt(m)
        })
      }))), t.createable !== void 0) {
        const m = o.trim(), x = d.some(($) => Ct(o, $.text));
        if (m) {
          let $;
          if (typeof t.createable == "function" ? t.createable.length === 1 && x || ($ = t.createable(m, x, d)) : x || ($ = t.key ? {
            [t.key]: m
          } : m), $ !== void 0) {
            const k = Array.isArray($) ? $ : [$], _ = [];
            for (const R of k)
              _.push({
                value: R,
                label: i(R, "label", {
                  prefix: "Create "
                }),
                text: n(R),
                disabled: !1
              });
            d = [...d, ..._];
          }
        }
      }
      return d;
    },
    optionToValue: (o) => o.value,
    isOptionDisabled: (o) => o.disabled,
    format: (o, f) => f === "option" ? o.label : i(o, "value", {})
  };
}, Ct = (r, e) => r.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, $e = ge(), z = () => {
  const r = he($e);
  if (!r) throw new Error("No SelectContext found in ancestry.");
  return r;
}, X = (r) => {
  const [e, t] = Se(me({
    format: (n, i) => n,
    placeholder: "Select...",
    readonly: typeof r.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, r), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), l = vt(e);
  return L(B(() => t.initialValue, (n) => n !== void 0 && l.setValue(n))), u($e.Provider, {
    value: l,
    get children() {
      return u(xt, {
        get class() {
          return t.class;
        },
        get children() {
          return [u(yt, {
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
              var i = r.ref;
              typeof i == "function" ? i(n) : r.ref = n;
            }
          }), u(It, {
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
}, xt = (r) => {
  const e = z();
  return (() => {
    var t = ct();
    return t.$$mousedown = (l) => {
      e.onMouseDown(l), l.currentTarget.getElementsByTagName("input")[0].focus();
    }, Y(t, "focusout", e.onFocusOut, !0), Y(t, "focusin", e.onFocusIn, !0), a(t, () => r.children), M((l) => {
      var n = `solid-select-container ${r.class !== void 0 ? r.class : ""}`, i = e.disabled;
      return n !== l.e && _e(t, l.e = n), i !== l.t && O(t, "data-disabled", l.t = i), l;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, yt = (r) => {
  const e = z(), t = (l) => {
    const n = e.value();
    e.setValue([...n.slice(0, l), ...n.slice(l + 1)]);
  };
  return (() => {
    var l = ut();
    return Y(l, "click", e.onClick, !0), a(l, u(w, {
      get when() {
        return F(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return u(kt, {
          get children() {
            return r.placeholder;
          }
        });
      }
    }), null), a(l, u(w, {
      get when() {
        return F(() => !!(e.hasValue() && !e.multiple))() && !e.hasInputValue();
      },
      get children() {
        return u(wt, {
          get children() {
            return r.format(e.value(), "value");
          }
        });
      }
    }), null), a(l, u(w, {
      get when() {
        return e.hasValue() && e.multiple;
      },
      get children() {
        return u(K, {
          get each() {
            return e.value();
          },
          children: (n, i) => u(Pt, {
            onRemove: () => t(i()),
            get children() {
              return r.format(n, "value");
            }
          })
        });
      }
    }), null), a(l, u(Rt, {
      get id() {
        return r.id;
      },
      get name() {
        return r.name;
      },
      get autofocus() {
        return r.autofocus;
      },
      get readonly() {
        return r.readonly;
      },
      ref(n) {
        var i = r.ref;
        typeof i == "function" ? i(n) : r.ref = n;
      }
    }), null), M((n) => {
      var i = e.multiple, c = e.hasValue(), s = e.disabled;
      return i !== n.e && O(l, "data-multiple", n.e = i), c !== n.t && O(l, "data-has-value", n.t = c), s !== n.a && O(l, "data-disabled", n.a = s), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), l;
  })();
}, kt = (r) => (() => {
  var e = dt();
  return a(e, () => r.children), e;
})(), wt = (r) => (() => {
  var e = ft();
  return a(e, () => r.children), e;
})(), Pt = (r) => (z(), (() => {
  var e = gt(), t = e.firstChild, l = t.nextSibling;
  return a(t, () => r.children), l.$$click = (n) => {
    n.stopPropagation(), r.onRemove();
  }, e;
})()), Rt = (r) => {
  const e = z();
  return (() => {
    var t = ht();
    t.$$mousedown = (n) => {
      n.stopPropagation();
    }, t.$$keydown = (n) => {
      e.onKeyDown(n), n.defaultPrevented || n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
    }, Y(t, "input", e.onInput, !0);
    var l = r.ref;
    return typeof l == "function" ? ee(l, t) : r.ref = t, M((n) => {
      var i = r.id, c = r.name, s = e.multiple, o = e.isActive(), f = r.autofocus, d = r.readonly, m = e.disabled;
      return i !== n.e && O(t, "id", n.e = i), c !== n.t && O(t, "name", n.t = c), s !== n.a && O(t, "data-multiple", n.a = s), o !== n.o && O(t, "data-is-active", n.o = o), f !== n.i && (t.autofocus = n.i = f), d !== n.n && (t.readOnly = n.n = d), m !== n.s && (t.disabled = n.s = m), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0
    }), M(() => t.value = e.inputValue()), t;
  })();
}, It = (r) => {
  const e = z();
  return u(w, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = mt();
      return a(t, u(w, {
        get when() {
          return !r.loading;
        },
        get fallback() {
          return (() => {
            var l = fe();
            return a(l, () => r.loadingPlaceholder), l;
          })();
        },
        get children() {
          return u(K, {
            get each() {
              return e.options();
            },
            get fallback() {
              return (() => {
                var l = fe();
                return a(l, () => r.emptyPlaceholder), l;
              })();
            },
            children: (l) => u(Tt, {
              option: l,
              get children() {
                return r.format(l, "option");
              }
            })
          });
        }
      })), t;
    }
  });
}, Tt = (r) => {
  const e = z(), t = (l) => {
    L(() => {
      e.isOptionFocused(r.option) && l.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var l = pt();
    return l.$$click = () => e.pickOption(r.option), ee(t, l), a(l, () => r.children), M((n) => {
      var i = e.isOptionDisabled(r.option), c = e.isOptionFocused(r.option);
      return i !== n.e && O(l, "data-disabled", n.e = i), c !== n.t && O(l, "data-focused", n.t = c), n;
    }, {
      e: void 0,
      t: void 0
    }), l;
  })();
};
se(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var Ft = /* @__PURE__ */ p("<h1>"), Z = /* @__PURE__ */ p("<button>"), Ot = /* @__PURE__ */ p("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), G = /* @__PURE__ */ p("<p>"), At = /* @__PURE__ */ p("<div class=StacSearchFilters><button></button><button>"), Vt = /* @__PURE__ */ p("<p class=StacErrorText>"), Lt = /* @__PURE__ */ p("<div class=StacSearchResults>"), ie = /* @__PURE__ */ p("<span>"), Dt = /* @__PURE__ */ p("<div class=StacSearchPagingButtons>"), Nt = /* @__PURE__ */ p("<div class=StacFeatureCollection>"), Bt = /* @__PURE__ */ p("<div class=StacFeature><div><p></p><p></p><span><button>"), Et = /* @__PURE__ */ p("<img class=stacFeatureThumbnail crossorigin=anonymous>");
function jt(r) {
  const {
    url: e,
    selectCallback: t
  } = r, [l] = te(() => e, ke), {
    setCallback: n
  } = ne();
  n(() => t);
  const [i, c] = y("collections");
  return (() => {
    var s = Ot(), o = s.firstChild, f = o.firstChild;
    return a(o, u(ce, {
      get fallback() {
        return (() => {
          var d = G();
          return a(d, Fe), d;
        })();
      },
      get children() {
        var d = Ft();
        return a(d, l), d;
      }
    }), f), a(f, u(w, {
      get when() {
        return i() === "collections";
      },
      get children() {
        var d = Z();
        return d.$$click = () => c("search"), a(d, ve), d;
      }
    }), null), a(f, u(w, {
      get when() {
        return i() === "search";
      },
      get children() {
        var d = Z();
        return d.$$click = () => c("collections"), a(d, Re), d;
      }
    }), null), a(s, u(w, {
      get when() {
        return i() === "search";
      },
      get children() {
        return u(Mt, {
          url: e
        });
      }
    }), null), a(s, u(w, {
      get when() {
        return i() === "collections";
      },
      get children() {
        return u(lt, {
          url: e
        });
      }
    }), null), s;
  })();
}
function Mt(r) {
  const {
    url: e
  } = r, t = `${e}/search`, [l, n] = y("", {
    equals: !1
  }), {
    collections: i,
    bbox: c,
    //setBbox,
    intersects: s,
    //setIntersects,
    datetime: o
    //setDatetime,
  } = ne(), f = ae(i().map((S) => S.id)), d = ae([], {
    createable: !0
  }), [m, x] = y([]), [$, k] = y([]), [_, R] = y(1e3), [I, v] = y(""), [P, A] = y(""), [D, N] = y(!1), [C, {
    refetch: U
  }] = te(l, J), [re, W] = y("");
  async function J(S) {
    if (S.trim() === "") {
      N(!1);
      return;
    }
    N(!0);
    const h = new URL(S), T = {
      collections: m().join(","),
      limit: _()
    };
    if ($().length > 0 && (T.ids = $().join(",")), c()) {
      if (!Ht(c())) {
        W("StacSearchErrorInput");
        return;
      }
      W(""), T.bbox = c();
    }
    o() && console.log("datetime", o()), s() && console.log("intersects", s()), Object.entries(T).forEach(([E, j]) => {
      h.searchParams.append(E, j);
    });
    const H = await (await fetch(h, {
      method: "GET"
    })).json(), g = H.links.find((E) => E.rel === "next"), V = H.links.find((E) => E.rel === "previous");
    return g?.href ? A(g.href) : A(""), V?.href ? v(V.href) : v(""), H;
  }
  async function Q(S) {
    n(S), await U();
  }
  return [(() => {
    var S = At(), h = S.firstChild, T = h.nextSibling;
    return a(S, u(X, oe({
      get placeholder() {
        return Le();
      },
      onChange: x,
      multiple: !0
    }, f)), h), a(S, u(X, {
      get placeholder() {
        return De();
      },
      onChange: R,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), h), a(S, u(X, oe({
      get placeholder() {
        return Ne();
      },
      onChange: k,
      multiple: !0
    }, d)), h), h.$$click = () => {
      n(t), U(t);
    }, a(h, ve), T.$$click = () => {
      A(""), v(""), N(!1), n("");
    }, a(T, je), S;
  })(), (() => {
    var S = Lt();
    return a(S, u(w, {
      get when() {
        return C.loading;
      },
      get children() {
        var h = G();
        return a(h, Be), h;
      }
    }), null), a(S, u(w, {
      get when() {
        return C.error;
      },
      get children() {
        var h = Vt();
        return a(h, Ee), h;
      }
    }), null), a(S, u(w, {
      get when() {
        return F(() => !!(D() && !C.loading && !C.error))() && C();
      },
      get children() {
        return u(qt, {
          get searchResults() {
            return C();
          }
        });
      }
    }), null), S;
  })(), (() => {
    var S = Dt();
    return a(S, u(w, {
      get when() {
        return I().trim().length > 0;
      },
      get children() {
        var h = Z();
        return h.$$click = () => {
          Q(I());
        }, a(h, Me), h;
      }
    }), null), a(S, u(w, {
      get when() {
        return F(() => !!(D() && !C.loading && !C.error))() && C();
      },
      get children() {
        return [(() => {
          var h = ie();
          return a(h, ze, null), a(h, (() => {
            var T = F(() => !!C().context);
            return () => T() ? C().context.returned : le();
          })(), null), h;
        })(), (() => {
          var h = ie();
          return a(h, He, null), a(h, (() => {
            var T = F(() => !!C().context);
            return () => T() ? C().context.limit : le();
          })(), null), h;
        })(), (() => {
          var h = ie();
          return a(h, Ge, null), a(h, (() => {
            var T = F(() => !!C().context);
            return () => T() ? C().context.matched : le();
          })(), null), h;
        })()];
      }
    }), null), a(S, u(w, {
      get when() {
        return P().trim().length > 0;
      },
      get children() {
        var h = Z();
        return h.$$click = () => {
          Q(P());
        }, a(h, qe), h;
      }
    }), null), S;
  })()];
}
function qt(r) {
  const {
    searchResults: e
  } = r;
  return u(zt, {
    featureCollection: e
  });
}
function zt(r) {
  const {
    featureCollection: e
  } = r;
  return (() => {
    var t = Nt();
    return a(t, u(K, {
      get each() {
        return e.features;
      },
      children: (l) => u(be, {
        feature: l
      })
    })), t;
  })();
}
function be(r) {
  const {
    feature: e
  } = r, {
    callback: t
  } = ne();
  function l(o) {
    t()({
      asset: n(),
      feature: e
    });
  }
  const [n, i] = y(""), c = Object.entries(e.assets).map(([o, f]) => ({
    name: o,
    value: f
  })).filter((o) => o.name !== "thumbnail"), s = ae(c, {
    key: "name"
  });
  return (() => {
    var o = Bt(), f = o.firstChild, d = f.firstChild, m = d.nextSibling, x = m.nextSibling, $ = x.firstChild;
    return a(o, (() => {
      var k = F(() => !!e.assets.thumbnail?.href);
      return () => k() ? (() => {
        var _ = Et();
        return M((R) => {
          var I = e.assets.thumbnail.href, v = e.assets.thumbnail.title ? e.assets.thumbnail.title : Ke();
          return I !== R.e && O(_, "src", R.e = I), v !== R.t && O(_, "alt", R.t = v), R;
        }, {
          e: void 0,
          t: void 0
        }), _;
      })() : (() => {
        var _ = G();
        return a(_, Ue), _;
      })();
    })(), f), f.style.setProperty("padding", "0.5rem"), a(d, () => ue() + e.id), a(m, () => We() + e.bbox.join(", ")), a(f, u(w, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var k = G();
        return a(k, (() => {
          var _ = F(() => !!e.properties.datetime);
          return () => _() ? Je() + e.properties.datetime : "";
        })()), k;
      }
    }), x), a(f, u(w, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var k = G();
        return a(k, (() => {
          var _ = F(() => !!e.properties.created);
          return () => _() ? Qe() + e.properties.created : "";
        })()), k;
      }
    }), x), a(x, u(X, oe(s, {
      get placeholder() {
        return Ae();
      },
      onChange: (k) => {
        i(k.value);
      }
    })), $), $.$$click = l, a($, Ve), o;
  })();
}
function Ht(r) {
  const e = r.split(",").map((s) => parseFloat(s));
  if (e.length !== 4 || e.some((s) => isNaN(s)))
    return !1;
  const [t, l, n, i] = e;
  return !(t < -180 || t > 180 || n < -180 || n > 180 || l < -90 || l > 90 || i < -90 || i > 90 || t > n || l > i);
}
se(["click", "input"]);
function Ut(r) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: l,
    intersectsSignal: n,
    datetimeSignal: i
  } = r;
  return u(ye, {
    bboxSignal: l,
    intersectsSignal: n,
    datetimeSignal: i,
    get children() {
      return u(jt, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Ut as Stac
};
