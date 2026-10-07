export const CATEGORIES = {
  Passenger: ['39', '42', '46', '48'],
  Loader: ['Rajans', 'Shobha', 'MiniMeter'],
};
export const ALL_MODELS = Object.entries(CATEGORIES).flatMap(([cat, models]) => models.map(m => ({ cat, model: m })));
export const STATUSES = ['In Stock', 'Sent to Distributor', 'Sold', 'Warranty Expired'];
export const STATUS_COLORS = {
  'In Stock': '#33D69F',
  'Sent to Distributor': '#4FA8FF',
  'Sold': '#FFB020',
  'Warranty Expired': '#FF5C5C',
};
export const LOW_STOCK_THRESHOLD = 4;
export const BATTERY_WARRANTY_MONTHS = 24;
export const CHARGER_WARRANTY_MONTHS = 12;
export const STORAGE_KEY = 'vdms_core_db_v1';
export const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];
export const ANNOUNCEMENT_TYPES = ['New Update', 'Upcoming Product'];
export const SMS_TYPES = ['Delivery Confirmation', 'Payment Reminder'];

export const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
