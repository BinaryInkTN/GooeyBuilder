import state from "./state.js";

export function setupEditors() {
    // Main code editor
    const editorContainer = document.getElementById("editor");
    const editor = monaco.editor.create(editorContainer, {
        value: "",
        language: "c",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "JetBrains Mono, Consolas, monospace",
        lineNumbers: "on",
        lineHeight: 1.6,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
        },
        wordWrap: "on",
        wrappingIndent: "indent",
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
    });

    // Callback editor
    const callbackEditorContainer = document.getElementById("callback-editor");
    const callbackEditor = monaco.editor.create(callbackEditorContainer, {
        value: "",
        language: "c",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "JetBrains Mono, Consolas, monospace",
        lineNumbers: "on",
        lineHeight: 1.6,
        folding: true,
        wordWrap: "on",
        wrappingIndent: "indent",
    });

    // UI XML editor
    const uiXmlEditorContainer = document.getElementById("ui-xml-editor");
    const uiXmlEditor = monaco.editor.create(uiXmlEditorContainer, {
        value: "",
        language: "xml",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "JetBrains Mono, Consolas, monospace",
        lineNumbers: "on",
        lineHeight: 1.6,
        folding: true,
        wordWrap: "on",
        wrappingIndent: "indent",
    });

    monaco.languages.registerCompletionItemProvider("c", {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const suggestions = [
                // GooeyGUI specific
                {
                    label: "Gooey_Init",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyWindow_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyButton_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyTextBox_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeySlider_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyCheckbox_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyLabel_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyCanvas_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyImage_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyDropSurface_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyDropdown_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyList_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyMenu_Set",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyProgressBar_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyMeter_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeySwitch_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyContainer_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyTabs_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyPlot_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "GooeyRadioButtonGroup_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                },

                {
                    label: "int",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "float",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "char",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "void",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "bool",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "if",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "else",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "while",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "for",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "return",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "printf",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "scanf",
                    kind: monaco.languages.CompletionItemKind.Function,
                },
                {
                    label: "#include",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "#define",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "struct",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "typedef",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "const",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
                {
                    label: "static",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                },
            ];

            return {
                suggestions: suggestions.map((suggestion) => ({
                    ...suggestion,
                    range: range,
                    insertText: suggestion.label,
                })),
            };
        },
    });

    monaco.languages.registerCompletionItemProvider("xml", {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const lineContent = model.getLineContent(position.lineNumber);
            const isInsideTag =
                lineContent.lastIndexOf("<", position.column - 1) >
                lineContent.lastIndexOf(">", position.column - 1);

            if (isInsideTag) {
                const suggestions = [
                    {
                        label: "title",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "width",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "height",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "x",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "y",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "type",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "id",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "minValue",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "maxValue",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "showHints",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "relativePath",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "dropsurfaceMessage",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "dropdownOptions",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "listOptions",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "text",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "name",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "value",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "label",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "state",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "isSidebar",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "plotType",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "version",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "platform",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "language",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "debug_overlay",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "cont_redraw",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "is_visible",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                    {
                        label: "is_resizable",
                        kind: monaco.languages.CompletionItemKind.Property,
                    },
                ];

                return {
                    suggestions: suggestions.map((suggestion) => ({
                        ...suggestion,
                        range: range,
                        insertText: suggestion.label + '=""',
                    })),
                };
            } else {
                const suggestions = [
                    {
                        label: "project",
                        kind: monaco.languages.CompletionItemKind.Class,
                    },
                    {
                        label: "window",
                        kind: monaco.languages.CompletionItemKind.Class,
                    },
                    {
                        label: "widgets",
                        kind: monaco.languages.CompletionItemKind.Class,
                    },
                    {
                        label: "widget",
                        kind: monaco.languages.CompletionItemKind.Class,
                    },
                    {
                        label: "callback",
                        kind: monaco.languages.CompletionItemKind.Class,
                    },
                    {
                        label: "children",
                        kind: monaco.languages.CompletionItemKind.Class,
                    },
                ];

                return {
                    suggestions: suggestions.map((suggestion) => ({
                        ...suggestion,
                        range: range,
                        insertText:
                            "<" +
                            suggestion.label +
                            "></" +
                            suggestion.label +
                            ">",
                    })),
                };
            }
        },
    });

    state.editor = editor;
    state.callbackEditor = callbackEditor;
    state.uiXmlEditor = uiXmlEditor;

    return { editor, callbackEditor, uiXmlEditor };
}
