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

  // Bound actions that work with the selected entity
  action bound.Products.deleteProductAction() returns String;
  action bound.Customers.deleteCustomerAction() returns String;
  action bound.Customers.createOrderForCustomerAction() returns Orders;
  action bound.Orders.deleteOrderAction() returns String;
  action bound.OrderItems.deleteOrderItemAction() returns String;
  
  // Unbound actions for creation
  action createNewOrder() returns Orders;
}