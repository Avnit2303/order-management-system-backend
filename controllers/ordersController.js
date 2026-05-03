const Order = require('../models/Order');
const ExcelJS = require('exceljs');

// POST /api/submit — public
const submitOrder = async (req, res, next) => {
  try {
    const { name, choice, price, quantity, total } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Name is required.');
    }
    if (!choice || typeof choice !== 'string' || !choice.trim()) {
      errors.push('Choice is required.');
    }
    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      errors.push('Price must be a valid positive number.');
    }
    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      errors.push('Quantity must be at least 1.');
    }
    if (total === undefined || total === null || typeof total !== 'number' || total < 0) {
      errors.push('Total must be a valid number.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    await Order.create({
      name: name.trim(),
      choice: choice.trim(),
      price,
      quantity,
      total
    });

    res.status(201).json({ success: true, message: 'Order submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders — protected
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/download — protected
const downloadExcel = async (req, res, next) => {
  try {
    const { range } = req.query;
    let query = {};
    const now = new Date();
    
    if (range === 'last_week') {
      const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      query.createdAt = { $gte: lastWeek };
    } else if (range === 'current_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: firstDay };
    } else if (range === 'last_month') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      query.createdAt = { $gte: firstDayLastMonth, $lte: lastDayLastMonth };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Choice', key: 'choice', width: 20 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Total', key: 'total', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A90D9' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    let grandTotal = 0;

    // Add data rows
    orders.forEach(order => {
      worksheet.addRow({
        name: order.name,
        choice: order.choice,
        date: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
        quantity: order.quantity,
        price: order.price,
        total: order.total
      });
      grandTotal += order.total;
    });

    // Add grand total row
    const totalRow = worksheet.addRow({
      name: 'Grand Total',
      choice: '',
      date: '',
      quantity: '',
      price: '',
      total: grandTotal
    });
    totalRow.font = { bold: true, size: 12 };

    // Generate Excel as buffer (works in serverless)
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=orders.xlsx'
    );

    // Send buffer directly
    res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
};

module.exports = { submitOrder, getAllOrders, downloadExcel };
