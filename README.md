# Sistema de Tickets - Chicho's

Sistema web local para generación de tickets para el negocio de Adan Garcia - Chicho's.

## Características
- Captura de 4 datos: MCC, Item#, Sub-total, Fecha/Hora
- Generación automática de número de transacción (6 dígitos aleatorios)
- Cálculo automático de tax (8.25% fijo)
- Almacenamiento local en LocalStorage
- Impresión optimizada para Portable Printer MP210
- Historial de tickets
- Vista previa en tiempo real

## Archivos del Proyecto
- `index.html` - Estructura principal
- `style.css` - Estilos profesionales
- `script.js` - Lógica de la aplicación
- `Logo.jpeg` - Logo del negocio
- `README.md` - Este archivo

## Uso
1. Abrir `index.html` en cualquier navegador moderno
2. Ingresar los datos requeridos:
   - MCC (ej: 6643E901)
   - Item# (ej: 654182)
   - Sub-total (ej: 149.99)
   - Fecha y Hora (se autocompleta con la actual)
3. Click en "Generar Ticket"
4. Usar "Imprimir Último" para imprimir en la MP210
5. "Limpiar Historial" para borrar todos los tickets guardados

## Configuración Impresora
- Marca: Portable Printer
- Modelo: MP210
- El sistema genera tickets optimizados para 80mm de ancho

## Almacenamiento
Los tickets se guardan automáticamente en el LocalStorage del navegador.
Máximo 50 tickets guardados (los más antiguos se eliminan automáticamente).

## Notas Técnicas
- Desarrollado con HTML5, CSS3 y JavaScript puro
- No requiere conexión a internet
- Compatible con Chrome, Firefox, Edge
- Responsive design