namespace com.moyo.ordermanagement;

using { Currency, managed, cuid } from '@sap/cds/common';

@odata.draft.enabled
entity Products : cuid, managed {
  name        : String(100) not null @assert.unique;
  description : String(1000);
  price       : Decimal(10,2) not null;
  currency    : Currency;
  stockQuantity : Integer not null;
  unit        : String(20);
  category    : String(50);
  supplier    : String(100);
  orderItems  : Association to many OrderItems on orderItems.product = $self;
}
@odata.draft.enabled
entity Customers : cuid, managed {
  firstName   : String(50) not null;
  lastName    : String(50) not null;
  email       : String(100) not null @assert.unique;
  phone       : String(20);
  address     : String(200);
  city        : String(50);
  postalCode  : String(20);
  country     : String(50);
  orders      : Association to many Orders on orders.customer = $self;
}
@odata.draft.enabled
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
    restrict: [
        { grant: 'READ', to: ['admin', 'authenticated-user'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'admin' }
    ]
);

annotate Customers with @(
    restrict: [
        { grant: 'READ', to: ['admin', 'authenticated-user'] },
        { grant: ['CREATE', 'UPDATE'], to: 'authenticated-user' },
        { grant: ['DELETE', 'READ'], to: 'admin' }
    ]
);

annotate Orders with @(
    restrict: [
        { grant: 'READ', to: ['admin', 'authenticated-user'] },
        { grant: ['CREATE', 'UPDATE'], to: 'authenticated-user' },
        { grant: 'DELETE', to: 'admin' }
    ]
);