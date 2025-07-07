import cds from "@sap/cds";
import { ICustomer, IOrder, IProduct } from "../types/interfaces";
const testInstance = cds.test(__dirname + "/..");
describe("Business Validation Tests", () => {
  let testCustomer: ICustomer,
    testProduct1: IProduct,
    testProduct2: IProduct,
    order1: IOrder;
  let customerToDelete: ICustomer;
  let productToDelete: IProduct;
  let orderToDelete: IOrder;
  beforeAll(async () => {
    const customerResponse = await testInstance.post("/order-mgmt/Customers", {
      firstName: "Mupenzi",
      lastName: "Jackson",
      email: `jackson12@gmail.com`,
      phone: "250-666-5555",
    });

    testCustomer = customerResponse.data;

    const product1Response = await testInstance.post("/order-mgmt/Products", {
      name: `Validation Product 1`,
      description: "First validation test product",
      price: 39.99,
      stockQuantity: 25,
    });
    testProduct1 = product1Response.data;

    const product2Response = await testInstance.post("/order-mgmt/Products", {
      name: `Validation Product 2`,
      description: "Second validation test product",
      price: 19.99,
      stockQuantity: 10,
    });
    testProduct2 = product2Response.data;

    const orderResponse1 = await testInstance.post("/order-mgmt/Orders", {
      customer_ID: testCustomer.ID,
      status: "New",
      notes: "Corporate purchase",
      items: [
        {
          product_ID: testProduct1.ID,
          quantity: 2,
        },
        {
          product_ID: testProduct2.ID,
          quantity: 3,
        },
      ],
    });
    order1 = orderResponse1.data;
  });
  afterAll(async () => {
    if (order1 && order1.ID)
      await testInstance.delete(`/order-mgmt/Orders(${order1.ID})`);
    if (testCustomer && testCustomer.ID)
      await testInstance.delete(`/order-mgmt/Customers(${testCustomer.ID})`);
    if (testProduct1 && testProduct1.ID)
      await testInstance.delete(`/order-mgmt/Products(${testProduct1.ID})`);
    if (testProduct2 && testProduct2.ID)
      await testInstance.delete(`/order-mgmt/Products(${testProduct2.ID})`);
  });

  describe("Product Business Validations", () => {
    describe("Get Product Test cases", () => {
      it("Should get all products", async () => {
        const response = await testInstance.get("/order-mgmt/Products");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.value)).toBe(true);
        expect(response.data.value.length).toBeGreaterThanOrEqual(2);
      });
      it("Should get product by ID", async () => {
        const response = await testInstance.get(
          `/order-mgmt/Products(${testProduct1.ID})`
        );
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("ID", testProduct1.ID);
        expect(response.data).toHaveProperty("name", testProduct1.name);
      });
      it("Should return 404 for non-existent product ID", async () => {
        try {
          await testInstance.get("/order-mgmt/Products(839fsekkd3038dalfja)");
          fail("Expected 404 for non-existent product ID");
        } catch (error) {
          expect(error.response.status).toBe(404);
        }
      });
    });
    describe("Product Creation Validations", () => {
      it("Should enforce name is required", async () => {
        const invalidProduct = {
          name: undefined,
          description: "A product without a name",
          price: 10.99,
          stockQuantity: 5,
        };

        try {
          await testInstance.post("/order-mgmt/Products", invalidProduct);
          fail("Expected product without name to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Name, price, and stock quantity are required"
          );
        }
      });

      it("Should enforce price is required", async () => {
        const invalidProduct = {
          name: "No Price Product",
          description: "A product without a price",
          price: undefined,
          stockQuantity: 5,
        };

        try {
          await testInstance.post("/order-mgmt/Products", invalidProduct);
          fail("Expected product without price to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Name, price, and stock quantity are required"
          );
        }
      });

      it("Should enforce stock quantity is required", async () => {
        const invalidProduct = {
          name: "No Stock Product",
          description: "A product without stock quantity",
          price: 10.99,
          stockQuantity: undefined,
        };

        try {
          await testInstance.post("/order-mgmt/Products", invalidProduct);
          fail("Expected product without stock quantity to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Name, price, and stock quantity are required"
          );
        }
      });
      it("Should validate price is positive", async () => {
        const invalidProduct = {
          name: "Negative Price Product",
          description: "A product with negative price",
          price: -45,
          stockQuantity: 10,
        };

        try {
          await testInstance.post("/order-mgmt/Products", invalidProduct);
          fail("Expected negative price to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Price must be greater than 0"
          );
        }
      });

      it("Should validate stock quantity is positive", async () => {
        const invalidProduct = {
          name: "Negative Stock Product",
          description: "A product with negative stock",
          price: 15.99,
          stockQuantity: -2,
        };

        try {
          await testInstance.post("/order-mgmt/Products", invalidProduct);
          fail("Expected negative stock to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Stock quantity must be greater than 0"
          );
        }
      });

      it("Should successfully Create with all required field provided", async () => {
        const validProduct = {
          name: "Valid Product",
          price: 45.03,
          stockQuantity: 9,
          description: "Product with all required field",
          currency_code: "USD",
        };

        const response = await testInstance.post(
          "/order-mgmt/Products",
          validProduct
        );
        productToDelete = response.data;
        expect(response.status).toEqual(201);

        // Verify response structure
        expect(response.data).toHaveProperty("ID");
        expect(response.data).toHaveProperty("name");
        expect(response.data).toHaveProperty("price");
        expect(response.data).toHaveProperty("stockQuantity");
        expect(response.data).toHaveProperty("description");
        expect(response.data).toHaveProperty("createdAt");
        expect(response.data).toHaveProperty("modifiedAt");

        expect(response.data.name).toEqual(validProduct.name);
        expect(response.data.price).toEqual(validProduct.price);
        expect(response.data.stockQuantity).toEqual(validProduct.stockQuantity);
        expect(response.data.description).toEqual(validProduct.description);
      });
    });
    describe("Product Update Validations", () => {
      it("Should update product of a given ID", async () => {
        const beforeUpdateResponse = await testInstance.get(
          `/order-mgmt/Products(${testProduct1.ID})`
        );
        expect(beforeUpdateResponse.status).toBe(200);
        expect(beforeUpdateResponse.data).toHaveProperty("ID", testProduct1.ID);
        expect(beforeUpdateResponse.data).toHaveProperty(
          "name",
          testProduct1.name
        );
        const newProductData = {
          name: "Updated Product",
          stockQuantity: 20,
        };
        const response = await testInstance.patch(
          `/order-mgmt/Products(${testProduct1.ID})`,
          newProductData
        );
        const afterUpdateResponse = await testInstance.get(
          `/order-mgmt/Products(${testProduct1.ID})`
        );
        expect(response.status).toBe(200);
        expect(response.data.name).toBe(newProductData.name);
        expect(response.data.stockQuantity).toBe(newProductData.stockQuantity);
        expect(afterUpdateResponse.data.ID).toBe(testProduct1.ID);
        expect(afterUpdateResponse.data.stockQuantity).toBe(
          newProductData.stockQuantity
        );
      });
    });
    describe("Product Deletion Validations", () => {
      it("Should delete product of a given ID", async () => {
        const beforeDeleteResponse = await testInstance.get(
          `/order-mgmt/Products(${productToDelete.ID})`
        );
        expect(beforeDeleteResponse.status).toBe(200);
        expect(beforeDeleteResponse.data).toHaveProperty(
          "ID",
          productToDelete.ID
        );
        expect(beforeDeleteResponse.data).toHaveProperty(
          "name",
          beforeDeleteResponse.data.name
        );
        const response = await testInstance.delete(
          `/order-mgmt/Products(${productToDelete.ID})`
        );
        expect(response.status).toBe(204);
        expect(response.statusText).toBe("No Content");
        expect(response.data).toBeFalsy();

        try {
          await testInstance.get(`/order-mgmt/Products(${productToDelete.ID})`);
          fail("Expected product to be deleted");
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.error.message).toContain("Not Found");
        }
      });
    });
  });

  describe("Customer Business Validations", () => {
    describe("Get Customer Test cases", () => {
      it("Should get all customers", async () => {
        const response = await testInstance.get("/order-mgmt/Customers");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.value)).toBe(true);
        expect(response.data.value.length).toBeGreaterThanOrEqual(1);
      });
      it("Should get customer by ID", async () => {
        const response = await testInstance.get(
          `/order-mgmt/Customers(${testCustomer.ID})`
        );
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("ID", testCustomer.ID);
        expect(response.data).toHaveProperty(
          "firstName",
          testCustomer.firstName
        );
      });
      it("Should return 404 for non-existent customer ID", async () => {
        try {
          await testInstance.get("/order-mgmt/Customers(839fsekkd3038dalfja)");
          fail("Expected 404 for non-existent customer ID");
        } catch (error) {
          expect(error.response.status).toBe(404);
        }
      });
    });
    describe("Customer Creation Validations", () => {
      it("Should enforce first name is required", async () => {
        const invalidCustomer = {
          firstName: "",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "123-456-7890",
        };
        try {
          await testInstance.post("/order-mgmt/Customers", invalidCustomer);
          fail("Expected customer without first name to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain("are required");
        }
      });
      it("Should Reject Customer Creation with an existing email", async () => {
        const customerWithExistingEmail = {
          firstName: "Mugisha",
          lastName: "Doe",
          email: testCustomer.email,
          phone: "123-456-7890",
        };
        try {
          await testInstance.post(
            "/order-mgmt/Customers",
            customerWithExistingEmail
          );
          fail("Expected customer with existing email to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain("already exists");
        }
      });
      it("Should create customer with all required fields provided", async () => {
        const validCustomer = {
          firstName: "Jane",
          lastName: "Doe",
          email: `jane.doe${Date.now()}@example.com`,
          phone: "123-456-7890",
        };
        const response = await testInstance.post(
          "/order-mgmt/Customers",
          validCustomer
        );
        customerToDelete = response.data;
        expect(response.status).toEqual(201);
        expect(response.data).toHaveProperty("ID");
        expect(response.data).toHaveProperty(
          "firstName",
          validCustomer.firstName
        );
        expect(response.data).toHaveProperty(
          "lastName",
          validCustomer.lastName
        );
      });
    });
    describe("Customer Update Validations", () => {
      it("Should update customer of a given ID", async () => {
        const beforeUpdateResponse = await testInstance.get(
          `/order-mgmt/Customers(${testCustomer.ID})`
        );
        expect(beforeUpdateResponse.status).toBe(200);
        expect(beforeUpdateResponse.data).toHaveProperty("ID", testCustomer.ID);
        expect(beforeUpdateResponse.data).toHaveProperty(
          "firstName",
          testCustomer.firstName
        );
        const newCustomerData = {
          firstName: "Updated Name",
          lastName: "Updated Last Name",
        };
        const response = await testInstance.patch(
          `/order-mgmt/Customers(${testCustomer.ID})`,
          newCustomerData
        );
        const afterUpdateResponse = await testInstance.get(
          `/order-mgmt/Customers(${testCustomer.ID})`
        );
        expect(response.status).toBe(200);
        expect(response.data.firstName).toBe(newCustomerData.firstName);
        expect(response.data.lastName).toBe(newCustomerData.lastName);
        expect(afterUpdateResponse.data.ID).toBe(testCustomer.ID);
        expect(afterUpdateResponse.data.firstName).toBe(
          newCustomerData.firstName
        );
      });
    });
    describe("Customer Deletion Validations", () => {
      it("Should delete customer of a given ID", async () => {
        const beforeDeleteResponse = await testInstance.get(
          `/order-mgmt/Customers(${customerToDelete.ID})`
        );
        expect(beforeDeleteResponse.status).toBe(200);
        expect(beforeDeleteResponse.data).toHaveProperty(
          "ID",
          customerToDelete.ID
        );
        expect(beforeDeleteResponse.data).toHaveProperty(
          "firstName",
          beforeDeleteResponse.data.firstName
        );
        const response = await testInstance.delete(
          `/order-mgmt/Customers(${customerToDelete.ID})`
        );
        expect(response.status).toBe(204);
        expect(response.statusText).toBe("No Content");
        expect(response.data).toBeFalsy();

        try {
          await testInstance.get(
            `/order-mgmt/Customers(${customerToDelete.ID})`
          );
          fail("Expected customer to be deleted");
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.error.message).toContain("Not Found");
        }
      });
    });
  });
  describe("Order Complex Business Validations", () => {
    describe("Order Creation Validations", () => {
      it("Should reject order without customer ID", async () => {
        const order = {
          items: [
            {
              product_ID: testProduct1.ID,
              quantity: 2,
            },
          ],
        };

        try {
          await testInstance.post("/order-mgmt/Orders", order);
          fail("Expected order without customer ID to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Customer ID is required"
          );
        }
      });

      it("Should reject if order items are empty", async () => {
        const order = {
          customer_ID: testCustomer.ID,
          items: [],
        };

        try {
          await testInstance.post("/order-mgmt/Orders", order);
          fail("Expected order with empty items to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Order must contain at least one item"
          );
        }
      });

      it("Should reject order if any item is missing product ID or quantity", async () => {
        const order = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: testProduct1.ID,
              quantity: 2,
            },
            {
              product_ID: testProduct2.ID,
            },
          ],
        };

        try {
          await testInstance.post("/order-mgmt/Orders", order);
          fail("Expected order with missing item details to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Product ID and quantity are required for all order items"
          );
        }
      });

      it("Should reject order if product does not exist", async () => {
        const order = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: "non-existent-product-id",
              quantity: 2,
            },
          ],
        };

        try {
          await testInstance.post("/order-mgmt/Orders", order);
          fail("Expected order with non-existent product to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain("not found");
        }
      });

      it("Should reject order if Customer does not exist", async () => {
        const order = {
          customer_ID: "non-existent-customer-id",
          items: [
            {
              product_ID: testProduct1.ID,
              quantity: 2,
            },
          ],
        };

        try {
          await testInstance.post("/order-mgmt/Orders", order);
          fail("Expected order with non-existent customer to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.error.message).toContain(
            "Customer with ID non-existent-customer-id not found"
          );
        }
      });
      it("Should calculate order total correctly", async () => {
        const order = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: testProduct1.ID,
              quantity: 2,
            },
            {
              product_ID: testProduct2.ID,
              quantity: 3,
            },
          ],
        };

        const response = await testInstance.post("/order-mgmt/Orders", order);
        orderToDelete = response.data;
        expect(response.status).toBe(201);

        const expectedTotal = testProduct1.price * 2 + testProduct2.price * 3;
        expect(response.data.totalAmount).toBe(expectedTotal);

        const orderItems = await testInstance.get(
          `/order-mgmt/Orders(${response.data.ID})/items`
        );
        expect(orderItems.data.value).toBeDefined();
        expect(orderItems.data.value.length).toBe(2);
        const firstItem = orderItems.data.value.find(
          (item) => item.product_ID === testProduct1.ID
        );
        expect(firstItem).toBeDefined();
        expect(firstItem.unitPrice).toBe(testProduct1.price);
        expect(firstItem.totalPrice).toBe(testProduct1.price * 2);

        const secondItem = orderItems.data.value.find(
          (item) => item.product_ID === testProduct2.ID
        );
        expect(secondItem).toBeDefined();
        expect(secondItem.unitPrice).toBe(testProduct2.price);
        expect(secondItem.totalPrice).toBe(testProduct2.price * 3);
      });

      it("Should handle complex concurrent stock validation", async () => {
        const limitedProductResponse = await testInstance.post(
          "/order-mgmt/Products",
          {
            name: `Limited Stock Product ${Date.now()}`,
            description: "Product with very limited stock",
            price: 99.99,
            stockQuantity: 10,
          }
        );
        const limitedProduct = limitedProductResponse.data;

        const order1 = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: limitedProduct.ID,
              quantity: 6,
            },
          ],
        };

        const order2 = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: limitedProduct.ID,
              quantity: 4,
            },
          ],
        };

        const response1 = await testInstance.post("/order-mgmt/Orders", order1);
        console.log("Order 1 Response:===============>", response1.data);
        expect(response1.status).toBe(201);
        expect(response1.data.customer_ID).toBe(testCustomer.ID);
        expect(response1.data.items.length).toBe(1);
        expect(response1.data.items[0].product_ID).toBe(limitedProduct.ID);

        const response2 = await testInstance.post("/order-mgmt/Orders", order2);
        expect(response2.status).toBe(201);
        expect(response2.data.customer_ID).toBe(testCustomer.ID);
        expect(response2.data.items.length).toBe(1);
        expect(response2.data.items[0].product_ID).toBe(limitedProduct.ID);

        const updatedProductResponse = await testInstance.get(
          `/order-mgmt/Products(${limitedProduct.ID})`
        );
        expect(updatedProductResponse.data.stockQuantity).toBe(0);

        const order3 = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: limitedProduct.ID,
              quantity: 1,
            },
          ],
        };

        try {
          await testInstance.post("/order-mgmt/Orders", order3);
          fail("Expected order to be rejected due to insufficient stock");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Not enough stock available"
          );
        }
      });
    });
    describe("Update Order Validations", () => {
      it("Should reject if order items are empty", async () => {
        const orderwithoutItems = {
          customer_ID: testCustomer.ID,
          items: [],
        };
        try {
          await testInstance.patch(
            "/order-mgmt/Orders(f2c4381c-1b44-4fd3-ae38-296333ef377a)",
            orderwithoutItems
          );
          fail("Expected order update with empty items to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "Order must contain at least one item"
          );
        }
      });
      it("Should not update order if any new item is empty", async () => {
        const order: {
          customer_ID: string;
          status: string;
          items: Array<{ product_ID: string; quantity: number }>;
        } = {
          customer_ID: testCustomer.ID,
          status: "",
          items: [
            {
              product_ID: testProduct1.ID,
              quantity: 2,
            },
          ],
        };

        try {
          await testInstance.patch(
            "/order-mgmt/Orders(f2c4381c-1b44-4fd3-ae38-296333ef377a)",
            order
          );
          fail("Expected order update with empty items to be rejected");
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            "cannot be null or undefined or empty"
          );
        }
      });

      it("Should reject update order if the quantity is greater than stock", async () => {
        const order = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: testProduct2.ID,
              quantity: testProduct2.stockQuantity + 5,
            },
          ],
        };

        try {
          await testInstance.patch(`/order-mgmt/Orders(${order1.ID})`, order);
          fail("Expected order update with insufficient stock to be rejected");
        } catch (error) {
          expect(error.message).toContain("Not enough stock available");
        }
      });
      it("Should reject if any item is missing product ID or quantity", async () => {
        const orderwithItems = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: "non-existent-product-id",
              quantity: 2,
            },
          ],
        };
        try {
          await testInstance.patch(
            `/order-mgmt/Orders(${order1.ID})`,
            orderwithItems
          );
          fail(
            "Expected order update with missing item details to be rejected"
          );
        } catch (error) {
          expect(error.message).toContain(
            "Product with ID non-existent-product-id not found"
          );
        }
      });
      it("Should calculate order total correctly on update", async () => {
        const order = {
          customer_ID: testCustomer.ID,
          items: [
            {
              product_ID: testProduct1.ID,
              quantity: 2,
            },
          ],
        };

        const response = await testInstance.patch(
          `/order-mgmt/Orders(${order1.ID})`,
          order
        );
        expect(response.status).toBe(200);

        const expectedTotal = testProduct1.price * 2;
        expect(response.data.totalAmount).toBe(expectedTotal);
      });
    });
    describe("Order Deletion Validations", () => {
      it("Should delete order of a given ID", async () => {
        const beforeDeleteResponse = await testInstance.get(
          `/order-mgmt/Orders(${orderToDelete.ID})`
        );
        expect(beforeDeleteResponse.status).toBe(200);
        expect(beforeDeleteResponse.data).toHaveProperty(
          "ID",
          orderToDelete.ID
        );
        expect(beforeDeleteResponse.data).toHaveProperty(
          "customer_ID",
          testCustomer.ID
        );
        const response = await testInstance.delete(
          `/order-mgmt/Orders(${orderToDelete.ID})`
        );
        expect(response.status).toBe(204);
        expect(response.statusText).toBe("No Content");
        expect(response.data).toBeFalsy();

        try {
          await testInstance.get(`/order-mgmt/Orders(${orderToDelete.ID})`);
          fail("Expected order to be deleted");
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.error.message).toContain("Not Found");
        }
      });
    });
    describe("Order Get Validations", () => {
      it("Should get all orders", async () => {
        const response = await testInstance.get("/order-mgmt/Orders");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.value)).toBe(true);
        expect(response.data.value.length).toBeGreaterThanOrEqual(1);
      });
      it("Should retrieve order details by ID", async () => {
        const response = await testInstance.get(
          `/order-mgmt/Orders(${order1.ID})`
        );
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("ID", order1.ID);
        expect(response.data).toHaveProperty("customer_ID", testCustomer.ID);
      });
      it("Should return 404 for non-existent order ID", async () => {
        try {
          await testInstance.get("/order-mgmt/Orders(839fsekkd3038dalfja)");
          fail("Expected 404 for non-existent order ID");
        } catch (error) {
          expect(error.response.status).toBe(404);
        }
      });
    });
  });
});
