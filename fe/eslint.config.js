import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            react: react,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "@typescript-eslint/consistent-type-definitions": ["error", "type"],
            "@typescript-eslint/consistent-type-imports": "error",
            "react/hook-use-state": "error",
            "react-hooks/rules-of-hooks": "error",
            "react/jsx-handler-names": [
                "error",
                {
                    eventHandlerPrefix: "handle",
                    eventHandlerPropPrefix: "on",
                },
            ],
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "variable",
                    types: ["boolean"],
                    format: ["PascalCase"],
                    prefix: [
                        "is",
                        "are",
                        "should",
                        "has",
                        "can",
                        "did",
                        "will",
                    ],
                },
            ],
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "typeAlias",
                    format: ["PascalCase"],
                },
            ],
        },
    },
);
