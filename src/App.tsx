import { useState, useRef, type ChangeEvent } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { type FormData, type ValidationErrors, initialFormData, exampleFormData, type CourseEntry } from './types';
import { validateForm } from './validation';
import { generatePDF } from './pdfGenerator';
import './index.css';

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      const newErrors = validateForm({ ...formData, [field]: value });
      setErrors(newErrors);
    }
  };

  const updateCourse = (
    type: 'preferredCourses' | 'alternateCourses',
    index: number,
    field: keyof CourseEntry,
    value: string
  ) => {
    setFormData((prev) => {
      const courses = [...prev[type]];
      courses[index] = { ...courses[index], [field]: value };
      return { ...prev, [type]: courses };
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      generatePDF(formData);
    } else {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[data-field="${firstErrorKey}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const loadExample = () => {
    setFormData(exampleFormData);
    setErrors({});
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setFormData((prev) => ({ ...prev, signatureData: '', signatureType: '' }));
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setFormData((prev) => ({
        ...prev,
        signatureData: sigCanvas.current?.toDataURL() || '',
        signatureType: 'pad',
        typedCertification: false,
      }));
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.firstName && json.paceUId) {
          setFormData(json);
          setErrors({});
        }
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const errorList = Object.entries(errors);
  const isValid = errorList.length === 0;

  const inputClass = (field: string) =>
    `w-full p-2 border rounded ${errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-600 text-sm mt-1">
        {errors[field]}
        {field === 'paceUId' && (
          <a
            href="https://helpdesk.pace.edu/TDClient/213/Portal/KB/ArticleDet?ID=3933"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 underline"
          >
            Get help
          </a>
        )}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">PACE</h1>
              <p className="text-sm">UNIVERSITY</p>
            </div>
            <div className="text-center flex-1">
              <h2 className="text-lg font-bold">EXCHANGE STUDENT COURSE SELECTION SHEET</h2>
            </div>
            <div className="text-right text-sm">
              <p>International Students and Scholars</p>
              <p>161 William Street, 16th Floor</p>
              <p>New York, NY 10038</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error Summary */}
          {submitted && errorList.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded">
              <h3 className="font-bold text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside text-red-700 text-sm">
                {errorList.slice(0, 10).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
                {errorList.length > 10 && <li>...and {errorList.length - 10} more errors</li>}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 flex gap-4">
            <button onClick={loadExample} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Load Example Data
            </button>
            <label className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer">
              Upload JSON
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Personal Information */}
          <section className="mb-8">
            <h3 className="text-lg font-bold border-b-2 border-blue-900 pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div data-field="firstName">
                <label className="block text-sm font-medium mb-1">First Name (as in passport)</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={inputClass('firstName')}
                />
                <ErrorMsg field="firstName" />
              </div>
              <div data-field="lastName">
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={inputClass('lastName')}
                />
                <ErrorMsg field="lastName" />
              </div>
              <div data-field="paceUId">
                <label className="block text-sm font-medium mb-1">Pace U ID#</label>
                <input
                  type="text"
                  value={formData.paceUId}
                  onChange={(e) => updateField('paceUId', e.target.value.toUpperCase())}
                  placeholder="U0XXXXXX"
                  className={inputClass('paceUId')}
                />
                <ErrorMsg field="paceUId" />
              </div>
              <div data-field="homeInstitution">
                <label className="block text-sm font-medium mb-1">Home Institution</label>
                <input
                  type="text"
                  value={formData.homeInstitution}
                  onChange={(e) => updateField('homeInstitution', e.target.value)}
                  className={inputClass('homeInstitution')}
                />
                <ErrorMsg field="homeInstitution" />
              </div>
              <div data-field="email">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={inputClass('email')}
                />
                <ErrorMsg field="email" />
              </div>
              <div data-field="alternateEmail">
                <label className="block text-sm font-medium mb-1">Alternate Email</label>
                <input
                  type="email"
                  value={formData.alternateEmail}
                  onChange={(e) => updateField('alternateEmail', e.target.value)}
                  className={inputClass('alternateEmail')}
                />
                <ErrorMsg field="alternateEmail" />
              </div>
              <div data-field="educationLevel">
                <label className="block text-sm font-medium mb-1">Current Education Level</label>
                <input
                  type="text"
                  value={formData.educationLevel}
                  onChange={(e) => updateField('educationLevel', e.target.value)}
                  className={inputClass('educationLevel')}
                />
                <ErrorMsg field="educationLevel" />
              </div>
              <div data-field="usCredits">
                <label className="block text-sm font-medium mb-1">U.S. Credits Required (12-18)</label>
                <input
                  type="number"
                  min="12"
                  max="18"
                  value={formData.usCredits}
                  onChange={(e) => updateField('usCredits', e.target.value)}
                  className={inputClass('usCredits')}
                />
                <ErrorMsg field="usCredits" />
              </div>
              <div className="col-span-2" data-field="specialRequirements">
                <label className="block text-sm font-medium mb-1">Special Requirements for Course Selection</label>
                <input
                  type="text"
                  value={formData.specialRequirements}
                  onChange={(e) => updateField('specialRequirements', e.target.value)}
                  className={inputClass('specialRequirements')}
                />
                <ErrorMsg field="specialRequirements" />
              </div>
              <div className="col-span-2" data-field="allowOutsideLevel">
                <label className="block text-sm font-medium mb-1">
                  Does Your Home School Allow Course Selection Outside Level of Education?
                </label>
                <select
                  value={formData.allowOutsideLevel}
                  onChange={(e) => updateField('allowOutsideLevel', e.target.value)}
                  className={inputClass('allowOutsideLevel')}
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <ErrorMsg field="allowOutsideLevel" />
              </div>
            </div>
          </section>

          {/* Course Selection */}
          <section className="mb-8">
            <h3 className="text-lg font-bold border-b-2 border-blue-900 pb-2 mb-4">Course Selection</h3>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div data-field="level">
                <label className="block text-sm font-medium mb-2">Choose Level:</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={formData.level === 'undergraduate'}
                      onChange={() => updateField('level', 'undergraduate')}
                      className="mr-2"
                    />
                    Undergraduate
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={formData.level === 'graduate'}
                      onChange={() => updateField('level', 'graduate')}
                      className="mr-2"
                    />
                    Graduate
                  </label>
                </div>
                <ErrorMsg field="level" />
              </div>

              <div data-field="campus">
                <label className="block text-sm font-medium mb-2">Choose Campus:</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="campus"
                      checked={formData.campus === 'nyc'}
                      onChange={() => updateField('campus', 'nyc')}
                      className="mr-2"
                    />
                    New York City
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="campus"
                      checked={formData.campus === 'pleasantville'}
                      onChange={() => updateField('campus', 'pleasantville')}
                      className="mr-2"
                    />
                    Pleasantville
                  </label>
                </div>
                <ErrorMsg field="campus" />
              </div>

              <div data-field="semester">
                <label className="block text-sm font-medium mb-2">Semester:</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="semester"
                      checked={formData.semester === 'fall'}
                      onChange={() => updateField('semester', 'fall')}
                      className="mr-2"
                    />
                    Fall
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="semester"
                      checked={formData.semester === 'spring'}
                      onChange={() => updateField('semester', 'spring')}
                      className="mr-2"
                    />
                    Spring
                  </label>
                </div>
                <ErrorMsg field="semester" />
              </div>
            </div>

            {/* Preferred Courses Table */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">
                Preferred Courses<sup>2</sup> (Provide 5 preferred courses and 5 alternate courses)
              </h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left w-24">CRN<sup>3</sup></th>
                    <th className="border border-gray-300 p-2 text-left">SUBJECT</th>
                    <th className="border border-gray-300 p-2 text-left w-32">COURSE CODE</th>
                    <th className="border border-gray-300 p-2 text-left w-20">CREDITS</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.preferredCourses.map((course, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.crn}
                          onChange={(e) => updateCourse('preferredCourses', i, 'crn', e.target.value)}
                          placeholder="21211"
                          className={`w-full p-1 ${errors[`preferredCourses[${i}].crn`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.subject}
                          onChange={(e) => updateCourse('preferredCourses', i, 'subject', e.target.value)}
                          placeholder="Quantitative Analysis and Forecasting"
                          className={`w-full p-1 ${errors[`preferredCourses[${i}].subject`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.courseCode}
                          onChange={(e) => updateCourse('preferredCourses', i, 'courseCode', e.target.value.toUpperCase())}
                          placeholder="ECO 240"
                          className={`w-full p-1 ${errors[`preferredCourses[${i}].courseCode`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.credits}
                          onChange={(e) => updateCourse('preferredCourses', i, 'credits', e.target.value)}
                          placeholder="3"
                          className={`w-full p-1 ${errors[`preferredCourses[${i}].credits`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alternate Courses Table */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">
                Alternate Courses (form will not be accepted unless alternate course section is fully completed)
              </h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left w-24">CRN<sup>3</sup></th>
                    <th className="border border-gray-300 p-2 text-left">SUBJECT</th>
                    <th className="border border-gray-300 p-2 text-left w-32">COURSE CODE</th>
                    <th className="border border-gray-300 p-2 text-left w-20">CREDITS</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.alternateCourses.map((course, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.crn}
                          onChange={(e) => updateCourse('alternateCourses', i, 'crn', e.target.value)}
                          placeholder="21149"
                          className={`w-full p-1 ${errors[`alternateCourses[${i}].crn`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.subject}
                          onChange={(e) => updateCourse('alternateCourses', i, 'subject', e.target.value)}
                          placeholder="Artificial Intelligence I"
                          className={`w-full p-1 ${errors[`alternateCourses[${i}].subject`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.courseCode}
                          onChange={(e) => updateCourse('alternateCourses', i, 'courseCode', e.target.value.toUpperCase())}
                          placeholder="CS 385"
                          className={`w-full p-1 ${errors[`alternateCourses[${i}].courseCode`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={course.credits}
                          onChange={(e) => updateCourse('alternateCourses', i, 'credits', e.target.value)}
                          placeholder="4"
                          className={`w-full p-1 ${errors[`alternateCourses[${i}].credits`] ? 'bg-red-50' : ''}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Signature Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold border-b-2 border-blue-900 pb-2 mb-4">
              Home Institution Coordinator Signature
            </h3>
            <div className="mb-4" data-field="coordinatorName">
              <label className="block text-sm font-medium mb-1">Coordinator Name</label>
              <input
                type="text"
                value={formData.coordinatorName}
                onChange={(e) => updateField('coordinatorName', e.target.value)}
                className={inputClass('coordinatorName')}
              />
              <ErrorMsg field="coordinatorName" />
            </div>

            <div className="mb-4" data-field="signature">
              <label className="block text-sm font-medium mb-2">Signature (choose one option)</label>

              <div className="border border-gray-300 rounded p-4 mb-4">
                <p className="text-sm mb-2">Option 1: Sign below</p>
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: 'signature-canvas w-full h-32 border border-gray-300',
                  }}
                  onEnd={saveSignature}
                />
                <button onClick={clearSignature} className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
                  Clear Signature
                </button>
              </div>

              <div className="border border-gray-300 rounded p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.typedCertification}
                    onChange={(e) => {
                      updateField('typedCertification', e.target.checked);
                      if (e.target.checked) {
                        updateField('signatureType', 'typed');
                        updateField('signatureData', '');
                        sigCanvas.current?.clear();
                      } else {
                        updateField('signatureType', '');
                      }
                    }}
                    className="mr-2 mt-1"
                  />
                  <span className="text-sm">
                    Option 2: I certify that I am the designated home institution coordinator and approve this course
                    selection form.
                  </span>
                </label>
              </div>
              <ErrorMsg field="signature" />
            </div>
          </section>

          {/* Footnotes */}
          <section className="text-xs text-gray-600 mb-6 border-t pt-4">
            <p>
              <sup>1</sup>You must meet the equivalent prerequisites at your home institution.
            </p>
            <p>
              <sup>2</sup>Enrollment in the listed courses is not guaranteed.
            </p>
            <p>
              <sup>3</sup>CRN (Course Reference Number)
            </p>
          </section>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSubmit}
              disabled={submitted && !isValid}
              className={`px-6 py-3 rounded font-bold ${
                submitted && !isValid
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              {submitted && !isValid ? 'Fix Errors to Submit' : 'Validate and Export PDF'}
            </button>
            <p className="text-sm text-gray-500">Last Updated: 05/07/2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
