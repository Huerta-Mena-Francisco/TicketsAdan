// Configuration
const TAX_RATE = 8.25; // 8.25% fixed
const PAPER_WIDTH = 58; // mm
let currentMode = 'single'; // 'single' or 'multi'

// DOM Elements
const ticketForm = document.getElementById('ticketForm');
const multiProductForm = document.getElementById('multiProductForm');
const descriptionInput = document.getElementById('description');
const subtotalInput = document.getElementById('subtotal');
const mccInput = document.getElementById('mcc');
const itemNumberInput = document.getElementById('itemNumber');
const printPreviewBtn = document.getElementById('printPreviewBtn');
const resetBtn = document.getElementById('resetBtn');
const ticketPreview = document.getElementById('ticketPreview');
const singleProductBtn = document.getElementById('singleProductBtn');
const multiProductBtn = document.getElementById('multiProductBtn');
const addProductBtn = document.getElementById('addProductBtn');
const generateMultiBtn = document.getElementById('generateMultiBtn');
const printMultiBtn = document.getElementById('printMultiBtn');
const resetMultiBtn = document.getElementById('resetMultiBtn');
const productsContainer = document.getElementById('productsContainer');
const printStatus = document.getElementById('printStatus');

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

// Create product item HTML
function createProductItem(index) {
    return `
        <div class="product-item" data-index="${index}">
            <div class="product-header">
                <h3>Product ${index + 1}</h3>
                <button type="button" class="remove-product" onclick="removeProduct(${index})">×</button>
            </div>
            <div class="product-row">
                <div class="form-group">
                    <label>Description:</label>
                    <input type="text" class="multi-desc" placeholder="Enter item description" required>
                </div>
                <div class="form-group">
                    <label>MCC:</label>
                    <input type="text" class="multi-mcc" placeholder="Ex: 6643E901" required>
                </div>
            </div>
            <div class="product-row">
                <div class="form-group">
                    <label>Item#:</label>
                    <input type="text" class="multi-item" placeholder="Ex: 654182" required>
                </div>
                <div class="form-group">
                    <label>Price ($):</label>
                    <input type="number" class="multi-price" step="0.01" min="0" placeholder="149.99" required>
                </div>
                <div class="form-group">
                    <label>Qty:</label>
                    <input type="number" class="multi-qty" min="1" value="1" required>
                </div>
            </div>
        </div>
    `;
}

// Global function to remove product
window.removeProduct = function(index) {
    const productItems = document.querySelectorAll('.product-item');
    if (productItems.length > 1) {
        productItems.forEach(item => {
            if (parseInt(item.dataset.index) === index) {
                item.remove();
            }
        });
        const remainingItems = document.querySelectorAll('.product-item');
        remainingItems.forEach((item, idx) => {
            item.dataset.index = idx;
            item.querySelector('h3').textContent = `Product ${idx + 1}`;
        });
        updateLivePreview();
        saveDataToLocalStorage();
    } else {
        alert('You must have at least one product.');
    }
};

// Collect multi-product data
function collectMultiProductData() {
    const products = [];
    let totalSubtotal = 0;
    
    document.querySelectorAll('.product-item').forEach(item => {
        const desc = item.querySelector('.multi-desc').value.trim();
        const mcc = item.querySelector('.multi-mcc').value.trim();
        const itemNum = item.querySelector('.multi-item').value.trim();
        const price = parseFloat(item.querySelector('.multi-price').value) || 0;
        const qty = parseInt(item.querySelector('.multi-qty').value) || 1;
        const subtotal = price * qty;
        
        if (desc && mcc && itemNum && price > 0) {
            products.push({
                description: desc,
                mcc: mcc,
                itemNumber: itemNum,
                price: price,
                quantity: qty,
                subtotal: subtotal
            });
            totalSubtotal += subtotal;
        }
    });
    
    return { products, totalSubtotal };
}

