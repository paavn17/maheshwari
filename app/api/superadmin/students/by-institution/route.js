import { db } from '@/lib/db';

function bufferToBase64(buffer) {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

export async function POST(req) {
  try {
    const { institution_id } = await req.json();

    if (!institution_id) {
      return Response.json({ success: false, error: 'institution_id is required' }, { status: 400 });
    }

    const [students] = await db.query(
      `SELECT id, name, father_name, roll_no, mobile, gender, dob,
              blood_group, branch, class, section,
              start_year, end_year, student_type, profile_pic
       FROM students
       WHERE institution_id = ?
       ORDER BY name`,
      [institution_id]
    );

    // Map profile_pic to base64
    const studentsWithPics = students.map((s) => ({
      ...s,
      profile_pic: bufferToBase64(s.profile_pic),
    }));

    // Extract dropdown filter values
    const startYears = [...new Set(students.map((s) => s.start_year))].sort();
    const endYears = [...new Set(students.map((s) => s.end_year))].sort();
    const branches = [...new Set(students.map((s) => s.branch).filter(Boolean))].sort();
    const classes = [...new Set(students.map((s) => s.class).filter(Boolean))].sort();
    const sections = [...new Set(students.map((s) => s.section).filter(Boolean))].sort();
    const studentType = students[0]?.student_type || null;

    return Response.json({
      success: true,
      students: studentsWithPics,
      filters: {
        student_type: studentType,
        start_years: startYears,
        end_years: endYears,
        branches,
        classes,
        sections,
      },
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    return Response.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
