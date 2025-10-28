var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/prism-code-editor/dist/index-C1_GGQ8y.js
function Token(type, content, matchedStr, alias) {
  this.type = type;
  this.content = content;
  this.alias = alias;
  this.length = matchedStr.length;
}
var plainTextGrammar, rest, tokenize, resolve, languages, tokenizeText, withoutTokenizer, escapeHtml, closingTag, openingTags, closingTags, highlightTokens, stringify, matchGrammar;
var init_index_C1_GGQ8y = __esm({
  "node_modules/prism-code-editor/dist/index-C1_GGQ8y.js"() {
    plainTextGrammar = {};
    rest = Symbol();
    tokenize = Symbol();
    resolve = (id) => typeof id == "string" ? languages[id] : id;
    languages = {
      plain: plainTextGrammar,
      plaintext: plainTextGrammar,
      text: plainTextGrammar,
      txt: plainTextGrammar
    };
    tokenizeText = (text, grammar) => (grammar[tokenize] || withoutTokenizer)(text, grammar);
    withoutTokenizer = (text, grammar) => {
      var startNode = [text];
      var restGrammar;
      var array = [], i = 0;
      while (restGrammar = resolve(grammar[rest])) {
        delete grammar[rest];
        Object.assign(grammar, restGrammar);
      }
      matchGrammar(text, grammar, startNode, 0);
      while (array[i++] = startNode[0], startNode = startNode[1]) ;
      return array;
    };
    escapeHtml = (string, pattern, replacement) => {
      return string.replace(/&/g, "&amp;").replace(pattern, replacement);
    };
    closingTag = "</span>";
    openingTags = "";
    closingTags = "";
    highlightTokens = (tokens) => {
      var str = "", l = tokens.length, i = 0;
      while (i < l) str += stringify(tokens[i++]);
      return str;
    };
    stringify = (token) => {
      if (token instanceof Token) {
        var { type, alias, content } = token;
        var prevOpening = openingTags;
        var prevClosing = closingTags;
        var opening = `<span class="token ${type + (alias ? " " + alias : "") + (type == "keyword" && typeof content == "string" ? " keyword-" + content : "")}">`;
        closingTags += closingTag;
        openingTags += opening;
        var contentStr = stringify(content);
        openingTags = prevOpening;
        closingTags = prevClosing;
        return opening + contentStr + closingTag;
      }
      if (typeof token != "string") return highlightTokens(token);
      token = escapeHtml(token, /</g, "&lt;");
      if (closingTags && token.includes("\n")) {
        return token.replace(/\n/g, closingTags + "\n" + openingTags);
      }
      return token;
    };
    matchGrammar = (text, grammar, startNode, startPos, rematch) => {
      for (var token in grammar) {
        if (grammar[token]) for (var j = 0, p = grammar[token], patterns = Array.isArray(p) ? p : [p]; j < patterns.length; ++j) {
          if (rematch && rematch[0] == token && rematch[1] == j) {
            return;
          }
          var patternObj = patterns[j];
          var pattern = patternObj.pattern || patternObj;
          var inside = resolve(patternObj.inside);
          var lookbehind = patternObj.lookbehind;
          var greedy = patternObj.greedy && pattern.global;
          var alias = patternObj.alias;
          for (var currentNode = startNode, pos = startPos; currentNode && (!rematch || pos < rematch[2]); pos += currentNode[0].length, currentNode = currentNode[1]) {
            var str = currentNode[0];
            var removeCount = 0;
            var match, lookbehindLength;
            if (str instanceof Token) {
              continue;
            }
            pattern.lastIndex = greedy ? pos : 0;
            match = pattern.exec(greedy ? text : str);
            if (!match && greedy) {
              break;
            }
            if (!(match && match[0])) {
              continue;
            }
            if (lookbehind && match[1]) {
              lookbehindLength = match[1].length;
              match.index += lookbehindLength;
              match[0] = match[0].slice(lookbehindLength);
            }
            if (greedy) {
              for (var from = match.index, to = from + match[0].length, l; from >= pos + (l = currentNode[0].length); currentNode = currentNode[1], pos += l) ;
              if (currentNode[0] instanceof Token) {
                continue;
              }
              for (var k = currentNode, p = pos; (p += k[0].length) < to; k = k[1], removeCount++) ;
              str = text.slice(pos, p);
              match.index -= pos;
            }
            var from = match.index;
            var matchStr = match[0];
            var after = str.slice(from + matchStr.length);
            var reach = pos + str.length;
            var newToken = new Token(token, inside ? tokenizeText(matchStr, inside) : matchStr, matchStr, alias);
            var next = currentNode, i = 0;
            var nestedRematch;
            while (next = next[1], i++ < removeCount) ;
            if (after) {
              if (!next || next[0] instanceof Token) next = [after, next];
              else next[0] = after + next[0];
            }
            pos += from;
            currentNode[0] = from ? str.slice(0, from) : newToken;
            if (from) currentNode = currentNode[1] = [newToken, next];
            else currentNode[1] = next;
            if (removeCount) {
              matchGrammar(text, grammar, currentNode, pos, nestedRematch = [token, j, reach]);
              reach = nestedRematch[2];
            }
            if (rematch && reach > rematch[2]) rematch[2] = reach;
          }
        }
      }
    };
  }
});

// node_modules/prism-code-editor/dist/index-CKRNGLIi.js
var createEditor, doc, templateEl, createTemplate, addListener, getElement, numLines, languageMap, editorTemplate, preventDefault, selectionChange;
var init_index_CKRNGLIi = __esm({
  "node_modules/prism-code-editor/dist/index-CKRNGLIi.js"() {
    init_index_C1_GGQ8y();
    createEditor = (container, options, ...extensions) => {
      let language;
      let prevLines = [];
      let activeLine;
      let value = "";
      let activeLineNumber;
      let focused = false;
      let handleSelectionChange = true;
      let tokens = [];
      let readOnly;
      let lineCount = 0;
      const scrollContainer = editorTemplate();
      const wrapper = scrollContainer.firstChild;
      const lines = wrapper.children;
      const overlays = lines[0];
      const textarea = overlays.firstChild;
      const currentOptions = { language: "text", value };
      const currentExtensions = new Set(extensions);
      const listeners = {};
      const setOptions = (options2) => {
        Object.assign(currentOptions, options2);
        let isNewVal = value != (value = options2.value ?? value);
        let isNewLang = language != (language = currentOptions.language);
        readOnly = !!currentOptions.readOnly;
        scrollContainer.style.tabSize = currentOptions.tabSize || 2;
        textarea.inputMode = readOnly ? "none" : "";
        textarea.setAttribute("aria-readonly", readOnly);
        updateClassName();
        updateExtensions();
        if (isNewVal) {
          if (!focused) textarea.remove();
          textarea.value = value;
          textarea.selectionEnd = 0;
          if (!focused) overlays.prepend(textarea);
        }
        if (isNewVal || isNewLang) {
          update();
        }
      };
      const update = () => {
        tokens = tokenizeText(value = textarea.value, languages[language] || {});
        dispatchEvent("tokenize", tokens, language, value);
        let newLines = highlightTokens(tokens).split("\n");
        let start = 0;
        let end2 = lineCount;
        let end1 = lineCount = newLines.length;
        while (newLines[start] == prevLines[start] && start < end1) ++start;
        while (end1 && newLines[--end1] == prevLines[--end2]) ;
        if (start == end1 && start == end2) lines[start + 1].innerHTML = newLines[start] + "\n";
        else {
          let insertStart = end2 < start ? end2 : start - 1;
          let i = insertStart;
          let newHTML = "";
          while (i < end1) newHTML += `<div class=pce-line aria-hidden=true>${newLines[++i]}
</div>`;
          for (i = end1 < start ? end1 : start - 1; i < end2; i++) lines[start + 1].remove();
          if (newHTML) lines[insertStart + 1].insertAdjacentHTML("afterend", newHTML);
          for (i = insertStart + 1; i < lineCount; ) lines[++i].setAttribute("data-line", i);
          scrollContainer.style.setProperty(
            "--number-width",
            (0 | Math.log10(lineCount)) + 1 + ".001ch"
          );
        }
        dispatchEvent("update", value);
        dispatchSelection(true);
        if (handleSelectionChange) setTimeout(setTimeout, 0, () => handleSelectionChange = true);
        prevLines = newLines;
        handleSelectionChange = false;
      };
      const updateExtensions = (newExtensions) => {
        (newExtensions || currentExtensions).forEach((extension) => {
          if (typeof extension == "object") {
            extension.update(self, currentOptions);
            if (newExtensions) currentExtensions.add(extension);
          } else {
            extension(self, currentOptions);
            if (!newExtensions) currentExtensions.delete(extension);
          }
        });
      };
      const updateClassName = ([start, end] = getInputSelection()) => {
        scrollContainer.className = `prism-code-editor language-${language}${currentOptions.lineNumbers == false ? "" : " show-line-numbers"} pce-${currentOptions.wordWrap ? "" : "no"}wrap${currentOptions.rtl ? " pce-rtl" : ""} pce-${start < end ? "has" : "no"}-selection${focused ? " pce-focus" : ""}${readOnly ? " pce-readonly" : ""}${currentOptions.class ? " " + currentOptions.class : ""}`;
      };
      const getInputSelection = () => [
        textarea.selectionStart,
        textarea.selectionEnd,
        textarea.selectionDirection
      ];
      const keyCommandMap = {
        Escape() {
          textarea.blur();
        }
      };
      const inputCommandMap = {};
      const dispatchEvent = (name, ...args) => {
        listeners[name]?.forEach((handler) => handler.apply(self, args));
        currentOptions["on" + name[0].toUpperCase() + name.slice(1)]?.apply(self, args);
      };
      const dispatchSelection = (force) => {
        if (force || handleSelectionChange) {
          const selection = getInputSelection();
          const newLine = lines[activeLineNumber = numLines(value, 0, selection[selection[2] < "f" ? 0 : 1])];
          if (newLine != activeLine) {
            activeLine?.classList.remove("active-line");
            newLine.classList.add("active-line");
            activeLine = newLine;
          }
          updateClassName(selection);
          dispatchEvent("selectionChange", selection, value);
        }
      };
      const self = {
        container: scrollContainer,
        wrapper,
        lines,
        textarea,
        get activeLine() {
          return activeLineNumber;
        },
        get value() {
          return value;
        },
        options: currentOptions,
        get focused() {
          return focused;
        },
        get tokens() {
          return tokens;
        },
        inputCommandMap,
        keyCommandMap,
        extensions: {},
        setOptions,
        update,
        getSelection: getInputSelection,
        addExtensions(...extensions2) {
          updateExtensions(extensions2);
        },
        on: (name, handler) => {
          (listeners[name] ||= /* @__PURE__ */ new Set()).add(handler);
          return () => listeners[name].delete(handler);
        },
        remove() {
          scrollContainer.remove();
        }
      };
      addListener(textarea, "keydown", (e) => {
        keyCommandMap[e.key]?.(e, getInputSelection(), value) && preventDefault(e);
      });
      addListener(textarea, "beforeinput", (e) => {
        if (readOnly || e.inputType == "insertText" && inputCommandMap[e.data]?.(e, getInputSelection(), value))
          preventDefault(e);
      });
      addListener(textarea, "input", update);
      addListener(textarea, "blur", () => {
        selectionChange = null;
        focused = false;
        updateClassName();
      });
      addListener(textarea, "focus", () => {
        selectionChange = dispatchSelection;
        focused = true;
        updateClassName();
      });
      addListener(textarea, "selectionchange", (e) => {
        dispatchSelection();
        preventDefault(e);
      });
      getElement(container)?.append(scrollContainer);
      options && setOptions(options);
      return self;
    };
    doc = "u" > typeof window ? document : null;
    templateEl = /* @__PURE__ */ doc?.createElement("div");
    createTemplate = (html, node) => {
      if (templateEl) {
        templateEl.innerHTML = html;
        node = templateEl.firstChild;
      }
      return () => node.cloneNode(true);
    };
    addListener = (target, type, listener, options) => target.addEventListener(type, listener, options);
    getElement = (el) => typeof el == "string" ? doc.querySelector(el) : el;
    numLines = (str, start = 0, end = Infinity) => {
      let count = 1;
      for (; (start = str.indexOf("\n", start) + 1) && start <= end; count++) ;
      return count;
    };
    languageMap = {};
    editorTemplate = /* @__PURE__ */ createTemplate(
      "<div><div class=pce-wrapper><div class=pce-overlays><textarea class=pce-textarea spellcheck=false autocapitalize=off autocomplete=off>"
    );
    preventDefault = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    if (doc) addListener(doc, "selectionchange", () => selectionChange?.());
  }
});

// node_modules/prism-code-editor/dist/atom-one-dark.js
var atom_one_dark_exports = {};
__export(atom_one_dark_exports, {
  default: () => atomOneDark
});
var atomOneDark;
var init_atom_one_dark = __esm({
  "node_modules/prism-code-editor/dist/atom-one-dark.js"() {
    atomOneDark = ".prism-code-editor{caret-color:#528bff;font-family:Fira Code,Fira Mono,Menlo,Consolas,DejaVu Sans Mono,monospace;--editor__bg: #292c33;--widget__border: #3a3f4b;--widget__bg: #21252b;--widget__color: #ccc;--widget__color-active: #fff;--widget__color-options: #b2b2b2;--widget__bg-input: #1b1d23;--widget__bg-hover: #5a5d5e4f;--widget__bg-active: #336699;--widget__focus-ring: #5299e0;--search__bg-find: #528bff3d;--widget__bg-error: #5a1d1d;--widget__error-ring: #be1100;--editor__bg-highlight: #99bbff0a;--editor__bg-selection-match: #4a566d66;--editor__line-number: #636d83;--editor__bg-scrollbar: 220, 13%, 41%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #abb2bf26;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #3e4451;color-scheme:dark}.pce-match{--search__bg-find: #515c6a}.active-line{--editor__line-number: #abb2bf}.active-indent{--bg-guide-indent: #abb2c280}.token.comment,.token.prolog,.token.cdata{color:#5c6370}[class*=language-],.token.punctuation,.token.attr-equals,.language-css .token.property{color:#abb2bf}.token.keyword,.token.token.anchor,.token.regex-flags,.selector .punctuation,.selector .combinator,.selector .operator,.token.token.arrow{color:#c678dd}.token.class-name,.token.maybe-class-name{color:#e5c07b}.token.attr-name,.token.doctype,.selector .class,.selector .pseudo-element,.selector .pseudo-class,.token.regex .escape,.token.char-class,.token.char-set,.token.boolean,.token.constant,.token.number,.token.entity,.token.unit,.token.atrule,.token.keyword-null,.token.keyword-undefined{color:#d19a66}.token.property,.token.tag,.token.doctype-tag,.token.symbol,.token.deleted,.token.important,.token.keyword-this,.token.this .token.variable,.token.selector,.language-css .variable,.token.property-access{color:#e06c75}.token.string,.token.char,.token.inserted,.token.string-property,.token.attr-value,.token.string.url,.token.attr-value:not(.script):not(.style)>.punctuation,.token.code-snippet.code{color:#98c379}.language-markdown .url>.variable,.language-markdown .url>.content,.token.function,.token.selector .id{color:#61afef}.token.url,.token.regex,.language-regex,.token.char-class .operator,.token.alternation,.token.quantifier,.token.hexcode,.token.keyword-get,.token.keyword-set,.token.builtin,.token.operator{color:#56b6c2}.language-css .token.important,.token.atrule .token.rule,.language-markdown .italic{color:#c678dd}.language-json .token.keyword-null,.language-markdown .bold *{color:#d19a66}.language-markdown .code.keyword,.language-json .token.operator,.language-markdown .token.url,.language-markdown .url>.operator,.language-markdown .token.url-reference>.string{color:#abb2bf}.language-css .function,.language-markdown .token.blockquote.punctuation,.language-markdown .token.hr.punctuation,.language-markdown .token.url>.token.url,.language-markdown .token.url-reference.url{color:#56b6c2}.language-markdown .strike *,.language-markdown .token.list.punctuation,.language-markdown .token.title.important>.token.punctuation{color:#e06c75}.token.bold{font-weight:700}.token.comment,.token.italic{font-style:italic}.token.namespace{opacity:.8}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:gold}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:orchid}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#179fff}.token.interpolation-punctuation{color:#98c379}.token.bracket-error{color:#ff1212cc}.token.markup-bracket,.token.regex .punctuation{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #888,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#575757b8}";
  }
});

// node_modules/prism-code-editor/dist/dracula.js
var dracula_exports = {};
__export(dracula_exports, {
  default: () => dracula
});
var dracula;
var init_dracula = __esm({
  "node_modules/prism-code-editor/dist/dracula.js"() {
    dracula = ".prism-code-editor{caret-color:#aeafad;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #282a36;--widget__border: #454545;--widget__bg: #21222c;--widget__color: #f8f8f2;--widget__color-active: #fff;--widget__color-options: #b2b2a8;--widget__bg-input: #282a36;--widget__bg-hover: #5a5d5e80;--widget__bg-active: #6272a466;--widget__focus-ring: #bd93f9;--search__bg-find: #ffffff40;--widget__bg-error: #5a1d1d;--widget__error-ring: #ff5555;--editor__border-highlight: 2px solid #44475a;--editor__bg-selection-match: #424450;--editor__line-number: #6272a4;--editor__bg-scrollbar: 0, 0%, 50%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #ffffff1a;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #44475a;color-scheme:dark}.match-highlight{--editor__bg-highlight: #44475a}.pce-match{--search__bg-find: #ffb86c80}.active-line{--editor__line-number: #c6c6c6}.active-indent{--bg-guide-indent: #ffffff45}.token.comment,.token.prolog,.token.cdata{color:#6272a4}[class*=language-],.token.punctuation,.language-markdown .code.keyword{color:#f8f8f2}.token.namespace{opacity:.7}.token.tag,.token.operator,.token.attr-equals,.token.doctype-tag,.token.symbol,.token.unit,.token.selector,.token.deleted,.token.keyword,.token.quantifier.number,.token.token.anchor,.token.regex-flags,.token.atrule .rule,.language-markdown .url .content{color:#ff79c6}.token.class-name,.token.maybe-class-name,.language-css .token.function,.language-css .token.property,.language-markdown .url{color:#8be9fd}.token.boolean,.token.number,.token.color,.token.entity,.token.char-set,.token.keyword-this,.token.keyword-null,.token.keyword-undefined,.language-markdown .token.title{color:#bd93f9}.selector .class,.selector .id,.token.pseudo-element,.token.pseudo-class,.token.attr-name,.token.builtin,.token.inserted,.token.function,.token.doctype,.language-markdown .code-language,.language-markdown .code-snippet.code{color:#50fa7b}.token.url,.token.variable{color:#f8f8f2}.token.regex,.language-regex,.token.attr-value,.token.attr-value>.punctuation,.token.char,.token.string,.token.string-property,.language-markdown .italic *{color:#f1fa8c}.token.regex-delimiter,.token.char-class .operator{color:#f55}.token.important,.token.parameter,.token.group,.token.regex .punctuation,.token.generic,.token.url,.token.atrule,.language-markdown .bold *,.token.constant{color:#ffb86c}.language-tsx .token.builtin,.token.char-class .punctuation,.language-typescript .token.builtin{color:#8be9fd}.token.important,.token.bold{font-weight:700}.token.italic,.token.parameter,.token.attr-name,.doctype .name,.selector .class,.token.pseudo-element,.token.pseudo-class,.tag>.class-name{font-style:italic}.parameter .punctuation{font-style:normal}.token.bracket-level-0,.token.bracket-level-6{color:#f8f8f2}.token.bracket-level-1,.token.bracket-level-7{color:#ff79c6}.token.bracket-level-2,.token.bracket-level-8{color:#8be9fd}.token.bracket-level-3,.token.bracket-level-9{color:#50fa7b}.token.bracket-level-4,.token.bracket-level-10{color:#bd93f9}.token.bracket-level-5,.token.bracket-level-11{color:#ffb86c}.token.interpolation-punctuation{color:#ff79c6}.token.bracket-error{color:#f55}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #b9b9b9,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#8be9fd4f}";
  }
});

// node_modules/prism-code-editor/dist/github-dark-dimmed.js
var github_dark_dimmed_exports = {};
__export(github_dark_dimmed_exports, {
  default: () => githubDarkDimmed
});
var githubDarkDimmed;
var init_github_dark_dimmed = __esm({
  "node_modules/prism-code-editor/dist/github-dark-dimmed.js"() {
    githubDarkDimmed = ".prism-code-editor{caret-color:#539bf5;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #22272e;--widget__border: #444;--widget__bg: #22272e;--widget__color: #adbac7;--widget__color-active: #fff;--widget__color-options: #8a99a8;--widget__bg-input: #2d333b;--widget__bg-hover: #5a5d5e4f;--widget__bg-active: #1f6feb66;--widget__focus-ring: #007acc;--search__bg-find: #eac55f80;--widget__bg-error: #5a1d1d;--widget__error-ring: #be1100;--editor__bg-highlight: #636e7b1a;--editor__bg-selection-match: #57ab5a40;--editor__line-number: #636e7b;--editor__bg-scrollbar: 210, 10%, 35%;--editor__bg-fold: #768390;--bg-guide-indent: #adbac71f;--pce-ac-icon-class: #e0823d;--pce-ac-icon-enum: #e0823d;--pce-ac-icon-event: #636e7b;--pce-ac-icon-function: #b083f0;--pce-ac-icon-interface: #e0823d;--pce-ac-icon-keyword: #f47067;--pce-ac-icon-namespace: #f47067;--pce-ac-icon-parameter: #6cb6ff;--pce-ac-icon-property: #e0823d;--pce-ac-icon-snippet: #539bf5;--pce-ac-icon-text: #6cb6ff;--pce-ac-icon-unit: #539bf5;--pce-ac-icon-variable: #e0823d;--pce-selection: #264f78;color-scheme:dark}.pce-match{--search__bg-find: #888a6c}.active-line{--editor__line-number: #adbac7}.active-indent{--bg-guide-indent: #adbac73d}[class*=language-],.language-markdown .url>.operator,.token.punctuation,.token.attr-equals,.token.code.keyword{color:#adbac7}.token.class-name,.token.maybe-class-name,.token.atrule,.token.variable,.language-css .token.url,.token.parameter,.token.list.punctuation{color:#f69d50}.token.atrule .rule,.token.unit,.token.selector .combinator,.token.operator,.token.deleted,.token.entity,.token.regex-flags,.token.token.anchor,.token.number.quantifier,.token.keyword{color:#f47067}.token.tag,.token.inserted,.token.selector,.token.doctype-tag,.language-regex .escape{color:#8ddb8c}.token.function{color:#dcbdfb}.token.attr-value,.token.string,.token.char,.token.regex,.language-regex,.token.string-property,.language-markdown .url .content,.language-markdown .url .variable{color:#96d0ff}.token.builtin,.token.selector .class,.token.selector .id,.token.pseudo-class,.token.pseudo-element,.token.attr-name,.language-css .token.property,.token.number,.token.constant,.token.color,.token.boolean,.token.title.important,.title.important .punctuation,.language-css .token.function,.token.code-snippet.code,.token.doctype,.token.property-access,.token.keyword-null,.token.keyword-this,.token.char-class,.token.char-set,.token.regex .punctuation{color:#6cb6ff}.token.comment,.token.prolog,.token.cdata{color:#768390}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.bracket-level-0,.token.bracket-level-6{color:#6cb6ff}.token.bracket-level-1,.token.bracket-level-7{color:#6bc46d}.token.bracket-level-2,.token.bracket-level-8{color:#daaa3f}.token.bracket-level-3,.token.bracket-level-9{color:#ff938a}.token.bracket-level-4,.token.bracket-level-10{color:#fc8dc7}.token.bracket-level-5,.token.bracket-level-11{color:#dcbdfb}.token.interpolation-punctuation{color:#96d0ff}.token.bracket-error{color:#768390}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #57ab5a99,inset 0 0 0 9in #57ab5a40}.active-tagname,.word-matches span{box-shadow:inset 0 0 0 1px #636e7b99,inset 0 0 0 9in #636e7b80}";
  }
});

// node_modules/prism-code-editor/dist/github-dark.js
var github_dark_exports = {};
__export(github_dark_exports, {
  default: () => githubDark
});
var githubDark;
var init_github_dark = __esm({
  "node_modules/prism-code-editor/dist/github-dark.js"() {
    githubDark = ".prism-code-editor{caret-color:#2f81f7;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #0d1117;--widget__border: #303741;--widget__bg: #161b22;--widget__color: #b8bfc7;--widget__color-active: #fff;--widget__color-options: #7d8590;--widget__bg-input: #0d1117;--widget__bg-hover: #5a5d5e4f;--widget__bg-active: #1f6feb66;--widget__focus-ring: #007acc;--search__bg-find: #f2cc6080;--widget__bg-error: #5a1d1d;--widget__error-ring: #be1100;--editor__bg-highlight: #6e76811a;--editor__bg-selection-match: #3fb95040;--editor__line-number: #6e7681;--editor__bg-scrollbar: 210, 10%, 32%;--editor__bg-fold: #7d8590;--bg-guide-indent: #e6edf31f;--pce-ac-icon-class: #f0883e;--pce-ac-icon-enum: #f0883e;--pce-ac-icon-event: #6e7681;--pce-ac-icon-function: #bc8cff;--pce-ac-icon-interface: #f0883e;--pce-ac-icon-keyword: #ff7b72;--pce-ac-icon-namespace: #ff7b72;--pce-ac-icon-parameter: #79c0ff;--pce-ac-icon-property: #f0883e;--pce-ac-icon-snippet: #58a6ff;--pce-ac-icon-text: #79c0ff;--pce-ac-icon-unit: #58a6ff;--pce-ac-icon-variable: #f0883e;--pce-selection: #264f78;color-scheme:dark}.pce-match{--search__bg-find: #8c8d6c}.active-line{--editor__line-number: #e6edf3}.active-indent{--bg-guide-indent: #e6edf33d}[class*=language-],.language-markdown .url>.operator,.token.punctuation,.token.attr-equals,.token.code.keyword{color:#e6edf3}.token.atrule,.token.variable,.language-css .token.url,.token.parameter,.token.list.punctuation,.token.class-name,.token.maybe-class-name{color:#ffa657}.token.atrule .rule,.token.unit,.token.selector .combinator,.token.operator,.token.deleted,.token.entity,.token.regex-flags,.token.token.anchor,.token.number.quantifier,.token.keyword{color:#ff7b72}.token.tag,.token.inserted,.token.selector,.token.doctype-tag,.language-regex .escape{color:#7ee787}.token.attr-value,.token.string,.token.char,.token.regex,.language-regex,.token.string-property,.language-markdown .url .content,.language-markdown .url .variable{color:#a5d6ff}.token.builtin,.token.selector .class,.token.selector .id,.token.pseudo-class,.token.pseudo-element,.token.attr-name,.language-css .token.property,.token.number,.token.color,.token.boolean,.token.constant,.token.title.important,.title.important .punctuation,.language-css .token.function,.token.code-snippet.code,.token.doctype,.token.property-access,.token.keyword-null,.token.keyword-this,.token.char-class,.token.char-set,.token.regex .punctuation{color:#79c0ff}.token.function{color:#d2a8ff}.token.comment,.token.prolog,.token.cdata{color:#8b949e}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.bracket-level-0,.token.bracket-level-6{color:#79c0ff}.token.bracket-level-1,.token.bracket-level-7{color:#56d364}.token.bracket-level-2,.token.bracket-level-8{color:#e3b341}.token.bracket-level-3,.token.bracket-level-9{color:#ffa198}.token.bracket-level-4,.token.bracket-level-10{color:#ff9bce}.token.bracket-level-5,.token.bracket-level-11{color:#d2a8ff}.token.interpolation-punctuation{color:#a5d6ff}.token.bracket-error{color:#7d8590}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #3fb95099,inset 0 0 0 9in #3fb95040}.active-tagname,.word-matches span{box-shadow:inset 0 0 0 1px #6e768199,inset 0 0 0 9in #6e768180}";
  }
});

// node_modules/prism-code-editor/dist/github-light.js
var github_light_exports = {};
__export(github_light_exports, {
  default: () => githubLight
});
var githubLight;
var init_github_light = __esm({
  "node_modules/prism-code-editor/dist/github-light.js"() {
    githubLight = ".prism-code-editor{caret-color:#24292e;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #fff;--widget__border: #bfbfbf;--widget__bg: #f6f8fa;--widget__color: #434d56;--widget__color-active: #000;--widget__color-options: #5a6772;--widget__bg-input: #fafbfc;--widget__bg-hover: #b8b8b84f;--widget__bg-active: #2188ff33;--widget__focus-ring: #007acc;--search__bg-find: #ffdf5d66;--widget__bg-error: #f2dede;--widget__error-ring: #be1100;--editor__bg-highlight: #f6f8fa;--editor__bg-selection-match: #34d05840;--editor__line-number: #1b1f2380;--editor__bg-scrollbar: 210, 7%, 55%;--editor__bg-fold: #656d76;--bg-guide-indent: #1f23281f;--pce-ac-icon-class: #953800;--pce-ac-icon-constant: #116329;--pce-ac-icon-enum: #953800;--pce-ac-icon-event: #57606a;--pce-ac-icon-function: #6639ba;--pce-ac-icon-interface: #953800;--pce-ac-icon-keyword: #a40e26;--pce-ac-icon-namespace: #a40e26;--pce-ac-icon-parameter: #0a3069;--pce-ac-icon-property: #953800;--pce-ac-icon-snippet: #0550ae;--pce-ac-icon-text: #0a3069;--pce-ac-icon-unit: #0550ae;--pce-ac-icon-variable: #953800;--pce-ac-match: #0066bf;--pce-tabstop: #0a326433;--pce-invisibles: #3333;--pce-selection: #add6ff;color-scheme:light}.pce-match{--search__bg-find: #e9e5ba}.active-line{--editor__line-number: #1f2328}.active-indent{--bg-guide-indent: #1f23284d}[class*=language-],.language-markdown .url>.operator,.token.attr-equals,.token.punctuation{color:#24292e}.token.atrule,.token.variable,.language-css .token.url,.token.parameter,.token.list.punctuation,.token.maybe-class-name,.token.class-name{color:#e36209}.token.keyword,.token.atrule .rule,.token.unit,.token.deleted,.token.entity,.token.selector .combinator,.token.regex-flags,.token.token.anchor,.token.number.quantifier,.token.operator{color:#d73a49}.token.tag,.token.inserted,.token.selector,.token.doctype-tag,.language-regex .escape{color:#22863a}.token.selector .class,.token.selector .id,.token.pseudo-class,.token.pseudo-element,.token.function{color:#6f42c1}.token.attr-value,.token.string,.token.char,.token.regex,.language-regex,.token.string-property,.language-markdown .url .content,.language-markdown .url .variable{color:#032f62}.token.code.keyword{color:#24292e}.token.attr-name,.language-css .token.property,.token.number,.token.constant,.token.color,.token.boolean,.token.title.important,.title.important .punctuation,.token.property-access,.token.char-class,.token.char-set,.token.doctype,.token.builtin,.token.regex .punctuation,.language-css .token.function,.token.code-snippet.code{color:#005cc5}.token.comment,.token.prolog,.token.cdata{color:#6a737d}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.bracket-level-0,.token.bracket-level-6{color:#0366d6}.token.bracket-level-1,.token.bracket-level-7{color:#138934}.token.bracket-level-2,.token.bracket-level-8{color:#b37700}.token.bracket-level-3,.token.bracket-level-9{color:#cb2431}.token.bracket-level-4,.token.bracket-level-10{color:#a43276}.token.bracket-level-5,.token.bracket-level-11{color:#8a3ddb}.token.interpolation-punctuation{color:#032f62}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #34d05899,inset 0 0 0 9in #35d05940}.active-tagname,.word-matches span{box-shadow:inset 0 0 0 1px #afb8c199,inset 0 0 0 9in #eaeef280}";
  }
});

