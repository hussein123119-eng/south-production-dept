/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Exporter Utility
   ========================================================================== */

class ExporterUtility {
  getOfficialHierarchyString(sectionName = '', stationName = '') {
    const parts = [
      'وزارة النفط',
      'شركة نفط البصرة',
      'هيأة تشغيل الرميلة',
      'قسم الإنتاج الجنوبي'
    ];
    if (sectionName) parts.push(sectionName);
    if (stationName) parts.push(stationName);
    return parts.join(' ➔ ');
  }

  generateBarcodeSvg(text, width = 160, height = 40) {
    if (!text) text = 'SPD-REF-000';
    let pattern = [1, 0, 1, 1, 0, 0, 1];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      pattern.push(1, 0);
      pattern.push((code % 2 === 0) ? 1 : 0);
      pattern.push(1);
      pattern.push(((code >> 1) % 2 === 0) ? 1 : 0);
      pattern.push(0);
      pattern.push(((code >> 2) % 2 === 0) ? 1 : 0);
      pattern.push(1);
    }
    pattern.push(1, 1, 0, 0, 1, 0, 1, 1, 1);

    const barWidth = (width / pattern.length).toFixed(2);
    let rects = '';
    let x = 0;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === 1) {
        rects += `<rect x="${x.toFixed(2)}" y="0" width="${barWidth}" height="${height - 12}" fill="#000000" />`;
      }
      x += parseFloat(barWidth);
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; margin: 0 auto;">
        ${rects}
        <text x="${width / 2}" y="${height - 2}" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle" fill="#1e293b">${text}</text>
      </svg>
    `;
  }

  generateQrCodeSvg(text, size = 52) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 25 25" style="display: block; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px;">
        <rect x="1" y="1" width="7" height="7" fill="#003366" />
        <rect x="2" y="2" width="5" height="5" fill="#ffffff" />
        <rect x="3" y="3" width="3" height="3" fill="#003366" />
        <rect x="17" y="1" width="7" height="7" fill="#003366" />
        <rect x="18" y="2" width="5" height="5" fill="#ffffff" />
        <rect x="19" y="3" width="3" height="3" fill="#003366" />
        <rect x="1" y="17" width="7" height="7" fill="#003366" />
        <rect x="2" y="18" width="5" height="5" fill="#ffffff" />
        <rect x="3" y="19" width="3" height="3" fill="#003366" />
        <rect x="9" y="3" width="1" height="1" fill="#003366" />
        <rect x="11" y="3" width="1" height="1" fill="#003366" />
        <rect x="13" y="3" width="1" height="1" fill="#003366" />
        <rect x="15" y="3" width="1" height="1" fill="#003366" />
        <rect x="3" y="9" width="1" height="1" fill="#003366" />
        <rect x="3" y="11" width="1" height="1" fill="#003366" />
        <rect x="3" y="13" width="1" height="1" fill="#003366" />
        <rect x="3" y="15" width="1" height="1" fill="#003366" />
        <rect x="10" y="10" width="5" height="5" fill="#003366" />
        <rect x="11" y="11" width="3" height="3" fill="#ffffff" />
        <rect x="12" y="12" width="1" height="1" fill="#003366" />
        <rect x="17" y="10" width="2" height="2" fill="#003366" />
        <rect x="21" y="12" width="2" height="2" fill="#003366" />
        <rect x="10" y="17" width="2" height="2" fill="#003366" />
        <rect x="14" y="19" width="2" height="2" fill="#003366" />
        <rect x="18" y="17" width="3" height="3" fill="#003366" />
        <rect x="17" y="21" width="2" height="2" fill="#003366" />
        <rect x="21" y="19" width="2" height="2" fill="#003366" />
      </svg>
    `;
  }

  renderOfficialHeader(options = {}) {
    const sectionName = options.sectionName || '';
    const stationName = options.stationName || options.unitName || '';
    const docNumber = options.docNumber || options.docCode || 'ق.ج/ص/2026/01';
    const docDate = options.docDate || new Date().toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' });
    const docTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const barcodeSvg = this.generateBarcodeSvg(docNumber, 175, 42);
    const qrSvg = this.generateQrCodeSvg(docNumber, 54);

    return `
      <div style="border-bottom: 2.5px solid #003366; padding-bottom: 12px; margin-bottom: 18px; direction: rtl; font-family: 'Cairo', 'Segoe UI', sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <!-- الجهة اليمنى: الشعار والترويسة الوزارية الرسمية -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 58px; height: 58px; border-radius: 12px; background: linear-gradient(135deg, #003366 0%, #006a6a 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 1.3rem; border: 2px solid #c5a059; box-shadow: 0 3px 8px rgba(0,0,0,0.15);">
              🇮🇶
            </div>
            <div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #003366; margin-bottom: 2px;">جمهورية العراق - وزارة النفط</div>
              <div style="font-size: 1.02rem; font-weight: 800; color: #004d40; margin-bottom: 2px;">شركة نفط البصرة · هيأة تشغيل الرميلة</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #b45309;">
                قسم الإنتاج الجنوبي
                ${sectionName ? `<span style="color: #0284c7;"> | ${sectionName}</span>` : ''}
                ${stationName ? `<span style="color: #16a34a;"> | ${stationName}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- الجهة اليسرى: الثلاثي القانوني المعتمد (العدد الصريح + التاريخ + الباركود ورمز التحقق) -->
          <div style="display: flex; align-items: center; gap: 10px; background: #ffffff; border: 1.5px solid #cbd5e1; padding: 6px 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
            <div style="text-align: right;">
              <div style="font-size: 0.88rem; color: #0f172a; margin-bottom: 2px;">
                <strong style="color: #b45309;">العدد:</strong> 
                <span style="font-family: monospace; font-weight: 900; font-size: 0.95rem; direction: ltr; display: inline-block;">${docNumber}</span>
              </div>
              <div style="font-size: 0.84rem; color: #334155; margin-bottom: 2px;">
                <strong style="color: #047857;">التاريخ:</strong> 
                <span style="font-weight: 700;">${docDate}</span>
              </div>
              <div style="margin-top: 4px;">
                ${barcodeSvg}
              </div>
            </div>
            <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;">
              ${qrSvg}
              <span style="font-size: 0.62rem; color: #64748b; font-weight: 800; text-align: center;">رمز التحقق</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  exportToStyledExcel(title, headers, rows, meta = {}) {
    const orgHierarchy = this.getOfficialHierarchyString(meta.sectionName || '', meta.stationName || '');
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>${(title || 'البيانات').substring(0, 31)}</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayRightToLeft/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Arial', 'Cairo', sans-serif; direction: rtl; }
            .header-banner { background-color: #003366; color: #ffffff; font-size: 14pt; font-weight: bold; text-align: center; height: 35px; }
            .hierarchy-banner { background-color: #f1f5f9; color: #004d40; font-size: 11pt; font-weight: bold; text-align: center; height: 26px; }
            .meta-bar { background-color: #e2e8f0; font-size: 9.5pt; color: #334155; height: 22px; }
            .col-header { background-color: #003366; color: #ffffff; font-weight: bold; font-size: 10.5pt; text-align: center; border: 1px solid #94a3b8; height: 30px; }
            .data-cell { border: 1px solid #cbd5e1; font-size: 10pt; text-align: right; vertical-align: middle; padding: 6px; }
            .data-cell-center { border: 1px solid #cbd5e1; font-size: 10pt; text-align: center; vertical-align: middle; }
            .data-cell-num { border: 1px solid #cbd5e1; font-size: 10pt; text-align: center; font-family: monospace; font-weight: bold; }
            .row-alt { background-color: #f8fafc; }
            .footer-note { font-size: 9pt; color: #64748b; text-align: center; height: 25px; }
          </style>
        </head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td colspan="${headers.length}" class="header-banner">
                جمهورية العراق - وزارة النفط - شركة نفط البصرة
              </td>
            </tr>
            <tr>
              <td colspan="${headers.length}" class="hierarchy-banner">
                هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي ${meta.sectionName ? ' | ' + meta.sectionName : ''}
              </td>
            </tr>
            <tr>
              <td colspan="${headers.length}" style="background-color: #ffffff; color: #003366; font-size: 13pt; font-weight: bold; text-align: center; height: 32px;">
                ${title}
              </td>
            </tr>
            <tr>
              <td colspan="${headers.length}" class="meta-bar">
                <span>تاريخ التصدير: ${dateStr} ${timeStr}</span> | 
                <span>إجمالي السجلات: ${rows.length} سجل</span> | 
                <span>المنظومة الرقمية الموحدة</span>
              </td>
            </tr>
            <tr><td colspan="${headers.length}" style="height: 10px;"></td></tr>
            
            <!-- Table Headers -->
            <tr>
              <th class="col-header" style="width: 45px;">#</th>
              ${headers.map(h => `<th class="col-header">${h}</th>`).join('')}
            </tr>

            <!-- Table Data Rows -->
            ${rows.map((row, idx) => `
              <tr class="${idx % 2 === 1 ? 'row-alt' : ''}">
                <td class="data-cell-num">${idx + 1}</td>
                ${row.map(cell => {
                  const isNum = /^[0-9A-Za-z\-_]+$/.test(String(cell || '').trim());
                  return `<td class="${isNum ? 'data-cell-num' : 'data-cell'}">${cell !== undefined && cell !== null && cell !== '' ? cell : '-'}</td>`;
                }).join('')}
              </tr>
            `).join('')}

            <tr><td colspan="${headers.length}" style="height: 15px;"></td></tr>
            <tr>
              <td colspan="${headers.length}" class="footer-note">
                وثيقة رقمية صادرة ومعتمدة من إدارة قسم الإنتاج الجنوبي - شركة نفط البصرة (${dateStr})
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.xls`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  }

  exportToWordDoc(title, subtitle, headers, rows, meta = {}) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>${title}</title>
          <style>
            @page { size: A4 landscape; margin: 1.5cm; }
            body { font-family: 'Arial', 'Cairo', sans-serif; direction: rtl; color: #1e293b; }
            .header-title { font-size: 16pt; font-weight: bold; color: #003366; text-align: center; margin-bottom: 2px; }
            .hierarchy-title { font-size: 13pt; font-weight: bold; color: #004d40; text-align: center; margin-bottom: 3px; }
            .sub-title { font-size: 11pt; font-weight: bold; color: #b45309; text-align: center; margin-bottom: 12px; }
            .doc-heading { font-size: 14pt; font-weight: bold; color: #003366; text-align: center; margin: 15px 0 5px 0; border-top: 2px solid #003366; border-bottom: 2px solid #003366; padding: 6px 0; background: #f8fafc; }
            .meta-box { border: 1px solid #cbd5e1; background: #f1f5f9; padding: 8px 12px; margin-bottom: 15px; font-size: 9.5pt; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 9.5pt; }
            th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: right; }
            th { background-color: #003366; color: #ffffff; font-weight: bold; text-align: center; }
            .row-alt { background-color: #f8fafc; }
            .sig-section { margin-top: 35px; width: 100%; }
            .sig-box { width: 45%; float: right; text-align: center; font-size: 10pt; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-title">جمهورية العراق - وزارة النفط</div>
          <div class="hierarchy-title">شركة نفط البصرة - هيأة تشغيل الرميلة</div>
          <div class="sub-title">قسم الإنتاج الجنوبي ${meta.sectionName ? ' | ' + meta.sectionName : ''}</div>
          
          <div class="doc-heading">${title}</div>
          ${subtitle ? `<div style="text-align: center; font-size: 10.5pt; color: #475569; margin-bottom: 10px;">${subtitle}</div>` : ''}

          <div class="meta-box">
            <div><strong>تاريخ التصدير:</strong> ${dateStr} ${timeStr}</div>
            <div><strong>إجمالي المنتسبين:</strong> ${rows.length} منتسب</div>
            <div><strong>نطاق التقرير:</strong> ${meta.scopeName || 'كافة كوادر القسم'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">#</th>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, idx) => `
                <tr class="${idx % 2 === 1 ? 'row-alt' : ''}">
                  <td style="text-align: center; font-weight: bold; font-family: monospace;">${idx + 1}</td>
                  ${row.map(c => `<td>${c !== undefined && c !== null && c !== '' ? c : '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px; display: table; width: 100%;">
            <div style="display: table-cell; width: 50%; text-align: right;">
              <div><strong>إعداد ومصادقة:</strong> مسؤول شعبة الموارد البشرية</div>
              <div style="margin-top: 30px;">التوقيع: _______________________</div>
            </div>
            <div style="display: table-cell; width: 50%; text-align: left;">
              <div><strong>مصادقة:</strong> مدير قسم الإنتاج الجنوبي</div>
              <div style="margin-top: 30px;">الختم والتوقيع: _______________________</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.doc`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  }

  exportToExcel(title, headers, rows) {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printDocument(title, subtitle, htmlContent, headerOptions = {}) {
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      const printWindow = window.open('', '_blank');
      if (printWindow && printWindow.document) {
        const headerHtml = this.renderOfficialHeader({
          ...headerOptions,
          docDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });

        printWindow.document.write(`
          <html lang="ar" dir="rtl">
            <head>
              <meta charset="utf-8">
              <title>${title} - طباعة رسمية</title>
              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
              <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: 'Cairo', sans-serif; padding: 1.5rem; color: #1e293b; direction: rtl; }
                h1 { text-align: center; color: #003366; font-size: 1.4rem; font-weight: 900; margin: 10px 0; }
                h2 { text-align: center; color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; }
                .content { font-size: 1rem; line-height: 1.7; }
                table { width: 100%; border-collapse: collapse; margin-top: 1.25rem; font-size: 0.88rem; }
                th, td { border: 1px solid #cbd5e1; padding: 0.65rem 0.85rem; text-align: right; }
                th { background-color: #f1f5f9; color: #003366; font-weight: 800; }
                @media print {
                  body { padding: 0; }
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              ${headerHtml}
              <h1>${title}</h1>
              ${subtitle ? `<h2>${subtitle}</h2>` : ''}
              <div class="content">
                ${htmlContent}
              </div>
              <script>
                window.onload = () => { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  }
}

window.exporter = new ExporterUtility();
