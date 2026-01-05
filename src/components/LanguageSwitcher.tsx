import { useLanguage } from '@/i18n/LanguageContext';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase text-xs font-semibold">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-secondary' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('de')}
          className={language === 'de' ? 'bg-secondary' : ''}
        >
          🇩🇪 Deutsch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
