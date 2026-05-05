import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'kk', label: 'Қазақша', short: 'KZ' },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export function LanguageSwitcher({ variant = 'ghost', className }: LanguageSwitcherProps) {
  const { i18n: i18nInstance } = useTranslation();
  const current = LANGUAGES.find(l => l.code === i18nInstance.language) || LANGUAGES[0];

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={`gap-1.5 px-2.5 font-medium ${className || ''}`}>
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`gap-3 cursor-pointer ${lang.code === current.code ? 'font-semibold text-primary' : ''}`}
          >
            <span className="w-7 text-xs font-mono text-muted-foreground">{lang.short}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}