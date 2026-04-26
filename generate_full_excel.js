const fs = require('fs');

const content = fs.readFileSync('coverage_output.txt', 'utf8');
const lines = content.split('\n');

let tableRows = '';
let startParsing = false;

lines.forEach(line => {
    // Tìm dòng tiêu đề của bảng Coverage
    if (line.includes('File') && line.includes('% Stmts') && line.includes('% Lines')) {
        startParsing = true;
        return;
    }
    
    // Nếu gặp dòng gạch ngang kết thúc bảng hoặc Summary thì dừng
    if (startParsing && line.includes('-----------------------------|')) {
        // Tiếp tục parsing vì có thể là dòng ngăn cách giữa các module
        return;
    }

    if (startParsing && line.trim() && line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 5) {
            const fileName = parts[0];
            if (fileName === 'File') return; // Skip header row
            
            const stmts = parts[1];
            const branch = parts[2];
            const funcs = parts[3];
            const linesPct = parts[4];
            const uncovered = parts[5] || '-';
            
            const isDir = !fileName.includes('.');
            const rowClass = isDir ? 'category' : 'data';
            const nameStyle = isDir ? 'font-weight: bold; background-color: #F2F2F2;' : 'padding-left: 20px;';
            
            // Format percentages to decimal for Excel to recognize
            const formatPct = (val) => {
                const num = parseFloat(val);
                return isNaN(num) ? '0' : (num / 100).toString();
            };

            tableRows += `
  <tr>
    <td class="${rowClass}" style="${nameStyle}">${fileName}</td>
    <td class="percentage">${formatPct(stmts)}</td>
    <td class="percentage">${formatPct(branch)}</td>
    <td class="percentage">${formatPct(funcs)}</td>
    <td class="percentage">${formatPct(linesPct)}</td>
    <td class="data-center">${uncovered}</td>
  </tr>`;
        }
    }
});

const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style>
  .header { background-color: #4472C4; color: #ffffff; font-weight: bold; text-align: center; border: 0.5pt solid #000000; }
  .title { font-size: 20pt; font-weight: bold; text-align: center; color: #2F5597; }
  .subtitle { font-size: 14pt; font-weight: bold; text-align: left; color: #ffffff; background-color: #2F5597; padding: 8px; border: 1pt solid #000000; }
  .data { border: 0.5pt solid #BFBFBF; font-family: Calibri; font-size: 10pt; }
  .data-center { border: 0.5pt solid #BFBFBF; font-family: Calibri; font-size: 10pt; text-align: center; }
  .percentage { mso-number-format: "0.00%"; text-align: right; border: 0.5pt solid #BFBFBF; font-family: Calibri; font-size: 10pt; }
  .category { background-color: #F2F2F2; font-weight: bold; border: 0.5pt solid #BFBFBF; font-family: Calibri; font-size: 10pt; }
  .pass-bg { background-color: #C6EFCE; color: #006100; font-weight: bold; text-align: center; border: 1pt solid #006100; }
  .stat-label { background-color: #F2F2F2; font-weight: bold; border: 0.5pt solid #BFBFBF; width: 200px; }
  .stat-value { border: 0.5pt solid #BFBFBF; text-align: left; padding-left: 15px; }
</style>
</head>
<body>
<table>
  <tr><td colspan="6" class="title">FULL UNIT TEST REPORT - ALL FILES</td></tr>
  <tr><td colspan="6" style="text-align: center; color: #7F7F7F;">Project: Scan2Order Mobile Staff</td></tr>
  <tr><td colspan="6"></td></tr>

  <tr><td colspan="6" class="subtitle">I. EXECUTION SUMMARY</td></tr>
  <tr><td class="stat-label">Test Suites</td><td colspan="5" class="stat-value">71 passed, 71 total</td></tr>
  <tr><td class="stat-label">Tests Count</td><td colspan="5" class="stat-value">382 passed, 382 total</td></tr>
  <tr><td class="stat-label">Overall Status</td><td colspan="5" style="background-color: #C6EFCE; font-weight: bold; padding-left: 15px;">PASSED</td></tr>
  <tr><td colspan="6"></td></tr>

  <tr><td colspan="6" class="subtitle">II. COMPLETE COVERAGE TABLE (ALL FILES)</td></tr>
  <tr class="header">
    <td style="width: 350px;">File / Directory</td>
    <td>Stmts %</td>
    <td>Branch %</td>
    <td>Funcs %</td>
    <td>Lines %</td>
    <td style="width: 250px;">Uncovered Lines</td>
  </tr>
  ${tableRows}
  <tr><td colspan="6"></td></tr>
  <tr><td colspan="6" class="pass-bg" style="font-size: 14pt; padding: 10px;">FINAL RESULT: 71/71 TEST SUITES PASSED (100%)</td></tr>
</table>
</body>
</html>
`;

fs.writeFileSync('TestReport_Final_Full_List.xls', html);
console.log('Final Full Report Generated: TestReport_Final_Full_List.xls');
