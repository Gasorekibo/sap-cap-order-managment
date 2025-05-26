"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const cds_1 = __importDefault(require("@sap/cds"));
const { SELECT, UPDATE } = cds_1.default.ql;
async function default_1(srv) {
    const { Orders, Products, Customers, OrderItems } = srv.entities;
    const i18n = cds_1.default.i18n.labels;
    srv.before("CREATE", Products, async (req) => {
        if (!req.data.name || !req.data.price || !req.data.stockQuantity) {
            req.error(400, i18n.at('product.required'));
            return;
        }
        const existingProduct = await srv
            .tx(req)
            .run(SELECT.one.from(Products).where({ name: req.data.name }));
        if (existingProduct) {
            req.error(400, i18n.at('product.exists', [req.data.name]));
            return;
        }
    });
    srv.before("CREATE", Customers, async (req) => {
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
    srv.before("CREATE", Orders, async (req) => {
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
        if (!req.data.items ||
            !Array.isArray(req.data.items) ||
            req.data.items.length === 0) {
            req.error(400, i18n.at('order.items.required'));
            return;
        }
        let totalOrderAmount = 0;
        const processedItems = [];
        try {
            const productPromises = req.data.items.map(async (orderItem) => {
                if (!orderItem.product_ID || !orderItem.quantity) {
                    throw new Error(i18n.at('order.item.details.required'));
                }
                const product = await srv
                    .tx(req)
                    .run(SELECT.one.from(Products).where({ ID: orderItem.product_ID }));
                if (!product) {
                    throw new Error(i18n.at('order.product.notfound', [orderItem.product_ID]));
                }
                if (product.stockQuantity < orderItem.quantity) {
                    throw new Error(i18n.at('order.insufficient.stock', {
                        product: product.name,
                        requested: orderItem.quantity,
                        available: product.stockQuantity,
                    }));
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
                await srv.tx(req).run(UPDATE.entity(Products)
                    .where({ ID: item.original.product_ID })
                    .set({
                    stockQuantity: { "-=": item.original.quantity },
                }));
                item.original.unitPrice = item.unitPrice;
                item.original.totalPrice = item.totalPrice;
            }
            req.data.totalAmount = totalOrderAmount;
        }
        catch (error) {
            req.error(400, error.message);
            return;
        }
    });
    srv.before("UPDATE", Orders, async (req) => {
        if (req.data.items && req.data.items.length === 0) {
            req.error(400, i18n.at('update.order.without.items'));
            return;
        }
        for (let key in req.data) {
            if (req.data[key] === null ||
                req.data[key] === undefined ||
                req.data[key] === "") {
                req.error(400, i18n.at('update.null.error', [key]));
                return;
            }
        }
        if (req.data.items) {
            let totalOrderAmount = 0;
            try {
                const product = await srv.tx(req).run(SELECT.one.from(Products).where({ ID: req.data.items[0].product_ID }));
                if (!product) {
                    throw new Error(i18n.at('order.product.notfound', [req.data.items[0].product_ID]));
                }
                if (product.stockQuantity < req.data.items[0].quantity) {
                    throw new Error(i18n.at('update.insufficient.stock', [
                        product.name,
                        req.data.items[0].quantity,
                        product.stockQuantity,
                    ]));
                }
                const itemTotalPrice = product.price * req.data.items[0].quantity;
                totalOrderAmount = itemTotalPrice;
                await srv.tx(req).run(UPDATE.entity(Products)
                    .where({ ID: req.data.items[0].product_ID })
                    .set({
                    stockQuantity: { "-=": req.data.items[0].quantity },
                }));
                req.data.items[0].unitPrice = product.price;
                req.data.items[0].totalPrice = itemTotalPrice;
                req.data.totalAmount = totalOrderAmount;
            }
            catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
                ID: cds_1.default.utils.uuid(),
                customer_ID: customerId,
                orderDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                totalAmount: 0,
                notes: ''
            };
            await INSERT.into(Orders).entries(newOrder);
            return await SELECT.one.from(Orders).where({ ID: newOrder.ID });
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            req.error(500, `Error deleting order item: ${error.message}`);
        }
    });
    // Unbound action for creating new orders
    srv.on('createNewOrder', async (req) => {
        try {
            const newOrder = {
                ID: cds_1.default.utils.uuid(),
                orderDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                totalAmount: 0,
                notes: ''
            };
            await INSERT.into(Orders).entries(newOrder);
            return await SELECT.one.from(Orders).where({ ID: newOrder.ID });
        }
        catch (error) {
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
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItbWFuYWdlbWVudC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3JkZXItbWFuYWdlbWVudC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsNEJBeWRDO0FBNWRELG1EQUF1QztBQUN2QyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLGFBQUcsQ0FBQyxFQUFFLENBQUM7QUFFbkIsS0FBSyxvQkFBVyxHQUFHO0lBQ2hDLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO0lBQ2pFLE1BQU0sSUFBSSxHQUFJLGFBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQzdCLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBWSxFQUFFLEVBQUU7UUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pFLEdBQUcsQ0FBQyxLQUFLLENBQ1AsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FDakMsQ0FBQztZQUNGLE9BQU87UUFDVCxDQUFDO1FBQ0QsTUFBTSxlQUFlLEdBQUcsTUFBTSxHQUFHO2FBQzlCLEVBQUUsQ0FBQyxHQUFHLENBQUM7YUFDUCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsR0FBRyxDQUFDLEtBQUss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LENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCw0Q0FBNEM7SUFDNUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUM3QyxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQztJQUM3QyxDQUFDLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDN0MsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDeEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDekYsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUM3RixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQzdDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3JFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2xDLElBQUksT0FBTyxFQUFFLENBQUM7WUFDWixNQUFNLFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDOUUsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDMUUsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2RzLCB7IHVwZGF0ZSB9IGZyb20gXCJAc2FwL2Nkc1wiO1xyXG5jb25zdCB7IFNFTEVDVCwgVVBEQVRFIH0gPSBjZHMucWw7XHJcbmltcG9ydCB7IFJlcXVlc3QgfSBmcm9tIFwiQHNhcC9jZHNcIjtcclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKHNydikge1xyXG4gIGNvbnN0IHsgT3JkZXJzLCBQcm9kdWN0cywgQ3VzdG9tZXJzLCBPcmRlckl0ZW1zIH0gPSBzcnYuZW50aXRpZXM7XHJcbiAgY29uc3QgaTE4biA9ICBjZHMuaTE4bi5sYWJlbHNcclxuICBzcnYuYmVmb3JlKFwiQ1JFQVRFXCIsIFByb2R1Y3RzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbiAgICBpZiAoIXJlcS5kYXRhLm5hbWUgfHwgIXJlcS5kYXRhLnByaWNlIHx8ICFyZXEuZGF0YS5zdG9ja1F1YW50aXR5KSB7XHJcbiAgICAgIHJlcS5lcnJvcihcclxuICAgICAgICA0MDAsIGkxOG4uYXQoJ3Byb2R1Y3QucmVxdWlyZWQnKVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBleGlzdGluZ1Byb2R1Y3QgPSBhd2FpdCBzcnZcclxuICAgICAgLnR4KHJlcSlcclxuICAgICAgLnJ1bihTRUxFQ1Qub25lLmZyb20oUHJvZHVjdHMpLndoZXJlKHsgbmFtZTogcmVxLmRhdGEubmFtZSB9KSk7XHJcbiAgICBpZiAoZXhpc3RpbmdQcm9kdWN0KSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ3Byb2R1Y3QuZXhpc3RzJywgW3JlcS5kYXRhLm5hbWUgXSkpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHNydi5iZWZvcmUoXCJDUkVBVEVcIiwgQ3VzdG9tZXJzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbiAgICBpZiAoIXJlcS5kYXRhLmZpcnN0TmFtZSB8fCAhcmVxLmRhdGEuZW1haWwgfHwgIXJlcS5kYXRhLmxhc3ROYW1lKSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ2N1c3RvbWVyLnJlcXVpcmVkJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBleGlzdGluZ0N1c3RvbWVyID0gYXdhaXQgc3J2XHJcbiAgICAgIC50eChyZXEpXHJcbiAgICAgIC5ydW4oU0VMRUNULm9uZS5mcm9tKEN1c3RvbWVycykud2hlcmUoeyBlbWFpbDogcmVxLmRhdGEuZW1haWwgfSkpO1xyXG4gICAgaWYgKGV4aXN0aW5nQ3VzdG9tZXIpIHtcclxuICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgnY3VzdG9tZXIuZXhpc3RzJywgW3JlcS5kYXRhLmVtYWlsXSkpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHNydi5iZWZvcmUoXCJDUkVBVEVcIiwgT3JkZXJzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbiAgICBpZiAoIXJlcS5kYXRhLmN1c3RvbWVyX0lEKSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ29yZGVyLmN1c3RvbWVyLnJlcXVpcmVkJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3VzdG9tZXIgPSBhd2FpdCBzcnZcclxuICAgICAgLnR4KHJlcSlcclxuICAgICAgLnJ1bihTRUxFQ1Qub25lLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IElEOiByZXEuZGF0YS5jdXN0b21lcl9JRCB9KSk7XHJcblxyXG4gICAgaWYgKCFjdXN0b21lcikge1xyXG4gICAgICByZXEuZXJyb3IoNDA0LCBpMThuLmF0KCdvcmRlci5jdXN0b21lci5ub3Rmb3VuZCcsIFtyZXEuZGF0YS5jdXN0b21lcl9JRF0pKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChcclxuICAgICAgIXJlcS5kYXRhLml0ZW1zIHx8XHJcbiAgICAgICFBcnJheS5pc0FycmF5KHJlcS5kYXRhLml0ZW1zKSB8fFxyXG4gICAgICByZXEuZGF0YS5pdGVtcy5sZW5ndGggPT09IDBcclxuICAgICkge1xyXG4gICAgICByZXEuZXJyb3IoNDAwLCBpMThuLmF0KCdvcmRlci5pdGVtcy5yZXF1aXJlZCcpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB0b3RhbE9yZGVyQW1vdW50ID0gMDtcclxuICAgIGNvbnN0IHByb2Nlc3NlZEl0ZW1zID0gW107XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcHJvZHVjdFByb21pc2VzID0gcmVxLmRhdGEuaXRlbXMubWFwKGFzeW5jIChvcmRlckl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIGlmICghb3JkZXJJdGVtLnByb2R1Y3RfSUQgfHwgIW9yZGVySXRlbS5xdWFudGl0eSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBpMThuLmF0KCdvcmRlci5pdGVtLmRldGFpbHMucmVxdWlyZWQnKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHByb2R1Y3QgPSBhd2FpdCBzcnZcclxuICAgICAgICAgIC50eChyZXEpXHJcbiAgICAgICAgICAucnVuKFNFTEVDVC5vbmUuZnJvbShQcm9kdWN0cykud2hlcmUoeyBJRDogb3JkZXJJdGVtLnByb2R1Y3RfSUQgfSkpO1xyXG5cclxuICAgICAgICBpZiAoIXByb2R1Y3QpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihpMThuLmF0KCdvcmRlci5wcm9kdWN0Lm5vdGZvdW5kJywgW29yZGVySXRlbS5wcm9kdWN0X0lEXSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2R1Y3Quc3RvY2tRdWFudGl0eSA8IG9yZGVySXRlbS5xdWFudGl0eSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBpMThuLmF0KCdvcmRlci5pbnN1ZmZpY2llbnQuc3RvY2snLCB7XHJcbiAgICAgICAgICAgICAgcHJvZHVjdDogcHJvZHVjdC5uYW1lLFxyXG4gICAgICAgICAgICAgIHJlcXVlc3RlZDogb3JkZXJJdGVtLnF1YW50aXR5LFxyXG4gICAgICAgICAgICAgIGF2YWlsYWJsZTogcHJvZHVjdC5zdG9ja1F1YW50aXR5LFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGl0ZW1Ub3RhbFByaWNlID0gcHJvZHVjdC5wcmljZSAqIG9yZGVySXRlbS5xdWFudGl0eTtcclxuICAgICAgICB0b3RhbE9yZGVyQW1vdW50ICs9IGl0ZW1Ub3RhbFByaWNlO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgb3JpZ2luYWw6IG9yZGVySXRlbSxcclxuICAgICAgICAgIHByb2R1Y3Q6IHByb2R1Y3QsXHJcbiAgICAgICAgICB1bml0UHJpY2U6IHByb2R1Y3QucHJpY2UsXHJcbiAgICAgICAgICB0b3RhbFByaWNlOiBpdGVtVG90YWxQcmljZSxcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IHZhbGlkYXRlZEl0ZW1zID0gYXdhaXQgUHJvbWlzZS5hbGwocHJvZHVjdFByb21pc2VzKTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWxpZGF0ZWRJdGVtcykge1xyXG4gICAgICAgIGF3YWl0IHNydi50eChyZXEpLnJ1bihcclxuICAgICAgICAgIFVQREFURS5lbnRpdHkoUHJvZHVjdHMpXHJcbiAgICAgICAgICAgIC53aGVyZSh7IElEOiBpdGVtLm9yaWdpbmFsLnByb2R1Y3RfSUQgfSlcclxuICAgICAgICAgICAgLnNldCh7XHJcbiAgICAgICAgICAgICAgc3RvY2tRdWFudGl0eTogeyBcIi09XCI6IGl0ZW0ub3JpZ2luYWwucXVhbnRpdHkgfSxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpdGVtLm9yaWdpbmFsLnVuaXRQcmljZSA9IGl0ZW0udW5pdFByaWNlO1xyXG4gICAgICAgIGl0ZW0ub3JpZ2luYWwudG90YWxQcmljZSA9IGl0ZW0udG90YWxQcmljZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVxLmRhdGEudG90YWxBbW91bnQgPSB0b3RhbE9yZGVyQW1vdW50O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmVxLmVycm9yKDQwMCwgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc3J2LmJlZm9yZShcIlVQREFURVwiLCBPcmRlcnMsIGFzeW5jIChyZXE6IFJlcXVlc3QpID0+IHtcclxuICAgIGlmIChyZXEuZGF0YS5pdGVtcyAmJiByZXEuZGF0YS5pdGVtcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgndXBkYXRlLm9yZGVyLndpdGhvdXQuaXRlbXMnKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGtleSBpbiByZXEuZGF0YSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgcmVxLmRhdGFba2V5XSA9PT0gbnVsbCB8fFxyXG4gICAgICAgIHJlcS5kYXRhW2tleV0gPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgIHJlcS5kYXRhW2tleV0gPT09IFwiXCJcclxuICAgICAgKSB7XHJcbiAgICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgndXBkYXRlLm51bGwuZXJyb3InLCBba2V5XSkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXEuZGF0YS5pdGVtcykge1xyXG4gICAgICBsZXQgdG90YWxPcmRlckFtb3VudCA9IDA7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICBjb25zdCBwcm9kdWN0ID0gYXdhaXQgc3J2LnR4KHJlcSkucnVuKFxyXG4gICAgICAgIFNFTEVDVC5vbmUuZnJvbShQcm9kdWN0cykud2hlcmUoeyBJRDogcmVxLmRhdGEuaXRlbXNbMF0ucHJvZHVjdF9JRCB9KVxyXG4gICAgICAgKSBcclxuICAgICAgIGlmKCFwcm9kdWN0KXtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaTE4bi5hdCgnb3JkZXIucHJvZHVjdC5ub3Rmb3VuZCcsIFtyZXEuZGF0YS5pdGVtc1swXS5wcm9kdWN0X0lEXSkpO1xyXG4gICAgICAgfVxyXG4gICAgICAgIGlmKHByb2R1Y3Quc3RvY2tRdWFudGl0eSA8IHJlcS5kYXRhLml0ZW1zWzBdLnF1YW50aXR5KXtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihpMThuLmF0KCd1cGRhdGUuaW5zdWZmaWNpZW50LnN0b2NrJywgW1xyXG4gICAgICAgICAgICBwcm9kdWN0Lm5hbWUsXHJcbiAgICAgICAgICAgIHJlcS5kYXRhLml0ZW1zWzBdLnF1YW50aXR5LFxyXG4gICAgICAgICAgICBwcm9kdWN0LnN0b2NrUXVhbnRpdHksXHJcbiAgICAgICAgICBdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGl0ZW1Ub3RhbFByaWNlID0gcHJvZHVjdC5wcmljZSAqIHJlcS5kYXRhLml0ZW1zWzBdLnF1YW50aXR5O1xyXG4gICAgICAgIHRvdGFsT3JkZXJBbW91bnQgPSBpdGVtVG90YWxQcmljZTtcclxuICAgICAgICBcclxuICAgICAgICBhd2FpdCBzcnYudHgocmVxKS5ydW4oXHJcbiAgICAgICAgICBVUERBVEUuZW50aXR5KFByb2R1Y3RzKVxyXG4gICAgICAgICAgICAud2hlcmUoeyBJRDogcmVxLmRhdGEuaXRlbXNbMF0ucHJvZHVjdF9JRCB9KVxyXG4gICAgICAgICAgICAuc2V0KHtcclxuICAgICAgICAgICAgICBzdG9ja1F1YW50aXR5OiB7IFwiLT1cIjogcmVxLmRhdGEuaXRlbXNbMF0ucXVhbnRpdHkgfSxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG4gICAgICAgIHJlcS5kYXRhLml0ZW1zWzBdLnVuaXRQcmljZSA9IHByb2R1Y3QucHJpY2U7XHJcbiAgICAgICAgcmVxLmRhdGEuaXRlbXNbMF0udG90YWxQcmljZSA9IGl0ZW1Ub3RhbFByaWNlO1xyXG4gICAgICAgIHJlcS5kYXRhLnRvdGFsQW1vdW50ID0gdG90YWxPcmRlckFtb3VudDtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICByZXEuZXJyb3IoNDAwLCBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbi8vICAgc3J2Lm9uKFwiRWRpdFByb2R1Y3RcIiwgYXN5bmMgKHJlcTogUmVxdWVzdCk9PiB7XHJcbi8vICAgICAgY29uc3QgcHJvZHVjdElkID0gcmVxLnBhcmFtc1swXTsgLy8gR2V0IElEIGZyb20gdGhlIGJvdW5kIGVudGl0eVxyXG4vLyAgICAgdHJ5IHtcclxuLy8gICAgICAgLy8gQ2hlY2sgaWYgcHJvZHVjdCBpcyB1c2VkIGluIGFueSBvcmRlcnNcclxuLy8gICAgICAgY29uc3Qgb3JkZXJJdGVtcyA9IGF3YWl0IFNFTEVDVC5mcm9tKE9yZGVySXRlbXMpLndoZXJlKHsgcHJvZHVjdF9JRDogcHJvZHVjdElkIH0pO1xyXG4vLyAgICAgICBpZiAob3JkZXJJdGVtcy5sZW5ndGggPiAwKSB7XHJcbi8vICAgICAgICAgcmVxLmVycm9yKDQwMCwgJ0Nhbm5vdCBkZWxldGUgcHJvZHVjdCB0aGF0IGlzIHVzZWQgaW4gZXhpc3Rpbmcgb3JkZXJzJyk7XHJcbi8vICAgICAgIH1cclxuICAgICAgXHJcbi8vICAgICAgIGF3YWl0IERFTEVURS5mcm9tKFByb2R1Y3RzKS53aGVyZSh7IElEOiBwcm9kdWN0SWQgfSk7XHJcbi8vICAgICAgIHJldHVybiAnUHJvZHVjdCBkZWxldGVkIHN1Y2Nlc3NmdWxseSc7XHJcbi8vICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4vLyAgICAgICByZXEuZXJyb3IoNTAwLCBgRXJyb3IgZGVsZXRpbmcgcHJvZHVjdDogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4vLyAgICAgfVxyXG4vLyAgIH0pXHJcbi8vICAgc3J2Lm9uKFwiRGVsZXRlUHJvZHVjdFwiLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbi8vICAgICAgY29uc3QgeyBwcm9kdWN0SWQgfSA9IHJlcS5kYXRhO1xyXG4vLyAgICAgdHJ5IHtcclxuLy8gICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgREVMRVRFLmZyb20oUHJvZHVjdHMpLndoZXJlKHsgSUQ6IHByb2R1Y3RJZCB9KTtcclxuLy8gICAgICAgaWYgKHJlc3VsdCA9PT0gMCkge1xyXG4vLyAgICAgICAgIHJlcS5lcnJvcig0MDQsIGBQcm9kdWN0IHdpdGggSUQgJHtwcm9kdWN0SWR9IG5vdCBmb3VuZGApO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICAgIHJldHVybiB0cnVlO1xyXG4vLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuLy8gICAgICAgcmVxLmVycm9yKDUwMCwgYEVycm9yIGRlbGV0aW5nIHByb2R1Y3Q6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuLy8gICAgIH1cclxuLy8gICB9KVxyXG4vLyAgIHNydi5vbihcIkVkaXRDdXN0b21lclwiLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbi8vICAgICBjb25zdCB7IGN1c3RvbWVySWQgfSA9IHJlcS5kYXRhO1xyXG4vLyAgICAgdHJ5IHtcclxuLy8gICAgICAgY29uc3QgY3VzdG9tZXIgPSBhd2FpdCBTRUxFQ1Qub25lLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IElEOiBjdXN0b21lcklkIH0pO1xyXG4vLyAgICAgICBpZiAoIWN1c3RvbWVyKSB7XHJcbi8vICAgICAgICAgcmVxLmVycm9yKDQwNCwgYEN1c3RvbWVyIHdpdGggSUQgJHtjdXN0b21lcklkfSBub3QgZm91bmRgKTtcclxuLy8gICAgICAgfVxyXG4vLyAgICAgICByZXR1cm4gY3VzdG9tZXI7XHJcbi8vICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4vLyAgICAgICByZXEuZXJyb3IoNTAwLCBgRXJyb3IgZWRpdGluZyBjdXN0b21lcjogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4vLyAgICAgfVxyXG4vLyAgIH0pXHJcblxyXG4vLyAgIHNydi5vbihcIkRlbGV0ZUN1c3RvbWVyXCIsIGFzeW5jIChyZXE6IFJlcXVlc3QpID0+IHtcclxuLy8gICAgIGNvbnN0IHsgY3VzdG9tZXJJZCB9ID0gcmVxLmRhdGE7XHJcbi8vICAgICB0cnkge1xyXG4vLyAgICAgICAvLyBDaGVjayBpZiBjdXN0b21lciBoYXMgb3JkZXJzXHJcbi8vICAgICAgIGNvbnN0IG9yZGVycyA9IGF3YWl0IFNFTEVDVC5mcm9tKE9yZGVycykud2hlcmUoeyBjdXN0b21lcl9JRDogY3VzdG9tZXJJZCB9KTtcclxuLy8gICAgICAgaWYgKG9yZGVycy5sZW5ndGggPiAwKSB7XHJcbi8vICAgICAgICAgcmVxLmVycm9yKDQwMCwgJ0Nhbm5vdCBkZWxldGUgY3VzdG9tZXIgd2l0aCBleGlzdGluZyBvcmRlcnMnKTtcclxuLy8gICAgICAgfVxyXG4gICAgICBcclxuLy8gICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgREVMRVRFLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IElEOiBjdXN0b21lcklkIH0pO1xyXG4vLyAgICAgICBpZiAocmVzdWx0ID09PSAwKSB7XHJcbi8vICAgICAgICAgcmVxLmVycm9yKDQwNCwgYEN1c3RvbWVyIHdpdGggSUQgJHtjdXN0b21lcklkfSBub3QgZm91bmRgKTtcclxuLy8gICAgICAgfVxyXG4vLyAgICAgICByZXR1cm4gdHJ1ZTtcclxuLy8gICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbi8vICAgICAgIHJlcS5lcnJvcig1MDAsIGBFcnJvciBkZWxldGluZyBjdXN0b21lcjogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4vLyAgICAgfVxyXG4vLyAgIH0pXHJcbi8vIHNydi5vbihcIkNyZWF0ZUN1c3RvbWVyXCIsIGFzeW5jIChyZXE6UmVxdWVzdCk9PiB7XHJcbi8vICAgICBjb25zdCB7IGZpcnN0TmFtZSwgbGFzdE5hbWUsIGVtYWlsLCBwaG9uZSwgYWRkcmVzcywgY2l0eSwgcG9zdGFsQ29kZSwgY291bnRyeSB9ID0gcmVxLmRhdGE7XHJcbi8vICAgICB0cnkge1xyXG4vLyAgICAgICBpZiAoIWZpcnN0TmFtZSB8fCAhbGFzdE5hbWUgfHwgIWVtYWlsIHx8ICFwaG9uZSB8fCAhYWRkcmVzcyB8fCAhY2l0eSB8fCAhcG9zdGFsQ29kZSB8fCAhY291bnRyeSkge1xyXG4vLyAgICAgICAgIHJlcS5lcnJvcig0MDAsICdBbGwgZmllbGRzIGFyZSByZXF1aXJlZCcpO1xyXG4vLyAgICAgICB9XHJcbiAgICAgIFxyXG4vLyAgICAgICBjb25zdCBleGlzdGluZ0N1c3RvbWVyID0gYXdhaXQgU0VMRUNULm9uZS5mcm9tKEN1c3RvbWVycykud2hlcmUoeyBlbWFpbCB9KTtcclxuLy8gICAgICAgaWYgKGV4aXN0aW5nQ3VzdG9tZXIpIHtcclxuLy8gICAgICAgICByZXEuZXJyb3IoNDAwLCBgQ3VzdG9tZXIgd2l0aCBlbWFpbCAke2VtYWlsfSBhbHJlYWR5IGV4aXN0c2ApO1xyXG4vLyAgICAgICB9XHJcbiAgICAgIFxyXG4vLyAgICAgICBjb25zdCBuZXdDdXN0b21lciA9IHtcclxuLy8gICAgICAgICBJRDogY2RzLnV0aWxzLnV1aWQoKSxcclxuLy8gICAgICAgICBmaXJzdE5hbWUsXHJcbi8vICAgICAgICAgbGFzdE5hbWUsXHJcbi8vICAgICAgICAgZW1haWwsXHJcbi8vICAgICAgICAgcGhvbmUsXHJcbi8vICAgICAgICAgYWRkcmVzcyxcclxuLy8gICAgICAgICBjaXR5LFxyXG4vLyAgICAgICAgIHBvc3RhbENvZGUsXHJcbi8vICAgICAgICAgY291bnRyeVxyXG4vLyAgICAgICB9O1xyXG5cclxuLy8gICAgICAgYXdhaXQgSU5TRVJULmludG8oQ3VzdG9tZXJzKS5lbnRyaWVzKG5ld0N1c3RvbWVyKTtcclxuLy8gICAgICAgcmV0dXJuIGF3YWl0IFNFTEVDVC5vbmUuZnJvbShDdXN0b21lcnMpLndoZXJlKHsgSUQ6IG5ld0N1c3RvbWVyLklEIH0pO1xyXG4vLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuLy8gICAgICAgcmVxLmVycm9yKDUwMCwgYEVycm9yIGNyZWF0aW5nIGN1c3RvbWVyOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbi8vICAgICB9XHJcbi8vIH0pXHJcbi8vICAgc3J2Lm9uKFwiQ3JlYXRlT3JkZXJcIiwgYXN5bmMgKHJlcTpSZXF1ZXN0KT0+IHtcclxuLy8gICAgIGNvbnN0IHsgY3VzdG9tZXJJZCB9ID0gcmVxLmRhdGE7XHJcbi8vICAgICB0cnkge1xyXG4vLyAgICAgICBjb25zdCBjdXN0b21lciA9IGF3YWl0IFNFTEVDVC5vbmUuZnJvbShDdXN0b21lcnMpLndoZXJlKHsgSUQ6IGN1c3RvbWVySWQgfSk7XHJcbi8vICAgICAgIGlmICghY3VzdG9tZXIpIHtcclxuLy8gICAgICAgICByZXEuZXJyb3IoNDA0LCBgQ3VzdG9tZXIgd2l0aCBJRCAke2N1c3RvbWVySWR9IG5vdCBmb3VuZGApO1xyXG4vLyAgICAgICB9XHJcbiAgICAgIFxyXG4vLyAgICAgICBjb25zdCBuZXdPcmRlciA9IHtcclxuLy8gICAgICAgICBJRDogY2RzLnV0aWxzLnV1aWQoKSxcclxuLy8gICAgICAgICBjdXN0b21lcl9JRDogY3VzdG9tZXJJZCxcclxuLy8gICAgICAgICBvcmRlckRhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxyXG4vLyAgICAgICAgIHN0YXR1czogJ1BlbmRpbmcnLFxyXG4vLyAgICAgICAgIHRvdGFsQW1vdW50OiAwLFxyXG4vLyAgICAgICAgIG5vdGVzOiAnJ1xyXG4vLyAgICAgICB9O1xyXG4gICAgICBcclxuLy8gICAgICAgYXdhaXQgSU5TRVJULmludG8oT3JkZXJzKS5lbnRyaWVzKG5ld09yZGVyKTtcclxuLy8gICAgICAgcmV0dXJuIGF3YWl0IFNFTEVDVC5vbmUuZnJvbShPcmRlcnMpLndoZXJlKHsgSUQ6IG5ld09yZGVyLklEIH0pO1xyXG4vLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuLy8gICAgICAgcmVxLmVycm9yKDUwMCwgYEVycm9yIGNyZWF0aW5nIG9yZGVyOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbi8vICAgICB9XHJcbi8vICAgfSlcclxuLy8gICBzcnYub24oXCJFZGl0T3JkZXJcIiwgYXN5bmMocmVxOlJlcXVlc3QpPT4ge1xyXG4vLyAgICAgIGNvbnN0IHsgb3JkZXJJZCB9ID0gcmVxLmRhdGE7XHJcbi8vICAgICB0cnkge1xyXG4vLyAgICAgICBjb25zdCBvcmRlciA9IGF3YWl0IFNFTEVDVC5vbmUuZnJvbShPcmRlcnMpLndoZXJlKHsgSUQ6IG9yZGVySWQgfSk7XHJcbi8vICAgICAgIGlmICghb3JkZXIpIHtcclxuLy8gICAgICAgICByZXEuZXJyb3IoNDA0LCBgT3JkZXIgd2l0aCBJRCAke29yZGVySWR9IG5vdCBmb3VuZGApO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICAgIHJldHVybiBvcmRlcjtcclxuLy8gICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbi8vICAgICAgIHJlcS5lcnJvcig1MDAsIGBFcnJvciBlZGl0aW5nIG9yZGVyOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbi8vICAgICB9XHJcbi8vICAgfSlcclxuXHJcbi8vICAgc3J2Lm9uKFwiRGVsZXRlT3JkZXJcIiwgYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xyXG4vLyAgICAgY29uc3QgeyBvcmRlcklkIH0gPSByZXEuZGF0YTtcclxuLy8gICAgIHRyeSB7XHJcbi8vICAgICAgIC8vIERlbGV0ZSBvcmRlciBpdGVtcyBmaXJzdFxyXG4vLyAgICAgICBhd2FpdCBERUxFVEUuZnJvbShPcmRlckl0ZW1zKS53aGVyZSh7IG9yZGVyX0lEOiBvcmRlcklkIH0pO1xyXG4gICAgICBcclxuLy8gICAgICAgLy8gVGhlbiBkZWxldGUgdGhlIG9yZGVyXHJcbi8vICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IERFTEVURS5mcm9tKE9yZGVycykud2hlcmUoeyBJRDogb3JkZXJJZCB9KTtcclxuLy8gICAgICAgaWYgKHJlc3VsdCA9PT0gMCkge1xyXG4vLyAgICAgICAgIHJlcS5lcnJvcig0MDQsIGBPcmRlciB3aXRoIElEICR7b3JkZXJJZH0gbm90IGZvdW5kYCk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgICAgcmV0dXJuIHRydWU7XHJcbi8vICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4vLyAgICAgICByZXEuZXJyb3IoNTAwLCBgRXJyb3IgZGVsZXRpbmcgb3JkZXI6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuLy8gICAgIH1cclxuLy8gICB9KVxyXG5cclxuLy8gICBzcnYub24oXCJEZWxldGVPcmRlckl0ZW1cIiwgYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xyXG4vLyAgICAgY29uc3QgeyBpdGVtSWQgfSA9IHJlcS5kYXRhO1xyXG4vLyAgICAgdHJ5IHtcclxuLy8gICAgICAgY29uc3QgaXRlbSA9IGF3YWl0IFNFTEVDVC5vbmUuZnJvbShPcmRlckl0ZW1zKS53aGVyZSh7IElEOiBpdGVtSWQgfSk7XHJcbi8vICAgICAgIGlmICghaXRlbSkge1xyXG4vLyAgICAgICAgIHJlcS5lcnJvcig0MDQsIGBPcmRlciBpdGVtIHdpdGggSUQgJHtpdGVtSWR9IG5vdCBmb3VuZGApO1xyXG4vLyAgICAgICB9XHJcblxyXG4vLyAgICAgICAvLyBEZWxldGUgdGhlIGl0ZW1cclxuLy8gICAgICAgYXdhaXQgREVMRVRFLmZyb20oT3JkZXJJdGVtcykud2hlcmUoeyBJRDogaXRlbUlkIH0pO1xyXG5cclxuLy8gICAgICAgLy8gUmVjYWxjdWxhdGUgb3JkZXIgdG90YWxcclxuLy8gICAgICAgY29uc3Qgb3JkZXJJdGVtcyA9IGF3YWl0IFNFTEVDVC5mcm9tKE9yZGVySXRlbXMpLndoZXJlKHsgb3JkZXJfSUQ6IGl0ZW0ub3JkZXJfSUQgfSk7XHJcbi8vICAgICAgIGNvbnN0IHRvdGFsQW1vdW50ID0gb3JkZXJJdGVtcy5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4gc3VtICsgKGl0ZW0udG90YWxQcmljZSB8fCAwKSwgMCk7XHJcbiAgICAgIFxyXG4vLyAgICAgICBhd2FpdCBVUERBVEUuZW50aXR5KE9yZGVycykuc2V0KHsgdG90YWxBbW91bnQgfSkud2hlcmUoeyBJRDogaXRlbS5vcmRlcl9JRCB9KTtcclxuICAgICAgXHJcbi8vICAgICAgIHJldHVybiB0cnVlO1xyXG4vLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuLy8gICAgICAgcmVxLmVycm9yKDUwMCwgYEVycm9yIGRlbGV0aW5nIG9yZGVyIGl0ZW06ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuLy8gICAgIH1cclxuLy8gICB9KVxyXG4gIFxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5cclxuICAvLyBCb3VuZCBhY3Rpb24gaGFuZGxlcnMgLSB0aGVzZSB3b3JrIHdpdGggdGhlIHNlbGVjdGVkIGVudGl0eSBjb250ZXh0XHJcbiAgc3J2Lm9uKCdkZWxldGVQcm9kdWN0JywgUHJvZHVjdHMsIGFzeW5jIChyZXEpID0+IHtcclxuICAgIGNvbnN0IHByb2R1Y3RJZCA9IHJlcS5wYXJhbXNbMF07IC8vIEdldCBJRCBmcm9tIHRoZSBib3VuZCBlbnRpdHlcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIENoZWNrIGlmIHByb2R1Y3QgaXMgdXNlZCBpbiBhbnkgb3JkZXJzXHJcbiAgICAgIGNvbnN0IG9yZGVySXRlbXMgPSBhd2FpdCBTRUxFQ1QuZnJvbShPcmRlckl0ZW1zKS53aGVyZSh7IHByb2R1Y3RfSUQ6IHByb2R1Y3RJZCB9KTtcclxuICAgICAgaWYgKG9yZGVySXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJlcS5lcnJvcig0MDAsICdDYW5ub3QgZGVsZXRlIHByb2R1Y3QgdGhhdCBpcyB1c2VkIGluIGV4aXN0aW5nIG9yZGVycycpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBhd2FpdCBERUxFVEUuZnJvbShQcm9kdWN0cykud2hlcmUoeyBJRDogcHJvZHVjdElkIH0pO1xyXG4gICAgICByZXR1cm4gJ1Byb2R1Y3QgZGVsZXRlZCBzdWNjZXNzZnVsbHknO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmVxLmVycm9yKDUwMCwgYEVycm9yIGRlbGV0aW5nIHByb2R1Y3Q6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc3J2Lm9uKCdkZWxldGVDdXN0b21lcicsIEN1c3RvbWVycywgYXN5bmMgKHJlcSkgPT4ge1xyXG4gICAgY29uc3QgY3VzdG9tZXJJZCA9IHJlcS5wYXJhbXNbMF07XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBDaGVjayBpZiBjdXN0b21lciBoYXMgb3JkZXJzXHJcbiAgICAgIGNvbnN0IG9yZGVycyA9IGF3YWl0IFNFTEVDVC5mcm9tKE9yZGVycykud2hlcmUoeyBjdXN0b21lcl9JRDogY3VzdG9tZXJJZCB9KTtcclxuICAgICAgaWYgKG9yZGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmVxLmVycm9yKDQwMCwgJ0Nhbm5vdCBkZWxldGUgY3VzdG9tZXIgd2l0aCBleGlzdGluZyBvcmRlcnMnKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgYXdhaXQgREVMRVRFLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IElEOiBjdXN0b21lcklkIH0pO1xyXG4gICAgICByZXR1cm4gJ0N1c3RvbWVyIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JztcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJlcS5lcnJvcig1MDAsIGBFcnJvciBkZWxldGluZyBjdXN0b21lcjogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBzcnYub24oJ2NyZWF0ZU9yZGVyRm9yQ3VzdG9tZXInLCBDdXN0b21lcnMsIGFzeW5jIChyZXEpID0+IHtcclxuICAgIGNvbnN0IGN1c3RvbWVySWQgPSByZXEucGFyYW1zWzBdO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgY3VzdG9tZXIgPSBhd2FpdCBTRUxFQ1Qub25lLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IElEOiBjdXN0b21lcklkIH0pO1xyXG4gICAgICBpZiAoIWN1c3RvbWVyKSB7XHJcbiAgICAgICAgcmVxLmVycm9yKDQwNCwgYEN1c3RvbWVyIG5vdCBmb3VuZGApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBuZXdPcmRlciA9IHtcclxuICAgICAgICBJRDogY2RzLnV0aWxzLnV1aWQoKSxcclxuICAgICAgICBjdXN0b21lcl9JRDogY3VzdG9tZXJJZCxcclxuICAgICAgICBvcmRlckRhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxyXG4gICAgICAgIHN0YXR1czogJ1BlbmRpbmcnLFxyXG4gICAgICAgIHRvdGFsQW1vdW50OiAwLFxyXG4gICAgICAgIG5vdGVzOiAnJ1xyXG4gICAgICB9O1xyXG4gICAgICBcclxuICAgICAgYXdhaXQgSU5TRVJULmludG8oT3JkZXJzKS5lbnRyaWVzKG5ld09yZGVyKTtcclxuICAgICAgcmV0dXJuIGF3YWl0IFNFTEVDVC5vbmUuZnJvbShPcmRlcnMpLndoZXJlKHsgSUQ6IG5ld09yZGVyLklEIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmVxLmVycm9yKDUwMCwgYEVycm9yIGNyZWF0aW5nIG9yZGVyOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHNydi5vbignZGVsZXRlT3JkZXInLCBPcmRlcnMsIGFzeW5jIChyZXEpID0+IHtcclxuICAgIGNvbnN0IG9yZGVySWQgPSByZXEucGFyYW1zWzBdO1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gRGVsZXRlIG9yZGVyIGl0ZW1zIGZpcnN0XHJcbiAgICAgIGF3YWl0IERFTEVURS5mcm9tKE9yZGVySXRlbXMpLndoZXJlKHsgb3JkZXJfSUQ6IG9yZGVySWQgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBUaGVuIGRlbGV0ZSB0aGUgb3JkZXJcclxuICAgICAgYXdhaXQgREVMRVRFLmZyb20oT3JkZXJzKS53aGVyZSh7IElEOiBvcmRlcklkIH0pO1xyXG4gICAgICByZXR1cm4gJ09yZGVyIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JztcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJlcS5lcnJvcig1MDAsIGBFcnJvciBkZWxldGluZyBvcmRlcjogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBzcnYub24oJ2RlbGV0ZU9yZGVySXRlbScsIE9yZGVySXRlbXMsIGFzeW5jIChyZXEpID0+IHtcclxuICAgIGNvbnN0IGl0ZW1JZCA9IHJlcS5wYXJhbXNbMF07XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBpdGVtID0gYXdhaXQgU0VMRUNULm9uZS5mcm9tKE9yZGVySXRlbXMpLndoZXJlKHsgSUQ6IGl0ZW1JZCB9KTtcclxuICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgcmVxLmVycm9yKDQwNCwgYE9yZGVyIGl0ZW0gbm90IGZvdW5kYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERlbGV0ZSB0aGUgaXRlbVxyXG4gICAgICBhd2FpdCBERUxFVEUuZnJvbShPcmRlckl0ZW1zKS53aGVyZSh7IElEOiBpdGVtSWQgfSk7XHJcblxyXG4gICAgICAvLyBSZWNhbGN1bGF0ZSBvcmRlciB0b3RhbFxyXG4gICAgICBjb25zdCBvcmRlckl0ZW1zID0gYXdhaXQgU0VMRUNULmZyb20oT3JkZXJJdGVtcykud2hlcmUoeyBvcmRlcl9JRDogaXRlbS5vcmRlcl9JRCB9KTtcclxuICAgICAgY29uc3QgdG90YWxBbW91bnQgPSBvcmRlckl0ZW1zLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiBzdW0gKyAoaXRlbS50b3RhbFByaWNlIHx8IDApLCAwKTtcclxuICAgICAgXHJcbiAgICAgIGF3YWl0IFVQREFURS5lbnRpdHkoT3JkZXJzKS5zZXQoeyB0b3RhbEFtb3VudCB9KS53aGVyZSh7IElEOiBpdGVtLm9yZGVyX0lEIH0pO1xyXG4gICAgICBcclxuICAgICAgcmV0dXJuICdPcmRlciBpdGVtIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JztcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJlcS5lcnJvcig1MDAsIGBFcnJvciBkZWxldGluZyBvcmRlciBpdGVtOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIFVuYm91bmQgYWN0aW9uIGZvciBjcmVhdGluZyBuZXcgb3JkZXJzXHJcbiAgc3J2Lm9uKCdjcmVhdGVOZXdPcmRlcicsIGFzeW5jIChyZXEpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG5ld09yZGVyID0ge1xyXG4gICAgICAgIElEOiBjZHMudXRpbHMudXVpZCgpLFxyXG4gICAgICAgIG9yZGVyRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXHJcbiAgICAgICAgc3RhdHVzOiAnUGVuZGluZycsXHJcbiAgICAgICAgdG90YWxBbW91bnQ6IDAsXHJcbiAgICAgICAgbm90ZXM6ICcnXHJcbiAgICAgIH07XHJcbiAgICAgIFxyXG4gICAgICBhd2FpdCBJTlNFUlQuaW50byhPcmRlcnMpLmVudHJpZXMobmV3T3JkZXIpO1xyXG4gICAgICByZXR1cm4gYXdhaXQgU0VMRUNULm9uZS5mcm9tKE9yZGVycykud2hlcmUoeyBJRDogbmV3T3JkZXIuSUQgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXEuZXJyb3IoNTAwLCBgRXJyb3IgY3JlYXRpbmcgb3JkZXI6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gRXZlbnQgaGFuZGxlcnMgZm9yIGF1dG9tYXRpYyBjYWxjdWxhdGlvbnNcclxuICBzcnYuYmVmb3JlKCdDUkVBVEUnLCBPcmRlckl0ZW1zLCBhc3luYyAocmVxKSA9PiB7XHJcbiAgICBjb25zdCB7IHF1YW50aXR5LCB1bml0UHJpY2UgfSA9IHJlcS5kYXRhO1xyXG4gICAgcmVxLmRhdGEudG90YWxQcmljZSA9IHF1YW50aXR5ICogdW5pdFByaWNlO1xyXG4gIH0pO1xyXG5cclxuICBzcnYuYmVmb3JlKCdVUERBVEUnLCBPcmRlckl0ZW1zLCBhc3luYyAocmVxKSA9PiB7XHJcbiAgICBpZiAocmVxLmRhdGEucXVhbnRpdHkgIT09IHVuZGVmaW5lZCB8fCByZXEuZGF0YS51bml0UHJpY2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IFNFTEVDVC5vbmUuZnJvbShPcmRlckl0ZW1zKS53aGVyZSh7IElEOiByZXEuZGF0YS5JRCB9KTtcclxuICAgICAgY29uc3QgcXVhbnRpdHkgPSByZXEuZGF0YS5xdWFudGl0eSAhPT0gdW5kZWZpbmVkID8gcmVxLmRhdGEucXVhbnRpdHkgOiBleGlzdGluZy5xdWFudGl0eTtcclxuICAgICAgY29uc3QgdW5pdFByaWNlID0gcmVxLmRhdGEudW5pdFByaWNlICE9PSB1bmRlZmluZWQgPyByZXEuZGF0YS51bml0UHJpY2UgOiBleGlzdGluZy51bml0UHJpY2U7XHJcbiAgICAgIHJlcS5kYXRhLnRvdGFsUHJpY2UgPSBxdWFudGl0eSAqIHVuaXRQcmljZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc3J2LmFmdGVyKFsnQ1JFQVRFJywgJ1VQREFURScsICdERUxFVEUnXSwgT3JkZXJJdGVtcywgYXN5bmMgKF8sIHJlcSkgPT4ge1xyXG4gICAgY29uc3Qgb3JkZXJJZCA9IHJlcS5kYXRhLm9yZGVyX0lEO1xyXG4gICAgaWYgKG9yZGVySWQpIHtcclxuICAgICAgY29uc3Qgb3JkZXJJdGVtcyA9IGF3YWl0IFNFTEVDVC5mcm9tKE9yZGVySXRlbXMpLndoZXJlKHsgb3JkZXJfSUQ6IG9yZGVySWQgfSk7XHJcbiAgICAgIGNvbnN0IHRvdGFsQW1vdW50ID0gb3JkZXJJdGVtcy5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4gc3VtICsgKGl0ZW0udG90YWxQcmljZSB8fCAwKSwgMCk7XHJcbiAgICAgIGF3YWl0IFVQREFURS5lbnRpdHkoT3JkZXJzKS5zZXQoeyB0b3RhbEFtb3VudCB9KS53aGVyZSh7IElEOiBvcmRlcklkIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuIl19