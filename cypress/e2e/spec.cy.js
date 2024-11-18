Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test when an uncaught exception occurs.
  return false;
});

// Define test constants
const mapUrl = 'http://127.0.0.1:5001/'; //'http://127.0.0.1:5500/app/templates/';
const cordinatesKeyWord = "Koordinaadid:"; //"Coordinates:";
const delineateId = "button"; ////"Delineate";
const latitude = 58.379162299686136;
const longitude = 26.72530712346984;

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
      cy.window().then((win) => {
        const map = win.map;
  
        // Simulate a click at the specified geographic coordinates
        map.fireEvent('click', {
          latlng: { lat: latitude, lng: longitude }
        });
      });
  
      // Check if the popup contains the expected coordinates
      cy.get('.leaflet-popup-content').should('contain', `${cordinatesKeyWord} ${latitude}, ${longitude}`);
    });

    it('should search by coordinates correctly', () => {
      // Enter the coordinates into the input fields
      cy.get('input#latitude').type(latitude.toString());
      cy.get('input#longitude').type(longitude.toString());

      // Click the submit button
      cy.get('input#otsi').click();

      // Check if the popup contains the expected coordinates
      cy.get('.leaflet-popup-content').should('contain', `${cordinatesKeyWord} ${latitude}, ${longitude}`);
    });
  });

  describe('Delineate Functionality', () => {
    beforeEach(() => {
      cy.visit(mapUrl, { cache: false }); 
      cy.wait(1000);
    });

    before(() => {
      cy.visit(mapUrl, { cache: false }); 
      cy.wait(1000);

      cy.window().then((win) => {
        const map = win.map;
  
        // Simulate a click at the specified geographic coordinates
        map.fireEvent('click', {
          latlng: { lat: latitude, lng: longitude }
        });
  
        // Simulate a click on the button to find the watershed
        cy.get(`#${delineateId}`).click();
      });
      cy.wait(30000);
    });

    it('should display river network correctly', () => {
      // Verify the river network layer is displayed by checking for the path element
      cy.get('path.leaflet-interactive[stroke="blue"]').should('exist').and('be.visible');
    });
  
    it('should display drainage basin correctly', () => {
      // Verify the drainage basin layer is displayed by checking for the path element
      cy.get('path.leaflet-interactive[stroke="red"]').should('exist').and('be.visible');

      // Check for user-entered coordinates
      cy.get('#user-coords')
        .invoke('text')
        .then((text) => {
          const regex = /\(([\d.]+), ([\d.]+)\)/; // Regex to extract numbers
          const match = text.match(regex);
          expect(match).to.not.be.null;

          // Convert extracted strings to numbers for comparison
          const displayedLatitude = Number(match[1]);
          const displayedLongitude = Number(match[2]);

          // Latitude and Longitude should match the expected values with a precision of 5 decimals
          expect(displayedLatitude).to.equal(Number(latitude.toFixed(5))); // Latitude
          expect(displayedLongitude).to.equal(Number(longitude.toFixed(5))); // Longitude
      });

      // Check for snapped coordinates with tolerance
      cy.get('#snapped-coords')
        .invoke('text')
        .then((text) => {
          const regex = /\(([\d.]+), ([\d.]+)\)/;
          const match = text.match(regex);
          expect(match).to.not.be.null;

          const displayedLatitude = Number(match[1]);
          const displayedLongitude = Number(match[2]);

          // Latitude and Longitude should be within n% tolerance
          const tolerance = 0.01;
          expect(displayedLatitude).to.be.closeTo(Number(latitude.toFixed(5)), latitude * tolerance); // Latitude
          expect(displayedLongitude).to.be.closeTo(Number(longitude.toFixed(5)), longitude * tolerance); // Longitude
      });

      // Check for surface area
      cy.get('#surface-area')
        .invoke('text')
        .then((text) => {
          const regex = /([\d.]+)\s?km²?/; // Regex to extract area
          const match = text.match(regex);
          expect(match).to.not.be.null;

          const displayedArea = Number(match[1]);
          expect(displayedArea).to.be.greaterThan(0); // Surface area should be larger than 0
      });
    });
  });
});
