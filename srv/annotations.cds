using OrderManagementService from './order-management-service';
using { com.moyo.ordermanagement as om } from '../db/schema';

// Product Annotations
annotate OrderManagementService.Products with @(
  Capabilities: {
    InsertRestrictions: {
      Insertable: true
    },
    UpdateRestrictions: {
      Updatable: true
    },
    DeleteRestrictions: {
      Deletable: true
    }
  },
  UI: {
    HeaderInfo: {
      TypeName: 'Product',
      TypeNamePlural: 'Products',
      Title: { Value: name },
      Description: { Value: description }
    },
    SelectionFields: [ name, category, price, stockQuantity ],
    LineItem: [
      { Value: ID, Label: 'ID' },
      { Value: name, Label: 'Product Name' },
      { Value: description, Label: 'Description' },
      { Value: price, Label: 'Price' },
      { Value: currency_code, Label: 'Currency' },
      { Value: stockQuantity, Label: 'Stock' },
      { Value: category, Label: 'Category' },
      { Value: supplier, Label: 'Supplier' }
    ],
    Facets: [
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'General Information',
        Target: '@UI.FieldGroup#GeneralInfo'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Stock & Pricing',
        Target: '@UI.FieldGroup#StockPricing'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Orders',
        Target: 'orderItems/@UI.LineItem'
      }
    ],
    FieldGroup#GeneralInfo: {
      Data: [
        { Value: name, Label: 'Product Name' },
        { Value: description, Label: 'Description' },
        { Value: category, Label: 'Category' },
        { Value: supplier, Label: 'Supplier' }
      ]
    },
    FieldGroup#StockPricing: {
      Data: [
        { Value: price, Label: 'Price' },
        { Value: currency_code, Label: 'Currency' },
        { Value: stockQuantity, Label: 'Stock Quantity' },
        { Value: unit, Label: 'Unit' }
      ]
    },
    Chart: {
      ChartType: #Column,
      Dimensions: ['category'],
      Measures: ['stockQuantity'],
      Title: 'Stock by Category'
    },
    PresentationVariant: {
      Text: 'Default',
      SortOrder: [{ Property: 'name' }],
      Visualizations: ['@UI.LineItem', '@UI.Chart']
    },
    Identification: [
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Delete',
        Action: 'OrderManagementService.deleteProduct',
        Criticality: 1, 
        ![@UI.Importance]: #High
      }
    ]
  }
);

annotate OrderManagementService.Customers with @(
  Capabilities: {
    InsertRestrictions: {
      Insertable: true
    },
    UpdateRestrictions: {
      Updatable: true
    },
    DeleteRestrictions: {
      Deletable: true
    }
  },
  UI: {
    HeaderInfo: {
      TypeName: 'Customer',
      TypeNamePlural: 'Customers',
      Title: { 
        Value: { 
          $edmJson: { 
            $Apply: [
              { $Path: 'firstName' },
              { $String: ' ' },
              { $Path: 'lastName' }
            ],
            $Function: 'odata.concat'
          }
        }
      },
      Description: { Value: email }
    },
    SelectionFields: [ firstName, lastName, email, country ],
    LineItem: [
      { Value: ID, Label: 'ID' },
      { 
        Value: { 
          $edmJson: { 
            $Apply: [
              { $Path: 'firstName' },
              { $String: ' ' },
              { $Path: 'lastName' }
            ],
            $Function: 'odata.concat'
          }
        }, 
        Label: 'Customer Name' 
      },
      { Value: email, Label: 'Email' },
      { Value: phone, Label: 'Phone' },
      { Value: country, Label: 'Country' }
    ],
    Facets: [
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Basic Information',
        Target: '@UI.FieldGroup#BasicInfo'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Contact Information',
        Target: '@UI.FieldGroup#ContactInfo'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Address',
        Target: '@UI.FieldGroup#Address'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Orders',
        Target: 'orders/@UI.LineItem'
      }
    ],
    FieldGroup#BasicInfo: {
      Data: [
        { Value: firstName, Label: 'First Name' },
        { Value: lastName, Label: 'Last Name' }
      ]
    },
    FieldGroup#ContactInfo: {
      Data: [
        { Value: email, Label: 'Email' },
        { Value: phone, Label: 'Phone' }
      ]
    },
    FieldGroup#Address: {
      Data: [
        { Value: address, Label: 'Address' },
        { Value: city, Label: 'City' },
        { Value: postalCode, Label: 'Postal Code' },
        { Value: country, Label: 'Country' }
      ]
    },
    Chart: {
      ChartType: #Donut,
      Dimensions: ['country'],
      Title: 'Customers by Country'
    },
    Identification: [
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Create Order',
        Action: 'OrderManagementService.createOrderForCustomer',
        Criticality: 3, // Green color for create
        ![@UI.Importance]: #High
      },
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Delete',
        Action: 'OrderManagementService.deleteCustomer',
        Criticality: 1, // Red color for delete
        ![@UI.Importance]: #High
      }
    ]
  }
);

