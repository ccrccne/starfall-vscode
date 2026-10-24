// Genera los dos temas (noche y día) a partir de una sola paleta: node build.js
const fs = require("fs");

// Cada paleta: fondos, texto y los colores del código.
// sky = funciones, pink = palabras clave, mint = textos, star = números y clases,
// lilac = propiedades, peach = parámetros, red = errores, status = barra de abajo
const palettes = {
    night: {
        name: "Starfall Night", type: "dark",
        bg: "#0f1a3d", bgSide: "#0b1430", bgHi: "#15224a", bgSel: "#26396d", line: "#1d2c5a",
        fg: "#e8f0fc", muted: "#8ea4c8", comment: "#6c80a8",
        sky: "#7cc8f2", star: "#ffd96b", pink: "#f5a3c7", mint: "#8ee3a8", lilac: "#b3bcff", peach: "#ffb98a", red: "#ff8a9a",
        status: "#162a5c", onAccent: "#0b1430", accentHover: "#a3dafa", cyan: "#8fe3f0"
    },
    day: {
        name: "Starfall Day", type: "light",
        bg: "#f6fbff", bgSide: "#eaf5fd", bgHi: "#ffffff", bgSel: "#cfe8f8", line: "#d4ebf9",
        fg: "#1d3b55", muted: "#5d7b93", comment: "#8aa3b8",
        sky: "#2f86c0", star: "#c98a0a", pink: "#c2477a", mint: "#2e8a52", lilac: "#5a5fd0", peach: "#c2621f", red: "#d0384f",
        status: "#2f86c0", onAccent: "#ffffff", accentHover: "#2675aa", cyan: "#1f8a9c"
    },
    cereza: {
        name: "Starfall Cereza", type: "dark",
        bg: "#2a1218", bgSide: "#210d13", bgHi: "#36171f", bgSel: "#5a2232", line: "#3f1c26",
        fg: "#fbe9ec", muted: "#c99ba6", comment: "#9a6b76",
        sky: "#ff9aab", star: "#ffd27a", pink: "#ff5c6c", mint: "#b9e39c", lilac: "#f3b6d3", peach: "#ffb38a", red: "#ff6b6b",
        status: "#6e1f2f", onAccent: "#2a1218", accentHover: "#ffc0ca", cyan: "#f7b2c0"
    },
    fresa: {
        name: "Starfall Fresa", type: "light",
        bg: "#fff6f7", bgSide: "#fdebee", bgHi: "#ffffff", bgSel: "#fbd3da", line: "#f6d5db",
        fg: "#4a1c26", muted: "#9a6470", comment: "#c09aa3",
        sky: "#c92a47", star: "#b06f00", pink: "#a3174a", mint: "#3f8a3a", lilac: "#8a4fb5", peach: "#c25a1f", red: "#d0303f",
        status: "#d1344f", onAccent: "#ffffff", accentHover: "#a8213a", cyan: "#1f8a9c"
    },
    cafeConLeche: {
        name: "Starfall Café con leche", type: "light",
        bg: "#f8f1e7", bgSide: "#efe3d3", bgHi: "#fffaf3", bgSel: "#e6d3bb", line: "#e3d2bd",
        fg: "#4a3426", muted: "#8a6d58", comment: "#ae9783",
        sky: "#9a5a32", star: "#a87a08", pink: "#b04a5a", mint: "#5f7f3a", lilac: "#7a5a9a", peach: "#c0702a", red: "#c0392b",
        status: "#a0623a", onAccent: "#ffffff", accentHover: "#7e4826", cyan: "#3d8a8a"
    },
    chocolate: {
        name: "Starfall Chocolate", type: "dark",
        bg: "#241812", bgSide: "#1c120d", bgHi: "#2f2018", bgSel: "#4a3326", line: "#36261d",
        fg: "#f2e6da", muted: "#b59a85", comment: "#8a6f5c",
        sky: "#e6a971", star: "#ffd27a", pink: "#f08a8a", mint: "#b5cf8a", lilac: "#d6b3e6", peach: "#f0b48a", red: "#ff7a6b",
        status: "#4a2f20", onAccent: "#241812", accentHover: "#f2c49a", cyan: "#9fd0c8"
    },
    lavanda: {
        name: "Starfall Lavanda", type: "dark",
        bg: "#1e1933", bgSide: "#18142a", bgHi: "#282242", bgSel: "#3d3466", line: "#2d2650",
        fg: "#eee8fc", muted: "#a99fcc", comment: "#7d72a6",
        sky: "#b9a6ff", star: "#ffd96b", pink: "#ff9ed1", mint: "#9fe6c0", lilac: "#8fc8ff", peach: "#ffbf94", red: "#ff8a9a",
        status: "#3a2f6b", onAccent: "#1e1933", accentHover: "#d2c6ff", cyan: "#8fe3f0"
    },
    menta: {
        name: "Starfall Menta", type: "light",
        bg: "#f3fbf7", bgSide: "#e6f5ee", bgHi: "#ffffff", bgSel: "#c9ebdb", line: "#d2ece0",
        fg: "#1d3d33", muted: "#5d8576", comment: "#92b3a6",
        sky: "#147a82", star: "#a87200", pink: "#c2477a", mint: "#4a862a", lilac: "#6a55c4", peach: "#c2621f", red: "#d0384f",
        status: "#2f9c78", onAccent: "#ffffff", accentHover: "#0f6168", cyan: "#1f8a9c"
    }
};

