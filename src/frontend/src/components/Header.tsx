import { Moon, Sun, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Page = 'dashboard' | 'subjects' | 'timer' | 'analytics' | 'goals';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { setTheme } = useTheme();

  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'ڈیش بورڈ' },
    { id: 'timer', label: 'ٹائمر' },
    { id: 'subjects', label: 'مضامین' },
    { id: 'analytics', label: 'تجزیات' },
    { id: 'goals', label: 'اہداف' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">مطالعہ ٹریکر</h1>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              onClick={() => onNavigate(item.id)}
              className="font-medium"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                روشن
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                تاریک
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                سسٹم
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <BookOpen className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={currentPage === item.id ? 'bg-accent' : ''}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
