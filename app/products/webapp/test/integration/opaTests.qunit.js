sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/moyo/products/products/test/integration/FirstJourney',
		'com/moyo/products/products/test/integration/pages/ProductsList',
		'com/moyo/products/products/test/integration/pages/ProductsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductsList, ProductsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/moyo/products/products') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductsList: ProductsList,
					onTheProductsObjectPage: ProductsObjectPage
                }
            },
            opaJourney.run
        );
    }
);