// Order Annotations
annotate OrderManagementService.Orders with @(
  CreateHidden: false,
  Capabilities: {
    InsertRestrictions: {
      Insertable: true
    },
    UpdateRestrictions: {
      Updatable: true
    },
    DeleteRestrictions: {
      Deletable: true
    }
  },
  UI: {
    HeaderInfo: {
      TypeName: 'Order',
      TypeNamePlural: 'Orders',
      Title: { Value: ID },
      Description: { Value: status }
    },
    SelectionFields: [ 
      customer_ID, 
      status, 
      orderDate, 
      totalAmount 
    ],
    LineItem: [
      { Value: ID, Label: 'Order ID' },
      { 
        Value: {
          $edmJson: {
            $Apply: [
              { $Path: 'customer/firstName' },
              { $String: ' ' },
              { $Path: 'customer/lastName' }
            ],
            $Function: 'odata.concat'
          }
        },
        Label: 'Customer'
      },
      { Value: orderDate, Label: 'Order Date' },
      { Value: status, Label: 'Status' },
      { Value: totalAmount, Label: 'Total Amount' },
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Delete',
        Action: 'OrderManagementService.deleteOrder',
        Criticality: 1
      }
    ],
    Facets: [
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Order Details',
        Target: '@UI.FieldGroup#OrderDetails'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Order Items',
        Target: 'items/@UI.LineItem'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Notes',
        Target: '@UI.FieldGroup#Notes'
      }
    ],
    FieldGroup#OrderDetails: {
      Data: [
        { 
          Value: {
            $edmJson: {
              $Apply: [
                { $Path: 'customer/firstName' },
                { $String: ' ' },
                { $Path: 'customer/lastName' }
              ],
              $Function: 'odata.concat'
            }
          },
          Label: 'Customer'
        },
        { Value: orderDate, Label: 'Order Date' },
        { Value: status, Label: 'Status' },
        { Value: totalAmount, Label: 'Total Amount' }
      ]
    },
    FieldGroup#Notes: {
      Data: [
        { Value: notes, Label: 'Notes' }
      ]
    },
    Chart: {
      ChartType: #Column,
      Dimensions: ['status'],
      Measures: ['totalAmount'],
      Title: 'Orders by Status'
    },
    Identification: [
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Create New Order',
        Action: 'OrderManagementService.createNewOrder',
        Criticality: 3
      },
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Delete Order',
        Action: 'OrderManagementService.deleteOrder',
        Criticality: 1
      }
    ],
    HeaderFacets: [
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Order Status',
        Target: '@UI.DataPoint#Status'
      },
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Total Amount',
        Target: '@UI.DataPoint#TotalAmount'
      }
    ],
    DataPoint#Status: {
      Value: status,
      Title: 'Status'
    },
    DataPoint#TotalAmount: {
      Value: totalAmount,
      Title: 'Total Amount'
    }
  }
);

