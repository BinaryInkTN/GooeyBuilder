import state from "./state.js";

export function setupEditors() {
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

    // Define Gooey function signatures for error checking
    const gooeyFunctionSignatures = {
        // Core initialization
        Gooey_Init: {
            params: 0,
            paramTypes: [],
            returnType: "void",
        },

        // Window management
        GooeyWindow_Create: {
            params: 5,
            paramTypes: ["string", "int", "int", "int", "int"],
            returnType: "GooeyWindow*",
        },

        // Basic widgets
        GooeyButton_Create: {
            params: 7,
            paramTypes: [
                "string",
                "int",
                "int",
                "int",
                "int",
                "function",
                "void*",
            ],
            returnType: "GooeyButton*",
        },
        GooeyTextBox_Create: {
            params: 8,
            paramTypes: [
                "int",
                "int",
                "int",
                "int",
                "string",
                "bool",
                "function",
                "void*",
            ],
            returnType: "GooeyTextbox*",
        },
        GooeySlider_Create: {
            params: 8,
            paramTypes: [
                "int",
                "int",
                "int",
                "long",
                "long",
                "bool",
                "function",
                "void*",
            ],
            returnType: "GooeySlider*",
        },
        GooeyCheckbox_Create: {
            params: 5,
            paramTypes: ["int", "int", "string", "function", "void*"],
            returnType: "GooeyCheckbox*",
        },
        GooeyLabel_Create: {
            params: 4,
            paramTypes: ["string", "float", "int", "int"],
            returnType: "GooeyLabel*",
        },

        // Advanced widgets
        GooeyCanvas_Create: {
            params: 6,
            paramTypes: ["int", "int", "int", "int", "function", "void*"],
            returnType: "GooeyCanvas*",
        },
        GooeyImage_Create: {
            params: 7,
            paramTypes: [
                "string",
                "int",
                "int",
                "int",
                "int",
                "function",
                "void*",
            ],
            returnType: "GooeyImage*",
        },
        GooeyDropdown_Create: {
            params: 8,
            paramTypes: [
                "int",
                "int",
                "int",
                "int",
                "const char**",
                "int",
                "function",
                "void*",
            ],
            returnType: "GooeyDropdown*",
        },
        GooeyList_Create: {
            params: 6,
            paramTypes: ["int", "int", "int", "int", "function", "void*"],
            returnType: "GooeyList*",
        },
        GooeyProgressBar_Create: {
            params: 5,
            paramTypes: ["int", "int", "int", "int", "long"],
            returnType: "GooeyProgressBar*",
        },
        GooeySwitch_Create: {
            params: 6,
            paramTypes: ["int", "int", "bool", "bool", "function", "void*"],
            returnType: "GooeySwitch*",
        },

        // Containers
        GooeyContainer_Create: {
            params: 4,
            paramTypes: ["int", "int", "int", "int"],
            returnType: "GooeyContainers*",
        },
        GooeyTabs_Create: {
            params: 5,
            paramTypes: ["int", "int", "int", "int", "bool"],
            returnType: "GooeyTabs*",
        },
        GooeyLayout_Create: {
            params: 5,
            paramTypes: ["GooeyLayoutType", "int", "int", "int", "int"],
            returnType: "GooeyLayout*",
        },

        // Widget methods
        GooeyButton_SetText: {
            params: 2,
            paramTypes: ["GooeyButton*", "string"],
            returnType: "void",
        },
        GooeyButton_SetEnabled: {
            params: 2,
            paramTypes: ["GooeyButton*", "bool"],
            returnType: "void",
        },
        GooeyButton_SetHighlight: {
            params: 2,
            paramTypes: ["GooeyButton*", "bool"],
            returnType: "void",
        },
        GooeyTextbox_GetText: {
            params: 1,
            paramTypes: ["GooeyTextbox*"],
            returnType: "const char*",
        },
        GooeyTextbox_SetText: {
            params: 2,
            paramTypes: ["GooeyTextbox*", "string"],
            returnType: "void",
        },
        GooeySlider_GetValue: {
            params: 1,
            paramTypes: ["GooeySlider*"],
            returnType: "long",
        },
        GooeySlider_SetValue: {
            params: 2,
            paramTypes: ["GooeySlider*", "long"],
            returnType: "void",
        },
        GooeyLabel_SetText: {
            params: 2,
            paramTypes: ["GooeyLabel*", "string"],
            returnType: "void",
        },
        GooeyLabel_SetColor: {
            params: 2,
            paramTypes: ["GooeyLabel*", "unsigned long"],
            returnType: "void",
        },

        // Canvas methods
        GooeyCanvas_DrawRectangle: {
            params: 10,
            paramTypes: [
                "GooeyCanvas*",
                "int",
                "int",
                "int",
                "int",
                "unsigned long",
                "bool",
                "float",
                "bool",
                "float",
            ],
            returnType: "void",
        },
        GooeyCanvas_Clear: {
            params: 1,
            paramTypes: ["GooeyCanvas*"],
            returnType: "void",
        },

        // List methods
        GooeyList_AddItem: {
            params: 3,
            paramTypes: ["GooeyList*", "string", "string"],
            returnType: "void",
        },
        GooeyList_ClearItems: {
            params: 1,
            paramTypes: ["GooeyList*"],
            returnType: "void",
        },

        // Other methods
        GooeyProgressBar_Update: {
            params: 2,
            paramTypes: ["GooeyProgressBar*", "long"],
            returnType: "void",
        },
        GooeyMeter_Update: {
            params: 2,
            paramTypes: ["GooeyMeter*", "long"],
            returnType: "void",
        },
        GooeySwitch_GetState: {
            params: 1,
            paramTypes: ["GooeySwitch*"],
            returnType: "bool",
        },

        // Dialogs
        GooeyMessageBox_Create: {
            params: 4,
            paramTypes: ["string", "string", "MSGBOX_TYPE", "function"],
            returnType: "GooeyWindow*",
        },
        GooeyFDialog_Open: {
            params: 4,
            paramTypes: ["string", "const char**", "int", "function"],
            returnType: "void",
        },
    };

    // Valid Gooey data types
    const validGooeyTypes = [
        "GooeyWindow",
        "GooeyButton",
        "GooeyTextbox",
        "GooeySlider",
        "GooeyCheckbox",
        "GooeyLabel",
        "GooeyCanvas",
        "GooeyImage",
        "GooeyDropdown",
        "GooeyList",
        "GooeyProgressBar",
        "GooeySwitch",
        "GooeyContainers",
        "GooeyTabs",
        "GooeyLayout",
        "GooeyMeter",
    ];

    // Create model markers for error checking
    function validateGooeyCode(model) {
        const markers = [];
        const content = model.getValue();
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;

            // Check for Gooey function calls
            const gooeyFuncRegex = /(\w+)\s*\(/g;
            let match;

            while ((match = gooeyFuncRegex.exec(line)) !== null) {
                const funcName = match[1];

                // Check if it's a Gooey function
                if (gooeyFunctionSignatures[funcName]) {
                    const signature = gooeyFunctionSignatures[funcName];
                    const funcCall = line.substring(match.index);
                    const parenMatch = funcCall.match(/\(([^)]*)\)/);

                    if (parenMatch) {
                        const argsStr = parenMatch[1];
                        const args = argsStr
                            .split(",")
                            .map((arg) => arg.trim())
                            .filter((arg) => arg.length > 0);

                        // Check parameter count
                        if (args.length !== signature.params) {
                            markers.push({
                                severity: monaco.MarkerSeverity.Error,
                                message: `Gooey function ${funcName} expects ${signature.params} parameters, but ${args.length} were provided`,
                                startLineNumber: lineNumber,
                                startColumn: match.index + 1,
                                endLineNumber: lineNumber,
                                endColumn: match.index + funcName.length + 1,
                            });
                        }

                        // Check for specific common issues
                        for (let j = 0; j < args.length; j++) {
                            const arg = args[j];
                            const expectedType = signature.paramTypes[j];

                            // Check for string literals (should have quotes)
                            if (
                                expectedType === "string" &&
                                !arg.match(/^["'].*["']$/)
                            ) {
                                markers.push({
                                    severity: monaco.MarkerSeverity.Warning,
                                    message: `Parameter ${j + 1} to ${funcName} should be a string literal (use quotes)`,
                                    startLineNumber: lineNumber,
                                    startColumn:
                                        line.indexOf(arg, match.index) + 1,
                                    endLineNumber: lineNumber,
                                    endColumn:
                                        line.indexOf(arg, match.index) +
                                        arg.length +
                                        1,
                                });
                            }

                            // Check for boolean values
                            if (
                                expectedType === "bool" &&
                                !arg.match(/^(true|false)$/i)
                            ) {
                                markers.push({
                                    severity: monaco.MarkerSeverity.Warning,
                                    message: `Parameter ${j + 1} to ${funcName} should be a boolean (true or false)`,
                                    startLineNumber: lineNumber,
                                    startColumn:
                                        line.indexOf(arg, match.index) + 1,
                                    endLineNumber: lineNumber,
                                    endColumn:
                                        line.indexOf(arg, match.index) +
                                        arg.length +
                                        1,
                                });
                            }
                        }
                    }
                } else if (funcName.startsWith("Gooey")) {
                    // Check for non-existent Gooey functions
                    markers.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `Unknown Gooey function: ${funcName}`,
                        startLineNumber: lineNumber,
                        startColumn: match.index + 1,
                        endLineNumber: lineNumber,
                        endColumn: match.index + funcName.length + 1,
                    });
                }
            }

            // Check for Gooey type declarations
            const typeDeclRegex = /(Gooey\w+)\s*\*\s*(\w+)/g;
            while ((match = typeDeclRegex.exec(line)) !== null) {
                const typeName = match[1];
                const varName = match[2];

                if (validGooeyTypes.includes(typeName)) {
                    // Valid Gooey type
                } else if (typeName.startsWith("Gooey")) {
                    // Invalid Gooey type
                    markers.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `Unknown Gooey type: ${typeName}`,
                        startLineNumber: lineNumber,
                        startColumn: match.index + 1,
                        endLineNumber: lineNumber,
                        endColumn: match.index + typeName.length + 1,
                    });
                }
            }

            // Check for missing semicolons after Gooey function calls
            const gooeyFuncCallRegex = /(Gooey\w+_\w+\([^)]*\))(?!\s*;)/g;
            while ((match = gooeyFuncCallRegex.exec(line)) !== null) {
                const funcCall = match[1];
                // Don't flag if it's part of a larger expression or assignment
                if (!line.match(/=\s*$/)) {
                    markers.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: `Missing semicolon after Gooey function call`,
                        startLineNumber: lineNumber,
                        startColumn: match.index + funcCall.length,
                        endLineNumber: lineNumber,
                        endColumn: match.index + funcCall.length + 1,
                    });
                }
            }
        }

        // Set markers on the model
        monaco.editor.setModelMarkers(model, "gooey-validator", markers);
    }

    // Debounced validation function
    let validationTimeout;
    function debouncedValidate(model) {
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }
        validationTimeout = setTimeout(() => {
            validateGooeyCode(model);
        }, 500);
    }

    // Apply validation to main editor
    editor.onDidChangeModelContent(() => {
        debouncedValidate(editor.getModel());
    });

    // Apply validation to callback editor
    callbackEditor.onDidChangeModelContent(() => {
        debouncedValidate(callbackEditor.getModel());
    });

    // Initial validation
    setTimeout(() => {
        validateGooeyCode(editor.getModel());
        validateGooeyCode(callbackEditor.getModel());
    }, 1000);

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
                // ============================================================================
                // CORE INITIALIZATION
                // ============================================================================
                {
                    label: "Gooey_Init",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Initialize Gooey GUI library",
                    documentation: {
                        value: "Initializes the Gooey GUI library. This must be called before creating any windows or widgets.\n\n**Returns:** void\n\n**Example:**\n```c\nGooey_Init();\n```",
                    },
                    insertText: "Gooey_Init();",
                    sortText: "0001",
                },

                // ============================================================================
                // WINDOW MANAGEMENT
                // ============================================================================
                {
                    label: "GooeyWindow_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a new window",
                    documentation: {
                        value: 'Creates a new Gooey window with the specified parameters.\n\n**Parameters:**\n- `title` (const char*) - Window title\n- `x` (int) - X position on screen\n- `y` (int) - Y position on screen\n- `width` (int) - Window width in pixels\n- `height` (int) - Window height in pixels\n\n**Returns:** GooeyWindow* - Pointer to created window or NULL on failure\n\n**Example:**\n```c\nGooeyWindow *window = GooeyWindow_Create("My App", 100, 100, 800, 600);\nif (!window) {\n    printf("Failed to create window!\\n");\n    return 1;\n}\n```',
                    },
                    insertText:
                        'GooeyWindow_Create("${1:title}", ${2:100}, ${3:100}, ${4:800}, ${5:600})',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0010",
                },

                // ============================================================================
                // BASIC WIDGETS - Creation Functions
                // ============================================================================
                {
                    label: "GooeyButton_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a button widget",
                    documentation: {
                        value: 'Creates a clickable button widget.\n\n**Parameters:**\n- `label` (const char*) - Button text\n- `x` (int) - X position relative to window\n- `y` (int) - Y position relative to window\n- `width` (int) - Button width\n- `height` (int) - Button height\n- `callback` (void (*)(void*)) - Function called when button is clicked\n- `user_data` (void*) - Custom data passed to callback\n\n**Returns:** GooeyButton* - Pointer to button widget\n\n**Example:**\n```c\nvoid on_button_click(void *data) {\n    printf("Button clicked!\\n");\n}\n\nGooeyButton *btn = GooeyButton_Create("Click Me", 50, 50, 100, 40, on_button_click, NULL);\n```',
                    },
                    insertText: [
                        "GooeyButton_Create(",
                        '\t"${1:label}", ${2:x}, ${3:y}, ${4:width}, ${5:height},',
                        "\t${6:callback}, ${7:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0020",
                },

                {
                    label: "GooeyTextBox_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a text input field",
                    documentation: {
                        value: 'Creates a text input widget for user text entry.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Textbox width\n- `height` (int) - Textbox height\n- `placeholder` (char*) - Placeholder text when empty\n- `is_password` (bool) - Mask input for passwords (true/false)\n- `onTextChanged` (void (*)(char*, void*)) - Callback when text changes\n- `user_data` (void*) - User data passed to callback\n\n**Returns:** GooeyTextbox* - Pointer to textbox widget\n\n**Example:**\n```c\nvoid on_text_changed(char *text, void *data) {\n    printf("Text changed to: %s\\n", text);\n}\n\nGooeyTextbox *textbox = GooeyTextBox_Create(20, 20, 200, 30, "Enter text...", false, on_text_changed, NULL);\n```',
                    },
                    insertText: [
                        "GooeyTextBox_Create(",
                        "\t${1:20}, ${2:20}, ${3:200}, ${4:30},",
                        '\t"${5:placeholder}", ${6:false},',
                        "\t${7:onTextChanged}, ${8:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0021",
                },

                {
                    label: "GooeySlider_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a slider widget",
                    documentation: {
                        value: 'Creates a slider for selecting values within a range.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Slider width\n- `min_value` (long) - Minimum value\n- `max_value` (long) - Maximum value\n- `show_hints` (bool) - Show value hints (true/false)\n- `callback` (void (*)(long, void*)) - Callback when value changes\n- `user_data` (void*) - User data\n\n**Returns:** GooeySlider* - Pointer to slider widget\n\n**Example:**\n```c\nvoid on_slider_changed(long value, void *data) {\n    printf("Slider value: %ld\\n", value);\n}\n\nGooeySlider *slider = GooeySlider_Create(20, 80, 200, 0, 100, true, on_slider_changed, NULL);\n```',
                    },
                    insertText: [
                        "GooeySlider_Create(",
                        "\t${1:20}, ${2:20}, ${3:200},",
                        "\t${4:0}, ${5:100}, ${6:true},",
                        "\t${7:callback}, ${8:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0022",
                },

                {
                    label: "GooeyCheckbox_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a checkbox widget",
                    documentation: {
                        value: 'Creates a checkbox for boolean selections.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `label` (char*) - Checkbox label text\n- `callback` (void (*)(bool, void*)) - Callback when state changes\n- `user_data` (void*) - User data\n\n**Returns:** GooeyCheckbox* - Pointer to checkbox widget\n\n**Example:**\n```c\nvoid on_checkbox_toggled(bool checked, void *data) {\n    printf("Checkbox %s\\n", checked ? "checked" : "unchecked");\n}\n\nGooeyCheckbox *cb = GooeyCheckbox_Create(20, 120, "Enable feature", on_checkbox_toggled, NULL);\n```',
                    },
                    insertText: [
                        "GooeyCheckbox_Create(",
                        '\t${1:20}, ${2:20}, "${3:label}",',
                        "\t${4:callback}, ${5:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0023",
                },

                {
                    label: "GooeyLabel_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a text label",
                    documentation: {
                        value: 'Creates a static text label.\n\n**Parameters:**\n- `text` (const char*) - Label text\n- `font_size` (float) - Font size in points\n- `x` (int) - X position\n- `y` (int) - Y position\n\n**Returns:** GooeyLabel* - Pointer to label widget\n\n**Example:**\n```c\nGooeyLabel *label = GooeyLabel_Create("Hello, World!", 16.0f, 20, 20);\n```',
                    },
                    insertText:
                        'GooeyLabel_Create("${1:text}", ${2:14.0f}, ${3:20}, ${4:20})',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0024",
                },

                // ============================================================================
                // ADVANCED WIDGETS
                // ============================================================================
                {
                    label: "GooeyCanvas_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a drawing canvas",
                    documentation: {
                        value: 'Creates a canvas for custom drawing operations.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Canvas width\n- `height` (int) - Canvas height\n- `callback` (void (*)(int, int, void*)) - Click callback (x, y coordinates)\n- `user_data` (void*) - User data\n\n**Returns:** GooeyCanvas* - Pointer to canvas widget\n\n**Example:**\n```c\nvoid on_canvas_click(int x, int y, void *data) {\n    printf("Clicked at (%d, %d)\\n", x, y);\n}\n\nGooeyCanvas *canvas = GooeyCanvas_Create(20, 20, 400, 300, on_canvas_click, NULL);\n```',
                    },
                    insertText: [
                        "GooeyCanvas_Create(",
                        "\t${1:20}, ${2:20}, ${3:400}, ${4:300},",
                        "\t${5:callback}, ${6:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0030",
                },

                {
                    label: "GooeyImage_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create an image display widget",
                    documentation: {
                        value: 'Creates a widget to display image files.\n\n**Parameters:**\n- `image_path` (const char*) - Path to image file (PNG, JPG, etc.)\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Display width\n- `height` (int) - Display height\n- `callback` (void (*)(void*)) - Click callback\n- `user_data` (void*) - User data\n\n**Returns:** GooeyImage* - Pointer to image widget\n\n**Example:**\n```c\nGooeyImage *img = GooeyImage_Create("icon.png", 20, 20, 64, 64, NULL, NULL);\n```',
                    },
                    insertText: [
                        "GooeyImage_Create(",
                        '\t"${1:image.png}", ${2:20}, ${3:20}, ${4:64}, ${5:64},',
                        "\t${6:NULL}, ${7:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0031",
                },

                {
                    label: "GooeyDropdown_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a dropdown/combobox",
                    documentation: {
                        value: 'Creates a dropdown menu with selectable options.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Width\n- `height` (int) - Height\n- `options` (const char**) - Array of option strings\n- `num_options` (int) - Number of options\n- `callback` (void (*)(int, void*)) - Selection callback (selected index)\n- `user_data` (void*) - User data\n\n**Returns:** GooeyDropdown* - Pointer to dropdown widget\n\n**Example:**\n```c\nconst char *colors[] = {"Red", "Green", "Blue", "Yellow"};\nvoid on_color_selected(int index, void *data) {\n    printf("Selected: %s\\n", colors[index]);\n}\n\nGooeyDropdown *dropdown = GooeyDropdown_Create(20, 20, 150, 30, colors, 4, on_color_selected, NULL);\n```',
                    },
                    insertText: [
                        "GooeyDropdown_Create(",
                        "\t${1:20}, ${2:20}, ${3:150}, ${4:30},",
                        "\t${5:options}, ${6:num_options},",
                        "\t${7:callback}, ${8:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0032",
                },

                {
                    label: "GooeyList_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a scrollable list widget",
                    documentation: {
                        value: 'Creates a scrollable list with selectable items.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Width\n- `height` (int) - Height\n- `callback` (void (*)(int, void*)) - Item selection callback\n- `user_data` (void*) - User data\n\n**Returns:** GooeyList* - Pointer to list widget\n\n**Example:**\n```c\nvoid on_item_selected(int index, void *data) {\n    printf("Selected item %d\\n", index);\n}\n\nGooeyList *list = GooeyList_Create(20, 20, 200, 300, on_item_selected, NULL);\nGooeyList_AddItem(list, "First Item", "This is the first item");\nGooeyList_AddItem(list, "Second Item", "Another item");\n```',
                    },
                    insertText: [
                        "GooeyList_Create(",
                        "\t${1:20}, ${2:20}, ${3:200}, ${4:300},",
                        "\t${5:callback}, ${6:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0033",
                },

                {
                    label: "GooeyProgressBar_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a progress bar",
                    documentation: {
                        value: "Creates a progress bar for showing completion status.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Width\n- `height` (int) - Height\n- `initial_value` (long) - Initial progress value (0-100)\n\n**Returns:** GooeyProgressBar* - Pointer to progress bar widget\n\n**Example:**\n```c\nGooeyProgressBar *pb = GooeyProgressBar_Create(20, 20, 200, 20, 0);\n// Later update progress:\nGooeyProgressBar_Update(pb, 75); // 75% complete\n```",
                    },
                    insertText:
                        "GooeyProgressBar_Create(${1:20}, ${2:20}, ${3:200}, ${4:20}, ${5:0})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0034",
                },

                {
                    label: "GooeySwitch_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a toggle switch",
                    documentation: {
                        value: 'Creates a toggle switch (on/off) widget.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `IsToggled` (bool) - Initial state (true=on, false=off)\n- `show_hints` (bool) - Show state hints (true/false)\n- `callback` (void (*)(bool, void*)) - State change callback\n- `user_data` (void*) - User data\n\n**Returns:** GooeySwitch* - Pointer to switch widget\n\n**Example:**\n```c\nvoid on_switch_toggled(bool state, void *data) {\n    printf("Switch is now %s\\n", state ? "ON" : "OFF");\n}\n\nGooeySwitch *sw = GooeySwitch_Create(20, 20, false, true, on_switch_toggled, NULL);\n```',
                    },
                    insertText: [
                        "GooeySwitch_Create(",
                        "\t${1:20}, ${2:20}, ${3:false}, ${4:true},",
                        "\t${5:callback}, ${6:NULL}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0035",
                },

                // ============================================================================
                // CONTAINERS AND LAYOUTS
                // ============================================================================
                {
                    label: "GooeyContainer_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a container widget",
                    documentation: {
                        value: "Creates a container for grouping widgets together.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Width\n- `height` (int) - Height\n\n**Returns:** GooeyContainers* - Pointer to container\n\n**Example:**\n```c\nGooeyContainers *container = GooeyContainer_Create(10, 10, 300, 200);\n// Add widgets to container\nGooeyContainer_AddWidget(window, container, 0, button);\n```",
                    },
                    insertText:
                        "GooeyContainer_Create(${1:10}, ${2:10}, ${3:300}, ${4:200})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0040",
                },

                {
                    label: "GooeyTabs_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a tabbed interface",
                    documentation: {
                        value: 'Creates a tab widget for organizing content into multiple pages.\n\n**Parameters:**\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Width\n- `height` (int) - Height\n- `is_sidebar` (bool) - Use as sidebar (true/false)\n\n**Returns:** GooeyTabs* - Pointer to tabs widget\n\n**Example:**\n```c\nGooeyTabs *tabs = GooeyTabs_Create(0, 0, 400, 300, false);\nGooeyTabs_InsertTab(tabs, "Tab 1");\nGooeyTabs_InsertTab(tabs, "Tab 2");\nGooeyTabs_SetActiveTab(tabs, 0); // Show first tab\n```',
                    },
                    insertText:
                        "GooeyTabs_Create(${1:0}, ${2:0}, ${3:400}, ${4:300}, ${5:false})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0041",
                },

                {
                    label: "GooeyLayout_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a layout manager",
                    documentation: {
                        value: "Creates a layout manager for automatic widget arrangement.\n\n**Parameters:**\n- `layout_type` (GooeyLayoutType) - Type of layout (GRID, HORIZONTAL, VERTICAL)\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Width\n- `height` (int) - Height\n\n**Returns:** GooeyLayout* - Pointer to layout\n\n**Example:**\n```c\nGooeyLayout *layout = GooeyLayout_Create(LAYOUT_GRID, 10, 10, 400, 300);\nGooeyLayout_AddChild(window, layout, button1);\nGooeyLayout_AddChild(window, layout, button2);\nGooeyLayout_Build(layout); // Arrange widgets\n```",
                    },
                    insertText: [
                        "GooeyLayout_Create(",
                        "\t${1:LAYOUT_GRID}, ${2:10}, ${3:10}, ${4:400}, ${5:300}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0042",
                },

                // ============================================================================
                // WIDGET METHODS - Button
                // ============================================================================
                {
                    label: "GooeyButton_SetText",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Update button text",
                    documentation: {
                        value: 'Changes the text displayed on a button.\n\n**Parameters:**\n- `button` (GooeyButton*) - Pointer to button widget\n- `text` (const char*) - New button text\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyButton_SetText(myButton, "New Text");\n```',
                    },
                    insertText:
                        'GooeyButton_SetText(${1:button}, "${2:new text}")',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0101",
                },

                {
                    label: "GooeyButton_SetEnabled",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Enable/disable button",
                    documentation: {
                        value: "Enables or disables a button widget.\n\n**Parameters:**\n- `button` (GooeyButton*) - Pointer to button\n- `is_enabled` (bool) - Enable state (true/false)\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyButton_SetEnabled(myButton, false); // Disable button\nGooeyButton_SetEnabled(myButton, true);  // Enable button\n```",
                    },
                    insertText:
                        "GooeyButton_SetEnabled(${1:button}, ${2:true})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0102",
                },

                {
                    label: "GooeyButton_SetHighlight",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Highlight/unhighlight button",
                    documentation: {
                        value: "Visually highlights or removes highlight from a button.\n\n**Parameters:**\n- `button` (GooeyButton*) - Pointer to button\n- `is_highlighted` (bool) - Highlight state (true/false)\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyButton_SetHighlight(myButton, true); // Highlight button\n```",
                    },
                    insertText:
                        "GooeyButton_SetHighlight(${1:button}, ${2:true})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0103",
                },

                // ============================================================================
                // WIDGET METHODS - Textbox
                // ============================================================================
                {
                    label: "GooeyTextbox_GetText",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Get textbox content",
                    documentation: {
                        value: 'Retrieves the current text from a textbox.\n\n**Parameters:**\n- `textbox` (GooeyTextbox*) - Pointer to textbox widget\n\n**Returns:** const char* - Current text content\n\n**Example:**\n```c\nconst char *text = GooeyTextbox_GetText(myTextbox);\nprintf("Textbox contains: %s\\n", text);\n```',
                    },
                    insertText: "GooeyTextbox_GetText(${1:textbox})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0110",
                },

                {
                    label: "GooeyTextbox_SetText",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Set textbox text",
                    documentation: {
                        value: 'Sets the text content of a textbox.\n\n**Parameters:**\n- `textbox` (GooeyTextbox*) - Pointer to textbox\n- `text` (const char*) - New text content\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyTextbox_SetText(myTextbox, "Default value");\n```',
                    },
                    insertText:
                        'GooeyTextbox_SetText(${1:textbox}, "${2:text}")',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0111",
                },

                // ============================================================================
                // WIDGET METHODS - Slider
                // ============================================================================
                {
                    label: "GooeySlider_GetValue",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Get slider current value",
                    documentation: {
                        value: 'Retrieves the current value of a slider.\n\n**Parameters:**\n- `slider` (GooeySlider*) - Pointer to slider widget\n\n**Returns:** long - Current slider value\n\n**Example:**\n```c\nlong value = GooeySlider_GetValue(mySlider);\nprintf("Slider value: %ld\\n", value);\n```',
                    },
                    insertText: "GooeySlider_GetValue(${1:slider})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0120",
                },

                {
                    label: "GooeySlider_SetValue",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Set slider value",
                    documentation: {
                        value: "Sets the value of a slider widget.\n\n**Parameters:**\n- `slider` (GooeySlider*) - Pointer to slider\n- `value` (long) - New slider value\n\n**Returns:** void\n\n**Example:**\n```c\nGooeySlider_SetValue(mySlider, 75); // Set to 75%\n```",
                    },
                    insertText: "GooeySlider_SetValue(${1:slider}, ${2:50})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0121",
                },

                // ============================================================================
                // WIDGET METHODS - Label
                // ============================================================================
                {
                    label: "GooeyLabel_SetText",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Update label text",
                    documentation: {
                        value: 'Changes the text displayed by a label.\n\n**Parameters:**\n- `label` (GooeyLabel*) - Pointer to label widget\n- `text` (const char*) - New label text\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyLabel_SetText(myLabel, "Updated text");\n```',
                    },
                    insertText:
                        'GooeyLabel_SetText(${1:label}, "${2:new text}")',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0130",
                },

                {
                    label: "GooeyLabel_SetColor",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Set label text color",
                    documentation: {
                        value: "Sets the text color of a label.\n\n**Parameters:**\n- `label` (GooeyLabel*) - Pointer to label\n- `color` (unsigned long) - Color in hexadecimal format (0xRRGGBB)\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyLabel_SetColor(myLabel, 0xFF0000); // Red text\nGooeyLabel_SetColor(myLabel, 0x00FF00); // Green text\nGooeyLabel_SetColor(myLabel, 0x0000FF); // Blue text\n```",
                    },
                    insertText:
                        "GooeyLabel_SetColor(${1:label}, ${2:0x000000})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0131",
                },

                // ============================================================================
                // WIDGET METHODS - Canvas
                // ============================================================================
                {
                    label: "GooeyCanvas_DrawRectangle",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Draw rectangle on canvas",
                    documentation: {
                        value: "Draws a rectangle on a canvas widget.\n\n**Parameters:**\n- `canvas` (GooeyCanvas*) - Pointer to canvas\n- `x` (int) - X position\n- `y` (int) - Y position\n- `width` (int) - Rectangle width\n- `height` (int) - Rectangle height\n- `color_hex` (unsigned long) - Fill color (0xRRGGBB)\n- `is_filled` (bool) - Filled or outline only\n- `thickness` (float) - Line thickness for outline\n- `is_rounded` (bool) - Rounded corners\n- `corner_radius` (float) - Corner radius if rounded\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyCanvas_DrawRectangle(canvas, 10, 10, 100, 50, 0xFF0000, true, 1.0f, false, 0.0f);\n```",
                    },
                    insertText: [
                        "GooeyCanvas_DrawRectangle(",
                        "\t${1:canvas}, ${2:10}, ${3:10}, ${4:100}, ${5:50},",
                        "\t${6:0xFF0000}, ${7:true}, ${8:1.0f}, ${9:false}, ${10:0.0f}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0140",
                },

                {
                    label: "GooeyCanvas_Clear",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Clear canvas content",
                    documentation: {
                        value: "Clears all drawings from a canvas.\n\n**Parameters:**\n- `canvas` (GooeyCanvas*) - Pointer to canvas\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyCanvas_Clear(myCanvas); // Clear the canvas\n```",
                    },
                    insertText: "GooeyCanvas_Clear(${1:canvas})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0141",
                },

                // ============================================================================
                // WIDGET METHODS - List
                // ============================================================================
                {
                    label: "GooeyList_AddItem",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Add item to list",
                    documentation: {
                        value: 'Adds an item to a list widget.\n\n**Parameters:**\n- `list` (GooeyList*) - Pointer to list widget\n- `title` (const char*) - Item title\n- `description` (const char*) - Item description\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyList_AddItem(myList, "First Item", "This is the first list item");\nGooeyList_AddItem(myList, "Second Item", "Another item in the list");\n```',
                    },
                    insertText: [
                        "GooeyList_AddItem(",
                        '\t${1:list}, "${2:title}", "${3:description}"',
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0150",
                },

                {
                    label: "GooeyList_ClearItems",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Clear all list items",
                    documentation: {
                        value: "Removes all items from a list widget.\n\n**Parameters:**\n- `list` (GooeyList*) - Pointer to list widget\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyList_ClearItems(myList); // Remove all items\n```",
                    },
                    insertText: "GooeyList_ClearItems(${1:list})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0151",
                },

                // ============================================================================
                // WIDGET METHODS - Other Widgets
                // ============================================================================
                {
                    label: "GooeyProgressBar_Update",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Update progress bar value",
                    documentation: {
                        value: "Updates the progress value of a progress bar.\n\n**Parameters:**\n- `progressbar` (GooeyProgressBar*) - Pointer to progress bar\n- `new_value` (long) - New progress value (0-100)\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyProgressBar_Update(myProgressBar, 75); // 75% complete\n```",
                    },
                    insertText:
                        "GooeyProgressBar_Update(${1:progressbar}, ${2:50})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0160",
                },

                {
                    label: "GooeyMeter_Update",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Update meter value",
                    documentation: {
                        value: "Updates the value displayed by a meter widget.\n\n**Parameters:**\n- `meter` (GooeyMeter*) - Pointer to meter widget\n- `new_value` (long) - New meter value\n\n**Returns:** void\n\n**Example:**\n```c\nGooeyMeter_Update(myMeter, 85); // Set meter to 85\n```",
                    },
                    insertText: "GooeyMeter_Update(${1:meter}, ${2:value})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0161",
                },

                {
                    label: "GooeySwitch_GetState",
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: "Get switch state",
                    documentation: {
                        value: 'Gets the current state of a toggle switch.\n\n**Parameters:**\n- `gswitch` (GooeySwitch*) - Pointer to switch widget\n\n**Returns:** bool - Current state (true=on, false=off)\n\n**Example:**\n```c\nbool is_on = GooeySwitch_GetState(mySwitch);\nif (is_on) {\n    printf("Switch is ON\\n");\n}\n```',
                    },
                    insertText: "GooeySwitch_GetState(${1:gswitch})",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0162",
                },

                // ============================================================================
                // DIALOGS AND MESSAGES
                // ============================================================================
                {
                    label: "GooeyMessageBox_Create",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Create a message box",
                    documentation: {
                        value: 'Creates a modal message box dialog.\n\n**Parameters:**\n- `title` (const char*) - Message box title\n- `message` (const char*) - Message text\n- `type` (MSGBOX_TYPE) - Message box type (INFO, WARNING, ERROR, QUESTION)\n- `callback` (void (*)(int)) - Callback for button clicks\n\n**Returns:** GooeyWindow* - Pointer to message box window\n\n**Example:**\n```c\nvoid on_msgbox_button(int option) {\n    printf("Message box button %d clicked\\n", option);\n}\n\nGooeyWindow *msgbox = GooeyMessageBox_Create("Alert", "File saved successfully!", MSGBOX_INFO, on_msgbox_button);\nGooeyMessageBox_Show(msgbox);\n```',
                    },
                    insertText: [
                        "GooeyMessageBox_Create(",
                        '\t"${1:Title}", "${2:Message}",',
                        "\t${3:MSGBOX_INFO}, ${4:callback}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0200",
                },

                {
                    label: "GooeyFDialog_Open",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Open file dialog",
                    documentation: {
                        value: 'Opens a file selection dialog.\n\n**Parameters:**\n- `path` (const char*) - Initial directory path\n- `filters` (const char**) - Array of file filter strings\n- `filter_count` (int) - Number of filters\n- `callback` (void (*)(const char*)) - File selection callback\n\n**Returns:** void\n\n**Example:**\n```c\nconst char *filters[] = {"Text files (*.txt)", "All files (*.*)"};\nvoid on_file_selected(const char *filename) {\n    if (filename) {\n        printf("Selected file: %s\\n", filename);\n    }\n}\n\nGooeyFDialog_Open("./", filters, 2, on_file_selected);\n```',
                    },
                    insertText: [
                        "GooeyFDialog_Open(",
                        '\t"${1:./}", ${2:filters}, ${3:filter_count},',
                        "\t${4:callback}",
                        ")",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "0201",
                },

                // ============================================================================
                // C KEYWORDS AND TYPES
                // ============================================================================
                {
                    label: "int",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Integer type",
                    documentation: "32-bit signed integer type.",
                    insertText: "int ${1:variable}${2: = 0};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1000",
                },
                {
                    label: "float",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Floating point type",
                    documentation: "Single precision floating point type.",
                    insertText: "float ${1:variable}${2: = 0.0f};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1001",
                },
                {
                    label: "double",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Double precision floating point",
                    documentation: "Double precision floating point type.",
                    insertText: "double ${1:variable}${2: = 0.0};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1002",
                },
                {
                    label: "char",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Character type",
                    documentation: "8-bit character type.",
                    insertText: "char ${1:variable}${2: = '\\0'};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1003",
                },
                {
                    label: "void",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Void type",
                    documentation: "Void type indicating no value.",
                    sortText: "1004",
                },
                {
                    label: "bool",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Boolean type",
                    documentation:
                        "Boolean type (true/false). Requires #include <stdbool.h>",
                    insertText: "bool ${1:variable}${2: = false};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1005",
                },
                {
                    label: "long",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Long integer",
                    documentation: "64-bit signed integer type.",
                    insertText: "long ${1:variable}${2: = 0L};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1006",
                },
                {
                    label: "short",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Short integer",
                    documentation: "16-bit signed integer type.",
                    insertText: "short ${1:variable}${2: = 0};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1007",
                },
                {
                    label: "unsigned",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Unsigned modifier",
                    documentation: "Unsigned type modifier.",
                    insertText: "unsigned ${1:int} ${2:variable};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1008",
                },
                {
                    label: "const",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Constant modifier",
                    documentation:
                        "Declares a variable as constant (read-only).",
                    sortText: "1009",
                },
                {
                    label: "static",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Static storage",
                    documentation:
                        "Static storage duration and internal linkage.",
                    sortText: "1010",
                },
                {
                    label: "extern",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "External linkage",
                    documentation:
                        "Declares external linkage for a variable or function.",
                    sortText: "1011",
                },

                // ============================================================================
                // CONTROL FLOW
                // ============================================================================
                {
                    label: "if",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "If statement",
                    documentation: "Conditional execution block.",
                    insertText: [
                        "if (${1:condition}) {",
                        "\t${2:// code}",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1100",
                },
                {
                    label: "else",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Else statement",
                    documentation:
                        "Alternative execution block for if statement.",
                    insertText: ["else {", "\t${1:// code}", "}"].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1101",
                },
                {
                    label: "if else",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "If-else statement",
                    documentation: "Complete if-else conditional block.",
                    insertText: [
                        "if (${1:condition}) {",
                        "\t${2:// if code}",
                        "} else {",
                        "\t${3:// else code}",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1102",
                },
                {
                    label: "for",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "For loop",
                    documentation:
                        "Iteration loop with initialization, condition, and increment.",
                    insertText: [
                        "for (${1:int i = 0}; ${2:i < n}; ${3:i++}) {",
                        "\t${4:// code}",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1110",
                },
                {
                    label: "while",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "While loop",
                    documentation:
                        "Loop that continues while condition is true.",
                    insertText: [
                        "while (${1:condition}) {",
                        "\t${2:// code}",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1111",
                },
                {
                    label: "do while",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Do-while loop",
                    documentation: "Loop that executes at least once.",
                    insertText: [
                        "do {",
                        "\t${1:// code}",
                        "} while (${2:condition});",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1112",
                },
                {
                    label: "switch",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Switch statement",
                    documentation: "Multi-way branch statement.",
                    insertText: [
                        "switch (${1:expression}) {",
                        "\tcase ${2:value}:",
                        "\t\t${3:// code}",
                        "\t\tbreak;",
                        "\tdefault:",
                        "\t\t${4:// code}",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1120",
                },
                {
                    label: "case",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Case label",
                    documentation: "Case label for switch statement.",
                    sortText: "1121",
                },
                {
                    label: "default",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Default case",
                    documentation: "Default case for switch statement.",
                    sortText: "1122",
                },
                {
                    label: "break",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Break statement",
                    documentation: "Exits a loop or switch statement.",
                    sortText: "1130",
                },
                {
                    label: "continue",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Continue statement",
                    documentation: "Skips to next iteration of loop.",
                    sortText: "1131",
                },
                {
                    label: "return",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Return statement",
                    documentation: "Returns from a function.",
                    insertText: "return ${1:value};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1132",
                },

                // ============================================================================
                // STRUCTURES AND TYPES
                // ============================================================================
                {
                    label: "struct",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Structure definition",
                    documentation: "Defines a structure type.",
                    insertText: [
                        "struct ${1:name} {",
                        "\t${2:type} ${3:member};",
                        "};",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1200",
                },
                {
                    label: "typedef",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Type definition",
                    documentation: "Creates a type alias.",
                    insertText: "typedef ${1:existing_type} ${2:new_type};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1201",
                },
                {
                    label: "typedef struct",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Typedef structure",
                    documentation: "Combined typedef and struct definition.",
                    insertText: [
                        "typedef struct ${1:name} {",
                        "\t${2:type} ${3:member};",
                        "} ${1:name};",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1202",
                },
                {
                    label: "enum",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Enumeration",
                    documentation: "Defines an enumeration type.",
                    insertText: [
                        "enum ${1:name} {",
                        "\t${2:FIRST},",
                        "\t${3:SECOND},",
                        "\t${4:THIRD}",
                        "};",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1203",
                },
                {
                    label: "union",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Union definition",
                    documentation: "Defines a union type (shared memory).",
                    sortText: "1204",
                },

                // ============================================================================
                // STANDARD LIBRARY FUNCTIONS
                // ============================================================================
                {
                    label: "printf",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Print formatted output",
                    documentation: "Prints formatted output to stdout.",
                    insertText: 'printf("${1:format string}"${2:, ...});',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1300",
                },
                {
                    label: "scanf",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Read formatted input",
                    documentation: "Reads formatted input from stdin.",
                    insertText: 'scanf("${1:format}", ${2:&variable});',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1301",
                },
                {
                    label: "malloc",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Allocate memory",
                    documentation: "Allocates a block of memory.",
                    insertText: "malloc(${1:size});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1310",
                },
                {
                    label: "calloc",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Allocate and zero memory",
                    documentation:
                        "Allocates memory and initializes it to zero.",
                    insertText: "calloc(${1:count}, ${2:size});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1311",
                },
                {
                    label: "realloc",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Reallocate memory",
                    documentation:
                        "Changes the size of an allocated memory block.",
                    insertText: "realloc(${1:ptr}, ${2:new_size});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1312",
                },
                {
                    label: "free",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Free memory",
                    documentation: "Frees allocated memory.",
                    insertText: "free(${1:pointer});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1313",
                },
                {
                    label: "sizeof",
                    kind: monaco.languages.CompletionItemKind.Operator,
                    detail: "Size of type",
                    documentation:
                        "Returns the size in bytes of a type or variable.",
                    insertText: "sizeof(${1:type});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1320",
                },
                {
                    label: "strlen",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "String length",
                    documentation: "Returns the length of a string.",
                    insertText: "strlen(${1:string});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1330",
                },
                {
                    label: "strcpy",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Copy string",
                    documentation: "Copies a string to another location.",
                    insertText: "strcpy(${1:dest}, ${2:src});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1331",
                },
                {
                    label: "strncpy",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Copy string with length limit",
                    documentation:
                        "Copies up to n characters from one string to another.",
                    insertText: "strncpy(${1:dest}, ${2:src}, ${3:n});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1332",
                },
                {
                    label: "strcat",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Concatenate strings",
                    documentation: "Appends one string to another.",
                    insertText: "strcat(${1:dest}, ${2:src});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1333",
                },
                {
                    label: "strcmp",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Compare strings",
                    documentation: "Compares two strings lexicographically.",
                    insertText: "strcmp(${1:str1}, ${2:str2});",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1334",
                },
                {
                    label: "sprintf",
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: "Format string to buffer",
                    documentation:
                        "Writes formatted output to a string buffer.",
                    insertText:
                        'sprintf(${1:buffer}, "${2:format}"${3:, ...});',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1335",
                },

                // ============================================================================
                // PREPROCESSOR DIRECTIVES
                // ============================================================================
                {
                    label: "#include",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Include header file",
                    documentation: "Includes the contents of another file.",
                    insertText: '#include "${1:file.h}"',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1400",
                },
                {
                    label: "#include <>",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Include system header",
                    documentation: "Includes a system header file.",
                    insertText: "#include <${1:stdio.h}>",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1401",
                },
                {
                    label: "#define",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Define macro",
                    documentation: "Defines a macro constant or function.",
                    insertText: "#define ${1:MACRO_NAME} ${2:value}",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1410",
                },
                {
                    label: "#ifdef",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "If defined",
                    documentation:
                        "Conditional compilation if macro is defined.",
                    insertText: [
                        "#ifdef ${1:MACRO}",
                        "${2:// code}",
                        "#endif",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1420",
                },
                {
                    label: "#ifndef",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "If not defined",
                    documentation:
                        "Conditional compilation if macro is NOT defined.",
                    insertText: [
                        "#ifndef ${1:MACRO}",
                        "#define ${1:MACRO}",
                        "${2:// code}",
                        "#endif",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1421",
                },
                {
                    label: "#pragma once",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Header guard",
                    documentation:
                        "Prevents multiple inclusion of header file.",
                    insertText: "#pragma once",
                    sortText: "1422",
                },
                {
                    label: "#if",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "If condition",
                    documentation:
                        "Conditional compilation based on expression.",
                    insertText: [
                        "#if ${1:condition}",
                        "${2:// code}",
                        "#endif",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "1430",
                },
                {
                    label: "#else",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Else condition",
                    documentation: "Alternative for #if or #ifdef.",
                    sortText: "1431",
                },
                {
                    label: "#elif",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "Else if condition",
                    documentation: "Else-if for conditional compilation.",
                    sortText: "1432",
                },
                {
                    label: "#endif",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: "End if",
                    documentation: "Ends conditional compilation block.",
                    sortText: "1433",
                },

                // ============================================================================
                // COMMON CODE SNIPPETS
                // ============================================================================
                {
                    label: "main",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Main function template",
                    documentation:
                        "Standard main function with command line arguments.",
                    insertText: [
                        "int main(int argc, char *argv[]) {",
                        "\t${1:// TODO: Add initialization code}",
                        "\t",
                        "\treturn 0;",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "2000",
                },
                {
                    label: "main_gooey",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Gooey main function",
                    documentation: "Complete Gooey application template.",
                    insertText: [
                        '#include "gooey.h"',
                        "#include <stdio.h>",
                        "",
                        "// Callback functions",
                        "void on_button_click(void *data) {",
                        '\tprintf("Button clicked!\\\\n");',
                        "}",
                        "",
                        "int main(int argc, char *argv[]) {",
                        "\t// Initialize Gooey",
                        "\tGooey_Init();",
                        "\t",
                        "\t// Create main window",
                        '\tGooeyWindow *window = GooeyWindow_Create("My Gooey App", 100, 100, 800, 600);',
                        "\tif (!window) {",
                        '\t\tprintf("Failed to create window!\\\\n");',
                        "\t\treturn 1;",
                        "\t}",
                        "\t",
                        "\t// Create widgets",
                        '\tGooeyButton_Create("Click Me", 50, 50, 100, 40, on_button_click, NULL);',
                        '\tGooeyLabel_Create("Hello, Gooey!", 16.0f, 50, 100);',
                        "\t",
                        "\t// TODO: Add more widgets here",
                        "\t",
                        "\treturn 0;",
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "2001",
                },
                {
                    label: "callback_function",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Callback function template",
                    documentation:
                        "Template for a callback function used with Gooey widgets.",
                    insertText: [
                        "void ${1:callback_name}(void *user_data) {",
                        "\t${2:// Handle callback}",
                        '\tprintf("Callback executed\\\\n");',
                        "}",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "2002",
                },
                {
                    label: "include_gooey",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Include Gooey headers",
                    documentation: "Includes all necessary Gooey headers.",
                    insertText: [
                        '#include "gooey.h"          // Main Gooey header',
                        '#include "gooey_button.h"   // Button functions',
                        '#include "gooey_label.h"    // Label functions',
                        '#include "gooey_textbox.h"  // Textbox functions',
                        "#include <stdio.h>           // Standard I/O",
                        "#include <stdlib.h>          // Standard library",
                        "#include <stdbool.h>         // Boolean type",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "2003",
                },
                {
                    label: "header_guard",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Header guard template",
                    documentation: "Standard header guard for .h files.",
                    insertText: [
                        "#ifndef ${1:HEADER_NAME}_H",
                        "#define ${1:HEADER_NAME}_H",
                        "",
                        "#ifdef __cplusplus",
                        'extern "C" {',
                        "#endif",
                        "",
                        "${2:// Declarations here}",
                        "",
                        "#ifdef __cplusplus",
                        "}",
                        "#endif",
                        "",
                        "#endif // ${1:HEADER_NAME}_H",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "2004",
                },
                {
                    label: "string_array",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "Create string array",
                    documentation:
                        "Creates an array of strings for dropdown options.",
                    insertText: [
                        "const char *${1:options}[] = {",
                        '\t"${2:Option 1}",',
                        '\t"${3:Option 2}",',
                        '\t"${4:Option 3}"',
                        "};",
                        "int ${5:num_options} = sizeof(${1:options}) / sizeof(${1:options}[0]);",
                    ].join("\n"),
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "2005",
                },

                // ============================================================================
                // COMMON CONSTANTS AND MACROS
                // ============================================================================
                {
                    label: "NULL",
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: "Null pointer",
                    documentation: "Null pointer constant.",
                    sortText: "2100",
                },
                {
                    label: "true",
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: "Boolean true",
                    documentation: "Boolean true value. Requires <stdbool.h>",
                    sortText: "2101",
                },
                {
                    label: "false",
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: "Boolean false",
                    documentation: "Boolean false value. Requires <stdbool.h>",
                    sortText: "2102",
                },
                {
                    label: "EXIT_SUCCESS",
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: "Exit success",
                    documentation: "Successful program termination constant.",
                    sortText: "2103",
                },
                {
                    label: "EXIT_FAILURE",
                    kind: monaco.languages.CompletionItemKind.Constant,
                    detail: "Exit failure",
                    documentation: "Failure program termination constant.",
                    sortText: "2104",
                },

                // ============================================================================
                // GOOEY DATA TYPES FOR DECLARATIONS
                // ============================================================================
                {
                    label: "GooeyWindow",
                    kind: monaco.languages.CompletionItemKind.Struct,
                    detail: "Window handle type",
                    documentation:
                        "Handle to a Gooey window. Use as GooeyWindow*.",
                    insertText: "GooeyWindow *${1:window}${2: = NULL};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "3000",
                },
                {
                    label: "GooeyButton",
                    kind: monaco.languages.CompletionItemKind.Struct,
                    detail: "Button widget type",
                    documentation: "Handle to a Gooey button widget.",
                    insertText: "GooeyButton *${1:button}${2: = NULL};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "3001",
                },
                {
                    label: "GooeyTextbox",
                    kind: monaco.languages.CompletionItemKind.Struct,
                    detail: "Textbox widget type",
                    documentation: "Handle to a Gooey textbox widget.",
                    insertText: "GooeyTextbox *${1:textbox}${2: = NULL};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "3002",
                },
                {
                    label: "GooeySlider",
                    kind: monaco.languages.CompletionItemKind.Struct,
                    detail: "Slider widget type",
                    documentation: "Handle to a Gooey slider widget.",
                    insertText: "GooeySlider *${1:slider}${2: = NULL};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "3003",
                },
                {
                    label: "GooeyLabel",
                    kind: monaco.languages.CompletionItemKind.Struct,
                    detail: "Label widget type",
                    documentation: "Handle to a Gooey label widget.",
                    insertText: "GooeyLabel *${1:label}${2: = NULL};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "3004",
                },
                {
                    label: "GooeyCanvas",
                    kind: monaco.languages.CompletionItemKind.Struct,
                    detail: "Canvas widget type",
                    documentation: "Handle to a Gooey canvas widget.",
                    insertText: "GooeyCanvas *${1:canvas}${2: = NULL};",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "3005",
                },

                // ============================================================================
                // COMMENTS AND DOCUMENTATION
                // ============================================================================
                {
                    label: "TODO",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "TODO comment",
                    documentation: "Inserts a TODO comment.",
                    insertText: "// TODO: ${1:description}",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "9000",
                },
                {
                    label: "FIXME",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "FIXME comment",
                    documentation: "Inserts a FIXME comment.",
                    insertText: "// FIXME: ${1:description}",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "9001",
                },
                {
                    label: "NOTE",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: "NOTE comment",
                    documentation: "Inserts a NOTE comment.",
                    insertText: "// NOTE: ${1:description}",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    sortText: "9002",
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
