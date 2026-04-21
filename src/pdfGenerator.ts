import jsPDF from 'jspdf';
import type { FormData } from './types';

export const generatePDF = (data: FormData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 15;
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;

  // Header - Left side
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACE', leftMargin, y);
  pdf.setFontSize(9);
  pdf.text('UNIVERSITY', leftMargin, y + 4);

  // Header - Right side (address)
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('International Students and Scholars', rightMargin, y, { align: 'right' });
  pdf.text('161 William Street, 16th Floor', rightMargin, y + 4, { align: 'right' });
  pdf.text('New York, NY 10038', rightMargin, y + 8, { align: 'right' });

  // Title on separate line below
  y += 14;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXCHANGE STUDENT COURSE SELECTION SHEET', pageWidth / 2, y, { align: 'center' });

  y += 12;

  // Personal Information Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Personal Information', leftMargin, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  // Row helper for label: value format with fixed width labels
  const addField = (label: string, value: string, x: number, currentY: number, labelWidth: number = 45): void => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${label}:`, x, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value || '-', x + labelWidth, currentY);
  };

  // Personal info rows
  addField('Name (as in your passport)', `${data.firstName} ${data.lastName}`, leftMargin, y, 50);
  y += 7;

  addField('Pace U ID#', data.paceUId, leftMargin, y, 25);
  addField('Home Institution', data.homeInstitution, pageWidth / 2, y, 35);
  y += 7;

  addField('Email', data.email, leftMargin, y, 15);
  addField('Alternate Email', data.alternateEmail, pageWidth / 2, y, 35);
  y += 7;

  addField('Current education level', data.educationLevel, leftMargin, y, 45);
  y += 7;

  pdf.setFont('helvetica', 'normal');
  pdf.text('How many U.S. credits are you required to take while at Pace?', leftMargin, y);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.usCredits || '-', leftMargin + 95, y);
  y += 7;

  pdf.setFont('helvetica', 'normal');
  pdf.text('Special Requirements:', leftMargin, y);
  y += 5;
  pdf.setFont('helvetica', 'bold');
  const reqLines = pdf.splitTextToSize(
    data.specialRequirements || 'None',
    rightMargin - leftMargin
  );
  pdf.text(reqLines, leftMargin, y);
  y += reqLines.length * 5 + 2;

  pdf.setFont('helvetica', 'normal');
  pdf.text('Does Your Home School Allow Course Selection Outside Level of Education?', leftMargin, y);
  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.allowOutsideLevel || '-', leftMargin, y);
  y += 10;

  // Course Selection Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Course Selection', leftMargin, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  // Level, Campus, Semester
  const levelText = data.level === 'undergraduate'
    ? 'Choose Level: [X] Undergraduate  [ ] Graduate'
    : 'Choose Level: [ ] Undergraduate  [X] Graduate';
  pdf.text(levelText, leftMargin, y);
  y += 5;

  const campusText = data.campus === 'nyc'
    ? 'Choose Campus: [X] New York City  [ ] Pleasantville'
    : 'Choose Campus: [ ] New York City  [X] Pleasantville';
  pdf.text(campusText, leftMargin, y);
  y += 5;

  const semesterText = data.semester === 'fall'
    ? 'Semester: [X] Fall  [ ] Spring'
    : 'Semester: [ ] Fall  [X] Spring';
  pdf.text(semesterText, leftMargin, y);
  y += 8;

  // Course Selection introductory paragraph
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const introText1 = 'Your Pace academic advisor will receive your course selection and register you in courses¹. At a later date, you will be instructed on';
  const introText2 = 'how to view your course registration and how to contact your academic advisor should you have any questions about your schedule.';
  pdf.text(introText1, leftMargin, y);
  y += 4;
  pdf.text(introText2, leftMargin, y);
  y += 5;
  pdf.text('• Fall courses are posted online in mid to late April.', leftMargin + 2, y);
  y += 4;
  pdf.text('• Spring courses are posted online in mid to late November.', leftMargin + 2, y);
  y += 5;
  const introText3 = 'Using the course offerings posted for the same semester in the prior year on the "Schedule Explorer" (appsrv.pace.edu/ScheduleExplorer/),';
  const introText4 = 'list your course preferences and alternative courses below for the semester in which you plan to attend. When using Schedule Explorer to';
  const introText5 = 'search courses, you must be sure to select the appropriate "Campus" (i.e., Pleasantville or New York City) and the appropriate "Level"';
  const introText6 = '(i.e., undergraduate or graduate). Also ensure to review most common mistakes in filling this form on our website at';
  const introText7 = 'pace.edu/international-academic-support/semester-pace/course-procedures.';
  pdf.text(introText3, leftMargin, y);
  y += 4;
  pdf.text(introText4, leftMargin, y);
  y += 4;
  pdf.text(introText5, leftMargin, y);
  y += 4;
  pdf.text(introText6, leftMargin, y);
  y += 4;
  pdf.text(introText7, leftMargin, y);
  y += 8;

  // Table drawing function
  const drawTable = (title: string, courses: typeof data.preferredCourses, startY: number): number => {
    const colWidths = [25, 95, 35, 25];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const headers = ['CRN', 'SUBJECT', 'COURSE CODE', 'CREDITS'];
    const rowHeight = 6;
    let currentY = startY;

    // Title
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, leftMargin, currentY);
    currentY += 6;

    const tableStartY = currentY;

    // Header row background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(leftMargin, tableStartY, tableWidth, rowHeight, 'F');

    // Header text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    let x = leftMargin;
    headers.forEach((header, i) => {
      pdf.text(header, x + 2, tableStartY + 4);
      x += colWidths[i];
    });

    currentY = tableStartY + rowHeight;

    // Data rows
    pdf.setFont('helvetica', 'normal');
    courses.forEach((course) => {
      x = leftMargin;
      pdf.text(course.crn || '-', x + 2, currentY + 4);
      x += colWidths[0];
      pdf.text((course.subject || '-').substring(0, 50), x + 2, currentY + 4);
      x += colWidths[1];
      pdf.text((course.courseCode || '-').toUpperCase(), x + 2, currentY + 4);
      x += colWidths[2];
      pdf.text(course.credits || '-', x + 2, currentY + 4);
      currentY += rowHeight;
    });

    // Draw table border
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(leftMargin, tableStartY, tableWidth, currentY - tableStartY, 'S');

    // Draw column lines
    x = leftMargin;
    for (let i = 0; i < colWidths.length - 1; i++) {
      x += colWidths[i];
      pdf.line(x, tableStartY, x, currentY);
    }

    // Draw row lines (including header separator)
    for (let i = 1; i <= courses.length; i++) {
      const rowY = tableStartY + (i * rowHeight);
      pdf.line(leftMargin, rowY, leftMargin + tableWidth, rowY);
    }

    return currentY + 5;
  };

  // Preferred Courses
  y = drawTable('Preferred Courses (Provide 5 preferred courses and 5 alternate courses):', data.preferredCourses, y);
  y += 3;

  // Alternate Courses
  y = drawTable('Alternate Courses (form will not be accepted unless alternate course section is fully completed):', data.alternateCourses, y);
  y += 8;

  // Signature Section
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Home institution coordinator's name and signature: ${data.coordinatorName}`, leftMargin, y);

  if (data.signatureType === 'pad' && data.signatureData) {
    try {
      pdf.addImage(data.signatureData, 'PNG', leftMargin + 110, y - 8, 50, 20);
    } catch {
      // Signature failed
    }
  }

  y += 15;

  // Footnotes
  pdf.setFontSize(8);
  pdf.text('1You must meet the equivalent prerequisites at your home institution.', leftMargin, y);
  y += 4;
  pdf.text('2Enrollment in the listed courses is not guaranteed.', leftMargin, y);
  y += 4;
  pdf.text('3CRN (Course Reference Number)', leftMargin, y);

  // Generate filename using last name (e.g., CALLEJO Course Selection Sheet.pdf)
  const fileName = data.lastName
    ? `${data.lastName.toUpperCase()}_Course_Selection_Sheet.pdf`
    : 'Exchange_Student_Course_Selection_Sheet.pdf';
  pdf.save(fileName);
};