annotate OrderManagementService.OrderItems with @(
  Capabilities: {
    InsertRestrictions: {
      Insertable: true
    },
    UpdateRestrictions: {
      Updatable: true
    },
    DeleteRestrictions: {
      Deletable: true
    }
  },
  UI: {
    HeaderInfo: {
      TypeName: 'Order Item',
      TypeNamePlural: 'Order Items',
      Title: { Value: product.name },
      Description: { Value: notes }
    },
    LineItem: [
      { Value: product_ID, Label: 'Product ID' },
      { Value: product.name, Label: 'Product' },
      { Value: quantity, Label: 'Quantity' },
      { Value: unitPrice, Label: 'Unit Price' },
      { Value: totalPrice, Label: 'Total Price' },
      {
        $Type: 'UI.DataFieldForAction',
        Label: 'Remove Item',
        Action: 'OrderManagementService.deleteOrderItem',
        Criticality: 1,
      }
    ],
    Facets: [
      {
        $Type: 'UI.ReferenceFacet',
        Label: 'Item Details',
        Target: '@UI.FieldGroup#ItemDetails'
      }
    ],
    FieldGroup#ItemDetails: {
      Data: [
        { Value: product.name, Label: 'Product' },
        { Value: quantity, Label: 'Quantity' },
        { Value: unitPrice, Label: 'Unit Price' },
        { Value: totalPrice, Label: 'Total Price' },
        { Value: notes, Label: 'Notes' }
      ]
    }
  }
);

// Field-level annotations for validation and field control
annotate om.Products with {
  name @(
    Common.Label: 'Product Name',
    Common.FieldControl: #Mandatory
  );
  
  price @(
    Common.Label: 'Price',
    Common.FieldControl: #Mandatory,
    Measures.ISOCurrency: currency_code
  );

  stockQuantity @(
    Common.Label: 'Stock Quantity',
    Common.FieldControl: #Mandatory
  );
  
  category @(
    Common.Label: 'Category',
    Common.FieldControl: #Mandatory
  );
};

annotate om.Customers with {
  firstName @(
    Common.Label: 'First Name',
    Common.FieldControl: #Mandatory
  );
  
  lastName @(
    Common.Label: 'Last Name',
    Common.FieldControl: #Mandatory
  );
  
  email @(
    Common.Label: 'Email',
    Common.FieldControl: #Mandatory
  );
  
  phone @(
    Common.Label: 'Phone Number'
  );
  
  country @(
    Common.Label: 'Country',
    Common.FieldControl: #Mandatory
  );
};

annotate om.Orders with {
  orderDate @(
    Common.Label: 'Order Date',
    Common.FieldControl: #Mandatory
  );
  
  status @(
    Common.Label: 'Status',
    Common.FieldControl: #Mandatory
  );
  
  totalAmount @(
    Common.Label: 'Total Amount',
    Common.FieldControl: #Mandatory
  );
  
  customer @(
    Common.Label: 'Customer',
    Common.FieldControl: #Mandatory,
    Common.ValueList: {
      Label: 'Customers',
      CollectionPath: 'Customers',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: customer_ID,
          ValueListProperty: 'ID'
        },
        {
          $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'firstName'
        },
        {
          $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'lastName'
        },
        {
          $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'email'
        }
      ]
    }
  );
};

annotate om.OrderItems with {
  quantity @(
    Common.Label: 'Quantity',
    Common.FieldControl: #Mandatory
  );
  
  unitPrice @(
    Common.Label: 'Unit Price',
    Common.FieldControl: #Mandatory
  );
  
  product @(
    Common.Label: 'Product',
    Common.FieldControl: #Mandatory,
    Common.ValueList: {
      Label: 'Products',
      CollectionPath: 'Products',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: product_ID,
          ValueListProperty: 'ID'
        },
        {
          $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        },
        {
          $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'price'
        },
        {
          $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'stockQuantity'
        }
      ]
    }
  );
};

annotate OrderManagementService.Products with @(
  UI.CreateHidden: false,
  UI.UpdateHidden: false,
  UI.DeleteHidden: false
);

annotate OrderManagementService.Customers with @(
  UI.CreateHidden: false,
  UI.UpdateHidden: false,
  UI.DeleteHidden: false
);

annotate OrderManagementService.Orders with @(
  UI.CreateHidden: false,
  UI.UpdateHidden: false,
  UI.DeleteHidden: false
);
annotate OrderManagementService.OrderItems with @(
  UI.CreateHidden: false,
  UI.UpdateHidden: false,
  UI.DeleteHidden: false
);