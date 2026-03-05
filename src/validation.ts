import type { FormData, ValidationErrors, CourseEntry } from './types';

export const validateEmail = (email: string, fieldName: string): string | null => {
  if (!email) return `${fieldName} is required`;
  if (!email.includes('@')) return `${fieldName} must contain an @ symbol`;
  return null;
};

export const validateCredits = (credits: string): string | null => {
  if (!credits) return 'U.S. credits is required';
  const num = parseInt(credits, 10);
  if (isNaN(num)) return 'Credits must be a number';
  if (num < 12 || num > 18) return 'Credits must be between 12 and 18';
  return null;
};

export const validateCourseCode = (code: string): string | null => {
  if (!code) return 'Course code is required';
  const normalized = code.toUpperCase().trim().replace(/\s+/g, ' ');
  const pattern = /^[A-Z]{2,3}\s\d{3}$/;
  if (!pattern.test(normalized)) return 'Course code must be 2-3 letters, space, 3 digits (e.g., CS 121 or ECO 240)';
  return null;
};

export const validateCrn = (crn: string): string | null => {
  if (!crn) return 'CRN is required';
  if (!/^\d{5}$/.test(crn)) return 'CRN must be exactly 5 digits';
  return null;
};

export const validateCourseCredits = (credits: string): string | null => {
  if (!credits) return 'Credits is required';
  if (!/^[1-9]$/.test(credits)) return 'Credits must be a single digit 1-9';
  return null;
};

export const validateCourseEntry = (entry: CourseEntry, index: number, prefix: string): ValidationErrors => {
  const errors: ValidationErrors = {};

  const crnError = validateCrn(entry.crn);
  if (crnError) errors[`${prefix}[${index}].crn`] = crnError;

  if (!entry.subject.trim()) errors[`${prefix}[${index}].subject`] = 'Subject is required';

  const codeError = validateCourseCode(entry.courseCode);
  if (codeError) errors[`${prefix}[${index}].courseCode`] = codeError;

  const creditsError = validateCourseCredits(entry.credits);
  if (creditsError) errors[`${prefix}[${index}].credits`] = creditsError;

  return errors;
};

export const validateForm = (data: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Personal Information
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';

  if (!data.homeInstitution.trim()) errors.homeInstitution = 'Home institution is required';

  const emailError = validateEmail(data.email, 'Email');
  if (emailError) errors.email = emailError;

  const altEmailError = validateEmail(data.alternateEmail, 'Alternate email');
  if (altEmailError) errors.alternateEmail = altEmailError;

  if (!data.educationLevel.trim()) errors.educationLevel = 'Education level is required';

  const creditsError = validateCredits(data.usCredits);
  if (creditsError) errors.usCredits = creditsError;

  if (!data.specialRequirements.trim()) errors.specialRequirements = 'Special requirements is required';

  if (!data.allowOutsideLevel) {
    errors.allowOutsideLevel = 'Please answer yes or no';
  } else if (!['yes', 'no'].includes(data.allowOutsideLevel.toLowerCase())) {
    errors.allowOutsideLevel = 'Must be yes or no';
  }

  // Selections
  if (!data.level) errors.level = 'Select exactly one level';
  if (!data.campus) errors.campus = 'Select exactly one campus';
  if (!data.semester) errors.semester = 'Select exactly one semester';

  // Preferred Courses
  data.preferredCourses.forEach((course, i) => {
    Object.assign(errors, validateCourseEntry(course, i, 'preferredCourses'));
  });

  // Alternate Courses (all 5 must be filled)
  data.alternateCourses.forEach((course, i) => {
    Object.assign(errors, validateCourseEntry(course, i, 'alternateCourses'));
  });

  // Signature — only signature pad required
  if (!data.signatureType || (data.signatureType === 'pad' && !data.signatureData)) {
    errors.signature = 'Signature is required — please draw your signature above';
  }

  return errors;
};
