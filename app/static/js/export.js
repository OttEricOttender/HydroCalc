const {jsPDF} = window.jspdf;

const doc = new jsPDF();

let currentY = 20; 
// Define the table structure and data
const tableData = [
  ['Koordinaat (lat, long)', '(X,Y)'],
  ['Vooluveekogu', 'N/A'],
  ['Kood', "N/A"],
  ['Valgala', 'km²'],
  ['A_ms','%'],
  ['A_r', '%'],
  ['A_km', '%'],
  ['B', '%'],
  ['C', '%'],
  ['Maaparandus', 'N/A'],
  ['Arvutatud kevadine tipparavool (K. Hommik)', 'm³/s'],
  ['Arvutatud sügisene tipparavool (K. Hommik)', 'm³/s'],
];

const startX = 10;
        const cellWidth = [80, 50, 50];
        const baseCellHeight = 10;

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

        tableData.forEach((row) => {
          const lineCounts = row.map((cell, colIndex) => {
            if (!cell) return 1;
            const maxWidth = cellWidth[colIndex] - 4; // Adjust for padding
            return wrapText(cell, maxWidth).length;
          });

          const rowHeight = Math.max(...lineCounts) * baseCellHeight;

          row.forEach((cell, colIndex) => {
            const x = startX + cellWidth.slice(0, colIndex).reduce((a, b) => a + b, 0);

            // Draw the cell border
            doc.rect(x, currentY, cellWidth[colIndex], rowHeight);

            if (cell) {
              const lines = wrapText(cell, cellWidth[colIndex] - 4);
              lines.forEach((line, lineIndex) => {
                doc.text(line, x + 2, currentY + 7 + lineIndex * 4);
              });
            }
          });

          currentY += rowHeight;
        });
        doc.save('html_and_table.pdf');

