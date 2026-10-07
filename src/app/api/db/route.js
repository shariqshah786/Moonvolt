import { NextResponse } from 'next/server';
import { connectToDatabase, VdmsModel } from '@/lib/mongodb';
import { seedDB } from '@/lib/seed';

function migrateData(data) {
  if (data && Array.isArray(data.vehicles)) {
    data.vehicles.forEach(v => {
      if (v.model === 'Rapid') {
        v.model = 'Shobha';
      }
    });
  }
  return data;
}

export async function GET() {
  try {
    await connectToDatabase();
    let doc = await VdmsModel.findOne({ key: 'vdms_db' });
    if (!doc) {
      // Seed the database if it doesn't exist yet
      const seeded = seedDB();
      doc = await VdmsModel.create({
        key: 'vdms_db',
        value: JSON.stringify(seeded),
      });
      return NextResponse.json(seeded);
    }
    const parsed = JSON.parse(doc.value);
    let changed = false;
    if (parsed && Array.isArray(parsed.vehicles)) {
      parsed.vehicles.forEach(v => {
        if (v.model === 'Rapid') {
          v.model = 'Shobha';
          changed = true;
        }
      });
    }
    if (changed) {
      await VdmsModel.updateOne(
        { key: 'vdms_db' },
        { value: JSON.stringify(parsed) }
      );
    }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Failed to load DB from MongoDB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    migrateData(data);
    await connectToDatabase();
    await VdmsModel.updateOne(
      { key: 'vdms_db' },
      { value: JSON.stringify(data) },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save DB to MongoDB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
