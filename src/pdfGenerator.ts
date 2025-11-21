import jsPDF from 'jspdf';
import type { FormData } from './types';

export const generatePDF = (data: FormData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 15;
  const leftMargin = 15;
  const lineHeight = 6;

  // Header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACE', leftMargin, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text('UNIVERSITY', leftMargin, y + 4);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXCHANGE STUDENT COURSE SELECTION SHEET', pageWidth / 2, y, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('International Students and Scholars', pageWidth - 15, y, { align: 'right' });
  pdf.text('161 William Street, 16th Floor', pageWidth - 15, y + 4, { align: 'right' });
  pdf.text('New York, NY 10038', pageWidth - 15, y + 8, { align: 'right' });

  y += 20;

  // Personal Information Section
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Personal Information', leftMargin, y);
  pdf.setFont('helvetica', 'normal');
  y += lineHeight;

  const addField = (label: string, value: string, x: number, currentY: number): number => {
    pdf.setFontSize(8);
    pdf.text(`${label}: `, x, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x + pdf.getTextWidth(`${label}: `), currentY);
    pdf.setFont('helvetica', 'normal');
    return currentY + lineHeight;
  };

  y = addField('Name (as in your passport)', `${data.firstName} ${data.lastName}`, leftMargin, y);
  y = addField('Pace U ID#', data.paceUId, leftMargin, y);
  y = addField('Home Institution', data.homeInstitution, leftMargin + 60, y - lineHeight);
  y = addField('Email', data.email, leftMargin, y);
  y = addField('Alternate Email', data.alternateEmail, leftMargin + 60, y - lineHeight);
  y = addField('Current education level', data.educationLevel, leftMargin, y);
  y = addField('How many U.S. credits are you required to take by your home institution while at Pace?', data.usCredits, leftMargin, y);
  y = addField('Special Requirements for Course Selection', data.specialRequirements, leftMargin, y);
  y = addField('Does Your Home School Allow Course Selection Outside Level of Education?', data.allowOutsideLevel, leftMargin, y);

  y += 5;

  // Course Selection Section
  pdf.setFont('helvetica', 'bold');
  pdf.text('Course Selection', leftMargin, y);
  pdf.setFont('helvetica', 'normal');
  y += lineHeight;

  // Selection boxes
  const levelText = data.level === 'undergraduate' ? '[X] Undergraduate  [ ] Graduate' : '[ ] Undergraduate  [X] Graduate';
  const campusText = data.campus === 'nyc' ? '[X] New York City  [ ] Pleasantville' : '[ ] New York City  [X] Pleasantville';
  const semesterText = data.semester === 'fall' ? '[X] Fall  [ ] Spring' : '[ ] Fall  [X] Spring';

  pdf.setFontSize(8);
  pdf.text(`Choose Level: ${levelText}`, leftMargin, y);
  y += lineHeight;
  pdf.text(`Choose Campus: ${campusText}`, leftMargin, y);
  y += lineHeight;
  pdf.text(`Semester: ${semesterText}`, leftMargin, y);
  y += 8;

  // Preferred Courses Table
  pdf.setFont('helvetica', 'bold');
  pdf.text('Preferred Courses (Provide 5 preferred courses and 5 alternate courses):', leftMargin, y);
  pdf.setFont('helvetica', 'normal');
  y += lineHeight;

  const drawTable = (courses: typeof data.preferredCourses, startY: number): number => {
    const colWidths = [25, 80, 35, 25];
    const headers = ['CRN', 'SUBJECT', 'COURSE CODE', 'CREDITS'];
    let currentY = startY;

    // Headers
    pdf.setFillColor(240, 240, 240);
    pdf.rect(leftMargin, currentY - 4, colWidths.reduce((a, b) => a + b, 0), 6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    let x = leftMargin + 2;
    headers.forEach((header, i) => {
      pdf.text(header, x, currentY);
      x += colWidths[i];
    });
    currentY += 5;

    // Data rows
    pdf.setFont('helvetica', 'normal');
    courses.forEach((course) => {
      x = leftMargin + 2;
      pdf.text(course.crn, x, currentY);
      x += colWidths[0];
      pdf.text(course.subject.substring(0, 40), x, currentY);
      x += colWidths[1];
      pdf.text(course.courseCode.toUpperCase(), x, currentY);
      x += colWidths[2];
      pdf.text(course.credits, x, currentY);
      currentY += 5;
    });

    return currentY;
  };

  y = drawTable(data.preferredCourses, y);
  y += 5;

  // Alternate Courses Table
  pdf.setFont('helvetica', 'bold');
  pdf.text('Alternate Courses (form will not be accepted unless alternate course section is fully completed):', leftMargin, y);
  pdf.setFont('helvetica', 'normal');
  y += lineHeight;
  y = drawTable(data.alternateCourses, y);

  y += 10;

  // Signature Section
  pdf.setFontSize(9);
  pdf.text(`Home institution coordinator's name and signature: ${data.coordinatorName}`, leftMargin, y);

  if (data.signatureType === 'pad' && data.signatureData) {
    try {
      pdf.addImage(data.signatureData, 'PNG', leftMargin + 100, y - 5, 50, 15);
    } catch {
      // Signature image failed, skip
    }
  }

  y += 15;

  // Footnotes
  pdf.setFontSize(7);
  pdf.text('1You must meet the equivalent prerequisites at your home institution.', leftMargin, y);
  y += 4;
  pdf.text('2Enrollment in the listed courses is not guaranteed.', leftMargin, y);
  y += 4;
  pdf.text('3CRN (Course Reference Number)', leftMargin, y);

  // Footer
  pdf.setFontSize(8);
  pdf.text('Last Updated: 05/07/2024', pageWidth - 15, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });

  pdf.save('Exchange_Student_Course_Selection_Sheet.pdf');
};
