import cds, { update } from "@sap/cds";
const { SELECT, UPDATE } = cds.ql;
import { Request } from "@sap/cds";
export default async function (srv) {
  const { Orders, Products, Customers } = srv.entities;
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
}
