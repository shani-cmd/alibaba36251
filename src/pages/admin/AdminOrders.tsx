import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Eye,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

interface OrderWithItems extends Order {
  order_items?: OrderItem[];
}

const statusFlow = ["pending", "confirmed", "preparing", "ready", "delivered"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    type: "accept" | "reject" | null;
    orderId: string | null;
  }>({ isOpen: false, type: null, orderId: null });
  const [statusData, setStatusData] = useState({
    deliveryTime: "",
    adminNotes: "",
    rejectionReason: "",
  });

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order change:", payload);
          if (payload.eventType === "INSERT") {
            toast.success("New order received!", {
              description: `Order ${(payload.new as Order).order_number}`,
            });
            // Play notification sound
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => { });
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (orderId: string, type: "accept" | "reject") => {
    setStatusDialog({ isOpen: true, type, orderId });
    setStatusData({ deliveryTime: "", adminNotes: "", rejectionReason: "" });
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.orderId || !statusDialog.type) return;

    try {
      const updateData: any = {};
      let newStatus = "";

      if (statusDialog.type === "accept") {
        newStatus = "confirmed"; // Or 'preparing', flow suggests confirmed first
        updateData.status = newStatus;
        updateData.delivery_time = statusData.deliveryTime;
        updateData.admin_notes = statusData.adminNotes;

        // If they enter a time, maybe set estimated_time (mins) too? For now just text.
      } else {
        newStatus = "cancelled";
        updateData.status = newStatus;
        updateData.rejection_reason = statusData.rejectionReason;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", statusDialog.orderId);

      if (error) throw error;

      toast.success(`Order ${newStatus} successfully`);
      setStatusDialog({ isOpen: false, type: null, orderId: null });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "preparing":
        return <ChefHat className="h-4 w-4" />;
      case "ready":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning border-warning/30";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "preparing":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "ready":
        return "bg-success/20 text-success border-success/30";
      case "delivered":
        return "bg-success/20 text-success border-success/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("de-DE"),
      time: date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Order Management
        </h2>
        <p className="text-muted-foreground">
          Manage incoming orders in real-time
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order) => {
                const { date, time } = formatDateTime(order.created_at);
                const nextStatus = getNextStatus(order.status);
                return (
                  <Card
                    key={order.id}
                    className={`border-2 ${order.status === "pending"
                        ? "border-warning animate-pulse"
                        : "border-border"
                      }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {order.order_number}
                        </CardTitle>
                        <Badge
                          className={`${getStatusColor(order.status)} flex items-center gap-1`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {date} at {time}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_type === "delivery" ? "🚗 Delivery" : "🏪 Pickup"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="font-bold text-lg">
                          €{Number(order.total).toFixed(2)}
                        </span>
                        <Badge variant="outline">
                          {order.payment_method === "cash" ? "💵 Cash" : "💳 Card"}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {nextStatus === "confirmed" ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => openStatusDialog(order.id, "accept")}
                          >
                            Accept Order
                          </Button>
                        ) : nextStatus ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                          >
                            Mark {nextStatus}
                          </Button>
                        ) : null}
                      </div>

                      {order.status === "pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => openStatusDialog(order.id, "reject")}
                        >
                          Reject Order
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed orders yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedOrders.slice(0, 20).map((order) => {
                const { date, time } = formatDateTime(order.created_at);
                return (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">
                            €{Number(order.total).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date} {time}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order {selectedOrder?.order_number}
              <Badge className={getStatusColor(selectedOrder?.status || "")}>
                {selectedOrder?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">
                        {selectedOrder.customer_name}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedOrder.customer_email}
                    </p>
                    {selectedOrder.customer_phone && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.customer_phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                {selectedOrder.order_type === "delivery" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>
                        {selectedOrder.delivery_address}
                        <br />
                        {selectedOrder.delivery_postal_code}{" "}
                        {selectedOrder.delivery_city}
                      </span>
                    </p>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {item.quantity}x {item.product_name}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">
                          €{Number(item.total_price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Order Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>€{Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  {selectedOrder.delivery_fee && Number(selectedOrder.delivery_fee) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>
                        €{Number(selectedOrder.delivery_fee).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>€{Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.isOpen}
        onOpenChange={(open) => !open && setStatusDialog({ ...statusDialog, isOpen: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusDialog.type === "accept" ? "Accept Order" : "Reject Order"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {statusDialog.type === "accept" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Delivery Time</label>
                  <input
                    type="time"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={statusData.deliveryTime}
                    onChange={(e) => setStatusData({ ...statusData, deliveryTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes (Optional)</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Any notes for the customer..."
                    value={statusData.adminNotes}
                    onChange={(e) => setStatusData({ ...statusData, adminNotes: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Rejection</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Why are you rejecting this order?"
                  value={statusData.rejectionReason}
                  onChange={(e) => setStatusData({ ...statusData, rejectionReason: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusDialog({ ...statusDialog, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant={statusDialog.type === "accept" ? "default" : "destructive"}
              onClick={handleStatusUpdate}
            >
              {statusDialog.type === "accept" ? "Confirm Accept" : "Confirm Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
