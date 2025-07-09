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



// Add a single student
export const addStudent = async (student) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newStudent = { id: students.length + 1, ...student };
      students.push(newStudent);
      resolve(newStudent);
    }, 300);
  });
};

// Bulk add students
export const addStudentsBulk = async (studentList) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      studentList.forEach((s) => {
        const newStudent = { id: students.length + 1, ...s };
        students.push(newStudent);
      });
      resolve(true);
    }, 500);
  });
};