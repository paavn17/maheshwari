import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export const config = {
  api: { bodyParser: false }, // Disable default Next.js body parsing for multipart
};

export async function POST(req) {
  try {
    // Parse form data using Web standard API
    const formData = await req.formData();

    const college_name = formData.get('college_name');
    const college_code = formData.get('college_code');
    const excelFile = formData.get('excel_file');

    if (!college_name || !college_code || !excelFile) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Convert uploaded file Blob to buffer for xlsx
    const arrayBuffer = await excelFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get raw rows (arrays), first row is headers
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (rows.length < 2) {
      return new Response(JSON.stringify({ error: 'Excel file contains no data rows' }), { status: 400 });
    }

    // Extract headers and trim spaces, lowercase for consistent keys
    const headers = rows[0].map((h) => h.toString().trim().toLowerCase());

    // Map rows to objects with clean keys
    const jsonData = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      return obj;
    });

    console.log('Parsed admins from Excel:', jsonData);

    // Insert institution record
    const [instResult] = await db.query(
      'INSERT INTO institutions (name, code, created_at) VALUES (?, ?, NOW())',
      [college_name, college_code]
    );
    const institution_id = instResult.insertId;

    // Insert each admin
    for (const [index, row] of jsonData.entries()) {
      const name = row['name'];
      const email = row['email'];
      const phone = row['phone'];
      const password = row['password'];
      const department = row['department'];

      console.log(`Processing admin row ${index}:`, { name, email, phone, password, department });

      // Skip incomplete rows
      if (!name || !email || !phone || !password || !department) {
        console.warn(`Skipping incomplete admin row ${index}`);
        continue;
      }

      try {
        await db.query(
          'INSERT INTO institution_admins (institution_id, name, email, phone, password, department, created_at, approved_by) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)',
          [institution_id, name, email, phone.toString(), password, department]
        );
        console.log(`Admin row ${index} inserted successfully.`);
      } catch (e) {
        console.error(`Error inserting admin row ${index}:`, e);
      }
    }

    return new Response(JSON.stringify({ message: 'Institution and admins added successfully' }), { status: 200 });
  } catch (err) {
    console.error('Add with Excel error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