// SIMPLE HTML para imagen - SIN CSS COMPLEJO
function createTicketImageHTML(ticketData, isMulti = false) {
    if (isMulti) {
        let productsHTML = '';
        let itemCount = 0;
        
        ticketData.products.forEach((product, index) => {
            itemCount += product.quantity;
            const shortDesc = product.description.length > 20 
                ? product.description.substring(0, 18) + '..' 
                : product.description;
                
            productsHTML += `
                <div style="display: flex; justify-content: space-between; margin: 6px 0; font-size: 11px;">
                    <span style="flex: 2; text-align: left;">${index + 1}. ${shortDesc}</span>
                    <span style="flex: 1; text-align: right;">${product.quantity} × $${product.price.toFixed(2)}</span>
                </div>
                <div style="text-align: right; margin: 0 0 8px 0; font-size: 11px; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
                    $${product.subtotal.toFixed(2)}
                </div>
            `;
        });
        
        return `
            <div style="width: 58mm; padding: 12px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.35; background: white;">
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 12px;">
                    <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">CHICHO'S ANIME STORE</div>
                    <div style="font-size: 12px; margin-bottom: 3px;">SALES RECEIPT</div>
                    <div style="font-size: 10px;">${ticketData.dateTime}</div>
                </div>
                
                <!-- TRANSACCIÓN PRIMERO -->
                <div style="display: flex; justify-content: space-between; margin: 8px 0; font-weight: bold; font-size: 12px;">
                    <span>Trans#:</span>
                    <span>${ticketData.trans}</span>
                </div>
                
                <div style="text-align: center; font-weight: bold; margin: 8px 0; font-size: 12px; padding-bottom: 6px; border-bottom: 1px solid #000;">
                    ${ticketData.products.length} ITEMS (${itemCount} pcs)
                </div>
                
                ${productsHTML}
                
                <div style="border-top: 1px dashed #ccc; margin: 12px 0; padding-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin: 6px 0;">
                        <span>Sub-total:</span>
                        <span>$${ticketData.subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 6px 0;">
                        <span>Tax ${TAX_RATE}%:</span>
                        <span>$${ticketData.tax.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="border-top: 2px solid #000; margin-top: 15px; padding-top: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                    <span>TOTAL:</span>
                    <span>$${ticketData.total.toFixed(2)}</span>
                </div>
                
                <div style="text-align: center; margin-top: 18px; padding-top: 12px; border-top: 1px dashed #000; font-size: 11px; line-height: 1.4;">
                    <div>Thank you for your purchase!</div>
                    <div style="margin-top: 5px; font-size: 10px;">Chicho's Anime Store</div>
                </div>
            </div>
        `;
    } else {
        // Single product
        return `
            <div style="width: 58mm; padding: 12px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.35; background: white;">
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 12px;">
                    <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">CHICHO'S ANIME STORE</div>
                    <div style="font-size: 12px; margin-bottom: 3px;">SALES RECEIPT</div>
                    <div style="font-size: 10px;">${ticketData.dateTime}</div>
                </div>
                
                <!-- TRANSACCIÓN PRIMERO -->
                <div style="display: flex; justify-content: space-between; margin: 8px 0; font-weight: bold; font-size: 12px;">
                    <span>Trans#:</span>
                    <span>${ticketData.trans}</span>
                </div>
                
                <!-- DESCRIPCIÓN DESPUÉS (con un poquito más de espacio) -->
                <div style="text-align: center; font-weight: bold; margin: 8px 0; font-size: 12px; padding: 6px 0; border: 1px solid #ccc; background: #f9f9f9;">
                    ${ticketData.description}
                </div>
                
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; margin: 6px 0; padding: 4px 0; border-bottom: 1px dotted #eee;">
                        <span>MCC:</span>
                        <span>${ticketData.mcc}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 6px 0; padding: 4px 0; border-bottom: 1px dotted #eee;">
                        <span>Item#:</span>
                        <span>${ticketData.itemNumber}</span>
                    </div>
                </div>
                
                <div style="border-top: 1px dashed #ccc; margin: 12px 0; padding-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin: 6px 0;">
                        <span>Sub-total:</span>
                        <span>$${ticketData.subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 6px 0;">
                        <span>Tax ${TAX_RATE}%:</span>
                        <span>$${ticketData.tax.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="border-top: 2px solid #000; margin-top: 15px; padding-top: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                    <span>TOTAL:</span>
                    <span>$${ticketData.total.toFixed(2)}</span>
                </div>
                
                <div style="text-align: center; margin-top: 18px; padding-top: 12px; border-top: 1px dashed #000; font-size: 11px; line-height: 1.4;">
                    <div>Thank you for your purchase!</div>
                    <div style="margin-top: 5px; font-size: 10px;">Chicho's Anime Store</div>
                </div>
            </div>
        `;
    }
}

