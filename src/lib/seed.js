import { ALL_MODELS, BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS } from './constants';
import { uid, genVehicleId, genInvoice, addMonths, todayStr } from './helpers';

export function seedDB() {
  const distributors = [
    { id: 'DIST-1001', shopName: 'Sunrise EV Motors', ownerName: 'Rakesh Sharma', mobile: '9876500001', address: 'MG Road, Pune', gst: '27ABCDE1234F1Z5', email: 'rakesh@sunriseev.in', username: 'sunrise', password: 'sunrise123', status: 'active' },
    { id: 'DIST-1002', shopName: 'GreenWheel Distributors', ownerName: 'Anita Desai', mobile: '9876500002', address: 'Ring Road, Nagpur', gst: '27FGHIJ5678K1Z2', email: 'anita@greenwheel.in', username: 'greenwheel', password: 'green123', status: 'active' },
    { id: 'DIST-1003', shopName: 'Volt Vahan Hub', ownerName: 'Suresh Iyer', mobile: '9876500003', address: 'Anna Salai, Chennai', gst: '33KLMNO9012P1Z8', email: 'suresh@voltvahan.in', username: 'voltvahan', password: 'volt123', status: 'active' },
    { id: 'DIST-1004', shopName: 'Eastern Electro Sales', ownerName: 'Priya Bose', mobile: '9876500004', address: 'Park Street, Kolkata', gst: '19PQRST3456U1Z4', email: 'priya@easternelectro.in', username: 'eastern', password: 'east123', status: 'active' },
    { id: 'DIST-1005', shopName: 'North Star Vehicles', ownerName: 'Gurpreet Singh', mobile: '9876500005', address: 'Model Town, Ludhiana', gst: '03UVWXY7890Z1Z1', email: 'gurpreet@northstar.in', username: 'northstar', password: 'north123', status: 'suspended' },
  ];

  const vehicles = [];
  const sales = [];
  const transactions = [];
  const auditLog = [];
  let seq = 1;

  const pushAudit = (user, action) => auditLog.push({ id: uid('LOG'), timestamp: new Date().toISOString(), user, action });

  // 24 In Stock vehicles at admin warehouse
  for (let i = 0; i < 24; i++) {
    const { cat, model } = ALL_MODELS[i % ALL_MODELS.length];
    const mfg = new Date(2025, i % 12, 5 + (i % 20)).toISOString().slice(0, 10);
    vehicles.push({
      id: genVehicleId(seq++), category: cat, model, chassisNumber: `CH${uid('X')}`,
      motorNumber: `MT${uid('X')}`, batterySerial: `BT${uid('X')}`, chargerSerial: `CG${uid('X')}`,
      manufacturingDate: mfg, purchaseDate: mfg, status: 'In Stock', distributorId: null,
    });
  }
  // deliberately keep model "MiniMeter" low stock for alert demo
  vehicles.filter(v => v.model === 'MiniMeter').slice(2).forEach(v => { v.status = 'Sent to Distributor'; v.distributorId = 'DIST-1002'; });

  // 16 vehicles Sent to Distributor across active distributors
  const activeDistIds = distributors.filter(d => d.status === 'active').map(d => d.id);
  for (let i = 0; i < 16; i++) {
    const { cat, model } = ALL_MODELS[(i + 2) % ALL_MODELS.length];
    const mfg = new Date(2025, (i + 3) % 12, 8 + (i % 15)).toISOString().slice(0, 10);
    const distId = activeDistIds[i % activeDistIds.length];
    vehicles.push({
      id: genVehicleId(seq++), category: cat, model, chassisNumber: `CH${uid('X')}`,
      motorNumber: `MT${uid('X')}`, batterySerial: `BT${uid('X')}`, chargerSerial: `CG${uid('X')}`,
      manufacturingDate: mfg, purchaseDate: mfg, status: 'Sent to Distributor', distributorId: distId,
    });
  }
  // group into supply transactions (with finance terms)
  const unitPrice = { Passenger: 105000, Loader: 148000 };
  const payments = [];
  activeDistIds.forEach((distId, idx) => {
    const vIds = vehicles.filter(v => v.distributorId === distId && v.status === 'Sent to Distributor').map(v => v.id);
    if (vIds.length) {
      const totalAmount = vIds.reduce((sum, vid) => {
        const veh = vehicles.find(v => v.id === vid);
        return sum + (unitPrice[veh.category] || 120000);
      }, 0);
      const isCredit = idx % 2 === 0;
      const txnDate = new Date(2026, 4, 10 + idx).toISOString().slice(0, 10);
      const txn = {
        id: uid('TXN'), distributorId: distId, vehicleIds: vIds, date: txnDate,
        invoiceNumber: genInvoice('SUP'), deliveryStatus: 'Delivered',
        totalAmount, paymentType: isCredit ? 'Credit' : 'Cash',
        interestRate: isCredit ? 12 : 0,
        dueDate: isCredit ? addMonths(txnDate, 3) : null,
      };
      transactions.push(txn);
      pushAudit('Super Admin', `Supplied ${vIds.length} vehicle(s) to distributor ${distId} (${txn.paymentType})`);
      if (!isCredit) {
        payments.push({ id: uid('PAY'), distributorId: distId, amount: totalAmount, date: txnDate, mode: 'Bank Transfer', note: `Full payment against ${txn.invoiceNumber}` });
      } else {
        // partial payment against the credit invoice, for demo realism
        const partial = Math.round(totalAmount * 0.4);
        payments.push({ id: uid('PAY'), distributorId: distId, amount: partial, date: addMonths(txnDate, 1), mode: 'UPI', note: `Partial payment against ${txn.invoiceNumber}` });
      }
    }
  });

  // 10 sold vehicles with customers & warranty, spread across each distributor's own region
  const custNames = ['Vikram Rao', 'Sneha Patil', 'Mohammed Farooq', 'Lakshmi Narayanan', 'Arjun Mehta', 'Divya Reddy', 'Kunal Chatterjee', 'Fatima Sheikh', 'Harpreet Kaur', 'Rohan Kulkarni'];
  const distRegions = {
    'DIST-1001': [{ city: 'Pune', state: 'Maharashtra' }, { city: 'Pimpri-Chinchwad', state: 'Maharashtra' }, { city: 'Baramati', state: 'Maharashtra' }],
    'DIST-1002': [{ city: 'Nagpur', state: 'Maharashtra' }, { city: 'Amravati', state: 'Maharashtra' }, { city: 'Wardha', state: 'Maharashtra' }],
    'DIST-1003': [{ city: 'Chennai', state: 'Tamil Nadu' }, { city: 'Kanchipuram', state: 'Tamil Nadu' }, { city: 'Vellore', state: 'Tamil Nadu' }],
    'DIST-1004': [{ city: 'Kolkata', state: 'West Bengal' }, { city: 'Howrah', state: 'West Bengal' }, { city: 'Durgapur', state: 'West Bengal' }],
  };
  for (let i = 0; i < 10; i++) {
    const { cat, model } = ALL_MODELS[(i + 4) % ALL_MODELS.length];
    const distId = activeDistIds[i % activeDistIds.length];
    const region = distRegions[distId] ? distRegions[distId][i % distRegions[distId].length] : { city: 'Pune', state: 'Maharashtra' };
    const mfg = new Date(2025, i % 12, 12).toISOString().slice(0, 10);
    const saleDate = new Date(2025, (i % 8) + 1, 15).toISOString().slice(0, 10);
    const vId = genVehicleId(seq++);
    const isOld = i < 3; // make a few warranty-expired
    const battStart = saleDate;
    const battEnd = isOld ? addMonths(saleDate, 12) : addMonths(saleDate, BATTERY_WARRANTY_MONTHS);
    const chgEnd = isOld ? addMonths(saleDate, 6) : addMonths(saleDate, CHARGER_WARRANTY_MONTHS);
    vehicles.push({
      id: vId, category: cat, model, chassisNumber: `CH${uid('X')}`,
      motorNumber: `MT${uid('X')}`, batterySerial: `BT${uid('X')}`, chargerSerial: `CG${uid('X')}`,
      manufacturingDate: mfg, purchaseDate: mfg,
      status: isOld ? 'Warranty Expired' : 'Sold', distributorId: distId,
      batteryWarranty: { start: battStart, end: battEnd },
      chargerWarranty: { start: saleDate, end: chgEnd },
    });
    const netAmount = (cat === 'Passenger' ? 118000 + i * 1500 : 165000 + i * 2000) - 2000;
    let billing;
    if (i % 4 === 0) {
      billing = { totalAmount: netAmount, payments: [{ id: uid('PMT'), amount: netAmount, mode: 'Cash', date: saleDate, note: '' }], pendingDueDate: null, paymentType: 'Full Payment', financer: null };
    } else if (i % 4 === 1) {
      const paidNow = Math.round(netAmount * 0.6);
      billing = { totalAmount: netAmount, payments: [{ id: uid('PMT'), amount: paidNow, mode: 'UPI', date: saleDate, note: '' }], pendingDueDate: addMonths(todayStr(), 1), paymentType: 'Partial Payment', financer: null };
    } else if (i % 4 === 2) {
      const paidNow = Math.round(netAmount * 0.5);
      billing = { totalAmount: netAmount, payments: [{ id: uid('PMT'), amount: Math.round(paidNow * 0.5), mode: 'Cash', date: saleDate, note: '' }, { id: uid('PMT'), amount: Math.round(paidNow * 0.5), mode: 'UPI', date: saleDate, note: '' }], pendingDueDate: addMonths(saleDate, 2), paymentType: 'Partial Payment', financer: null };
    } else {
      billing = { totalAmount: netAmount, payments: [], pendingDueDate: addMonths(todayStr(), 2), paymentType: 'Full Credit', financer: 'Bajaj Finserv' };
    }
    sales.push({
      id: uid('SALE'), vehicleId: vId, distributorId: distId,
      customer: {
        fullName: custNames[i], fatherName: `${custNames[i].split(' ')[0]} Sr.`, mobile: `98765${10000 + i}`,
        altMobile: '', address: `${10 + i}, Sector ${i + 1}`, city: region.city, state: region.state,
        pin: `41${100 + i}`, aadhaar: `XXXX-XXXX-${1000 + i}`, pan: i % 2 === 0 ? `ABCDE${1000 + i}F` : '', dl: '',
      },
      kyc: { aadhaar: true, pan: i % 2 === 0, photo: true, addressProof: true, other: false },
      sellingPrice: cat === 'Passenger' ? 118000 + i * 1500 : 165000 + i * 2000,
      discount: 2000, invoiceNumber: genInvoice('SAL'), saleDate, billing,
    });
    pushAudit(distributors.find(d => d.id === distId)?.shopName || distId, `Sold vehicle ${vId} to ${custNames[i]}`);
  }

  const announcements = [
    { id: uid('ANN'), type: 'Upcoming Product', title: 'MoonVolt "58" Passenger Model', description: 'A new higher-range passenger model is in final testing and expected to join the lineup soon.', expectedDate: addMonths(todayStr(), 2), createdDate: todayStr() },
    { id: uid('ANN'), type: 'New Update', title: 'Faster Charger Rollout', description: 'All new units from this batch ship with the upgraded fast-charger as standard.', expectedDate: '', createdDate: todayStr() },
  ];

  pushAudit('Super Admin', 'System initialized with seed inventory');

  return { vehicles, distributors, transactions, sales, claims: [], payments, announcements, scheduledSms: [], auditLog, seq };
}
