sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/moyo/orders/orders/test/integration/FirstJourney',
		'com/moyo/orders/orders/test/integration/pages/OrdersList',
		'com/moyo/orders/orders/test/integration/pages/OrdersObjectPage'
    ],
    function(JourneyRunner, opaJourney, OrdersList, OrdersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/moyo/orders/orders') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheOrdersList: OrdersList,
					onTheOrdersObjectPage: OrdersObjectPage
                }
            },
            opaJourney.run
        );
    }
);