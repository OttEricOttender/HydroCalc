Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test when an uncaught exception occurs.
  return false;
});

// Define the base URL for the map
const mapUrl = 'http://127.0.0.1:5500/app/templates/';

describe('Map Features', () => {
  describe('Zoom Functionality', () => {
    beforeEach(() => {
      cy.visit(mapUrl, { cache: false }); 
      cy.wait(1000);
    });

    it('should confirm map element exists and is visible', () => {
      cy.get('#map').should('exist').and('be.visible');
    });

    it('should zoom in when clicking the "plus" button', () => {
      cy.window().then((win) => {
        const map = win.map;
        const initialZoom = map.getZoom();
        
        cy.get('.leaflet-control-zoom-in').click();
        cy.wrap(map).invoke('getZoom').should('be.gt', initialZoom);
      });
    });

    it('should zoom out when clicking the "minus" button', () => {
      cy.window().then((win) => {
        const map = win.map;
        const initialZoom = map.getZoom();
        
        cy.get('.leaflet-control-zoom-out').click();
        cy.wrap(map).invoke('getZoom').should('be.lt', initialZoom);
      });
    });

    /*
    Ei tea miks see ei tööta.
    Probleem tundub olvevat selles, 
    et Cypress ei suuda simuleerida hiire kerimist
    
    it('should zoom in using the mouse wheel', () => {
      cy.window().then((win) => {
        const map = win.map;
        const initialZoom = map.getZoom();

        cy.get('#map').trigger('wheel', { deltaY: -1000 });
        cy.wrap(map).invoke('getZoom').should('be.gt', initialZoom);
      });
    });

    it('should zoom out using the mouse wheel', () => {
      cy.window().then((win) => {
        const map = win.map;
        const initialZoom = map.getZoom();

        cy.get('#map').trigger('wheel', { deltaY: 1000 });
        cy.wrap(map).invoke('getZoom').should('be.lt', initialZoom);
      });
    });*/
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visit(mapUrl, { cache: false }); 
      cy.wait(1000);
    });

    it('should search by point correctly', () => {
      // Define geographic coordinates
      const latitude = 58.998140645652136;
      const longitude = 25.032348632812504;
  
      cy.window().then((win) => {
        const map = win.map;
  
        // Simulate a click at the specified geographic coordinates
        map.fireEvent('click', {
          latlng: { lat: latitude, lng: longitude }
        });
      });
  
      // Check if the popup contains the expected coordinates
      cy.get('.leaflet-popup-content').should('contain', `Coordinates: ${latitude}, ${longitude}`);
    });

    it('should search by coordinates correctly', () => {
      // Define geographic coordinates
      const latitude = 58.998140645652136;
      const longitude = 25.032348632812504;
  
      // Enter the coordinates into the input fields
      cy.get('input#latitude').type(latitude.toString());
      cy.get('input#longitude').type(longitude.toString());

      // Click the submit button
      cy.get('input#otsi').click();

      // Check if the popup contains the expected coordinates
      cy.get('.leaflet-popup-content').should('contain', `Coordinates: ${latitude}, ${longitude}`);
    });
  });

  describe('Delineate Functionality', () => {
    beforeEach(() => {
      cy.visit(mapUrl, { cache: false }); 
      cy.wait(1000);
    });

    it('should display river network correctly', () => {
      // Define geographic coordinates
      const latitude = 58.998140645652136;
      const longitude = 25.032348632812504;
  
      cy.window().then((win) => {
        const map = win.map;
  
        // Simulate a click at the specified geographic coordinates
        map.fireEvent('click', {
          latlng: { lat: latitude, lng: longitude }
        });

        // Simulate a click on the button to find the watershed
        cy.get('#delineate').click();

        // Verify the river network layer is displayed by checking for the path element
        cy.get('path.leaflet-interactive[stroke="blue"]').should('exist').and('be.visible');
      });
    });

    it('should display drainage basin correctly', () => {
      // Define geographic coordinates
      const latitude = 58.998140645652136;
      const longitude = 25.032348632812504;
  
      cy.window().then((win) => {
        const map = win.map;
  
        // Simulate a click at the specified geographic coordinates
        map.fireEvent('click', {
          latlng: { lat: latitude, lng: longitude }
        });

        // Simulate a click on the button to find the watershed
        cy.get('#delineate').click();

        // Verify the drainage basin layer is displayed by checking for the path element
        cy.get('path.leaflet-interactive[stroke="red"]').should('exist').and('be.visible');
      });
    });
  });
});
