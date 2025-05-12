export interface ICustomer {
  ID: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface IProduct {
  ID: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface IOrder {
  ID: string;
  customer_ID: string;
  status: string;
  notes: string;
  items:Iitems;
}
export interface ItestCase {
  data: {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
  };
  expectedError: string;
}

export type Iitems ={
  items: Array<{ product_ID: string; quantity: number }>
}