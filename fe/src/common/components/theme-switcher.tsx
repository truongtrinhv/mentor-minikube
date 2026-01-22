import { Moon, Sun } from "lucide-react";

import { Button } from "./ui/button";

import { useTheme } from "../context/theme-provider";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
            }}
            title={
                theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
            }
        >
            {theme === "light" ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">
                {theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"}
            </span>
        </Button>
    );
}
