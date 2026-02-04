// ticket-system.js - TODO el sistema de tickets
const TAX_RATE = 8.25;
let currentMode = 'single';
let currentTicketImage = '';

// Funciones básicas
function generateTransactionNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getCurrentDateTime() {
    const customDate = document.getElementById('customDate').value.trim();
    const customTime = document.getElementById('customTime').value.trim();
    
    // Si el usuario ingresó fecha y hora
    if (customDate && customTime) {
        return `${customDate} ${customTime}`;
    }
    
    // Si solo ingresó fecha
    if (customDate) {
        const now = new Date();
        const time = now.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return `${customDate} ${time}`;
    }
    
    // Si solo ingresó hora
    if (customTime) {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        return `${date} ${customTime}`;
    }
    
    // Si no ingresó nada, usar fecha/hora actual
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

// Modo simple/múltiple
document.getElementById('singleProductBtn').onclick = function() {
    currentMode = 'single';
    document.getElementById('singleProductBtn').classList.add('active');
    document.getElementById('multiProductBtn').classList.remove('active');
    document.getElementById('ticketForm').classList.remove('hidden-form');
    document.getElementById('ticketForm').classList.add('active-form');
    document.getElementById('multiProductForm').classList.remove('active-form');
    document.getElementById('multiProductForm').classList.add('hidden-form');
};

document.getElementById('multiProductBtn').onclick = function() {
    currentMode = 'multi';
    document.getElementById('multiProductBtn').classList.add('active');
    document.getElementById('singleProductBtn').classList.remove('active');
    document.getElementById('multiProductForm').classList.remove('hidden-form');
    document.getElementById('multiProductForm').classList.add('active-form');
    document.getElementById('ticketForm').classList.remove('active-form');
    document.getElementById('ticketForm').classList.add('hidden-form');
    if (document.querySelectorAll('.product-item').length === 0) {
        addProductItem();
    }
};

// Productos múltiples
function addProductItem() {
    const container = document.getElementById('productsContainer');
    const index = document.querySelectorAll('.product-item').length;
    
    const productHTML = `
        <div class="product-item" data-index="${index}">
            <div class="product-header">
                <h3>Product ${index + 1}</h3>
                <button type="button" class="remove-product" onclick="removeProduct(${index})">×</button>
            </div>
            <div class="product-row">
                <div class="form-group">
                    <label>Description:</label>
                    <input type="text" class="multi-desc" placeholder="Item description" maxlength="22" required>
                    <small style="color: #666; font-size: 0.8rem; display: block; margin-top: 3px;">Max 22 chars</small>
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
    
    container.insertAdjacentHTML('beforeend', productHTML);
}

window.removeProduct = function(index) {
    const items = document.querySelectorAll('.product-item');
    if (items.length > 1) {
        items.forEach(item => {
            if (parseInt(item.dataset.index) === index) {
                item.remove();
            }
        });
        // Reindexar
        document.querySelectorAll('.product-item').forEach((item, idx) => {
            item.dataset.index = idx;
            item.querySelector('h3').textContent = `Product ${idx + 1}`;
        });
    } else {
        alert('Need at least one product');
    }
};

// Botones
document.getElementById('addProductBtn').onclick = addProductItem;

document.getElementById('generateTicketBtn').onclick = async function() {
    if (!validateForm()) return;
    
    const ticketData = generateSingleData();
    await generateTicketImage(ticketData);
};

document.getElementById('generateMultiBtn').onclick = async function() {
    if (!validateMultiForm()) return;
    
    const ticketData = generateMultiData();
    if (!ticketData) return;
    
    await generateTicketImage(ticketData, true);
};

document.getElementById('resetBtn').onclick = function() {
    if (confirm('Reset form?')) {
        document.getElementById('description').value = '';
        document.getElementById('mcc').value = '';
        document.getElementById('itemNumber').value = '';
        document.getElementById('subtotal').value = '';
        document.getElementById('ticketPreview').innerHTML = 
            '<p class="preview-placeholder">Ticket image will appear here</p>';
        document.getElementById('description').focus();
    }
};

document.getElementById('resetMultiBtn').onclick = function() {
    if (confirm('Reset all products?')) {
        document.getElementById('productsContainer').innerHTML = '';
        addProductItem();
        document.getElementById('ticketPreview').innerHTML = 
            '<p class="preview-placeholder">Ticket image will appear here</p>';
    }
};

// Validación
function validateForm() {
    const description = document.getElementById('description').value.trim();
    const mcc = document.getElementById('mcc').value.trim();
    const itemNumber = document.getElementById('itemNumber').value.trim();
    const subtotal = parseFloat(document.getElementById('subtotal').value);
    
    if (!description || !mcc || !itemNumber || !subtotal || subtotal <= 0) {
        alert('Please fill all fields correctly');
        return false;
    }
    return true;
}

function validateMultiForm() {
    const products = document.querySelectorAll('.product-item');
    if (products.length === 0) {
        alert('Add at least one product');
        return false;
    }
    
    let hasErrors = false;
    products.forEach(product => {
        const desc = product.querySelector('.multi-desc').value.trim();
        const mcc = product.querySelector('.multi-mcc').value.trim();
        const itemNum = product.querySelector('.multi-item').value.trim();
        const price = parseFloat(product.querySelector('.multi-price').value);
        
        if (!desc || !mcc || !itemNum || !price || price <= 0) {
            hasErrors = true;
        }
    });
    
    if (hasErrors) {
        alert('Please fill all product fields correctly');
        return false;
    }
    return true;
}

// Generar datos
function generateSingleData() {
    const subtotal = parseFloat(document.getElementById('subtotal').value);
    const tax = (subtotal * TAX_RATE) / 100;
    const total = subtotal + tax;
    
    return {
        trans: generateTransactionNumber(),
        description: document.getElementById('description').value.trim(),
        mcc: document.getElementById('mcc').value.trim(),
        itemNumber: document.getElementById('itemNumber').value.trim(),
        subtotal: subtotal,
        tax: tax,
        total: total,
        dateTime: getCurrentDateTime()
    };
}

function generateMultiData() {
    const products = [];
    let totalSubtotal = 0;
    
    document.querySelectorAll('.product-item').forEach(product => {
        const desc = product.querySelector('.multi-desc').value.trim();
        const mcc = product.querySelector('.multi-mcc').value.trim();
        const itemNum = product.querySelector('.multi-item').value.trim();
        const price = parseFloat(product.querySelector('.multi-price').value) || 0;
        const qty = parseInt(product.querySelector('.multi-qty').value) || 1;
        const subtotal = price * qty;
        
        products.push({
            description: desc,
            mcc: mcc,
            itemNumber: itemNum,
            price: price,
            quantity: qty,
            subtotal: subtotal
        });
        totalSubtotal += subtotal;
    });
    
    if (products.length === 0 || totalSubtotal <= 0) {
        alert('Invalid product data');
        return null;
    }
    
    const tax = (totalSubtotal * TAX_RATE) / 100;
    const total = totalSubtotal + tax;
    
    return {
        trans: generateTransactionNumber(),
        products: products,
        subtotal: totalSubtotal,
        tax: tax,
        total: total,
        dateTime: getCurrentDateTime()
    };
}

// Generar imagen del ticket
async function generateTicketImage(ticketData, isMulti = false) {
    try {
        const ticketHTML = createTicketHTML(ticketData, isMulti);
        
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 58mm;
            background: white;
            padding: 12px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.35;
        `;
        tempDiv.innerHTML = ticketHTML;
        document.body.appendChild(tempDiv);
        
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        });
        
        document.body.removeChild(tempDiv);
        
        currentTicketImage = canvas.toDataURL('image/png');
        
        document.getElementById('ticketPreview').innerHTML = 
            `<img src="${currentTicketImage}" style="max-width: 100%; border: 1px solid #ddd;">`;
        
        showPrintModal();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating ticket image');
    }
}

