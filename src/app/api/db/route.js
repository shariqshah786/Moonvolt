import { NextResponse } from 'next/server';
import { connectToDatabase, VdmsModel } from '@/lib/mongodb';
import { seedDB } from '@/lib/seed';

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
    return NextResponse.json(JSON.parse(doc.value));
  } catch (error) {
    console.error('Failed to load DB from MongoDB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
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
