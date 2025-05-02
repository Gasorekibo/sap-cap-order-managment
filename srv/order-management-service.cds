using { com.moyo.ordermanagement as om } from '../db/schema';

service OrderManagementService @(path:'/order-mgmt') {
  entity Products as projection on om.Products excluding {
    createdBy,
    modifiedBy
  };
  entity Customers as projection on om.Customers excluding {
    createdBy,
    modifiedBy
  };
  entity Orders as projection on om.Orders excluding {
    createdBy,
    modifiedBy
  };
  entity OrderItems as projection on om.OrderItems;
}