// HTML del ticket (58mm)
function createTicketHTML(ticketData, isMulti = false) {
    if (isMulti) {
        let productsHTML = '';
        let itemCount = 0;
        
        ticketData.products.forEach((product, index) => {
            itemCount += product.quantity;
            const shortDesc = product.description.length > 23 
                ? product.description.substring(0, 22) + '..' 
                : product.description;
                
            productsHTML += `
                <div style="display: flex; justify-content: space-between; margin: 6px 0; font-size: 11px;">
                    <span style="flex: 2;">${index + 1}. ${shortDesc}</span>
                    <span style="flex: 1; text-align: right;">${product.quantity} × $${product.price.toFixed(2)}</span>
                </div>
                <div style="text-align: right; margin: 0 0 8px 0; font-size: 11px; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
                    $${product.subtotal.toFixed(2)}
                </div>
            `;
        });
        
        return `
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">CHICHO'S ANIME STORE</div>
        <div style="font-size: 10px; margin-bottom: 2px;">5660 N Mesa</div>
        <div style="font-size: 10px; margin-bottom: 3px;">El Paso, TX</div>
        <div style="font-size: 12px; margin-bottom: 3px;">SALES RECEIPT</div>
        <div style="font-size: 10px;">${ticketData.dateTime}</div>
        </div>
            
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
        `;
    } else {
        return `
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">CHICHO'S ANIME STORE</div>
        <div style="font-size: 10px; margin-bottom: 2px;">5660 N Mesa</div>
        <div style="font-size: 10px; margin-bottom: 3px;">El Paso, TX</div>
        <div style="font-size: 12px; margin-bottom: 3px;">SALES RECEIPT</div>
        <div style="font-size: 10px;">${ticketData.dateTime}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-weight: bold; font-size: 12px;">
                <span>Trans#:</span>
                <span>${ticketData.trans}</span>
            </div>
            
            <div style="text-align: center; font-weight: bold; margin: 8px 0; font-size: 12px; padding: 6px 0; border: 1px solid #ccc; background: #f9f9f9;">
            ${ticketData.description.substring(0, 22)}
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
        `;
    }
}

// Modal de impresión
function showPrintModal() {
    document.getElementById('ticketImage').src = currentTicketImage;
    document.getElementById('printModal').style.display = 'flex';
}

document.getElementById('printImageBtn').onclick = function() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Ticket</title>
            <style>
                @media print {
                    @page { margin: 0; size: 58mm auto; }
                    body { margin: 0; padding: 0; }
                }
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                img {
                    width: 58mm;
                    height: auto;
                }
            </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 1000);">
            <img src="${currentTicketImage}" alt="Ticket">
        </body>
        </html>
    `);
    printWindow.document.close();
};

document.getElementById('downloadImageBtn').onclick = function() {
    const link = document.createElement('a');
    link.href = currentTicketImage;
    link.download = `ticket_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

document.getElementById('closeModalBtn').onclick = function() {
    document.getElementById('printModal').style.display = 'none';
};

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Ticket System Ready');
    document.getElementById('description').focus();
});