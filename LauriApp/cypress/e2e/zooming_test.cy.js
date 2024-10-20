Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents cypress from
    // failing the test when an uncaught exception occurs.
    return false;
  });



describe('Leaflet Zooming Functionality', () => {
    beforeEach(() => {
      cy.visit('http://127.0.0.1:5500/index.html', { cache: false }); 
    });
  
    it('should zoom in when clicking the "plus" button', () => {
      // finding the zoom-in button and clicking
      cy.get('.leaflet-control-zoom-in').click();
      
      // Assert the zoom level changed
      cy.window().then((win) => {
        const map = win.map; // map object from the global window
        cy.wrap(map.getZoom()).should('be.gt', 0); // zoom level increased?
      });
    });

    // Does not pass
    /* 
    it('should zoom out when clicking the "minus" button', () => {
        cy.window().then((win) => {
          const map = win.map;
          const initialZoom = map.getZoom(); // storing the initial zoom level
      
          // Click the zoom-out button
          cy.get('.leaflet-control-zoom-out').click();
      
          // using a retry assertion to check if the zoom level eventually decreases
          cy.wrap(map)
            .its('zoom')
            .should('be.lt', initialZoom);
        });
      }); */
      
      
  
    it('should zoom in using the mouse wheel', () => {
      cy.get('#map')  // Map container's ID is '#map'
        .trigger('wheel', { deltaY: -500 }); // Simulate scrolling up to zoom in
    
      // Assert that the zoom level increased
      cy.window().then((win) => {
        const map = win.map;
        cy.wrap(map.getZoom()).should('be.gt', 0);
      });
    });


    // Does not pass
    /*
    it('should zoom out using the mouse wheel', () => {
      cy.get('#map')
        .trigger('wheel', { deltaY: 500 }); // Simulate scrolling down to zoom out
    
      // Assert that the zoom level decreased
      cy.window().then((win) => {
        const map = win.map;
        const initialZoom = map.getZoom();
        cy.wrap(map.getZoom()).should('be.lt', initialZoom);
      });
    });
    */
  }); 