// Create ticket HTML for preview (usa CSS normal)
function createTicketHTML(ticketData, isMulti = false) {
    if (isMulti) {
        let productsHTML = '';
        let itemCount = 0;
        
        ticketData.products.forEach((product, index) => {
            itemCount += product.quantity;
            const shortDesc = product.description.length > 20 
                ? product.description.substring(0, 18) + '..' 
                : product.description;
                
            productsHTML += `
                <div class="product-line">
                    <span>${index + 1}. ${shortDesc}</span>
                    <span>${product.quantity}×$${product.price.toFixed(2)}</span>
                </div>
                <div class="product-subtotal">$${product.subtotal.toFixed(2)}</div>
            `;
        });
        
        return `
            <div class="ticket">
                <div class="ticket-header">
                    <div class="business-name">CHICHO'S ANIME STORE</div>
                    <div style="font-size: 12px; margin: 3px 0;">SALES RECEIPT</div>
                    <div style="font-size: 10px;">${ticketData.dateTime}</div>
                </div>
                
                <div class="separator-line"></div>
                
                <div style="text-align: center; font-weight: bold; font-size: 12px; margin: 5px 0;">
                    ${ticketData.products.length} ITEMS (${itemCount} pcs)
                </div>
                
                ${productsHTML}
                
                <div class="separator-line"></div>
                
                <div class="ticket-row">
                    <span>Transaction:</span>
                    <span>${ticketData.trans}</span>
                </div>
                
                <div class="ticket-row">
                    <span>Sub-total:</span>
                    <span>$${ticketData.subtotal.toFixed(2)}</span>
                </div>
                
                <div class="ticket-row">
                    <span>Tax ${TAX_RATE}%:</span>
                    <span>$${ticketData.tax.toFixed(2)}</span>
                </div>
                
                <div class="ticket-total">
                    <span>TOTAL:</span>
                    <span>$${ticketData.total.toFixed(2)}</span>
                </div>
                
                <div class="separator-line"></div>
                
                <div class="ticket-footer">
                    <div>Thank you for your purchase!</div>
                    <div style="font-size: 10px; margin-top: 3px;">Chicho's Anime Store</div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="ticket">
                <div class="ticket-header">
                    <div class="business-name">CHICHO'S ANIME STORE</div>
                    <div style="font-size: 12px; margin: 3px 0;">SALES RECEIPT</div>
                    <div style="font-size: 10px;">${ticketData.dateTime}</div>
                </div>
                
                <div class="separator-line"></div>
                
                <div style="text-align: center; font-weight: bold; font-size: 12px; margin: 5px 0;">
                    ${ticketData.description}
                </div>
                
                <div class="separator-line"></div>
                
                <div class="ticket-row">
                    <span>Transaction:</span>
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
                
                <div class="separator-line"></div>
                
                <div class="ticket-row">
                    <span>Sub-total:</span>
                    <span>$${ticketData.subtotal.toFixed(2)}</span>
                </div>
                
                <div class="ticket-row">
                    <span>Tax ${TAX_RATE}%:</span>
                    <span>$${ticketData.tax.toFixed(2)}</span>
                </div>
                
                <div class="ticket-total">
                    <span>TOTAL:</span>
                    <span>$${ticketData.total.toFixed(2)}</span>
                </div>
                
                <div class="separator-line"></div>
                
                <div class="ticket-footer">
                    <div>Thank you for your purchase!</div>
                    <div style="font-size: 10px; margin-top: 3px;">Chicho's Anime Store</div>
                </div>
            </div>
        `;
    }
}

