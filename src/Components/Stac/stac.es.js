import { createComponent as u, delegateEvents as se, template as p, insert as a, use as ee, memo as F, effect as j, setAttribute as O, addEventListener as Y, className as _e, mergeProps as oe } from "solid-js/web";
import { createContext as he, createSignal as y, useContext as ge, createResource as te, createEffect as V, Suspense as ce, For as K, Switch as Se, Match as Ce, splitProps as xe, mergeProps as me, on as E, createMemo as ye, Show as P } from "solid-js";
const pe = he(void 0);
function ke() {
  const [r, e] = y([]), [t, l] = y(null);
  return {
    collections: r,
    setCollections: e,
    setCallback: l,
    callback: t
  };
}
const we = (r) => {
  const {
    collections: e,
    setCollections: t,
    callback: l,
    setCallback: n
  } = ke(), {
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
  const r = ge(pe);
  if (!r)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return r;
};
async function Pe(r) {
  return (await (await fetch(r + "/")).json()).id;
}
async function Re(r) {
  const { setCollections: e } = ne(), i = (await (await fetch(r + "/collections")).json()).collections;
  return e(i), i;
}
async function Ie(r) {
  return (await (await fetch(r)).json()).features;
}
function b() {
  if (localStorage.getItem("userLanguage") == "en") return !0;
}
function ve() {
  return b() ? "Search" : "FR_Search";
}
function Te() {
  return b() ? "Collections" : "FR_Collections";
}
function Fe() {
  return b() ? "Back" : "FR_Back";
}
function Oe() {
  return b() ? "Keywords: " : "FR_Keywords: ";
}
function Ae() {
  return b() ? "Getting STAC Catalog" : "FR_Getting STAC Catalog";
}
function Le() {
  return b() ? "License: " : "FR_License: ";
}
function Ve() {
  return b() ? "Select Asset" : "FR_Select Asset";
}
function De() {
  return b() ? "Add To Map" : "FR_Add To Map";
}
function Ne() {
  return b() ? "Select Collections. (Leave blank for all)" : "FR_Select Collections. (Leave blank for all)";
}
function Ee() {
  return b() ? "Select Limit" : "FR_Select Limit";
}
function Be() {
  return b() ? "Add Item Ids" : "FR_Add Item Ids";
}
function Me() {
  return b() ? "Searching" : "FR_Searching";
}
function je() {
  return b() ? "Error Searching STAC" : "FR_Error Searching STAC";
}
function qe() {
  return b() ? "Clear" : "FR_Clear";
}
function ze() {
  return b() ? "Previous Page" : "FR_Previous Page";
}
function He() {
  return b() ? "Next Page" : "FR_Next Page";
}
function Ge() {
  return b() ? "Returned: " : "FR_Returned: ";
}
function Ke() {
  return b() ? "Limit: " : "FR_Limit: ";
}
function Ue() {
  return b() ? "Matched: " : "FR_Matched: ";
}
function le() {
  return b() ? "Not Listed" : "FR_Not Listed";
}
function We() {
  return b() ? "Thumbnail" : "FR_Thumbnail";
}
function Je() {
  return b() ? "No Thumbnail" : "FR_No Thumbnail";
}
function ue() {
  return b() ? "ID: " : "FR_ID: ";
}
function Qe() {
  return b() ? "Bounding Box: " : "FR_Bounding Box: ";
}
function Xe() {
  return b() ? "Date/Time: " : "FR_Date/Time: ";
}
function Ye() {
  return b() ? "Creation Date: " : "FR_Creation Date: ";
}
var Ze = /* @__PURE__ */ p("<nav class=StacScroll>"), et = /* @__PURE__ */ p("<p>Getting STAC Response"), tt = /* @__PURE__ */ p("<div class=StacCollectionCard><h2></h2><p>"), nt = /* @__PURE__ */ p("<nav class=collectionPageScroll>"), rt = /* @__PURE__ */ p("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class></span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), lt = /* @__PURE__ */ p("<p>Getting Items"), it = /* @__PURE__ */ p("<div class=StacItems>");
function ot(r) {
  const {
    url: e
  } = r, [t, l] = y(!1), [n, i] = y(null), [c] = te(() => e, Re);
  let s, o;
  return V(() => {
    t() && s && o ? (s.classList.remove("collectionPage-hidden"), s.classList.add("collectionPage"), o.classList.remove("StacScroll"), o.classList.add("StacScroll-hidden"), s.focus()) : s && o && (s.classList.remove("collectionPage"), s.classList.add("collectionPage-hidden"), o.classList.remove("StacScroll-hidden"), o.classList.add("StacScroll"), s.focus());
  }), [u(ce, {
    get fallback() {
      return et();
    },
    get children() {
      var f = Ze(), d = o;
      return typeof d == "function" ? ee(d, f) : o = f, a(f, u(K, {
        get each() {
          return c();
        },
        children: (m) => u(at, {
          collection: m,
          setIsCollectionPage: l,
          setCollectionPage: i
        })
      })), f;
    }
  }), u(Se, {
    get children() {
      return u(Ce, {
        get when() {
          return t();
        },
        get children() {
          return u(st, {
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
      });
    }
  })];
}
function at(r) {
  const {
    collection: e,
    setIsCollectionPage: t,
    setCollectionPage: l
  } = r;
  function n() {
    l(e), t(!0);
  }
  return (() => {
    var i = tt(), c = i.firstChild, s = c.nextSibling;
    return c.$$click = n, a(c, () => e.title), a(s, () => `${ue()}${e.id}`), i;
  })();
}
function st(r) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: l,
    ref: n
  } = r;
  return (() => {
    var i = rt(), c = i.firstChild, s = c.firstChild, o = s.firstChild, f = o.firstChild, d = o.nextSibling, m = d.nextSibling, x = s.nextSibling, $ = x.nextSibling, k = $.nextSibling, _ = k.firstChild;
    _.firstChild;
    var R = _.nextSibling, I = R.nextSibling;
    return ee(n, i), o.$$click = () => {
      t(null), l(!1);
    }, a(f, Fe), a(m, () => `${ue()}${e ? e.id : ""}`), a(x, () => e ? e.title : ""), a($, () => e ? e.description : ""), a(_, () => `${Oe()}${e ? e.keywords?.join(", ") : ""}`, null), a(I, () => `${Le()}${e && e.license}`), a(i, u(ce, {
      get fallback() {
        return lt();
      },
      get children() {
        var v = nt();
        return a(v, (() => {
          var w = F(() => !!e?.links.find((A) => A.rel === "items"));
          return () => w() ? u(ct, {
            get url() {
              return e.links.find((A) => A.rel === "items").href;
            }
          }) : null;
        })()), v;
      }
    }), null), j((v) => {
      var w = e ? e.keywords?.join(", ") : "", A = e ? e.license : "";
      return w !== v.e && O(_, "title", v.e = w), A !== v.t && O(I, "title", v.t = A), v;
    }, {
      e: void 0,
      t: void 0
    }), i;
  })();
}
function ct(r) {
  const {
    url: e
  } = r, [t] = te(() => e, Ie);
  return (() => {
    var l = it();
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
var ut = /* @__PURE__ */ p("<mark>"), dt = /* @__PURE__ */ p("<div>"), ft = /* @__PURE__ */ p("<div class=solid-select-control>"), ht = /* @__PURE__ */ p("<div class=solid-select-placeholder>"), gt = /* @__PURE__ */ p("<div class=solid-select-single-value>"), mt = /* @__PURE__ */ p("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), pt = /* @__PURE__ */ p("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), vt = /* @__PURE__ */ p("<div class=solid-select-list>"), fe = /* @__PURE__ */ p("<div class=solid-select-list-placeholder>"), $t = /* @__PURE__ */ p("<div class=solid-select-option>"), bt = (r) => {
  const e = me({
    multiple: !1,
    disabled: !1,
    optionToValue: (h) => h,
    isOptionDisabled: (h) => !1
  }, r), t = (h) => {
    if (e.multiple && Array.isArray(h))
      return h;
    if (!e.multiple && !Array.isArray(h))
      return h !== null ? [h] : [];
    throw new Error(`Incompatible value type for ${e.multiple ? "multple" : "single"} select.`);
  }, [l, n] = y(e.initialValue !== void 0 ? t(e.initialValue) : []), i = () => e.multiple ? l() : l()[0] || null, c = (h) => n(t(h)), s = () => n([]), o = () => !!(e.multiple ? i().length : i());
  V(E(l, () => e.onChange?.(i()), {
    defer: !0
  }));
  const [f, d] = y(""), m = () => d(""), x = () => !!f().length;
  V(E(f, (h) => e.onInput?.(h), {
    defer: !0
  })), V(E(f, (h) => {
    h && !v() && w(!0);
  }, {
    defer: !0
  }));
  const $ = typeof e.options == "function" ? ye(() => e.options(f()), e.options(f())) : () => e.options, k = () => $().length, _ = (h) => {
    if (e.isOptionDisabled(h)) return;
    const L = e.optionToValue(h);
    e.multiple ? c([...l(), L]) : (c(L), I(!1)), w(!1);
  }, [R, I] = y(!1), [v, w] = y(!1), A = () => w(!v()), [D, N] = y(-1), C = () => $()[D()], U = (h) => h === C(), re = (h) => {
    k() || N(-1);
    const L = k() - 1, B = h === "next" ? 1 : -1;
    let M = D() + B;
    M > L && (M = 0), M < 0 && (M = L), N(M);
  }, W = () => re("previous"), J = () => re("next");
  V(E($, (h) => {
    v() && N(Math.min(0, h.length - 1));
  }, {
    defer: !0
  })), V(E(() => e.disabled, (h) => {
    h && v() && w(!1);
  })), V(E(v, (h) => {
    h ? (D() === -1 && J(), I(!0)) : (D() > -1 && N(-1), d(""));
  }, {
    defer: !0
  })), V(E(D, (h) => {
    h > -1 && !v() && w(!0);
  }, {
    defer: !0
  }));
  const Q = () => I(!0), S = () => {
    I(!1), w(!1);
  }, g = (h) => h.preventDefault(), T = (h) => {
    !e.disabled && !x() && A();
  }, de = (h) => {
    d(h.target.value);
  }, H = (h) => {
    switch (h.key) {
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
          w(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (f())
          return;
        if (e.multiple) {
          const L = i();
          c([...L.slice(0, -1)]);
        } else
          s();
        break;
      case " ":
        if (f())
          return;
        v() ? C() && _(C()) : w(!0);
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
    h.preventDefault(), h.stopPropagation();
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
    setIsOpen: w,
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
    onMouseDown: g,
    onClick: T,
    onInput: de,
    onKeyDown: H
  };
}, q = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, _t = (r, e) => {
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
}, St = (r, e = (t) => (() => {
  var l = ut();
  return a(l, t), l;
})()) => {
  const t = r.target, l = r.matches, n = "\0", i = [];
  let c = !1;
  for (let s = 0; s < t.length; s++) {
    const o = t[s], f = l[s];
    !c && f ? (i.push(n), c = !0) : c && !f && (i.push(n), c = !1), i.push(o);
  }
  return c && (i.push(n), c = !1), F(() => i.join("").split(n).map((s, o) => o % 2 ? e(s) : s));
}, Ct = (r, e, t) => {
  const l = [];
  for (let n = 0; n < e.length; n++) {
    const i = e[n], c = i[t], s = _t(r, c);
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
}, xt = (r, e, t) => e === "label" ? [F(() => t.prefix), F(() => t.highlight ?? r)] : r, ae = (r, e) => {
  const t = Object.assign({
    extractText: (o) => o.toString ? o.toString() : o,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const l = (o) => t.key ? o[t.key] : o, n = (o) => t.extractText(l(o)), i = (o, f, d) => {
    const m = l(o);
    return t.format ? t.format(m, f, d) : xt(m, f, d);
  }, c = (o) => t.disable(l(o));
  return {
    options: (o) => {
      let d = (typeof r == "function" ? r(o) : r).map((m) => ({
        value: m,
        label: i(m, "label", {}),
        text: n(m),
        disabled: c(m)
      }));
      if (t.filterable && o && (typeof t.filterable == "function" ? d = t.filterable(o, d) : d = Ct(o, d, "text").map((m) => ({
        ...m.item,
        label: i(m.item.value, "label", {
          highlight: St(m)
        })
      }))), t.createable !== void 0) {
        const m = o.trim(), x = d.some(($) => yt(o, $.text));
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
}, yt = (r, e) => r.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, $e = he(), z = () => {
  const r = ge($e);
  if (!r) throw new Error("No SelectContext found in ancestry.");
  return r;
}, X = (r) => {
  const [e, t] = xe(me({
    format: (n, i) => n,
    placeholder: "Select...",
    readonly: typeof r.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, r), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), l = bt(e);
  return V(E(() => t.initialValue, (n) => n !== void 0 && l.setValue(n))), u($e.Provider, {
    value: l,
    get children() {
      return u(kt, {
        get class() {
          return t.class;
        },
        get children() {
          return [u(wt, {
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
          }), u(Ft, {
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
}, kt = (r) => {
  const e = z();
  return (() => {
    var t = dt();
    return t.$$mousedown = (l) => {
      e.onMouseDown(l), l.currentTarget.getElementsByTagName("input")[0].focus();
    }, Y(t, "focusout", e.onFocusOut, !0), Y(t, "focusin", e.onFocusIn, !0), a(t, () => r.children), j((l) => {
      var n = `solid-select-container ${r.class !== void 0 ? r.class : ""}`, i = e.disabled;
      return n !== l.e && _e(t, l.e = n), i !== l.t && O(t, "data-disabled", l.t = i), l;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, wt = (r) => {
  const e = z(), t = (l) => {
    const n = e.value();
    e.setValue([...n.slice(0, l), ...n.slice(l + 1)]);
  };
  return (() => {
    var l = ft();
    return Y(l, "click", e.onClick, !0), a(l, u(P, {
      get when() {
        return F(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return u(Pt, {
          get children() {
            return r.placeholder;
          }
        });
      }
    }), null), a(l, u(P, {
      get when() {
        return F(() => !!(e.hasValue() && !e.multiple))() && !e.hasInputValue();
      },
      get children() {
        return u(Rt, {
          get children() {
            return r.format(e.value(), "value");
          }
        });
      }
    }), null), a(l, u(P, {
      get when() {
        return e.hasValue() && e.multiple;
      },
      get children() {
        return u(K, {
          get each() {
            return e.value();
          },
          children: (n, i) => u(It, {
            onRemove: () => t(i()),
            get children() {
              return r.format(n, "value");
            }
          })
        });
      }
    }), null), a(l, u(Tt, {
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
    }), null), j((n) => {
      var i = e.multiple, c = e.hasValue(), s = e.disabled;
      return i !== n.e && O(l, "data-multiple", n.e = i), c !== n.t && O(l, "data-has-value", n.t = c), s !== n.a && O(l, "data-disabled", n.a = s), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), l;
  })();
}, Pt = (r) => (() => {
  var e = ht();
  return a(e, () => r.children), e;
})(), Rt = (r) => (() => {
  var e = gt();
  return a(e, () => r.children), e;
})(), It = (r) => (z(), (() => {
  var e = mt(), t = e.firstChild, l = t.nextSibling;
  return a(t, () => r.children), l.$$click = (n) => {
    n.stopPropagation(), r.onRemove();
  }, e;
})()), Tt = (r) => {
  const e = z();
  return (() => {
    var t = pt();
    t.$$mousedown = (n) => {
      n.stopPropagation();
    }, t.$$keydown = (n) => {
      e.onKeyDown(n), n.defaultPrevented || n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
    }, Y(t, "input", e.onInput, !0);
    var l = r.ref;
    return typeof l == "function" ? ee(l, t) : r.ref = t, j((n) => {
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
    }), j(() => t.value = e.inputValue()), t;
  })();
}, Ft = (r) => {
  const e = z();
  return u(P, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = vt();
      return a(t, u(P, {
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
            children: (l) => u(Ot, {
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
}, Ot = (r) => {
  const e = z(), t = (l) => {
    V(() => {
      e.isOptionFocused(r.option) && l.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var l = $t();
    return l.$$click = () => e.pickOption(r.option), ee(t, l), a(l, () => r.children), j((n) => {
      var i = e.isOptionDisabled(r.option), c = e.isOptionFocused(r.option);
      return i !== n.e && O(l, "data-disabled", n.e = i), c !== n.t && O(l, "data-focused", n.t = c), n;
    }, {
      e: void 0,
      t: void 0
    }), l;
  })();
};
se(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var At = /* @__PURE__ */ p("<h1>"), Z = /* @__PURE__ */ p("<button>"), Lt = /* @__PURE__ */ p("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), G = /* @__PURE__ */ p("<p>"), Vt = /* @__PURE__ */ p("<div class=StacSearchFilters><button></button><button>"), Dt = /* @__PURE__ */ p("<p class=StacErrorText>"), Nt = /* @__PURE__ */ p("<div class=StacSearchResults>"), ie = /* @__PURE__ */ p("<span>"), Et = /* @__PURE__ */ p("<div class=StacSearchPagingButtons>"), Bt = /* @__PURE__ */ p("<div class=StacFeatureCollection>"), Mt = /* @__PURE__ */ p("<div class=StacFeature><div><p></p><p></p><div><button>"), jt = /* @__PURE__ */ p("<img class=stacFeatureThumbnail crossorigin=anonymous>");
function qt(r) {
  const {
    url: e,
    selectCallback: t
  } = r, [l] = te(() => e, Pe), {
    setCallback: n
  } = ne();
  n(() => t);
  const [i, c] = y("collections");
  return (() => {
    var s = Lt(), o = s.firstChild, f = o.firstChild;
    return a(o, u(ce, {
      get fallback() {
        return (() => {
          var d = G();
          return a(d, Ae), d;
        })();
      },
      get children() {
        var d = At();
        return a(d, l), d;
      }
    }), f), a(f, u(P, {
      get when() {
        return i() === "collections";
      },
      get children() {
        var d = Z();
        return d.$$click = () => c("search"), a(d, ve), d;
      }
    }), null), a(f, u(P, {
      get when() {
        return i() === "search";
      },
      get children() {
        var d = Z();
        return d.$$click = () => c("collections"), a(d, Te), d;
      }
    }), null), a(s, u(P, {
      get when() {
        return i() === "search";
      },
      get children() {
        return u(zt, {
          url: e
        });
      }
    }), null), a(s, u(P, {
      get when() {
        return i() === "collections";
      },
      get children() {
        return u(ot, {
          url: e
        });
      }
    }), null), s;
  })();
}
function zt(r) {
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
  }), [m, x] = y([]), [$, k] = y([]), [_, R] = y(1e3), [I, v] = y(""), [w, A] = y(""), [D, N] = y(!1), [C, {
    refetch: U
  }] = te(l, J), [re, W] = y("");
  async function J(S) {
    if (S.trim() === "") {
      N(!1);
      return;
    }
    N(!0);
    const g = new URL(S), T = {
      collections: m().join(","),
      limit: _()
    };
    if ($().length > 0 && (T.ids = $().join(",")), c()) {
      if (!Kt(c())) {
        W("StacSearchErrorInput");
        return;
      }
      W(""), T.bbox = c();
    }
    o() && console.log("datetime", o()), s() && console.log("intersects", s()), Object.entries(T).forEach(([B, M]) => {
      g.searchParams.append(B, M);
    });
    const H = await (await fetch(g, {
      method: "GET"
    })).json(), h = H.links.find((B) => B.rel === "next"), L = H.links.find((B) => B.rel === "previous");
    return h?.href ? A(h.href) : A(""), L?.href ? v(L.href) : v(""), H;
  }
  async function Q(S) {
    n(S), await U();
  }
  return [(() => {
    var S = Vt(), g = S.firstChild, T = g.nextSibling;
    return a(S, u(X, oe({
      get placeholder() {
        return Ne();
      },
      onChange: x,
      multiple: !0
    }, f)), g), a(S, u(X, {
      get placeholder() {
        return Ee();
      },
      onChange: R,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), g), a(S, u(X, oe({
      get placeholder() {
        return Be();
      },
      onChange: k,
      multiple: !0
    }, d)), g), g.$$click = () => {
      n(t), U(t);
    }, a(g, ve), T.$$click = () => {
      A(""), v(""), N(!1), n("");
    }, a(T, qe), S;
  })(), (() => {
    var S = Nt();
    return a(S, u(P, {
      get when() {
        return C.loading;
      },
      get children() {
        var g = G();
        return a(g, Me), g;
      }
    }), null), a(S, u(P, {
      get when() {
        return C.error;
      },
      get children() {
        var g = Dt();
        return a(g, je), g;
      }
    }), null), a(S, u(P, {
      get when() {
        return F(() => !!(D() && !C.loading && !C.error))() && C();
      },
      get children() {
        return u(Ht, {
          get searchResults() {
            return C();
          }
        });
      }
    }), null), S;
  })(), (() => {
    var S = Et();
    return a(S, u(P, {
      get when() {
        return I().trim().length > 0;
      },
      get children() {
        var g = Z();
        return g.$$click = () => {
          Q(I());
        }, a(g, ze), g;
      }
    }), null), a(S, u(P, {
      get when() {
        return F(() => !!(D() && !C.loading && !C.error))() && C();
      },
      get children() {
        return [(() => {
          var g = ie();
          return a(g, Ge, null), a(g, (() => {
            var T = F(() => !!C().context);
            return () => T() ? C().context.returned : le();
          })(), null), g;
        })(), (() => {
          var g = ie();
          return a(g, Ke, null), a(g, (() => {
            var T = F(() => !!C().context);
            return () => T() ? C().context.limit : le();
          })(), null), g;
        })(), (() => {
          var g = ie();
          return a(g, Ue, null), a(g, (() => {
            var T = F(() => !!C().context);
            return () => T() ? C().context.matched : le();
          })(), null), g;
        })()];
      }
    }), null), a(S, u(P, {
      get when() {
        return w().trim().length > 0;
      },
      get children() {
        var g = Z();
        return g.$$click = () => {
          Q(w());
        }, a(g, He), g;
      }
    }), null), S;
  })()];
}
function Ht(r) {
  const {
    searchResults: e
  } = r;
  return u(Gt, {
    featureCollection: e
  });
}
function Gt(r) {
  const {
    featureCollection: e
  } = r;
  return (() => {
    var t = Bt();
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
    var o = Mt(), f = o.firstChild, d = f.firstChild, m = d.nextSibling, x = m.nextSibling, $ = x.firstChild;
    return a(o, (() => {
      var k = F(() => !!e.assets.thumbnail?.href);
      return () => k() ? (() => {
        var _ = jt();
        return j((R) => {
          var I = e.assets.thumbnail.href, v = e.assets.thumbnail.title ? e.assets.thumbnail.title : We();
          return I !== R.e && O(_, "src", R.e = I), v !== R.t && O(_, "alt", R.t = v), R;
        }, {
          e: void 0,
          t: void 0
        }), _;
      })() : (() => {
        var _ = G();
        return a(_, Je), _;
      })();
    })(), f), f.style.setProperty("padding", "0.5rem"), a(d, () => ue() + e.id), a(m, () => Qe() + e.bbox.join(", ")), a(f, u(P, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var k = G();
        return a(k, (() => {
          var _ = F(() => !!e.properties.datetime);
          return () => _() ? Xe() + e.properties.datetime : "";
        })()), k;
      }
    }), x), a(f, u(P, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var k = G();
        return a(k, (() => {
          var _ = F(() => !!e.properties.created);
          return () => _() ? Ye() + e.properties.created : "";
        })()), k;
      }
    }), x), x.style.setProperty("display", "grid"), x.style.setProperty("grid-template-columns", "75% 25%"), a(x, u(X, oe(s, {
      get placeholder() {
        return Ve();
      },
      onChange: (k) => {
        i(k.value);
      }
    })), $), $.$$click = l, a($, De), o;
  })();
}
function Kt(r) {
  const e = r.split(",").map((s) => parseFloat(s));
  if (e.length !== 4 || e.some((s) => isNaN(s)))
    return !1;
  const [t, l, n, i] = e;
  return !(t < -180 || t > 180 || n < -180 || n > 180 || l < -90 || l > 90 || i < -90 || i > 90 || t > n || l > i);
}
se(["click", "input"]);
function Jt(r) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: l,
    intersectsSignal: n,
    datetimeSignal: i
  } = r;
  return u(we, {
    bboxSignal: l,
    intersectsSignal: n,
    datetimeSignal: i,
    get children() {
      return u(qt, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Jt as Stac
};
