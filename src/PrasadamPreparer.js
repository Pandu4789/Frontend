import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

const PreparerDashboard = ({ preparerId }) => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('assigned');

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/api/orders/preparer/${preparerId}`);
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/accept`);
      toast.success('Order accepted');
      fetchOrders();
    } catch {
      toast.error('Failed to accept order');
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch {
      toast.error('Failed to mark as delivered');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [preparerId]);

  const filteredOrders = orders.filter(order => {
    if (tab === 'assigned') return order.status === 'ASSIGNED' && order.assignedToUserId === preparerId;
    if (tab === 'accepted') return order.status === 'ACCEPTED' && order.assignedToUserId === preparerId;
    if (tab === 'delivered') return order.status === 'DELIVERED' && order.assignedToUserId === preparerId;
    return false;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Preparer Dashboard</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          <OrderList orders={filteredOrders} onAccept={acceptOrder} />
        </TabsContent>

        <TabsContent value="accepted">
          <OrderList orders={filteredOrders} onDeliver={markDelivered} />
        </TabsContent>

        <TabsContent value="delivered">
          <OrderList orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OrderList = ({ orders, onAccept, onDeliver }) => {
  if (orders.length === 0) return <p className="mt-4">No orders found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {orders.map(order => (
        <Card key={order.id} className="p-4 shadow-xl rounded-xl">
          <h2 className="font-semibold text-lg mb-2">Order #{order.id}</h2>
          <p><b>Customer:</b> {order.customerName}</p>
          <p><b>Address:</b> {order.deliveryAddress}</p>
          <p><b>Items:</b> {order.items?.map(item => item.name).join(', ')}</p>
          <div className="mt-4 space-x-2">
            {order.status === 'ASSIGNED' && onAccept && (
              <Button onClick={() => onAccept(order.id)}>Accept</Button>
            )}
            {order.status === 'ACCEPTED' && onDeliver && (
              <Button onClick={() => onDeliver(order.id)}>Mark as Delivered</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PreparerDashboard;