// Contraste (WCAG) entre dos colores hex
const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

// Oscurece (o aclara) un color poco a poco hasta que se lea bien sobre el fondo
function readable(hex, bg, min, darken) {
    let c = hex;
    for (let i = 0; i < 40 && contrast(c, bg) < min; i++) {
        c = "#" + [1, 3, 5].map(j => {
            const v = parseInt(c.slice(j, j + 2), 16);
            return Math.round(darken ? v * .94 : v + (255 - v) * .08).toString(16).padStart(2, "0");
        }).join("");
    }
    return c;
}

function theme(p) {
    const dark = p.type === "dark";
    p = { ...p };
    for (const k of ["sky", "star", "pink", "mint", "lilac", "peach", "red", "cyan"]) p[k] = readable(p[k], p.bg, 4.5, !dark);
    p.comment = readable(p.comment, p.bg, 3.2, !dark);
    p.status = dark ? p.status : readable(p.status, "#ffffff", 4.5, true);
    const a = (hex, alpha) => hex + alpha; // añade transparencia en hex
    return {
        name: p.name,
        type: p.type,
        semanticHighlighting: true,
        colors: {
            "focusBorder": a(p.sky, "99"),
            "foreground": p.fg,
            "descriptionForeground": p.muted,
            "errorForeground": p.red,
            "selection.background": a(p.sky, "55"),
            "textLink.foreground": p.sky,
            "textLink.activeForeground": p.pink,
            "icon.foreground": p.muted,

            "editor.background": p.bg,
            "editor.foreground": p.fg,
            "editorLineNumber.foreground": a(p.muted, "80"),
            "editorLineNumber.activeForeground": p.star,
            "editorCursor.foreground": p.star,
            "editor.selectionBackground": a(p.sky, dark ? "40" : "45"),
            "editor.selectionHighlightBackground": a(p.sky, "22"),
            "editor.wordHighlightBackground": a(p.lilac, "26"),
            "editor.findMatchBackground": a(p.star, "55"),
            "editor.findMatchHighlightBackground": a(p.star, "28"),
            "editor.lineHighlightBackground": a(p.sky, dark ? "10" : "12"),
            "editor.lineHighlightBorder": "#00000000",
            "editorIndentGuide.background1": p.line,
            "editorIndentGuide.activeBackground1": a(p.sky, "70"),
            "editorWhitespace.foreground": a(p.muted, "40"),
            "editorBracketMatch.background": a(p.star, "26"),
            "editorBracketMatch.border": a(p.star, "80"),
            "editorBracketHighlight.foreground1": p.star,
            "editorBracketHighlight.foreground2": p.pink,
            "editorBracketHighlight.foreground3": p.sky,
            "editorBracketHighlight.foreground4": p.mint,
            "editorBracketHighlight.foreground5": p.lilac,
            "editorBracketHighlight.foreground6": p.peach,
            "editorError.foreground": p.red,
            "editorWarning.foreground": p.star,
            "editorInfo.foreground": p.sky,
            "editorGutter.addedBackground": p.mint,
            "editorGutter.modifiedBackground": p.sky,
            "editorGutter.deletedBackground": p.red,
            "editorWidget.background": p.bgHi,
            "editorWidget.border": p.line,
            "editorSuggestWidget.background": p.bgHi,
            "editorSuggestWidget.selectedBackground": p.bgSel,
            "editorSuggestWidget.highlightForeground": p.sky,
            "editorHoverWidget.background": p.bgHi,
            "editorHoverWidget.border": p.line,
            "editorGroupHeader.tabsBackground": p.bgSide,
            "editorGroup.border": p.line,
            "minimap.selectionHighlight": a(p.sky, "60"),
            "scrollbarSlider.background": a(p.muted, "30"),
            "scrollbarSlider.hoverBackground": a(p.muted, "50"),
            "scrollbarSlider.activeBackground": a(p.sky, "70"),

            "activityBar.background": p.bgSide,
            "activityBar.foreground": p.star,
            "activityBar.inactiveForeground": p.muted,
            "activityBar.activeBorder": p.star,
            "activityBarBadge.background": p.pink,
            "activityBarBadge.foreground": p.onAccent,
            "sideBar.background": p.bgSide,
            "sideBar.foreground": p.fg,
            "sideBar.border": p.line,
            "sideBarTitle.foreground": p.sky,
            "sideBarSectionHeader.background": p.bgSide,
            "sideBarSectionHeader.foreground": p.muted,
            "list.activeSelectionBackground": p.bgSel,
            "list.activeSelectionForeground": p.fg,
            "list.inactiveSelectionBackground": a(p.bgSel, "aa"),
            "list.hoverBackground": a(p.sky, "18"),
            "list.highlightForeground": p.sky,
            "list.focusOutline": a(p.sky, "80"),
            "tree.indentGuidesStroke": p.line,

            "tab.activeBackground": p.bg,
            "tab.activeForeground": p.fg,
            "tab.activeBorderTop": p.star,
            "tab.inactiveBackground": p.bgSide,
            "tab.inactiveForeground": p.muted,
            "tab.border": p.bgSide,
            "tab.hoverBackground": p.bgHi,

            "titleBar.activeBackground": p.bgSide,
            "titleBar.activeForeground": p.fg,
            "titleBar.inactiveBackground": p.bgSide,
            "titleBar.inactiveForeground": p.muted,
            "titleBar.border": p.line,
            "statusBar.background": p.status,
            "statusBar.foreground": dark ? p.fg : "#ffffff",
            "statusBar.border": "#00000000",
            "statusBar.debuggingBackground": p.pink,
            "statusBar.noFolderBackground": p.status,
            "statusBarItem.remoteBackground": p.star,
            "statusBarItem.remoteForeground": "#3d2a00",
            "panel.background": p.bgSide,
            "panel.border": p.line,
            "panelTitle.activeBorder": p.star,
            "panelTitle.activeForeground": p.fg,
            "panelTitle.inactiveForeground": p.muted,

            "button.background": p.sky,
            "button.foreground": p.onAccent,
            "button.hoverBackground": p.accentHover,
            "badge.background": p.pink,
            "badge.foreground": p.onAccent,
            "input.background": p.bgHi,
            "input.border": p.line,
            "input.placeholderForeground": p.comment,
            "inputOption.activeBorder": p.sky,
            "dropdown.background": p.bgHi,
            "dropdown.border": p.line,
            "progressBar.background": p.star,
            "notifications.background": p.bgHi,
            "notifications.border": p.line,
            "quickInput.background": p.bgHi,
            "quickInputList.focusBackground": p.bgSel,
            "widget.shadow": dark ? "#00000066" : a(p.sky, "22"),

            "terminal.background": p.bgSide,
            "terminal.foreground": p.fg,
            "terminalCursor.foreground": p.star,
            "terminal.ansiBlack": dark ? p.line : p.fg,
            "terminal.ansiRed": p.red,
            "terminal.ansiGreen": p.mint,
            "terminal.ansiYellow": p.star,
            "terminal.ansiBlue": p.sky,
            "terminal.ansiMagenta": p.pink,
            "terminal.ansiCyan": p.cyan,
            "terminal.ansiWhite": p.muted,
            "terminal.ansiBrightBlack": p.comment,
            "terminal.ansiBrightRed": p.red,
            "terminal.ansiBrightGreen": p.mint,
            "terminal.ansiBrightYellow": p.star,
            "terminal.ansiBrightBlue": p.sky,
            "terminal.ansiBrightMagenta": p.pink,
            "terminal.ansiBrightCyan": p.cyan,
            "terminal.ansiBrightWhite": dark ? "#ffffff" : p.fg,

            "gitDecoration.modifiedResourceForeground": p.sky,
            "gitDecoration.untrackedResourceForeground": p.mint,
            "gitDecoration.deletedResourceForeground": p.red,
            "gitDecoration.ignoredResourceForeground": p.comment,
            "gitDecoration.conflictingResourceForeground": p.peach,
            "breadcrumb.foreground": p.muted,
            "breadcrumb.focusForeground": p.fg
        },
        tokenColors: [
            { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: p.comment, fontStyle: "italic" } },
            { scope: ["keyword", "storage.type", "storage.modifier", "keyword.control"], settings: { foreground: p.pink } },
            { scope: ["keyword.operator", "punctuation.accessor"], settings: { foreground: p.sky } },
            { scope: ["string", "string.quoted", "string.template"], settings: { foreground: p.mint } },
            { scope: ["constant.character.escape", "string.regexp"], settings: { foreground: p.peach } },
            { scope: ["constant.numeric", "constant.language", "constant.language.boolean"], settings: { foreground: p.star } },
            { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: p.sky } },
            { scope: ["entity.name.type", "entity.name.class", "support.class", "support.type", "entity.other.inherited-class"], settings: { foreground: p.star } },
            { scope: ["variable", "meta.definition.variable"], settings: { foreground: p.fg } },
            { scope: ["variable.parameter"], settings: { foreground: p.peach, fontStyle: "italic" } },
            { scope: ["variable.other.property", "meta.object-literal.key", "support.type.property-name"], settings: { foreground: p.lilac } },
            { scope: ["variable.language.this", "variable.language.self", "variable.language.super"], settings: { foreground: p.pink, fontStyle: "italic" } },
            { scope: ["entity.name.tag"], settings: { foreground: p.pink } },
            { scope: ["entity.other.attribute-name"], settings: { foreground: p.star, fontStyle: "italic" } },
            { scope: ["punctuation", "meta.brace"], settings: { foreground: p.muted } },
            { scope: ["entity.name.namespace", "entity.name.package"], settings: { foreground: p.lilac } },
            { scope: ["storage.type.annotation", "meta.decorator", "punctuation.decorator"], settings: { foreground: p.peach } },
            { scope: ["markup.heading", "entity.name.section"], settings: { foreground: p.sky, fontStyle: "bold" } },
            { scope: ["markup.bold"], settings: { foreground: p.star, fontStyle: "bold" } },
            { scope: ["markup.italic"], settings: { foreground: p.pink, fontStyle: "italic" } },
            { scope: ["markup.inline.raw", "markup.fenced_code"], settings: { foreground: p.mint } },
            { scope: ["markup.underline.link", "string.other.link"], settings: { foreground: p.sky } },
            { scope: ["markup.inserted"], settings: { foreground: p.mint } },
            { scope: ["markup.deleted"], settings: { foreground: p.red } },
            { scope: ["invalid"], settings: { foreground: p.red } }
        ]
    };
}

const slug = key => key.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
for (const [key, p] of Object.entries(palettes)) {
    fs.writeFileSync(`themes/starfall-${slug(key)}-color-theme.json`, JSON.stringify(theme(p), null, 4) + "\n");
}
console.log("Temas generados");
