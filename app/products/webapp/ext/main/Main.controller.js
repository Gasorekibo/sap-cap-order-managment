sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.moyo.products.ext.main.Main", {
        onInit: function () {
            // Create a model for the KPIs
            var oKPIModel = new JSONModel({
                productsCount: 0,
                totalValue: 0,
                lowStockCount: 0
            });
            this.getView().setModel(oKPIModel, "kpi");
            
            // Load the KPI data
            this._loadKPIData();
        },
        
        _loadKPIData: function() {
            var oDataModel = this.getOwnerComponent().getModel();
            var oKPIModel = this.getView().getModel("kpi");
            
            // Get products count
            oDataModel.read("/Products/$count", {
                success: function(count) {
                    oKPIModel.setProperty("/productsCount", count);
                }
            });
            
            // Get total inventory value
            oDataModel.read("/ProductInventoryAnalytics", {
                success: function(data) {
                    var totalValue = 0;
                    var results = data.results || [];
                    
                    results.forEach(function(item) {
                        totalValue += parseFloat(item.totalValue);
                    });
                    
                    oKPIModel.setProperty("/totalValue", totalValue.toFixed(2));
                }
            });
            
            // Get low stock count (items with stock < 10)
            oDataModel.read("/Products", {
                filters: [new sap.ui.model.Filter("stockQuantity", "LT", 10)],
                success: function(data) {
                    var count = data.results ? data.results.length : 0;
                    oKPIModel.setProperty("/lowStockCount", count);
                }
            });
        },
        
        onPress: function(oEvent) {
            // Handle tile press event if needed
            var sHeader = oEvent.getSource().getHeader();
            sap.m.MessageToast.show("Clicked on: " + sHeader);
        }
    });
});