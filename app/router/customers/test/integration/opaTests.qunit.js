sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/moyo/customers/customers/test/integration/FirstJourney',
		'com/moyo/customers/customers/test/integration/pages/CustomersList',
		'com/moyo/customers/customers/test/integration/pages/CustomersObjectPage'
    ],
    function(JourneyRunner, opaJourney, CustomersList, CustomersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/moyo/customers/customers') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCustomersList: CustomersList,
					onTheCustomersObjectPage: CustomersObjectPage
                }
            },
            opaJourney.run
        );
    }
);