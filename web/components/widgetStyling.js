// Widget styling utilities for extensions
export class WidgetStyler {
    constructor() {
        this.widgetStyles = new Map();
        this.styleSheet = null;
        this.initStyleSheet();
    }

    initStyleSheet() {
        // Create a dedicated stylesheet for dynamic widget styles
        const styleElement = document.createElement("style");
        styleElement.id = "extension-widget-styles";
        document.head.appendChild(styleElement);
        this.styleSheet = styleElement.sheet;
    }

    // Register widget styles
    registerWidgetStyle(widgetType, styles) {
        const widgetClass = `widget-${widgetType.toLowerCase()}`;

        // Store styles for later reference
        this.widgetStyles.set(widgetType, {
            class: widgetClass,
            styles: styles,
        });

        // Apply base styles
        this.applyWidgetStyles(widgetType);
    }

    applyWidgetStyles(widgetType) {
        const widgetStyle = this.widgetStyles.get(widgetType);
        if (!widgetStyle) return;

        const { class: widgetClass, styles } = widgetStyle;

        // Clear existing rules for this widget
        this.removeWidgetRules(widgetClass);

        // Add base styles
        if (styles.base) {
            const baseRule = `${widgetClass} { ${this.objectToCSS(styles.base)} }`;
            this.styleSheet.insertRule(
                baseRule,
                this.styleSheet.cssRules.length,
            );
        }

        // Add pseudo-classes
        if (styles.hover) {
            const hoverRule = `${widgetClass}:hover { ${this.objectToCSS(styles.hover)} }`;
            this.styleSheet.insertRule(
                hoverRule,
                this.styleSheet.cssRules.length,
            );
        }

        if (styles.active) {
            const activeRule = `${widgetClass}.active { ${this.objectToCSS(styles.active)} }`;
            this.styleSheet.insertRule(
                activeRule,
                this.styleSheet.cssRules.length,
            );
        }

        if (styles.selected) {
            const selectedRule = `${widgetClass}.selected { ${this.objectToCSS(styles.selected)} }`;
            this.styleSheet.insertRule(
                selectedRule,
                this.styleSheet.cssRules.length,
            );
        }

        // Add child element styles
        if (styles.children) {
            Object.entries(styles.children).forEach(
                ([selector, childStyles]) => {
                    const childRule = `${widgetClass} ${selector} { ${this.objectToCSS(childStyles)} }`;
                    this.styleSheet.insertRule(
                        childRule,
                        this.styleSheet.cssRules.length,
                    );
                },
            );
        }
    }

    removeWidgetRules(widgetClass) {
        const rulesToRemove = [];

        for (let i = 0; i < this.styleSheet.cssRules.length; i++) {
            const rule = this.styleSheet.cssRules[i];
            if (rule.selectorText && rule.selectorText.includes(widgetClass)) {
                rulesToRemove.push(i);
            }
        }

        // Remove in reverse order to maintain correct indices
        rulesToRemove.reverse().forEach((index) => {
            this.styleSheet.deleteRule(index);
        });
    }

    objectToCSS(obj) {
        return Object.entries(obj)
            .map(
                ([property, value]) =>
                    `${this.camelToKebab(property)}: ${value};`,
            )
            .join(" ");
    }

    camelToKebab(str) {
        return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    }

    // Apply styles to existing widget instances
    updateWidgets(widgetType) {
        const widgets = document.querySelectorAll(
            `.widget-${widgetType.toLowerCase()}`,
        );
        const widgetStyle = this.widgetStyles.get(widgetType);

        if (!widgetStyle) return;

        widgets.forEach((widget) => {
            // Base styles are already applied via CSS
            // This method is for dynamic style updates
            if (widgetStyle.styles.dynamic) {
                Object.assign(widget.style, widgetStyle.styles.dynamic);
            }
        });
    }

    // Get CSS string for widget
    getWidgetCSS(widgetType) {
        const widgetStyle = this.widgetStyles.get(widgetType);
        if (!widgetStyle) return "";

        const { class: widgetClass, styles } = widgetStyle;
        let css = "";

        if (styles.base) {
            css += `.${widgetClass} { ${this.objectToCSS(styles.base)} }\n`;
        }

        if (styles.hover) {
            css += `.${widgetClass}:hover { ${this.objectToCSS(styles.hover)} }\n`;
        }

        if (styles.active) {
            css += `.${widgetClass}.active { ${this.objectToCSS(styles.active)} }\n`;
        }

        if (styles.selected) {
            css += `.${widgetClass}.selected { ${this.objectToCSS(styles.selected)} }\n`;
        }

        if (styles.children) {
            Object.entries(styles.children).forEach(
                ([selector, childStyles]) => {
                    css += `.${widgetClass} ${selector} { ${this.objectToCSS(childStyles)} }\n`;
                },
            );
        }

        return css;
    }
}
