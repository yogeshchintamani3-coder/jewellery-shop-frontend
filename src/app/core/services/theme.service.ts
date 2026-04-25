import { Injectable, signal } from '@angular/core';

interface ThemeVars {
  [key: string]: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly currentThemeState = signal<'light' | 'dark'>('light');
  readonly currentTheme = this.currentThemeState.asReadonly();

  private readonly lightTheme: ThemeVars = {
    '--color-primary': '#B76E79',
    '--color-primary-dark': '#9A5561',
    '--color-primary-light': '#F2D9DC',
    '--color-bg': '#FAFAFA',
    '--color-bg-secondary': '#F5F0EE',
    '--color-bg-card': '#FFFFFF',
    '--color-text': '#1B1B2F',
    '--color-text-secondary': '#4A4A5A',
    '--color-text-muted': '#8E8E9E',
    '--color-border': '#E5DDD8',
    '--color-accent': '#A0425C',
    '--color-success': '#2D9D6A',
    '--color-error': '#D94452',
    '--color-warning': '#E6914E',
    '--shadow-sm': '0 1px 4px rgba(27,27,47,0.06)',
    '--shadow-md': '0 4px 16px rgba(27,27,47,0.08)',
    '--shadow-lg': '0 12px 32px rgba(27,27,47,0.12)',
    '--radius-sm': '6px',
    '--radius-md': '12px',
    '--radius-lg': '20px',
    '--font-primary': "'Playfair Display', serif",
    '--font-body': "'Inter', sans-serif",
  };

  private readonly darkTheme: ThemeVars = {
    ...this.lightTheme,
    '--color-primary': '#D4919A',
    '--color-primary-dark': '#B76E79',
    '--color-primary-light': '#3D2A2E',
    '--color-bg': '#0F0F1A',
    '--color-bg-secondary': '#171726',
    '--color-bg-card': '#1E1E30',
    '--color-text': '#EAEAF0',
    '--color-text-secondary': '#B0B0C0',
    '--color-text-muted': '#6A6A80',
    '--color-border': '#2A2A40',
    '--color-accent': '#E87C93',
    '--shadow-sm': '0 1px 4px rgba(0,0,0,0.3)',
    '--shadow-md': '0 4px 16px rgba(0,0,0,0.4)',
    '--shadow-lg': '0 12px 32px rgba(0,0,0,0.5)',
  };

  constructor() {
    const stored = localStorage.getItem('jc_theme');
    if (stored === 'dark') {
      this.setTheme('dark');
    } else {
      this.applyTheme(this.lightTheme);
    }
  }

  toggleTheme(): void {
    const next = this.currentThemeState() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  private setTheme(theme: 'light' | 'dark'): void {
    this.currentThemeState.set(theme);
    localStorage.setItem('jc_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.applyTheme(theme === 'dark' ? this.darkTheme : this.lightTheme);
  }

  private applyTheme(vars: ThemeVars): void {
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}
