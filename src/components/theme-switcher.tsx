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
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { name: 'Default', theme: 'theme-default', color: 'hsl(76 34% 50%)' },
  { name: 'Navy', theme: 'theme-navy', color: 'hsl(215 41% 45%)' },
  { name: 'Forest', theme: 'theme-forest', color: 'hsl(120 39% 40%)' },
  { name: 'Dusk', theme: 'theme-dusk', color: 'hsl(250 50% 60%)' },
  { name: 'Sunrise', theme: 'theme-sunrise', color: 'hsl(20 90% 60%)' },
];

export function ThemeSwitcher() {
  const { theme: activeTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setTheme(theme.theme)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: theme.color }}
              />
              <span>{theme.name}</span>
            </div>
            {activeTheme === theme.theme && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