// Generate ticket data
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

function generateMultiTicketData() {
    const { products, totalSubtotal } = collectMultiProductData();
    const trans = generateTransactionNumber();
    const calculations = calculateTaxAndTotal(totalSubtotal);
    const dateTime = getCurrentDateTime();
    
    return {
        trans,
        products,
        subtotal: totalSubtotal,
        tax: calculations.tax,
        total: calculations.total,
        dateTime
    };
}

// Display ticket preview
function displayTicketPreview(ticketData, isMulti = false) {
    ticketPreview.innerHTML = createTicketHTML(ticketData, isMulti);
}

// Generate ticket image - VERSIÓN SIMPLE Y FUNCIONAL
async function generateTicketImage(ticketData, isMulti = false) {
    try {
        showStatus('Generating ticket image...', 'info');
        
        // Crear elemento temporal con ESTILOS EN LÍNEA (para html2canvas)
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 58mm;
            background: white;
        `;
        
        // Usar HTML con estilos en línea (html2canvas los maneja mejor)
        tempDiv.innerHTML = createTicketImageHTML(ticketData, isMulti);
        document.body.appendChild(tempDiv);
        
        // Esperar un momento
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Capturar con html2canvas - CONFIGURACIÓN SIMPLE
        const canvas = await html2canvas(tempDiv.firstElementChild, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            removeContainer: true
        });
        
        // Limpiar
        document.body.removeChild(tempDiv);
        
        return canvas.toDataURL('image/png');
        
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

// Show print options modal
function showPrintModal(imageUrl, transNumber) {
    // Crear modal simple
    const modalHTML = `
        <div id="printOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9998;"></div>
        <div id="printModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; z-index: 9999; width: 90%; max-width: 400px; text-align: center;">
            <h3 style="margin-bottom: 15px;">Print Ticket #${transNumber}</h3>
            <img src="${imageUrl}" style="max-width: 100%; max-height: 200px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px;">
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="downloadBtn" style="padding: 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">📥 Download Image</button>
                <button id="shareBtn" style="padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">📤 Share to Print</button>
                <button id="closeModalBtn" style="padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">✕ Cancel</button>
            </div>
        </div>
    `;
    
    // Agregar al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event listeners
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ticket_${transNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        closePrintModal();
        showStatus('Image downloaded!', 'success');
    });
    
    document.getElementById('shareBtn').addEventListener('click', async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `ticket_${transNumber}.png`, { type: 'image/png' });
            
            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: `Ticket ${transNumber}`,
                    text: 'Ticket from Chicho\'s Anime Store'
                });
            } else {
                // Fallback
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `ticket_${transNumber}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showStatus('Downloaded. Share from gallery.', 'success');
            }
        } catch (error) {
            console.error('Share error:', error);
            showStatus('Error sharing', 'error');
        }
        closePrintModal();
    });
    
    document.getElementById('closeModalBtn').addEventListener('click', closePrintModal);
    document.getElementById('printOverlay').addEventListener('click', closePrintModal);
}

function closePrintModal() {
    const overlay = document.getElementById('printOverlay');
    const modal = document.getElementById('printModal');
    if (overlay) overlay.remove();
    if (modal) modal.remove();
}

// Generate and show ticket
async function generateAndShowTicket(ticketData, isMulti = false) {
    try {
        showStatus('Generating ticket...', 'info');
        
        // Mostrar preview
        displayTicketPreview(ticketData, isMulti);
        
        // Generar imagen
        const imageUrl = await generateTicketImage(ticketData, isMulti);
        
        // Mostrar modal
        showPrintModal(imageUrl, ticketData.trans);
        
        showStatus('Ticket ready!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error: ' + error.message, 'error');
        
        // Fallback simple
        setTimeout(() => {
            if (confirm('Error generating image. Try simple print?')) {
                simplePrint(ticketData, isMulti);
            }
        }, 1000);
    }
}

