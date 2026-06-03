/**
 * Thermal Receipt Generator
 * Draws a receipt as a Canvas PNG image that any thermal printer can print.
 * Width: 384px (58mm paper @ 203 DPI) or 576px (80mm)
 */

const ThermalReceipt = (function() {
    'use strict';

    const PAPER_WIDTH = 384;  // 58mm @ 203 DPI — most common thermal width
    const MARGIN = 16;
    const CONTENT_WIDTH = PAPER_WIDTH - (MARGIN * 2);
    const LINE_HEIGHT = 22;
    const FONT = '16px "Courier New", monospace';
    const FONT_BOLD = 'bold 16px "Courier New", monospace';
    const FONT_SMALL = '13px "Courier New", monospace';
    const FONT_LARGE = 'bold 20px "Courier New", monospace';

    // Gift names map
    const giftNames = {
        'day-cream': 'Crema de Día',
        'night-cream': 'Crema de Noche',
        'facial-serum': 'Sérum Facial',
        'eye-serum': 'Sérum de Ojos',
        'eye-cream': 'Contorno de Ojos',
        'facial-peel': 'Peeling Facial',
        'body-scrub': 'Exfoliante Corporal',
        'body-butter': 'Mantequilla Corporal',
        'nail-kit': 'Kit de Uñas',
        'facial-cleanser': 'Limpiador Facial',
    };

    function drawDashedLine(ctx, y) {
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(MARGIN, y);
        ctx.lineTo(PAPER_WIDTH - MARGIN, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        return y + 12;
    }

    function drawCenteredText(ctx, text, y, font, color) {
        ctx.font = font || FONT;
        ctx.fillStyle = color || '#000';
        ctx.textAlign = 'center';
        ctx.fillText(text, PAPER_WIDTH / 2, y);
        ctx.textAlign = 'left';
        return y + LINE_HEIGHT;
    }

    function drawLeftRight(ctx, left, right, y, font) {
        ctx.font = font || FONT;
        ctx.fillStyle = '#000';
        ctx.fillText(left, MARGIN, y);
        const rightWidth = ctx.measureText(right).width;
        ctx.fillText(right, PAPER_WIDTH - MARGIN - rightWidth, y);
        return y + LINE_HEIGHT;
    }

    function drawWrappedText(ctx, text, y, maxWidth, font) {
        ctx.font = font || FONT_SMALL;
        ctx.fillStyle = '#000';
        const words = text.split(' ');
        let line = '';
        let lineY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), MARGIN, lineY);
                line = words[i] + ' ';
                lineY += LINE_HEIGHT;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), MARGIN, lineY);
        return lineY + LINE_HEIGHT;
    }

    function drawQRCode(ctx, qrCanvas, x, y, size) {
        if (!qrCanvas) return y;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qrCanvas, x, y, size, size);
        return y + size + 12;
    }

    function generateReceiptPNG(offer, qrCanvas) {
        // Calculate height first
        let y = 20;
        y += 24; // ZERO LINES
        y += 12; // dashed line
        y += 24; // OFERTA EXCLUSIVA
        y += 8;
        y += 28; // Oferta Especial
        y += 22; // Para: customer
        y += 12; // dashed line
        y += 20; // seller
        y += 12; // dashed line
        y += 20; // product name
        y += 20; // product desc
        y += 12; // dashed line
        y += 22; // regular price
        y += 26; // your price
        y += 22; // savings
        y += 12; // dashed line

        const gifts = offer.gifts || [];
        if (gifts.length > 0) {
            y += 22; // REGALOS header
            y += gifts.length * 20;
            y += 12; // dashed line
        }

        if (offer.note) {
            const noteLines = Math.ceil(offer.note.length / 30);
            y += noteLines * 20 + 8;
            y += 12; // dashed line
        }

        y += 22; // QR header
        y += 140; // QR code
        y += 12; // dashed line
        y += 20; // expiry label
        y += 20; // expiry date
        y += 12; // dashed line
        y += 18; // footer line 1
        y += 18; // footer line 2
        y += 18; // footer line 3
        y += 20; // final dashed line

        const canvas = document.createElement('canvas');
        canvas.width = PAPER_WIDTH;
        canvas.height = y;

        const ctx = canvas.getContext('2d');
        // White background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, PAPER_WIDTH, y);

        // Draw content
        let drawY = 20;

        // Header
        drawY = drawCenteredText(ctx, 'ZERO LINES', drawY, FONT_BOLD);
        drawY = drawDashedLine(ctx, drawY);
        drawY = drawCenteredText(ctx, 'OFERTA EXCLUSIVA', drawY, FONT_SMALL);
        drawY += 8;
        drawY = drawCenteredText(ctx, 'Oferta Especial', drawY, FONT_LARGE);
        drawY = drawCenteredText(ctx, 'Para: ' + (offer.customer || 'Usted'), drawY, FONT);
        drawY = drawDashedLine(ctx, drawY);
        drawY = drawCenteredText(ctx, 'Preparada por: ' + (offer.seller || 'Vendedor'), drawY, FONT_SMALL);
        drawY = drawDashedLine(ctx, drawY);

        // Product
        drawY = drawCenteredText(ctx, 'Reverse Five', drawY, FONT_BOLD);
        drawY = drawCenteredText(ctx, (offer.units || 1) + ' unidad' + ((offer.units || 1) > 1 ? 'es' : '') + ' · 100 tratamientos', drawY, FONT_SMALL);
        drawY = drawDashedLine(ctx, drawY);

        // Pricing
        const regularTotal = 300 * (offer.units || 1);
        const customTotal = offer.price * (offer.units || 1);
        const savings = regularTotal - customTotal;

        drawY = drawLeftRight(ctx, 'Precio regular:', '€' + regularTotal, drawY, FONT_SMALL);
        drawY = drawLeftRight(ctx, 'TU PRECIO:', '€' + customTotal, drawY, FONT_BOLD);
        drawY = drawLeftRight(ctx, 'AHORRAS:', '€' + savings, drawY, FONT_BOLD);
        drawY = drawDashedLine(ctx, drawY);

        // Gifts
        if (gifts.length > 0) {
            drawY = drawCenteredText(ctx, 'REGALOS INCLUIDOS (' + gifts.length + ')', drawY, FONT_BOLD);
            gifts.forEach(g => {
                ctx.font = FONT_SMALL;
                ctx.fillStyle = '#000';
                ctx.fillText('+ ' + (giftNames[g] || g), MARGIN + 10, drawY);
                drawY += 20;
            });
            drawY = drawDashedLine(ctx, drawY);
        }

        // Note
        if (offer.note) {
            drawY = drawWrappedText(ctx, '"' + offer.note + '"', drawY, CONTENT_WIDTH, FONT_SMALL);
            drawY = drawDashedLine(ctx, drawY);
        }

        // QR Code
        drawY = drawCenteredText(ctx, 'ESCANEA PARA RECLAMAR', drawY, FONT_SMALL);
        const qrSize = 120;
        const qrX = (PAPER_WIDTH - qrSize) / 2;
        drawY = drawQRCode(ctx, qrCanvas, qrX, drawY, qrSize);
        drawY = drawDashedLine(ctx, drawY);

        // Expiry
        const expiryDate = new Date(offer.expires);
        drawY = drawCenteredText(ctx, 'Oferta expira:', drawY, FONT_SMALL);
        drawY = drawCenteredText(ctx, expiryDate.toLocaleString('es-ES'), drawY, FONT_SMALL);
        drawY = drawDashedLine(ctx, drawY);

        // Footer
        drawY = drawCenteredText(ctx, 'Gracias por su confianza', drawY, FONT_SMALL);
        drawY = drawCenteredText(ctx, 'Zero Lines - Andorra', drawY, FONT_SMALL);
        drawY = drawCenteredText(ctx, '+350 5400 5198', drawY, FONT_SMALL);
        drawY = drawDashedLine(ctx, drawY);

        return canvas;
    }

    function downloadReceipt(offer, filename) {
        // First generate QR code canvas
        const qrDiv = document.createElement('div');
        const qr = new QRCode(qrDiv, {
            text: window.location.origin + window.location.pathname.replace('admin.html', '') + 'offer.html?d=' + btoa(JSON.stringify(offer)),
            width: 120,
            height: 120,
            colorDark: '#000',
            colorLight: '#fff',
            correctLevel: QRCode.CorrectLevel.M,
        });

        // Wait for QR to render (qrcode.js uses setTimeout internally)
        setTimeout(() => {
            const qrCanvas = qrDiv.querySelector('canvas') || qrDiv.querySelector('img');
            const receiptCanvas = generateReceiptPNG(offer, qrCanvas);

            // Download
            const link = document.createElement('a');
            link.download = filename || 'oferta-zero-lines.png';
            link.href = receiptCanvas.toDataURL('image/png');
            link.click();
        }, 300);
    }

    return {
        downloadReceipt,
        generateReceiptPNG,
    };
})();
