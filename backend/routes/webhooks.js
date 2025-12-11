/**
 * MAGNUS Webhook Routes
 * Handles incoming webhooks from WooCommerce and serves order data to frontend
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory storage (replace with database in production)
// TODO: Replace with PostgreSQL/MongoDB
let orders = [];

/**
 * Verify webhook signature from WordPress
 */


ffunction verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.WORDPRESS_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('[Webhook] WORDPRESS_WEBHOOK_SECRET not configured!');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)  // ← Use raw body string
    .digest('hex');
  
  return signature === expectedSignature;
}


/**
 * POST /api/webhooks/woocommerce-order
 * Receive new orders from WordPress/WooCommerce
 */
router.post('/woocommerce-order', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody || JSON.stringify(req.body); // Fallback
    const payload = req.body;
    
    console.log('[Webhook] Received WooCommerce order:', {
      orderId: payload.order?.orderId,
      orderNumber: payload.order?.orderNumber,
      timestamp,
    });
    
    // Verify signature using raw body
    if (!verifyWebhookSignature(rawBody, signature)) {  // ← Use rawBody
    
    // Verify timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - webhookTime);
    
    if (timeDiff > 300) { // 5 minutes
      console.error('[Webhook] Timestamp too old:', timeDiff, 'seconds');
      return res.status(401).json({
        error: 'Timestamp expired',
        message: 'Webhook timestamp is too old (replay attack prevention)'
      });
    }
    
    // Transform WordPress payload to internal format
    const order = {
      id: payload.order.orderId,
      orderNumber: payload.order.orderNumber,
      source: 'website',
      status: 'new', // new, processing, completed, cancelled
      createdAt: payload.order.orderDate,
      
      customer: {
        firstName: payload.customer.firstName,
        lastName: payload.customer.lastName,
        email: payload.customer.email,
        phone: payload.customer.phone,
        idPassport: payload.customer.idPassport,
        dateOfBirth: payload.customer.dateOfBirth,
        gender: payload.customer.gender,
        address: payload.customer.address,
        emergencyContacts: payload.customer.emergencyContacts?.map(contact => ({
          name: `${contact.firstName} ${contact.lastName}`,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email,
        })) || [],
      },
      
      rental: {
        startDate: payload.rental.startDate,
        endDate: payload.rental.endDate,
        duration: payload.rental.duration,
        deviceCount: payload.rental.deviceCount,
        travelDestination: payload.rental.travelDestination,
        estimatedAmount: payload.payment.total,
      },
      
      payment: {
        method: payload.payment.method,
        status: payload.payment.status,
        amount: payload.payment.total,
        currency: payload.payment.currency,
        paidDate: payload.payment.paidDate,
      },
      
      metadata: payload.metadata || {},
      rawPayload: payload, // Store original for debugging
    };
    
    // Check for duplicate
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      // Update existing
      orders[existingIndex] = order;
      console.log('[Webhook] Updated existing order:', order.id);
    } else {
      // Add new
      orders.push(order);
      console.log('[Webhook] Stored new order:', order.id);
    }
    
    // TODO: Store in database
    // await db.orders.create(order);
    
    // TODO: Send notification to frontend via WebSocket
    // io.emit('new-order', order);
    
    res.status(200).json({
      success: true,
      message: 'Order received successfully',
      orderId: order.id,
    });
    
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process webhook'
    });
  }
});

/**
 * GET /api/webhooks/orders
 * Get all orders (with optional status filter)
 */
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    
    // TODO: Fetch from database
    // const orders = await db.orders.findAll({ where: { status } });
    
    let filteredOrders = orders;
    
    if (status) {
      filteredOrders = orders.filter(o => o.status === status);
    }
    
    // Sort by created date (newest first)
    filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log('[Webhook] GET /orders - Returning', filteredOrders.length, 'orders');
    
    res.json(filteredOrders);
    
  } catch (error) {
    console.error('[Webhook] Error fetching orders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * GET /api/webhooks/orders/:orderId
 * Get a specific order by ID
 */
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // TODO: Fetch from database
    // const order = await db.orders.findOne({ where: { id: orderId } });
    
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: `Order ${orderId} does not exist`
      });
    }
    
    console.log('[Webhook] GET /orders/:orderId - Returning order:', orderId);
    
    res.json(order);
    
  } catch (error) {
    console.error('[Webhook] Error fetching order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
});

/**
 * PATCH /api/webhooks/orders/:orderId
 * Update order status (when CS rep starts processing or completes)
 */
router.patch('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, rentalId } = req.body;
    
    // TODO: Update in database
    // await db.orders.update({ status, rentalId }, { where: { id: orderId } });
    
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: `Order ${orderId} does not exist`
      });
    }
    
    // Update order
    order.status = status;
    if (rentalId) {
      order.rentalId = rentalId;
    }
    order.updatedAt = new Date().toISOString();
    
    console.log('[Webhook] Updated order:', orderId, 'to status:', status);
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
    
  } catch (error) {
    console.error('[Webhook] Error updating order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update order'
    });
  }
});

/**
 * DELETE /api/webhooks/orders/:orderId
 * Delete/cancel an order
 */
router.delete('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // TODO: Soft delete in database
    // await db.orders.update({ status: 'cancelled', cancelReason: reason }, { where: { id: orderId } });
    
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Order not found',
        message: `Order ${orderId} does not exist`
      });
    }
    
    // Mark as cancelled instead of deleting
    orders[index].status = 'cancelled';
    orders[index].cancelReason = reason;
    orders[index].cancelledAt = new Date().toISOString();
    
    console.log('[Webhook] Cancelled order:', orderId, 'Reason:', reason);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
    
  } catch (error) {
    console.error('[Webhook] Error deleting order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete order'
    });
  }
});

/**
 * GET /api/webhooks/stats
 * Get webhook statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // TODO: Calculate from database
    
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      last24Hours: orders.filter(o => 
        new Date(o.createdAt).getTime() > last24Hours
      ).length,
      last7Days: orders.filter(o => 
        new Date(o.createdAt).getTime() > last7Days
      ).length,
    };
    
    console.log('[Webhook] GET /stats - Returning stats');
    
    res.json(stats);
    
  } catch (error) {
    console.error('[Webhook] Error fetching stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch stats'
    });
  }
});

/**
 * GET /api/webhooks/test
 * Test endpoint connectivity
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    endpoint: '/api/webhooks',
    configured: !!process.env.WORDPRESS_WEBHOOK_SECRET,
    message: 'Webhook endpoint is operational'
  });
});

module.exports = router;
