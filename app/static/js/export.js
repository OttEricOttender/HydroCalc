document.addEventListener("DOMContentLoaded", () => {

  function generatePDF(features) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let snappedCoords = '-';
    let surfaceArea = '-';
    const metrics = {
        Ams: '-',
        Ar: '-',
        Akm: '-',
        B: '-',
        C: '-',
        q_kevad: '-',
        q_sugis: '-'
    };

    features.forEach(feature => {
        // Watershed area
        if (feature.properties?.surface_area_sqkm) {
            surfaceArea = `${feature.properties.surface_area_sqkm.toFixed(2)} km²`;
        }

        // Snapped coordinates
        if (feature.geometry?.snapped_coords) {
          snappedCoords = feature.geometry.snapped_coords;
          coordsText = `(${snappedCoords.lat.toFixed(4)}, ${snappedCoords.lon.toFixed(4)})`;
      }
        
        // Drainage calculations
        if (feature.properties?.group_name && feature.properties?.value_percentage !== undefined) {
            switch (feature.properties.group_name) {
                case 'Madalsood ja soometsad (Ams)':
                    metrics.Ams = `${feature.properties.value_percentage.toFixed(2)} %`;
                    break;
                case 'Rabad (Ar)':
                    metrics.Ar = `${feature.properties.value_percentage.toFixed(2)} %`;
                    break;
                case 'Intensiivselt kuivendatud madalsood (Akm)':
                    metrics.Akm = `${feature.properties.value_percentage.toFixed(2)} %`;
                    break;
                case 'Metsaga kaetud mineraalmaa (B)':
                    metrics.B = `${feature.properties.value_percentage.toFixed(2)} %`;
                    break;
                case 'Lage mineraalmaa (C)':
                    metrics.C = `${feature.properties.value_percentage.toFixed(2)} %`;
                    break;
            }
        }

        // calc. results
        if (feature.properties?.group_name && feature.properties?.value_cubic_m_per_sec !== undefined) {
            switch (feature.properties.group_name) {
                case 'Kevadine maksimaalne aravoolumoodul (q_kevad)':
                    metrics.q_kevad = `${feature.properties.value_cubic_m_per_sec.toFixed(2)} m³/s`;
                    break;
                case 'Sygisene maksimaalne aravoolumoodul (q_sugis)':
                    metrics.q_sugis = `${feature.properties.value_cubic_m_per_sec.toFixed(2)} m³/s`;
                    break;
            }
        }
    });

    // pdf table data
    const tableData = [
        ["Koordinaat (lat, long)", coordsText],
        ['Valgala', surfaceArea],
        ['Vooluveekogu', 'N/A'],
        ['Kood', "N/A"],
        ['Am_s', metrics.Ams],
        ['A_r', metrics.Ar],
        ['Ak_m', metrics.Akm],
        ['B', metrics.B],
        ['C', metrics.C],
        ['Maaparandus', 'N/A'],
        ['Arvutatud kevadine tipparavool (K. Hommik)', metrics.q_kevad],
        ['Arvutatud sügisene tipparavool (K. Hommik)', metrics.q_sugis]
    ];

    function wrapText(text, maxWidth) {
      const words = text.split(' ');
      let line = '';
      const lines = [];
    
      words.forEach((word) => {
        const testLine = line + word + ' ';
        const testWidth = doc.getTextWidth(testLine);
        if (testWidth > maxWidth) {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
    
      lines.push(line.trim());
      return lines;
    }

    const startX = 10;
    const cellWidth = [80, 100];
    const baseCellHeight = 10;
    let currentY = 20;
    
    tableData.forEach(row => {
        const wrappedLines = row.map((cell, colIndex) => {
            if (!cell) return ['-'];
            const maxWidth = cellWidth[colIndex] - 4; 
            return wrapText(cell, maxWidth);
        });
    
        // calculates the row height based on the maximum number of lines in a cell
        const rowHeight = Math.max(...wrappedLines.map(lines => lines.length)) * baseCellHeight;
    
        row.forEach((cell, colIndex) => {
            const x = startX + cellWidth.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.rect(x, currentY, cellWidth[colIndex], rowHeight); 
    
            if (cell) {
                const lineSpacing = wrappedLines[colIndex].length > 1 ? 6 : 4; // increasing spacing for multi-line cells
                wrappedLines[colIndex].forEach((line, lineIndex) => {
                    doc.text(line, x + 2, currentY + 7 + lineIndex * lineSpacing);
                });
            }
        });
    
        currentY += rowHeight;
    });
    
    doc.save('valgala_andmed.pdf');
    
}

window.generatePDF = generatePDF;
});