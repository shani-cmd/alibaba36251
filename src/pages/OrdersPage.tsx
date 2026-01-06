import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  order_type: string;
  created_at: string;
  delivery_time?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrdersPage = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }

    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{t.orders.title}</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">{t.orders.noOrders}</h2>
              <p className="text-muted-foreground mb-6">{t.orders.noOrdersSubtitle}</p>
              <Link to="/menu">
                <Button>Start Ordering</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display text-lg font-semibold">
                          {t.orders.orderNumber} {order.order_number}
                        </span>
                        <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                          {t.orders.statuses[order.status as keyof typeof t.orders.statuses] || order.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{order.order_type}</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        {t.common.currency}{Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Order Details */}
                  <div className="mt-4 space-y-3 border-t pt-4">
                    {order.delivery_time && (
                      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-md">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          Estimated Delivery: {order.delivery_time}
                        </span>
                      </div>
                    )}

                    {order.admin_notes && (
                      <div className="flex items-start gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
                        <MessageSquare className="h-4 w-4 mt-1" />
                        <div>
                          <span className="font-medium text-xs uppercase tracking-wider">Restaurant Note:</span>
                          <p className="text-sm">{order.admin_notes}</p>
                        </div>
                      </div>
                    )}

                    {order.status === "cancelled" && order.rejection_reason && (
                      <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4 mt-1" />
                        <div>
                          <span className="font-medium text-xs uppercase tracking-wider">Cancellation Reason:</span>
                          <p className="text-sm">{order.rejection_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
