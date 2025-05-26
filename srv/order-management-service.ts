import cds, { update } from "@sap/cds";
const { SELECT, UPDATE } = cds.ql;
import { Request } from "@sap/cds";
export default async function (srv) {
  const { Orders, Products, Customers, OrderItems } = srv.entities;
  const i18n =  cds.i18n.labels
  srv.before("CREATE", Products, async (req: Request) => {
    if (!req.data.name || !req.data.price || !req.data.stockQuantity) {
      req.error(
        400, i18n.at('product.required')
      );
      return;
    }
    const existingProduct = await srv
      .tx(req)
      .run(SELECT.one.from(Products).where({ name: req.data.name }));
    if (existingProduct) {
      req.error(400, i18n.at('product.exists', [req.data.name ]));
      return;
    }
  });

  srv.before("CREATE", Customers, async (req: Request) => {
    if (!req.data.firstName || !req.data.email || !req.data.lastName) {
      req.error(400, i18n.at('customer.required'));
      return;
    }
    const existingCustomer = await srv
      .tx(req)
      .run(SELECT.one.from(Customers).where({ email: req.data.email }));
    if (existingCustomer) {
      req.error(400, i18n.at('customer.exists', [req.data.email]));
      return;
    }
  });

  srv.before("CREATE", Orders, async (req: Request) => {
    if (!req.data.customer_ID) {
      req.error(400, i18n.at('order.customer.required'));
      return;
    }

    const customer = await srv
      .tx(req)
      .run(SELECT.one.from(Customers).where({ ID: req.data.customer_ID }));

    if (!customer) {
      req.error(404, i18n.at('order.customer.notfound', [req.data.customer_ID]));
      return;
    }

    if (
      !req.data.items ||
      !Array.isArray(req.data.items) ||
      req.data.items.length === 0
    ) {
      req.error(400, i18n.at('order.items.required'));
      return;
    }

    let totalOrderAmount = 0;
    const processedItems = [];

    try {
      const productPromises = req.data.items.map(async (orderItem: any) => {
        if (!orderItem.product_ID || !orderItem.quantity) {
          throw new Error(
            i18n.at('order.item.details.required')
          );
        }

        const product = await srv
          .tx(req)
          .run(SELECT.one.from(Products).where({ ID: orderItem.product_ID }));

        if (!product) {
          throw new Error(i18n.at('order.product.notfound', [orderItem.product_ID]));
        }

        if (product.stockQuantity < orderItem.quantity) {
          throw new Error(
            i18n.at('order.insufficient.stock', {
              product: product.name,
              requested: orderItem.quantity,
              available: product.stockQuantity,
            })
          );
        }

        const itemTotalPrice = product.price * orderItem.quantity;
        totalOrderAmount += itemTotalPrice;

        return {
          original: orderItem,
          product: product,
          unitPrice: product.price,
          totalPrice: itemTotalPrice,
        };
      });

      const validatedItems = await Promise.all(productPromises);

      for (const item of validatedItems) {
        await srv.tx(req).run(
          UPDATE.entity(Products)
            .where({ ID: item.original.product_ID })
            .set({
              stockQuantity: { "-=": item.original.quantity },
            })
        );

        item.original.unitPrice = item.unitPrice;
        item.original.totalPrice = item.totalPrice;
      }

      req.data.totalAmount = totalOrderAmount;
    } catch (error) {
      req.error(400, error.message);
      return;
    }
  });

  srv.before("UPDATE", Orders, async (req: Request) => {
    if (req.data.items && req.data.items.length === 0) {
      req.error(400, i18n.at('update.order.without.items'));
      return;
    }
    for (let key in req.data) {
      if (
        req.data[key] === null ||
        req.data[key] === undefined ||
        req.data[key] === ""
      ) {
        req.error(400, i18n.at('update.null.error', [key]));
        return;
      }
    }

    if (req.data.items) {
      let totalOrderAmount = 0;
      try {
       const product = await srv.tx(req).run(
        SELECT.one.from(Products).where({ ID: req.data.items[0].product_ID })
       ) 
       if(!product){
        throw new Error(i18n.at('order.product.notfound', [req.data.items[0].product_ID]));
       }
        if(product.stockQuantity < req.data.items[0].quantity){
          throw new Error(i18n.at('update.insufficient.stock', [
            product.name,
            req.data.items[0].quantity,
            product.stockQuantity,
          ]));
        }
        const itemTotalPrice = product.price * req.data.items[0].quantity;
        totalOrderAmount = itemTotalPrice;
        
        await srv.tx(req).run(
          UPDATE.entity(Products)
            .where({ ID: req.data.items[0].product_ID })
            .set({
              stockQuantity: { "-=": req.data.items[0].quantity },
            })
        );
        req.data.items[0].unitPrice = product.price;
        req.data.items[0].totalPrice = itemTotalPrice;
        req.data.totalAmount = totalOrderAmount;
      } catch (error) {
        req.error(400, error.message);
        return;
      }
    }
  });

//   srv.on("EditProduct", async (req: Request)=> {
//      const productId = req.params[0]; // Get ID from the bound entity
//     try {
//       // Check if product is used in any orders
//       const orderItems = await SELECT.from(OrderItems).where({ product_ID: productId });
//       if (orderItems.length > 0) {
//         req.error(400, 'Cannot delete product that is used in existing orders');
//       }
      
//       await DELETE.from(Products).where({ ID: productId });
//       return 'Product deleted successfully';
//     } catch (error) {
//       req.error(500, `Error deleting product: ${error.message}`);
//     }
//   })
//   srv.on("DeleteProduct", async (req: Request) => {
//      const { productId } = req.data;
//     try {
//       const result = await DELETE.from(Products).where({ ID: productId });
//       if (result === 0) {
//         req.error(404, `Product with ID ${productId} not found`);
//       }
//       return true;
//     } catch (error) {
//       req.error(500, `Error deleting product: ${error.message}`);
//     }
//   })
//   srv.on("EditCustomer", async (req: Request) => {
//     const { customerId } = req.data;
//     try {
//       const customer = await SELECT.one.from(Customers).where({ ID: customerId });
//       if (!customer) {
//         req.error(404, `Customer with ID ${customerId} not found`);
//       }
//       return customer;
//     } catch (error) {
//       req.error(500, `Error editing customer: ${error.message}`);
//     }
//   })

//   srv.on("DeleteCustomer", async (req: Request) => {
//     const { customerId } = req.data;
//     try {
//       // Check if customer has orders
//       const orders = await SELECT.from(Orders).where({ customer_ID: customerId });
//       if (orders.length > 0) {
//         req.error(400, 'Cannot delete customer with existing orders');
//       }
      
//       const result = await DELETE.from(Customers).where({ ID: customerId });
//       if (result === 0) {
//         req.error(404, `Customer with ID ${customerId} not found`);
//       }
//       return true;
//     } catch (error) {
//       req.error(500, `Error deleting customer: ${error.message}`);
//     }
//   })
// srv.on("CreateCustomer", async (req:Request)=> {
//     const { firstName, lastName, email, phone, address, city, postalCode, country } = req.data;
//     try {
//       if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode || !country) {
//         req.error(400, 'All fields are required');
//       }
      
//       const existingCustomer = await SELECT.one.from(Customers).where({ email });
//       if (existingCustomer) {
//         req.error(400, `Customer with email ${email} already exists`);
//       }
      
//       const newCustomer = {
//         ID: cds.utils.uuid(),
//         firstName,
//         lastName,
//         email,
//         phone,
//         address,
//         city,
//         postalCode,
//         country
//       };

//       await INSERT.into(Customers).entries(newCustomer);
//       return await SELECT.one.from(Customers).where({ ID: newCustomer.ID });
//     } catch (error) {
//       req.error(500, `Error creating customer: ${error.message}`);
//     }
// })
//   srv.on("CreateOrder", async (req:Request)=> {
//     const { customerId } = req.data;
//     try {
//       const customer = await SELECT.one.from(Customers).where({ ID: customerId });
//       if (!customer) {
//         req.error(404, `Customer with ID ${customerId} not found`);
//       }
      
//       const newOrder = {
//         ID: cds.utils.uuid(),
//         customer_ID: customerId,
//         orderDate: new Date().toISOString().split('T')[0],
//         status: 'Pending',
//         totalAmount: 0,
//         notes: ''
//       };
      
//       await INSERT.into(Orders).entries(newOrder);
//       return await SELECT.one.from(Orders).where({ ID: newOrder.ID });
//     } catch (error) {
//       req.error(500, `Error creating order: ${error.message}`);
//     }
//   })
//   srv.on("EditOrder", async(req:Request)=> {
//      const { orderId } = req.data;
//     try {
//       const order = await SELECT.one.from(Orders).where({ ID: orderId });
//       if (!order) {
//         req.error(404, `Order with ID ${orderId} not found`);
//       }
//       return order;
//     } catch (error) {
//       req.error(500, `Error editing order: ${error.message}`);
//     }
//   })

//   srv.on("DeleteOrder", async (req: Request) => {
//     const { orderId } = req.data;
//     try {
//       // Delete order items first
//       await DELETE.from(OrderItems).where({ order_ID: orderId });
      
//       // Then delete the order
//       const result = await DELETE.from(Orders).where({ ID: orderId });
//       if (result === 0) {
//         req.error(404, `Order with ID ${orderId} not found`);
//       }
//       return true;
//     } catch (error) {
//       req.error(500, `Error deleting order: ${error.message}`);
//     }
//   })

//   srv.on("DeleteOrderItem", async (req: Request) => {
//     const { itemId } = req.data;
//     try {
//       const item = await SELECT.one.from(OrderItems).where({ ID: itemId });
//       if (!item) {
//         req.error(404, `Order item with ID ${itemId} not found`);
//       }

//       // Delete the item
//       await DELETE.from(OrderItems).where({ ID: itemId });

//       // Recalculate order total
//       const orderItems = await SELECT.from(OrderItems).where({ order_ID: item.order_ID });
//       const totalAmount = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
//       await UPDATE.entity(Orders).set({ totalAmount }).where({ ID: item.order_ID });
      
//       return true;
//     } catch (error) {
//       req.error(500, `Error deleting order item: ${error.message}`);
//     }
//   })
  
//==========================


  // Bound action handlers - these work with the selected entity context
  srv.on('deleteProduct', Products, async (req) => {
    const productId = req.params[0]; // Get ID from the bound entity
    try {
      // Check if product is used in any orders
      const orderItems = await SELECT.from(OrderItems).where({ product_ID: productId });
      if (orderItems.length > 0) {
        req.error(400, 'Cannot delete product that is used in existing orders');
      }
      
      await DELETE.from(Products).where({ ID: productId });
      return 'Product deleted successfully';
    } catch (error) {
      req.error(500, `Error deleting product: ${error.message}`);
    }
  });

  srv.on('deleteCustomer', Customers, async (req) => {
    const customerId = req.params[0];
    try {
      // Check if customer has orders
      const orders = await SELECT.from(Orders).where({ customer_ID: customerId });
      if (orders.length > 0) {
        req.error(400, 'Cannot delete customer with existing orders');
      }
      
      await DELETE.from(Customers).where({ ID: customerId });
      return 'Customer deleted successfully';
    } catch (error) {
      req.error(500, `Error deleting customer: ${error.message}`);
    }
  });

  srv.on('createOrderForCustomer', Customers, async (req) => {
    const customerId = req.params[0];
    try {
      const customer = await SELECT.one.from(Customers).where({ ID: customerId });
      if (!customer) {
        req.error(404, `Customer not found`);
      }
      
      const newOrder = {
        ID: cds.utils.uuid(),
        customer_ID: customerId,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        totalAmount: 0,
        notes: ''
      };
      
      await INSERT.into(Orders).entries(newOrder);
      return await SELECT.one.from(Orders).where({ ID: newOrder.ID });
    } catch (error) {
      req.error(500, `Error creating order: ${error.message}`);
    }
  });

  srv.on('deleteOrder', Orders, async (req) => {
    const orderId = req.params[0];
    try {
      // Delete order items first
      await DELETE.from(OrderItems).where({ order_ID: orderId });
      
      // Then delete the order
      await DELETE.from(Orders).where({ ID: orderId });
      return 'Order deleted successfully';
    } catch (error) {
      req.error(500, `Error deleting order: ${error.message}`);
    }
  });

  srv.on('deleteOrderItem', OrderItems, async (req) => {
    const itemId = req.params[0];
    try {
      const item = await SELECT.one.from(OrderItems).where({ ID: itemId });
      if (!item) {
        req.error(404, `Order item not found`);
      }

      // Delete the item
      await DELETE.from(OrderItems).where({ ID: itemId });

      // Recalculate order total
      const orderItems = await SELECT.from(OrderItems).where({ order_ID: item.order_ID });
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      await UPDATE.entity(Orders).set({ totalAmount }).where({ ID: item.order_ID });
      
      return 'Order item deleted successfully';
    } catch (error) {
      req.error(500, `Error deleting order item: ${error.message}`);
    }
  });

  // Unbound action for creating new orders
  srv.on('createNewOrder', async (req) => {
    try {
      const newOrder = {
        ID: cds.utils.uuid(),
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        totalAmount: 0,
        notes: ''
      };
      
      await INSERT.into(Orders).entries(newOrder);
      return await SELECT.one.from(Orders).where({ ID: newOrder.ID });
    } catch (error) {
      req.error(500, `Error creating order: ${error.message}`);
    }
  });

  // Event handlers for automatic calculations
  srv.before('CREATE', OrderItems, async (req) => {
    const { quantity, unitPrice } = req.data;
    req.data.totalPrice = quantity * unitPrice;
  });

  srv.before('UPDATE', OrderItems, async (req) => {
    if (req.data.quantity !== undefined || req.data.unitPrice !== undefined) {
      const existing = await SELECT.one.from(OrderItems).where({ ID: req.data.ID });
      const quantity = req.data.quantity !== undefined ? req.data.quantity : existing.quantity;
      const unitPrice = req.data.unitPrice !== undefined ? req.data.unitPrice : existing.unitPrice;
      req.data.totalPrice = quantity * unitPrice;
    }
  });

  srv.after(['CREATE', 'UPDATE', 'DELETE'], OrderItems, async (_, req) => {
    const orderId = req.data.order_ID;
    if (orderId) {
      const orderItems = await SELECT.from(OrderItems).where({ order_ID: orderId });
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      await UPDATE.entity(Orders).set({ totalAmount }).where({ ID: orderId });
    }
  });
};

