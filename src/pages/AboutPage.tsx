import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Utensils } from 'lucide-react';

const AboutPage = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t.about.quality,
      description: t.about.qualityDesc,
    },
    {
      icon: Utensils,
      title: t.about.tradition,
      description: t.about.traditionDesc,
    },
    {
      icon: Heart,
      title: t.about.love,
      description: t.about.loveDesc,
    },
  ];

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{t.about.title}</h1>
          <p className="text-xl text-muted-foreground">{t.about.subtitle}</p>
        </div>

        {/* Story */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-2xl font-bold mb-4 text-primary">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.about.story}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our mission is simple: to bring you the most authentic, delicious döner kebab 
                  experience possible. Every day, we prepare our meat fresh, slice our vegetables 
                  by hand, and bake our bread to perfection.
                </p>
              </div>
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Utensils className="h-24 w-24 mx-auto text-primary mb-4" />
                  <p className="font-display text-2xl font-bold text-primary">Since 2010</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Location */}
        <Card className="mt-12">
          <CardContent className="p-8">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">Visit Us</h2>
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Musterstraße 123</p>
                <p className="text-muted-foreground mb-2">12345 Musterstadt</p>
                <p className="text-primary font-medium">+49 123 456 7890</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