// node_modules/prism-code-editor/dist/night-owl-light.js
var night_owl_light_exports = {};
__export(night_owl_light_exports, {
  default: () => nightOwlLight
});
var nightOwlLight;
var init_night_owl_light = __esm({
  "node_modules/prism-code-editor/dist/night-owl-light.js"() {
    nightOwlLight = ".prism-code-editor{caret-color:#403f53;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #fbfbfb;--widget__border: #ccc;--widget__bg: #fbfbfb;--widget__color: #403f53;--widget__color-active: #000;--widget__color-options: #5e6578;--widget__bg-input: #f0f0f0;--widget__bg-hover: #b8b8b84f;--widget__bg-active: #c2dff2;--widget__focus-ring: #0077f0;--search__bg-find: #707e8859;--widget__bg-error: #f76e6e;--widget__error-ring: #de3d3b;--editor__bg-highlight: #f0f0f0;--editor__bg-selection-match: #339cec22;--editor__line-number: #6c7489;--editor__bg-scrollbar: 207, 10%, 40%;--editor__bg-fold: #424242;--bg-guide-indent: #0012;--pce-ac-icon-class: #d67e00;--pce-ac-icon-enum: #d67e00;--pce-ac-icon-event: #d67e00;--pce-ac-icon-function: #652d90;--pce-ac-icon-interface: #007acc;--pce-ac-icon-variable: #007acc;--pce-ac-match: #0066bf;--pce-tabstop: #0a326433;--pce-invisibles: #3333;--pce-selection: #cbe3f6;color-scheme:light}.match-highlight{--editor__bg-highlight: #7497a633}.pce-match{--search__bg-find: #707e8870}.active-line{--editor__line-number: #111}.active-indent{--bg-guide-indent: #0014}.token.comment,.token.prolog,.token.cdata{color:#5e6578;font-style:italic}.token.namespace{opacity:.7}.token.property{color:#097174}.token.tag,.token.tag>.punctuation,.token.doctype>.punctuation,.token.doctype-tag,.token.attr-equals,.token.keyword,.token.punctuation,.token.literal-property,.token.operator,.token.token.anchor,.token.atrule .rule,.language-css .important,.language-markdown .italic *{color:#8d46b4}[class*=language-],.language-css .punctuation,.block>.punctuation,.language-markdown .code.keyword,.language-markdown .url .content,.token.atrule,.token.parameter{color:#403f53}.selector .punctuation{color:#c792ea}.token.number,.regex .escape,.token.tag>.class-name,.token.unit,.token.color.hexcode,.selector .id{color:#aa0982}.token.boolean,.token.keyword-null{color:#a54a4a}.language-markdown .token.url,.token.deleted{color:#bb374d}.token.color,.selector .combinator,.selector .operator,.token.property-access,.token.quantifier,.token.alternation,.token.url .markup-bracket{color:#097174}.language-regex,.token.regex-flags{color:#3a6a90}.token.attr-name,.token.doctype,.token.variable,.selector .class,.selector .pseudo-element,.selector .pseudo-class,.token.builtin,.language-markdown .bold *,.language-markdown .code.code-snippet,.token.function,.token.constant,.token.keyword-undefined,.token.entity,.token.char-class,.token.token.char-set,.token.title.important,.token.title>.punctuation,.language-markdown .url .variable{color:#3c63b3}.token.inserted{color:#5aa329}.token.selector,.token.attr-value,.token.char,.token.string,.token.string-property{color:#9b504e}.token.attr-value>.punctuation,.token.class-name,.token.maybe-class-name{color:#111}.token.important,.token.bold{font-weight:700}.token.function,.token.keyword,.token.italic,.token.attr-name,.token.pseudo-class,.token.pseudo-element,.selector .class,.selector .id,.token.atrule .rule,.doctype .name{font-style:italic}.language-css .function,.token.alternation,.token.keyword-this,.token.keyword-null,.token.keyword-undefined{font-style:normal}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:#0431fa}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:#277927}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#7b3814}.token.interpolation-punctuation{color:#b73936}.token.bracket-error{color:#ff1212}.token.markup-bracket,.token.regex .punctuation{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #00806fab,inset 0 0 0 9in #198de626}.active-tagname,.word-matches span{background:#471e3c33}";
  }
});

// node_modules/prism-code-editor/dist/night-owl.js
var night_owl_exports = {};
__export(night_owl_exports, {
  default: () => nightOwl
});
var nightOwl;
var init_night_owl = __esm({
  "node_modules/prism-code-editor/dist/night-owl.js"() {
    nightOwl = ".prism-code-editor{caret-color:#80a4c2;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #011627;--widget__border: #122d42;--widget__bg: #021320;--widget__color: #d6deeb;--widget__color-active: #fff;--widget__color-options: #b3bccc;--widget__bg-input: #0b253a;--widget__bg-hover: #5a5d5e80;--widget__bg-active: #122d4266;--widget__focus-ring: #5f7e97;--search__bg-find: #5f7e9778;--widget__bg-error: #ab0300f2;--widget__error-ring: #ef5350;--editor__bg-highlight: #0003;--editor__bg-selection-match: #5f7e9778;--editor__line-number: #4b6479;--editor__bg-scrollbar: 206, 88%, 27%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #5e81ce52;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #1d3b53;color-scheme:dark}.match-highlight{--editor__bg-highlight: #7e57c259}.pce-match{--search__bg-find: #545a8b}.active-line{--editor__line-number: #c5e4fd}.active-indent{--bg-guide-indent: #b3cfe7b3}.token.comment,.token.prolog,.token.cdata{color:#637777;font-style:italic}.token.namespace{opacity:.7}.token.property{color:#80cbc4}.token.keyword,.token.punctuation,.token.literal-property,.token.operator,.token.token.anchor,.token.atrule .rule,.language-css .important,.language-markdown .italic *{color:#c792ea}[class*=language-],.language-css .punctuation,.block>.punctuation,.language-markdown .code.keyword,.language-markdown .url .content{color:#d6deeb}.selector .punctuation{color:#c792ea}.token.tag,.token.doctype-tag{color:#caece6}.token.number,.regex .escape,.token.tag>.class-name{color:#f78c6c}.token.boolean,.token.keyword-null{color:#ff5874}.token.selector{color:#ff6363}.language-markdown .token.url,.token.deleted{color:#ff869a}.token.atrule,.token.parameter{color:#d7dbe0}.token.color,.token.tag>.punctuation,.token.attr-name>.punctuation,.token.doctype>.punctuation,.selector .combinator,.selector .operator,.token.attr-equals,.token.property-access,.token.quantifier,.token.alternation,.token.url .markup-bracket{color:#7fdbca}.token.unit,.token.hexcode{color:#ffeb95}.language-regex,.token.regex-flags{color:#5ca7e4}.selector .id{color:#fad430}.token.attr-value>.punctuation{color:#d9f5dd}.token.attr-name,.token.doctype,.token.variable,.token.inserted,.selector .class,.selector .pseudo-element,.selector .pseudo-class,.token.builtin,.language-markdown .bold *,.language-markdown .code.code-snippet{color:#c5e478}.token.function,.token.constant,.token.keyword-undefined,.token.function .maybe-class-name,.token.entity,.token.char-class,.token.token.char-set,.token.title.important,.token.title>.punctuation,.language-markdown .url .variable{color:#82aaff}.token.attr-value,.token.char,.token.string,.token.string-property{color:#ecc48d}.token.class-name,.token.maybe-class-name{color:#ffcb8b}.token.important,.token.bold{font-weight:700}.token.function,.token.keyword,.token.italic,.token.attr-name,.token.pseudo-class,.token.pseudo-element,.selector .class,.selector .id,.token.atrule .rule,.doctype .name{font-style:italic}.language-css .function{color:#c5e478;font-style:normal}.token.alternation,.token.keyword-this,.token.keyword-null,.token.keyword-undefined{font-style:normal}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:gold}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:orchid}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#179fff}.token.interpolation-punctuation{color:#d3423e}.token.bracket-error{color:#ff1212}.token.markup-bracket,.token.regex .punctuation{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #b3cfe7a1,inset 0 0 0 9in #5f7e974d}.active-tagname,.word-matches span{background:#f6bbe533}";
  }
});

// node_modules/prism-code-editor/dist/prism-okaidia.js
var prism_okaidia_exports = {};
__export(prism_okaidia_exports, {
  default: () => prismOkaidia
});
var prismOkaidia;
var init_prism_okaidia = __esm({
  "node_modules/prism-code-editor/dist/prism-okaidia.js"() {
    prismOkaidia = ".prism-code-editor{caret-color:#f8f8f2;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #272822;--widget__border: #4f5148;--widget__bg: #242622;--widget__color: #cfd1c7;--widget__color-active: #fff;--widget__color-options: #9ea092;--widget__bg-input: #35372f;--widget__bg-hover: #5a5d5e4f;--widget__bg-active: #99947c66;--widget__focus-ring: #99947c;--search__bg-find: #ea5c0054;--widget__bg-error: #5a1d1d;--widget__error-ring: #be1100;--editor__bg-highlight: #36362b;--editor__bg-selection-match: #575b6180;--editor__line-number: #90908a;--editor__bg-scrollbar: 0, 0%, 45%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #9e9f9640;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #575a5a;color-scheme:dark}.pce-match{--search__bg-find: #885a3c}.active-line{--editor__line-number: #c2c2bf}.active-indent{--bg-guide-indent: #dbdbd973}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#8292a2}[class*=language-],.token.punctuation,.token.attr-equals{color:#f8f8f2}.token.namespace{opacity:.7}.token.property,.token.tag,.token.constant,.token.symbol,.token.deleted,.token.block>.keyword,.token.keyword.control-flow,.token.keyword.module{color:#f92672}.token.boolean,.token.number{color:#ae81ff}.token.selector,.token.attr-name,.token.string,.token.string-property,.token.char,.token.builtin,.token.inserted{color:#a6e22e}.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string,.token.variable{color:#f8f8f2}.token.atrule,.token.attr-value,.token.function,.token.class-name{color:#e6db74}.token.keyword{color:#66d9ef}.token.regex,.language-regex,.token.important{color:#fd971f}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:gold}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:orchid}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#179fff}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #888,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#4a4a7680}";
  }
});

// node_modules/prism-code-editor/dist/prism-solarized-light.js
var prism_solarized_light_exports = {};
__export(prism_solarized_light_exports, {
  default: () => prismSolarizedLight
});
var prismSolarizedLight;
var init_prism_solarized_light = __esm({
  "node_modules/prism-code-editor/dist/prism-solarized-light.js"() {
    prismSolarizedLight = ".prism-code-editor{font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #fdf6e3;caret-color:#657b83;--widget__border: #c2c2c2;--widget__bg: #f9f0d7;--widget__color: #405359;--widget__color-active: #000;--widget__color-options: #4f5f64;--widget__bg-input: #fdf6e3;--widget__bg-hover: #b8b8b84f;--widget__bg-active: #6fa3b34d;--widget__focus-ring: #4bafce;--search__bg-find: #eb5e0054;--widget__bg-error: #f2dede;--widget__error-ring: #be1100;--editor__bg-highlight: #eee8d5;--editor__bg-selection-match: #f3f0e299;--editor__line-number: #53abc6;--editor__bg-scrollbar: 0, 0%, 25%;--editor__bg-fold: #424242;--pce-ac-icon-class: #d67e00;--pce-ac-icon-enum: #d67e00;--pce-ac-icon-event: #d67e00;--pce-ac-icon-function: #652d90;--pce-ac-icon-interface: #007acc;--pce-ac-icon-variable: #007acc;--pce-ac-match: #0066bf;--bg-guide-indent: #1d333a40;--pce-tabstop: #0a326433;--pce-invisibles: #3333;--pce-selection: #ede7d4;color-scheme:light}.pce-match{--search__bg-find: #edba8f}.active-line{--editor__line-number: #0b216f}.active-indent{--bg-guide-indent: #081e2580}[class*=language-]{color:#657b83}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#93a1a1}.token.punctuation,.token.attr-equals{color:#586e75}.token.namespace{opacity:.7}.token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted{color:#268bd2}.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.url,.token.inserted{color:#2aa198}.token.entity{color:#657b83;background:#eee8d5}.token.atrule,.token.attr-value,.token.keyword{color:#859900}.token.function,.token.class-name{color:#b58900}.token.regex,.language-regex,.token.important,.token.variable{color:#cb4b16}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:#0431fa}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:#319331}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#7b3814}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #b9b9b9,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#57575740}";
  }
});

// node_modules/prism-code-editor/dist/prism-tomorrow.js
var prism_tomorrow_exports = {};
__export(prism_tomorrow_exports, {
  default: () => prismTomorrow
});
var prismTomorrow;
var init_prism_tomorrow = __esm({
  "node_modules/prism-code-editor/dist/prism-tomorrow.js"() {
    prismTomorrow = ".prism-code-editor{caret-color:#aeafad;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #2d2d2d;--widget__border: #444;--widget__bg: #252526;--widget__color: #ccc;--widget__color-active: #fff;--widget__color-options: #aaa;--widget__bg-input: #3c3c3c;--widget__bg-hover: #5a5d5e80;--widget__bg-active: #007fd466;--widget__focus-ring: #007acc;--search__bg-find: #eb5e0054;--widget__bg-error: #5a1d1d;--widget__error-ring: #be1100;--editor__bg-highlight: #393939;--editor__bg-selection-match: #41414199;--editor__line-number: #888;--editor__bg-scrollbar: 0, 0%, 50%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #9994;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #515151;color-scheme:dark}.match-highlight{--editor__bg-highlight: #282828}.pce-match{--search__bg-find: #515c6a}.active-line{--editor__line-number: #ccc}.active-indent{--bg-guide-indent: #eee6}[class*=language-],.token.punctuation,.token.attr-equals{color:#ccc}.token.comment,.token.block-comment,.token.prolog,.token.doctype,.token.cdata{color:#999}.token.tag,.token.attr-name,.token.namespace,.token.deleted{color:#e2777a}.token.function-name{color:#6196cc}.token.boolean,.token.number,.token.function{color:#f08d49}.token.property,.token.class-name,.token.constant,.token.symbol{color:#f8c555}.token.selector,.token.important,.token.atrule,.token.keyword,.token.builtin{color:#cc99cd}.token.string,.token.char,.token.attr-value,.token.regex,.language-regex,.token.variable{color:#7ec699}.token.operator,.token.entity,.token.url{color:#67cdcc}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.inserted{color:green}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:gold}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:orchid}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#179fff}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #888,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#575757b8}";
  }
});

// node_modules/prism-code-editor/dist/prism-twilight.js
var prism_twilight_exports = {};
__export(prism_twilight_exports, {
  default: () => prismTwilight
});
var prismTwilight;
var init_prism_twilight = __esm({
  "node_modules/prism-code-editor/dist/prism-twilight.js"() {
    prismTwilight = ".prism-code-editor{caret-color:#fff;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #141414;--widget__border: #383838;--widget__bg: #141414;--widget__color: #ccc;--widget__color-active: #fff;--widget__color-options: #aaa;--widget__bg-input: #222;--widget__bg-hover: #282828;--widget__bg-active: #336699;--widget__focus-ring: #5299e0;--search__bg-find: #43474cab;--widget__bg-error: #4d1919;--widget__error-ring: #cc0000;--editor__bg-highlight: #1f1f1f;--editor__bg-selection-match: #27292a80;--editor__line-number: #8292a2;--editor__bg-scrollbar: 0, 0%, 45%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #ededed1f;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #27292a;color-scheme:dark}.pce-match{--search__bg-find: #3a3e41}.active-line{--editor__line-number: #d3d9de}.active-indent{--bg-guide-indent: #ededed3d}[class*=language-]{color:#fff}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#787878}.token.punctuation,.token.namespace{opacity:.7}.token.tag,.token.boolean,.token.number,.token.deleted{color:#cf694a}.token.keyword,.token.property,.token.selector,.token.constant,.token.symbol,.token.builtin{color:#f9ee9a}.token.attr-name,.token.attr-value,.token.string,.token.char,.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string,.token.variable,.token.inserted{color:#919e6b}.token.atrule{color:#7386a5}.token.regex,.language-regex,.token.important{color:#e9c163}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.tag,.token.attr-name,.tag>.token.punctuation,.token.attr-equals{color:#ad895c}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:gold;opacity:1}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:orchid;opacity:1}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#179fff;opacity:1}.token.bracket-error{color:#ff1212cc;opacity:1}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #888,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#575757b8}";
  }
});

// node_modules/prism-code-editor/dist/prism.js
var prism_exports = {};
__export(prism_exports, {
  default: () => prism
});
var prism;
var init_prism = __esm({
  "node_modules/prism-code-editor/dist/prism.js"() {
    prism = ".prism-code-editor{caret-color:#000;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #f5f2f0;--widget__border: #bfbfbf;--widget__bg: #edeae8;--widget__color: #444;--widget__color-active: #000;--widget__color-options: #666;--widget__bg-input: #f5f2f0;--widget__bg-hover: #b8b8b84f;--widget__bg-active: #c2dff2;--widget__focus-ring: #0077f0;--search__bg-find: #ea5c0054;--widget__bg-error: #f2dede;--widget__error-ring: #be1100;--editor__bg-highlight: #eae8e6;--editor__bg-selection-match: #b6d5fc80;--editor__line-number: #9d897b;--editor__bg-scrollbar: 24, 7%, 35%;--editor__bg-fold: #424242;--bg-guide-indent: #4b413a33;--pce-ac-icon-class: #d67e00;--pce-ac-icon-enum: #d67e00;--pce-ac-icon-event: #d67e00;--pce-ac-icon-function: #652d90;--pce-ac-icon-interface: #007acc;--pce-ac-icon-variable: #007acc;--pce-ac-match: #0066bf;--pce-tabstop: #0a326433;--pce-invisibles: #3333;--pce-selection: #b6d5fc;color-scheme:light}.pce-match{--search__bg-find: #c7ada9}.active-line{--editor__line-number: #4d3a2e}.active-indent{--bg-guide-indent: #38322f66}[class*=language-]{color:#000}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#708090}.token.punctuation,.token.attr-equals{color:#999}.token.namespace{opacity:.7}.token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted{color:#905}.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted{color:#690}.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string{color:#9a6e3a}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.function,.token.class-name{color:#dd4a68}.token.regex,.language-regex,.token.important,.token.variable{color:#e90}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:#0431fa}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:#319331}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#7b3814}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #b9b9b9,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#57575740}";
  }
});

// node_modules/prism-code-editor/dist/vs-code-dark.js
var vs_code_dark_exports = {};
__export(vs_code_dark_exports, {
  default: () => vsCodeDark
});
var vsCodeDark;
var init_vs_code_dark = __esm({
  "node_modules/prism-code-editor/dist/vs-code-dark.js"() {
    vsCodeDark = ".prism-code-editor{caret-color:#aeafad;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #1e1e1e;--widget__border: #444;--widget__bg: #1e1e1e;--widget__color: #ccc;--widget__color-active: #fff;--widget__color-options: #aaa;--widget__bg-input: #262626;--widget__bg-hover: #2e2e2e;--widget__bg-active: #336699;--widget__focus-ring: #5299e0;--search__bg-find: #eb5e0054;--widget__bg-error: #4d1919;--widget__error-ring: #cc0000;--editor__border-highlight: 2px solid #282828;--editor__bg-selection-match: #add6ff26;--editor__line-number: #888;--editor__bg-scrollbar: 0, 0%, 50%;--editor__bg-fold: #c5c5c5;--bg-guide-indent: #9994;--pce-ac-icon-class: #ee9d28;--pce-ac-icon-enum: #ee9d28;--pce-ac-icon-event: #ee9d28;--pce-ac-icon-function: #b180d7;--pce-ac-icon-interface: #75beff;--pce-ac-icon-variable: #75beff;--pce-selection: #264f78;color-scheme:dark}.match-highlight{--editor__bg-highlight: #282828}.pce-match{--search__bg-find: #675451}.active-line{--editor__line-number: #ccc}.active-indent{--bg-guide-indent: #eee6}[class*=language-]{color:#9cdcfe}.token.namespace{opacity:.7}.token.comment,.token.prolog,.token.blockquote.punctuation{color:#6a9955}.pce-tooltip,.token.punctuation,.token.attr-equals,.token.operator,.token.combinator,.token.plain-text{color:#d4d4d4}.token.number,.token.symbol,.token.inserted,.token.unit{color:#b5cea8}.token.regex,.language-regex,.token.regex .punctuation,.token.group,.token.string,.token.string-property.property,.token.char,.token.deleted,.token.attr-value,.token.attr-value:not(.script):not(.style)>.punctuation,.token.color{color:#ce9178}.url .token.string.url{text-decoration:underline}.token.doctype,.token.operator.arrow,.token.keyword,.token.important,.token.boolean,.token.tag,.token.entity,.token.regex-flags{color:#569cd6}.token.atrule .token.rule{color:#c586c0}.token.function,.token.alternation{color:#dcdcaa}.token.italic{font-style:italic}.token.strike{text-decoration:line-through}.token.class-name,.token.builtin,.token.maybe-class-name{color:#4ec9b0}.token.doctype .name,.token.atrule,.token.atrule .url,.token.property,.token.variable,.token.parameter,.token.interpolation,.token.attr-name{color:#9cdcfe}.token.selector,.token.escape{color:#d7ba7d}.token.tag>.punctuation,.token.doctype>.punctuation,.token.cdata{color:gray}.token.namespace{color:#4ec9b0}.token.constant{color:#4fc1ff}.token.char-set,.token.regex .operator{color:#d16969}.language-markup,.language-markdown,.language-md,.language-html,.language-xml,.language-svg,.language-text,.language-vue,.language-svelte,.language-astro,.language-css,.language-sass,.language-scss{color:#d4d4d4}.token.important.title .punctuation,.token.list.punctuation,.language-markdown .token.bold *{color:#569cd6}.language-markdown .token.code>.punctuation,.language-markdown .token.code.keyword{color:#d4d4d4}.language-markdown .token.url .content,.language-markdown .token.code-snippet.keyword,.token.url-reference .variable{color:#ce9178}.token.quantifier{color:#d7ba7d}.token.block>.keyword,.token.keyword.module,.token.keyword.control-flow,.token.keyword-if,.token.keyword-else,.token.keyword-return,.token.keyword-switch,.token.keyword-case,.token.keyword-default,.token.keyword-import,.token.keyword-from,.token.keyword-export,.token.keyword-as,.token.keyword-for,.token.keyword-while,.token.keyword-break,.token.keyword-continue,.token.keyword-try,.token.keyword-catch,.token.keyword-finally,.token.keyword-throw,.token.keyword-yield,.token.keyword-await{color:#c586c0}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:gold}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:orchid}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#179fff}.token.interpolation-punctuation{color:#569cd6}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #888,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#575757b8}";
  }
});

// node_modules/prism-code-editor/dist/vs-code-light.js
var vs_code_light_exports = {};
__export(vs_code_light_exports, {
  default: () => vsCodeLight
});
var vsCodeLight;
var init_vs_code_light = __esm({
  "node_modules/prism-code-editor/dist/vs-code-light.js"() {
    vsCodeLight = ".prism-code-editor{caret-color:#000;font-family:Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;--editor__bg: #fff;--widget__border: #bfbfbf;--widget__bg: #f8f8f8;--widget__color: #444;--widget__color-active: #000;--widget__color-options: #666;--widget__bg-input: #fff;--widget__bg-hover: #b8b8b84f;--widget__bg-active: #c2dff2;--widget__focus-ring: #0077f0;--search__bg-find: #ea5c0054;--widget__bg-error: #f2dede;--widget__error-ring: #be1100;--editor__border-highlight: 2px solid #eee;--editor__bg-selection-match: #add6ff80;--editor__line-number: #53abc6;--editor__bg-scrollbar: 0, 0%, 25%;--editor__bg-fold: #424242;--bg-guide-indent: #3333;--pce-ac-icon-class: #d67e00;--pce-ac-icon-enum: #d67e00;--pce-ac-icon-event: #d67e00;--pce-ac-icon-function: #652d90;--pce-ac-icon-interface: #007acc;--pce-ac-icon-variable: #007acc;--pce-ac-match: #0066bf;--pce-tabstop: #0a326433;--pce-invisibles: #3333;--pce-selection: #add6ff;color-scheme:light}.match-highlight{--editor__bg-highlight: #eee}.pce-match{--search__bg-find: #c1adab}.active-line{--editor__line-number: #0b216f}.active-indent{--bg-guide-indent: #0006}.pce-tooltip{color:#333}.token.namespace{opacity:.7}.token.comment,.token.prolog{color:green}.token.number,.token.symbol,.token.inserted,.token.unit{color:#098658}.token.string,.token.string-property.property,.token.char,.token.deleted{color:#a31515}.language-css .token.url{color:#001080}.token.string.url{text-decoration:underline}.token.operator,.token.combinator,.token.punctuation,.token.attr-equals,.token.plain-text,.token.quantifier.number{color:#000}.token.operator.arrow,.token.keyword,.token.important,.token.boolean,.token.entity,.token.attr-value,.token.attr-value:not(.script):not(.style)>.punctuation,.token.regex-flags{color:#00f}.token.atrule .token.rule{color:#af00db}.token.function{color:#795e26}.token.italic{font-style:italic}.token.bold,.token.important{font-weight:700}.token.strike{text-decoration:line-through}.token.class-name,.token.builtin,.token.maybe-class-name{color:#267f99}.token.doctype .name,.token.property,.token.anchor,.token.alternation,.token.attr-name{color:#e50000}.token.variable,.token.parameter,.token.literal-property,.token.atrule{color:#001080}.token.doctype,.token.doctype>.punctuation,.token.selector,.token.escape,.token.tag,.token.tag>.punctuation,.token.cdata{color:maroon}.token.namespace{color:#4ec9b0}.token.constant{color:#0070c1}[class*=language-]{color:#001080}.token.regex,.language-regex,.token.char-set,.token.char-class .operator{color:#811f3f}.language-markup,.language-markdown,.language-md,.language-html,.language-xml,.language-svg,.language-text,.language-vue,.language-svelte,.language-astro,.language-css,.language-scss,.language-sass{color:#000}.token.color,.token.blockquote.punctuation,.token.list.punctuation{color:#0451a5}.language-markdown .token.bold *{color:navy}.language-markdown .token.code>.punctuation,.language-markdown .token.code.keyword{color:#000}.token.important.title *,.token.important.title,.language-markdown .token.code-snippet.keyword{color:maroon}.language-markdown .token.url .content,.token.url-reference .variable,.token.regex .punctuation{color:#a31515}.token.block>.keyword,.token.keyword.module,.token.keyword.control-flow,.token.keyword-if,.token.keyword-else,.token.keyword-return,.token.keyword-switch,.token.keyword-case,.token.keyword-default,.token.keyword-import,.token.keyword-from,.token.keyword-export,.token.keyword-as,.token.keyword-for,.token.keyword-while,.token.keyword-break,.token.keyword-continue,.token.keyword-try,.token.keyword-catch,.token.keyword-finally,.token.keyword-throw,.token.keyword-yield,.token.keyword-await{color:#af00db}.token.bracket-level-0,.token.bracket-level-3,.token.bracket-level-6,.token.bracket-level-9{color:#0431fa}.token.bracket-level-1,.token.bracket-level-4,.token.bracket-level-7,.token.bracket-level-10{color:#319331}.token.bracket-level-2,.token.bracket-level-5,.token.bracket-level-8,.token.bracket-level-11{color:#7b3814}.token.interpolation-punctuation{color:#00f}.token.bracket-error{color:#ff1212cc}.token.markup-bracket{color:inherit}.active-bracket{box-shadow:inset 0 0 0 1px #b9b9b9,inset 0 0 0 9in #0064001a}.active-tagname,.word-matches span{background:#57575740}";
  }
});

// node_modules/prism-code-editor/dist/styles-pBF7Jo4d.js
var styles_pBF7Jo4d_exports = {};
__export(styles_pBF7Jo4d_exports, {
  default: () => styles
});
var layout, rtlLayout, scroll, guides, styles;
var init_styles_pBF7Jo4d = __esm({
  "node_modules/prism-code-editor/dist/styles-pBF7Jo4d.js"() {
    layout = '.prism-code-editor{overflow:auto;display:grid;background:var(--editor__bg);line-height:1.4;--_pse: var(--padding-inline, .75em);--_ns: var(--number-spacing, .75em);--padding-left: var(--_pse);--_sp: var(--pce-scroll-padding, 2ch);scroll-padding:var(--_sp);-webkit-user-select:none;user-select:none;isolation:isolate;white-space:pre}.show-line-numbers{--padding-left: calc(var(--_pse) + var(--number-width) + var(--_ns));scroll-padding-left:calc(var(--padding-left) + var(--_sp));grid:1fr / 0 1fr}.pce-wrapper{margin:.5em 0;position:relative;pointer-events:none;-webkit-text-size-adjust:none;text-size-adjust:none}.pce-textarea{all:unset;box-sizing:border-box;height:100%;width:100%;color:#0000;-webkit-user-select:auto;user-select:auto;overflow:hidden;pointer-events:auto}.pce-textarea::selection{background:var(--pce-selection);color:#0000}.pce-no-selection textarea:focus{z-index:1}.pce-line,.pce-textarea{padding:0 var(--_pse) 0 var(--padding-left);position:relative}.show-line-numbers .pce-line:before{content:attr(data-line);display:inline-block;margin:0 0 0 calc(-1 * var(--padding-left));padding:0 var(--_ns) 0 0;box-sizing:border-box;color:var(--editor__line-number);text-align:end}.show-line-numbers:before{content:"";background:inherit;pointer-events:none}.show-line-numbers:before,.pce-line:before{position:sticky;height:100%;z-index:2;left:0;width:var(--padding-left)}.pce-wrap .pce-line:before{position:absolute;margin:0}.pce-overlays,.pce-overlays>*,pre.pce-guides .pce-line:after,.pce-no-selection .active-line:after,.active-line.match-highlight:after{content:"";position:absolute;top:0;right:0;bottom:0;left:0}.show-line-numbers .pce-line:after{left:var(--padding-left)}.active-line:after{border:var(--editor__border-highlight);background:var(--editor__bg-highlight);z-index:-2}.pce-wrap{white-space:pre-wrap;word-break:break-word}.selection-matches span{background:var(--editor__bg-selection-match)}.pce-nowrap .active-bracket{display:inline-block}';
    rtlLayout = ".pce-rtl.pce-rtl{direction:rtl}.pce-rtl.show-line-numbers{scroll-padding:var(--_sp) calc(var(--padding-left) + var(--_sp)) var(--_sp) var(--_sp)}.pce-rtl.pce-rtl:before,.pce-rtl .pce-line:before{left:auto;right:0;background:none}.pce-rtl textarea,.pce-rtl .word-matches,.pce-rtl .pce-invisibles,.pce-rtl .pce-matches,.pce-rtl .selection-matches{padding:0 var(--padding-left) 0 var(--_pse)!important}.pce-rtl .guide-indents{left:auto!important;right:var(--padding-left);transform:scaleX(-1)}.pce-rtl .pce-copy:after{left:calc(100% + .5em);right:auto}.pce-rtl.show-line-numbers .pce-line:before{padding:0 0 0 var(--_ns);background:var(--editor__bg)}.pce-rtl.pce-nowrap .pce-line:before{margin:0 calc(-1 * var(--padding-left)) 0 0}.pce-rtl .pce-line{padding:0 var(--padding-left) 0 var(--_pse)}.pce-rtl.pce-nowrap .pce-fold{right:calc(2px + var(--padding-left) - var(--_ns))}.pce-rtl .pce-fold{margin:0 calc(2px - var(--_ns)) 0 0}.pce-rtl .closed-fold>:after{transform:translateY(-50%) rotate(90deg)}div.pce-rtl .active-bracket{display:inline}";
    scroll = "@media (hover: hover){.prism-code-editor::-webkit-scrollbar-corner,.prism-code-editor::-webkit-scrollbar-track,.prism-code-editor ::-webkit-scrollbar-corner,.prism-code-editor ::-webkit-scrollbar-track{background:#0000}.prism-code-editor::-webkit-scrollbar,.prism-code-editor ::-webkit-scrollbar{height:1em;width:1em}.prism-code-editor::-webkit-scrollbar-thumb,.prism-code-editor ::-webkit-scrollbar-thumb{background:hsla(var(--editor__bg-scrollbar),.36);width:2em;height:2em}.prism-code-editor::-webkit-scrollbar-thumb:hover,.prism-code-editor ::-webkit-scrollbar-thumb:hover{background:hsla(var(--editor__bg-scrollbar),.5)}.prism-code-editor::-webkit-scrollbar-thumb:active,.prism-code-editor ::-webkit-scrollbar-thumb:active{background:hsla(var(--editor__bg-scrollbar),.66)}}";
    guides = "div.guide-indents{left:var(--padding-left);bottom:auto;right:auto}.guide-indents div{width:1px;position:absolute;background:var(--bg-guide-indent)}";
    styles = layout + rtlLayout + scroll + guides;
  }
});

// node_modules/prism-code-editor/dist/languages/abap.js
var init_abap = __esm({
  "node_modules/prism-code-editor/dist/languages/abap.js"() {
    init_index_CKRNGLIi();
    languageMap.abap = {
      comments: {
        line: '"'
      }
    };
  }
});

// node_modules/prism-code-editor/dist/shared-Sq5P6lf6.js
var replace, re;
var init_shared_Sq5P6lf6 = __esm({
  "node_modules/prism-code-editor/dist/shared-Sq5P6lf6.js"() {
    replace = (pattern, replacements) => pattern.replace(/<(\d+)>/g, (m, index) => `(?:${replacements[+index]})`);
    re = (pattern, replacements, flags) => RegExp(replace(pattern, replacements), flags);
  }
});

// node_modules/prism-code-editor/dist/jsx-shared-Dd7t2otl.js
var space, braces;
var init_jsx_shared_Dd7t2otl = __esm({
  "node_modules/prism-code-editor/dist/jsx-shared-Dd7t2otl.js"() {
    space = "\\s|//.*(?!.)|/\\*(?:[^*]|\\*(?!/))*\\*/";
    braces = "\\{(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{[^}]*\\})*\\})*\\})*\\}";
  }
});

