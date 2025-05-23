namespace com.moyo.ordermanagement;

using { Currency, managed, cuid } from '@sap/cds/common';

entity Products : cuid, managed {
  name        : String(100) not null;
  description : String(1000);
  price       : Decimal(10,2) not null;
  currency    : Currency;
  stockQuantity : Integer not null;
  unit        : String(20);
  category    : String(50);
  supplier    : String(100);
  orderItems  : Association to many OrderItems on orderItems.product = $self;
}

entity Customers : cuid, managed {
  firstName   : String(50) not null;
  lastName    : String(50) not null;
  email       : String(100) not null;
  phone       : String(20);
  address     : String(200);
  city        : String(50);
  postalCode  : String(20);
  country     : String(50);
  orders      : Association to many Orders on orders.customer = $self;
}

entity Orders : cuid, managed {
  customer    : Association to Customers;
  items       : Composition of many OrderItems on items.order = $self;
  totalAmount : Decimal(10,2);
  status      : String(20) default 'New';
  orderDate   : Timestamp default $now;
  notes       : String(1000);
}

entity OrderItems : cuid {
  order       : Association to Orders;
  product     : Association to Products;
  quantity    : Integer not null;
  unitPrice   : Decimal(10,2);
  totalPrice  : Decimal(10,2);
  notes       : String(1000);
}

annotate Products with @(
    // Admin has full access
    restrict: [
        { grant: 'READ', to: ['admin', 'authenticated-user'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'admin' }
    ]
);

annotate Customers with @(
    // Users can only read and update their own data
    restrict: [
        { grant: 'READ', to: ['admin', 'authenticated-user'] },
        { grant: ['CREATE', 'UPDATE'], to: 'authenticated-user' },
        { grant: ['DELETE', 'READ'], to: 'admin' }
    ]
);

annotate Orders with @(
    // Admin has full access, users can only manage their own orders
    restrict: [
        { grant: 'READ', to: ['admin', 'authenticated-user'] },
        { grant: ['CREATE', 'UPDATE'], to: 'authenticated-user' },
        { grant: 'DELETE', to: 'admin' }
    ]
);