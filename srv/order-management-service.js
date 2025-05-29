"use strict";
// import cds, { update } from "@sap/cds";
// const { SELECT, UPDATE } = cds.ql;
// import { Request } from "@sap/cds";
// export default async function (srv) {
//   const { Orders, Products, Customers, OrderItems } = srv.entities;
//   const i18n =  cds.i18n.labels
//   srv.before("CREATE", Products, async (req: Request) => {
//     if (!req.data.name || !req.data.price || !req.data.stockQuantity) {
//       req.error(
//         400, i18n.at('product.required')
//       );
//       return;
//     }
//     const existingProduct = await srv
//       .tx(req)
//       .run(SELECT.one.from(Products).where({ name: req.data.name }));
//     if (existingProduct) {
//       req.error(400, i18n.at('product.exists', [req.data.name ]));
//       return;
//     }
//   });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//   srv.before("CREATE", Customers, async (req: Request) => {
//     if (!req.data.firstName || !req.data.email || !req.data.lastName) {
//       req.error(400, i18n.at('customer.required'));
//       return;
//     }
//     const existingCustomer = await srv
//       .tx(req)
//       .run(SELECT.one.from(Customers).where({ email: req.data.email }));
//     if (existingCustomer) {
//       req.error(400, i18n.at('customer.exists', [req.data.email]));
//       return;
//     }
//   });
//   srv.before("CREATE", Orders, async (req: Request) => {
//     if (!req.data.customer_ID) {
//       req.error(400, i18n.at('order.customer.required'));
//       return;
//     }
//     const customer = await srv
//       .tx(req)
//       .run(SELECT.one.from(Customers).where({ ID: req.data.customer_ID }));
//     if (!customer) {
//       req.error(404, i18n.at('order.customer.notfound', [req.data.customer_ID]));
//       return;
//     }
//     if (
//       !req.data.items ||
//       !Array.isArray(req.data.items) ||
//       req.data.items.length === 0
//     ) {
//       req.error(400, i18n.at('order.items.required'));
//       return;
//     }
//     let totalOrderAmount = 0;
//     const processedItems = [];
//     try {
//       const productPromises = req.data.items.map(async (orderItem: any) => {
//         if (!orderItem.product_ID || !orderItem.quantity) {
//           throw new Error(
//             i18n.at('order.item.details.required')
//           );
//         }
//         const product = await srv
//           .tx(req)
//           .run(SELECT.one.from(Products).where({ ID: orderItem.product_ID }));
//         if (!product) {
//           throw new Error(i18n.at('order.product.notfound', [orderItem.product_ID]));
//         }
//         if (product.stockQuantity < orderItem.quantity) {
//           throw new Error(
//             i18n.at('order.insufficient.stock', {
//               product: product.name,
//               requested: orderItem.quantity,
//               available: product.stockQuantity,
//             })
//           );
//         }
//         const itemTotalPrice = product.price * orderItem.quantity;
//         totalOrderAmount += itemTotalPrice;
//         return {
//           original: orderItem,
//           product: product,
//           unitPrice: product.price,
//           totalPrice: itemTotalPrice,
//         };
//       });
//       const validatedItems = await Promise.all(productPromises);
//       for (const item of validatedItems) {
//         await srv.tx(req).run(
//           UPDATE.entity(Products)
//             .where({ ID: item.original.product_ID })
//             .set({
//               stockQuantity: { "-=": item.original.quantity },
//             })
//         );
//         item.original.unitPrice = item.unitPrice;
//         item.original.totalPrice = item.totalPrice;
//       }
//       req.data.totalAmount = totalOrderAmount;
//     } catch (error) {
//       req.error(400, error.message);
//       return;
//     }
//   });
//   srv.before("UPDATE", Orders, async (req: Request) => {
//     if (req.data.items && req.data.items.length === 0) {
//       req.error(400, i18n.at('update.order.without.items'));
//       return;
//     }
//     for (let key in req.data) {
//       if (
//         req.data[key] === null ||
//         req.data[key] === undefined ||
//         req.data[key] === ""
//       ) {
//         req.error(400, i18n.at('update.null.error', [key]));
//         return;
//       }
//     }
//     if (req.data.items) {
//       let totalOrderAmount = 0;
//       try {
//        const product = await srv.tx(req).run(
//         SELECT.one.from(Products).where({ ID: req.data.items[0].product_ID })
//        ) 
//        if(!product){
//         throw new Error(i18n.at('order.product.notfound', [req.data.items[0].product_ID]));
//        }
//         if(product.stockQuantity < req.data.items[0].quantity){
//           throw new Error(i18n.at('update.insufficient.stock', [
//             product.name,
//             req.data.items[0].quantity,
//             product.stockQuantity,
//           ]));
//         }
//         const itemTotalPrice = product.price * req.data.items[0].quantity;
//         totalOrderAmount = itemTotalPrice;
//         await srv.tx(req).run(
//           UPDATE.entity(Products)
//             .where({ ID: req.data.items[0].product_ID })
//             .set({
//               stockQuantity: { "-=": req.data.items[0].quantity },
//             })
//         );
//         req.data.items[0].unitPrice = product.price;
//         req.data.items[0].totalPrice = itemTotalPrice;
//         req.data.totalAmount = totalOrderAmount;
//       } catch (error) {
//         req.error(400, error.message);
//         return;
//       }
//     }
//   });
// };
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
        // Handle both association object and direct ID
        let customerId;
        if (req.data.customer && typeof req.data.customer === 'object' && req.data.customer.ID) {
            customerId = req.data.customer.ID;
            // Set the auto-generated foreign key
            req.data.customer_ID = customerId;
        }
        else if (req.data.customer_ID) {
            customerId = req.data.customer_ID;
        }
        else {
            req.error(400, i18n.at('order.customer.required'));
            return;
        }
        const customer = await srv
            .tx(req)
            .run(SELECT.one.from(Customers).where({ ID: customerId }));
        if (!customer) {
            req.error(404, i18n.at('order.customer.notfound', [customerId]));
            return;
        }
        if (!req.data.items ||
            !Array.isArray(req.data.items) ||
            req.data.items.length === 0) {
            req.error(400, i18n.at('order.items.required'));
            return;
        }
        let totalOrderAmount = 0;
        try {
            const productPromises = req.data.items.map(async (orderItem) => {
                // Handle both association object and direct ID
                let productId;
                if (orderItem.product && typeof orderItem.product === 'object' && orderItem.product.ID) {
                    productId = orderItem.product.ID;
                    // Set the auto-generated foreign key
                    orderItem.product_ID = productId;
                }
                else if (orderItem.product_ID) {
                    productId = orderItem.product_ID;
                }
                else {
                    throw new Error(i18n.at('order.item.details.required'));
                }
                if (!orderItem.quantity) {
                    throw new Error(i18n.at('order.item.details.required'));
                }
                const product = await srv
                    .tx(req)
                    .run(SELECT.one.from(Products).where({ ID: productId }));
                if (!product) {
                    throw new Error(i18n.at('order.product.notfound', [productId]));
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
                    productId: productId,
                };
            });
            const validatedItems = await Promise.all(productPromises);
            for (const item of validatedItems) {
                await srv.tx(req).run(UPDATE.entity(Products)
                    .where({ ID: item.productId })
                    .set({
                    stockQuantity: { "-=": item.original.quantity },
                }));
                item.original.unitPrice = item.unitPrice;
                item.original.totalPrice = item.totalPrice;
                // Ensure the auto-generated foreign key is set
                item.original.product_ID = item.productId;
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
        // Handle null/undefined/empty checks more carefully
        for (let key in req.data) {
            if (key !== 'items' && key !== 'customer' && (req.data[key] === null ||
                req.data[key] === undefined ||
                req.data[key] === "")) {
                req.error(400, i18n.at('update.null.error', [key]));
                return;
            }
        }
        if (req.data.items && req.data.items.length > 0) {
            let totalOrderAmount = 0;
            try {
                // Handle both association object and direct ID for the first item
                let productId;
                const firstItem = req.data.items[0];
                if (firstItem.product && typeof firstItem.product === 'object' && firstItem.product.ID) {
                    productId = firstItem.product.ID;
                    firstItem.product_ID = productId;
                }
                else if (firstItem.product_ID) {
                    productId = firstItem.product_ID;
                }
                else {
                    throw new Error(i18n.at('order.item.details.required'));
                }
                const product = await srv.tx(req).run(SELECT.one.from(Products).where({ ID: productId }));
                if (!product) {
                    throw new Error(i18n.at('order.product.notfound', [productId]));
                }
                if (product.stockQuantity < firstItem.quantity) {
                    throw new Error(i18n.at('update.insufficient.stock', [
                        product.name,
                        firstItem.quantity,
                        product.stockQuantity,
                    ]));
                }
                const itemTotalPrice = product.price * firstItem.quantity;
                totalOrderAmount = itemTotalPrice;
                await srv.tx(req).run(UPDATE.entity(Products)
                    .where({ ID: productId })
                    .set({
                    stockQuantity: { "-=": firstItem.quantity },
                }));
                firstItem.unitPrice = product.price;
                firstItem.totalPrice = itemTotalPrice;
                firstItem.product_ID = productId;
                req.data.totalAmount = totalOrderAmount;
            }
            catch (error) {
                req.error(400, error.message);
                return;
            }
        }
    });
    // Handle draft operations - more robust approach
    srv.before(['draftPrepare'], Orders, async (req) => {
        // Don't process associations during draft prepare to avoid expansion issues
        console.log('Draft prepare - skipping association processing');
    });
    srv.before(['draftActivate'], Orders, async (req) => {
        const order = req.data;
        console.log('Draft activate - processing associations');
        // Only process if we have valid data
        if (!order)
            return;
        // Handle customer association
        if (order.customer && typeof order.customer === 'object' && order.customer.ID) {
            order.customer_ID = order.customer.ID;
        }
        // Handle order items - be more careful with composition
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            for (const item of order.items) {
                // Ensure product association
                if (item.product && typeof item.product === 'object' && item.product.ID) {
                    item.product_ID = item.product.ID;
                }
                // Set order reference
                if (!item.order_ID && order.ID) {
                    item.order_ID = order.ID;
                }
            }
        }
    });
    // Handle composition updates
    srv.after(['CREATE', 'UPDATE'], Orders, async (result, req) => {
        if (req.data.items && Array.isArray(req.data.items)) {
            // Ensure all order items have the correct order_ID
            const orderId = result.ID || req.data.ID;
            if (orderId) {
                for (const item of req.data.items) {
                    if (!item.order_ID) {
                        await srv.tx(req).run(UPDATE.entity(OrderItems)
                            .where({ ID: item.ID })
                            .set({ order_ID: orderId }));
                    }
                }
            }
        }
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItbWFuYWdlbWVudC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3JkZXItbWFuYWdlbWVudC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwwQ0FBMEM7QUFDMUMscUNBQXFDO0FBQ3JDLHNDQUFzQztBQUN0Qyx3Q0FBd0M7QUFDeEMsc0VBQXNFO0FBQ3RFLGtDQUFrQztBQUNsQyw2REFBNkQ7QUFDN0QsMEVBQTBFO0FBQzFFLG1CQUFtQjtBQUNuQiwyQ0FBMkM7QUFDM0MsV0FBVztBQUNYLGdCQUFnQjtBQUNoQixRQUFRO0FBQ1Isd0NBQXdDO0FBQ3hDLGlCQUFpQjtBQUNqQix3RUFBd0U7QUFDeEUsNkJBQTZCO0FBQzdCLHFFQUFxRTtBQUNyRSxnQkFBZ0I7QUFDaEIsUUFBUTtBQUNSLFFBQVE7Ozs7O0FBaUtSLDRCQXFRQztBQXBhRCw4REFBOEQ7QUFDOUQsMEVBQTBFO0FBQzFFLHNEQUFzRDtBQUN0RCxnQkFBZ0I7QUFDaEIsUUFBUTtBQUNSLHlDQUF5QztBQUN6QyxpQkFBaUI7QUFDakIsMkVBQTJFO0FBQzNFLDhCQUE4QjtBQUM5QixzRUFBc0U7QUFDdEUsZ0JBQWdCO0FBQ2hCLFFBQVE7QUFDUixRQUFRO0FBRVIsMkRBQTJEO0FBQzNELG1DQUFtQztBQUNuQyw0REFBNEQ7QUFDNUQsZ0JBQWdCO0FBQ2hCLFFBQVE7QUFFUixpQ0FBaUM7QUFDakMsaUJBQWlCO0FBQ2pCLDhFQUE4RTtBQUU5RSx1QkFBdUI7QUFDdkIsb0ZBQW9GO0FBQ3BGLGdCQUFnQjtBQUNoQixRQUFRO0FBRVIsV0FBVztBQUNYLDJCQUEyQjtBQUMzQiwwQ0FBMEM7QUFDMUMsb0NBQW9DO0FBQ3BDLFVBQVU7QUFDVix5REFBeUQ7QUFDekQsZ0JBQWdCO0FBQ2hCLFFBQVE7QUFFUixnQ0FBZ0M7QUFDaEMsaUNBQWlDO0FBRWpDLFlBQVk7QUFDWiwrRUFBK0U7QUFDL0UsOERBQThEO0FBQzlELDZCQUE2QjtBQUM3QixxREFB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LENBQUM7Z0JBQ1osS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNuQixNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUNuQixNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQzs2QkFDdEIsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQzs2QkFDdEIsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQzlCLENBQUM7b0JBQ0osQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IGNkcywgeyB1cGRhdGUgfSBmcm9tIFwiQHNhcC9jZHNcIjtcclxuLy8gY29uc3QgeyBTRUxFQ1QsIFVQREFURSB9ID0gY2RzLnFsO1xyXG4vLyBpbXBvcnQgeyBSZXF1ZXN0IH0gZnJvbSBcIkBzYXAvY2RzXCI7XHJcbi8vIGV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChzcnYpIHtcclxuLy8gICBjb25zdCB7IE9yZGVycywgUHJvZHVjdHMsIEN1c3RvbWVycywgT3JkZXJJdGVtcyB9ID0gc3J2LmVudGl0aWVzO1xyXG4vLyAgIGNvbnN0IGkxOG4gPSAgY2RzLmkxOG4ubGFiZWxzXHJcbi8vICAgc3J2LmJlZm9yZShcIkNSRUFURVwiLCBQcm9kdWN0cywgYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xyXG4vLyAgICAgaWYgKCFyZXEuZGF0YS5uYW1lIHx8ICFyZXEuZGF0YS5wcmljZSB8fCAhcmVxLmRhdGEuc3RvY2tRdWFudGl0eSkge1xyXG4vLyAgICAgICByZXEuZXJyb3IoXHJcbi8vICAgICAgICAgNDAwLCBpMThuLmF0KCdwcm9kdWN0LnJlcXVpcmVkJylcclxuLy8gICAgICAgKTtcclxuLy8gICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgY29uc3QgZXhpc3RpbmdQcm9kdWN0ID0gYXdhaXQgc3J2XHJcbi8vICAgICAgIC50eChyZXEpXHJcbi8vICAgICAgIC5ydW4oU0VMRUNULm9uZS5mcm9tKFByb2R1Y3RzKS53aGVyZSh7IG5hbWU6IHJlcS5kYXRhLm5hbWUgfSkpO1xyXG4vLyAgICAgaWYgKGV4aXN0aW5nUHJvZHVjdCkge1xyXG4vLyAgICAgICByZXEuZXJyb3IoNDAwLCBpMThuLmF0KCdwcm9kdWN0LmV4aXN0cycsIFtyZXEuZGF0YS5uYW1lIF0pKTtcclxuLy8gICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG4vLyAgIH0pO1xyXG5cclxuLy8gICBzcnYuYmVmb3JlKFwiQ1JFQVRFXCIsIEN1c3RvbWVycywgYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xyXG4vLyAgICAgaWYgKCFyZXEuZGF0YS5maXJzdE5hbWUgfHwgIXJlcS5kYXRhLmVtYWlsIHx8ICFyZXEuZGF0YS5sYXN0TmFtZSkge1xyXG4vLyAgICAgICByZXEuZXJyb3IoNDAwLCBpMThuLmF0KCdjdXN0b21lci5yZXF1aXJlZCcpKTtcclxuLy8gICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgY29uc3QgZXhpc3RpbmdDdXN0b21lciA9IGF3YWl0IHNydlxyXG4vLyAgICAgICAudHgocmVxKVxyXG4vLyAgICAgICAucnVuKFNFTEVDVC5vbmUuZnJvbShDdXN0b21lcnMpLndoZXJlKHsgZW1haWw6IHJlcS5kYXRhLmVtYWlsIH0pKTtcclxuLy8gICAgIGlmIChleGlzdGluZ0N1c3RvbWVyKSB7XHJcbi8vICAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ2N1c3RvbWVyLmV4aXN0cycsIFtyZXEuZGF0YS5lbWFpbF0pKTtcclxuLy8gICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG4vLyAgIH0pO1xyXG5cclxuLy8gICBzcnYuYmVmb3JlKFwiQ1JFQVRFXCIsIE9yZGVycywgYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xyXG4vLyAgICAgaWYgKCFyZXEuZGF0YS5jdXN0b21lcl9JRCkge1xyXG4vLyAgICAgICByZXEuZXJyb3IoNDAwLCBpMThuLmF0KCdvcmRlci5jdXN0b21lci5yZXF1aXJlZCcpKTtcclxuLy8gICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG5cclxuLy8gICAgIGNvbnN0IGN1c3RvbWVyID0gYXdhaXQgc3J2XHJcbi8vICAgICAgIC50eChyZXEpXHJcbi8vICAgICAgIC5ydW4oU0VMRUNULm9uZS5mcm9tKEN1c3RvbWVycykud2hlcmUoeyBJRDogcmVxLmRhdGEuY3VzdG9tZXJfSUQgfSkpO1xyXG5cclxuLy8gICAgIGlmICghY3VzdG9tZXIpIHtcclxuLy8gICAgICAgcmVxLmVycm9yKDQwNCwgaTE4bi5hdCgnb3JkZXIuY3VzdG9tZXIubm90Zm91bmQnLCBbcmVxLmRhdGEuY3VzdG9tZXJfSURdKSk7XHJcbi8vICAgICAgIHJldHVybjtcclxuLy8gICAgIH1cclxuXHJcbi8vICAgICBpZiAoXHJcbi8vICAgICAgICFyZXEuZGF0YS5pdGVtcyB8fFxyXG4vLyAgICAgICAhQXJyYXkuaXNBcnJheShyZXEuZGF0YS5pdGVtcykgfHxcclxuLy8gICAgICAgcmVxLmRhdGEuaXRlbXMubGVuZ3RoID09PSAwXHJcbi8vICAgICApIHtcclxuLy8gICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgnb3JkZXIuaXRlbXMucmVxdWlyZWQnKSk7XHJcbi8vICAgICAgIHJldHVybjtcclxuLy8gICAgIH1cclxuXHJcbi8vICAgICBsZXQgdG90YWxPcmRlckFtb3VudCA9IDA7XHJcbi8vICAgICBjb25zdCBwcm9jZXNzZWRJdGVtcyA9IFtdO1xyXG5cclxuLy8gICAgIHRyeSB7XHJcbi8vICAgICAgIGNvbnN0IHByb2R1Y3RQcm9taXNlcyA9IHJlcS5kYXRhLml0ZW1zLm1hcChhc3luYyAob3JkZXJJdGVtOiBhbnkpID0+IHtcclxuLy8gICAgICAgICBpZiAoIW9yZGVySXRlbS5wcm9kdWN0X0lEIHx8ICFvcmRlckl0ZW0ucXVhbnRpdHkpIHtcclxuLy8gICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuLy8gICAgICAgICAgICAgaTE4bi5hdCgnb3JkZXIuaXRlbS5kZXRhaWxzLnJlcXVpcmVkJylcclxuLy8gICAgICAgICAgICk7XHJcbi8vICAgICAgICAgfVxyXG5cclxuLy8gICAgICAgICBjb25zdCBwcm9kdWN0ID0gYXdhaXQgc3J2XHJcbi8vICAgICAgICAgICAudHgocmVxKVxyXG4vLyAgICAgICAgICAgLnJ1bihTRUxFQ1Qub25lLmZyb20oUHJvZHVjdHMpLndoZXJlKHsgSUQ6IG9yZGVySXRlbS5wcm9kdWN0X0lEIH0pKTtcclxuXHJcbi8vICAgICAgICAgaWYgKCFwcm9kdWN0KSB7XHJcbi8vICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaTE4bi5hdCgnb3JkZXIucHJvZHVjdC5ub3Rmb3VuZCcsIFtvcmRlckl0ZW0ucHJvZHVjdF9JRF0pKTtcclxuLy8gICAgICAgICB9XHJcblxyXG4vLyAgICAgICAgIGlmIChwcm9kdWN0LnN0b2NrUXVhbnRpdHkgPCBvcmRlckl0ZW0ucXVhbnRpdHkpIHtcclxuLy8gICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuLy8gICAgICAgICAgICAgaTE4bi5hdCgnb3JkZXIuaW5zdWZmaWNpZW50LnN0b2NrJywge1xyXG4vLyAgICAgICAgICAgICAgIHByb2R1Y3Q6IHByb2R1Y3QubmFtZSxcclxuLy8gICAgICAgICAgICAgICByZXF1ZXN0ZWQ6IG9yZGVySXRlbS5xdWFudGl0eSxcclxuLy8gICAgICAgICAgICAgICBhdmFpbGFibGU6IHByb2R1Y3Quc3RvY2tRdWFudGl0eSxcclxuLy8gICAgICAgICAgICAgfSlcclxuLy8gICAgICAgICAgICk7XHJcbi8vICAgICAgICAgfVxyXG5cclxuLy8gICAgICAgICBjb25zdCBpdGVtVG90YWxQcmljZSA9IHByb2R1Y3QucHJpY2UgKiBvcmRlckl0ZW0ucXVhbnRpdHk7XHJcbi8vICAgICAgICAgdG90YWxPcmRlckFtb3VudCArPSBpdGVtVG90YWxQcmljZTtcclxuXHJcbi8vICAgICAgICAgcmV0dXJuIHtcclxuLy8gICAgICAgICAgIG9yaWdpbmFsOiBvcmRlckl0ZW0sXHJcbi8vICAgICAgICAgICBwcm9kdWN0OiBwcm9kdWN0LFxyXG4vLyAgICAgICAgICAgdW5pdFByaWNlOiBwcm9kdWN0LnByaWNlLFxyXG4vLyAgICAgICAgICAgdG90YWxQcmljZTogaXRlbVRvdGFsUHJpY2UsXHJcbi8vICAgICAgICAgfTtcclxuLy8gICAgICAgfSk7XHJcblxyXG4vLyAgICAgICBjb25zdCB2YWxpZGF0ZWRJdGVtcyA9IGF3YWl0IFByb21pc2UuYWxsKHByb2R1Y3RQcm9taXNlcyk7XHJcblxyXG4vLyAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsaWRhdGVkSXRlbXMpIHtcclxuLy8gICAgICAgICBhd2FpdCBzcnYudHgocmVxKS5ydW4oXHJcbi8vICAgICAgICAgICBVUERBVEUuZW50aXR5KFByb2R1Y3RzKVxyXG4vLyAgICAgICAgICAgICAud2hlcmUoeyBJRDogaXRlbS5vcmlnaW5hbC5wcm9kdWN0X0lEIH0pXHJcbi8vICAgICAgICAgICAgIC5zZXQoe1xyXG4vLyAgICAgICAgICAgICAgIHN0b2NrUXVhbnRpdHk6IHsgXCItPVwiOiBpdGVtLm9yaWdpbmFsLnF1YW50aXR5IH0sXHJcbi8vICAgICAgICAgICAgIH0pXHJcbi8vICAgICAgICAgKTtcclxuXHJcbi8vICAgICAgICAgaXRlbS5vcmlnaW5hbC51bml0UHJpY2UgPSBpdGVtLnVuaXRQcmljZTtcclxuLy8gICAgICAgICBpdGVtLm9yaWdpbmFsLnRvdGFsUHJpY2UgPSBpdGVtLnRvdGFsUHJpY2U7XHJcbi8vICAgICAgIH1cclxuXHJcbi8vICAgICAgIHJlcS5kYXRhLnRvdGFsQW1vdW50ID0gdG90YWxPcmRlckFtb3VudDtcclxuLy8gICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbi8vICAgICAgIHJlcS5lcnJvcig0MDAsIGVycm9yLm1lc3NhZ2UpO1xyXG4vLyAgICAgICByZXR1cm47XHJcbi8vICAgICB9XHJcbi8vICAgfSk7XHJcblxyXG4vLyAgIHNydi5iZWZvcmUoXCJVUERBVEVcIiwgT3JkZXJzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbi8vICAgICBpZiAocmVxLmRhdGEuaXRlbXMgJiYgcmVxLmRhdGEuaXRlbXMubGVuZ3RoID09PSAwKSB7XHJcbi8vICAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ3VwZGF0ZS5vcmRlci53aXRob3V0Lml0ZW1zJykpO1xyXG4vLyAgICAgICByZXR1cm47XHJcbi8vICAgICB9XHJcbi8vICAgICBmb3IgKGxldCBrZXkgaW4gcmVxLmRhdGEpIHtcclxuLy8gICAgICAgaWYgKFxyXG4vLyAgICAgICAgIHJlcS5kYXRhW2tleV0gPT09IG51bGwgfHxcclxuLy8gICAgICAgICByZXEuZGF0YVtrZXldID09PSB1bmRlZmluZWQgfHxcclxuLy8gICAgICAgICByZXEuZGF0YVtrZXldID09PSBcIlwiXHJcbi8vICAgICAgICkge1xyXG4vLyAgICAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ3VwZGF0ZS5udWxsLmVycm9yJywgW2tleV0pKTtcclxuLy8gICAgICAgICByZXR1cm47XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH1cclxuXHJcbi8vICAgICBpZiAocmVxLmRhdGEuaXRlbXMpIHtcclxuLy8gICAgICAgbGV0IHRvdGFsT3JkZXJBbW91bnQgPSAwO1xyXG4vLyAgICAgICB0cnkge1xyXG4vLyAgICAgICAgY29uc3QgcHJvZHVjdCA9IGF3YWl0IHNydi50eChyZXEpLnJ1bihcclxuLy8gICAgICAgICBTRUxFQ1Qub25lLmZyb20oUHJvZHVjdHMpLndoZXJlKHsgSUQ6IHJlcS5kYXRhLml0ZW1zWzBdLnByb2R1Y3RfSUQgfSlcclxuLy8gICAgICAgICkgXHJcbi8vICAgICAgICBpZighcHJvZHVjdCl7XHJcbi8vICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGkxOG4uYXQoJ29yZGVyLnByb2R1Y3Qubm90Zm91bmQnLCBbcmVxLmRhdGEuaXRlbXNbMF0ucHJvZHVjdF9JRF0pKTtcclxuLy8gICAgICAgIH1cclxuLy8gICAgICAgICBpZihwcm9kdWN0LnN0b2NrUXVhbnRpdHkgPCByZXEuZGF0YS5pdGVtc1swXS5xdWFudGl0eSl7XHJcbi8vICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaTE4bi5hdCgndXBkYXRlLmluc3VmZmljaWVudC5zdG9jaycsIFtcclxuLy8gICAgICAgICAgICAgcHJvZHVjdC5uYW1lLFxyXG4vLyAgICAgICAgICAgICByZXEuZGF0YS5pdGVtc1swXS5xdWFudGl0eSxcclxuLy8gICAgICAgICAgICAgcHJvZHVjdC5zdG9ja1F1YW50aXR5LFxyXG4vLyAgICAgICAgICAgXSkpO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgICBjb25zdCBpdGVtVG90YWxQcmljZSA9IHByb2R1Y3QucHJpY2UgKiByZXEuZGF0YS5pdGVtc1swXS5xdWFudGl0eTtcclxuLy8gICAgICAgICB0b3RhbE9yZGVyQW1vdW50ID0gaXRlbVRvdGFsUHJpY2U7XHJcbiAgICAgICAgXHJcbi8vICAgICAgICAgYXdhaXQgc3J2LnR4KHJlcSkucnVuKFxyXG4vLyAgICAgICAgICAgVVBEQVRFLmVudGl0eShQcm9kdWN0cylcclxuLy8gICAgICAgICAgICAgLndoZXJlKHsgSUQ6IHJlcS5kYXRhLml0ZW1zWzBdLnByb2R1Y3RfSUQgfSlcclxuLy8gICAgICAgICAgICAgLnNldCh7XHJcbi8vICAgICAgICAgICAgICAgc3RvY2tRdWFudGl0eTogeyBcIi09XCI6IHJlcS5kYXRhLml0ZW1zWzBdLnF1YW50aXR5IH0sXHJcbi8vICAgICAgICAgICAgIH0pXHJcbi8vICAgICAgICAgKTtcclxuLy8gICAgICAgICByZXEuZGF0YS5pdGVtc1swXS51bml0UHJpY2UgPSBwcm9kdWN0LnByaWNlO1xyXG4vLyAgICAgICAgIHJlcS5kYXRhLml0ZW1zWzBdLnRvdGFsUHJpY2UgPSBpdGVtVG90YWxQcmljZTtcclxuLy8gICAgICAgICByZXEuZGF0YS50b3RhbEFtb3VudCA9IHRvdGFsT3JkZXJBbW91bnQ7XHJcbi8vICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbi8vICAgICAgICAgcmVxLmVycm9yKDQwMCwgZXJyb3IubWVzc2FnZSk7XHJcbi8vICAgICAgICAgcmV0dXJuO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vICAgfSk7XHJcbi8vIH07XHJcblxyXG5cclxuXHJcbmltcG9ydCBjZHMsIHsgdXBkYXRlIH0gZnJvbSBcIkBzYXAvY2RzXCI7XHJcbmNvbnN0IHsgU0VMRUNULCBVUERBVEUgfSA9IGNkcy5xbDtcclxuaW1wb3J0IHsgUmVxdWVzdCB9IGZyb20gXCJAc2FwL2Nkc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKHNydikge1xyXG4gIGNvbnN0IHsgT3JkZXJzLCBQcm9kdWN0cywgQ3VzdG9tZXJzLCBPcmRlckl0ZW1zIH0gPSBzcnYuZW50aXRpZXM7XHJcbiAgY29uc3QgaTE4biA9IGNkcy5pMThuLmxhYmVscztcclxuXHJcbiAgc3J2LmJlZm9yZShcIkNSRUFURVwiLCBQcm9kdWN0cywgYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xyXG4gICAgaWYgKCFyZXEuZGF0YS5uYW1lIHx8ICFyZXEuZGF0YS5wcmljZSB8fCAhcmVxLmRhdGEuc3RvY2tRdWFudGl0eSkge1xyXG4gICAgICByZXEuZXJyb3IoNDAwLCBpMThuLmF0KCdwcm9kdWN0LnJlcXVpcmVkJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBleGlzdGluZ1Byb2R1Y3QgPSBhd2FpdCBzcnZcclxuICAgICAgLnR4KHJlcSlcclxuICAgICAgLnJ1bihTRUxFQ1Qub25lLmZyb20oUHJvZHVjdHMpLndoZXJlKHsgbmFtZTogcmVxLmRhdGEubmFtZSB9KSk7XHJcbiAgICBpZiAoZXhpc3RpbmdQcm9kdWN0KSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ3Byb2R1Y3QuZXhpc3RzJywgW3JlcS5kYXRhLm5hbWVdKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc3J2LmJlZm9yZShcIkNSRUFURVwiLCBDdXN0b21lcnMsIGFzeW5jIChyZXE6IFJlcXVlc3QpID0+IHtcclxuICAgIGlmICghcmVxLmRhdGEuZmlyc3ROYW1lIHx8ICFyZXEuZGF0YS5lbWFpbCB8fCAhcmVxLmRhdGEubGFzdE5hbWUpIHtcclxuICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgnY3VzdG9tZXIucmVxdWlyZWQnKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGV4aXN0aW5nQ3VzdG9tZXIgPSBhd2FpdCBzcnZcclxuICAgICAgLnR4KHJlcSlcclxuICAgICAgLnJ1bihTRUxFQ1Qub25lLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IGVtYWlsOiByZXEuZGF0YS5lbWFpbCB9KSk7XHJcbiAgICBpZiAoZXhpc3RpbmdDdXN0b21lcikge1xyXG4gICAgICByZXEuZXJyb3IoNDAwLCBpMThuLmF0KCdjdXN0b21lci5leGlzdHMnLCBbcmVxLmRhdGEuZW1haWxdKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc3J2LmJlZm9yZShcIkNSRUFURVwiLCBPcmRlcnMsIGFzeW5jIChyZXE6IFJlcXVlc3QpID0+IHtcclxuICAgIC8vIEhhbmRsZSBib3RoIGFzc29jaWF0aW9uIG9iamVjdCBhbmQgZGlyZWN0IElEXHJcbiAgICBsZXQgY3VzdG9tZXJJZDtcclxuICAgIGlmIChyZXEuZGF0YS5jdXN0b21lciAmJiB0eXBlb2YgcmVxLmRhdGEuY3VzdG9tZXIgPT09ICdvYmplY3QnICYmIHJlcS5kYXRhLmN1c3RvbWVyLklEKSB7XHJcbiAgICAgIGN1c3RvbWVySWQgPSByZXEuZGF0YS5jdXN0b21lci5JRDtcclxuICAgICAgLy8gU2V0IHRoZSBhdXRvLWdlbmVyYXRlZCBmb3JlaWduIGtleVxyXG4gICAgICByZXEuZGF0YS5jdXN0b21lcl9JRCA9IGN1c3RvbWVySWQ7XHJcbiAgICB9IGVsc2UgaWYgKHJlcS5kYXRhLmN1c3RvbWVyX0lEKSB7XHJcbiAgICAgIGN1c3RvbWVySWQgPSByZXEuZGF0YS5jdXN0b21lcl9JRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ29yZGVyLmN1c3RvbWVyLnJlcXVpcmVkJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3VzdG9tZXIgPSBhd2FpdCBzcnZcclxuICAgICAgLnR4KHJlcSlcclxuICAgICAgLnJ1bihTRUxFQ1Qub25lLmZyb20oQ3VzdG9tZXJzKS53aGVyZSh7IElEOiBjdXN0b21lcklkIH0pKTtcclxuXHJcbiAgICBpZiAoIWN1c3RvbWVyKSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDQsIGkxOG4uYXQoJ29yZGVyLmN1c3RvbWVyLm5vdGZvdW5kJywgW2N1c3RvbWVySWRdKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoXHJcbiAgICAgICFyZXEuZGF0YS5pdGVtcyB8fFxyXG4gICAgICAhQXJyYXkuaXNBcnJheShyZXEuZGF0YS5pdGVtcykgfHxcclxuICAgICAgcmVxLmRhdGEuaXRlbXMubGVuZ3RoID09PSAwXHJcbiAgICApIHtcclxuICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgnb3JkZXIuaXRlbXMucmVxdWlyZWQnKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdG90YWxPcmRlckFtb3VudCA9IDA7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcHJvZHVjdFByb21pc2VzID0gcmVxLmRhdGEuaXRlbXMubWFwKGFzeW5jIChvcmRlckl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIC8vIEhhbmRsZSBib3RoIGFzc29jaWF0aW9uIG9iamVjdCBhbmQgZGlyZWN0IElEXHJcbiAgICAgICAgbGV0IHByb2R1Y3RJZDtcclxuICAgICAgICBpZiAob3JkZXJJdGVtLnByb2R1Y3QgJiYgdHlwZW9mIG9yZGVySXRlbS5wcm9kdWN0ID09PSAnb2JqZWN0JyAmJiBvcmRlckl0ZW0ucHJvZHVjdC5JRCkge1xyXG4gICAgICAgICAgcHJvZHVjdElkID0gb3JkZXJJdGVtLnByb2R1Y3QuSUQ7XHJcbiAgICAgICAgICAvLyBTZXQgdGhlIGF1dG8tZ2VuZXJhdGVkIGZvcmVpZ24ga2V5XHJcbiAgICAgICAgICBvcmRlckl0ZW0ucHJvZHVjdF9JRCA9IHByb2R1Y3RJZDtcclxuICAgICAgICB9IGVsc2UgaWYgKG9yZGVySXRlbS5wcm9kdWN0X0lEKSB7XHJcbiAgICAgICAgICBwcm9kdWN0SWQgPSBvcmRlckl0ZW0ucHJvZHVjdF9JRDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGkxOG4uYXQoJ29yZGVyLml0ZW0uZGV0YWlscy5yZXF1aXJlZCcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghb3JkZXJJdGVtLnF1YW50aXR5KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaTE4bi5hdCgnb3JkZXIuaXRlbS5kZXRhaWxzLnJlcXVpcmVkJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJvZHVjdCA9IGF3YWl0IHNydlxyXG4gICAgICAgICAgLnR4KHJlcSlcclxuICAgICAgICAgIC5ydW4oU0VMRUNULm9uZS5mcm9tKFByb2R1Y3RzKS53aGVyZSh7IElEOiBwcm9kdWN0SWQgfSkpO1xyXG5cclxuICAgICAgICBpZiAoIXByb2R1Y3QpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihpMThuLmF0KCdvcmRlci5wcm9kdWN0Lm5vdGZvdW5kJywgW3Byb2R1Y3RJZF0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9kdWN0LnN0b2NrUXVhbnRpdHkgPCBvcmRlckl0ZW0ucXVhbnRpdHkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgaTE4bi5hdCgnb3JkZXIuaW5zdWZmaWNpZW50LnN0b2NrJywge1xyXG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHByb2R1Y3QubmFtZSxcclxuICAgICAgICAgICAgICByZXF1ZXN0ZWQ6IG9yZGVySXRlbS5xdWFudGl0eSxcclxuICAgICAgICAgICAgICBhdmFpbGFibGU6IHByb2R1Y3Quc3RvY2tRdWFudGl0eSxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpdGVtVG90YWxQcmljZSA9IHByb2R1Y3QucHJpY2UgKiBvcmRlckl0ZW0ucXVhbnRpdHk7XHJcbiAgICAgICAgdG90YWxPcmRlckFtb3VudCArPSBpdGVtVG90YWxQcmljZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG9yaWdpbmFsOiBvcmRlckl0ZW0sXHJcbiAgICAgICAgICBwcm9kdWN0OiBwcm9kdWN0LFxyXG4gICAgICAgICAgdW5pdFByaWNlOiBwcm9kdWN0LnByaWNlLFxyXG4gICAgICAgICAgdG90YWxQcmljZTogaXRlbVRvdGFsUHJpY2UsXHJcbiAgICAgICAgICBwcm9kdWN0SWQ6IHByb2R1Y3RJZCxcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IHZhbGlkYXRlZEl0ZW1zID0gYXdhaXQgUHJvbWlzZS5hbGwocHJvZHVjdFByb21pc2VzKTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWxpZGF0ZWRJdGVtcykge1xyXG4gICAgICAgIGF3YWl0IHNydi50eChyZXEpLnJ1bihcclxuICAgICAgICAgIFVQREFURS5lbnRpdHkoUHJvZHVjdHMpXHJcbiAgICAgICAgICAgIC53aGVyZSh7IElEOiBpdGVtLnByb2R1Y3RJZCB9KVxyXG4gICAgICAgICAgICAuc2V0KHtcclxuICAgICAgICAgICAgICBzdG9ja1F1YW50aXR5OiB7IFwiLT1cIjogaXRlbS5vcmlnaW5hbC5xdWFudGl0eSB9LFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGl0ZW0ub3JpZ2luYWwudW5pdFByaWNlID0gaXRlbS51bml0UHJpY2U7XHJcbiAgICAgICAgaXRlbS5vcmlnaW5hbC50b3RhbFByaWNlID0gaXRlbS50b3RhbFByaWNlO1xyXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgYXV0by1nZW5lcmF0ZWQgZm9yZWlnbiBrZXkgaXMgc2V0XHJcbiAgICAgICAgaXRlbS5vcmlnaW5hbC5wcm9kdWN0X0lEID0gaXRlbS5wcm9kdWN0SWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcS5kYXRhLnRvdGFsQW1vdW50ID0gdG90YWxPcmRlckFtb3VudDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHNydi5iZWZvcmUoXCJVUERBVEVcIiwgT3JkZXJzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbiAgICBpZiAocmVxLmRhdGEuaXRlbXMgJiYgcmVxLmRhdGEuaXRlbXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJlcS5lcnJvcig0MDAsIGkxOG4uYXQoJ3VwZGF0ZS5vcmRlci53aXRob3V0Lml0ZW1zJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIG51bGwvdW5kZWZpbmVkL2VtcHR5IGNoZWNrcyBtb3JlIGNhcmVmdWxseVxyXG4gICAgZm9yIChsZXQga2V5IGluIHJlcS5kYXRhKSB7XHJcbiAgICAgIGlmIChrZXkgIT09ICdpdGVtcycgJiYga2V5ICE9PSAnY3VzdG9tZXInICYmIChcclxuICAgICAgICByZXEuZGF0YVtrZXldID09PSBudWxsIHx8XHJcbiAgICAgICAgcmVxLmRhdGFba2V5XSA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgcmVxLmRhdGFba2V5XSA9PT0gXCJcIlxyXG4gICAgICApKSB7XHJcbiAgICAgICAgcmVxLmVycm9yKDQwMCwgaTE4bi5hdCgndXBkYXRlLm51bGwuZXJyb3InLCBba2V5XSkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXEuZGF0YS5pdGVtcyAmJiByZXEuZGF0YS5pdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGxldCB0b3RhbE9yZGVyQW1vdW50ID0gMDtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBIYW5kbGUgYm90aCBhc3NvY2lhdGlvbiBvYmplY3QgYW5kIGRpcmVjdCBJRCBmb3IgdGhlIGZpcnN0IGl0ZW1cclxuICAgICAgICBsZXQgcHJvZHVjdElkO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0SXRlbSA9IHJlcS5kYXRhLml0ZW1zWzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChmaXJzdEl0ZW0ucHJvZHVjdCAmJiB0eXBlb2YgZmlyc3RJdGVtLnByb2R1Y3QgPT09ICdvYmplY3QnICYmIGZpcnN0SXRlbS5wcm9kdWN0LklEKSB7XHJcbiAgICAgICAgICBwcm9kdWN0SWQgPSBmaXJzdEl0ZW0ucHJvZHVjdC5JRDtcclxuICAgICAgICAgIGZpcnN0SXRlbS5wcm9kdWN0X0lEID0gcHJvZHVjdElkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZmlyc3RJdGVtLnByb2R1Y3RfSUQpIHtcclxuICAgICAgICAgIHByb2R1Y3RJZCA9IGZpcnN0SXRlbS5wcm9kdWN0X0lEO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaTE4bi5hdCgnb3JkZXIuaXRlbS5kZXRhaWxzLnJlcXVpcmVkJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJvZHVjdCA9IGF3YWl0IHNydi50eChyZXEpLnJ1bihcclxuICAgICAgICAgIFNFTEVDVC5vbmUuZnJvbShQcm9kdWN0cykud2hlcmUoeyBJRDogcHJvZHVjdElkIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIXByb2R1Y3QpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihpMThuLmF0KCdvcmRlci5wcm9kdWN0Lm5vdGZvdW5kJywgW3Byb2R1Y3RJZF0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHByb2R1Y3Quc3RvY2tRdWFudGl0eSA8IGZpcnN0SXRlbS5xdWFudGl0eSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGkxOG4uYXQoJ3VwZGF0ZS5pbnN1ZmZpY2llbnQuc3RvY2snLCBbXHJcbiAgICAgICAgICAgIHByb2R1Y3QubmFtZSxcclxuICAgICAgICAgICAgZmlyc3RJdGVtLnF1YW50aXR5LFxyXG4gICAgICAgICAgICBwcm9kdWN0LnN0b2NrUXVhbnRpdHksXHJcbiAgICAgICAgICBdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGl0ZW1Ub3RhbFByaWNlID0gcHJvZHVjdC5wcmljZSAqIGZpcnN0SXRlbS5xdWFudGl0eTtcclxuICAgICAgICB0b3RhbE9yZGVyQW1vdW50ID0gaXRlbVRvdGFsUHJpY2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXdhaXQgc3J2LnR4KHJlcSkucnVuKFxyXG4gICAgICAgICAgVVBEQVRFLmVudGl0eShQcm9kdWN0cylcclxuICAgICAgICAgICAgLndoZXJlKHsgSUQ6IHByb2R1Y3RJZCB9KVxyXG4gICAgICAgICAgICAuc2V0KHtcclxuICAgICAgICAgICAgICBzdG9ja1F1YW50aXR5OiB7IFwiLT1cIjogZmlyc3RJdGVtLnF1YW50aXR5IH0sXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICBmaXJzdEl0ZW0udW5pdFByaWNlID0gcHJvZHVjdC5wcmljZTtcclxuICAgICAgICBmaXJzdEl0ZW0udG90YWxQcmljZSA9IGl0ZW1Ub3RhbFByaWNlO1xyXG4gICAgICAgIGZpcnN0SXRlbS5wcm9kdWN0X0lEID0gcHJvZHVjdElkO1xyXG4gICAgICAgIHJlcS5kYXRhLnRvdGFsQW1vdW50ID0gdG90YWxPcmRlckFtb3VudDtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICByZXEuZXJyb3IoNDAwLCBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gSGFuZGxlIGRyYWZ0IG9wZXJhdGlvbnMgLSBtb3JlIHJvYnVzdCBhcHByb2FjaFxyXG4gIHNydi5iZWZvcmUoWydkcmFmdFByZXBhcmUnXSwgT3JkZXJzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbiAgICAvLyBEb24ndCBwcm9jZXNzIGFzc29jaWF0aW9ucyBkdXJpbmcgZHJhZnQgcHJlcGFyZSB0byBhdm9pZCBleHBhbnNpb24gaXNzdWVzXHJcbiAgICBjb25zb2xlLmxvZygnRHJhZnQgcHJlcGFyZSAtIHNraXBwaW5nIGFzc29jaWF0aW9uIHByb2Nlc3NpbmcnKTtcclxuICB9KTtcclxuXHJcbiAgc3J2LmJlZm9yZShbJ2RyYWZ0QWN0aXZhdGUnXSwgT3JkZXJzLCBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XHJcbiAgICBjb25zdCBvcmRlciA9IHJlcS5kYXRhO1xyXG4gICAgY29uc29sZS5sb2coJ0RyYWZ0IGFjdGl2YXRlIC0gcHJvY2Vzc2luZyBhc3NvY2lhdGlvbnMnKTtcclxuICAgIFxyXG4gICAgLy8gT25seSBwcm9jZXNzIGlmIHdlIGhhdmUgdmFsaWQgZGF0YVxyXG4gICAgaWYgKCFvcmRlcikgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBIYW5kbGUgY3VzdG9tZXIgYXNzb2NpYXRpb25cclxuICAgIGlmIChvcmRlci5jdXN0b21lciAmJiB0eXBlb2Ygb3JkZXIuY3VzdG9tZXIgPT09ICdvYmplY3QnICYmIG9yZGVyLmN1c3RvbWVyLklEKSB7XHJcbiAgICAgIG9yZGVyLmN1c3RvbWVyX0lEID0gb3JkZXIuY3VzdG9tZXIuSUQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEhhbmRsZSBvcmRlciBpdGVtcyAtIGJlIG1vcmUgY2FyZWZ1bCB3aXRoIGNvbXBvc2l0aW9uXHJcbiAgICBpZiAob3JkZXIuaXRlbXMgJiYgQXJyYXkuaXNBcnJheShvcmRlci5pdGVtcykgJiYgb3JkZXIuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygb3JkZXIuaXRlbXMpIHtcclxuICAgICAgICAvLyBFbnN1cmUgcHJvZHVjdCBhc3NvY2lhdGlvblxyXG4gICAgICAgIGlmIChpdGVtLnByb2R1Y3QgJiYgdHlwZW9mIGl0ZW0ucHJvZHVjdCA9PT0gJ29iamVjdCcgJiYgaXRlbS5wcm9kdWN0LklEKSB7XHJcbiAgICAgICAgICBpdGVtLnByb2R1Y3RfSUQgPSBpdGVtLnByb2R1Y3QuSUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFNldCBvcmRlciByZWZlcmVuY2VcclxuICAgICAgICBpZiAoIWl0ZW0ub3JkZXJfSUQgJiYgb3JkZXIuSUQpIHtcclxuICAgICAgICAgIGl0ZW0ub3JkZXJfSUQgPSBvcmRlci5JRDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gSGFuZGxlIGNvbXBvc2l0aW9uIHVwZGF0ZXNcclxuICBzcnYuYWZ0ZXIoWydDUkVBVEUnLCAnVVBEQVRFJ10sIE9yZGVycywgYXN5bmMgKHJlc3VsdCwgcmVxKSA9PiB7XHJcbiAgICBpZiAocmVxLmRhdGEuaXRlbXMgJiYgQXJyYXkuaXNBcnJheShyZXEuZGF0YS5pdGVtcykpIHtcclxuICAgICAgLy8gRW5zdXJlIGFsbCBvcmRlciBpdGVtcyBoYXZlIHRoZSBjb3JyZWN0IG9yZGVyX0lEXHJcbiAgICAgIGNvbnN0IG9yZGVySWQgPSByZXN1bHQuSUQgfHwgcmVxLmRhdGEuSUQ7XHJcbiAgICAgIGlmIChvcmRlcklkKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJlcS5kYXRhLml0ZW1zKSB7XHJcbiAgICAgICAgICBpZiAoIWl0ZW0ub3JkZXJfSUQpIHtcclxuICAgICAgICAgICAgYXdhaXQgc3J2LnR4KHJlcSkucnVuKFxyXG4gICAgICAgICAgICAgIFVQREFURS5lbnRpdHkoT3JkZXJJdGVtcylcclxuICAgICAgICAgICAgICAgIC53aGVyZSh7IElEOiBpdGVtLklEIH0pXHJcbiAgICAgICAgICAgICAgICAuc2V0KHsgb3JkZXJfSUQ6IG9yZGVySWQgfSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufTsiXX0=