// Simple print fallback
function simplePrint(ticketData, isMulti) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showStatus('Popup blocked. Please allow popups.', 'error');
        return;
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket ${ticketData.trans}</title>
            <style>
                @media print {
                    @page { margin: 0; size: 58mm auto; }
                    body { margin: 0; padding: 0; }
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    padding: 8px;
                    width: 58mm;
                    margin: 0 auto;
                }
                .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 8px; }
                .business { font-size: 13px; font-weight: bold; margin-bottom: 3px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 8px; font-weight: bold; }
                .footer { text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #000; font-size: 10px; }
            </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 1000);">
            <div class="header">
                <div class="business">CHICHO'S ANIME STORE</div>
                SALES RECEIPT<br>
                <small>${ticketData.dateTime}</small>
            </div>
            ${isMulti ? generateMultiSimpleContent(ticketData) : generateSingleSimpleContent(ticketData)}
            <div class="footer">
                Thank you for your purchase!<br>
                <small>Chicho's Anime Store</small>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function generateSingleSimpleContent(ticketData) {
    return `
        <div style="text-align: center; font-weight: bold; margin: 5px 0;">${ticketData.description}</div>
        <div class="row"><span>Transaction:</span><span>${ticketData.trans}</span></div>
        <div class="row"><span>MCC:</span><span>${ticketData.mcc}</span></div>
        <div class="row"><span>Item#:</span><span>${ticketData.itemNumber}</span></div>
        <div class="row"><span>Sub-total:</span><span>$${ticketData.subtotal.toFixed(2)}</span></div>
        <div class="row"><span>Tax ${TAX_RATE}%:</span><span>$${ticketData.tax.toFixed(2)}</span></div>
        <div class="row total"><span>TOTAL:</span><span>$${ticketData.total.toFixed(2)}</span></div>
    `;
}

