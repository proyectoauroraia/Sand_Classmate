
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoids hydration mismatch by returning a placeholder
    return <div className="flex items-center gap-2 rounded-lg border bg-card p-1 h-10 w-24" />;
  }

  const isDarkMode = resolvedTheme === 'dark';
  // The current color palette is the theme that doesn't include 'light' or 'dark'.
  const currentPalette = themes.find(t => theme === t.theme)?.theme || 'theme-default';

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
              // Set the base theme directly. next-themes handles combining with 'dark'
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
              {/* Check if the current theme string matches the option's theme */}
              {theme === themeOption.theme && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center space-x-2 pr-2">
        <Sun className="h-5 w-5" />
        <Switch
            id="dark-mode"
            checked={isDarkMode}
            // Simply set 'dark' or 'light'. next-themes will apply it alongside the base palette.
            onCheckedChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
            aria-label="Cambiar entre modo claro y oscuro"
        />
        <Moon className="h-5 w-5" />
      </div>
    </div>
  );
}
