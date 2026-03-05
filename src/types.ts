export interface CourseEntry {
  crn: string;
  subject: string;
  courseCode: string;
  credits: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  homeInstitution: string;
  email: string;
  alternateEmail: string;
  educationLevel: string;
  usCredits: string;
  specialRequirements: string;
  allowOutsideLevel: string;
  level: 'undergraduate' | 'graduate' | '';
  campus: 'nyc' | 'pleasantville' | '';
  semester: 'fall' | 'spring' | '';
  preferredCourses: CourseEntry[];
  alternateCourses: CourseEntry[];
  signatureType: 'pad' | 'typed' | '';
  signatureData: string;
  typedCertification: boolean;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const emptyCoursesEntry = (): CourseEntry => ({
  crn: '',
  subject: '',
  courseCode: '',
  credits: '',
});

export const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  homeInstitution: '',
  email: '',
  alternateEmail: '',
  educationLevel: '',
  usCredits: '',
  specialRequirements: '',
  allowOutsideLevel: '',
  level: '',
  campus: '',
  semester: '',
  preferredCourses: Array(5).fill(null).map(() => emptyCoursesEntry()),
  alternateCourses: Array(5).fill(null).map(() => emptyCoursesEntry()),
  signatureType: '',
  signatureData: '',
  typedCertification: false,
};

export const exampleFormData: FormData = {
  firstName: 'Jane',
  lastName: 'Doe',
  homeInstitution: 'Riverside International University',
  email: 'jane.doe@riverside-uni.edu',
  alternateEmail: 'janedoe.student@email.com',
  educationLevel: '3rd year student',
  usCredits: '15',
  specialRequirements: 'Courses related to Business Analytics preferred',
  allowOutsideLevel: 'yes',
  level: 'undergraduate',
  campus: 'nyc',
  semester: 'fall',
  preferredCourses: [
    { crn: '21211', subject: 'Quantitative Analysis and Forecasting', courseCode: 'ECO 240', credits: '3' },
    { crn: '20695', subject: 'Introduction to Data Mining', courseCode: 'CS 325', credits: '3' },
    { crn: '21447', subject: 'Strategic Digital Marketing', courseCode: 'MAR 349', credits: '3' },
    { crn: '23427', subject: 'Politics and Media', courseCode: 'POL 245', credits: '3' },
    { crn: '20637', subject: 'Conflict Analysis', courseCode: 'POL 325', credits: '3' },
  ],
  alternateCourses: [
    { crn: '21149', subject: 'Artificial Intelligence I', courseCode: 'CS 385', credits: '4' },
    { crn: '20438', subject: 'Database Management', courseCode: 'CIT 241', credits: '4' },
    { crn: '22025', subject: 'Advertising Strategy and Creative', courseCode: 'MAR 221', credits: '3' },
    { crn: '20957', subject: 'Predictive Analytics', courseCode: 'MGT 353', credits: '3' },
    { crn: '21059', subject: 'Marketing Research', courseCode: 'MAR 222', credits: '3' },
  ],
  signatureType: 'pad',
  signatureData: '',
  typedCertification: false,
};