function generateMultiSimpleContent(ticketData) {
    let products = '';
    let itemCount = 0;
    
    ticketData.products.forEach((p, i) => {
        itemCount += p.quantity;
        products += `
            <div class="row">
                <span>${i+1}. ${p.description.substring(0, 18)}${p.description.length > 18 ? '..' : ''}</span>
                <span>${p.quantity}×$${p.price.toFixed(2)}</span>
            </div>
            <div class="row" style="justify-content: flex-end;">
                <span>$${p.subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    return `
        <div style="text-align: center; font-weight: bold; margin: 5px 0;">
            ${ticketData.products.length} ITEMS (${itemCount} pcs)
        </div>
        ${products}
        <div class="row"><span>Transaction:</span><span>${ticketData.trans}</span></div>
        <div class="row"><span>Sub-total:</span><span>$${ticketData.subtotal.toFixed(2)}</span></div>
        <div class="row"><span>Tax:</span><span>$${ticketData.tax.toFixed(2)}</span></div>
        <div class="row total"><span>TOTAL:</span><span>$${ticketData.total.toFixed(2)}</span></div>
    `;
}

// Show status
function showStatus(message, type = 'info') {
    printStatus.textContent = message;
    printStatus.className = `print-status ${type}`;
    printStatus.style.display = 'block';
    
    if (type !== 'info') {
        setTimeout(() => {
            printStatus.style.display = 'none';
        }, 4000);
    }
}

// Mode switching
singleProductBtn.addEventListener('click', function() {
    currentMode = 'single';
    singleProductBtn.classList.add('active');
    multiProductBtn.classList.remove('active');
    ticketForm.classList.remove('hidden-form');
    ticketForm.classList.add('active-form');
    multiProductForm.classList.remove('active-form');
    multiProductForm.classList.add('hidden-form');
    updateLivePreview();
    saveDataToLocalStorage();
});

multiProductBtn.addEventListener('click', function() {
    currentMode = 'multi';
    multiProductBtn.classList.add('active');
    singleProductBtn.classList.remove('active');
    multiProductForm.classList.remove('hidden-form');
    multiProductForm.classList.add('active-form');
    ticketForm.classList.remove('active-form');
    ticketForm.classList.add('hidden-form');
    updateLivePreview();
    saveDataToLocalStorage();
});

// Add product button
addProductBtn.addEventListener('click', function() {
    const productCount = document.querySelectorAll('.product-item').length;
    const newProductHTML = createProductItem(productCount);
    productsContainer.insertAdjacentHTML('beforeend', newProductHTML);
    
    const newItem = productsContainer.lastElementChild;
    const inputs = newItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateLivePreview();
            saveDataToLocalStorage();
        });
    });
    
    updateLivePreview();
    saveDataToLocalStorage();
});

// Form submissions
ticketForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateSingleForm()) return;
    
    const ticketData = generateTicketData();
    await generateAndShowTicket(ticketData, false);
});

generateMultiBtn.addEventListener('click', async function() {
    const { products, totalSubtotal } = collectMultiProductData();
    
    if (products.length === 0) {
        alert('Please add at least one valid product');
        return;
    }
    
    if (totalSubtotal <= 0) {
        alert('Total subtotal must be greater than 0');
        return;
    }
    
    const ticketData = generateMultiTicketData();
    await generateAndShowTicket(ticketData, true);
});

printPreviewBtn.addEventListener('click', function() {
    if (currentMode === 'single') {
        if (!validateSingleForm()) return;
        const ticketData = generateTicketData();
        displayTicketPreview(ticketData, false);
    }
});

printMultiBtn.addEventListener('click', function() {
    const { products, totalSubtotal } = collectMultiProductData();
    
    if (products.length === 0) {
        alert('Please add at least one valid product');
        return;
    }
    
    if (totalSubtotal <= 0) {
        alert('Total subtotal must be greater than 0');
        return;
    }
    
    const ticketData = generateMultiTicketData();
    displayTicketPreview(ticketData, true);
});

// Reset buttons
resetBtn.addEventListener('click', function() {
    if (confirm('Reset all form fields?')) {
        ticketForm.reset();
        ticketPreview.innerHTML = '<p class="preview-placeholder">Enter data to see ticket preview</p>';
        descriptionInput.focus();
        printStatus.style.display = 'none';
        saveDataToLocalStorage();
    }
});

resetMultiBtn.addEventListener('click', function() {
    if (confirm('Reset all products?')) {
        productsContainer.innerHTML = createProductItem(0);
        ticketPreview.innerHTML = '<p class="preview-placeholder">Enter data to see ticket preview</p>';
        printStatus.style.display = 'none';
        
        const inputs = document.querySelectorAll('.product-item input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                updateLivePreview();
                saveDataToLocalStorage();
            });
        });
        
        saveDataToLocalStorage();
    }
});

// Validation
function validateSingleForm() {
    const subtotal = parseFloat(subtotalInput.value);
    if (subtotal <= 0 || isNaN(subtotal)) {
        alert('Please enter a valid subtotal greater than 0');
        return false;
    }
    
    if (!descriptionInput.value.trim()) {
        alert('Please enter a description');
        descriptionInput.focus();
        return false;
    }
    
    if (!mccInput.value.trim()) {
        alert('Please enter MCC');
        mccInput.focus();
        return false;
    }
    
    if (!itemNumberInput.value.trim()) {
        alert('Please enter Item#');
        itemNumberInput.focus();
        return false;
    }
    
    return true;
}

// Real-time preview update
function updateLivePreview() {
    if (currentMode === 'single') {
        const subtotal = parseFloat(subtotalInput.value);
        
        if (!subtotal || subtotal <= 0 || isNaN(subtotal) ||
            !descriptionInput.value.trim() ||
            !mccInput.value.trim() ||
            !itemNumberInput.value.trim()) {
            return;
        }
        
        const ticketData = generateTicketData();
        displayTicketPreview(ticketData, false);
    } else {
        const { products, totalSubtotal } = collectMultiProductData();
        
        if (products.length === 0 || totalSubtotal <= 0) {
            return;
        }
        
        const ticketData = generateMultiTicketData();
        displayTicketPreview(ticketData, true);
    }
}

// LocalStorage
function saveDataToLocalStorage() {
    if (currentMode === 'single') {
        const data = {
            description: descriptionInput.value,
            mcc: mccInput.value,
            itemNumber: itemNumberInput.value,
            subtotal: subtotalInput.value,
            mode: 'single'
        };
        localStorage.setItem('ticketData', JSON.stringify(data));
    } else {
        const products = [];
        document.querySelectorAll('.product-item').forEach(item => {
            products.push({
                desc: item.querySelector('.multi-desc').value,
                mcc: item.querySelector('.multi-mcc').value,
                itemNum: item.querySelector('.multi-item').value,
                price: item.querySelector('.multi-price').value,
                qty: item.querySelector('.multi-qty').value
            });
        });
        
        const data = {
            products: products,
            mode: 'multi'
        };
        localStorage.setItem('ticketData', JSON.stringify(data));
    }
}

function loadSavedData() {
    const savedData = localStorage.getItem('ticketData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        if (data.mode === 'single') {
            singleProductBtn.click();
            descriptionInput.value = data.description || '';
            mccInput.value = data.mcc || '';
            itemNumberInput.value = data.itemNumber || '';
            subtotalInput.value = data.subtotal || '';
            updateLivePreview();
        } else if (data.mode === 'multi' && data.products) {
            multiProductBtn.click();
            productsContainer.innerHTML = '';
            
            data.products.forEach((product, index) => {
                if (index === 0) {
                    productsContainer.innerHTML = createProductItem(0);
                    const firstItem = productsContainer.querySelector('.product-item');
                    firstItem.querySelector('.multi-desc').value = product.desc || '';
                    firstItem.querySelector('.multi-mcc').value = product.mcc || '';
                    firstItem.querySelector('.multi-item').value = product.itemNum || '';
                    firstItem.querySelector('.multi-price').value = product.price || '';
                    firstItem.querySelector('.multi-qty').value = product.qty || 1;
                } else {
                    const newProductHTML = createProductItem(index);
                    productsContainer.insertAdjacentHTML('beforeend', newProductHTML);
                    const newItem = productsContainer.lastElementChild;
                    newItem.querySelector('.multi-desc').value = product.desc || '';
                    newItem.querySelector('.multi-mcc').value = product.mcc || '';
                    newItem.querySelector('.multi-item').value = product.itemNum || '';
                    newItem.querySelector('.multi-price').value = product.price || '';
                    newItem.querySelector('.multi-qty').value = product.qty || 1;
                }
            });
            
            document.querySelectorAll('.product-item input').forEach(input => {
                input.addEventListener('input', () => {
                    updateLivePreview();
                    saveDataToLocalStorage();
                });
            });
            
            updateLivePreview();
        }
    }
}

// Initialize app
function initApp() {
    // Focus first field
    descriptionInput.focus();
    
    // Event listeners para inputs
    const singleInputs = [descriptionInput, mccInput, itemNumberInput, subtotalInput];
    singleInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateLivePreview();
            saveDataToLocalStorage();
        });
    });
    
    document.querySelectorAll('.product-item input').forEach(input => {
        input.addEventListener('input', () => {
            updateLivePreview();
            saveDataToLocalStorage();
        });
    });
    
    // Load saved data
    loadSavedData();
    
    // Auto-save
    window.addEventListener('beforeunload', saveDataToLocalStorage);
    
    console.log('✅ Ticket System Ready');
}

// Start app
document.addEventListener('DOMContentLoaded', initApp);