using { com.moyo.ordermanagement as om } from '../db/schema';

service OrderManagementService @(path:'/order-mgmt') {
  @odata.draft.enabled
  entity Products as projection on om.Products excluding {
    createdBy,
    modifiedBy
  };
  @odata.draft.enabled
  entity Customers as projection on om.Customers excluding {
    createdBy,
    modifiedBy
  };
  @odata.draft.enabled
  entity Orders as projection on om.Orders excluding {
    createdBy,
    modifiedBy
  };
  
  entity OrderItems as projection on om.OrderItems;
}