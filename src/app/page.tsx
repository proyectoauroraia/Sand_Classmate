
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DuneBackground } from '@/components/icons/dunes-background';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };
  
  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <>
      <DuneBackground />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle>Themable Dune Background</CardTitle>
              <CardDescription>
                Click a button to change the color palette of the SVG background.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                 <Button onClick={() => handleThemeChange('theme-default')}>
                   Default
                 </Button>
                 <Button onClick={() => handleThemeChange('theme-rose')} style={{backgroundColor: '#E5A6B4'}}>
                   Rose
                 </Button>
                 <Button onClick={() => handleThemeChange('theme-teal')} style={{backgroundColor: '#5A9C96'}}>
                   Teal
                 </Button>
              </div>
              <div>
                <Button onClick={toggleDarkMode} variant="outline" className="w-full">
                  {resolvedTheme === 'dark' ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
                  Toggle {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
              </div>
               <div className="text-xs text-muted-foreground pt-4">
                Current theme: <span className="font-semibold text-foreground">{theme}</span> <br/>
                Resolved theme: <span className="font-semibold text-foreground">{resolvedTheme}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
