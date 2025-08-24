
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const themes = [
  { name: 'Default', theme: 'theme-default', color: 'hsl(76 34% 50%)' },
  { name: 'Navy', theme: 'theme-navy', color: 'hsl(215 41% 45%)' },
  { name: 'Forest', theme: 'theme-forest', color: 'hsl(120 39% 40%)' },
  { name: 'Dusk', theme: 'theme-dusk', color: 'hsl(250 50% 60%)' },
  { name: 'Sunrise', theme: 'theme-sunrise', color: 'hsl(20 90% 60%)' },
];

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // The current color palette is the theme name that doesn't include "light" or "dark".
  // This logic correctly separates the color palette from the light/dark mode.
  const currentPalette = themes.find(t => t.theme === theme)?.theme || theme?.replace(/light-|dark-/, '') || 'theme-default';
  const isDarkMode = resolvedTheme === 'dark';

  if (!mounted) {
    // Avoid rendering UI that depends on the theme until the client is mounted
    return <div className="w-24 h-10" />;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Cambiar paleta de colores">
            <Palette className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.name}
              onClick={() => setTheme(themeOption.theme)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: themeOption.color }}
                />
                <span>{themeOption.name}</span>
              </div>
              {currentPalette === themeOption.theme && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center space-x-2 pr-2">
        <Sun className="h-5 w-5" />
        <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={handleDarkModeToggle}
            aria-label="Cambiar entre modo claro y oscuro"
        />
        <Moon className="h-5 w-5" />
      </div>
    </div>
  );
}
