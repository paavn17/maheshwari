import { students } from '../students';


// Simulate async DB fetch for all students
export const getStudentsClient = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(students), 300); // Simulate DB delay
  });
};

// Async filter by college name
export const getStudentsByCollege = async (collegeName) => {
  const all = await getStudentsClient();
  return all.filter((student) => student.college_name === collegeName);
};

// Get unique list of colleges
export const getUniqueColleges = () => {
  const colleges = students.map((s) => s.college_name);
  return [...new Set(colleges)];
};

export const getBranchesByCollege = (collegeName) => {
  const filtered = students.filter((s) => s.college_name === collegeName);
  const branches = filtered.map((s) => s.branch);
  return [...new Set(branches)];
};