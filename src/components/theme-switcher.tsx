
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
  { name: 'Default', theme: 'theme-default', color: 'hsl(15 82% 56%)' },
  { name: 'Navy', theme: 'theme-navy', color: 'hsl(215 41% 45%)' },
  { name: 'Forest', theme: 'theme-forest', color: 'hsl(120 39% 40%)' },
  { name: 'Dusk', theme: 'theme-dusk', color: 'hsl(250 50% 60%)' },
  { name: 'Sunrise', theme: 'theme-sunrise', color: 'hsl(20 90% 60%)' },
];

export function ThemeSwitcher() {
  const { theme: activeTheme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    return <div className="w-24 h-10" />;
  }

  const isDarkMode = resolvedTheme === 'dark';
  
  // Find the current palette part from the full theme string (e.g., "dark theme-forest" -> "theme-forest")
  const currentPalette = themes.find(t => activeTheme?.includes(t.theme))?.theme || 'theme-default';

  const handlePaletteChange = (newPalette: string) => {
    // Combine the new palette with the current mode (light/dark)
    const newTheme = `${isDarkMode ? 'dark' : 'light'} ${newPalette}`;
    setTheme(newTheme);
  };
  
  const handleDarkModeToggle = (isDark: boolean) => {
    // Combine the new mode with the current palette
    const newTheme = `${isDark ? 'dark' : 'light'} ${currentPalette}`;
    setTheme(newTheme);
  };

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
              onClick={() => handlePaletteChange(themeOption.theme)}
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
