import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-sidebar-primary">Ali Baba</h3>
            <p className="text-sm text-sidebar-foreground/80">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/imbissalibaba/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">{t.footer.openingHours}</h4>
            <div className="space-y-2 text-sm text-sidebar-foreground/80">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sidebar-primary" />
                <span>{t.footer.weekdays}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sidebar-primary" />
                <span>{t.footer.weekends}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">{t.footer.contact}</h4>
            <div className="space-y-2 text-sm text-sidebar-foreground/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sidebar-primary" />
                <span>Musterstraße 123, 12345 Musterstadt</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sidebar-primary" />
                <a href="tel:+491234567890" className="hover:text-sidebar-primary">
                  +49 123 456 7890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sidebar-primary" />
                <a href="mailto:info@alibaba-doener.de" className="hover:text-sidebar-primary">
                  info@alibaba-doener.de
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm text-sidebar-foreground/80">
              <Link to="/menu" className="hover:text-sidebar-primary transition-colors">
                {t.nav.menu}
              </Link>
              <Link to="/about" className="hover:text-sidebar-primary transition-colors">
                {t.nav.about}
              </Link>
              <Link to="/orders" className="hover:text-sidebar-primary transition-colors">
                {t.nav.myOrders}
              </Link>
            </nav>
          </div>
        </div>

        <hr className="my-8 border-sidebar-border" />

        <div className="text-center text-sm text-sidebar-foreground/60">
          © {new Date().getFullYear()} Ali Baba Döner. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
