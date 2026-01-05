import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  order_type: string;
  status: string;
  total: number;
  estimated_time: number | null;
  created_at: string;
}

const OrderConfirmationPage = () => {
  const { t } = useLanguage();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (data) setOrder(data);
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Order not found</h2>
          <Link to="/menu">
            <Button>Back to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display text-3xl font-bold text-success">Order Confirmed!</h1>
              <p className="text-muted-foreground mt-2">
                Thank you, {order.customer_name}! Your order has been placed.
              </p>
            </div>

            {/* Order Number */}
            <div className="inline-block px-4 py-2 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Order Number:</span>
              <p className="text-xl font-bold text-primary">{order.order_number}</p>
            </div>

            {/* Order Details */}
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Order Type</span>
                </div>
                <p className="text-muted-foreground capitalize">{order.order_type}</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Estimated Time</span>
                </div>
                <p className="text-muted-foreground">{order.estimated_time} minutes</p>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">{t.cart.total}</span>
                <span className="font-bold text-primary text-2xl">
                  {t.common.currency}{Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/orders" className="flex-1">
                <Button variant="outline" className="w-full">
                  {t.orders.trackOrder}
                </Button>
              </Link>
              <Link to="/menu" className="flex-1">
                <Button className="w-full">
                  Order More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
