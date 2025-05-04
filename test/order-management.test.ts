import cds from "@sap/cds";

describe("Business Validation Tests", () => {
  const testInstance = cds.test(__dirname + "/..");

  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe("Product Business Validations", () => {
    it("Should enforce all required fields", async () => {
      const testCases = [
        {
          data: { name: "Missing Price and Stock", description: "Test" },
          expectedError: "Name, price, and stock quantity are required",
        },
        {
          data: { name: "Missing Stock", price: 10.99, description: "Test" },
          expectedError: "Name, price, and stock quantity are required",
        },
        {
          data: { price: 10.99, stockQuantity: 5, description: "Test" },
          expectedError: "Name, price, and stock quantity are required",
        },
      ];

      for (const testCase of testCases) {
        try {
          await testInstance.post("/order-mgmt/Products", testCase.data);
          fail(`Expected ${JSON.stringify(testCase.data)} to fail validation`);
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            testCase.expectedError
          );
        }
      }
    });

    it("Should validate price is positive", async () => {
      const invalidProduct = {
        name: "Zero Price Product",
        description: "A product with zero price",
        price: 0,
        stockQuantity: 10,
      };

      try {
        await testInstance.post("/order-mgmt/Products", invalidProduct);
        fail("Expected negative price to be rejected");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.message).toContain(
          "Name, price, and stock quantity are required"
        );
      }
    });

    it("Should validate stock quantity is positive", async () => {
      const invalidProduct = {
        name: "Zero Stock Product",
        description: "A product with zero stock",
        price: 15.99,
        stockQuantity: 0,
      };
      try {
        await testInstance.post("/order-mgmt/Products", invalidProduct);
        fail("Expected negative stock to be rejected");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.message).toContain(
          "Name, price, and stock quantity are required"
        );
      }
    });

    it("Should enforce unique product names", async () => {
      const uniqueName = `Duplicate Name Test Product ${Date.now()}`;

      const product = {
        name: uniqueName,
        description: "Testing name uniqueness",
        price: 29.99,
        stockQuantity: 20,
      };

      const firstResponse = await testInstance.post(
        "/order-mgmt/Products",
        product
      );
      expect(firstResponse.status).toBe(201);

      try {
        await testInstance.post("/order-mgmt/Products", {
          ...product,
          description: "Different description but same name",
          price: 19.99,
        });
        fail("Expected duplicate name to be rejected");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.message).toContain("already exists");
      }
    });
  });

  describe("Customer Business Validations", () => {
    it("Should enforce all required fields", async () => {
      // Define various invalid customer combinations
      const testCases = [
        {
          data: { lastName: "Smith", phone: "123-456-7890" },
          expectedError: "Name and email are required",
        },
        {
          data: { firstName: "John", phone: "123-456-7890" },
          expectedError: "Name and email are required",
        },
        {
          data: { firstName: "John", lastName: "Smith" },
          expectedError: "Name and email are required",
        },
      ];

      
      for (const testCase of testCases) {
        try {
          await testInstance.post("/order-mgmt/Customers", testCase.data);
          fail(`Expected ${JSON.stringify(testCase.data)} to fail validation`);
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error.message).toContain(
            testCase.expectedError
          );
        }
      }
    });

    it("Should enforce unique email addresses", async () => {
      const email = `test.unique.${Date.now()}@example.com`;

      const customer1 = {
        firstName: "Email",
        lastName: "Test1",
        email: email,
        phone: "111-111-1111",
      };

      const customer2 = {
        firstName: "Email",
        lastName: "Test2",
        email: email,
        phone: "222-222-2222",
      };
      const response1 = await testInstance.post(
        "/order-mgmt/Customers",
        customer1
      );
      expect(response1.status).toBe(201);
      try {
        await testInstance.post("/order-mgmt/Customers", customer2);
        fail("Expected duplicate email to be rejected");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.message).toContain("already exists");
      }
    });
  });

  describe("Order Complex Business Validations", () => {
    let testCustomer, testProduct1, testProduct2;

    beforeAll(async () => {
      
      const customerResponse = await testInstance.post(
        "/order-mgmt/Customers",
        {
          firstName: "Order",
          lastName: "ValidationTest",
          email: `order.validation.${Date.now()}@example.com`,
          phone: "333-444-5555",
        }
      );
      testCustomer = customerResponse.data;

      
      const product1Response = await testInstance.post("/order-mgmt/Products", {
        name: `Validation Product 1 ${Date.now()}`,
        description: "First validation test product",
        price: 39.99,
        stockQuantity: 25,
      });
      testProduct1 = product1Response.data;

      const product2Response = await testInstance.post("/order-mgmt/Products", {
        name: `Validation Product 2 ${Date.now()}`,
        description: "Second validation test product",
        price: 19.99,
        stockQuantity: 10,
      });
      testProduct2 = product2Response.data;
    });

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
        expect(error.response.data.error.message).toContain(
          "Product with ID non-existent-product-id not found"
        );
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
      expect(response.status).toBe(201);

      
      const expectedTotal = testProduct1.price * 2 + testProduct2.price * 3;
      expect(response.data.totalAmount).toBe(expectedTotal);

     
      const orderItems = await testInstance.get(
        `/order-mgmt/Orders(${response.data.ID})/items`
      );
      expect(orderItems.data.value).toBeDefined();
      expect(orderItems.data.value.length).toBe(2);

      // Check first item
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
      expect(response1.status).toBe(201);

      
      const response2 = await testInstance.post("/order-mgmt/Orders", order2);
      expect(response2.status).toBe(201);

      
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
});
