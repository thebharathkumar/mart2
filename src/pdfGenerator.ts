import jsPDF from 'jspdf';
import type { FormData } from './types';

export const generatePDF = (data: FormData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 30;
  let y = 15;
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;

  // Colors
  const paceBlue = [0, 40, 85];
  const paceGold = [181, 152, 90];
  const gray = [100, 100, 100];
  const lightGray = [245, 245, 245];

  // Header background
  pdf.setFillColor(...paceBlue);
  pdf.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  pdf.setFillColor(...paceGold);
  pdf.rect(0, 28, pageWidth, 6, 'F');

  // Header text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACE', leftMargin, 12);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('UNIVERSITY', leftMargin, 17);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXCHANGE STUDENT COURSE SELECTION SHEET', pageWidth / 2, 15, { align: 'center' });

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('International Students and Scholars', rightMargin, 10, { align: 'right' });
  pdf.text('161 William Street, 16th Floor', rightMargin, 14, { align: 'right' });
  pdf.text('New York, NY 10038', rightMargin, 18, { align: 'right' });

  // Gold bar text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text('Course Selection Form', pageWidth / 2, 32, { align: 'center' });

  y = 42;
  pdf.setTextColor(0, 0, 0);

  // Section header helper
  const drawSectionHeader = (title: string, currentY: number): number => {
    pdf.setFillColor(...paceBlue);
    pdf.rect(leftMargin, currentY, contentWidth, 7, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, leftMargin + 3, currentY + 5);
    pdf.setTextColor(0, 0, 0);
    return currentY + 10;
  };

  // Field helper - returns new Y position
  const drawField = (label: string, value: string, x: number, currentY: number, maxWidth?: number): number => {
    pdf.setFontSize(8);
    pdf.setTextColor(...gray);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, x, currentY);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    const displayValue = maxWidth ? value.substring(0, maxWidth) : value;
    pdf.text(displayValue || '-', x, currentY + 4);
    pdf.setFont('helvetica', 'normal');
    return currentY + 10;
  };

  // Personal Information Section
  y = drawSectionHeader('Personal Information', y);

  // Row 1: Name and Pace ID
  drawField('Full Name (as in passport)', `${data.firstName} ${data.lastName}`, leftMargin, y);
  drawField('Pace U ID#', data.paceUId, leftMargin + 90, y);
  y += 12;

  // Row 2: Home Institution
  drawField('Home Institution', data.homeInstitution, leftMargin, y, 60);
  drawField('Education Level', data.educationLevel, leftMargin + 90, y);
  y += 12;

  // Row 3: Emails
  drawField('Email', data.email, leftMargin, y, 40);
  drawField('Alternate Email', data.alternateEmail, leftMargin + 90, y, 40);
  y += 12;

  // Row 4: Credits and Requirements
  drawField('U.S. Credits Required', data.usCredits, leftMargin, y);
  drawField('Allow Outside Level?', data.allowOutsideLevel === 'yes' ? 'Yes' : 'No', leftMargin + 90, y);
  y += 12;

  // Row 5: Special Requirements
  if (data.specialRequirements) {
    drawField('Special Requirements', data.specialRequirements.substring(0, 80), leftMargin, y);
    y += 12;
  }

  y += 3;

  // Course Selection Section
  y = drawSectionHeader('Course Selection', y);

  // Selection options in boxes
  const drawOptionBox = (label: string, options: { text: string; selected: boolean }[], x: number, currentY: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(...gray);
    pdf.text(label, x, currentY);
    pdf.setTextColor(0, 0, 0);
    let optY = currentY + 5;
    options.forEach((opt) => {
      pdf.setFont('helvetica', opt.selected ? 'bold' : 'normal');
      const checkbox = opt.selected ? '[X]' : '[ ]';
      pdf.text(`${checkbox} ${opt.text}`, x, optY);
      optY += 4;
    });
    pdf.setFont('helvetica', 'normal');
  };

  drawOptionBox('Level:', [
    { text: 'Undergraduate', selected: data.level === 'undergraduate' },
    { text: 'Graduate', selected: data.level === 'graduate' },
  ], leftMargin, y);

  drawOptionBox('Campus:', [
    { text: 'New York City', selected: data.campus === 'nyc' },
    { text: 'Pleasantville', selected: data.campus === 'pleasantville' },
  ], leftMargin + 60, y);

  drawOptionBox('Semester:', [
    { text: 'Fall', selected: data.semester === 'fall' },
    { text: 'Spring', selected: data.semester === 'spring' },
  ], leftMargin + 120, y);

  y += 18;

  // Table drawing helper
  const drawCourseTable = (title: string, courses: typeof data.preferredCourses, startY: number): number => {
    const colWidths = [22, 90, 35, 20];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const headers = ['CRN', 'SUBJECT', 'COURSE CODE', 'CREDITS'];
    let currentY = startY;

    // Title
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...paceBlue);
    pdf.text(title, leftMargin, currentY);
    pdf.setTextColor(0, 0, 0);
    currentY += 5;

    // Table header
    pdf.setFillColor(...lightGray);
    pdf.rect(leftMargin, currentY, tableWidth, 6, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(leftMargin, currentY, tableWidth, 6, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(...gray);
    let x = leftMargin;
    headers.forEach((header, i) => {
      pdf.text(header, x + 2, currentY + 4);
      if (i < headers.length - 1) {
        pdf.line(x + colWidths[i], currentY, x + colWidths[i], currentY + 6);
      }
      x += colWidths[i];
    });
    currentY += 6;

    // Data rows
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);

    courses.forEach((course, rowIndex) => {
      const rowHeight = 5;

      // Alternate row background
      if (rowIndex % 2 === 1) {
        pdf.setFillColor(252, 252, 252);
        pdf.rect(leftMargin, currentY, tableWidth, rowHeight, 'F');
      }

      // Row border
      pdf.setDrawColor(230, 230, 230);
      pdf.rect(leftMargin, currentY, tableWidth, rowHeight, 'S');

      x = leftMargin;
      const values = [course.crn, course.subject.substring(0, 45), course.courseCode.toUpperCase(), course.credits];
      values.forEach((val, i) => {
        pdf.text(val || '-', x + 2, currentY + 3.5);
        if (i < values.length - 1) {
          pdf.line(x + colWidths[i], currentY, x + colWidths[i], currentY + rowHeight);
        }
        x += colWidths[i];
      });
      currentY += rowHeight;
    });

    return currentY + 5;
  };

  y = drawCourseTable('Preferred Courses', data.preferredCourses, y);
  y = drawCourseTable('Alternate Courses', data.alternateCourses, y);

  y += 5;

  // Signature Section
  y = drawSectionHeader('Home Institution Coordinator Signature', y);

  drawField('Coordinator Name', data.coordinatorName, leftMargin, y);

  if (data.signatureType === 'pad' && data.signatureData) {
    try {
      pdf.addImage(data.signatureData, 'PNG', leftMargin + 80, y - 2, 50, 15);
    } catch {
      // Signature image failed
    }
  } else if (data.signatureType === 'typed' && data.typedCertification) {
    pdf.setFontSize(7);
    pdf.setTextColor(...gray);
    pdf.text('[Digitally certified by coordinator]', leftMargin + 80, y + 2);
    pdf.setTextColor(0, 0, 0);
  }

  y += 20;

  // Footnotes
  pdf.setFillColor(...lightGray);
  pdf.rect(leftMargin, y, contentWidth, 18, 'F');
  pdf.setFontSize(7);
  pdf.setTextColor(...gray);
  y += 4;
  pdf.text('1. You must meet the equivalent prerequisites at your home institution.', leftMargin + 3, y);
  y += 4;
  pdf.text('2. Enrollment in the listed courses is not guaranteed.', leftMargin + 3, y);
  y += 4;
  pdf.text('3. CRN = Course Reference Number', leftMargin + 3, y);

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(...gray);
  pdf.text('Last Updated: 05/07/2024', rightMargin, pdf.internal.pageSize.getHeight() - 8, { align: 'right' });
  pdf.text('Pace University - International Students and Scholars', leftMargin, pdf.internal.pageSize.getHeight() - 8);

  pdf.save('Exchange_Student_Course_Selection_Sheet.pdf');
};
