import { uid } from './helpers';

export function seedDB() {
  return {
    vehicles: [],
    distributors: [],
    transactions: [],
    sales: [],
    claims: [],
    payments: [],
    announcements: [],
    scheduledSms: [],
    auditLog: [
      {
        id: uid('LOG'),
        timestamp: new Date().toISOString(),
        user: 'Super Admin',
        action: 'System initialized with clean database'
      }
    ],
    seq: 0,
    admin: {
      name: 'Super Admin',
      username: 'admin',
      password: 'admin123'
    }
  };
}

