
import { ICustomer, IOrder, IProduct,ItestCase } from "../types/interfaces";

export const productTestCases: ItestCase[] = [
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

export const invalidProduct = {
        name: "Zero Stock Product",
        description: "A product with zero stock",
        price: 15.99,
        stockQuantity: 0,
      };
export const customerTestCases = [
        {
          data: { lastName: "Smith", phone: "123-456-7890" },
          expectedError: "First name, last name, and email are required",
        },
        {
          data: { firstName: "John", phone: "123-456-7890" },
          expectedError: "First name, last name, and email are required",
        },
        {
          data: { firstName: "John", lastName: "Smith" },
          expectedError: "First name, last name, and email are required",
        },
      ];