// node_modules/prism-code-editor/dist/index-BvZmi6ce.js
var scrollToEl, getLineStart, getLineEnd, addTextareaListener, getStyleValue, getPosition, updateNode, voidlessLangs, voidTags, prevSelection, regexEscape, getLineBefore, getLines, getClosestToken, getLanguage, insertText, setSelection, userAgent, isMac, isChrome, isWebKit, getModifierCode, addOverlay;
var init_index_BvZmi6ce = __esm({
  "node_modules/prism-code-editor/dist/index-BvZmi6ce.js"() {
    init_index_CKRNGLIi();
    init_index_C1_GGQ8y();
    scrollToEl = (editor, el, paddingTop = 0) => {
      const style2 = editor.container.style;
      style2.scrollPaddingBlock = `calc(var(--_sp) + ${paddingTop}px) calc(var(--_sp) + ${isChrome && !el.textContent ? el.offsetHeight : 0}px)`;
      el.scrollIntoView({ block: "nearest" });
      style2.scrollPaddingBlock = "";
    };
    getLineStart = (text, position) => position ? text.lastIndexOf("\n", position - 1) + 1 : 0;
    getLineEnd = (text, position) => (position = text.indexOf("\n", position)) + 1 ? position : text.length;
    addTextareaListener = (editor, type, listener, options) => addListener(editor.textarea, type, listener, options);
    getStyleValue = (el, prop) => parseFloat(getComputedStyle(el)[prop]);
    getPosition = (editor, el) => {
      const rect1 = el.getBoundingClientRect();
      const rect2 = editor.lines[0].getBoundingClientRect();
      return {
        top: rect1.y - rect2.y,
        bottom: rect2.bottom - rect1.bottom,
        left: rect1.x - rect2.x,
        right: rect2.right - rect1.right,
        height: rect1.height
      };
    };
    updateNode = (node, text) => {
      if (node.data != text) node.data = text;
    };
    voidlessLangs = new Set("xml,rss,atom,jsx,tsx,xquery,xeora,xeoracube,actionscript".split(","));
    voidTags = /^(?:area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/i;
    regexEscape = (str) => str.replace(/[$+?|.^*()[\]{}\\]/g, "\\$&");
    getLineBefore = (text, position) => text.slice(getLineStart(text, position), position);
    getLines = (text, start, end = start) => [
      text.slice(start = getLineStart(text, start), end = getLineEnd(text, end)).split("\n"),
      start,
      end
    ];
    getClosestToken = (editor, selector, marginLeft = 0, marginRight = marginLeft, position = editor.getSelection()[0]) => {
      const value = editor.value;
      const line = editor.lines[numLines(value, 0, position)];
      const walker = doc.createTreeWalker(line, 5);
      let node = walker.lastChild();
      let offset = getLineEnd(value, position) + 1 - position - node.length;
      while (-offset <= marginRight && (node = walker.previousNode())) {
        if (node.lastChild) continue;
        offset -= node.length || 0;
        if (offset <= marginLeft) {
          for (; node != line; node = node.parentNode) {
            if (node.matches?.(selector)) return node;
          }
        }
      }
    };
    getLanguage = (editor, position) => getClosestToken(editor, "[class*=language-]", 0, 0, position)?.className.match(
      /language-(\S*)/
    )[1] || editor.options.language;
    insertText = (editor, text, start, end, newCursorStart, newCursorEnd) => {
      if (editor.options.readOnly) return;
      prevSelection = editor.getSelection();
      end ??= start;
      let textarea = editor.textarea;
      let value = editor.value;
      let avoidBug = isChrome && !value[end ?? prevSelection[1]] && /\n$/.test(text) && /^$|\n$/.test(value);
      let removeListener;
      editor.focused || textarea.focus();
      if (start != null) textarea.setSelectionRange(start, end);
      if (newCursorStart != null) {
        removeListener = editor.on("update", () => {
          textarea.setSelectionRange(
            newCursorStart,
            newCursorEnd ?? newCursorStart,
            prevSelection[2]
          );
          removeListener();
        });
      }
      isWebKit || textarea.dispatchEvent(new InputEvent("beforeinput", { data: text }));
      if (isChrome || isWebKit) {
        if (avoidBug) {
          textarea.selectionEnd--;
          text = text.slice(0, -1);
        }
        if (isWebKit) text += "\n";
        doc.execCommand(text ? "insertHTML" : "delete", false, escapeHtml(text, /</g, "&lt;"));
        if (avoidBug) textarea.selectionStart++;
      } else doc.execCommand(text ? "insertText" : "delete", false, text);
      prevSelection = 0;
    };
    setSelection = (editor, start, end = start, direction) => {
      let focused = editor.focused;
      let textarea = editor.textarea;
      let relatedTarget;
      if (!focused) {
        addListener(
          textarea,
          "focus",
          (e) => {
            relatedTarget = e.relatedTarget;
          },
          { once: true }
        );
        textarea.focus();
      }
      textarea.setSelectionRange(start, end, direction);
      selectionChange(!(!focused && (relatedTarget ? relatedTarget.focus() : textarea.blur())));
    };
    userAgent = doc ? navigator.userAgent : "";
    isMac = doc ? /Mac|iPhone|iPod|iPad/i.test(navigator.platform) : false;
    isChrome = /Chrome\//.test(userAgent);
    isWebKit = !isChrome && /AppleWebKit\//.test(userAgent);
    getModifierCode = (e) => e.altKey + e.ctrlKey * 2 + e.metaKey * 4 + e.shiftKey * 8;
    addOverlay = (editor, overlay) => editor.lines[0].append(overlay);
  }
});

// node_modules/prism-code-editor/dist/index-ByhqCQJ3.js
var clikeIndent, isBracketPair, xmlOpeningTag, xmlClosingTag, openBracket, astroOpeningTag, testBracketPair, clikeComment, isOpen, htmlAutoIndent, markupComment, markupLanguage, autoCloseTags, bracketIndenting, markupTemplateLang;
var init_index_ByhqCQJ3 = __esm({
  "node_modules/prism-code-editor/dist/index-ByhqCQJ3.js"() {
    init_index_CKRNGLIi();
    init_jsx_shared_Dd7t2otl();
    init_shared_Sq5P6lf6();
    init_index_BvZmi6ce();
    clikeIndent = /[([{][^)\]}]*$|^[^.]*\b(?:case .+?|default):\s*$/;
    isBracketPair = /\[]|\(\)|{}/;
    xmlOpeningTag = /<(?![\d?!#@])([^\s/=>$<%]+)(?:\s(?:\s*[^\s/"'=>]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s"'=>]+(?=[\s>]))?|(?=[\s/>])))+)?\s*>[ 	]*$/;
    xmlClosingTag = /^<\/(?!\d)[^\s/=>$<%]+\s*>/;
    openBracket = /[([{][^)\]}]*$/;
    astroOpeningTag = /* @__PURE__ */ re(
      `<(?:(?![\\d!])([^\\s%=<>/]+)(?:\\s(?:\\s*(?:[^\\s{=<>/]+(?:\\s*=\\s*(?!\\s)(?:"[^"]*"|'[^']*'|[^\\s{=<>/"']+(?=[\\s/>])|<0>)?|(?=[\\s/>]))|<0>))*)?\\s*)?>[ 	]*$`,
      [braces]
    );
    testBracketPair = ([start, end], value) => {
      return isBracketPair.test(value[start - 1] + value[end]);
    };
    clikeComment = {
      line: "//",
      block: ["/*", "*/"]
    };
    isOpen = (match, voidTags2) => !!match && !voidTags2?.test(match[1]);
    htmlAutoIndent = (tagPattern, voidTags2) => [
      ([start], value) => isOpen(value.slice(0, start).match(tagPattern), voidTags2) || openBracket.test(getLineBefore(value, start)),
      (selection, value) => testBracketPair(selection, value) || isOpen(value.slice(0, selection[0]).match(tagPattern), voidTags2) && xmlClosingTag.test(value.slice(selection[1]))
    ];
    markupComment = {
      block: ["<!--", "-->"]
    };
    markupLanguage = (comment2 = markupComment, tagPattern = xmlOpeningTag, voidTags2) => ({
      comments: comment2,
      autoIndent: htmlAutoIndent(tagPattern, voidTags2),
      autoCloseTags: ([start, end], value, editor) => {
        return autoCloseTags(editor, start, end, value, tagPattern, voidTags2);
      }
    });
    autoCloseTags = (editor, start, end, value, tagPattern, voidTags2) => {
      if (start == end) {
        let match = tagPattern.exec(value.slice(0, start) + ">");
        let tagMatcher = editor.extensions.matchTags;
        if (match && (match = match[1] || "", !voidTags2?.test(match))) {
          if (tagMatcher) {
            let { pairs, tags } = tagMatcher;
            for (let i = tags.length; i; ) {
              let tag = tags[--i];
              if (tag[1] >= start && tag[4] && tag[5] && tag[3] == match && pairs[i] == null) {
                return;
              }
            }
          }
          return `</${match}>`;
        }
      }
    };
    bracketIndenting = (comments = clikeComment, indentPattern = openBracket) => ({
      comments,
      autoIndent: [
        ([start], value) => indentPattern.test(getLineBefore(value, start)),
        testBracketPair
      ]
    });
    markupTemplateLang = (name, comments) => languageMap[name] = {
      comments,
      autoIndent: htmlAutoIndent(xmlOpeningTag, voidTags),
      autoCloseTags: ([start, end], value, editor) => {
        return getClosestToken(editor, "." + name, 0, 0, start) ? "" : autoCloseTags(editor, start, end, value, xmlOpeningTag, voidTags);
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/abnf.js
var init_abnf = __esm({
  "node_modules/prism-code-editor/dist/languages/abnf.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.abnf = bracketIndenting({ line: ";" });
  }
});

// node_modules/prism-code-editor/dist/languages/actionscript.js
var init_actionscript = __esm({
  "node_modules/prism-code-editor/dist/languages/actionscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.actionscript = markupLanguage(clikeComment);
  }
});

// node_modules/prism-code-editor/dist/languages/ada.js
var init_ada = __esm({
  "node_modules/prism-code-editor/dist/languages/ada.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ada = bracketIndenting({ line: "--" });
  }
});

// node_modules/prism-code-editor/dist/languages/agda.js
var init_agda = __esm({
  "node_modules/prism-code-editor/dist/languages/agda.js"() {
    init_index_CKRNGLIi();
    languageMap.agda = {
      comments: {
        line: "--"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/al.js
var init_al = __esm({
  "node_modules/prism-code-editor/dist/languages/al.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.al = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/antlr4.js
var init_antlr4 = __esm({
  "node_modules/prism-code-editor/dist/languages/antlr4.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.g4 = languageMap.antlr4 = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/apacheconf.js
var init_apacheconf = __esm({
  "node_modules/prism-code-editor/dist/languages/apacheconf.js"() {
    init_index_CKRNGLIi();
    init_index_BvZmi6ce();
    languageMap.apacheconf = {
      comments: {
        line: "#"
      },
      autoIndent: [
        ([start], value) => /<\w+\b.*>[ 	]*$/.test(getLineBefore(value, start)),
        ([start, end], value) => /<\w+\b.*>$/.test(getLineBefore(value, start)) && /^<\/\w+\b.*>/.test(value.slice(end))
      ],
      autoCloseTags([start], value) {
        let match = /<(\w+)\b.*>/.exec(getLineBefore(value, start) + ">");
        return match && `</${match[1]}>`;
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/apex.js
var init_apex = __esm({
  "node_modules/prism-code-editor/dist/languages/apex.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.apex = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/apl.js
var init_apl = __esm({
  "node_modules/prism-code-editor/dist/languages/apl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.apl = bracketIndenting({ line: "\u235D" });
  }
});

// node_modules/prism-code-editor/dist/languages/applescript.js
var init_applescript = __esm({
  "node_modules/prism-code-editor/dist/languages/applescript.js"() {
    init_index_CKRNGLIi();
    languageMap.applescript = {
      comments: {
        line: "--",
        block: ["(*", "*)"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/aql.js
var init_aql = __esm({
  "node_modules/prism-code-editor/dist/languages/aql.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.aql = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/arduino.js
var init_arduino = __esm({
  "node_modules/prism-code-editor/dist/languages/arduino.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ino = languageMap.arduino = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/arff.js
var init_arff = __esm({
  "node_modules/prism-code-editor/dist/languages/arff.js"() {
    init_index_CKRNGLIi();
    languageMap.arff = {
      comments: {
        line: "%"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/arturo.js
var init_arturo = __esm({
  "node_modules/prism-code-editor/dist/languages/arturo.js"() {
    init_index_CKRNGLIi();
    languageMap.art = languageMap.arturo = {
      comments: {
        line: ";"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/asciidoc.js
var init_asciidoc = __esm({
  "node_modules/prism-code-editor/dist/languages/asciidoc.js"() {
    init_index_CKRNGLIi();
    languageMap.adoc = languageMap.asciidoc = {
      comments: {
        line: "//"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/asm.js
var init_asm = __esm({
  "node_modules/prism-code-editor/dist/languages/asm.js"() {
    init_index_CKRNGLIi();
    languageMap["arm-asm"] = languageMap.armasm = languageMap.asm6502 = languageMap.asmatmel = languageMap.nasm = { comments: { line: ";" } };
  }
});

// node_modules/prism-code-editor/dist/languages/aspnet.js
var init_aspnet = __esm({
  "node_modules/prism-code-editor/dist/languages/aspnet.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.aspnet = markupLanguage({ block: ["<%--", "--%>"] }, xmlOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/astro.js
var init_astro = __esm({
  "node_modules/prism-code-editor/dist/languages/astro.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.astro = markupLanguage(markupComment, astroOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/autohotkey.js
var init_autohotkey = __esm({
  "node_modules/prism-code-editor/dist/languages/autohotkey.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.autohotkey = bracketIndenting({
      line: ";",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/autoit.js
var init_autoit = __esm({
  "node_modules/prism-code-editor/dist/languages/autoit.js"() {
    init_index_CKRNGLIi();
    languageMap.autoit = {
      comments: {
        line: ";",
        block: ["#cs", "#ce"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/avisynth.js
var init_avisynth = __esm({
  "node_modules/prism-code-editor/dist/languages/avisynth.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.avs = languageMap.avisynth = bracketIndenting({
      line: "#",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/avro-idl.js
var init_avro_idl = __esm({
  "node_modules/prism-code-editor/dist/languages/avro-idl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.avdl = languageMap["avro-idl"] = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/awk.js
var init_awk = __esm({
  "node_modules/prism-code-editor/dist/languages/awk.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.awk = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/bash.js
var init_bash = __esm({
  "node_modules/prism-code-editor/dist/languages/bash.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.sh = languageMap.shell = languageMap.bash = bracketIndenting({ line: "#" });
  }
});

// node_modules/prism-code-editor/dist/languages/basic.js
var init_basic = __esm({
  "node_modules/prism-code-editor/dist/languages/basic.js"() {
    init_index_CKRNGLIi();
    languageMap.basic = {
      comments: {
        line: "!"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/batch.js
var init_batch = __esm({
  "node_modules/prism-code-editor/dist/languages/batch.js"() {
    init_index_CKRNGLIi();
    languageMap.batch = {
      comments: {
        line: "::"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/bbj.js
var init_bbj = __esm({
  "node_modules/prism-code-editor/dist/languages/bbj.js"() {
    init_index_CKRNGLIi();
    languageMap.bbj = {
      comments: {
        line: "REM"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/bicep.js
var init_bicep = __esm({
  "node_modules/prism-code-editor/dist/languages/bicep.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.bicep = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/birb.js
var init_birb = __esm({
  "node_modules/prism-code-editor/dist/languages/birb.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.birb = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/bison.js
var init_bison = __esm({
  "node_modules/prism-code-editor/dist/languages/bison.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.bison = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/bqn.js
var init_bqn = __esm({
  "node_modules/prism-code-editor/dist/languages/bqn.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.bqn = bracketIndenting({ line: "#" });
  }
});

// node_modules/prism-code-editor/dist/languages/brightscript.js
var init_brightscript = __esm({
  "node_modules/prism-code-editor/dist/languages/brightscript.js"() {
    init_index_CKRNGLIi();
    languageMap.brightscript = {
      comments: { line: "'" }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/bro.js
var init_bro = __esm({
  "node_modules/prism-code-editor/dist/languages/bro.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.bro = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/bsl.js
var init_bsl = __esm({
  "node_modules/prism-code-editor/dist/languages/bsl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.bsl = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/cfscript.js
var init_cfscript = __esm({
  "node_modules/prism-code-editor/dist/languages/cfscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.cfscript = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/chaiscript.js
var init_chaiscript = __esm({
  "node_modules/prism-code-editor/dist/languages/chaiscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.chaiscript = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/cil.js
var init_cil = __esm({
  "node_modules/prism-code-editor/dist/languages/cil.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.cil = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/cilk.js
var init_cilk = __esm({
  "node_modules/prism-code-editor/dist/languages/cilk.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["cilk-c"] = languageMap.cilkc = languageMap.cilk = languageMap["cilk-cpp"] = languageMap.cilkcpp = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/clike.js
var init_clike = __esm({
  "node_modules/prism-code-editor/dist/languages/clike.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.clike = languageMap.js = languageMap.javascript = languageMap.ts = languageMap.typescript = languageMap.java = languageMap.cs = languageMap.csharp = languageMap.c = languageMap.cpp = languageMap.go = languageMap.d = languageMap.dart = languageMap.flow = languageMap.haxe = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/clojure.js
var init_clojure = __esm({
  "node_modules/prism-code-editor/dist/languages/clojure.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.clojure = bracketIndenting({
      line: ";"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/cmake.js
var init_cmake = __esm({
  "node_modules/prism-code-editor/dist/languages/cmake.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.cmake = bracketIndenting({ line: "#", block: ["#[[", "]]"] });
  }
});

// node_modules/prism-code-editor/dist/languages/cobol.js
var init_cobol = __esm({
  "node_modules/prism-code-editor/dist/languages/cobol.js"() {
    init_index_CKRNGLIi();
    languageMap.cobol = {
      comments: {
        line: "*"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/coffeescript.js
var init_coffeescript = __esm({
  "node_modules/prism-code-editor/dist/languages/coffeescript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.coffee = languageMap.coffeescript = bracketIndenting({
      line: "#",
      block: ["###", "###"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/concurnas.js
var init_concurnas = __esm({
  "node_modules/prism-code-editor/dist/languages/concurnas.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.conc = languageMap.concurnas = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/cooklang.js
var init_cooklang = __esm({
  "node_modules/prism-code-editor/dist/languages/cooklang.js"() {
    init_index_CKRNGLIi();
    languageMap.cooklang = {
      comments: {
        line: "--",
        block: ["[-", "-]"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/coq.js
var init_coq = __esm({
  "node_modules/prism-code-editor/dist/languages/coq.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.coq = bracketIndenting({ block: ["(*", "*)"] });
  }
});

// node_modules/prism-code-editor/dist/languages/cshtml.js
var init_cshtml = __esm({
  "node_modules/prism-code-editor/dist/languages/cshtml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.razor = languageMap.cshtml = markupLanguage(
      { block: ["@*", "*@"] },
      xmlOpeningTag,
      voidTags
    );
  }
});

// node_modules/prism-code-editor/dist/languages/css.js
var init_css = __esm({
  "node_modules/prism-code-editor/dist/languages/css.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.css = bracketIndenting({
      block: ["/*", "*/"]
    });
    languageMap.less = languageMap.scss = bracketIndenting();
    languageMap.sass = {
      comments: clikeComment
      // Let's not bother with auto-indenting for sass
    };
  }
});

// node_modules/prism-code-editor/dist/languages/cue.js
var init_cue = __esm({
  "node_modules/prism-code-editor/dist/languages/cue.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.cue = bracketIndenting({ line: "//" });
  }
});

// node_modules/prism-code-editor/dist/languages/cypher.js
var init_cypher = __esm({
  "node_modules/prism-code-editor/dist/languages/cypher.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.cypher = bracketIndenting({ line: "//" });
  }
});

// node_modules/prism-code-editor/dist/languages/dataweave.js
var init_dataweave = __esm({
  "node_modules/prism-code-editor/dist/languages/dataweave.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.dataweave = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/dax.js
var init_dax = __esm({
  "node_modules/prism-code-editor/dist/languages/dax.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.dax = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/dhall.js
var init_dhall = __esm({
  "node_modules/prism-code-editor/dist/languages/dhall.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.dhall = bracketIndenting({
      line: "--",
      block: ["{-", "-}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/django.js
var init_django = __esm({
  "node_modules/prism-code-editor/dist/languages/django.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.jinja2 = markupTemplateLang("django", {
      block: ["{#", "#}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/dns-zone-file.js
var init_dns_zone_file = __esm({
  "node_modules/prism-code-editor/dist/languages/dns-zone-file.js"() {
    init_index_CKRNGLIi();
    languageMap["dns-zone"] = languageMap["dns-zone-file"] = {
      comments: {
        line: ";"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/docker.js
var init_docker = __esm({
  "node_modules/prism-code-editor/dist/languages/docker.js"() {
    init_index_CKRNGLIi();
    languageMap.dockerfile = languageMap.docker = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/dot.js
var init_dot = __esm({
  "node_modules/prism-code-editor/dist/languages/dot.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.gv = languageMap.dot = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/ebnf.js
var init_ebnf = __esm({
  "node_modules/prism-code-editor/dist/languages/ebnf.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ebnf = bracketIndenting({
      block: ["(*", "*)"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/editorconfig.js
var init_editorconfig = __esm({
  "node_modules/prism-code-editor/dist/languages/editorconfig.js"() {
    init_index_CKRNGLIi();
    languageMap.editorconfig = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/eiffel.js
var init_eiffel = __esm({
  "node_modules/prism-code-editor/dist/languages/eiffel.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.eiffel = bracketIndenting({
      line: "--"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/ejs.js
var init_ejs = __esm({
  "node_modules/prism-code-editor/dist/languages/ejs.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.ejs = markupLanguage({ block: ["<%#", "%>"] }, xmlOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/elixir.js
var init_elixir = __esm({
  "node_modules/prism-code-editor/dist/languages/elixir.js"() {
    init_index_CKRNGLIi();
    languageMap.elixir = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/elm.js
var init_elm = __esm({
  "node_modules/prism-code-editor/dist/languages/elm.js"() {
    init_index_CKRNGLIi();
    languageMap.elm = {
      comments: {
        line: "--",
        block: ["{-", "-}"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/html.js
var init_html = __esm({
  "node_modules/prism-code-editor/dist/languages/html.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.markup = languageMap.html = languageMap.markdown = languageMap.md = markupLanguage(markupComment, xmlOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/erb.js
var init_erb = __esm({
  "node_modules/prism-code-editor/dist/languages/erb.js"() {
    init_index_CKRNGLIi();
    init_html();
    languageMap.erb = languageMap.html;
  }
});

// node_modules/prism-code-editor/dist/languages/erlang.js
var init_erlang = __esm({
  "node_modules/prism-code-editor/dist/languages/erlang.js"() {
    init_index_CKRNGLIi();
    languageMap.erlang = {
      comments: {
        line: "%"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/etlua.js
var init_etlua = __esm({
  "node_modules/prism-code-editor/dist/languages/etlua.js"() {
    init_index_CKRNGLIi();
    init_html();
    languageMap.etlua = languageMap.html;
  }
});

// node_modules/prism-code-editor/dist/languages/excel-formula.js
var init_excel_formula = __esm({
  "node_modules/prism-code-editor/dist/languages/excel-formula.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["xlsx"] = languageMap["xls"] = languageMap["excel-formula"] = bracketIndenting({
      block: ['N("', '")']
    });
  }
});

// node_modules/prism-code-editor/dist/languages/factor.js
var init_factor = __esm({
  "node_modules/prism-code-editor/dist/languages/factor.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.factor = bracketIndenting({
      line: "!",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/false.js
var init_false = __esm({
  "node_modules/prism-code-editor/dist/languages/false.js"() {
    init_index_CKRNGLIi();
    languageMap.false = {
      comments: {
        block: ["{", "}"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/firestore-security-rules.js
var init_firestore_security_rules = __esm({
  "node_modules/prism-code-editor/dist/languages/firestore-security-rules.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["firestore-security-rules"] = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/fortran.js
var init_fortran = __esm({
  "node_modules/prism-code-editor/dist/languages/fortran.js"() {
    init_index_CKRNGLIi();
    languageMap.fortran = {
      comments: {
        line: "!"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/fsharp.js
var init_fsharp = __esm({
  "node_modules/prism-code-editor/dist/languages/fsharp.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.fsharp = bracketIndenting({ line: "//", block: ["(*", "*)"] });
  }
});

// node_modules/prism-code-editor/dist/languages/ftl.js
var init_ftl = __esm({
  "node_modules/prism-code-editor/dist/languages/ftl.js"() {
    init_index_ByhqCQJ3();
    markupTemplateLang("ftl", {
      block: ["<#--", "-->"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/gap.js
var init_gap = __esm({
  "node_modules/prism-code-editor/dist/languages/gap.js"() {
    init_index_CKRNGLIi();
    languageMap.gap = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/gcode.js
var init_gcode = __esm({
  "node_modules/prism-code-editor/dist/languages/gcode.js"() {
    init_index_CKRNGLIi();
    languageMap.gcode = {
      comments: {
        line: ";"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/gdscript.js
var init_gdscript = __esm({
  "node_modules/prism-code-editor/dist/languages/gdscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.gdscript = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/gettext.js
var init_gettext = __esm({
  "node_modules/prism-code-editor/dist/languages/gettext.js"() {
    init_index_CKRNGLIi();
    languageMap.gettext = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/gherkin.js
var init_gherkin = __esm({
  "node_modules/prism-code-editor/dist/languages/gherkin.js"() {
    init_index_CKRNGLIi();
    languageMap.gherkin = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/git.js
var init_git = __esm({
  "node_modules/prism-code-editor/dist/languages/git.js"() {
    init_index_CKRNGLIi();
    languageMap.git = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/glsl.js
var init_glsl = __esm({
  "node_modules/prism-code-editor/dist/languages/glsl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.glsl = languageMap.hlsl = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/gml.js
var init_gml = __esm({
  "node_modules/prism-code-editor/dist/languages/gml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.gamemakerlanguage = languageMap.gml = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/gn.js
var init_gn = __esm({
  "node_modules/prism-code-editor/dist/languages/gn.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.gni = languageMap.gn = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/go-module.js
var init_go_module = __esm({
  "node_modules/prism-code-editor/dist/languages/go-module.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["go-mod"] = languageMap["go-module"] = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/gradle.js
var init_gradle = __esm({
  "node_modules/prism-code-editor/dist/languages/gradle.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.gradle = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/graphql.js
var init_graphql = __esm({
  "node_modules/prism-code-editor/dist/languages/graphql.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.graphql = bracketIndenting({ line: "#" });
  }
});

// node_modules/prism-code-editor/dist/languages/groovy.js
var init_groovy = __esm({
  "node_modules/prism-code-editor/dist/languages/groovy.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.groovy = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/haml.js
var init_haml = __esm({
  "node_modules/prism-code-editor/dist/languages/haml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.haml = bracketIndenting({ line: "-#" });
  }
});

// node_modules/prism-code-editor/dist/languages/handlebars.js
var init_handlebars = __esm({
  "node_modules/prism-code-editor/dist/languages/handlebars.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mustache = languageMap.hbs = markupTemplateLang("handlebars", {
      block: ["{{!", "}}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/haskell.js
var init_haskell = __esm({
  "node_modules/prism-code-editor/dist/languages/haskell.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.idr = languageMap.idris = languageMap.hs = languageMap.haskell = languageMap.purs = languageMap.purescript = bracketIndenting({
      line: "--",
      block: ["{-", "-}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/hcl.js
var init_hcl = __esm({
  "node_modules/prism-code-editor/dist/languages/hcl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.hcl = bracketIndenting({
      line: "#",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/hoon.js
var init_hoon = __esm({
  "node_modules/prism-code-editor/dist/languages/hoon.js"() {
    init_index_CKRNGLIi();
    languageMap.hoon = {
      comments: {
        line: "::"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/ichigojam.js
var init_ichigojam = __esm({
  "node_modules/prism-code-editor/dist/languages/ichigojam.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ichigojam = bracketIndenting({
      line: "'"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/icon.js
var init_icon = __esm({
  "node_modules/prism-code-editor/dist/languages/icon.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.icon = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/iecst.js
var init_iecst = __esm({
  "node_modules/prism-code-editor/dist/languages/iecst.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.iecst = bracketIndenting({
      line: "//",
      block: ["(*", "*)"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/ignore.js
var init_ignore = __esm({
  "node_modules/prism-code-editor/dist/languages/ignore.js"() {
    init_index_CKRNGLIi();
    languageMap.npmignore = languageMap.hgignore = languageMap.gitignore = languageMap.ignore = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/inform7.js
var init_inform7 = __esm({
  "node_modules/prism-code-editor/dist/languages/inform7.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.inform7 = bracketIndenting({
      block: ["[", "]"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/ini.js
var init_ini = __esm({
  "node_modules/prism-code-editor/dist/languages/ini.js"() {
    init_index_CKRNGLIi();
    languageMap.ini = {
      comments: {
        line: ";"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/io.js
var init_io = __esm({
  "node_modules/prism-code-editor/dist/languages/io.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.io = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/j.js
var init_j = __esm({
  "node_modules/prism-code-editor/dist/languages/j.js"() {
    init_index_CKRNGLIi();
    languageMap.j = {
      comments: {
        line: "NB."
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/jolie.js
var init_jolie = __esm({
  "node_modules/prism-code-editor/dist/languages/jolie.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.jolie = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/jq.js
var init_jq = __esm({
  "node_modules/prism-code-editor/dist/languages/jq.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.jq = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/json.js
var init_json = __esm({
  "node_modules/prism-code-editor/dist/languages/json.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.json = languageMap.json5 = languageMap.jsonp = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/jsx.js
var openingTag, closingTag2, inJsxContext, jsxComment;
var init_jsx = __esm({
  "node_modules/prism-code-editor/dist/languages/jsx.js"() {
    init_index_CKRNGLIi();
    init_shared_Sq5P6lf6();
    init_jsx_shared_Dd7t2otl();
    init_index_BvZmi6ce();
    init_index_ByhqCQJ3();
    openingTag = re(
      `(?:^|[^$\\w])<(?:(?!\\d)([^\\s%=<>/]+)(?:(?:<0>|<0>*<(?:[^<>=]|=[^<]|=?<(?:[^<>]|<[^<>]*>)*>)*>)(?:<0>*(?:[^\\s"'{=<>/*]+(?:<0>*=<0>*(?!\\s)(?:"[^"]*"|'[^']*'|<1>)?|(?=[\\s/>]))|<1>))*)?<0>*)?>[ 	]*$`,
      [space, braces]
    );
    closingTag2 = /^<\/(?!\d)[^\s%=<>/]*\s*>/;
    inJsxContext = ({ tags, pairs }, { brackets, pairs: bracketPairs }, position) => {
      for (let i = tags.length, tag, min = 0; tag = tags[--i]; ) {
        if (tag[2] > position && tag[1] < position) min = tag[1];
        else if (!tag[4] && tag[5] && tag[1] >= min && tag[2] <= position && !(tags[pairs[i]]?.[1] < position)) {
          for (let i2 = brackets.length, bracket; bracket = brackets[--i2]; ) {
            if (bracket[1] >= tag[2] && bracket[1] < position && bracket[4] == "{" && !(brackets[bracketPairs[i2]]?.[1] < position)) {
              return;
            }
          }
          return true;
        }
      }
    };
    jsxComment = {
      block: ["{/*", "*/}"]
    };
    languageMap.jsx = languageMap.tsx = {
      comments: clikeComment,
      getComments(editor, position) {
        const { matchBrackets: matchBrackets2, matchTags: matchTags2 } = editor.extensions;
        const inJsx = matchBrackets2 && matchTags2 ? inJsxContext(matchTags2, matchBrackets2, position) : getClosestToken(editor, ".plain-text", 0, 0, position);
        return inJsx ? jsxComment : clikeComment;
      },
      autoIndent: [
        ([start], value) => openingTag.test(value.slice(0, start)) || clikeIndent.test(getLineBefore(value, start)),
        (selection, value) => testBracketPair(selection, value) || openingTag.test(value.slice(0, selection[0])) && closingTag2.test(value.slice(selection[1]))
      ],
      autoCloseTags: ([start, end], value, editor) => {
        return autoCloseTags(editor, start, end, value, openingTag);
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/julia.js
var init_julia = __esm({
  "node_modules/prism-code-editor/dist/languages/julia.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.julia = bracketIndenting({
      line: "#",
      block: ["#=", "=#"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/keepalived.js
var init_keepalived = __esm({
  "node_modules/prism-code-editor/dist/languages/keepalived.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.keepalived = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/keyman.js
var init_keyman = __esm({
  "node_modules/prism-code-editor/dist/languages/keyman.js"() {
    init_index_CKRNGLIi();
    languageMap.keyman = {
      comments: {
        line: "c"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/kotlin.js
var init_kotlin = __esm({
  "node_modules/prism-code-editor/dist/languages/kotlin.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.kts = languageMap.kt = languageMap.kotlin = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/kumir.js
var init_kumir = __esm({
  "node_modules/prism-code-editor/dist/languages/kumir.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.kumir = bracketIndenting({
      line: "|"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/kusto.js
var init_kusto = __esm({
  "node_modules/prism-code-editor/dist/languages/kusto.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.kusto = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/latex.js
var init_latex = __esm({
  "node_modules/prism-code-editor/dist/languages/latex.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.context = languageMap.tex = languageMap.latex = bracketIndenting({ line: "%" });
  }
});

// node_modules/prism-code-editor/dist/languages/latte.js
var init_latte = __esm({
  "node_modules/prism-code-editor/dist/languages/latte.js"() {
    init_index_ByhqCQJ3();
    markupTemplateLang("latte", {
      block: ["{*", "*}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/lilypond.js
var init_lilypond = __esm({
  "node_modules/prism-code-editor/dist/languages/lilypond.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ly = languageMap.lilypond = bracketIndenting({
      line: "%",
      block: ["%{", "%}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/linker-script.js
var init_linker_script = __esm({
  "node_modules/prism-code-editor/dist/languages/linker-script.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ld = languageMap["linker-script"] = bracketIndenting({
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/liquid.js
var init_liquid = __esm({
  "node_modules/prism-code-editor/dist/languages/liquid.js"() {
    init_index_ByhqCQJ3();
    markupTemplateLang("liquid", {
      block: ["{% comment %}", "{% endcomment %}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/lisp.js
var init_lisp = __esm({
  "node_modules/prism-code-editor/dist/languages/lisp.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["emacs-lisp"] = languageMap.emacs = languageMap.elisp = languageMap.lisp = bracketIndenting({ line: ";" });
  }
});

// node_modules/prism-code-editor/dist/languages/livescript.js
var init_livescript = __esm({
  "node_modules/prism-code-editor/dist/languages/livescript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.livescript = bracketIndenting({
      line: "#",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/llvm.js
var init_llvm = __esm({
  "node_modules/prism-code-editor/dist/languages/llvm.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.llvm = bracketIndenting({
      line: ";"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/lolcode.js
var init_lolcode = __esm({
  "node_modules/prism-code-editor/dist/languages/lolcode.js"() {
    init_index_CKRNGLIi();
    languageMap.lolcode = {
      comments: {
        line: "BTW",
        block: ["OBTW", "TLDR"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/lua.js
var init_lua = __esm({
  "node_modules/prism-code-editor/dist/languages/lua.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.lua = bracketIndenting({ line: "--", block: ["--[[", "]]"] });
  }
});

// node_modules/prism-code-editor/dist/languages/magma.js
var init_magma = __esm({
  "node_modules/prism-code-editor/dist/languages/magma.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.magma = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/makefile.js
var init_makefile = __esm({
  "node_modules/prism-code-editor/dist/languages/makefile.js"() {
    init_index_CKRNGLIi();
    languageMap.makefile = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/mata.js
var init_mata = __esm({
  "node_modules/prism-code-editor/dist/languages/mata.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mata = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/matlab.js
var init_matlab = __esm({
  "node_modules/prism-code-editor/dist/languages/matlab.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.matlab = bracketIndenting({
      line: "%",
      block: ["%{", "}%"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/maxscript.js
var init_maxscript = __esm({
  "node_modules/prism-code-editor/dist/languages/maxscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.maxscript = bracketIndenting({
      line: "--",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/mel.js
var init_mel = __esm({
  "node_modules/prism-code-editor/dist/languages/mel.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mel = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/mermaid.js
var init_mermaid = __esm({
  "node_modules/prism-code-editor/dist/languages/mermaid.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mermaid = bracketIndenting({
      line: "%%"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/metafont.js
var init_metafont = __esm({
  "node_modules/prism-code-editor/dist/languages/metafont.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.metafont = bracketIndenting({
      line: "%"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/mizar.js
var init_mizar = __esm({
  "node_modules/prism-code-editor/dist/languages/mizar.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mizar = bracketIndenting({
      line: "::"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/mongodb.js
var init_mongodb = __esm({
  "node_modules/prism-code-editor/dist/languages/mongodb.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mongodb = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/monkey.js
var init_monkey = __esm({
  "node_modules/prism-code-editor/dist/languages/monkey.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.monkey = bracketIndenting({
      line: "'"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/moonscript.js
var init_moonscript = __esm({
  "node_modules/prism-code-editor/dist/languages/moonscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.moon = languageMap.moonscript = bracketIndenting({
      line: "--"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/n1ql.js
var init_n1ql = __esm({
  "node_modules/prism-code-editor/dist/languages/n1ql.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.n1ql = bracketIndenting({
      line: "--",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/n4js.js
var init_n4js = __esm({
  "node_modules/prism-code-editor/dist/languages/n4js.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.n4jsd = languageMap.n4js = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/nand2tetris-hdl.js
var init_nand2tetris_hdl = __esm({
  "node_modules/prism-code-editor/dist/languages/nand2tetris-hdl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["nand2tetris-hdl"] = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/naniscript.js
var init_naniscript = __esm({
  "node_modules/prism-code-editor/dist/languages/naniscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nani = languageMap.naniscript = bracketIndenting({
      line: ";"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/neon.js
var init_neon = __esm({
  "node_modules/prism-code-editor/dist/languages/neon.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.neon = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/nevod.js
var init_nevod = __esm({
  "node_modules/prism-code-editor/dist/languages/nevod.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nevod = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/nginx.js
var init_nginx = __esm({
  "node_modules/prism-code-editor/dist/languages/nginx.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nginx = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/nim.js
var init_nim = __esm({
  "node_modules/prism-code-editor/dist/languages/nim.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nim = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/nix.js
var init_nix = __esm({
  "node_modules/prism-code-editor/dist/languages/nix.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nix = bracketIndenting({
      line: "#",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/nsis.js
var init_nsis = __esm({
  "node_modules/prism-code-editor/dist/languages/nsis.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nsis = bracketIndenting({
      line: "#",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/objectivec.js
var init_objectivec = __esm({
  "node_modules/prism-code-editor/dist/languages/objectivec.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.objc = languageMap.objectivec = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/ocaml.js
var init_ocaml = __esm({
  "node_modules/prism-code-editor/dist/languages/ocaml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.ocaml = bracketIndenting({
      block: ["(*", "*)"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/odin.js
var init_odin = __esm({
  "node_modules/prism-code-editor/dist/languages/odin.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.odin = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/opencl.js
var init_opencl = __esm({
  "node_modules/prism-code-editor/dist/languages/opencl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.opencl = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/openqasm.js
var init_openqasm = __esm({
  "node_modules/prism-code-editor/dist/languages/openqasm.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.qasm = languageMap.openqasm = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/oz.js
var init_oz = __esm({
  "node_modules/prism-code-editor/dist/languages/oz.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.oz = bracketIndenting({
      line: "%",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/parigp.js
var init_parigp = __esm({
  "node_modules/prism-code-editor/dist/languages/parigp.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.parigp = bracketIndenting({
      line: "\\\\",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/parser.js
var init_parser = __esm({
  "node_modules/prism-code-editor/dist/languages/parser.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.parser = markupLanguage(
      {
        line: "#",
        block: ["<!--", "-->"]
      },
      xmlOpeningTag,
      voidTags
    );
  }
});

// node_modules/prism-code-editor/dist/languages/pascal.js
var init_pascal = __esm({
  "node_modules/prism-code-editor/dist/languages/pascal.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.pascaligo = languageMap.objectpascal = languageMap.pascal = bracketIndenting({
      line: "//",
      block: ["(*", "*)"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/peoplecode.js
var init_peoplecode = __esm({
  "node_modules/prism-code-editor/dist/languages/peoplecode.js"() {
    init_index_CKRNGLIi();
    languageMap.pcode = languageMap.peoplecode = {
      comments: {
        block: ["/*", "*/"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/perl.js
var init_perl = __esm({
  "node_modules/prism-code-editor/dist/languages/perl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.perl = bracketIndenting({ line: "#" });
  }
});

// node_modules/prism-code-editor/dist/languages/php.js
var init_php = __esm({
  "node_modules/prism-code-editor/dist/languages/php.js"() {
    init_index_CKRNGLIi();
    init_index_BvZmi6ce();
    init_index_ByhqCQJ3();
    languageMap.php = {
      comments: clikeComment,
      getComments: (editor, position) => {
        if (getClosestToken(editor, ".php", 0, 0, position)) return clikeComment;
        return markupComment;
      },
      autoIndent: htmlAutoIndent(xmlOpeningTag, voidTags),
      autoCloseTags: ([start, end], value, editor) => {
        return !value.includes("<?") || getClosestToken(editor, ".php", 0, 0, start) ? "" : autoCloseTags(editor, start, end, value, xmlOpeningTag, voidTags);
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/plant-uml.js
var init_plant_uml = __esm({
  "node_modules/prism-code-editor/dist/languages/plant-uml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.plantuml = languageMap["plant-uml"] = bracketIndenting({
      line: "'",
      block: ["/'", "'/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/powerquery.js
var init_powerquery = __esm({
  "node_modules/prism-code-editor/dist/languages/powerquery.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.mscript = languageMap.pq = languageMap.powerquery = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/powershell.js
var init_powershell = __esm({
  "node_modules/prism-code-editor/dist/languages/powershell.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.powershell = bracketIndenting({
      line: "#",
      block: ["<#", "#>"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/processing.js
var init_processing = __esm({
  "node_modules/prism-code-editor/dist/languages/processing.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.processing = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/prolog.js
var init_prolog = __esm({
  "node_modules/prism-code-editor/dist/languages/prolog.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.prolog = bracketIndenting({
      line: "%",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/promql.js
var init_promql = __esm({
  "node_modules/prism-code-editor/dist/languages/promql.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.promql = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/properties.js
var init_properties = __esm({
  "node_modules/prism-code-editor/dist/languages/properties.js"() {
    init_index_CKRNGLIi();
    languageMap.properties = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/protobuf.js
var init_protobuf = __esm({
  "node_modules/prism-code-editor/dist/languages/protobuf.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.protobuf = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/psl.js
var init_psl = __esm({
  "node_modules/prism-code-editor/dist/languages/psl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.psl = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/pug.js
var init_pug = __esm({
  "node_modules/prism-code-editor/dist/languages/pug.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.pug = bracketIndenting({
      line: "//-"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/puppet.js
var init_puppet = __esm({
  "node_modules/prism-code-editor/dist/languages/puppet.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.puppet = bracketIndenting({
      line: "#",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/pure.js
var init_pure = __esm({
  "node_modules/prism-code-editor/dist/languages/pure.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.pure = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/purebasic.js
var init_purebasic = __esm({
  "node_modules/prism-code-editor/dist/languages/purebasic.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.pbfasm = languageMap.purebasic = bracketIndenting({
      line: ";"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/python.js
var init_python = __esm({
  "node_modules/prism-code-editor/dist/languages/python.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.rpy = languageMap.renpy = languageMap.py = languageMap.python = bracketIndenting({ line: "#" }, /[([{][^)\]}]*$|:\s*$/);
  }
});

// node_modules/prism-code-editor/dist/languages/q.js
var init_q = __esm({
  "node_modules/prism-code-editor/dist/languages/q.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.q = bracketIndenting({
      line: "/"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/qml.js
var init_qml = __esm({
  "node_modules/prism-code-editor/dist/languages/qml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.qml = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/qore.js
var init_qore = __esm({
  "node_modules/prism-code-editor/dist/languages/qore.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.qore = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/qsharp.js
var init_qsharp = __esm({
  "node_modules/prism-code-editor/dist/languages/qsharp.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.qs = languageMap.qsharp = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/r.js
var init_r = __esm({
  "node_modules/prism-code-editor/dist/languages/r.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.r = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/reason.js
var init_reason = __esm({
  "node_modules/prism-code-editor/dist/languages/reason.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.reason = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/rego.js
var init_rego = __esm({
  "node_modules/prism-code-editor/dist/languages/rego.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.rego = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/rescript.js
var init_rescript = __esm({
  "node_modules/prism-code-editor/dist/languages/rescript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.res = languageMap.rescript = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/rest.js
var init_rest = __esm({
  "node_modules/prism-code-editor/dist/languages/rest.js"() {
    init_index_CKRNGLIi();
    languageMap.rest = {
      comments: {
        line: ".."
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/rip.js
var init_rip = __esm({
  "node_modules/prism-code-editor/dist/languages/rip.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.rip = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/roboconf.js
var init_roboconf = __esm({
  "node_modules/prism-code-editor/dist/languages/roboconf.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.roboconf = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/robotframework.js
var init_robotframework = __esm({
  "node_modules/prism-code-editor/dist/languages/robotframework.js"() {
    init_index_CKRNGLIi();
    languageMap.robot = languageMap.robotframework = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/ruby.js
var init_ruby = __esm({
  "node_modules/prism-code-editor/dist/languages/ruby.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.crystal = languageMap.rb = languageMap.ruby = bracketIndenting({ line: "#", block: ["=begin", "=end"] });
  }
});

// node_modules/prism-code-editor/dist/languages/rust.js
var init_rust = __esm({
  "node_modules/prism-code-editor/dist/languages/rust.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.rust = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/sas.js
var init_sas = __esm({
  "node_modules/prism-code-editor/dist/languages/sas.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.sas = bracketIndenting({
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/scala.js
var init_scala = __esm({
  "node_modules/prism-code-editor/dist/languages/scala.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.scala = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/scheme.js
var init_scheme = __esm({
  "node_modules/prism-code-editor/dist/languages/scheme.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.racket = languageMap.scheme = bracketIndenting({
      line: ";",
      block: ["#|", "|#"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/smali.js
var init_smali = __esm({
  "node_modules/prism-code-editor/dist/languages/smali.js"() {
    init_index_CKRNGLIi();
    languageMap.smali = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/smalltalk.js
var init_smalltalk = __esm({
  "node_modules/prism-code-editor/dist/languages/smalltalk.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.smalltalk = bracketIndenting({
      block: ['"', '"']
    });
  }
});

// node_modules/prism-code-editor/dist/languages/smarty.js
var init_smarty = __esm({
  "node_modules/prism-code-editor/dist/languages/smarty.js"() {
    init_index_ByhqCQJ3();
    markupTemplateLang("smarty", {
      block: ["{*", "*}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/sml.js
var init_sml = __esm({
  "node_modules/prism-code-editor/dist/languages/sml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.smlnj = languageMap.sml = bracketIndenting({
      block: ["(*", "*)"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/solidity.js
var init_solidity = __esm({
  "node_modules/prism-code-editor/dist/languages/solidity.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.sol = languageMap.solidity = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/solution-file.js
var init_solution_file = __esm({
  "node_modules/prism-code-editor/dist/languages/solution-file.js"() {
    init_index_CKRNGLIi();
    languageMap.sln = languageMap["solution-file"] = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/soy.js
var init_soy = __esm({
  "node_modules/prism-code-editor/dist/languages/soy.js"() {
    init_index_ByhqCQJ3();
    markupTemplateLang("soy", clikeComment);
  }
});

// node_modules/prism-code-editor/dist/languages/splunk-spl.js
var init_splunk_spl = __esm({
  "node_modules/prism-code-editor/dist/languages/splunk-spl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap["splunk-spl"] = bracketIndenting({
      block: ['`comment("', '")`']
    });
  }
});

// node_modules/prism-code-editor/dist/languages/sqf.js
var init_sqf = __esm({
  "node_modules/prism-code-editor/dist/languages/sqf.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.sqf = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/sql.js
var init_sql = __esm({
  "node_modules/prism-code-editor/dist/languages/sql.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.plsql = languageMap.sql = bracketIndenting({
      line: "--",
      block: ["/*", "*/"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/squirrel.js
var init_squirrel = __esm({
  "node_modules/prism-code-editor/dist/languages/squirrel.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.squirrel = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/stan.js
var init_stan = __esm({
  "node_modules/prism-code-editor/dist/languages/stan.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.stan = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/stata.js
var init_stata = __esm({
  "node_modules/prism-code-editor/dist/languages/stata.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.stata = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/stylus.js
var init_stylus = __esm({
  "node_modules/prism-code-editor/dist/languages/stylus.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.stylus = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/supercollider.js
var init_supercollider = __esm({
  "node_modules/prism-code-editor/dist/languages/supercollider.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.sclang = languageMap.supercollider = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/svelte.js
var init_svelte = __esm({
  "node_modules/prism-code-editor/dist/languages/svelte.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.svelte = markupLanguage(markupComment, astroOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/swift.js
var init_swift = __esm({
  "node_modules/prism-code-editor/dist/languages/swift.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.swift = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/systemd.js
var init_systemd = __esm({
  "node_modules/prism-code-editor/dist/languages/systemd.js"() {
    init_index_CKRNGLIi();
    languageMap.systemd = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/tcl.js
var init_tcl = __esm({
  "node_modules/prism-code-editor/dist/languages/tcl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.tcl = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/textile.js
var init_textile = __esm({
  "node_modules/prism-code-editor/dist/languages/textile.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.textile = markupLanguage(markupComment, xmlOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/toml.js
var init_toml = __esm({
  "node_modules/prism-code-editor/dist/languages/toml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.toml = bracketIndenting({
      line: "#"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/tremor.js
var init_tremor = __esm({
  "node_modules/prism-code-editor/dist/languages/tremor.js"() {
    init_index_CKRNGLIi();
    languageMap.trickle = languageMap.troy = languageMap.tremor = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/tt2.js
var init_tt2 = __esm({
  "node_modules/prism-code-editor/dist/languages/tt2.js"() {
    init_index_BvZmi6ce();
    init_index_ByhqCQJ3();
    markupTemplateLang("tt2", {
      block: ["[%#", "%]"]
    }).getComments = (editor, position) => ({
      line: getClosestToken(editor, ".tt2", 0, 0, position) && "#",
      block: ["[%#", "%]"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/turtle.js
var init_turtle = __esm({
  "node_modules/prism-code-editor/dist/languages/turtle.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.rq = languageMap.sparql = languageMap.trig = languageMap.turtle = bracketIndenting({ line: "#" });
  }
});

// node_modules/prism-code-editor/dist/languages/twig.js
var init_twig = __esm({
  "node_modules/prism-code-editor/dist/languages/twig.js"() {
    init_index_ByhqCQJ3();
    markupTemplateLang("twig", {
      block: ["{#", "#}"]
    });
  }
});

// node_modules/prism-code-editor/dist/languages/typoscript.js
var init_typoscript = __esm({
  "node_modules/prism-code-editor/dist/languages/typoscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.tsconfig = languageMap.typoscript = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/unrealscript.js
var init_unrealscript = __esm({
  "node_modules/prism-code-editor/dist/languages/unrealscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.uc = languageMap.uscript = languageMap.unrealscript = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/uorazor.js
var init_uorazor = __esm({
  "node_modules/prism-code-editor/dist/languages/uorazor.js"() {
    init_index_CKRNGLIi();
    languageMap.uorazor = {
      comments: {
        line: "#"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/v.js
var init_v = __esm({
  "node_modules/prism-code-editor/dist/languages/v.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.v = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/vala.js
var init_vala = __esm({
  "node_modules/prism-code-editor/dist/languages/vala.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.vala = bracketIndenting(clikeComment, clikeIndent);
  }
});

// node_modules/prism-code-editor/dist/languages/vbnet.js
var init_vbnet = __esm({
  "node_modules/prism-code-editor/dist/languages/vbnet.js"() {
    init_index_CKRNGLIi();
    languageMap.vbnet = {
      comments: {
        line: "'"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/velocity.js
var init_velocity = __esm({
  "node_modules/prism-code-editor/dist/languages/velocity.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.velocity = markupLanguage(
      {
        line: "##",
        block: ["#*", "*#"]
      },
      xmlOpeningTag,
      voidTags
    );
  }
});

// node_modules/prism-code-editor/dist/languages/verilog.js
var init_verilog = __esm({
  "node_modules/prism-code-editor/dist/languages/verilog.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.verilog = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/vhdl.js
var init_vhdl = __esm({
  "node_modules/prism-code-editor/dist/languages/vhdl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.vhdl = bracketIndenting({
      line: "--"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/vim.js
var init_vim = __esm({
  "node_modules/prism-code-editor/dist/languages/vim.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.vim = bracketIndenting({
      line: '"'
    });
  }
});

// node_modules/prism-code-editor/dist/languages/visual-basic.js
var init_visual_basic = __esm({
  "node_modules/prism-code-editor/dist/languages/visual-basic.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.vba = languageMap.vb = languageMap["visual-basic"] = bracketIndenting({
      line: "'"
    });
  }
});

// node_modules/prism-code-editor/dist/languages/vue.js
var init_vue = __esm({
  "node_modules/prism-code-editor/dist/languages/vue.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.vue = markupLanguage(markupComment, xmlOpeningTag, voidTags);
  }
});

// node_modules/prism-code-editor/dist/languages/warpscript.js
var init_warpscript = __esm({
  "node_modules/prism-code-editor/dist/languages/warpscript.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.warpscript = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/wasm.js
var init_wasm = __esm({
  "node_modules/prism-code-editor/dist/languages/wasm.js"() {
    init_index_CKRNGLIi();
    languageMap.wasm = {
      comments: {
        line: ";;",
        block: ["(;", ";)"]
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/web-idl.js
var init_web_idl = __esm({
  "node_modules/prism-code-editor/dist/languages/web-idl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.webidl = languageMap["web-idl"] = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/wgsl.js
var init_wgsl = __esm({
  "node_modules/prism-code-editor/dist/languages/wgsl.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.wgsl = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/wiki.js
var init_wiki = __esm({
  "node_modules/prism-code-editor/dist/languages/wiki.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    init_index_BvZmi6ce();
    languageMap.wiki = markupLanguage(
      {
        block: ["/*", "*/"]
      },
      xmlOpeningTag,
      voidTags
    );
  }
});

// node_modules/prism-code-editor/dist/languages/wolfram.js
var init_wolfram = __esm({
  "node_modules/prism-code-editor/dist/languages/wolfram.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.nb = languageMap.wl = languageMap.mathematica = languageMap.wolfram = bracketIndenting({ block: ["(*", "*)"] });
  }
});

// node_modules/prism-code-editor/dist/languages/wren.js
var init_wren = __esm({
  "node_modules/prism-code-editor/dist/languages/wren.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.wren = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/xeora.js
var init_xeora = __esm({
  "node_modules/prism-code-editor/dist/languages/xeora.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.xeoracube = languageMap.xeora = markupLanguage();
  }
});

// node_modules/prism-code-editor/dist/languages/xml.js
var init_xml = __esm({
  "node_modules/prism-code-editor/dist/languages/xml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.xml = languageMap.ssml = languageMap.atom = languageMap.rss = languageMap.mathml = languageMap.svg = markupLanguage();
  }
});

// node_modules/prism-code-editor/dist/languages/xojo.js
var init_xojo = __esm({
  "node_modules/prism-code-editor/dist/languages/xojo.js"() {
    init_index_CKRNGLIi();
    languageMap.xojo = {
      comments: {
        line: "//"
      }
    };
  }
});

// node_modules/prism-code-editor/dist/languages/xquery.js
var comment, xquery;
var init_xquery = __esm({
  "node_modules/prism-code-editor/dist/languages/xquery.js"() {
    init_index_CKRNGLIi();
    init_index_BvZmi6ce();
    init_index_ByhqCQJ3();
    comment = ["(:", ":)"];
    xquery = languageMap.xquery = markupLanguage(
      { block: comment },
      /<(?!!|\d)([^\s/=>$<%]+)(?:\s+[^\s/=>]+(?:\s*=\s*(["'])(?:\{\{|\{(?!\{)(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\2)[^{])*\2)?)*\s*>[ 	]*$/
    );
    xquery.getComments = (editor, position) => ({
      block: getClosestToken(editor, ".plain-text", 0, 0, position) ? ["{(:", ":)}"] : comment
    });
  }
});

// node_modules/prism-code-editor/dist/languages/yaml.js
var init_yaml = __esm({
  "node_modules/prism-code-editor/dist/languages/yaml.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.yml = languageMap.yaml = bracketIndenting({ line: "#" });
  }
});

// node_modules/prism-code-editor/dist/languages/yang.js
var init_yang = __esm({
  "node_modules/prism-code-editor/dist/languages/yang.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.yang = bracketIndenting();
  }
});

// node_modules/prism-code-editor/dist/languages/zig.js
var init_zig = __esm({
  "node_modules/prism-code-editor/dist/languages/zig.js"() {
    init_index_CKRNGLIi();
    init_index_ByhqCQJ3();
    languageMap.zig = bracketIndenting({
      line: "//"
    });
  }
});

// node_modules/prism-code-editor/dist/bracket-BPYnIBjq.js
var testBracket;
var init_bracket_BPYnIBjq = __esm({
  "node_modules/prism-code-editor/dist/bracket-BPYnIBjq.js"() {
    testBracket = (str, brackets, l) => {
      return brackets.indexOf(str[0]) + 1 || l && brackets.indexOf(str[l]) + 1;
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/matchBrackets/index.js
var matchBrackets;
var init_matchBrackets = __esm({
  "node_modules/prism-code-editor/dist/extensions/matchBrackets/index.js"() {
    init_bracket_BPYnIBjq();
    matchBrackets = (rainbowBrackets = true, pairs = "()[]{}") => {
      let bracketIndex;
      let sp;
      const stack = [];
      const self = (editor) => {
        editor.extensions.matchBrackets = self;
        editor.on("tokenize", matchBrackets2);
        if (rainbowBrackets && editor.tokens[0]) editor.update();
        else matchBrackets2(editor.tokens);
      };
      const brackets = self.brackets = [];
      const pairMap = self.pairs = [];
      const matchBrackets2 = (tokens) => {
        pairMap.length = brackets.length = sp = bracketIndex = 0;
        matchRecursive(tokens, 0);
        if (rainbowBrackets) {
          for (let i = 0, bracket; bracket = brackets[i]; ) {
            let alias = bracket[0].alias;
            bracket[0].alias = (alias ? alias + " " : "") + `bracket-${i++ in pairMap ? "level-" + bracket[3] % 12 : "error"}`;
          }
        }
      };
      const matchRecursive = (tokens, position) => {
        let token;
        let i = 0;
        for (; token = tokens[i++]; ) {
          let length = token.length;
          if (typeof token != "string") {
            let content = token.content;
            if (Array.isArray(content)) {
              matchRecursive(content, position);
            } else if ((token.alias || token.type) == "punctuation") {
              let bracketType = testBracket(content, pairs, length - 1);
              let isOpening = bracketType % 2;
              if (bracketType) {
                brackets[bracketIndex] = [token, position, position + length, sp, content, !!isOpening];
                if (isOpening) stack[sp++] = [bracketIndex, bracketType + 1];
                else {
                  for (let i2 = sp; i2; ) {
                    let entry = stack[--i2];
                    if (bracketType == entry[1]) {
                      pairMap[pairMap[bracketIndex] = entry[0]] = bracketIndex;
                      brackets[bracketIndex][3] = sp = i2;
                      i2 = 0;
                    }
                  }
                }
                bracketIndex++;
              }
            }
          }
          position += length;
        }
      };
      return self;
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/matchBrackets/highlight.js
var highlightBracketPairs;
var init_highlight = __esm({
  "node_modules/prism-code-editor/dist/extensions/matchBrackets/highlight.js"() {
    init_index_BvZmi6ce();
    highlightBracketPairs = () => (editor) => {
      let prev;
      let els = [];
      let selectionChange2 = () => {
        let matcher = editor.extensions.matchBrackets;
        let [start, end] = editor.getSelection();
        if (matcher) {
          let brackets = matcher.brackets;
          let pairs = matcher.pairs;
          let opening;
          let closing;
          if (editor.focused && start == end) {
            for (let i = 0, bracket; bracket = brackets[++i]; ) {
              if (!bracket[5] && bracket[2] >= end && brackets[pairs[i]]?.[1] <= end) {
                opening = brackets[pairs[i]];
                closing = bracket;
                break;
              }
            }
          }
          if (closing != prev) {
            toggleActive();
            if (closing) {
              els = [opening, closing].map(
                (bracket) => getClosestToken(editor, ".punctuation", 0, -1, bracket[1])
              );
              if (els[0] != els[1] && opening[2] == closing[1]) {
                els[0].textContent += els[1].textContent;
                els[1].textContent = "";
                els[1] = els[0];
              }
              toggleActive(true);
            } else els = [];
          }
          prev = closing;
        }
      };
      let toggleActive = (add) => els.forEach((el) => el.classList.toggle("active-bracket", !!add));
      addTextareaListener(editor, "focus", selectionChange2);
      addTextareaListener(editor, "blur", selectionChange2);
      editor.on("selectionChange", selectionChange2);
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/guides.js
var template, indentGuides, getIndentGuides;
var init_guides = __esm({
  "node_modules/prism-code-editor/dist/extensions/guides.js"() {
    init_index_CKRNGLIi();
    template = /* @__PURE__ */ createTemplate("<div class=guide-indents>	");
    indentGuides = () => {
      let tabSize;
      let prevLength = 0;
      let lineIndentMap;
      let active;
      let currentEditor;
      let lines = [];
      let indents = [];
      let container;
      let update = (code) => {
        lineIndentMap = [];
        const newIndents = getIndentGuides(code, tabSize);
        const l = newIndents.length;
        for (let i = 0, prev = [], next = newIndents[0]; next; i++) {
          const style2 = (lines[i] ||= doc.createElement("div")).style;
          const [top, left, height] = next;
          const old = indents[i];
          next = newIndents[i + 1];
          if (top != old?.[0]) style2.top = top + "00%";
          if (left != old?.[1]) style2.left = left + "00%";
          if (height != old?.[2]) style2.height = height + "00%";
          const isSingleIndent = prev[0] != top && next?.[0] != top, isSingleOutdent = prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height;
          for (let j = -isSingleIndent, l2 = height + isSingleOutdent; j < l2; j++)
            lineIndentMap[j + top] = i;
          prev = indents[i] = newIndents[i];
        }
        for (let i = l; i < prevLength; ) lines[i++].remove();
        container.append(...lines.slice(prevLength, prevLength = l));
      };
      let updateActive = () => {
        const newActive = lines[lineIndentMap[currentEditor.activeLine - 1]];
        if (newActive != active) {
          if (active) active.className = "";
          if (newActive) newActive.className = "active-indent";
          active = newActive;
        }
      };
      return {
        update(editor, options) {
          if (!currentEditor) {
            currentEditor = editor;
            let overlays = editor.lines[0];
            if (container = overlays.querySelector(".guide-indents")) {
              lines.push(...container.children);
              active = lines.find((line) => line.className);
            } else {
              overlays.append(container = template());
            }
            editor.on("update", update);
            editor.on("selectionChange", updateActive);
          }
          container.style.display = options.wordWrap ? "none" : "";
          if (tabSize != (tabSize = options.tabSize || 2)) {
            update(editor.value);
            updateActive();
          }
        }
      };
    };
    getIndentGuides = (code, tabSize) => {
      const lines = code.split("\n");
      const l = lines.length;
      const stack = [];
      const results = [];
      for (let prevIndent = 0, emptyPos = -1, i = 0, p = 0; ; i++) {
        let last = i == l;
        let line = lines[i];
        let pos = last ? 0 : line.search(/\S/);
        let indent = 0;
        let j = 0;
        if (pos < 0) {
          if (emptyPos < 0) emptyPos = i;
        } else {
          for (; j < pos; ) {
            indent += line[j++] == "	" ? tabSize - indent % tabSize : 1;
          }
          if (indent) indent = Math.ceil(indent / tabSize);
          for (j = indent; j < prevIndent; j++) {
            stack[j][2] = (emptyPos < 0 || j == indent && !last ? i : emptyPos) - stack[j][0];
          }
          for (j = prevIndent; j < indent; ) {
            results[p++] = stack[j] = [emptyPos < 0 || j > prevIndent ? i : emptyPos, j++, 0];
          }
          emptyPos = -1;
          prevIndent = indent;
        }
        if (last) break;
      }
      return results;
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/cursor.js
var cursorTemplate, cursorPosition;
var init_cursor = __esm({
  "node_modules/prism-code-editor/dist/extensions/cursor.js"() {
    init_index_CKRNGLIi();
    init_index_BvZmi6ce();
    cursorTemplate = /* @__PURE__ */ createTemplate(
      "<div style=position:absolute;top:0;opacity:0;padding-right:inherit> <span><span></span> "
    );
    cursorPosition = () => {
      let cEditor;
      const cursorContainer = cursorTemplate();
      const [before, span] = cursorContainer.childNodes;
      const [cursor, after] = span.childNodes;
      const selectionChange2 = (selection) => {
        const value = cEditor.value;
        const activeLine = cEditor.lines[cEditor.activeLine];
        const position = selection[selection[2] < "f" ? 0 : 1];
        updateNode(before, getLineBefore(value, position));
        updateNode(after, value.slice(position, getLineEnd(value, position)) + "\n");
        if (cursorContainer.parentNode != activeLine) activeLine.prepend(cursorContainer);
      };
      const scrollIntoView = () => scrollToEl(cEditor, cursor);
      const self = (editor) => {
        editor.on("selectionChange", selectionChange2);
        cEditor = editor;
        editor.extensions.cursor = self;
        addTextareaListener(editor, "input", (e) => {
          if (/history/.test(e.inputType)) scrollIntoView();
        });
        if (editor.activeLine) selectionChange2(editor.getSelection());
      };
      self.getPosition = () => getPosition(cEditor, cursor);
      self.scrollIntoView = scrollIntoView;
      self.element = cursor;
      return self;
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/commands.js
var ignoreTab, mod, setIgnoreTab, whitespaceEnd, defaultCommands, editHistory;
var init_commands = __esm({
  "node_modules/prism-code-editor/dist/extensions/commands.js"() {
    init_index_CKRNGLIi();
    init_index_BvZmi6ce();
    ignoreTab = false;
    mod = isMac ? 4 : 2;
    setIgnoreTab = (newState) => ignoreTab = newState;
    whitespaceEnd = (str) => str.search(/\S|$/);
    defaultCommands = (selfClosePairs = ['""', "''", "``", "()", "[]", "{}"], selfCloseRegex = /([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s) => (editor, options) => {
      let prevCopy;
      const { keyCommandMap, inputCommandMap, getSelection, container } = editor;
      const clipboard = navigator.clipboard;
      const getIndent = ({ insertSpaces = true, tabSize } = options) => [insertSpaces ? " " : "	", insertSpaces ? tabSize || 2 : 1];
      const scroll2 = () => !options.readOnly && !editor.extensions.cursor?.scrollIntoView();
      const selfClose = ([start, end], [open, close], value, wrapOnly) => (start < end || !wrapOnly && selfCloseRegex.test((value[end - 1] || " ") + open + (value[end] || " "))) && !insertText(editor, open + value.slice(start, end) + close, null, null, start + 1, end + 1);
      const skipIfEqual = ([start, end], char, value) => start == end && value[end] == char && !setSelection(editor, start + 1);
      const insertLines = (old, newL, start, end, selectionStart, selectionEnd) => {
        let newLines = newL.join("\n");
        if (newLines != old.join("\n")) {
          const last = old.length - 1;
          const lastLine = newL[last];
          const oldLastLine = old[last];
          const lastDiff = oldLastLine.length - lastLine.length;
          const firstDiff = newL[0].length - old[0].length;
          const firstInsersion = start + whitespaceEnd((firstDiff < 0 ? newL : old)[0]);
          const lastInsersion = end - oldLastLine.length + whitespaceEnd(lastDiff > 0 ? lastLine : oldLastLine);
          const offset = start - end + newLines.length + lastDiff;
          const newCursorStart = firstInsersion > selectionStart ? selectionStart : Math.max(firstInsersion, selectionStart + firstDiff);
          const newCursorEnd = selectionEnd + start - end + newLines.length;
          insertText(
            editor,
            newLines,
            start,
            end,
            newCursorStart,
            selectionEnd < lastInsersion ? newCursorEnd + lastDiff : Math.max(lastInsersion + offset, newCursorEnd)
          );
        }
      };
      const indent = (outdent, lines, start1, end1, start, end, indentChar, tabSize) => {
        insertLines(
          lines,
          lines.map(
            outdent ? (str) => str.slice(whitespaceEnd(str) ? tabSize - whitespaceEnd(str) % tabSize : 0) : (str) => str && indentChar.repeat(tabSize - whitespaceEnd(str) % tabSize) + str
          ),
          start1,
          end1,
          start,
          end
        );
      };
      inputCommandMap["<"] = (_e, selection, value) => selfClose(selection, "<>", value, true);
      selfClosePairs.forEach(([open, close]) => {
        const isQuote = open == close;
        inputCommandMap[open] = (_e, selection, value) => (isQuote && skipIfEqual(selection, close, value) || selfClose(selection, open + close, value)) && scroll2();
        if (!isQuote)
          inputCommandMap[close] = (_e, selection, value) => skipIfEqual(selection, close, value) && scroll2();
      });
      inputCommandMap[">"] = (e, selection, value) => {
        const closingTag3 = languageMap[getLanguage(editor)]?.autoCloseTags?.(selection, value, editor);
        if (closingTag3) {
          insertText(editor, ">" + closingTag3, null, null, selection[0] + 1);
          preventDefault(e);
        }
      };
      keyCommandMap.Tab = (e, [start, end], value) => {
        if (ignoreTab || options.readOnly || getModifierCode(e) & 6) return;
        const [indentChar, tabSize] = getIndent(options);
        const shiftKey = e.shiftKey;
        const [lines, start1, end1] = getLines(value, start, end);
        if (start < end || shiftKey) {
          indent(shiftKey, lines, start1, end1, start, end, indentChar, tabSize);
        } else insertText(editor, indentChar.repeat(tabSize - (start - start1) % tabSize));
        return scroll2();
      };
      keyCommandMap.Enter = (e, selection, value) => {
        const code = getModifierCode(e) & 7;
        if (!code || code == mod) {
          if (code) selection[0] = selection[1] = getLines(value, selection[1])[2];
          const [indentChar, tabSize] = getIndent();
          const [start, end] = selection;
          const autoIndent = languageMap[getLanguage(editor)]?.autoIndent;
          const indenationCount = Math.floor(whitespaceEnd(getLineBefore(value, start)) / tabSize) * tabSize;
          const extraIndent = autoIndent?.[0]?.(selection, value, editor) ? tabSize : 0;
          const extraLine = autoIndent?.[1]?.(selection, value, editor);
          const newText = "\n" + indentChar.repeat(indenationCount + extraIndent) + (extraLine ? "\n" + indentChar.repeat(indenationCount) : "");
          if (newText[1] || value[end]) {
            insertText(editor, newText, start, end, start + indenationCount + extraIndent + 1);
            return scroll2();
          }
        }
      };
      keyCommandMap.Backspace = (_e, [start, end], value) => {
        if (start == end) {
          const line = getLineBefore(value, start);
          const tabSize = options.tabSize || 2;
          const isPair = selfClosePairs.includes(value.slice(start - 1, start + 1));
          const indenationCount = /[^ ]/.test(line) ? 0 : (line.length - 1) % tabSize + 1;
          if (isPair || indenationCount > 1) {
            insertText(editor, "", start - (isPair ? 1 : indenationCount), start + isPair);
            return scroll2();
          }
        }
      };
      for (let i = 0; i < 2; i++) {
        keyCommandMap[i ? "ArrowDown" : "ArrowUp"] = (e, [start, end], value) => {
          const code = getModifierCode(e);
          if (code == 1) {
            const newStart = i ? start : getLineStart(value, start) - 1;
            const newEnd = i ? value.indexOf("\n", end) + 1 : end;
            if (newStart > -1 && newEnd > 0) {
              const [lines, start1, end1] = getLines(value, newStart, newEnd);
              const line = lines[i ? "pop" : "shift"]();
              const offset = (line.length + 1) * (i ? 1 : -1);
              lines[i ? "unshift" : "push"](line);
              insertText(editor, lines.join("\n"), start1, end1, start + offset, end + offset);
            }
            return scroll2();
          } else if (code == 9) {
            const [lines, start1, end1] = getLines(value, start, end);
            const str = lines.join("\n");
            const offset = i ? str.length + 1 : 0;
            insertText(editor, str + "\n" + str, start1, end1, start + offset, end + offset);
            return scroll2();
          } else if (code == 2 && !isMac) {
            container.scrollBy(0, getStyleValue(container, "lineHeight") * (i ? 1 : -1));
            return true;
          }
        };
      }
      addTextareaListener(editor, "keydown", (e) => {
        const code = getModifierCode(e);
        const keyCode = e.keyCode;
        const [start, end, dir] = getSelection();
        if (code == mod && (keyCode == 221 || keyCode == 219)) {
          indent(keyCode == 219, ...getLines(editor.value, start, end), start, end, ...getIndent());
          scroll2();
          preventDefault(e);
        } else if (code == (isMac ? 10 : 2) && keyCode == 77) {
          setIgnoreTab(!ignoreTab);
          preventDefault(e);
        } else if (keyCode == 191 && code == mod || keyCode == 65 && code == 9) {
          const value = editor.value;
          const isBlock = code == 9;
          const position = isBlock ? start : getLineStart(value, start);
          const language = languageMap[getLanguage(editor, position)] || {};
          const { line, block } = language.getComments?.(editor, position, value) || language.comments || {};
          const [lines, start1, end1] = getLines(value, start, end);
          const last = lines.length - 1;
          if (isBlock) {
            if (block) {
              const [open, close] = block;
              const text = value.slice(start, end);
              const pos = value.slice(0, start).search(regexEscape(open) + " ?$");
              const matches = RegExp("^ ?" + regexEscape(close)).test(value.slice(end));
              if (pos + 1 && matches)
                insertText(
                  editor,
                  text,
                  pos,
                  end + +(value[end] == " ") + close.length,
                  pos,
                  pos + end - start
                );
              else
                insertText(
                  editor,
                  `${open} ${text} ${close}`,
                  start,
                  end,
                  start + open.length + 1,
                  end + open.length + 1
                );
              scroll2();
              preventDefault(e);
            }
          } else {
            if (line) {
              const escaped = regexEscape(line);
              const regex = RegExp(`^\\s*(${escaped} ?|$)`);
              const regex2 = RegExp(escaped + " ?");
              const allWhiteSpace = !/\S/.test(value.slice(start1, end1));
              const newLines = lines.map(
                lines.every((line2) => regex.test(line2)) && !allWhiteSpace ? (str) => str.replace(regex2, "") : (str) => allWhiteSpace || /\S/.test(str) ? str.replace(/^\s*/, `$&${line} `) : str
              );
              insertLines(lines, newLines, start1, end1, start, end);
              scroll2();
              preventDefault(e);
            } else if (block) {
              const [open, close] = block;
              const insertionPoint = whitespaceEnd(lines[0]);
              const hasComment = lines[0].startsWith(open, insertionPoint) && lines[last].endsWith(close);
              const newLines = lines.slice();
              newLines[0] = lines[0].replace(
                hasComment ? RegExp(regexEscape(open) + " ?") : /(?=\S)|$/,
                hasComment ? "" : open + " "
              );
              let diff = newLines[0].length - lines[0].length;
              newLines[last] = hasComment ? newLines[last].replace(RegExp(`( ?${regexEscape(close)})?$`), "") : newLines[last] + " " + close;
              let newText = newLines.join("\n");
              let firstInsersion = insertionPoint + start1;
              let newStart = firstInsersion > start ? start : Math.max(start + diff, firstInsersion);
              let newEnd = firstInsersion > end - (start != end) ? end : Math.min(Math.max(firstInsersion, end + diff), start1 + newText.length);
              insertText(editor, newText, start1, end1, newStart, Math.max(newStart, newEnd));
              scroll2();
              preventDefault(e);
            }
          }
        } else if (code == 8 + mod && keyCode == 75) {
          const value = editor.value;
          const [lines, start1, end1] = getLines(value, start, end);
          const column = dir > "f" ? end - end1 + lines.pop().length : start - start1;
          const newLineLen = getLineEnd(value, end1 + 1) - end1 - 1;
          insertText(
            editor,
            "",
            start1 - !!start1,
            end1 + !start1,
            start1 + Math.min(column, newLineLen)
          );
          scroll2();
          preventDefault(e);
        }
      });
      ["copy", "cut", "paste"].forEach(
        (type) => addTextareaListener(editor, type, (e) => {
          const [start, end] = getSelection();
          if (start == end && clipboard) {
            const [[line], start1, end1] = getLines(editor.value, start, end);
            if (type == "paste") {
              if (e.clipboardData.getData("text/plain") == prevCopy) {
                insertText(editor, prevCopy + "\n", start1, start1, start + prevCopy.length + 1);
                scroll2();
                preventDefault(e);
              }
            } else {
              clipboard.writeText(prevCopy = line);
              if (type == "cut") insertText(editor, "", start1, end1 + 1), scroll2();
              preventDefault(e);
            }
          }
        })
      );
    };
    editHistory = (historyLimit = 999) => {
      let sp = 0;
      let currentEditor;
      let allowMerge;
      let isTyping = false;
      let prevInputType;
      let prevData;
      let prevTime;
      let isMerge;
      let textarea;
      let getSelection;
      const stack = [];
      const update = (index) => {
        if (index >= historyLimit) {
          index--;
          stack.shift();
        }
        stack.splice(sp = index, historyLimit, [currentEditor.value, getSelection(), getSelection()]);
      };
      const setEditorState = (index) => {
        if (stack[index]) {
          textarea.value = stack[index][0];
          textarea.setSelectionRange(...stack[index][index < sp ? 2 : 1]);
          currentEditor.update();
          currentEditor.extensions.cursor?.scrollIntoView();
          sp = index;
          allowMerge = false;
        }
      };
      const self = (editor, options) => {
        editor.extensions.history = self;
        currentEditor = editor;
        getSelection = editor.getSelection;
        textarea || update(0);
        textarea = editor.textarea;
        editor.on("selectionChange", () => {
          allowMerge = isTyping;
          isTyping = false;
        });
        addTextareaListener(editor, "beforeinput", (e) => {
          let data = e.data;
          let inputType = e.inputType;
          let time = e.timeStamp;
          if (/history/.test(inputType)) {
            setEditorState(sp + (inputType[7] == "U" ? -1 : 1));
            preventDefault(e);
          } else if (!(isMerge = allowMerge && (prevInputType == inputType || time - prevTime < 99 && inputType.slice(-4) == "Drop") && !prevSelection && (data != " " || prevData == data))) {
            stack[sp][2] = prevSelection || getSelection();
          }
          isTyping = true;
          prevData = data;
          prevTime = time;
          prevInputType = inputType;
        });
        addTextareaListener(editor, "input", () => update(sp + !isMerge));
        addTextareaListener(editor, "keydown", (e) => {
          if (!options.readOnly) {
            const code = getModifierCode(e);
            const keyCode = e.keyCode;
            const isUndo = code == mod && keyCode == 90;
            const isRedo = code == mod + 8 && keyCode == 90 || !isMac && code == mod && keyCode == 89;
            if (isUndo) {
              setEditorState(sp - 1);
              preventDefault(e);
            } else if (isRedo) {
              setEditorState(sp + 1);
              preventDefault(e);
            }
          }
        });
      };
      self.clear = () => {
        update(0);
        allowMerge = false;
      };
      self.has = (offset) => sp + offset in stack;
      self.go = (offset) => setEditorState(sp + offset);
      return self;
    };
  }
});

// node_modules/prism-code-editor/dist/search-Dk5fdw4x.js
var searchTemplate, matchTemplate, testBoundary, createSearchAPI;
var init_search_Dk5fdw4x = __esm({
  "node_modules/prism-code-editor/dist/search-Dk5fdw4x.js"() {
    init_index_BvZmi6ce();
    init_index_CKRNGLIi();
    searchTemplate = /* @__PURE__ */ createTemplate(
      '<div style="color:#0000;contain:strict;padding:0 var(--_pse) 0 var(--padding-left)" aria-hidden=true> '
    );
    matchTemplate = /* @__PURE__ */ createTemplate("<span> ");
    testBoundary = (str, position, pattern = /[_\p{N}\p{L}]{2}/u) => {
      if (!position) return false;
      return pattern.test(
        str.slice(
          position - (str.codePointAt(position - 2) > 65535 ? 2 : 1),
          position + (str.codePointAt(position) > 65535 ? 2 : 1)
        )
      );
    };
    createSearchAPI = (editor) => {
      const container = searchTemplate();
      const nodes = [container.firstChild];
      const matchPositions = [];
      const stopSearch = () => {
        if (matchPositions[0]) {
          matchPositions.length = 0;
          container.remove();
        }
      };
      let regex;
      let lastNode = 0;
      return {
        search(str, caseSensitive, wholeWord, useRegExp, selection, filter, pattern) {
          if (!str) return stopSearch();
          if (!useRegExp) str = regexEscape(str);
          const value = editor.value;
          const searchStr = selection ? value.slice(...selection) : value;
          const offset = selection ? selection[0] : 0;
          let match;
          let l;
          let index;
          let i = 0;
          try {
            regex = RegExp(str, `gum${caseSensitive ? "" : "i"}`);
            while (match = regex.exec(searchStr)) {
              l = match[0].length;
              index = match.index + offset;
              if (!l) regex.lastIndex += value.codePointAt(index) > 65535 ? 2 : 1;
              if (wholeWord && (testBoundary(value, index, pattern) || testBoundary(value, index + l, pattern)))
                continue;
              if (!filter || filter(index, index + l)) matchPositions[i++] = [index, index + l];
            }
          } catch (e) {
            stopSearch();
            return e.message;
          }
          if (i) {
            matchPositions.length = i;
            l = Math.min(i * 2, 2e4);
            for (i = nodes.length; i <= l; ) {
              nodes[i++] = matchTemplate();
              nodes[i++] = new Text();
            }
            for (i = l; i < lastNode; ) nodes[++i].remove();
            if (lastNode < l) container.append(...nodes.slice(lastNode + 1, l + 1));
            let prevEnd = 0;
            for (i = 0; i < l; ) {
              const [start, end] = matchPositions[i / 2];
              updateNode(nodes[i++], value.slice(prevEnd, start));
              updateNode(nodes[i++].firstChild, value.slice(start, prevEnd = end));
            }
            updateNode(nodes[l], value.slice(prevEnd));
            if (!container.parentNode) addOverlay(editor, container);
            lastNode = l;
          } else stopSearch();
        },
        container,
        get regex() {
          return regex;
        },
        matches: matchPositions,
        stopSearch
      };
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/search/api.js
var createReplaceAPI;
var init_api = __esm({
  "node_modules/prism-code-editor/dist/extensions/search/api.js"() {
    init_search_Dk5fdw4x();
    init_index_BvZmi6ce();
    createReplaceAPI = (editor) => {
      const getSelection = editor.getSelection;
      const search = createSearchAPI(editor);
      const container = search.container;
      const matches = search.matches;
      const closest = () => {
        const caretPos = getSelection()[0];
        const l = matches.length;
        for (let i = l; i; ) {
          if (caretPos >= matches[--i][1]) return (i + (matches[i][0] < caretPos)) % l;
        }
        return l ? 0 : -1;
      };
      const toggleClasses = () => {
        currentLine?.classList.toggle("match-highlight");
        currentMatch?.classList.toggle("pce-match");
      };
      const removeSelection = () => {
        if (hasSelected) {
          toggleClasses();
          hasSelected = false;
        }
      };
      let currentLine;
      let currentMatch;
      let hasSelected = false;
      addTextareaListener(editor, "focus", removeSelection);
      return Object.assign(search, {
        next() {
          const cursor = getSelection()[1];
          const l = matches.length;
          for (let i = 0, match; i < l; i++) {
            match = matches[i];
            if (match[0] - (match[0] == match[1]) >= cursor) return i;
          }
          return l ? 0 : -1;
        },
        prev() {
          const cursor = getSelection()[0];
          const l = matches.length;
          for (let i = l, match; i; ) {
            match = matches[--i];
            if (match[1] + (match[0] == match[1]) <= cursor) return i;
          }
          return l - 1;
        },
        closest,
        selectMatch(index, scrollPadding) {
          removeSelection();
          if (matches[index]) {
            setSelection(editor, ...matches[index]);
            currentLine = editor.lines[editor.activeLine];
            currentMatch = container.children[index];
            hasSelected = true;
            toggleClasses();
            if (currentMatch) {
              scrollToEl(editor, currentMatch, scrollPadding);
            }
          }
        },
        replace(str) {
          if (matches[0]) {
            let index = closest();
            let [start, end] = matches[index];
            let [caretStart, caretEnd] = getSelection();
            let notSelected = start != caretStart || end != caretEnd;
            if (notSelected) return index;
            if (editor.value.slice(start, end) == str) return matches[++index] ? index : 0;
            return insertText(editor, str);
          }
        },
        replaceAll(str) {
          if (!matches[0]) return;
          let value = editor.value;
          let [start, end] = getSelection();
          let newLen = str.length;
          let newStart = start;
          let newEnd = end;
          let newValue = "";
          let l = matches.length;
          for (let i = 0; i < l; i++) {
            const [matchStart, matchEnd] = matches[i];
            const lengthDiff = newLen - matchEnd + matchStart;
            const move = (pos) => matchStart > pos ? 0 : pos >= matchEnd ? lengthDiff : lengthDiff < 0 && pos > matchStart + newLen ? newLen + matchStart - pos : 0;
            newEnd += move(end);
            newStart += move(start);
            newValue += i ? value.slice(matches[i - 1][1], matchStart) + str : str;
          }
          insertText(editor, newValue, matches[0][0], matches[l - 1][1], newStart, newEnd);
        },
        destroy() {
          editor.textarea.removeEventListener("focus", removeSelection);
          removeSelection();
          container.remove();
        }
      });
    };
  }
});

// node_modules/prism-code-editor/dist/selection-M9_8z0AZ.js
var highlightSelectionMatches;
var init_selection_M9_8z0AZ = __esm({
  "node_modules/prism-code-editor/dist/selection-M9_8z0AZ.js"() {
    init_search_Dk5fdw4x();
    highlightSelectionMatches = (caseSensitive, minLength = 1, maxLength = 200) => {
      const self = (editor) => {
        const searchAPI = self.api = createSearchAPI(editor);
        const container = searchAPI.container;
        container.style.zIndex = -1;
        container.className = "selection-matches";
        editor.on("selectionChange", ([start, end], value) => {
          value = editor.focused ? value.slice(start, end) : "";
          start += value.search(/\S/);
          value = value.trim();
          let l = value.length;
          searchAPI.search(
            minLength > l || l > maxLength ? "" : value,
            caseSensitive,
            false,
            false,
            void 0,
            (mStart, mEnd) => mStart > start || mEnd <= start
          );
        });
      };
      return self;
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/search/index.js
var shortcut, template2, toggleAttr, searchWidget, showInvisibles;
var init_search = __esm({
  "node_modules/prism-code-editor/dist/extensions/search/index.js"() {
    init_index_CKRNGLIi();
    init_index_BvZmi6ce();
    init_api();
    init_search_Dk5fdw4x();
    shortcut = ` (Alt+${isMac ? "Cmd+" : ""}`;
    template2 = /* @__PURE__ */ createTemplate(
      `<div class=prism-search-container style=display:flex;align-items:flex-start;justify-content:flex-end><div dir=ltr class=prism-search><button type=button aria-expanded=false title="Toggle Replace" class=pce-expand></button><div spellcheck=false><div><div class="pce-input pce-find"><input autocorrect=off autocapitalize=off placeholder=Find aria-label=Find><button type=button class=prev-match title="Previous Match (Shift+Enter)"></button><button type=button class=next-match title="Next Match (Enter)"></button><div class=search-error></div></div><button type=button class=pce-close title="Close (Esc)"></button></div><div class="pce-input pce-replace"><input autocorrect=off autocapitalize=off placeholder=Replace aria-label=Replace><button type=button title=(Enter)>Replace</button><button type=button title=(${isMac ? "Cmd" : "Ctrl+Alt"}+Enter)>All</button></div><div class=pce-options><div class=pce-match-count>0<span> of </span>0</div><button type=button aria-pressed=false class=pce-regex title="RegExp Search${shortcut}R)"><span aria-hidden=true></span></button><button type=button aria-pressed=false title="Preserve Case${shortcut}P)"><span aria-hidden=true>Aa</span></button><button type=button aria-pressed=false class=pce-whole title="Match Whole Word${shortcut}W)"><span aria-hidden=true>ab</span></button><button type=button aria-pressed=false class=pce-in-selection title="Find in Selection${shortcut}L)">`
    );
    toggleAttr = (el, name) => el.setAttribute(name, el.getAttribute(name) == "false");
    searchWidget = () => {
      let prevLength;
      let useRegExp;
      let matchCase;
      let wholeWord;
      let searchSelection;
      let isOpen2;
      let currentSelection;
      let prevUserSelection;
      let prevMargin;
      let selectNext = false;
      let marginTop;
      const self = (editor) => {
        editor.extensions.searchWidget = self;
        const { textarea, wrapper, container, getSelection } = editor;
        const replaceAPI = createReplaceAPI(editor);
        const startSearch = (selectMatch) => {
          if (selectMatch && !isWebKit) textarea.setSelectionRange(...prevUserSelection);
          const error = replaceAPI.search(
            findInput.value,
            matchCase,
            wholeWord,
            useRegExp,
            searchSelection
          );
          const index = error ? -1 : selectNext ? replaceAPI.next() : replaceAPI.closest();
          updateNode(current, index + 1);
          updateNode(total, replaceAPI.matches.length);
          findContainer.classList.toggle("pce-error", !!error);
          if (error) errorEl.textContent = error;
          else if (selectMatch || selectNext) replaceAPI.selectMatch(index, prevMargin);
        };
        const keydown = (e) => {
          if (e.keyCode >> 1 == 35 && getModifierCode(e) == (isMac ? 4 : 2)) {
            preventDefault(e);
            open();
            let [start, end] = getSelection(), value = editor.value, word = value.slice(start, end) || /[_\p{N}\p{L}]*$/u.exec(getLineBefore(value, start))[0] + /^[_\p{N}\p{L}]*/u.exec(value.slice(start))[0];
            if (/^$|\n/.test(word)) startSearch();
            else {
              if (useRegExp) word = regexEscape(word);
              doc.execCommand("insertText", false, word);
              findInput.select();
            }
          }
        };
        const open = (focusInput = true) => {
          if (!isOpen2) {
            isOpen2 = true;
            if (marginTop == null) prevMargin = marginTop = getStyleValue(wrapper, "marginTop");
            prevUserSelection = getSelection();
            addOverlay(editor, searchContainer);
            updateMargin();
            resize();
            observer?.observe(container);
          }
          if (focusInput) findInput.select();
        };
        const close = self.close = (focusTextarea = true) => {
          if (isOpen2) {
            isOpen2 = false;
            replaceAPI.stopSearch();
            searchContainer.remove();
            updateMargin();
            observer?.disconnect();
            focusTextarea && textarea.focus();
          }
        };
        const move = (next) => {
          if (replaceAPI.matches[0]) {
            const index = replaceAPI[next ? "next" : "prev"]();
            replaceAPI.selectMatch(index, prevMargin);
            updateNode(current, index + 1);
          }
        };
        const updateMargin = () => {
          const newMargin = isOpen2 ? getStyleValue(search, "top") + getStyleValue(search, "height") : marginTop;
          const newScroll = container.scrollTop + newMargin - prevMargin;
          wrapper.style.marginTop = isOpen2 ? newMargin + "px" : "";
          container.scrollTop = newScroll;
          prevMargin = newMargin;
        };
        const resize = () => div.style.setProperty(
          "--search-width",
          `min(${container.clientWidth - 2}px - 2.4em - var(--padding-left),20em)`
        );
        const observer = window.ResizeObserver && new ResizeObserver(resize);
        const replace2 = () => {
          selectNext = true;
          const index = replaceAPI.replace(replaceInput.value);
          if (index != null) {
            updateNode(current, index + 1);
            replaceAPI.selectMatch(index, prevMargin);
          }
          selectNext = false;
        };
        const replaceAll = () => {
          replaceAPI.replaceAll(replaceInput.value);
        };
        const keyCodeButtonMap = {
          80: matchCaseEl,
          87: wholeWordEl,
          82: useRegExpEl,
          76: inSelectionEl
        };
        const elementHandlerMap = /* @__PURE__ */ new Map([
          [nextEl, () => move(true)],
          [prevEl, move],
          [closeEl, close],
          [replaceEl, replace2],
          [replaceAllEl, replaceAll],
          [
            toggle,
            () => {
              toggleAttr(toggle, "aria-expanded");
              updateMargin();
            }
          ],
          [matchCaseEl, () => matchCase = !matchCase],
          [useRegExpEl, () => useRegExp = !useRegExp],
          [wholeWordEl, () => wholeWord = !wholeWord],
          [
            inSelectionEl,
            () => {
              const value = editor.value;
              if (searchSelection) searchSelection = void 0;
              else {
                searchSelection = getSelection().slice(0, 2);
                if (numLines(value, ...searchSelection) > 1) {
                  searchSelection = [
                    getLineStart(value, searchSelection[0]),
                    getLineEnd(value, searchSelection[1])
                  ];
                }
              }
              prevLength = value.length;
            }
          ]
        ]);
        addListener(textarea, "keydown", keydown);
        addListener(textarea, "beforeinput", () => {
          if (isOpen2 && searchSelection) currentSelection = getSelection();
        });
        editor.on("update", () => {
          if (!isOpen2) return;
          if (searchSelection && currentSelection) {
            const diff = prevLength - (prevLength = editor.value.length);
            const end = currentSelection[1];
            if (end <= searchSelection[1]) {
              searchSelection[1] -= diff;
              if (end <= searchSelection[0] - +(diff < 0)) searchSelection[0] -= diff;
            }
          }
          startSearch();
        });
        editor.on("selectionChange", (selection) => {
          if (isOpen2 && editor.focused) prevUserSelection = selection;
        });
        addListener(searchContainer, "click", (e) => {
          const target = e.target;
          const remove = editor.on("update", () => target.focus());
          elementHandlerMap.get(target)?.();
          if (target.matches(".pce-options>button")) {
            toggleAttr(target, "aria-pressed");
            startSearch(true);
          }
          remove();
        });
        addListener(findInput, "input", () => isOpen2 && startSearch(true));
        addListener(searchContainer, "keydown", (e) => {
          const shortcut2 = getModifierCode(e);
          const target = e.target;
          const keyCode = e.keyCode;
          const isFind = target == findInput;
          if (shortcut2 == (isMac ? 5 : 1)) {
            if (keyCodeButtonMap[keyCode]) {
              preventDefault(e);
              keyCodeButtonMap[keyCode].click();
            }
          } else if (keyCode == 13 && target.tagName == "INPUT") {
            preventDefault(e);
            if (!shortcut2) isFind ? move(true) : replaceEl.click();
            else if (shortcut2 == 8 && isFind) move();
            else if (shortcut2 == (isMac ? 4 : 3) && !isFind) replaceAllEl.click();
            target.focus();
          } else if (!shortcut2 && keyCode == 27) close();
          else keydown(e);
        });
        self.open = (focusInput) => {
          open(focusInput);
          startSearch();
        };
        replaceAPI.container.className = "pce-matches";
      };
      const searchContainer = template2();
      const search = self.element = searchContainer.firstChild;
      const [toggle, div] = search.children;
      const rows = div.children;
      const [findContainer, closeEl] = rows[0].children;
      const [findInput, prevEl, nextEl, errorEl] = findContainer.children;
      const [replaceInput, replaceEl, replaceAllEl] = rows[1].children;
      const [matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = rows[2].children;
      const [current, , total] = matchCount.childNodes;
      self.open = self.close = () => {
      };
      return self;
    };
    showInvisibles = (alwaysShow) => {
      return (editor) => {
        let prev;
        const searchAPI = createSearchAPI(editor);
        const matches = searchAPI.matches;
        const container = searchAPI.container;
        const nodes = container.children;
        const tabs = [];
        const update = () => {
          const value = editor.value;
          const [start, end] = editor.getSelection();
          if (!alwaysShow || prev != (prev = value)) {
            searchAPI.search(" |	", true, false, true, alwaysShow ? void 0 : [start, end]);
            for (let i = 0, l = matches.length; i < l; i++) {
              if (value[matches[i][0]] == "	" == !tabs[i]) {
                nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : "";
              }
            }
          }
        };
        container.className = "pce-invisibles";
        if (editor.value) update();
        editor.on("selectionChange", update);
      };
    };
  }
});

// node_modules/prism-code-editor/dist/extensions/matchTags.js
var createTagMatcher, getClosestTagIndex, matchTags;
var init_matchTags = __esm({
  "node_modules/prism-code-editor/dist/extensions/matchTags.js"() {
    init_index_BvZmi6ce();
    createTagMatcher = (editor) => {
      let pairMap = [];
      let code;
      let tags = [];
      let tagIndex;
      let sp;
      let stack = [];
      let matchTags2 = (tokens, language, value) => {
        code = value;
        tags.length = pairMap.length = tagIndex = sp = 0;
        matchTagsRecursive(tokens, language, 0);
      };
      let matchTagsRecursive = (tokens, language, position) => {
        let noVoidTags = voidlessLangs.has(language);
        let i = 0;
        let l = tokens.length;
        for (; i < l; ) {
          const token = tokens[i++];
          const content = token.content;
          const length = token.length;
          if (Array.isArray(content)) {
            if (token.type == "tag" && code[position] == "<") {
              const openLen = content[0].length;
              const tagName = content[2] ? code.substr(position + openLen, content[1].length) : "";
              const notSelfClosing = content[content.length - 1].length < 2 && (noVoidTags || !voidTags.test(tagName));
              if (content[2] && noVoidTags) matchTagsRecursive(content, language, position);
              if (notSelfClosing) {
                if (openLen > 1) {
                  for (let i2 = sp; i2; ) {
                    if (tagName == stack[--i2][1]) {
                      pairMap[pairMap[tagIndex] = stack[sp = i2][0]] = tagIndex;
                      i2 = 0;
                    }
                  }
                } else {
                  stack[sp++] = [tagIndex, tagName];
                }
              }
              tags[tagIndex++] = [
                token,
                position,
                position + length,
                tagName,
                openLen > 1,
                notSelfClosing
              ];
            } else {
              let lang = token.alias || token.type;
              matchTagsRecursive(
                content,
                lang.slice(0, 9) == "language-" ? lang.slice(9) : language,
                position
              );
            }
          }
          position += length;
        }
      };
      editor.on("tokenize", matchTags2);
      matchTags2(editor.tokens, editor.options.language, editor.value);
      return {
        tags,
        pairs: pairMap
      };
    };
    getClosestTagIndex = (pos, tags) => {
      for (let i = 0, l = tags.length; i < l; i++) if (tags[i][1] <= pos && tags[i][2] >= pos) return i;
    };
    matchTags = () => (editor) => {
      let openEl, closeEl;
      const { tags, pairs } = editor.extensions.matchTags ||= createTagMatcher(editor);
      const highlight2 = (remove) => [openEl, closeEl].forEach((el) => {
        el && el.classList.toggle("active-tagname", !remove);
      });
      editor.on("selectionChange", ([start, end]) => {
        let newEl1;
        let newEl2;
        let index;
        if (start == end && editor.focused) {
          index = getClosestTagIndex(start, tags);
          if (index + 1) {
            index = pairs[index];
            if (index + 1 && (newEl1 = getClosestToken(editor, ".tag>.tag"))) {
              newEl2 = getClosestToken(editor, ".tag>.tag", 2, 0, tags[index][1]);
            }
          }
        }
        if (openEl != newEl1) {
          highlight2(true);
          openEl = newEl1;
          closeEl = newEl2;
          highlight2();
        }
      });
    };
  }
});

// node_modules/prism-code-editor/dist/basic-CTpZlE3m.js
var basic_CTpZlE3m_exports = {};
__export(basic_CTpZlE3m_exports, {
  basic: () => basic,
  style: () => style
});
var searchStyle, invisibles, basic, style;
var init_basic_CTpZlE3m = __esm({
  "node_modules/prism-code-editor/dist/basic-CTpZlE3m.js"() {
    init_abap();
    init_abnf();
    init_actionscript();
    init_ada();
    init_agda();
    init_al();
    init_antlr4();
    init_apacheconf();
    init_apex();
    init_apl();
    init_applescript();
    init_aql();
    init_arduino();
    init_arff();
    init_arturo();
    init_asciidoc();
    init_asm();
    init_aspnet();
    init_astro();
    init_autohotkey();
    init_autoit();
    init_avisynth();
    init_avro_idl();
    init_awk();
    init_bash();
    init_basic();
    init_batch();
    init_bbj();
    init_bicep();
    init_birb();
    init_bison();
    init_bqn();
    init_brightscript();
    init_bro();
    init_bsl();
    init_cfscript();
    init_chaiscript();
    init_cil();
    init_cilk();
    init_clike();
    init_clojure();
    init_cmake();
    init_cobol();
    init_coffeescript();
    init_concurnas();
    init_cooklang();
    init_coq();
    init_cshtml();
    init_css();
    init_cue();
    init_cypher();
    init_dataweave();
    init_dax();
    init_dhall();
    init_django();
    init_dns_zone_file();
    init_docker();
    init_dot();
    init_ebnf();
    init_editorconfig();
    init_eiffel();
    init_ejs();
    init_elixir();
    init_elm();
    init_erb();
    init_erlang();
    init_etlua();
    init_excel_formula();
    init_factor();
    init_false();
    init_firestore_security_rules();
    init_fortran();
    init_fsharp();
    init_ftl();
    init_gap();
    init_gcode();
    init_gdscript();
    init_gettext();
    init_gherkin();
    init_git();
    init_glsl();
    init_gml();
    init_gn();
    init_go_module();
    init_gradle();
    init_graphql();
    init_groovy();
    init_haml();
    init_handlebars();
    init_haskell();
    init_hcl();
    init_hoon();
    init_html();
    init_ichigojam();
    init_icon();
    init_iecst();
    init_ignore();
    init_inform7();
    init_ini();
    init_io();
    init_j();
    init_jolie();
    init_jq();
    init_json();
    init_jsx();
    init_julia();
    init_keepalived();
    init_keyman();
    init_kotlin();
    init_kumir();
    init_kusto();
    init_latex();
    init_latte();
    init_lilypond();
    init_linker_script();
    init_liquid();
    init_lisp();
    init_livescript();
    init_llvm();
    init_lolcode();
    init_lua();
    init_magma();
    init_makefile();
    init_mata();
    init_matlab();
    init_maxscript();
    init_mel();
    init_mermaid();
    init_metafont();
    init_mizar();
    init_mongodb();
    init_monkey();
    init_moonscript();
    init_n1ql();
    init_n4js();
    init_nand2tetris_hdl();
    init_naniscript();
    init_neon();
    init_nevod();
    init_nginx();
    init_nim();
    init_nix();
    init_nsis();
    init_objectivec();
    init_ocaml();
    init_odin();
    init_opencl();
    init_openqasm();
    init_oz();
    init_parigp();
    init_parser();
    init_pascal();
    init_peoplecode();
    init_perl();
    init_php();
    init_plant_uml();
    init_powerquery();
    init_powershell();
    init_processing();
    init_prolog();
    init_promql();
    init_properties();
    init_protobuf();
    init_psl();
    init_pug();
    init_puppet();
    init_pure();
    init_purebasic();
    init_python();
    init_q();
    init_qml();
    init_qore();
    init_qsharp();
    init_r();
    init_reason();
    init_rego();
    init_rescript();
    init_rest();
    init_rip();
    init_roboconf();
    init_robotframework();
    init_ruby();
    init_rust();
    init_sas();
    init_scala();
    init_scheme();
    init_smali();
    init_smalltalk();
    init_smarty();
    init_sml();
    init_solidity();
    init_solution_file();
    init_soy();
    init_splunk_spl();
    init_sqf();
    init_sql();
    init_squirrel();
    init_stan();
    init_stata();
    init_stylus();
    init_supercollider();
    init_svelte();
    init_swift();
    init_systemd();
    init_tcl();
    init_textile();
    init_toml();
    init_tremor();
    init_tt2();
    init_turtle();
    init_twig();
    init_typoscript();
    init_unrealscript();
    init_uorazor();
    init_v();
    init_vala();
    init_vbnet();
    init_velocity();
    init_verilog();
    init_vhdl();
    init_vim();
    init_visual_basic();
    init_vue();
    init_warpscript();
    init_wasm();
    init_web_idl();
    init_wgsl();
    init_wiki();
    init_wolfram();
    init_wren();
    init_xeora();
    init_xml();
    init_xojo();
    init_xquery();
    init_yaml();
    init_yang();
    init_zig();
    init_matchBrackets();
    init_highlight();
    init_guides();
    init_cursor();
    init_commands();
    init_search();
    init_selection_M9_8z0AZ();
    init_matchTags();
    searchStyle = '.prism-search{display:grid;border:1px solid var(--widget__border);grid:auto / 1em auto;gap:.3em;padding:.3em;border-radius:.3em;margin:-99in 0 0;line-height:1.5;color:var(--widget__color);background:var(--widget__bg);position:sticky;top:.5em;right:.5em;left:.5em;z-index:4;pointer-events:auto}.prism-search-container *{box-sizing:border-box}.prism-search button{all:unset;cursor:pointer}.pce-readonly .prism-search{grid:auto / auto}.prism-search>div>div{display:flex}.prism-search input{padding:0 0 0 .3em;width:calc(var(--search-width, 20em) - 10ch - 4px);font:inherit;border:none;background:#0000;color:var(--widget__color)}.prism-search ::placeholder{color:inherit;opacity:.6}.pce-match-count{margin:1px auto 1px 0}.pce-match-count,.pce-input{font-family:Arial,Helvetica,sans-serif}.pce-options{color:var(--widget__color-options);font-size:80%;gap:.25em}.pce-options button{padding:0 .2em;border-radius:.2em;width:1.2em;text-align:center}.pce-options button span{pointer-events:none}.prism-search button:focus-visible{outline:1px solid var(--widget__focus-ring);z-index:1}.prism-search .pce-input,.pce-options button{box-shadow:0 0 0 1px var(--_border, var(--widget__border));margin:1px}.prism-search .pce-input{display:flex;position:relative;background:var(--widget__bg-input);border-radius:.15em;height:1.5em}.prism-search input:focus{outline:0}.pce-input:focus-within{--_border: var(--widget__focus-ring)}.pce-find button{display:grid;align-items:center;padding:0 .4em}.pce-replace button{width:7.3ch;text-align:center}.pce-replace :last-child{width:2.7ch}.pce-input button{box-shadow:-1px 0 0 0 var(--widget__border);margin-left:1px}.prev-match:before{transform:rotate(-90deg)}.next-match:before,.pce-expand:before{transform:rotate(90deg)}@media (hover: hover){.prism-search button:hover{background:var(--widget__bg-hover)}}.pce-options button[aria-pressed=true]{background:var(--widget__bg-active);color:var(--widget__color-active);--_border: var(--widget__focus-ring)}.pce-input>:nth-child(3){border-radius:0 .15em .15em 0}.pce-input.pce-error{--_border: var(--widget__error-ring)}.search-error{display:none;position:absolute;top:100%;box-shadow:inherit;width:100%;white-space:normal;word-break:break-word;left:0;background:var(--widget__bg-error);padding:.5em;z-index:1}.pce-error:focus-within .search-error{display:block}button.pce-close{display:grid;width:1.3em;height:1.3em;place-items:center;margin-left:auto;border-radius:.3em}.pce-find button:before,.pce-expand:before,.pce-close:before{content:"";background:currentColor;height:1.2em;opacity:.75}.pce-close:before{clip-path:polygon(50% 44.34%,0% 74.34%,9.43% 80%,9.43% 20%,0% 25.66%,50% 55.66%,100% 25.66%,90.57% 20%,50% 44.34%,9.43% 20%,9.43% 80%,50% 55.66%,90.57% 80%,100% 74.34%);width:.72em}.prism-search>div{display:grid;gap:.25em;width:var(--search-width, 20em)}button.pce-expand{display:grid;place-items:center;border-radius:.25em;margin:-.15em}.pce-readonly .pce-expand,[aria-expanded=false]+div .pce-replace,.pce-readonly .pce-replace{display:none}.pce-expand[aria-expanded=true]:before{transform:rotate(180deg)}.pce-find button:before,.pce-expand:before{width:.84em;clip-path:polygon(50% 28.96%,0% 63.96%,10.1% 71.04%,50% 43.11%,89.9% 71.04%,100% 63.96%)}button.pce-regex{display:flex}.pce-regex span{display:flex;align-items:flex-end}.pce-regex span:before{content:"";width:.3em;height:.3em;background:currentColor;margin:0 0 .2em .1em}.pce-regex span:after{content:"*";line-height:0;font-size:140%;margin-bottom:.5em}button.pce-in-selection{display:grid;place-items:center}button.pce-whole{position:relative}.pce-whole:after{content:"";position:absolute;bottom:.31em;right:.27em;left:.27em;height:.25em;clip-path:inset(1px -1px -1px);box-shadow:0 0 0 1px}.pce-in-selection:before{content:"";height:80%;width:90%;background:currentColor;clip-path:polygon(0 16%,80% 16%,80% 24%,0 24%,0 46%,100% 46%,100% 54%,0 54%,0 76%,60% 76%,60% 84%,0 84%)}.pce-matches span{background:var(--search__bg-find)}.pce-matches :empty{padding:0 2px;margin:0 -2px}';
    invisibles = '.pce-invisibles :before{content:"\xB7";position:absolute;color:var(--pce-invisibles, #e3e4e229)}.pce-tab:before{content:"\u2192"}';
    basic = (history = editHistory()) => [
      defaultCommands(),
      indentGuides(),
      matchBrackets(),
      highlightBracketPairs(),
      cursorPosition(),
      highlightSelectionMatches(),
      searchWidget(),
      showInvisibles(),
      matchTags(),
      history,
      {
        update(editor) {
          if (editor.value != editor.textarea.value) history.clear();
        }
      }
    ];
    style = searchStyle + invisibles;
  }
});

// node_modules/prism-code-editor/dist/setups/index.js
init_index_CKRNGLIi();

// node_modules/prism-code-editor/dist/themes/index.js
var themes = /* @__PURE__ */ Object.assign({ "./atom-one-dark.css": () => Promise.resolve().then(() => (init_atom_one_dark(), atom_one_dark_exports)), "./dracula.css": () => Promise.resolve().then(() => (init_dracula(), dracula_exports)), "./github-dark-dimmed.css": () => Promise.resolve().then(() => (init_github_dark_dimmed(), github_dark_dimmed_exports)), "./github-dark.css": () => Promise.resolve().then(() => (init_github_dark(), github_dark_exports)), "./github-light.css": () => Promise.resolve().then(() => (init_github_light(), github_light_exports)), "./night-owl-light.css": () => Promise.resolve().then(() => (init_night_owl_light(), night_owl_light_exports)), "./night-owl.css": () => Promise.resolve().then(() => (init_night_owl(), night_owl_exports)), "./prism-okaidia.css": () => Promise.resolve().then(() => (init_prism_okaidia(), prism_okaidia_exports)), "./prism-solarized-light.css": () => Promise.resolve().then(() => (init_prism_solarized_light(), prism_solarized_light_exports)), "./prism-tomorrow.css": () => Promise.resolve().then(() => (init_prism_tomorrow(), prism_tomorrow_exports)), "./prism-twilight.css": () => Promise.resolve().then(() => (init_prism_twilight(), prism_twilight_exports)), "./prism.css": () => Promise.resolve().then(() => (init_prism(), prism_exports)), "./vs-code-dark.css": () => Promise.resolve().then(() => (init_vs_code_dark(), vs_code_dark_exports)), "./vs-code-light.css": () => Promise.resolve().then(() => (init_vs_code_light(), vs_code_light_exports)) });
var loadTheme = async (name) => (await themes[`./${name}.css`]?.())?.default;

// node_modules/prism-code-editor/dist/setups/index.js
var addStyles = (shadow, styles2, id) => {
  let style2 = shadow.getElementById(id);
  if (!style2) {
    style2 = doc.createElement("style");
    style2.id = id;
    shadow.append(style2);
  }
  style2.textContent = styles2;
};
var minimalEditor = (container, options, onLoad) => {
  const el = getElement(container);
  const shadow = el.shadowRoot || el.attachShadow({ mode: "open" });
  const editor = createEditor(null, null, {
    update(_, options2) {
      if (theme != (theme = options2.theme))
        loadTheme(theme).then((style2) => {
          if (style2 && theme == options2.theme) addStyles(shadow, style2, "theme");
        });
    }
  });
  const remove = editor.remove;
  let removed;
  let theme = options.theme;
  editor.remove = () => {
    remove();
    removed = true;
  };
  Promise.all([Promise.resolve().then(() => (init_styles_pBF7Jo4d(), styles_pBF7Jo4d_exports)), loadTheme(options.theme)]).then(([style2, theme2]) => {
    if (!removed) {
      addStyles(shadow, style2.default, "layout-style");
      addStyles(shadow, theme2 || "", "theme");
      shadow.append(editor.container);
      editor.setOptions(options);
      onLoad && onLoad();
    }
  });
  return editor;
};
var basicEditor = (container, options, onLoad) => {
  Promise.resolve().then(() => (init_basic_CTpZlE3m(), basic_CTpZlE3m_exports)).then((mod2) => {
    addStyles(el.shadowRoot, mod2.style, "search-style");
    editor.addExtensions(...mod2.basic());
  });
  const el = getElement(container);
  const editor = minimalEditor(el, options, onLoad);
  return editor;
};

// node_modules/prism-code-editor/dist/prism/languages/javascript.js
init_index_C1_GGQ8y();

// node_modules/prism-code-editor/dist/patterns-Cp3h1ylA.js
var clikeComment2 = () => ({
  pattern: /\/\/.*|\/\*[^]*?(?:\*\/|$)/g,
  greedy: true
});
var clikeString = () => ({
  pattern: /(["'])(?:\\[^]|(?!\1)[^\\\n])*\1/g,
  greedy: true
});
var boolean = /\b(?:false|true)\b/;

// node_modules/prism-code-editor/dist/prism/languages/javascript.js
var js = {};
languages.js = languages.javascript = Object.assign(js, {
  "doc-comment": {
    pattern: /\/\*\*(?!\/)[^]*?(?:\*\/|$)/g,
    greedy: true,
    alias: "comment",
    inside: "jsdoc"
  },
  "comment": clikeComment2(),
  "hashbang": {
    pattern: /^#!.*/g,
    greedy: true,
    alias: "comment"
  },
  "template-string": {
    pattern: /`(?:\\[^]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\$\{)[^\\`])*`/g,
    greedy: true,
    inside: {
      "template-punctuation": {
        pattern: /^`|`$/,
        alias: "string"
      },
      "interpolation": {
        pattern: /((?:^|[^\\])(?:\\\\)*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
        lookbehind: true,
        inside: {
          "interpolation-punctuation": {
            pattern: /^\$\{|\}$/,
            alias: "punctuation"
          },
          [rest]: js
        }
      },
      "string": /[^]+/
    }
  },
  "string-property": {
    pattern: /((?:^|[,{])[ 	]*)(["'])(?:\\[^]|(?!\2)[^\\\n])*\2(?=\s*:)/mg,
    lookbehind: true,
    greedy: true,
    alias: "property"
  },
  "string": clikeString(),
  "regex": {
    pattern: /((?:^|[^$\w\xa0-\uffff"'`.)\]\s]|\b(?:return|yield))\s*)\/(?:(?:\[(?:\\.|[^\\\n\]])*\]|\\.|[^\\\n/[])+\/[dgimyus]{0,7}|(?:\[(?:\\.|[^\\\n[\]]|\[(?:\\.|[^\\\n[\]]|\[(?:\\.|[^\\\n[\]])*\])*\])*\]|\\.|[^\\\n/[])+\/[dgimyus]{0,7}v[dgimyus]{0,7})(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?!\/\*|[^()[\]{}.,:;?`\n%&|^!=<>/*+-]))/g,
    lookbehind: true,
    greedy: true,
    inside: {
      "regex-flags": /\w+$/,
      "regex-delimiter": /^\/|\/$/,
      "regex-source": {
        pattern: /.+/,
        alias: "language-regex",
        inside: "regex"
      }
    }
  },
  "class-name": [
    {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new)\s+)(?!\d)(?:(?!\s)[$\w\xa0-\uffff.])+/,
      lookbehind: true,
      inside: {
        "punctuation": /\./
      }
    },
    {
      pattern: /(^|[^$\w\xa0-\uffff]|\s)(?![a-z\d])(?:(?!\s)[$\w\xa0-\uffff])+(?=\.(?:constructor|prototype)\b)/,
      lookbehind: true
    }
  ],
  // This must be declared before keyword because we use "function" inside the look-forward
  "function-variable": {
    pattern: /#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^)]*\))*\)|(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+)\s*=>))/,
    alias: "function",
    inside: {
      "maybe-class-name": /^[A-Z].*/
    }
  },
  "parameter": [
    /(function(?:\s+(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
    /(^|[^$\w\xa0-\uffff]|\s)(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*=>)/,
    /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
    /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|continue|default|do|else|finally|for|if|return|switch|throw|try|while|yield|class|const|debugger|delete|enum|extends|function|[gs]et|export|from|import|implements|in|instanceof|interface|let|new|null|of|package|private|protected|public|static|super|this|typeof|undefined|var|void|with)(?![$\w\xa0-\uffff]))(?:(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/
  ].map((pattern) => ({
    pattern,
    lookbehind: true,
    inside: js
  })),
  "constant": /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
  "keyword": [
    {
      pattern: /(^|[^.]|\.{3}\s*)\b(?:as|assert(?=\s*\{)|export|from(?!\s*[^\s"'])|import)\b/,
      alias: "module",
      lookbehind: true
    },
    {
      pattern: /(^|[^.]|\.{3}\s*)\b(?:await|break|case|catch|continue|default|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,
      alias: "control-flow",
      lookbehind: true
    },
    {
      pattern: /(^|[^.]|\.{3}\s*)\b(?:async(?!\s*[^\s($\w\xa0-\uffff])|class|const|debugger|delete|enum|extends|function|[gs]et(?!\s*[^\s#[$\w\xa0-\uffff])|implements|in|instanceof|interface|let|new|null|of|package|private|protected|public|static|super|this|typeof|undefined|var|void|with)\b/,
      lookbehind: true
    }
  ],
  "boolean": boolean,
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  "function": {
    pattern: /#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    inside: {
      "maybe-class-name": /^[A-Z].*/
    }
  },
  "number": {
    pattern: /(^|[^$\w])(?:NaN|Infinity|0[bB][01]+(?:_[01]+)*n?|0[oO][0-7]+(?:_[0-7]+)*n?|0[xX][a-fA-F\d]+(?:_[a-fA-F\d]+)*n?|\d+(?:_\d+)*n|(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?)(?![$\w])/,
    lookbehind: true
  },
  "literal-property": {
    pattern: /([\n,{][ 	]*)(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*:)/,
    lookbehind: true,
    alias: "property"
  },
  "operator": [
    {
      pattern: /=>/,
      alias: "arrow"
    },
    /--|\+\+|(?:\*\*|&&|\|\||[!=]=|>>>?|<<|[%&|^!=<>/*+-]|\?\?)=?|\.{3}|\?(?!\.)|~|:/
  ],
  "property-access": {
    pattern: /(\.\s*)#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+/,
    lookbehind: true,
    inside: {
      "maybe-class-name": /^[A-Z].*/
    }
  },
  "maybe-class-name": {
    pattern: /(^|[^$\w\xa0-\uffff])[A-Z][$\w\xa0-\uffff]+/,
    lookbehind: true
  },
  "punctuation": /\?\.|[()[\]{}.,:;]/
});

// node_modules/iongraph-web/dist/tweak.js
function tweak(name, initial, options = {}) {
  var _a, _b, _c, _d;
  let value = initial;
  const callbacks = [];
  const t = {
    get() {
      return value;
    },
    set(v) {
      value = v;
      for (const func of callbacks) {
        func(value);
      }
    },
    valueOf() {
      return value;
    },
    toString() {
      return String(value);
    },
    [Symbol.toPrimitive](hint) {
      if (hint === "string") {
        return String(value);
      }
      return value;
    },
    onChange(func) {
      callbacks.push(func);
    },
    initial,
    name,
    min: (_a = options.min) !== null && _a !== void 0 ? _a : 0,
    max: (_b = options.max) !== null && _b !== void 0 ? _b : 100,
    step: (_c = options.step) !== null && _c !== void 0 ? _c : 1
  };
  return ((_d = options.tweaksObject) !== null && _d !== void 0 ? _d : globalTweaks).add(t);
}
var Tweaks = class {
  constructor(options) {
    this.container = options.container;
    this.tweaks = [];
    this.callbacks = [];
  }
  /**
   * Adds a Tweak to this object. Not intended to be called directly; instead,
   * just call {@link tweak} with the `tweaksObject` option.
   */
  add(tweak2) {
    const existing = this.tweaks.find((t) => t.name === tweak2.name);
    if (existing) {
      return existing;
    }
    this.tweaks.push(tweak2);
    const el = document.createElement("div");
    this.container.appendChild(el);
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "end";
    el.style.gap = "0.5rem";
    const safename = tweak2.name.replace(/[a-zA-Z0-9]/g, "_");
    const label = document.createElement("label");
    el.appendChild(label);
    label.innerText = tweak2.name;
    label.htmlFor = `tweak-${safename}-input`;
    const input = document.createElement("input");
    el.appendChild(input);
    input.type = "number";
    input.value = String(tweak2);
    input.id = `tweak-${safename}-input`;
    input.style.width = "4rem";
    input.addEventListener("input", () => {
      tweak2.set(input.valueAsNumber);
    });
    const range = document.createElement("input");
    el.appendChild(range);
    range.type = "range";
    range.value = String(tweak2);
    range.min = String(tweak2.min);
    range.max = String(tweak2.max);
    range.step = tweak2.step === 0 ? "any" : String(tweak2.step);
    range.addEventListener("input", () => {
      tweak2.set(range.valueAsNumber);
    });
    const reset = document.createElement("button");
    el.appendChild(reset);
    reset.innerText = "Reset";
    reset.disabled = tweak2.get() === tweak2.initial;
    reset.addEventListener("click", () => {
      tweak2.set(tweak2.initial);
    });
    tweak2.onChange((v) => {
      input.value = String(v);
      range.value = String(v);
      reset.disabled = tweak2.get() === tweak2.initial;
      for (const func of this.callbacks) {
        func(tweak2);
      }
    });
    return tweak2;
  }
  onTweak(func) {
    this.callbacks.push(func);
  }
};
var globalContainer = document.createElement("div");
globalContainer.classList.add("tweaks-panel");
var globalTweaks = new Tweaks({ container: globalContainer });
globalTweaks.onTweak((t) => {
  window.dispatchEvent(new CustomEvent("tweak", { detail: t }));
});
window.tweaks = globalTweaks;
var testContainer = document.createElement("div");
var testTweaks = new Tweaks({ container: testContainer });
var testTweak = tweak("Test Value", 3, { tweaksObject: testTweaks });
testTweak.set(4);
testTweak = 4;

// node_modules/iongraph-web/dist/utils.js
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}
function filerp(current, target, r, dt) {
  return (current - target) * Math.pow(r, dt) + target;
}
function assert2(cond, msg, soft = false) {
  if (!cond) {
    if (soft) {
      console.error(msg !== null && msg !== void 0 ? msg : "Assertion failed");
    } else {
      throw new Error(msg !== null && msg !== void 0 ? msg : "Assertion failed");
    }
  }
}
function must(val, msg) {
  assert2(val, msg);
  return val;
}

// node_modules/iongraph-web/dist/Graph.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var DEBUG = tweak("Debug?", 0, { min: 0, max: 1 });
var CONTENT_PADDING = 20;
var BLOCK_GAP = 44;
var PORT_START = 16;
var PORT_SPACING = 60;
var ARROW_RADIUS = 12;
var TRACK_PADDING = 36;
var JOINT_SPACING = 16;
var HEADER_ARROW_PUSHDOWN = 16;
var LAYOUT_ITERATIONS = tweak("Layout Iterations", 2, { min: 0, max: 6 });
var NEARLY_STRAIGHT = tweak("Nearly Straight Threshold", 30, { min: 0, max: 200 });
var NEARLY_STRAIGHT_ITERATIONS = tweak("Nearly Straight Iterations", 8, { min: 0, max: 10 });
var STOP_AT_PASS = tweak("Stop At Pass", 30, { min: 0, max: 30 });
var ZOOM_SENSITIVITY = 1.5;
var WHEEL_DELTA_SCALE = 0.01;
var MAX_ZOOM = 1;
var MIN_ZOOM = 0.1;
var TRANSLATION_CLAMP_AMOUNT = 40;
function isTrueLH(block) {
  return block.attributes.includes("loopheader");
}
function isLH(block) {
  return block.loopHeight !== void 0;
}
function asLH(block) {
  assert2(block);
  if (isLH(block)) {
    return block;
  }
  throw new Error("Block is not a pseudo LoopHeader");
}
var LEFTMOST_DUMMY2 = 1 << 0;
var RIGHTMOST_DUMMY2 = 1 << 1;
var IMMINENT_BACKEDGE_DUMMY = 1 << 2;
var SC_TOTAL = 0;
var SC_SELF = 1;
var log = new Proxy(console, {
  get(target, prop) {
    const field = target[prop];
    if (typeof field !== "function") {
      return field;
    }
    return +DEBUG ? field.bind(target) : () => {
    };
  }
});
var Graph = class {
  constructor(viewport, pass, options = {}) {
    var _a, _b, _c, _d, _e, _f;
    const blocks = pass.mir.blocks;
    this.viewport = viewport;
    const viewportRect = viewport.getBoundingClientRect();
    this.viewportSize = {
      x: viewportRect.width,
      y: viewportRect.height
    };
    this.graphContainer = document.createElement("div");
    this.graphContainer.classList.add("ig-graph");
    this.graphContainer.style.transformOrigin = "top left";
    this.viewport.appendChild(this.graphContainer);
    this.pass = pass;
    this.blocks = blocks;
    this.blocksInOrder = [...blocks].sort((a, b) => a.id - b.id);
    this.blocksByID = /* @__PURE__ */ new Map();
    this.blocksByPtr = /* @__PURE__ */ new Map();
    this.insPtrsByID = /* @__PURE__ */ new Map();
    this.insIDsByPtr = /* @__PURE__ */ new Map();
    this.loops = [];
    this.sampleCounts = options.sampleCounts;
    this.maxSampleCounts = [0, 0];
    this.heatmapMode = SC_TOTAL;
    for (const [ins, count] of (_b = (_a = this.sampleCounts) === null || _a === void 0 ? void 0 : _a.totalLineHits) !== null && _b !== void 0 ? _b : []) {
      this.maxSampleCounts[SC_TOTAL] = Math.max(this.maxSampleCounts[SC_TOTAL], count);
    }
    for (const [ins, count] of (_d = (_c = this.sampleCounts) === null || _c === void 0 ? void 0 : _c.selfLineHits) !== null && _d !== void 0 ? _d : []) {
      this.maxSampleCounts[SC_SELF] = Math.max(this.maxSampleCounts[SC_SELF], count);
    }
    this.size = { x: 0, y: 0 };
    this.numLayers = 0;
    this.zoom = 1;
    this.translation = { x: 0, y: 0 };
    this.animating = false;
    this.targetZoom = 1;
    this.targetTranslation = { x: 0, y: 0 };
    this.startMousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.selectedBlockPtrs = /* @__PURE__ */ new Set();
    this.lastSelectedBlockPtr = 0;
    this.nav = {
      visited: [],
      currentIndex: -1,
      siblings: []
    };
    this.highlightedInstructions = [];
    this.instructionPalette = (_e = options.instructionPalette) !== null && _e !== void 0 ? _e : [0, 1, 2, 3, 4].map((n) => `var(--ig-highlight-${n})`);
    const lirBlocks = /* @__PURE__ */ new Map();
    for (const lir of pass.lir.blocks) {
      lirBlocks.set(lir.id, lir);
    }
    for (const block of blocks) {
      assert2(block.ptr, "blocks must always have non-null ptrs");
      this.blocksByID.set(block.id, block);
      this.blocksByPtr.set(block.ptr, block);
      for (const ins of block.instructions) {
        this.insPtrsByID.set(ins.id, ins.ptr);
        this.insIDsByPtr.set(ins.ptr, ins.id);
      }
      block.lir = (_f = lirBlocks.get(block.id)) !== null && _f !== void 0 ? _f : null;
      if (block.lir) {
        for (const ins of block.lir.instructions) {
          this.insPtrsByID.set(ins.id, ins.ptr);
          this.insIDsByPtr.set(ins.ptr, ins.id);
        }
      }
      const el = this.renderBlock(block);
      block.el = el;
      block.layer = -1;
      block.loopID = -1;
      if (block.attributes.includes("loopheader")) {
        const lh = block;
        lh.loopHeight = 0;
        lh.parentLoop = null;
        lh.outgoingEdges = [];
      }
    }
    for (const block of blocks) {
      block.size = {
        x: block.el.clientWidth,
        y: block.el.clientHeight
      };
    }
    for (const block of blocks) {
      block.preds = block.predecessors.map((id) => must(this.blocksByID.get(id)));
      block.succs = block.successors.map((id) => must(this.blocksByID.get(id)));
      if (isTrueLH(block)) {
        const backedges = block.preds.filter((b) => b.attributes.includes("backedge"));
        assert2(backedges.length === 1);
        block.backedge = backedges[0];
      }
    }
    const [nodesByLayer, layerHeights, trackHeights] = this.layout();
    this.render(nodesByLayer, layerHeights, trackHeights);
    this.addEventListeners();
  }
  layout() {
    const roots = this.blocks.filter((b) => b.predecessors.length === 0);
    for (const r of roots) {
      const root = r;
      root.loopHeight = 0;
      root.parentLoop = null;
      root.outgoingEdges = [];
      Object.defineProperty(root, "backedge", {
        get() {
          throw new Error("Accessed .backedge on a pseudo loop header! Don't do that.");
        },
        configurable: true
      });
    }
    for (const r of roots) {
      this.findLoops(r);
      this.layer(r);
    }
    const layoutNodesByLayer = this.makeLayoutNodes();
    this.straightenEdges(layoutNodesByLayer);
    const trackHeights = this.finagleJoints(layoutNodesByLayer);
    const layerHeights = this.verticalize(layoutNodesByLayer, trackHeights);
    return [layoutNodesByLayer, layerHeights, trackHeights];
  }
  // Walks through the graph tracking which loop each block belongs to. As
  // each block is visited, it is assigned the current loop ID. If the
  // block has lesser loopDepth than its parent, that means it is outside
  // at least one loop, and the loop it belongs to can be looked up by loop
  // depth.
  findLoops(block, loopIDsByDepth = null) {
    if (loopIDsByDepth === null) {
      loopIDsByDepth = [block.id];
    }
    if (block.loopID >= 0) {
      return;
    }
    if (isTrueLH(block)) {
      assert2(block.loopDepth === loopIDsByDepth.length);
      const parentID = loopIDsByDepth[loopIDsByDepth.length - 1];
      const parent = asLH(this.blocksByID.get(parentID));
      block.parentLoop = parent;
      loopIDsByDepth = [...loopIDsByDepth, block.id];
    }
    if (block.loopDepth < loopIDsByDepth.length - 1) {
      loopIDsByDepth = loopIDsByDepth.slice(0, block.loopDepth + 1);
    } else if (block.loopDepth >= loopIDsByDepth.length) {
      block.loopDepth = loopIDsByDepth.length - 1;
    }
    block.loopID = loopIDsByDepth[block.loopDepth];
    if (!block.attributes.includes("backedge")) {
      for (const succ of block.succs) {
        this.findLoops(succ, loopIDsByDepth);
      }
    }
  }
  layer(block, layer = 0) {
    if (block.attributes.includes("backedge")) {
      block.layer = block.succs[0].layer;
      return;
    }
    if (layer <= block.layer) {
      return;
    }
    block.layer = Math.max(block.layer, layer);
    this.numLayers = Math.max(block.layer + 1, this.numLayers);
    let loopHeader = asLH(this.blocksByID.get(block.loopID));
    while (loopHeader) {
      loopHeader.loopHeight = Math.max(loopHeader.loopHeight, block.layer - loopHeader.layer + 1);
      loopHeader = loopHeader.parentLoop;
    }
    for (const succ of block.succs) {
      if (succ.loopDepth < block.loopDepth) {
        const loopHeader2 = asLH(this.blocksByID.get(block.loopID));
        loopHeader2.outgoingEdges.push(succ);
      } else {
        this.layer(succ, layer + 1);
      }
    }
    if (isTrueLH(block)) {
      for (const succ of block.outgoingEdges) {
        this.layer(succ, layer + block.loopHeight);
      }
    }
  }
  makeLayoutNodes() {
    function connectNodes(from, fromPort, to) {
      from.dstNodes[fromPort] = to;
      if (!to.srcNodes.includes(from)) {
        to.srcNodes.push(from);
      }
    }
    let blocksByLayer;
    {
      const blocksByLayerObj = {};
      for (const block of this.blocks) {
        if (!blocksByLayerObj[block.layer]) {
          blocksByLayerObj[block.layer] = [];
        }
        blocksByLayerObj[block.layer].push(block);
      }
      blocksByLayer = Object.entries(blocksByLayerObj).map(([layer, blocks]) => [Number(layer), blocks]).sort((a, b) => a[0] - b[0]).map(([_, blocks]) => blocks);
    }
    let nodeID = 0;
    const layoutNodesByLayer = blocksByLayer.map(() => []);
    const activeEdges = [];
    const latestDummiesForBackedges = /* @__PURE__ */ new Map();
    for (const [layer, blocks] of blocksByLayer.entries()) {
      const terminatingEdges = [];
      for (const block of blocks) {
        for (let i = activeEdges.length - 1; i >= 0; i--) {
          const edge = activeEdges[i];
          if (edge.dstBlock === block) {
            terminatingEdges.unshift(edge);
            activeEdges.splice(i, 1);
          }
        }
      }
      const dummiesByDest = /* @__PURE__ */ new Map();
      for (const edge of activeEdges) {
        let dummy;
        const existingDummy = dummiesByDest.get(edge.dstBlock.id);
        if (existingDummy) {
          connectNodes(edge.src, edge.srcPort, existingDummy);
          dummy = existingDummy;
        } else {
          const newDummy = {
            id: nodeID++,
            pos: { x: CONTENT_PADDING, y: CONTENT_PADDING },
            size: { x: 0, y: 0 },
            block: null,
            srcNodes: [],
            dstNodes: [],
            dstBlock: edge.dstBlock,
            jointOffsets: [],
            flags: 0
          };
          connectNodes(edge.src, edge.srcPort, newDummy);
          layoutNodesByLayer[layer].push(newDummy);
          dummiesByDest.set(edge.dstBlock.id, newDummy);
          dummy = newDummy;
        }
        edge.src = dummy;
        edge.srcPort = 0;
      }
      const pendingLoopDummies = [];
      for (const block of blocks) {
        let currentLoopHeader = asLH(this.blocksByID.get(block.loopID));
        while (isTrueLH(currentLoopHeader)) {
          const existing = pendingLoopDummies.find((d) => d.loopID === currentLoopHeader.id);
          if (existing) {
            existing.block = block;
          } else {
            pendingLoopDummies.push({ loopID: currentLoopHeader.id, block });
          }
          const parentLoop = currentLoopHeader.parentLoop;
          if (!parentLoop) {
            break;
          }
          currentLoopHeader = parentLoop;
        }
      }
      const backedgeEdges = [];
      for (const block of blocks) {
        const node = {
          id: nodeID++,
          pos: { x: CONTENT_PADDING, y: CONTENT_PADDING },
          size: block.size,
          block,
          srcNodes: [],
          dstNodes: [],
          jointOffsets: [],
          flags: 0
        };
        for (const edge of terminatingEdges) {
          if (edge.dstBlock === block) {
            connectNodes(edge.src, edge.srcPort, node);
          }
        }
        layoutNodesByLayer[layer].push(node);
        block.layoutNode = node;
        for (const loopDummy of pendingLoopDummies.filter((d) => d.block === block)) {
          const backedge = asLH(this.blocksByID.get(loopDummy.loopID)).backedge;
          const backedgeDummy = {
            id: nodeID++,
            pos: { x: CONTENT_PADDING, y: CONTENT_PADDING },
            size: { x: 0, y: 0 },
            block: null,
            srcNodes: [],
            dstNodes: [],
            dstBlock: backedge,
            jointOffsets: [],
            flags: 0
          };
          const latestDummy = latestDummiesForBackedges.get(backedge);
          if (latestDummy) {
            connectNodes(backedgeDummy, 0, latestDummy);
          } else {
            backedgeDummy.flags |= IMMINENT_BACKEDGE_DUMMY;
            connectNodes(backedgeDummy, 0, backedge.layoutNode);
          }
          layoutNodesByLayer[layer].push(backedgeDummy);
          latestDummiesForBackedges.set(backedge, backedgeDummy);
        }
        if (block.attributes.includes("backedge")) {
          connectNodes(block.layoutNode, 0, block.succs[0].layoutNode);
        } else {
          for (const [i, succ] of block.succs.entries()) {
            if (succ.attributes.includes("backedge")) {
              backedgeEdges.push({ src: node, srcPort: i, dstBlock: succ });
            } else {
              activeEdges.push({ src: node, srcPort: i, dstBlock: succ });
            }
          }
        }
      }
      for (const edge of backedgeEdges) {
        const backedgeDummy = must(latestDummiesForBackedges.get(edge.dstBlock));
        connectNodes(edge.src, edge.srcPort, backedgeDummy);
      }
    }
    {
      const orphanRoots = [];
      for (const dummy of backedgeDummies(layoutNodesByLayer)) {
        if (dummy.srcNodes.length === 0) {
          orphanRoots.push(dummy);
        }
      }
      const removedNodes = /* @__PURE__ */ new Set();
      for (const orphan of orphanRoots) {
        let current = orphan;
        while (current.block === null && current.srcNodes.length === 0) {
          pruneNode(current);
          removedNodes.add(current);
          assert2(current.dstNodes.length === 1);
          current = current.dstNodes[0];
        }
      }
      for (const nodes of layoutNodesByLayer) {
        for (let i = nodes.length - 1; i >= 0; i--) {
          if (removedNodes.has(nodes[i])) {
            nodes.splice(i, 1);
          }
        }
      }
    }
    for (const nodes of layoutNodesByLayer) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].block === null) {
          nodes[i].flags |= LEFTMOST_DUMMY2;
        } else {
          break;
        }
      }
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].block === null) {
          nodes[i].flags |= RIGHTMOST_DUMMY2;
        } else {
          break;
        }
      }
    }
    for (const layer of layoutNodesByLayer) {
      for (const node of layer) {
        if (node.block) {
          assert2(node.dstNodes.length === node.block.successors.length, `expected node ${node.id} for block ${node.block.id} to have ${node.block.successors.length} destination nodes, but got ${node.dstNodes.length} instead`);
        } else {
          assert2(node.dstNodes.length === 1, `expected dummy node ${node.id} to have only one destination node, but got ${node.dstNodes.length} instead`);
        }
        for (let i = 0; i < node.dstNodes.length; i++) {
          assert2(node.dstNodes[i] !== void 0, `dst slot ${i} of node ${node.id} was undefined`);
        }
      }
    }
    return layoutNodesByLayer;
  }
  straightenEdges(layoutNodesByLayer) {
    var _a, _b;
    const pushNeighbors = (nodes) => {
      for (let i = 0; i < nodes.length - 1; i++) {
        const node = nodes[i];
        const neighbor = nodes[i + 1];
        const firstNonDummy = node.block === null && neighbor.block !== null;
        const nodeRightPlusPadding = node.pos.x + node.size.x + (firstNonDummy ? PORT_START : 0) + BLOCK_GAP;
        neighbor.pos.x = Math.max(neighbor.pos.x, nodeRightPlusPadding);
      }
    };
    const pushIntoLoops = () => {
      for (const nodes of layoutNodesByLayer) {
        for (const node of nodes) {
          if (node.block === null) {
            continue;
          }
          const loopHeader = node.block.loopID !== null ? asLH(this.blocksByID.get(node.block.loopID)) : null;
          if (loopHeader) {
            const loopHeaderNode = loopHeader.layoutNode;
            node.pos.x = Math.max(node.pos.x, loopHeaderNode.pos.x);
          }
        }
      }
    };
    const straightenDummyRuns = () => {
      var _a2;
      const dummyLinePositions = /* @__PURE__ */ new Map();
      for (const dummy of dummies(layoutNodesByLayer)) {
        const dst = dummy.dstBlock;
        let desiredX = dummy.pos.x;
        dummyLinePositions.set(dst, Math.max((_a2 = dummyLinePositions.get(dst)) !== null && _a2 !== void 0 ? _a2 : 0, desiredX));
      }
      for (const dummy of dummies(layoutNodesByLayer)) {
        const backedge = dummy.dstBlock;
        const x = dummyLinePositions.get(backedge);
        assert2(x, `no position for backedge ${backedge.id}`);
        dummy.pos.x = x;
      }
      for (const nodes of layoutNodesByLayer) {
        pushNeighbors(nodes);
      }
    };
    const suckInLeftmostDummies = () => {
      var _a2;
      const dummyRunPositions = /* @__PURE__ */ new Map();
      for (const nodes of layoutNodesByLayer) {
        let i = 0;
        let nextX = 0;
        for (; i < nodes.length; i++) {
          if (!(nodes[i].flags & LEFTMOST_DUMMY2)) {
            nextX = nodes[i].pos.x;
            break;
          }
        }
        i -= 1;
        nextX -= BLOCK_GAP + PORT_START;
        for (; i >= 0; i--) {
          const dummy = nodes[i];
          assert2(dummy.block === null && dummy.flags & LEFTMOST_DUMMY2);
          let maxSafeX = nextX;
          for (const src of dummy.srcNodes) {
            const srcX = src.pos.x + src.dstNodes.indexOf(dummy) * PORT_SPACING;
            if (srcX < maxSafeX) {
              maxSafeX = srcX;
            }
          }
          if (dummy.dstBlock.layoutNode.pos.x < maxSafeX) {
            maxSafeX = dummy.dstBlock.layoutNode.pos.x;
          }
          dummy.pos.x = maxSafeX;
          nextX = dummy.pos.x - BLOCK_GAP;
          dummyRunPositions.set(dummy.dstBlock, Math.min((_a2 = dummyRunPositions.get(dummy.dstBlock)) !== null && _a2 !== void 0 ? _a2 : Infinity, maxSafeX));
        }
      }
      for (const dummy of dummies(layoutNodesByLayer)) {
        if (!(dummy.flags & LEFTMOST_DUMMY2)) {
          continue;
        }
        const x = dummyRunPositions.get(dummy.dstBlock);
        assert2(x, `no position for run to block ${dummy.dstBlock.id}`);
        dummy.pos.x = x;
      }
    };
    const straightenChildren = () => {
      for (let layer = 0; layer < layoutNodesByLayer.length - 1; layer++) {
        const nodes = layoutNodesByLayer[layer];
        pushNeighbors(nodes);
        let lastShifted = -1;
        for (const node of nodes) {
          for (const [srcPort, dst] of node.dstNodes.entries()) {
            let dstIndexInNextLayer = layoutNodesByLayer[layer + 1].indexOf(dst);
            if (dstIndexInNextLayer > lastShifted && dst.srcNodes[0] === node) {
              const srcPortOffset = PORT_START + PORT_SPACING * srcPort;
              const dstPortOffset = PORT_START;
              let xBefore = dst.pos.x;
              dst.pos.x = Math.max(dst.pos.x, node.pos.x + srcPortOffset - dstPortOffset);
              if (dst.pos.x !== xBefore) {
                lastShifted = dstIndexInNextLayer;
              }
            }
          }
        }
      }
    };
    const straightenConservative = () => {
      for (const nodes of layoutNodesByLayer) {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const node = nodes[i];
          if (!node.block || node.block.attributes.includes("backedge")) {
            continue;
          }
          let deltasToTry = [];
          for (const parent of node.srcNodes) {
            const srcPortOffset = PORT_START + parent.dstNodes.indexOf(node) * PORT_SPACING;
            const dstPortOffset = PORT_START;
            deltasToTry.push(parent.pos.x + srcPortOffset - (node.pos.x + dstPortOffset));
          }
          for (const [srcPort, dst] of node.dstNodes.entries()) {
            if (dst.block === null && dst.dstBlock.attributes.includes("backedge")) {
              continue;
            }
            const srcPortOffset = PORT_START + srcPort * PORT_SPACING;
            const dstPortOffset = PORT_START;
            deltasToTry.push(dst.pos.x + dstPortOffset - (node.pos.x + srcPortOffset));
          }
          if (deltasToTry.includes(0)) {
            continue;
          }
          deltasToTry = deltasToTry.filter((d) => d > 0).sort((a, b) => a - b);
          for (const delta of deltasToTry) {
            let overlapsAny = false;
            for (let j = i + 1; j < nodes.length; j++) {
              const other = nodes[j];
              if (other.flags & RIGHTMOST_DUMMY2) {
                continue;
              }
              const a1 = node.pos.x + delta, a2 = node.pos.x + delta + node.size.x;
              const b1 = other.pos.x - BLOCK_GAP, b2 = other.pos.x + other.size.x + BLOCK_GAP;
              const overlaps = a2 >= b1 && a1 <= b2;
              if (overlaps) {
                overlapsAny = true;
              }
            }
            if (!overlapsAny) {
              node.pos.x += delta;
              break;
            }
          }
        }
        pushNeighbors(nodes);
      }
    };
    const straightenNearlyStraightEdgesUp = () => {
      for (let layer = layoutNodesByLayer.length - 1; layer >= 0; layer--) {
        const nodes = layoutNodesByLayer[layer];
        pushNeighbors(nodes);
        for (const node of nodes) {
          for (const src of node.srcNodes) {
            if (src.block !== null) {
              continue;
            }
            const wiggle = Math.abs(src.pos.x - node.pos.x);
            if (wiggle <= NEARLY_STRAIGHT) {
              src.pos.x = Math.max(src.pos.x, node.pos.x);
              node.pos.x = Math.max(src.pos.x, node.pos.x);
            }
          }
        }
      }
    };
    const straightenNearlyStraightEdgesDown = () => {
      for (let layer = 0; layer < layoutNodesByLayer.length; layer++) {
        const nodes = layoutNodesByLayer[layer];
        pushNeighbors(nodes);
        for (const node of nodes) {
          if (node.dstNodes.length === 0) {
            continue;
          }
          const dst = node.dstNodes[0];
          if (dst.block !== null) {
            continue;
          }
          const wiggle = Math.abs(dst.pos.x - node.pos.x);
          if (wiggle <= NEARLY_STRAIGHT) {
            dst.pos.x = Math.max(dst.pos.x, node.pos.x);
            node.pos.x = Math.max(dst.pos.x, node.pos.x);
          }
        }
      }
    };
    function repeat(a, n) {
      const result = [];
      for (let i = 0; i < n; i++) {
        for (const item of a) {
          result.push(item);
        }
      }
      return result;
    }
    const passes = [
      ...repeat([
        straightenChildren,
        pushIntoLoops,
        straightenDummyRuns
      ], LAYOUT_ITERATIONS),
      straightenDummyRuns,
      ...repeat([
        straightenNearlyStraightEdgesUp,
        straightenNearlyStraightEdgesDown
      ], NEARLY_STRAIGHT_ITERATIONS),
      straightenConservative,
      straightenDummyRuns,
      suckInLeftmostDummies
    ];
    assert2(passes.length <= ((_a = STOP_AT_PASS.initial) !== null && _a !== void 0 ? _a : Infinity), `STOP_AT_PASS was too small - should be at least ${passes.length}`);
    log.group("Running passes");
    for (const [i, pass] of passes.entries()) {
      if (i < STOP_AT_PASS) {
        log.log((_b = pass.name) !== null && _b !== void 0 ? _b : pass.toString());
        pass();
      }
    }
    log.groupEnd();
  }
  finagleJoints(layoutNodesByLayer) {
    var _a;
    const trackHeights = [];
    for (const nodes of layoutNodesByLayer) {
      const joints = [];
      for (const node of nodes) {
        node.jointOffsets = new Array(node.dstNodes.length).fill(0);
        if ((_a = node.block) === null || _a === void 0 ? void 0 : _a.attributes.includes("backedge")) {
          continue;
        }
        for (const [srcPort, dst] of node.dstNodes.entries()) {
          const x1 = node.pos.x + PORT_START + PORT_SPACING * srcPort;
          const x2 = dst.pos.x + PORT_START;
          if (Math.abs(x2 - x1) < 2 * ARROW_RADIUS) {
            continue;
          }
          joints.push({ x1, x2, src: node, srcPort, dst });
        }
      }
      joints.sort((a, b) => a.x1 - b.x1);
      const rightwardTracks = [];
      const leftwardTracks = [];
      nextJoint: for (const joint of joints) {
        const trackSet = joint.x2 - joint.x1 >= 0 ? rightwardTracks : leftwardTracks;
        let lastValidTrack = null;
        for (let i = trackSet.length - 1; i >= 0; i--) {
          const track = trackSet[i];
          let overlapsWithAnyInThisTrack = false;
          for (const otherJoint of track) {
            if (joint.dst === otherJoint.dst) {
              track.push(joint);
              continue nextJoint;
            }
            const al = Math.min(joint.x1, joint.x2), ar = Math.max(joint.x1, joint.x2);
            const bl = Math.min(otherJoint.x1, otherJoint.x2), br = Math.max(otherJoint.x1, otherJoint.x2);
            const overlaps = ar >= bl && al <= br;
            if (overlaps) {
              overlapsWithAnyInThisTrack = true;
              break;
            }
          }
          if (overlapsWithAnyInThisTrack) {
            break;
          } else {
            lastValidTrack = track;
          }
        }
        if (lastValidTrack) {
          lastValidTrack.push(joint);
        } else {
          trackSet.push([joint]);
        }
      }
      const tracksHeight = Math.max(0, rightwardTracks.length + leftwardTracks.length - 1) * JOINT_SPACING;
      let trackOffset = -tracksHeight / 2;
      for (const track of [...rightwardTracks.reverse(), ...leftwardTracks]) {
        for (const joint of track) {
          joint.src.jointOffsets[joint.srcPort] = trackOffset;
        }
        trackOffset += JOINT_SPACING;
      }
      trackHeights.push(tracksHeight);
    }
    assert2(trackHeights.length === layoutNodesByLayer.length);
    return trackHeights;
  }
  verticalize(layoutNodesByLayer, trackHeights) {
    const layerHeights = new Array(layoutNodesByLayer.length);
    let nextLayerY = CONTENT_PADDING;
    for (let i = 0; i < layoutNodesByLayer.length; i++) {
      const nodes = layoutNodesByLayer[i];
      let layerHeight = 0;
      for (const node of nodes) {
        node.pos.y = nextLayerY;
        layerHeight = Math.max(layerHeight, node.size.y);
      }
      layerHeights[i] = layerHeight;
      nextLayerY += layerHeight + TRACK_PADDING + trackHeights[i] + TRACK_PADDING;
    }
    return layerHeights;
  }
  renderBlock(block) {
    const el = document.createElement("div");
    this.graphContainer.appendChild(el);
    el.classList.add("ig-block", "ig-bg-white");
    for (const att of block.attributes) {
      el.classList.add(`ig-block-att-${att}`);
    }
    el.setAttribute("data-ig-block-ptr", `${block.ptr}`);
    el.setAttribute("data-ig-block-id", `${block.id}`);
    let desc = "";
    if (block.attributes.includes("loopheader")) {
      desc = " (loop header)";
    } else if (block.attributes.includes("backedge")) {
      desc = " (backedge)";
    } else if (block.attributes.includes("splitedge")) {
      desc = " (split edge)";
    }
    const header = document.createElement("div");
    header.classList.add("ig-block-header");
    header.innerText = `Block ${block.id}${desc}`;
    el.appendChild(header);
    const insnsContainer = document.createElement("div");
    insnsContainer.classList.add("ig-instructions");
    el.appendChild(insnsContainer);
    const insns = document.createElement("table");
    if (block.lir) {
      insns.innerHTML = `
        <colgroup>
          <col style="width: 1px">
          <col style="width: auto">
          ${this.sampleCounts ? `
            <col style="width: 1px">
            <col style="width: 1px">
          ` : ""}
        </colgroup>
        ${this.sampleCounts ? `
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th class="ig-f6">Total</th>
              <th class="ig-f6">Self</th>
            </tr>
          </thead>
        ` : ""}
      `;
      for (const ins of block.lir.instructions) {
        insns.appendChild(this.renderLIRInstruction(ins));
      }
    } else {
      insns.innerHTML = `
        <colgroup>
          <col style="width: 1px">
          <col style="width: auto">
          <col style="width: 1px">
        </colgroup>
      `;
      for (const ins of block.instructions) {
        insns.appendChild(this.renderMIRInstruction(ins));
      }
    }
    insnsContainer.appendChild(insns);
    if (block.successors.length === 2) {
      for (const [i, label] of [1, 0].entries()) {
        const edgeLabel = document.createElement("div");
        edgeLabel.innerText = `${label}`;
        edgeLabel.classList.add("ig-edge-label");
        edgeLabel.style.left = `${PORT_START + PORT_SPACING * i}px`;
        el.appendChild(edgeLabel);
      }
    }
    header.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    header.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!e.shiftKey) {
        this.selectedBlockPtrs.clear();
      }
      this.setSelection([], block.ptr);
    });
    return el;
  }
  render(nodesByLayer, layerHeights, trackHeights) {
    var _a;
    for (const nodes of nodesByLayer) {
      for (const node of nodes) {
        if (node.block !== null) {
          const block = node.block;
          block.el.style.left = `${node.pos.x}px`;
          block.el.style.top = `${node.pos.y}px`;
        }
      }
    }
    let maxX = 0, maxY = 0;
    for (const nodes of nodesByLayer) {
      for (const node of nodes) {
        maxX = Math.max(maxX, node.pos.x + node.size.x + CONTENT_PADDING);
        maxY = Math.max(maxY, node.pos.y + node.size.y + CONTENT_PADDING);
      }
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${maxX}`);
    svg.setAttribute("height", `${maxY}`);
    this.graphContainer.appendChild(svg);
    this.size = { x: maxX, y: maxY };
    for (let layer = 0; layer < nodesByLayer.length; layer++) {
      const nodes = nodesByLayer[layer];
      for (const node of nodes) {
        if (!node.block) {
          assert2(node.dstNodes.length === 1, `dummy nodes must have exactly one destination, but dummy ${node.id} had ${node.dstNodes.length}`);
        }
        assert2(node.dstNodes.length === node.jointOffsets.length, "must have a joint offset for each destination");
        for (const [i, dst] of node.dstNodes.entries()) {
          const x1 = node.pos.x + PORT_START + PORT_SPACING * i;
          const y1 = node.pos.y + node.size.y;
          if ((_a = node.block) === null || _a === void 0 ? void 0 : _a.attributes.includes("backedge")) {
            const header = node.block.succs[0];
            const x12 = node.pos.x;
            const y12 = node.pos.y + HEADER_ARROW_PUSHDOWN;
            const x2 = header.layoutNode.pos.x + header.size.x;
            const y2 = header.layoutNode.pos.y + HEADER_ARROW_PUSHDOWN;
            const arrow = loopHeaderArrow(x12, y12, x2, y2);
            svg.appendChild(arrow);
          } else if (node.flags & IMMINENT_BACKEDGE_DUMMY) {
            const backedge = must(dst.block);
            const x12 = node.pos.x + PORT_START;
            const y12 = node.pos.y + HEADER_ARROW_PUSHDOWN + ARROW_RADIUS;
            const x2 = backedge.layoutNode.pos.x + backedge.size.x;
            const y2 = backedge.layoutNode.pos.y + HEADER_ARROW_PUSHDOWN;
            const arrow = arrowToBackedge(x12, y12, x2, y2);
            svg.appendChild(arrow);
          } else if (dst.block === null && dst.dstBlock.attributes.includes("backedge")) {
            const x2 = dst.pos.x + PORT_START;
            const y2 = dst.pos.y + (dst.flags & IMMINENT_BACKEDGE_DUMMY ? HEADER_ARROW_PUSHDOWN + ARROW_RADIUS : 0);
            if (node.block === null) {
              const ym = y1 - TRACK_PADDING;
              const arrow = upwardArrow(x1, y1, x2, y2, ym, false);
              svg.appendChild(arrow);
            } else {
              const ym = y1 - node.size.y + layerHeights[layer] + TRACK_PADDING + trackHeights[layer] / 2 + node.jointOffsets[i];
              const arrow = arrowFromBlockToBackedgeDummy(x1, y1, x2, y2, ym);
              svg.appendChild(arrow);
            }
          } else {
            const x2 = dst.pos.x + PORT_START;
            const y2 = dst.pos.y;
            const ym = y1 - node.size.y + layerHeights[layer] + TRACK_PADDING + trackHeights[layer] / 2 + node.jointOffsets[i];
            const arrow = downwardArrow(x1, y1, x2, y2, ym, dst.block !== null);
            svg.appendChild(arrow);
          }
        }
      }
    }
    if (+DEBUG) {
      for (const nodes of nodesByLayer) {
        for (const node of nodes) {
          const el = document.createElement("div");
          el.innerHTML = `${node.id}<br>&lt;- ${node.srcNodes.map((n) => n.id)}<br>-&gt; ${node.dstNodes.map((n) => n.id)}<br>${node.flags}`;
          el.style.position = "absolute";
          el.style.border = "1px solid black";
          el.style.backgroundColor = "white";
          el.style.left = `${node.pos.x}px`;
          el.style.top = `${node.pos.y}px`;
          el.style.whiteSpace = "nowrap";
          this.graphContainer.appendChild(el);
        }
      }
    }
    this.updateHighlightedInstructions();
    this.updateHotness();
  }
  renderMIRInstruction(ins) {
    const prettyOpcode = ins.opcode.replace("->", "\u2192").replace("<-", "\u2190");
    const row = document.createElement("tr");
    row.classList.add("ig-ins", "ig-ins-mir", "ig-can-flash", ...ins.attributes.map((att) => `ig-ins-att-${att}`));
    row.setAttribute("data-ig-ins-ptr", `${ins.ptr}`);
    row.setAttribute("data-ig-ins-id", `${ins.id}`);
    const num = document.createElement("td");
    num.classList.add("ig-ins-num");
    num.innerText = String(ins.id);
    row.appendChild(num);
    const opcode = document.createElement("td");
    opcode.innerHTML = prettyOpcode.replace(/([A-Za-z0-9_]+)#(\d+)/g, (_, name, id) => {
      return `<span class="ig-use ig-highlightable" data-ig-use="${id}">${name}#${id}</span>`;
    });
    row.appendChild(opcode);
    const type = document.createElement("td");
    type.classList.add("ig-ins-type");
    type.innerText = ins.type === "None" ? "" : ins.type;
    row.appendChild(type);
    num.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    num.addEventListener("click", () => {
      this.toggleInstructionHighlight(ins.ptr);
    });
    opcode.querySelectorAll(".ig-use").forEach((use) => {
      use.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      use.addEventListener("click", (e) => {
        const id = parseInt(must(use.getAttribute("data-ig-use")), 10);
        this.jumpToInstruction(id, { zoom: 1 });
      });
    });
    return row;
  }
  renderLIRInstruction(ins) {
    var _a, _b, _c, _d;
    const prettyOpcode = ins.opcode.replace("->", "\u2192").replace("<-", "\u2190");
    const row = document.createElement("tr");
    row.classList.add("ig-ins", "ig-ins-lir", "ig-hotness");
    row.setAttribute("data-ig-ins-ptr", `${ins.ptr}`);
    row.setAttribute("data-ig-ins-id", `${ins.id}`);
    const num = document.createElement("td");
    num.classList.add("ig-ins-num");
    num.innerText = String(ins.id);
    row.appendChild(num);
    const opcode = document.createElement("td");
    opcode.innerText = prettyOpcode;
    row.appendChild(opcode);
    if (this.sampleCounts) {
      const totalSampleCount = (_b = (_a = this.sampleCounts) === null || _a === void 0 ? void 0 : _a.totalLineHits.get(ins.id)) !== null && _b !== void 0 ? _b : 0;
      const selfSampleCount = (_d = (_c = this.sampleCounts) === null || _c === void 0 ? void 0 : _c.selfLineHits.get(ins.id)) !== null && _d !== void 0 ? _d : 0;
      const totalSamples = document.createElement("td");
      totalSamples.classList.add("ig-ins-samples");
      totalSamples.classList.toggle("ig-text-dim", totalSampleCount === 0);
      totalSamples.innerText = `${totalSampleCount}`;
      totalSamples.title = "Color by total count";
      row.appendChild(totalSamples);
      const selfSamples = document.createElement("td");
      selfSamples.classList.add("ig-ins-samples");
      selfSamples.classList.toggle("ig-text-dim", selfSampleCount === 0);
      selfSamples.innerText = `${selfSampleCount}`;
      selfSamples.title = "Color by self count";
      row.appendChild(selfSamples);
      for (const [i, el] of [totalSamples, selfSamples].entries()) {
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        el.addEventListener("click", () => {
          assert2(i === SC_TOTAL || i === SC_SELF);
          this.heatmapMode = i;
          this.updateHotness();
        });
      }
    }
    num.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    num.addEventListener("click", () => {
      this.toggleInstructionHighlight(ins.ptr);
    });
    return row;
  }
  renderSelection() {
    this.graphContainer.querySelectorAll(".ig-block").forEach((blockEl) => {
      const ptr = parseInt(must(blockEl.getAttribute("data-ig-block-ptr")), 10);
      blockEl.classList.toggle("ig-selected", this.selectedBlockPtrs.has(ptr));
      blockEl.classList.toggle("ig-last-selected", this.lastSelectedBlockPtr === ptr);
    });
  }
  removeNonexistentHighlights() {
    this.highlightedInstructions = this.highlightedInstructions.filter((hi) => {
      return this.graphContainer.querySelector(`.ig-ins[data-ig-ins-ptr="${hi.ptr}"]`);
    });
  }
  updateHighlightedInstructions() {
    for (const hi of this.highlightedInstructions) {
      assert2(this.highlightedInstructions.filter((other) => other.ptr === hi.ptr).length === 1, `instruction ${hi.ptr} was highlighted more than once`);
    }
    this.graphContainer.querySelectorAll(".ig-ins, .ig-use").forEach((ins) => {
      clearHighlight(ins);
    });
    for (const hi of this.highlightedInstructions) {
      const color = this.instructionPalette[hi.paletteColor % this.instructionPalette.length];
      const row = this.graphContainer.querySelector(`.ig-ins[data-ig-ins-ptr="${hi.ptr}"]`);
      if (row) {
        highlight(row, color);
        const id = this.insIDsByPtr.get(hi.ptr);
        this.graphContainer.querySelectorAll(`.ig-use[data-ig-use="${id}"]`).forEach((use) => {
          highlight(use, color);
        });
      }
    }
  }
  updateHotness() {
    this.graphContainer.querySelectorAll(".ig-ins-lir").forEach((insEl) => {
      var _a;
      assert2(insEl.classList.contains("ig-hotness"));
      const insID = parseInt(must(insEl.getAttribute("data-ig-ins-id")), 10);
      let hotness = 0;
      if (this.sampleCounts) {
        const counts = this.heatmapMode === SC_TOTAL ? this.sampleCounts.totalLineHits : this.sampleCounts.selfLineHits;
        hotness = ((_a = counts.get(insID)) !== null && _a !== void 0 ? _a : 0) / this.maxSampleCounts[this.heatmapMode];
      }
      insEl.style.setProperty("--ig-hotness", `${hotness}`);
    });
  }
  addEventListeners() {
    this.viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      let newZoom = this.zoom;
      if (e.ctrlKey) {
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom * Math.pow(ZOOM_SENSITIVITY, -e.deltaY * WHEEL_DELTA_SCALE)));
        const zoomDelta = newZoom / this.zoom - 1;
        this.zoom = newZoom;
        const { x: gx, y: gy } = this.viewport.getBoundingClientRect();
        const mouseOffsetX = e.clientX - gx - this.translation.x;
        const mouseOffsetY = e.clientY - gy - this.translation.y;
        this.translation.x -= mouseOffsetX * zoomDelta;
        this.translation.y -= mouseOffsetY * zoomDelta;
      } else {
        this.translation.x -= e.deltaX;
        this.translation.y -= e.deltaY;
      }
      const clampedT = this.clampTranslation(this.translation, newZoom);
      this.translation.x = clampedT.x;
      this.translation.y = clampedT.y;
      this.animating = false;
      this.updatePanAndZoom();
    });
    this.viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && !(e.button === 0 || e.button === 1)) {
        return;
      }
      e.preventDefault();
      this.viewport.setPointerCapture(e.pointerId);
      this.startMousePos = {
        x: e.clientX,
        y: e.clientY
      };
      this.lastMousePos = {
        x: e.clientX,
        y: e.clientY
      };
      this.animating = false;
    });
    this.viewport.addEventListener("pointermove", (e) => {
      if (!this.viewport.hasPointerCapture(e.pointerId)) {
        return;
      }
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.translation.x += dx;
      this.translation.y += dy;
      this.lastMousePos = {
        x: e.clientX,
        y: e.clientY
      };
      const clampedT = this.clampTranslation(this.translation, this.zoom);
      this.translation.x = clampedT.x;
      this.translation.y = clampedT.y;
      this.animating = false;
      this.updatePanAndZoom();
    });
    this.viewport.addEventListener("pointerup", (e) => {
      this.viewport.releasePointerCapture(e.pointerId);
      const THRESHOLD = 2;
      const deltaX = this.startMousePos.x - e.clientX;
      const deltaY = this.startMousePos.y - e.clientY;
      if (Math.abs(deltaX) <= THRESHOLD && Math.abs(deltaY) <= THRESHOLD) {
        this.setSelection([]);
      }
      this.animating = false;
    });
    const ro = new ResizeObserver((entries) => {
      assert2(entries.length === 1);
      const rect = entries[0].contentRect;
      this.viewportSize.x = rect.width;
      this.viewportSize.y = rect.height;
    });
    ro.observe(this.viewport);
  }
  setSelection(blockPtrs, lastSelectedPtr = 0) {
    this.setSelectionRaw(blockPtrs, lastSelectedPtr);
    if (!lastSelectedPtr) {
      this.nav = {
        visited: [],
        currentIndex: -1,
        siblings: []
      };
    } else {
      this.nav = {
        visited: [lastSelectedPtr],
        currentIndex: 0,
        siblings: [lastSelectedPtr]
      };
    }
  }
  setSelectionRaw(blockPtrs, lastSelectedPtr) {
    this.selectedBlockPtrs.clear();
    for (const blockPtr of [...blockPtrs, lastSelectedPtr]) {
      if (this.blocksByPtr.has(blockPtr)) {
        this.selectedBlockPtrs.add(blockPtr);
      }
    }
    this.lastSelectedBlockPtr = this.blocksByPtr.has(lastSelectedPtr) ? lastSelectedPtr : 0;
    this.renderSelection();
  }
  navigate(dir) {
    const selected = this.lastSelectedBlockPtr;
    if (dir === "down" || dir === "up") {
      if (!selected) {
        const blocks = this.blocksInOrder;
        const rootBlocks = blocks.filter((b) => b.predecessors.length === 0);
        const leafBlocks = blocks.filter((b) => b.successors.length === 0);
        const fauxSiblings = dir === "down" ? rootBlocks : leafBlocks;
        const firstBlock = fauxSiblings[0];
        assert2(firstBlock);
        this.setSelectionRaw([], firstBlock.ptr);
        this.nav = {
          visited: [firstBlock.ptr],
          currentIndex: 0,
          siblings: fauxSiblings.map((b) => b.ptr)
        };
      } else {
        const currentBlock = must(this.blocksByPtr.get(selected));
        const nextSiblings = (dir === "down" ? currentBlock.successors : currentBlock.predecessors).map((id) => must(this.blocksByID.get(id)).ptr);
        if (currentBlock.ptr !== this.nav.visited[this.nav.currentIndex]) {
          this.nav.visited = [currentBlock.ptr];
          this.nav.currentIndex = 0;
        }
        const nextIndex = this.nav.currentIndex + (dir === "down" ? 1 : -1);
        if (0 <= nextIndex && nextIndex < this.nav.visited.length) {
          this.nav.currentIndex = nextIndex;
          this.nav.siblings = nextSiblings;
        } else {
          const next = nextSiblings[0];
          if (next !== void 0) {
            if (dir === "down") {
              this.nav.visited.push(next);
              this.nav.currentIndex += 1;
              assert2(this.nav.currentIndex === this.nav.visited.length - 1);
            } else {
              this.nav.visited.unshift(next);
              assert2(this.nav.currentIndex === 0);
            }
            this.nav.siblings = nextSiblings;
          }
        }
        this.setSelectionRaw([], this.nav.visited[this.nav.currentIndex]);
      }
    } else {
      if (selected !== void 0) {
        const i = this.nav.siblings.indexOf(selected);
        assert2(i >= 0, "currently selected node should be in siblings array");
        const nextI = i + (dir === "right" ? 1 : -1);
        if (0 <= nextI && nextI < this.nav.siblings.length) {
          this.setSelectionRaw([], this.nav.siblings[nextI]);
        }
      }
    }
    assert2(this.nav.visited.length === 0 || this.nav.siblings.includes(this.nav.visited[this.nav.currentIndex]), "expected currently visited node to be in the siblings array");
    assert2(this.lastSelectedBlockPtr === 0 || this.nav.siblings.includes(this.lastSelectedBlockPtr), "expected currently selected block to be in siblings array");
  }
  toggleInstructionHighlight(insPtr, force) {
    this.removeNonexistentHighlights();
    const indexOfExisting = this.highlightedInstructions.findIndex((hi) => hi.ptr === insPtr);
    let remove = indexOfExisting >= 0;
    if (force !== void 0) {
      remove = !force;
    }
    if (remove) {
      if (indexOfExisting >= 0) {
        this.highlightedInstructions.splice(indexOfExisting, 1);
      }
    } else {
      if (indexOfExisting < 0) {
        let nextPaletteColor = 0;
        while (true) {
          if (this.highlightedInstructions.find((hi) => hi.paletteColor === nextPaletteColor)) {
            nextPaletteColor += 1;
            continue;
          }
          break;
        }
        this.highlightedInstructions.push({
          ptr: insPtr,
          paletteColor: nextPaletteColor
        });
      }
    }
    this.updateHighlightedInstructions();
  }
  clampTranslation(t, scale) {
    const minX = TRANSLATION_CLAMP_AMOUNT - this.size.x * scale;
    const maxX = this.viewportSize.x - TRANSLATION_CLAMP_AMOUNT;
    const minY = TRANSLATION_CLAMP_AMOUNT - this.size.y * scale;
    const maxY = this.viewportSize.y - TRANSLATION_CLAMP_AMOUNT;
    const newX = clamp(t.x, minX, maxX);
    const newY = clamp(t.y, minY, maxY);
    return { x: newX, y: newY };
  }
  updatePanAndZoom() {
    const clampedT = this.clampTranslation(this.translation, this.zoom);
    this.graphContainer.style.transform = `translate(${clampedT.x}px, ${clampedT.y}px) scale(${this.zoom})`;
  }
  /**
   * Converts from graph space to viewport space.
   */
  graph2viewport(v, translation = this.translation, zoom = this.zoom) {
    return {
      x: v.x * zoom + translation.x,
      y: v.y * zoom + translation.y
    };
  }
  /**
   * Converts from viewport space to graph space.
   */
  viewport2graph(v, translation = this.translation, zoom = this.zoom) {
    return {
      x: (v.x - translation.x) / zoom,
      y: (v.y - translation.y) / zoom
    };
  }
  /**
   * Pans and zooms the graph such that the given x and y in graph space are in
   * the top left of the viewport.
   */
  goToGraphCoordinates(coords_1, _a) {
    return __awaiter(this, arguments, void 0, function* (coords, { zoom = this.zoom, animate = true }) {
      const newTranslation = { x: -coords.x * zoom, y: -coords.y * zoom };
      if (!animate) {
        this.animating = false;
        this.translation.x = newTranslation.x;
        this.translation.y = newTranslation.y;
        this.zoom = zoom;
        this.updatePanAndZoom();
        yield new Promise((res) => setTimeout(res, 0));
        return;
      }
      this.targetTranslation = newTranslation;
      this.targetZoom = zoom;
      if (this.animating) {
        return;
      }
      this.animating = true;
      let lastTime = performance.now();
      while (this.animating) {
        const now = yield new Promise((res) => requestAnimationFrame(res));
        const dt = (now - lastTime) / 1e3;
        lastTime = now;
        const THRESHOLD_T = 1, THRESHOLD_ZOOM = 0.01;
        const R = 1e-6;
        const dx = this.targetTranslation.x - this.translation.x;
        const dy = this.targetTranslation.y - this.translation.y;
        const dzoom = this.targetZoom - this.zoom;
        this.translation.x = filerp(this.translation.x, this.targetTranslation.x, R, dt);
        this.translation.y = filerp(this.translation.y, this.targetTranslation.y, R, dt);
        this.zoom = filerp(this.zoom, this.targetZoom, R, dt);
        this.updatePanAndZoom();
        if (Math.abs(dx) <= THRESHOLD_T && Math.abs(dy) <= THRESHOLD_T && Math.abs(dzoom) <= THRESHOLD_ZOOM) {
          this.translation.x = this.targetTranslation.x;
          this.translation.y = this.targetTranslation.y;
          this.zoom = this.targetZoom;
          this.animating = false;
          this.updatePanAndZoom();
          break;
        }
      }
      yield new Promise((res) => setTimeout(res, 0));
    });
  }
  jumpToBlock(blockPtr, { zoom = this.zoom, animate = true, viewportPos } = {}) {
    const block = this.blocksByPtr.get(blockPtr);
    if (!block) {
      return Promise.resolve();
    }
    let graphCoords;
    if (viewportPos) {
      graphCoords = {
        x: block.layoutNode.pos.x - viewportPos.x / zoom,
        y: block.layoutNode.pos.y - viewportPos.y / zoom
      };
    } else {
      graphCoords = this.graphPosToCenterRect(block.layoutNode.pos, block.layoutNode.size, zoom);
    }
    return this.goToGraphCoordinates(graphCoords, { zoom, animate });
  }
  jumpToInstruction(insID_1, _a) {
    return __awaiter(this, arguments, void 0, function* (insID, { zoom = this.zoom, animate = true }) {
      const insEl = this.graphContainer.querySelector(`.ig-ins[data-ig-ins-id="${insID}"]`);
      if (!insEl) {
        return;
      }
      const insRect = insEl.getBoundingClientRect();
      const graphRect = this.graphContainer.getBoundingClientRect();
      const x = (insRect.x - graphRect.x) / this.zoom;
      const y = (insRect.y - graphRect.y) / this.zoom;
      const width = insRect.width / this.zoom;
      const height = insRect.height / this.zoom;
      const coords = this.graphPosToCenterRect({ x, y }, { x: width, y: height }, zoom);
      insEl.classList.add("ig-flash");
      yield this.goToGraphCoordinates(coords, { zoom, animate });
      insEl.classList.remove("ig-flash");
    });
  }
  /**
   * Returns the position in graph space that, if panned to, will center the
   * given graph-space rectangle in the viewport.
   */
  graphPosToCenterRect(pos, size, zoom) {
    const viewportWidth = this.viewportSize.x / zoom;
    const viewportHeight = this.viewportSize.y / zoom;
    const xPadding = Math.max(20 / zoom, (viewportWidth - size.x) / 2);
    const yPadding = Math.max(20 / zoom, (viewportHeight - size.y) / 2);
    const x = pos.x - xPadding;
    const y = pos.y - yPadding;
    return { x, y };
  }
  exportState() {
    const state = {
      translation: this.translation,
      zoom: this.zoom,
      heatmapMode: this.heatmapMode,
      highlightedInstructions: this.highlightedInstructions,
      selectedBlockPtrs: this.selectedBlockPtrs,
      lastSelectedBlockPtr: this.lastSelectedBlockPtr,
      viewportPosOfSelectedBlock: void 0
    };
    if (this.lastSelectedBlockPtr) {
      state.viewportPosOfSelectedBlock = this.graph2viewport(must(this.blocksByPtr.get(this.lastSelectedBlockPtr)).layoutNode.pos);
    }
    return state;
  }
  restoreState(state, opts) {
    this.translation.x = state.translation.x;
    this.translation.y = state.translation.y;
    this.zoom = state.zoom;
    this.heatmapMode = state.heatmapMode;
    this.highlightedInstructions = state.highlightedInstructions;
    this.setSelection(Array.from(state.selectedBlockPtrs), state.lastSelectedBlockPtr);
    this.updatePanAndZoom();
    this.updateHotness();
    this.updateHighlightedInstructions();
    if (opts.preserveSelectedBlockPosition) {
      this.jumpToBlock(this.lastSelectedBlockPtr, {
        zoom: this.zoom,
        animate: false,
        viewportPos: state.viewportPosOfSelectedBlock
      });
    }
  }
};
function pruneNode(node) {
  for (const dst of node.dstNodes) {
    const indexOfSelfInDst = dst.srcNodes.indexOf(node);
    assert2(indexOfSelfInDst !== -1);
    dst.srcNodes.splice(indexOfSelfInDst, 1);
  }
}
function* dummies(layoutNodesByLayer) {
  for (const nodes of layoutNodesByLayer) {
    for (const node of nodes) {
      if (node.block === null) {
        yield node;
      }
    }
  }
}
function* backedgeDummies(layoutNodesByLayer) {
  for (const nodes of layoutNodesByLayer) {
    for (const node of nodes) {
      if (node.block === null && node.dstBlock.attributes.includes("backedge")) {
        yield node;
      }
    }
  }
}
function downwardArrow(x1, y1, x2, y2, ym, doArrowhead, stroke = 1) {
  const r = ARROW_RADIUS;
  assert2(y1 + r <= ym && ym < y2 - r, `downward arrow: x1 = ${x1}, y1 = ${y1}, x2 = ${x2}, y2 = ${y2}, ym = ${ym}, r = ${r} `, true);
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  if (Math.abs(x2 - x1) < 2 * r) {
    path += `C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${y1 + 2 * (y2 - y1) / 3} ${x2} ${y2} `;
  } else {
    const dir = Math.sign(x2 - x1);
    path += `L ${x1} ${ym - r} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x1 + r * dir} ${ym} `;
    path += `L ${x2 - r * dir} ${ym} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x2} ${ym + r} `;
    path += `L ${x2} ${y2} `;
  }
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  if (doArrowhead) {
    const v = arrowhead(x2, y2, 180);
    g.appendChild(v);
  }
  return g;
}
function upwardArrow(x1, y1, x2, y2, ym, doArrowhead, stroke = 1) {
  const r = ARROW_RADIUS;
  assert2(y2 + r <= ym && ym <= y1 - r, `upward arrow: x1 = ${x1}, y1 = ${y1}, x2 = ${x2}, y2 = ${y2}, ym = ${ym}, r = ${r} `, true);
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  if (Math.abs(x2 - x1) < 2 * r) {
    path += `C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${y1 + 2 * (y2 - y1) / 3} ${x2} ${y2} `;
  } else {
    const dir = Math.sign(x2 - x1);
    path += `L ${x1} ${ym + r} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x1 + r * dir} ${ym} `;
    path += `L ${x2 - r * dir} ${ym} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x2} ${ym - r} `;
    path += `L ${x2} ${y2} `;
  }
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  if (doArrowhead) {
    const v = arrowhead(x2, y2, 0);
    g.appendChild(v);
  }
  return g;
}
function arrowToBackedge(x1, y1, x2, y2, stroke = 1) {
  const r = ARROW_RADIUS;
  assert2(y1 - r >= y2 && x1 - r >= x2, `to backedge: x1 = ${x1}, y1 = ${y1}, x2 = ${x2}, y2 = ${y2}, r = ${r} `, true);
  if (stroke % 2 === 1) {
    x1 += 0.5;
    y2 += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  path += `A ${r} ${r} 0 0 0 ${x1 - r} ${y2} `;
  path += `L ${x2} ${y2} `;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  const v = arrowhead(x2, y2, 270);
  g.appendChild(v);
  return g;
}
function arrowFromBlockToBackedgeDummy(x1, y1, x2, y2, ym, stroke = 1) {
  const r = ARROW_RADIUS;
  assert2(y1 + r <= ym && x1 <= x2 && y2 <= y1, `block to backedge dummy: x1 = ${x1}, y1 = ${y1}, x2 = ${x2}, y2 = ${y2}, ym = ${ym}, r = ${r} `, true);
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  path += `L ${x1} ${ym - r} `;
  path += `A ${r} ${r} 0 0 0 ${x1 + r} ${ym} `;
  path += `L ${x2 - r} ${ym} `;
  path += `A ${r} ${r} 0 0 0 ${x2} ${ym - r} `;
  path += `L ${x2} ${y2} `;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  return g;
}
function loopHeaderArrow(x1, y1, x2, y2, stroke = 1) {
  assert2(x2 < x1 && y2 === y1, `x1 = ${x1}, y1 = ${y1}, x2 = ${x2}, y2 = ${y2} `, true);
  if (stroke % 2 === 1) {
    y1 += 0.5;
    y2 += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  path += `L ${x2} ${y2} `;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  const v = arrowhead(x2, y2, 270);
  g.appendChild(v);
  return g;
}
function arrowhead(x, y, rot, size = 5) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", `M 0 0 L ${-size} ${size * 1.5} L ${size} ${size * 1.5} Z`);
  p.setAttribute("transform", `translate(${x}, ${y}) rotate(${rot})`);
  return p;
}
function highlight(el, color) {
  el.classList.add("ig-highlight");
  el.style.setProperty("--ig-highlight-color", color);
}
function clearHighlight(el) {
  el.classList.remove("ig-highlight");
  el.style.setProperty("--ig-highlight-color", "transparent");
}

// wasi-0.1-module-contents:src/js.wasm.core.wasm
var js_wasm_core_default = "./js.wasm.core-ZQTW6R64.wasm";

// wasi-0.1-module-contents:src/js.wasm.core2.wasm
var js_wasm_core2_default = "./js.wasm.core2-3I3OBBNV.wasm";

// wasi-0.1-module-contents:src/js.wasm.core3.wasm
var js_wasm_core3_default = "./js.wasm.core3-PDZ4SARS.wasm";

// wasi-0.1-module-contents:src/js.wasm.core4.wasm
var js_wasm_core4_default = "./js.wasm.core4-GP6GTIBP.wasm";

// wasi-0.1-module-stub:src/js.wasm
var modulePaths = /* @__PURE__ */ new Map();
modulePaths.set("src/js.wasm.core.wasm", js_wasm_core_default);
modulePaths.set("src/js.wasm.core2.wasm", js_wasm_core2_default);
modulePaths.set("src/js.wasm.core3.wasm", js_wasm_core3_default);
modulePaths.set("src/js.wasm.core4.wasm", js_wasm_core4_default);
function getModulePaths() {
  return new Map(modulePaths);
}

// src/main.js
var TIMEOUT_MS = 1e3;
var containerEl = document.getElementById("graph-container");
var passNameEl = document.getElementById("pass-name");
var passSliderEl = document.getElementById("pass-slider");
var passSliderMarkersEl = document.getElementById("pass-slider-markers");
var passPrevEl = document.getElementById("pass-prev");
var passNextEl = document.getElementById("pass-next");
async function run(editorExtraStyles) {
  const editor = basicEditor(
    "#js-input",
    {
      language: "javascript",
      theme: "github-dark",
      value: `function test(n) {
  if (n <= 2) {
    return 1;
  }
  let a = 1;
  let b = 1;
  let c = 2;
  for (let i = 3; i <= n; i++) {
    c = a + b;
    a = b;
    b = c;
  }
  return c;
}

// The test function must run enough times to be
// optimized by Ion. This example is running with
// --fast-warmup, which lowers the threshold to
// about 30 runs.
for (let i = 0; i < 30; i++) {
  test(i);
}`
    }
  );
  const editorStylesheet = new CSSStyleSheet();
  editorStylesheet.replaceSync(editorExtraStyles);
  document.getElementById("js-input").shadowRoot.adoptedStyleSheets = [editorStylesheet];
  const compiledModules = await compileAllModules();
  let resolveGetProgram = null;
  let deferredNextProgram = null;
  function updateProgram(program) {
    if (resolveGetProgram) {
      resolveGetProgram(program);
      resolveGetProgram = null;
    } else {
      deferredNextProgram = program;
    }
  }
  updateProgram(editor.value);
  editor.setOptions({
    onUpdate(value) {
      updateProgram(value);
    }
  });
  let graph;
  let passes = [];
  function updateGraph(pass) {
    passNameEl.innerText = `After pass: ${pass.name}`;
    const previousState = graph?.exportState();
    containerEl.innerHTML = "";
    graph = new Graph(containerEl, pass);
    if (previousState) {
      graph.restoreState(previousState, { preserveSelectedBlockPosition: true });
    } else {
      graph.zoom = 0.8;
      graph.updatePanAndZoom();
    }
  }
  function setUIEnabled(enabled) {
    if (enabled) {
      passSliderEl.removeAttribute("disabled");
      passPrevEl.removeAttribute("disabled");
      passNextEl.removeAttribute("disabled");
    } else {
      passSliderEl.setAttribute("disabled", "disabled");
      passPrevEl.setAttribute("disabled", "disabled");
      passNextEl.setAttribute("disabled", "disabled");
    }
  }
  passSliderEl.addEventListener("input", () => {
    updateGraph(passes[passSliderEl.value]);
  });
  passPrevEl.addEventListener("click", () => {
    passSliderEl.value = Math.max(0, Number(passSliderEl.value) - 1);
    updateGraph(passes[passSliderEl.value]);
  });
  passNextEl.addEventListener("click", () => {
    passSliderEl.value = Math.min(passes.length - 1, Number(passSliderEl.value) + 1);
    updateGraph(passes[passSliderEl.value]);
  });
  while (true) {
    let resolvePendingRun;
    const worker = new Worker("/assets/js/iongraph/worker.js", { type: "module" });
    worker.onmessage = (e) => {
      resolvePendingRun(e.data);
    };
    worker.postMessage({
      action: "receiveModules",
      moduleMap: compiledModules
    });
    try {
      while (true) {
        const program = await new Promise((res, rej) => {
          if (deferredNextProgram !== null) {
            res(deferredNextProgram);
            deferredNextProgram = null;
          } else {
            resolveGetProgram = res;
          }
        });
        const data = await new Promise((res, rej) => {
          resolvePendingRun = res;
          worker.postMessage({
            action: "runProgram",
            program
          });
          setTimeout(() => {
            rej("timed out");
          }, TIMEOUT_MS);
        });
        if (data.ok) {
          const testFunc = data.ionJSON.functions.find((f) => f.name !== "input.js:1");
          if (testFunc) {
            passes = testFunc.passes;
            passSliderEl.max = `${passes.length - 1}`;
            passSliderMarkersEl.innerHTML = "";
            for (let i = 0; i < passes.length; i++) {
              const marker = document.createElement("option");
              marker.value = `${i}`;
              passSliderMarkersEl.appendChild(marker);
            }
            const sliderFraction = parseInt(passSliderEl.value, 10) / parseInt(passSliderEl.max, 10);
            const passIndex = Math.round(sliderFraction * (passes.length - 1));
            passSliderEl.value = `${passIndex}`;
            updateGraph(testFunc.passes[passIndex]);
            setUIEnabled(true);
          } else {
            containerEl.innerText = "The test function was not optimized. Make sure it is run at least 30 times.";
            setUIEnabled(false);
          }
        } else {
          console.log(data.stdout);
          containerEl.innerText = data.stderr;
        }
      }
    } catch (e) {
      containerEl.innerText = "Timed out";
      worker.terminate();
      if (e !== "timed out") {
        console.error(e);
        containerEl.innerText = "An unexpected error occurred. See the console.";
      }
    }
  }
}
async function compileAllModules() {
  const mods = getModulePaths();
  const compiledModules = Array.from(await Promise.all(
    mods.values().map((path) => WebAssembly.compileStreaming(fetch(`/assets/js/iongraph/${path}`)))
  ));
  return new Map(mods.keys().map((name, i) => [name, compiledModules[i]]));
}
function downwardArrow2(x1, y1, x2, y2, ym, r, doArrowhead, as, stroke = 1) {
  if (y2 < y1) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }
  if (ym < y1 || y2 < ym) {
    ym = (y1 + y2) / 2;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  if (Math.abs(x2 - x1) < 2 * r) {
    path += `C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${y1 + 2 * (y2 - y1) / 3} ${x2} ${y2} `;
  } else {
    const dir = Math.sign(x2 - x1);
    path += `L ${x1} ${ym - r} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x1 + r * dir} ${ym} `;
    path += `L ${x2 - r * dir} ${ym} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x2} ${ym + r} `;
    path += `L ${x2} ${y2} `;
  }
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  if (doArrowhead) {
    const v = arrowhead2(x2, y2, 180, as);
    g.appendChild(v);
  }
  return g;
}
function upwardArrow2(x1, y1, x2, y2, ym, r, doArrowhead, as, stroke = 1) {
  if (!(y2 + r <= ym && ym <= y1 - r)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  if (Math.abs(x2 - x1) < 2 * r) {
    path += `C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${y1 + 2 * (y2 - y1) / 3} ${x2} ${y2} `;
  } else {
    const dir = Math.sign(x2 - x1);
    path += `L ${x1} ${ym + r} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x1 + r * dir} ${ym} `;
    path += `L ${x2 - r * dir} ${ym} `;
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x2} ${ym - r} `;
    path += `L ${x2} ${y2} `;
  }
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  if (doArrowhead) {
    const v = arrowhead2(x2, y2, 0, as);
    g.appendChild(v);
  }
  return g;
}
function arrowToBackedge2(x1, y1, x2, y2, r, as, stroke = 1) {
  if (!(y1 - r >= y2 && x1 - r >= x2)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }
  if (stroke % 2 === 1) {
    x1 += 0.5;
    y2 += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  path += `L ${x1} ${y2 + r}`;
  path += `A ${r} ${r} 0 0 0 ${x1 - r} ${y2} `;
  path += `L ${x2} ${y2} `;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  const v = arrowhead2(x2, y2, 270, as);
  g.appendChild(v);
  return g;
}
function arrowFromBlockToBackedgeDummy2(x1, y1, x2, y2, ym, r, stroke = 1) {
  if (!(y1 + r <= ym && x1 <= x2 && y2 <= y1)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }
  let path = "";
  path += `M ${x1} ${y1} `;
  path += `L ${x1} ${ym - r} `;
  path += `A ${r} ${r} 0 0 0 ${x1 + r} ${ym} `;
  path += `L ${x2 - r} ${ym} `;
  path += `A ${r} ${r} 0 0 0 ${x2} ${ym - r} `;
  path += `L ${x2} ${y2} `;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  return g;
}
function loopHeaderArrow2(x1, y1, x2, y2, r, as, stroke = 1) {
  if (!(x2 < x1)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }
  if (stroke % 2 === 1) {
    y1 += 0.5;
    y2 += 0.5;
  }
  r = Math.min(r, Math.abs(y2 - y1) / 2);
  let path = "";
  path += `M ${x1} ${y1} `;
  const dir = Math.sign(y2 - y1);
  const xm = (x1 + x2) / 2;
  path += `L ${xm + r} ${y1} `;
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${xm} ${y1 + r * dir} `;
  path += `L ${xm} ${y2 - r * dir} `;
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${xm - r} ${y2} `;
  path += `L ${x2} ${y2} `;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);
  const v = arrowhead2(x2, y2, 270, as);
  g.appendChild(v);
  return g;
}
function arrowhead2(x, y, rot, size = 5) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", `M 0 0 L ${-size} ${size * 1.5} L ${size} ${size * 1.5} Z`);
  p.setAttribute("transform", `translate(${x}, ${y}) rotate(${rot})`);
  return p;
}
function filerp2(current, target, r, dt) {
  return (current - target) * Math.pow(r, dt) + target;
}
function straightenEdges(layoutNodesByLayer, numPasses) {
  const PORT_START2 = 5;
  const PORT_SPACING2 = 10;
  const BLOCK_GAP2 = 20;
  const NEARLY_STRAIGHT2 = 20;
  const pushNeighbors = (nodes) => {
    for (let i = 0; i < nodes.length - 1; i++) {
      const node = nodes[i];
      const neighbor = nodes[i + 1];
      const firstNonDummy = node.dummy && !neighbor.dummy;
      const nodeRightPlusPadding = node.x + (node.dummy ? 10 : 64) + (firstNonDummy ? PORT_START2 : 0) + BLOCK_GAP2;
      neighbor.x = Math.max(neighbor.x, nodeRightPlusPadding);
    }
  };
  const pushOnly = () => {
    for (let layer = 0; layer < layoutNodesByLayer.length - 1; layer++) {
      const nodes = layoutNodesByLayer[layer];
      pushNeighbors(nodes);
    }
  };
  const pushIntoLoops = () => {
    for (const nodes of layoutNodesByLayer) {
      for (const node of nodes) {
        if (node.dummy) {
          continue;
        }
        if (node.loop) {
          node.x = Math.max(node.x, node.loop.x);
        }
      }
    }
  };
  const straightenDummyRuns = () => {
    const dummyLinePositions = /* @__PURE__ */ new Map();
    for (const dummy of dummies2(layoutNodesByLayer)) {
      const dst = dummy.dstNode;
      let desiredX = dummy.x;
      dummyLinePositions.set(dst, Math.max(dummyLinePositions.get(dst) ?? 0, desiredX));
    }
    for (const dummy of dummies2(layoutNodesByLayer)) {
      const backedge = dummy.dstNode;
      const x = dummyLinePositions.get(backedge);
      dummy.x = x;
    }
    for (const nodes of layoutNodesByLayer) {
      pushNeighbors(nodes);
    }
  };
  const suckInLeftmostDummies = () => {
    const dummyRunPositions = /* @__PURE__ */ new Map();
    for (const nodes of layoutNodesByLayer) {
      let i = 0;
      let nextX = 0;
      for (; i < nodes.length; i++) {
        if (!(nodes[i].flags & LEFTMOST_DUMMY)) {
          nextX = nodes[i].x;
          break;
        }
      }
      i -= 1;
      nextX -= BLOCK_GAP2 + PORT_START2;
      for (; i >= 0; i--) {
        const dummy = nodes[i];
        assert(dummy.block === null && dummy.flags & LEFTMOST_DUMMY);
        let maxSafeX = nextX;
        for (const src of dummy.srcNodes) {
          const srcX = src.x + src.dstNodes.indexOf(dummy) * PORT_SPACING2;
          if (srcX < maxSafeX) {
            maxSafeX = srcX;
          }
        }
        if (dummy.dstBlock.layoutNode.x < maxSafeX) {
          maxSafeX = dummy.dstBlock.layoutNode.x;
        }
        dummy.x = maxSafeX;
        nextX = dummy.x - BLOCK_GAP2;
        dummyRunPositions.set(dummy.dstBlock, Math.min(dummyRunPositions.get(dummy.dstBlock) ?? Infinity, maxSafeX));
      }
    }
    for (const dummy of dummies2(layoutNodesByLayer)) {
      if (!(dummy.flags & LEFTMOST_DUMMY)) {
        continue;
      }
      const x = dummyRunPositions.get(dummy.dstBlock);
      assert(x, `no position for run to block ${dummy.dstBlock.id}`);
      dummy.x = x;
    }
  };
  const straightenChildren = () => {
    for (let layer = 0; layer < layoutNodesByLayer.length - 1; layer++) {
      const nodes = layoutNodesByLayer[layer];
      pushNeighbors(nodes);
      let lastShifted = -1;
      for (const node of nodes) {
        for (const [srcPort, dst] of node.dstNodes.entries()) {
          let dstIndexInNextLayer = layoutNodesByLayer[layer + 1].indexOf(dst);
          if (dstIndexInNextLayer > lastShifted && dst.srcNodes[0] === node) {
            const srcPortOffset = PORT_START2 + PORT_SPACING2 * srcPort;
            const dstPortOffset = PORT_START2;
            let xBefore = dst.x;
            dst.x = Math.max(dst.x, node.x + srcPortOffset - dstPortOffset);
            if (dst.x !== xBefore) {
              lastShifted = dstIndexInNextLayer;
            }
          }
        }
      }
    }
  };
  const straightenConservative = () => {
    for (const nodes of layoutNodesByLayer) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (!node.block || node.block.attributes.includes("backedge")) {
          continue;
        }
        let deltasToTry = [];
        for (const parent of node.srcNodes) {
          const srcPortOffset = PORT_START2 + parent.dstNodes.indexOf(node) * PORT_SPACING2;
          const dstPortOffset = PORT_START2;
          deltasToTry.push(parent.x + srcPortOffset - (node.x + dstPortOffset));
        }
        for (const [srcPort, dst] of node.dstNodes.entries()) {
          if (dst.block === null && dst.dstBlock.attributes.includes("backedge")) {
            continue;
          }
          const srcPortOffset = PORT_START2 + srcPort * PORT_SPACING2;
          const dstPortOffset = PORT_START2;
          deltasToTry.push(dst.x + dstPortOffset - (node.x + srcPortOffset));
        }
        if (deltasToTry.includes(0)) {
          continue;
        }
        deltasToTry = deltasToTry.filter((d) => d > 0).sort((a, b) => a - b);
        for (const delta of deltasToTry) {
          let overlapsAny = false;
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            if (other.flags & RIGHTMOST_DUMMY) {
              continue;
            }
            const a1 = node.x + delta, a2 = node.x + delta + node.size.x;
            const b1 = other.x - BLOCK_GAP2, b2 = other.x + other.size.x + BLOCK_GAP2;
            const overlaps = a2 >= b1 && a1 <= b2;
            if (overlaps) {
              overlapsAny = true;
            }
          }
          if (!overlapsAny) {
            node.x += delta;
            break;
          }
        }
      }
      pushNeighbors(nodes);
    }
  };
  const straightenNearlyStraightEdgesUp = () => {
    for (let layer = layoutNodesByLayer.length - 1; layer >= 0; layer--) {
      const nodes = layoutNodesByLayer[layer];
      pushNeighbors(nodes);
      for (const node of nodes) {
        for (const src of node.srcNodes) {
          if (!src.dummy) {
            continue;
          }
          const wiggle = Math.abs(src.x - node.x);
          if (wiggle <= NEARLY_STRAIGHT2) {
            src.x = Math.max(src.x, node.x);
            node.x = Math.max(src.x, node.x);
          }
        }
      }
    }
  };
  const straightenNearlyStraightEdgesDown = () => {
    for (let layer = 0; layer < layoutNodesByLayer.length; layer++) {
      const nodes = layoutNodesByLayer[layer];
      pushNeighbors(nodes);
      for (const node of nodes) {
        if (node.dstNodes.length === 0) {
          continue;
        }
        const dst = node.dstNodes[0];
        if (!dst.dummy) {
          continue;
        }
        const wiggle = Math.abs(dst.x - node.x);
        if (wiggle <= NEARLY_STRAIGHT2) {
          dst.x = Math.max(dst.x, node.x);
          node.x = Math.max(dst.x, node.x);
        }
      }
    }
  };
  const passes = [
    pushOnly,
    straightenChildren,
    // pushIntoLoops,
    straightenDummyRuns
    // repeat that a bunch?
    // // straightenDummyRuns,
    // straightenNearlyStraightEdgesUp,
    // straightenNearlyStraightEdgesDown,
    // // repeat that a bunch?
    // // straightenConservative,
    // // straightenDummyRuns,
    // // suckInLeftmostDummies,
  ];
  for (const [i, pass] of passes.entries()) {
    if (i < numPasses) {
      pass();
    }
  }
}
function* dummies2(layoutNodesByLayer) {
  for (const nodes of layoutNodesByLayer) {
    for (const node of nodes) {
      if (node.dummy) {
        yield node;
      }
    }
  }
}
export {
  arrowFromBlockToBackedgeDummy2 as arrowFromBlockToBackedgeDummy,
  arrowToBackedge2 as arrowToBackedge,
  downwardArrow2 as downwardArrow,
  filerp2 as filerp,
  loopHeaderArrow2 as loopHeaderArrow,
  run,
  straightenEdges,
  upwardArrow2 as upwardArrow
};
//# sourceMappingURL=main.js.map
