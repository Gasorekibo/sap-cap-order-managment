using OrderManagementService from './order-management-service';
using { com.moyo.ordermanagement as om } from '../db/schema';

// Product Annotations
annotate OrderManagementService.Products with @(
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
      { Value: currency.code, Label: 'Currency' },
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
        { Value: currency.code, Label: 'Currency' },
        { Value: stockQuantity, Label: 'Stock Quantity' },
        { Value: unit, Label: 'Unit' }
      ]
    },
    // Add Chart for analytics
    Chart: {
      ChartType: #Column,
      Dimensions: ['category'],
      Measures: ['stockQuantity'],
      Title: 'Stock by Category'
    },
    // Add KPI for total inventory value
    PresentationVariant: {
      Text: 'Default',
      SortOrder: [{ Property: 'name' }],
      Visualizations: ['@UI.LineItem', '@UI.Chart']
    }
  }
);

// Customer Annotations
annotate OrderManagementService.Customers with @(
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
    // Customer Chart
    Chart: {
      ChartType: #Donut,
      Dimensions: ['country'],
      Measures: [{
        $edmJson: {
          $Apply: [{ $Path: 'orders/$count' }],
          $Function: 'odata.count'
        }
      }],
      Title: 'Customers by Country'
    }
  }
);

// Order Annotations
annotate OrderManagementService.Orders with @(
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
      { Value: totalAmount, Label: 'Total Amount' }
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
    // Orders Chart for analytics
    Chart: {
      ChartType: #Column,
      Dimensions: ['status'],
      Measures: ['totalAmount'],
      Title: 'Orders by Status'
    },
    // KPI for total revenue
    Identification: [
      {
        $Type: 'UI.DataFieldForAnnotation',
        Label: 'Revenue Overview',
        Target: '@UI.Chart'
      }
    ]
  }
);

// Order Items Annotations
annotate OrderManagementService.OrderItems with @(
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
      { Value: totalPrice, Label: 'Total Price' }
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

// Add validation and field control
annotate om.Products with {
  name @(
    Common.Label: 'Product Name',
    Common.FieldControl: #Mandatory
  );
  
  price @(
    Common.Label: 'Price',
    Common.FieldControl: #Mandatory
  );

  stockQuantity @(
    Common.Label: 'Stock Quantity',
    Common.FieldControl: #Mandatory
  );
}

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
}

// Add value help for product categories
annotate OrderManagementService.Products with {
  category @(
    Common.ValueList: {
      Label: 'Categories',
      CollectionPath: 'Products',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: category,
          ValueListProperty: 'category'
        }
      ]
    }
  );
}

// Add value help for countries
annotate OrderManagementService.Customers with {
  country @(
    Common.ValueList: {
      Label: 'Countries',
      CollectionPath: 'Customers',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: country,
          ValueListProperty: 'country'
        }
      ]
    }
  );
}