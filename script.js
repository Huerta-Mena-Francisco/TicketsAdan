// Configuration
const TAX_RATE = 8.25; // 8.25% fixed

// DOM Elements
const ticketForm = document.getElementById('ticketForm');
const descriptionInput = document.getElementById('description');
const subtotalInput = document.getElementById('subtotal');
const mccInput = document.getElementById('mcc');
const itemNumberInput = document.getElementById('itemNumber');
const printPreviewBtn = document.getElementById('printPreviewBtn');
const resetBtn = document.getElementById('resetBtn');
const ticketPreview = document.getElementById('ticketPreview');

// Generate random 6-digit transaction number
function generateTransactionNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate tax and total
function calculateTaxAndTotal(subtotal) {
    const tax = (subtotal * TAX_RATE) / 100;
    const total = subtotal + tax;
    return {
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

// Format current date/time for ticket
function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Create ticket HTML for preview
function createTicketHTML(ticketData) {
    return `
        <div class="ticket">
            <div class="ticket-header">
                <div class="business-name">CHICHO'S ANIME STORE</div>
                SALES RECEIPT<br>
                <small>${ticketData.dateTime}</small>
            </div>
            <div class="description-row">
                ${ticketData.description}
            </div>
            <div class="ticket-row">
                <span>Trans:</span>
                <span>${ticketData.trans}</span>
            </div>
            <div class="ticket-row">
                <span>MCC:</span>
                <span>${ticketData.mcc}</span>
            </div>
            <div class="ticket-row">
                <span>Item#:</span>
                <span>${ticketData.itemNumber}</span>
            </div>
            <div class="ticket-row">
                <span>Sub-total:</span>
                <span>$${ticketData.subtotal.toFixed(2)}</span>
            </div>
            <div class="ticket-row">
                <span>Tax (${TAX_RATE}%):</span>
                <span>$${ticketData.tax.toFixed(2)}</span>
            </div>
            <div class="ticket-row ticket-total">
                <span>TOTAL:</span>
                <span>$${ticketData.total.toFixed(2)}</span>
            </div>
            <div class="ticket-footer">
                Come and visit us again<br>
                <div class="footer-thankyou">THANK YOU!</div>
            </div>
        </div>
    `;
}

// Generate ticket data from form
function generateTicketData() {
    const subtotal = parseFloat(subtotalInput.value);
    const description = descriptionInput.value.trim();
    const mcc = mccInput.value.trim();
    const itemNumber = itemNumberInput.value.trim();
    
    const trans = generateTransactionNumber();
    const calculations = calculateTaxAndTotal(subtotal);
    const dateTime = getCurrentDateTime();
    
    return {
        trans,
        description,
        mcc,
        itemNumber,
        subtotal,
        tax: calculations.tax,
        total: calculations.total,
        dateTime
    };
}

// Display ticket preview
function displayTicketPreview(ticketData) {
    ticketPreview.innerHTML = createTicketHTML(ticketData);
}

// Print ticket
function printTicket(ticketData) {
    const printWindow = window.open('', '_blank');
    
    // Get logo as base64 for printing
    const logoImg = document.querySelector('.logo');
    let logoBase64 = '';
    
    // Try to get logo as base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        logoBase64 = canvas.toDataURL('image/jpeg');
        
        printWindow.document.write(createPrintHTML(ticketData, logoBase64));
        printWindow.document.close();
    };
    
    img.src = 'Logo.jpeg';
    
    // Fallback if logo loading fails
    setTimeout(() => {
        if (!printWindow.document.body) {
            printWindow.document.write(createPrintHTML(ticketData, ''));
            printWindow.document.close();
        }
    }, 1000);
}

// Create HTML for printing
// Create ticket HTML for preview - WITHOUT "Description:" label
function createTicketHTML(ticketData) {
    return `
        <div class="ticket">
            <div class="ticket-header">
                <div class="business-name">Chicho’s Anime Store</div>
                SALES RECEIPT<br>
                <small>${ticketData.dateTime}</small>
            </div>
            <div class="ticket-row">
                <span>${ticketData.description}</span>
            </div>
            <div class="ticket-row">
                <span>Trans:</span>
                <span>${ticketData.trans}</span>
            </div>
            <div class="ticket-row">
                <span>MCC:</span>
                <span>${ticketData.mcc}</span>
            </div>
            <div class="ticket-row">
                <span>Item#:</span>
                <span>${ticketData.itemNumber}</span>
            </div>
            <div class="ticket-row">
                <span>Sub-total:</span>
                <span>$${ticketData.subtotal.toFixed(2)}</span>
            </div>
            <div class="ticket-row">
                <span>Tax (${TAX_RATE}%):</span>
                <span>$${ticketData.tax.toFixed(2)}</span>
            </div>
            <div class="ticket-row ticket-total">
                <span>TOTAL:</span>
                <span>$${ticketData.total.toFixed(2)}</span>
            </div>
            <div class="ticket-footer">
                Come and visit us again<br>
                Thank you!
            </div>
        </div>
    `;
}

// Create HTML for printing - WITHOUT "Description:" label
// Create HTML for printing
function createPrintHTML(ticketData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket ${ticketData.trans}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 15px;
                    width: 85mm;
                    margin: 0;
                    padding: 3mm;
                }
                .ticket-header {
                    text-align: center;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .business-name {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .description-row {
                    text-align: center;
                    margin-bottom: 18px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #ccc;
                    font-weight: bold;
                    font-size: 16px;
                    min-height: 25px;
                }
                .ticket-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #ccc;
                    min-height: 25px;
                }
                .ticket-total {
                    border-top: 3px solid #000;
                    margin-top: 20px;
                    padding-top: 15px;
                    font-weight: bold;
                    font-size: 18px;
                }
                .ticket-footer {
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 2px dashed #000;
                    font-size: 14px;
                    line-height: 1.6;
                    letter-spacing: 0.5px;
                }
                .footer-thankyou {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0;
                    text-transform: uppercase;
                }
                @media print {
                    @page {
                        margin: 0;
                        size: 85mm auto;
                    }
                    body {
                        margin: 0;
                        padding: 3mm;
                    }
                }
            </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 500);">
            <div class="ticket-header">
                <div class="business-name">CHICHO'S ANIME STORE</div>
                SALES RECEIPT<br>
                <small>${ticketData.dateTime}</small>
            </div>
            <div class="description-row">
                ${ticketData.description}
            </div>
            <div class="ticket-row">
                <span>Trans:</span>
                <span>${ticketData.trans}</span>
            </div>
            <div class="ticket-row">
                <span>MCC:</span>
                <span>${ticketData.mcc}</span>
            </div>
            <div class="ticket-row">
                <span>Item#:</span>
                <span>${ticketData.itemNumber}</span>
            </div>
            <div class="ticket-row">
                <span>Sub-total:</span>
                <span>$${ticketData.subtotal.toFixed(2)}</span>
            </div>
            <div class="ticket-row">
                <span>Tax (${TAX_RATE}%):</span>
                <span>$${ticketData.tax.toFixed(2)}</span>
            </div>
            <div class="ticket-row ticket-total">
                <span>TOTAL:</span>
                <span>$${ticketData.total.toFixed(2)}</span>
            </div>
            <div class="ticket-footer">
                Come and visit us again<br>
                <div class="footer-thankyou">THANK YOU!</div>
            </div>
        </body>
        </html>
    `;
}

// Update printTicket function
function printTicket(ticketData) {
    // 1. Crear el HTML del ticket usando tu función existente
    const ticketHTML = createTicketHTML(ticketData);
    
    // 2. Crear un elemento temporal para el ticket
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ticketHTML;
    const ticketElement = tempDiv.querySelector('.ticket');
    
    // 3. Configurar el estilo específico para impresión
    ticketElement.style.cssText = `
        width: 85mm !important;
        min-height: 280px !important;
        padding: 15px !important;
        font-family: 'Courier New', monospace !important;
        font-size: 14px !important;
        margin: 0 auto !important;
        background: white !important;
        border: 1px solid #000 !important;
    `;
    
    // 4. Usar Print.js para imprimir
    printJS({
        printable: ticketElement.innerHTML,
        type: 'raw-html',
        style: `
            .business-name { 
                font-size: 20px !important; 
                font-weight: bold !important; 
                text-align: center !important;
                margin-bottom: 8px !important;
                text-transform: uppercase !important;
            }
            .ticket-header { 
                text-align: center !important;
                border-bottom: 1px dashed #000 !important;
                padding-bottom: 10px !important;
                margin-bottom: 15px !important;
            }
            .description-row {
                text-align: center !important;
                margin-bottom: 15px !important;
                padding-bottom: 8px !important;
                border-bottom: 1px solid #ccc !important;
                font-weight: bold !important;
            }
            .ticket-row {
                display: flex !important;
                justify-content: space-between !important;
                margin-bottom: 8px !important;
                padding-bottom: 4px !important;
                border-bottom: 1px dotted #ccc !important;
            }
            .ticket-total {
                border-top: 2px solid #000 !important;
                margin-top: 15px !important;
                padding-top: 10px !important;
                font-weight: bold !important;
                font-size: 16px !important;
            }
            .ticket-footer {
                text-align: center !important;
                margin-top: 20px !important;
                padding-top: 15px !important;
                border-top: 1px dashed #000 !important;
                font-size: 13px !important;
            }
            .footer-thankyou {
                font-size: 15px !important;
                font-weight: bold !important;
                margin: 10px 0 !important;
            }
        `,
        documentTitle: `Ticket_${ticketData.trans}`,
        onPrintDialogClose: function() {
            console.log('Diálogo de impresión cerrado');
        }
    });
}

// Form submission handler
ticketForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate inputs
    const subtotal = parseFloat(subtotalInput.value);
    if (subtotal <= 0 || isNaN(subtotal)) {
        alert('Please enter a valid subtotal greater than 0');
        return;
    }
    
    if (!descriptionInput.value.trim()) {
        alert('Please enter a description');
        descriptionInput.focus();
        return;
    }
    
    if (!mccInput.value.trim()) {
        alert('Please enter MCC');
        mccInput.focus();
        return;
    }
    
    if (!itemNumberInput.value.trim()) {
        alert('Please enter Item#');
        itemNumberInput.focus();
        return;
    }
    
    // Generate ticket data
    const ticketData = generateTicketData();
    
    // Display preview
    displayTicketPreview(ticketData);
    
    // Auto-print after 1 second
    setTimeout(() => {
        if (confirm('Ticket generated successfully! Do you want to print now?')) {
            printTicket(ticketData);
        }
    }, 100);
});

// Print preview button
printPreviewBtn.addEventListener('click', function() {
    const subtotal = parseFloat(subtotalInput.value);
    
    if (subtotal <= 0 || isNaN(subtotal) || 
        !descriptionInput.value.trim() || 
        !mccInput.value.trim() || 
        !itemNumberInput.value.trim()) {
        alert('Please fill all fields with valid data first');
        return;
    }
    
    const ticketData = generateTicketData();
    printTicket(ticketData);
});

// Reset form button
resetBtn.addEventListener('click', function() {
    if (confirm('Reset all form fields?')) {
        ticketForm.reset();
        ticketPreview.innerHTML = '<p class="preview-placeholder">Enter data to see ticket preview</p>';
        descriptionInput.focus();
    }
});

// Real-time preview update
function updateLivePreview() {
    const subtotal = parseFloat(subtotalInput.value);
    
    if (!subtotal || subtotal <= 0 || isNaN(subtotal) ||
        !descriptionInput.value.trim() ||
        !mccInput.value.trim() ||
        !itemNumberInput.value.trim()) {
        return;
    }
    
    const ticketData = generateTicketData();
    displayTicketPreview(ticketData);
}

// Initialize app
function initApp() {
    // Focus first field
    descriptionInput.focus();
    
    // Add input listeners for real-time preview
    const inputs = [descriptionInput, mccInput, itemNumberInput, subtotalInput];
    inputs.forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });
    
    console.log('Ticket System initialized');
    console.log('Tax rate: ' + TAX_RATE + '%');
}

// Start app when page loads
document.addEventListener('DOMContentLoaded', initApp);