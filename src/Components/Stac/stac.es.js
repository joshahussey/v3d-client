import { createComponent as c, delegateEvents as we, template as $, insert as o, use as se, memo as E, effect as F, setAttribute as A, addEventListener as ge, className as xe, mergeProps as Pe } from "solid-js/web";
import { createContext as Oe, createSignal as y, useContext as Ae, createResource as _e, createEffect as J, Suspense as Re, For as ce, Switch as Ve, Match as me, splitProps as Me, mergeProps as De, on as ee, createMemo as Ge, Show as O } from "solid-js";
const Ee = Oe(void 0);
function Je() {
  const [r, e] = y([]), [t, l] = y(null);
  return {
    collections: r,
    setCollections: e,
    setCallback: l,
    callback: t
  };
}
const qe = (r) => {
  const {
    collections: e,
    setCollections: t,
    callback: l,
    setCallback: n
  } = Je(), {
    bboxSignal: i,
    intersectsSignal: u,
    datetimeSignal: s
  } = r, [a, f] = i, [d, m] = u, [x, S] = s;
  return c(Ee.Provider, {
    value: {
      collections: e,
      setCollections: t,
      callback: l,
      setCallback: n,
      bbox: a,
      setBbox: f,
      intersects: d,
      setIntersects: m,
      datetime: x,
      setDatetime: S
    },
    get children() {
      return r.children;
    }
  });
}, ye = () => {
  const r = Ae(Ee);
  if (!r)
    throw new Error("useStacContext must be used within a StateContextProvider");
  return r;
};
async function ze(r) {
  return (await (await fetch(r + "/")).json()).id;
}
async function He(r) {
  const { setCollections: e } = ye(), i = (await (await fetch(r + "/collections")).json()).collections;
  return e(i), i;
}
async function Ke(r) {
  return (await (await fetch(r)).json()).features;
}
function v() {
  if (localStorage.getItem("userLanguage") == "en" || localStorage.getItem("userLanguage") == null)
    return !0;
}
function Ne() {
  return v() ? "Search" : "FR_Search";
}
function Ue() {
  return v() ? "Collections" : "FR_Collections";
}
function We() {
  return v() ? "Back" : "FR_Back";
}
function Ze() {
  return v() ? "Keywords: " : "FR_Keywords: ";
}
function Qe() {
  return v() ? "Getting STAC Catalog" : "FR_Getting STAC Catalog";
}
function Xe() {
  return v() ? "License: " : "FR_License: ";
}
function Ye() {
  return v() ? "Select Asset" : "FR_Select Asset";
}
function et() {
  return v() ? "Add To Map" : "FR_Add To Map";
}
function tt() {
  return v() ? "Select Collections. (Leave blank for all)" : "FR_Select Collections. (Leave blank for all)";
}
function nt() {
  return v() ? "Select Limit" : "FR_Select Limit";
}
function rt() {
  return v() ? "Add Item Ids" : "FR_Add Item Ids";
}
function lt() {
  return v() ? "Searching" : "FR_Searching";
}
function it() {
  return v() ? "Error Searching STAC" : "FR_Error Searching STAC";
}
function ot() {
  return v() ? "Clear" : "FR_Clear";
}
function at() {
  return v() ? "Previous Page" : "FR_Previous Page";
}
function st() {
  return v() ? "Next Page" : "FR_Next Page";
}
function ct() {
  return v() ? "Returned: " : "FR_Returned: ";
}
function ut() {
  return v() ? "Limit: " : "FR_Limit: ";
}
function dt() {
  return v() ? "Matched: " : "FR_Matched: ";
}
function Se() {
  return v() ? "Not Listed" : "FR_Not Listed";
}
function ft() {
  return v() ? "Thumbnail" : "FR_Thumbnail";
}
function gt() {
  return v() ? "No Thumbnail" : "FR_No Thumbnail";
}
function Ie() {
  return v() ? "ID: " : "FR_ID: ";
}
function ht() {
  return v() ? "Bounding Box: " : "FR_Bounding Box: ";
}
function pt() {
  return v() ? "Date/Time: " : "FR_Date/Time: ";
}
function vt() {
  return v() ? "Creation Date: " : "FR_Creation Date: ";
}
function Le() {
  return v() ? "Intersects..." : "FR_Intersects...";
}
function mt() {
  return v() ? "None" : "FR_None";
}
function $t() {
  return v() ? "Point" : "FR_Point";
}
function bt() {
  return v() ? "Polygon" : "FR_Polygon";
}
function _t() {
  return v() ? "Latitude: " : "FR_Latitude: ";
}
function yt() {
  return v() ? "Longitude: " : "FR_Longitude: ";
}
function St() {
  return v() ? "Add Vertex" : "FR_AddVertex";
}
function Ct() {
  return v() ? "Current Intersects: " : "FR_Current Intersects: ";
}
function xt() {
  return v() ? "Custom" : "FR_Custom";
}
function Pt() {
  return v() ? "Custom GeoJson Expression" : "FR_Custom GeoJson Expression";
}
var kt = /* @__PURE__ */ $("<nav class=StacScroll>"), wt = /* @__PURE__ */ $("<p>Getting STAC Response"), Rt = /* @__PURE__ */ $("<div class=StacCollectionCard><h2></h2><p>"), It = /* @__PURE__ */ $("<nav class=collectionPageScroll>"), Tt = /* @__PURE__ */ $("<div class=collectionPage-hidden><div class=collectionPageInfo><div class=collectionPageInfoTopDiv><button><span class></span></button> <p></p></div><h3></h3><p class=collectionPageDescription></p><div class=collectionPageInfoBottomDiv><p class=collectionPageInfoBottomKeywordsLabel> </p><p></p><p class=collectionPageInfoBottomLicenseLabel>"), Lt = /* @__PURE__ */ $("<p>Getting Items"), Ft = /* @__PURE__ */ $("<div class=StacItems>");
function Ot(r) {
  const {
    url: e
  } = r, [t, l] = y(!1), [n, i] = y(null), [u] = _e(() => e, He);
  let s, a;
  return J(() => {
    t() && s && a ? (s.classList.remove("collectionPage-hidden"), s.classList.add("collectionPage"), a.classList.remove("StacScroll"), a.classList.add("StacScroll-hidden"), s.focus()) : s && a && (s.classList.remove("collectionPage"), s.classList.add("collectionPage-hidden"), a.classList.remove("StacScroll-hidden"), a.classList.add("StacScroll"), s.focus());
  }), [c(Re, {
    get fallback() {
      return wt();
    },
    get children() {
      var f = kt(), d = a;
      return typeof d == "function" ? se(d, f) : a = f, o(f, c(ce, {
        get each() {
          return u();
        },
        children: (m) => c(At, {
          collection: m,
          setIsCollectionPage: l,
          setCollectionPage: i
        })
      })), f;
    }
  }), c(Ve, {
    get children() {
      return c(me, {
        get when() {
          return t();
        },
        get children() {
          return c(Vt, {
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
function At(r) {
  const {
    collection: e,
    setIsCollectionPage: t,
    setCollectionPage: l
  } = r;
  function n() {
    l(e), t(!0);
  }
  return (() => {
    var i = Rt(), u = i.firstChild, s = u.nextSibling;
    return u.$$click = n, o(u, () => e.title), o(s, () => `${Ie()}${e.id}`), i;
  })();
}
function Vt(r) {
  const {
    collection: e,
    setCollectionPage: t,
    setIsCollectionPage: l,
    ref: n
  } = r;
  return (() => {
    var i = Tt(), u = i.firstChild, s = u.firstChild, a = s.firstChild, f = a.firstChild, d = a.nextSibling, m = d.nextSibling, x = s.nextSibling, S = x.nextSibling, _ = S.nextSibling, h = _.firstChild;
    h.firstChild;
    var C = h.nextSibling, I = C.nextSibling;
    return se(n, i), a.$$click = () => {
      t(null), l(!1);
    }, o(f, We), o(m, () => `${Ie()}${e ? e.id : ""}`), o(x, () => e ? e.title : ""), o(S, () => e ? e.description : ""), o(h, () => `${Ze()}${e ? e.keywords?.join(", ") : ""}`, null), o(I, () => `${Xe()}${e && e.license}`), o(i, c(Re, {
      get fallback() {
        return Lt();
      },
      get children() {
        var b = It();
        return o(b, (() => {
          var w = E(() => !!e?.links.find((V) => V.rel === "items"));
          return () => w() ? c(Dt, {
            get url() {
              return e.links.find((V) => V.rel === "items").href;
            }
          }) : null;
        })()), b;
      }
    }), null), F((b) => {
      var w = e ? e.keywords?.join(", ") : "", V = e ? e.license : "";
      return w !== b.e && A(h, "title", b.e = w), V !== b.t && A(I, "title", b.t = V), b;
    }, {
      e: void 0,
      t: void 0
    }), i;
  })();
}
function Dt(r) {
  const {
    url: e
  } = r, [t] = _e(() => e, Ke);
  return (() => {
    var l = Ft();
    return o(l, c(ce, {
      get each() {
        return t();
      },
      children: (n) => c(je, {
        feature: n
      })
    })), l;
  })();
}
we(["click"]);
var Et = /* @__PURE__ */ $("<mark>"), Nt = /* @__PURE__ */ $("<div>"), Bt = /* @__PURE__ */ $("<div class=solid-select-control>"), jt = /* @__PURE__ */ $("<div class=solid-select-placeholder>"), Mt = /* @__PURE__ */ $("<div class=solid-select-single-value>"), Gt = /* @__PURE__ */ $("<div class=solid-select-multi-value><span></span><button type=button class=solid-select-multi-value-remove>⨯"), Jt = /* @__PURE__ */ $("<input class=solid-select-input type=text tabindex=0 autocomplete=off autocapitalize=none autocorrect=off size=1>"), qt = /* @__PURE__ */ $("<div class=solid-select-list>"), Fe = /* @__PURE__ */ $("<div class=solid-select-list-placeholder>"), zt = /* @__PURE__ */ $("<div class=solid-select-option>"), Ht = (r) => {
  const e = De({
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
  }, [l, n] = y(e.initialValue !== void 0 ? t(e.initialValue) : []), i = () => e.multiple ? l() : l()[0] || null, u = (g) => n(t(g)), s = () => n([]), a = () => !!(e.multiple ? i().length : i());
  J(ee(l, () => e.onChange?.(i()), {
    defer: !0
  }));
  const [f, d] = y(""), m = () => d(""), x = () => !!f().length;
  J(ee(f, (g) => e.onInput?.(g), {
    defer: !0
  })), J(ee(f, (g) => {
    g && !b() && w(!0);
  }, {
    defer: !0
  }));
  const S = typeof e.options == "function" ? Ge(() => e.options(f()), e.options(f())) : () => e.options, _ = () => S().length, h = (g) => {
    if (e.isOptionDisabled(g)) return;
    const j = e.optionToValue(g);
    e.multiple ? u([...l(), j]) : (u(j), I(!1)), w(!1);
  }, [C, I] = y(!1), [b, w] = y(!1), V = () => w(!b()), [N, H] = y(-1), D = () => S()[N()], te = (g) => g === D(), W = (g) => {
    _() || H(-1);
    const j = _() - 1, le = g === "next" ? 1 : -1;
    let q = N() + le;
    q > j && (q = 0), q < 0 && (q = j), H(q);
  }, R = () => W("previous"), Z = () => W("next");
  J(ee(S, (g) => {
    b() && H(Math.min(0, g.length - 1));
  }, {
    defer: !0
  })), J(ee(() => e.disabled, (g) => {
    g && b() && w(!1);
  })), J(ee(b, (g) => {
    g ? (N() === -1 && Z(), I(!0)) : (N() > -1 && H(-1), d(""));
  }, {
    defer: !0
  })), J(ee(N, (g) => {
    g > -1 && !b() && w(!0);
  }, {
    defer: !0
  }));
  const re = () => I(!0), P = () => {
    I(!1), w(!1);
  }, B = (g) => g.preventDefault(), K = (g) => {
    !e.disabled && !x() && V();
  }, U = (g) => {
    d(g.target.value);
  }, G = (g) => {
    switch (g.key) {
      case "ArrowDown":
        Z();
        break;
      case "ArrowUp":
        R();
        break;
      case "Enter":
        if (b() && D()) {
          h(D());
          break;
        }
        return;
      case "Escape":
        if (b()) {
          w(!1);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (f())
          return;
        if (e.multiple) {
          const j = i();
          u([...j.slice(0, -1)]);
        } else
          s();
        break;
      case " ":
        if (f())
          return;
        b() ? D() && h(D()) : w(!0);
        break;
      case "Tab":
        if (D() && b()) {
          h(D());
          break;
        }
        return;
      default:
        return;
    }
    g.preventDefault(), g.stopPropagation();
  };
  return {
    options: S,
    value: i,
    setValue: u,
    hasValue: a,
    clearValue: s,
    inputValue: f,
    setInputValue: d,
    hasInputValue: x,
    clearInputValue: m,
    isOpen: b,
    setIsOpen: w,
    toggleOpen: V,
    isActive: C,
    setIsActive: I,
    get multiple() {
      return e.multiple;
    },
    get disabled() {
      return e.disabled;
    },
    pickOption: h,
    isOptionFocused: te,
    isOptionDisabled: e.isOptionDisabled,
    onFocusIn: re,
    onFocusOut: P,
    onMouseDown: B,
    onClick: K,
    onInput: U,
    onKeyDown: G
  };
}, ae = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3
}, Kt = (r, e) => {
  let t = ae.NO_MATCH, l = [];
  if (r.length <= e.length) {
    const n = Array.from(r.toLocaleLowerCase()), i = Array.from(e.toLocaleLowerCase());
    let u = ae.START;
    e: for (let s = 0, a = 0; s < n.length; s++) {
      for (; a < i.length; )
        if (i[a] === n[s]) {
          l[a] = !0, u === ae.MATCH && i[a - 1] === " " && i[a] !== " " && (u = ae.WORD_START), t += u, u++, a++;
          continue e;
        } else
          u = ae.MATCH, a++;
      t = ae.NO_MATCH, l.length = 0;
    }
  }
  return {
    target: e,
    score: t,
    matches: l
  };
}, Ut = (r, e = (t) => (() => {
  var l = Et();
  return o(l, t), l;
})()) => {
  const t = r.target, l = r.matches, n = "\0", i = [];
  let u = !1;
  for (let s = 0; s < t.length; s++) {
    const a = t[s], f = l[s];
    !u && f ? (i.push(n), u = !0) : u && !f && (i.push(n), u = !1), i.push(a);
  }
  return u && (i.push(n), u = !1), E(() => i.join("").split(n).map((s, a) => a % 2 ? e(s) : s));
}, Wt = (r, e, t) => {
  const l = [];
  for (let n = 0; n < e.length; n++) {
    const i = e[n], u = i[t], s = Kt(r, u);
    s.score && l.push({
      ...s,
      item: i,
      index: n
    });
  }
  return l.sort((n, i) => {
    let u = i.score - n.score;
    return u === 0 && (u = n.index - i.index), u;
  }), l;
}, Zt = (r, e, t) => e === "label" ? [E(() => t.prefix), E(() => t.highlight ?? r)] : r, ke = (r, e) => {
  const t = Object.assign({
    extractText: (a) => a.toString ? a.toString() : a,
    filterable: !0,
    disable: () => !1
  }, e || {});
  t.key && e && (e.format || e.disable || e.extractText), typeof t.createable == "function" && t.createable.length;
  const l = (a) => t.key ? a[t.key] : a, n = (a) => t.extractText(l(a)), i = (a, f, d) => {
    const m = l(a);
    return t.format ? t.format(m, f, d) : Zt(m, f, d);
  }, u = (a) => t.disable(l(a));
  return {
    options: (a) => {
      let d = (typeof r == "function" ? r(a) : r).map((m) => ({
        value: m,
        label: i(m, "label", {}),
        text: n(m),
        disabled: u(m)
      }));
      if (t.filterable && a && (typeof t.filterable == "function" ? d = t.filterable(a, d) : d = Wt(a, d, "text").map((m) => ({
        ...m.item,
        label: i(m.item.value, "label", {
          highlight: Ut(m)
        })
      }))), t.createable !== void 0) {
        const m = a.trim(), x = d.some((S) => Qt(a, S.text));
        if (m) {
          let S;
          if (typeof t.createable == "function" ? t.createable.length === 1 && x || (S = t.createable(m, x, d)) : x || (S = t.key ? {
            [t.key]: m
          } : m), S !== void 0) {
            const _ = Array.isArray(S) ? S : [S], h = [];
            for (const C of _)
              h.push({
                value: C,
                label: i(C, "label", {
                  prefix: "Create "
                }),
                text: n(C),
                disabled: !1
              });
            d = [...d, ...h];
          }
        }
      }
      return d;
    },
    optionToValue: (a) => a.value,
    isOptionDisabled: (a) => a.disabled,
    format: (a, f) => f === "option" ? a.label : i(a, "value", {})
  };
}, Qt = (r, e) => r.localeCompare(e, void 0, {
  sensitivity: "base"
}) === 0, Be = Oe(), ue = () => {
  const r = Ae(Be);
  if (!r) throw new Error("No SelectContext found in ancestry.");
  return r;
}, $e = (r) => {
  const [e, t] = Me(De({
    format: (n, i) => n,
    placeholder: "Select...",
    readonly: typeof r.options != "function",
    loading: !1,
    loadingPlaceholder: "Loading...",
    emptyPlaceholder: "No options"
  }, r), ["options", "optionToValue", "isOptionDisabled", "multiple", "disabled", "onInput", "onChange"]), l = Ht(e);
  return J(ee(() => t.initialValue, (n) => n !== void 0 && l.setValue(n))), c(Be.Provider, {
    value: l,
    get children() {
      return c(Xt, {
        get class() {
          return t.class;
        },
        get children() {
          return [c(Yt, {
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
          }), c(ln, {
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
}, Xt = (r) => {
  const e = ue();
  return (() => {
    var t = Nt();
    return t.$$mousedown = (l) => {
      e.onMouseDown(l), l.currentTarget.getElementsByTagName("input")[0].focus();
    }, ge(t, "focusout", e.onFocusOut, !0), ge(t, "focusin", e.onFocusIn, !0), o(t, () => r.children), F((l) => {
      var n = `solid-select-container ${r.class !== void 0 ? r.class : ""}`, i = e.disabled;
      return n !== l.e && xe(t, l.e = n), i !== l.t && A(t, "data-disabled", l.t = i), l;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}, Yt = (r) => {
  const e = ue(), t = (l) => {
    const n = e.value();
    e.setValue([...n.slice(0, l), ...n.slice(l + 1)]);
  };
  return (() => {
    var l = Bt();
    return ge(l, "click", e.onClick, !0), o(l, c(O, {
      get when() {
        return E(() => !e.hasValue())() && !e.hasInputValue();
      },
      get children() {
        return c(en, {
          get children() {
            return r.placeholder;
          }
        });
      }
    }), null), o(l, c(O, {
      get when() {
        return E(() => !!(e.hasValue() && !e.multiple))() && !e.hasInputValue();
      },
      get children() {
        return c(tn, {
          get children() {
            return r.format(e.value(), "value");
          }
        });
      }
    }), null), o(l, c(O, {
      get when() {
        return e.hasValue() && e.multiple;
      },
      get children() {
        return c(ce, {
          get each() {
            return e.value();
          },
          children: (n, i) => c(nn, {
            onRemove: () => t(i()),
            get children() {
              return r.format(n, "value");
            }
          })
        });
      }
    }), null), o(l, c(rn, {
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
    }), null), F((n) => {
      var i = e.multiple, u = e.hasValue(), s = e.disabled;
      return i !== n.e && A(l, "data-multiple", n.e = i), u !== n.t && A(l, "data-has-value", n.t = u), s !== n.a && A(l, "data-disabled", n.a = s), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), l;
  })();
}, en = (r) => (() => {
  var e = jt();
  return o(e, () => r.children), e;
})(), tn = (r) => (() => {
  var e = Mt();
  return o(e, () => r.children), e;
})(), nn = (r) => (ue(), (() => {
  var e = Gt(), t = e.firstChild, l = t.nextSibling;
  return o(t, () => r.children), l.$$click = (n) => {
    n.stopPropagation(), r.onRemove();
  }, e;
})()), rn = (r) => {
  const e = ue();
  return (() => {
    var t = Jt();
    t.$$mousedown = (n) => {
      n.stopPropagation();
    }, t.$$keydown = (n) => {
      e.onKeyDown(n), n.defaultPrevented || n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
    }, ge(t, "input", e.onInput, !0);
    var l = r.ref;
    return typeof l == "function" ? se(l, t) : r.ref = t, F((n) => {
      var i = r.id, u = r.name, s = e.multiple, a = e.isActive(), f = r.autofocus, d = r.readonly, m = e.disabled;
      return i !== n.e && A(t, "id", n.e = i), u !== n.t && A(t, "name", n.t = u), s !== n.a && A(t, "data-multiple", n.a = s), a !== n.o && A(t, "data-is-active", n.o = a), f !== n.i && (t.autofocus = n.i = f), d !== n.n && (t.readOnly = n.n = d), m !== n.s && (t.disabled = n.s = m), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0
    }), F(() => t.value = e.inputValue()), t;
  })();
}, ln = (r) => {
  const e = ue();
  return c(O, {
    get when() {
      return e.isOpen();
    },
    get children() {
      var t = qt();
      return o(t, c(O, {
        get when() {
          return !r.loading;
        },
        get fallback() {
          return (() => {
            var l = Fe();
            return o(l, () => r.loadingPlaceholder), l;
          })();
        },
        get children() {
          return c(ce, {
            get each() {
              return e.options();
            },
            get fallback() {
              return (() => {
                var l = Fe();
                return o(l, () => r.emptyPlaceholder), l;
              })();
            },
            children: (l) => c(on, {
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
}, on = (r) => {
  const e = ue(), t = (l) => {
    J(() => {
      e.isOptionFocused(r.option) && l.scrollIntoView({
        block: "nearest"
      });
    });
  };
  return (() => {
    var l = zt();
    return l.$$click = () => e.pickOption(r.option), se(t, l), o(l, () => r.children), F((n) => {
      var i = e.isOptionDisabled(r.option), u = e.isOptionFocused(r.option);
      return i !== n.e && A(l, "data-disabled", n.e = i), u !== n.t && A(l, "data-focused", n.t = u), n;
    }, {
      e: void 0,
      t: void 0
    }), l;
  })();
};
we(["focusin", "focusout", "mousedown", "click", "input", "keydown"]);
var an = /* @__PURE__ */ $("<h1>"), be = /* @__PURE__ */ $("<button>"), sn = /* @__PURE__ */ $("<div class=StacCard id=StacRoot><div class=StacHeader><div class=StacNavigationSelector>"), fe = /* @__PURE__ */ $("<p>"), cn = /* @__PURE__ */ $("<div>"), un = /* @__PURE__ */ $('<div class><div><button></button><button></button><button></button><input type=datetime-local placeholder=Datetime step=1><input placeholder="Bbox: minx, miny, maxx, maxy">'), dn = /* @__PURE__ */ $("<p class=StacErrorText>"), fn = /* @__PURE__ */ $("<div class=StacSearchResults>"), Ce = /* @__PURE__ */ $("<span>"), gn = /* @__PURE__ */ $("<div class=StacSearchPagingButtons>"), hn = /* @__PURE__ */ $("<div class=StacFeatureCollection>"), pn = /* @__PURE__ */ $("<div class=StacFeature><div><p></p><p></p><div><button>"), vn = /* @__PURE__ */ $("<img class=stacFeatureThumbnail crossorigin=anonymous>"), mn = /* @__PURE__ */ $("<div><label><input type=text></label><label><input type=text>"), $n = /* @__PURE__ */ $("<div><button>"), bn = /* @__PURE__ */ $("<textarea>"), _n = /* @__PURE__ */ $("<div class=dialog-backdrop><div class=dialog-content><div><label><input type=radio value=none></label><label><input type=radio value=point></label><label><input type=radio value=polygon></label><label><input type=radio value=custom></label></div></div><div><div><button>Cancel</button><button>Save"), yn = /* @__PURE__ */ $("<div><label>Lat:<input type=text></label><label>Lon:<input type=text>");
function Sn(r) {
  const {
    url: e,
    selectCallback: t
  } = r, [l] = _e(() => e, ze), {
    setCallback: n
  } = ye();
  n(() => t);
  const [i, u] = y("collections");
  return (() => {
    var s = sn(), a = s.firstChild, f = a.firstChild;
    return o(a, c(Re, {
      get fallback() {
        return (() => {
          var d = fe();
          return o(d, Qe), d;
        })();
      },
      get children() {
        var d = an();
        return o(d, l), d;
      }
    }), f), o(f, c(O, {
      get when() {
        return i() === "collections";
      },
      get children() {
        var d = be();
        return d.$$click = () => u("search"), o(d, Ne), d;
      }
    }), null), o(f, c(O, {
      get when() {
        return i() === "search";
      },
      get children() {
        var d = be();
        return d.$$click = () => u("collections"), o(d, Ue), d;
      }
    }), null), o(s, c(O, {
      get when() {
        return i() === "search";
      },
      get children() {
        return c(Cn, {
          url: e
        });
      }
    }), null), o(s, c(O, {
      get when() {
        return i() === "collections";
      },
      get children() {
        return c(Ot, {
          url: e
        });
      }
    }), null), s;
  })();
}
function Cn(r) {
  const {
    url: e
  } = r, t = `${e}/search`, [l, n] = y("", {
    equals: !1
  }), {
    collections: i,
    bbox: u,
    setBbox: s,
    intersects: a,
    setIntersects: f,
    datetime: d,
    setDatetime: m
  } = ye(), x = ke(i().map((k) => k.id)), S = ke([], {
    createable: !0
  }), [_, h] = y([]), [C, I] = y([]), [b, w] = y(1e3), [V, N] = y(""), [H, D] = y(""), [te, W] = y(!1), [R, {
    refetch: Z
  }] = _e(l, g);
  f("");
  const [re, P] = y(!1), [B, K] = y(""), [U, G] = y("");
  async function g(k) {
    if (k.trim() === "") {
      W(!1);
      return;
    }
    W(!0);
    const p = new URL(k), T = {
      collections: _().join(","),
      limit: b()
    };
    if (C().length > 0 && (T.ids = C().join(",")), u()) {
      if (!kn(u())) {
        G("StacSearchErrorInput");
        return;
      }
      G(""), T.bbox = u();
    }
    d() && (T.datetime = d() + ":00Z");
    const X = {};
    let M;
    a() && (M = a() !== "" ? a() : void 0, M != null && (X.intersects = JSON.parse(M))), Object.entries(T).forEach(([z, ve]) => {
      p.searchParams.append(z, ve);
    });
    let Y;
    M != null && M.trim() !== "" ? Y = await fetch(p, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(X)
    }) : Y = await fetch(p, {
      method: "GET"
    });
    const ne = await Y.json(), de = ne.links.find((z) => z.rel === "next"), L = ne.links.find((z) => z.rel === "previous");
    return de?.href ? D(de.href) : D(""), L?.href ? N(L.href) : N(""), ne;
  }
  const [j, le] = y(null), [q, he] = y(Le());
  J(() => {
    j() === null || j()?.trim() === "" ? he(Le()) : he(Ct() + j());
  });
  const pe = (k) => {
    le(k), P(!1), f(k ?? "");
  };
  async function ie(k) {
    n(k), await Z();
  }
  let Q, oe;
  return J(() => {
    re() && Q && oe ? (oe.style.display = "block", Q.style.display = "none", Q.focus()) : Q && oe && (Q.style.display = "grid", oe.style.display = "none", Q.focus());
  }), [(() => {
    var k = un(), p = k.firstChild, T = p.firstChild, X = T.nextSibling, M = X.nextSibling, Y = M.nextSibling, ne = Y.nextSibling, de = Q;
    return typeof de == "function" ? se(de, p) : Q = p, p.style.setProperty("display", "grid"), p.style.setProperty("grid-template-columns", "35% 15% 30% 9% 9%"), p.style.setProperty("gap", "0.25em"), o(p, c($e, Pe({
      get placeholder() {
        return tt();
      },
      onChange: h,
      multiple: !0
    }, x)), T), o(p, c($e, {
      get placeholder() {
        return nt();
      },
      onChange: w,
      options: [10, 50, 100, 250, 500, 1e3, 2e3]
    }), T), o(p, c($e, Pe({
      get placeholder() {
        return rt();
      },
      onChange: I,
      multiple: !0
    }, S)), T), T.$$click = () => {
      n(t), Z(t);
    }, T.style.setProperty("grid-row", "1/3"), T.style.setProperty("grid-column", "4"), o(T, Ne), X.$$click = () => {
      D(""), N(""), W(!1), n("");
    }, X.style.setProperty("grid-row", "1/3"), X.style.setProperty("grid-column", "5"), o(X, ot), M.$$click = () => P(!0), M.style.setProperty("white-space", "nowrap"), M.style.setProperty("overflow-x", "clip"), M.style.setProperty("text-overflow", "ellipses"), o(M, q), Y.addEventListener("change", (L) => {
      m(L.currentTarget.value);
    }), ne.addEventListener("change", (L) => s(L.currentTarget.value)), o(k, c(O, {
      get when() {
        return re();
      },
      get children() {
        var L = cn(), z = oe;
        return typeof z == "function" ? se(z, L) : oe = L, o(L, c(wn, {
          onClose: () => P(!1),
          onSave: pe
        })), L;
      }
    }), null), F((L) => {
      var z = q(), ve = `StacDatetimeInput ${B()}`, Te = `StacBboxInput ${U()}`;
      return z !== L.e && A(M, "title", L.e = z), ve !== L.t && xe(Y, L.t = ve), Te !== L.a && xe(ne, L.a = Te), L;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), F(() => Y.value = d() ? d() : ""), F(() => ne.value = u() ? u() : ""), k;
  })(), (() => {
    var k = fn();
    return o(k, c(O, {
      get when() {
        return R.loading;
      },
      get children() {
        var p = fe();
        return o(p, lt), p;
      }
    }), null), o(k, c(O, {
      get when() {
        return R.error;
      },
      get children() {
        var p = dn();
        return o(p, it), p;
      }
    }), null), o(k, c(O, {
      get when() {
        return E(() => !!(te() && !R.loading && !R.error))() && R();
      },
      get children() {
        return c(xn, {
          get searchResults() {
            return R();
          }
        });
      }
    }), null), k;
  })(), (() => {
    var k = gn();
    return o(k, c(O, {
      get when() {
        return V().trim().length > 0;
      },
      get children() {
        var p = be();
        return p.$$click = () => {
          ie(V());
        }, o(p, at), p;
      }
    }), null), o(k, c(O, {
      get when() {
        return E(() => !!(te() && !R.loading && !R.error))() && R();
      },
      get children() {
        return [(() => {
          var p = Ce();
          return o(p, ct, null), o(p, (() => {
            var T = E(() => !!R().context);
            return () => T() ? R().context.returned : Se();
          })(), null), p;
        })(), (() => {
          var p = Ce();
          return o(p, ut, null), o(p, (() => {
            var T = E(() => !!R().context);
            return () => T() ? R().context.limit : Se();
          })(), null), p;
        })(), (() => {
          var p = Ce();
          return o(p, dt, null), o(p, (() => {
            var T = E(() => !!R().context);
            return () => T() ? R().context.matched : Se();
          })(), null), p;
        })()];
      }
    }), null), o(k, c(O, {
      get when() {
        return H().trim().length > 0;
      },
      get children() {
        var p = be();
        return p.$$click = () => {
          ie(H());
        }, o(p, st), p;
      }
    }), null), k;
  })()];
}
function xn(r) {
  const {
    searchResults: e
  } = r;
  return c(Pn, {
    featureCollection: e
  });
}
function Pn(r) {
  const {
    featureCollection: e
  } = r;
  return (() => {
    var t = hn();
    return o(t, c(ce, {
      get each() {
        return e.features;
      },
      children: (l) => c(je, {
        feature: l
      })
    })), t;
  })();
}
function je(r) {
  const {
    feature: e
  } = r, {
    callback: t
  } = ye();
  function l(a) {
    t()({
      asset: n(),
      feature: e
    });
  }
  const [n, i] = y(""), u = Object.entries(e.assets).map(([a, f]) => ({
    name: a,
    value: f
  })).filter((a) => a.name !== "thumbnail"), s = ke(u, {
    key: "name"
  });
  return (() => {
    var a = pn(), f = a.firstChild, d = f.firstChild, m = d.nextSibling, x = m.nextSibling, S = x.firstChild;
    return o(a, (() => {
      var _ = E(() => !!e.assets.thumbnail?.href);
      return () => _() ? (() => {
        var h = vn();
        return F((C) => {
          var I = e.assets.thumbnail.href, b = e.assets.thumbnail.title ? e.assets.thumbnail.title : ft();
          return I !== C.e && A(h, "src", C.e = I), b !== C.t && A(h, "alt", C.t = b), C;
        }, {
          e: void 0,
          t: void 0
        }), h;
      })() : (() => {
        var h = fe();
        return o(h, gt), h;
      })();
    })(), f), f.style.setProperty("padding", "0.5rem"), o(d, () => Ie() + e.id), o(m, () => ht() + e.bbox.join(", ")), o(f, c(O, {
      get when() {
        return e.properties.datetime;
      },
      get children() {
        var _ = fe();
        return o(_, (() => {
          var h = E(() => !!e.properties.datetime);
          return () => h() ? pt() + e.properties.datetime : "";
        })()), _;
      }
    }), x), o(f, c(O, {
      get when() {
        return e.properties.created;
      },
      get children() {
        var _ = fe();
        return o(_, (() => {
          var h = E(() => !!e.properties.created);
          return () => h() ? vt() + e.properties.created : "";
        })()), _;
      }
    }), x), x.style.setProperty("display", "grid"), x.style.setProperty("grid-template-columns", "75% 25%"), o(x, c($e, Pe(s, {
      get placeholder() {
        return Ye();
      },
      onChange: (_) => {
        i(_.value);
      }
    })), S), S.$$click = l, o(S, et), a;
  })();
}
function kn(r) {
  const e = r.split(",").map((s) => parseFloat(s));
  if (e.length !== 4 || e.some((s) => isNaN(s)))
    return !1;
  const [t, l, n, i] = e;
  return !(t < -180 || t > 180 || n < -180 || n > 180 || l < -90 || l > 90 || i < -90 || i > 90 || t > n || l > i);
}
function wn(r) {
  const [e, t] = y("none"), [l, n] = y(""), [i, u] = y(""), [s, a] = y([{
    lat: "",
    lon: ""
  }]), [f, d] = y();
  function m() {
    a([...s(), {
      lat: "",
      lon: ""
    }]);
  }
  function x(_, h, C) {
    a((I) => {
      const b = [...I];
      return b[_] = {
        ...b[_],
        [h]: C
      }, b;
    });
  }
  function S() {
    let _ = null;
    if (e() === "point") {
      const h = parseFloat(l()), C = parseFloat(i());
      !isNaN(h) && !isNaN(C) && (_ = {
        type: "Point",
        coordinates: [C, h]
        // [lon, lat] per GeoJSON spec
      });
    } else if (e() === "polygon") {
      const h = s().map((C) => [parseFloat(C.lon), parseFloat(C.lat)]);
      h.length >= 3 && (h.push(h[0]), _ = {
        type: "Polygon",
        coordinates: [h]
      });
    } else e() == "custom" && f() !== void 0 && f()?.trim() !== "" && (_ = JSON.parse(f()));
    r.onSave(_ ? JSON.stringify(_) : null);
  }
  return (() => {
    var _ = _n(), h = _.firstChild, C = h.firstChild, I = C.firstChild, b = I.firstChild, w = I.nextSibling, V = w.firstChild, N = w.nextSibling, H = N.firstChild, D = N.nextSibling, te = D.firstChild, W = h.nextSibling, R = W.firstChild, Z = R.firstChild, re = Z.nextSibling;
    return C.style.setProperty("display", "grid"), b.addEventListener("change", (P) => t(P.currentTarget.value)), o(I, mt, null), V.addEventListener("change", (P) => t(P.currentTarget.value)), o(w, $t, null), H.addEventListener("change", (P) => t(P.currentTarget.value)), o(N, bt, null), te.addEventListener("change", (P) => t(P.currentTarget.value)), o(D, xt, null), o(h, c(Ve, {
      fallback: [],
      get children() {
        return [c(me, {
          get when() {
            return e() === "point";
          },
          get children() {
            var P = mn(), B = P.firstChild, K = B.firstChild, U = B.nextSibling, G = U.firstChild;
            return o(B, _t, K), K.addEventListener("change", (g) => n(g.currentTarget.value)), o(U, yt, G), G.addEventListener("change", (g) => u(g.currentTarget.value)), F(() => K.value = l()), F(() => G.value = i()), P;
          }
        }), c(me, {
          get when() {
            return e() === "polygon";
          },
          get children() {
            var P = $n(), B = P.firstChild;
            return o(P, c(ce, {
              get each() {
                return s();
              },
              children: (K, U) => (() => {
                var G = yn(), g = G.firstChild, j = g.firstChild, le = j.nextSibling, q = g.nextSibling, he = q.firstChild, pe = he.nextSibling;
                return G.style.setProperty("margin-bottom", "4px"), le.addEventListener("change", (ie) => {
                  x(U(), "lat", ie.currentTarget.value);
                }), q.style.setProperty("margin-left", "8px"), pe.addEventListener("change", (ie) => {
                  x(U(), "lon", ie.currentTarget.value);
                }), F(() => le.value = K.lat), F(() => pe.value = K.lon), G;
              })()
            }), B), B.$$click = m, o(B, St), P;
          }
        }), c(me, {
          get when() {
            return e() === "custom";
          },
          get children() {
            var P = bn();
            return P.addEventListener("change", (B) => {
              d(B.currentTarget.value);
            }), F(() => A(P, "placeholder", Pt())), P;
          }
        })];
      }
    }), null), R.style.setProperty("margin-top", "16px"), ge(Z, "click", r.onClose, !0), re.$$click = S, F(() => b.checked = e() === "none"), F(() => V.checked = e() === "point"), F(() => H.checked = e() === "polygon"), F(() => te.checked = e() === "custom"), _;
  })();
}
we(["click"]);
function Tn(r) {
  const {
    url: e,
    selectCallback: t,
    bboxSignal: l,
    intersectsSignal: n,
    datetimeSignal: i
  } = r;
  return c(qe, {
    bboxSignal: l,
    intersectsSignal: n,
    datetimeSignal: i,
    get children() {
      return c(Sn, {
        url: e,
        selectCallback: t
      });
    }
  });
}
export {
  Tn as Stac
};
