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
    const newFormData = { ...formData };
    const courses = [...newFormData[type]];
    courses[index] = { ...courses[index], [field]: value };
    newFormData[type] = courses;
    setFormData(newFormData);
    if (submitted) {
      setErrors(validateForm(newFormData));
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_selection_data.json';
    a.click();
    URL.revokeObjectURL(url);
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
    `w-full px-4 py-2.5 border-2 rounded-lg bg-white ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {errors[field]}
        {field === 'paceUId' && (
          <a
            href="https://helpdesk.pace.edu/TDClient/213/Portal/KB/ArticleDet?ID=3933"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-600 underline hover:text-blue-800"
          >
            Get help
          </a>
        )}
      </p>
    ) : null;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-white p-8 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src="/paceias_page-0001.jpg"
                  alt="PACE IAS Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <div className="text-right text-sm text-gray-600 hidden sm:block">
                <p className="font-semibold text-[#002D73] mb-1">International Academic Support</p>
                <p className="text-gray-600">161 William Street, 16th Floor</p>
                <p className="text-gray-600">New York, NY 10038</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#FFB81A] via-[#FFC940] to-[#FFB81A] px-8 py-5">
            <h2 className="text-xl font-bold text-center tracking-wide text-[#002D73]">
              Exchange Student Course Selection Sheet
            </h2>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white shadow-2xl rounded-b-2xl border-x border-b border-gray-200 -mt-1">
          <div className="p-8 sm:p-10">
            {/* Error Summary */}
            {submitted && errorList.length > 0 && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      {errorList.slice(0, 10).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                      {errorList.length > 10 && <li className="font-medium">...and {errorList.length - 10} more errors</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-8 flex flex-wrap gap-3 pb-6 border-b border-gray-200">
              <button
                onClick={loadExample}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 hover:border-[#002D73] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load Example
              </button>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 hover:border-[#002D73] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload JSON
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={exportJSON}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 hover:border-[#002D73] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export JSON
              </button>
            </div>

            {/* Personal Information */}
            <section className="mb-10">
              <h3 className="text-2xl font-bold text-[#002D73] section-header">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div data-field="firstName">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name <span className="text-gray-400">(as in passport)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={inputClass('firstName')}
                  />
                  <ErrorMsg field="firstName" />
                </div>
                <div data-field="lastName">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={inputClass('lastName')}
                  />
                  <ErrorMsg field="lastName" />
                </div>
                <div data-field="paceUId">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pace U ID#
                    <a
                      href="https://helpdesk.pace.edu/TDClient/213/Portal/KB/ArticleDet?ID=3933"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-blue-600 underline hover:text-blue-800 font-normal"
                    >
                      (how to pull UID)
                    </a>
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Home Institution</label>
                  <input
                    type="text"
                    value={formData.homeInstitution}
                    onChange={(e) => updateField('homeInstitution', e.target.value)}
                    className={inputClass('homeInstitution')}
                  />
                  <ErrorMsg field="homeInstitution" />
                </div>
                <div data-field="email">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={inputClass('email')}
                  />
                  <ErrorMsg field="email" />
                </div>
                <div data-field="alternateEmail">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alternate Email</label>
                  <input
                    type="email"
                    value={formData.alternateEmail}
                    onChange={(e) => updateField('alternateEmail', e.target.value)}
                    className={inputClass('alternateEmail')}
                  />
                  <ErrorMsg field="alternateEmail" />
                </div>
                <div data-field="educationLevel">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Education Level</label>
                  <input
                    type="text"
                    value={formData.educationLevel}
                    onChange={(e) => updateField('educationLevel', e.target.value)}
                    className={inputClass('educationLevel')}
                  />
                  <ErrorMsg field="educationLevel" />
                </div>
                <div data-field="usCredits">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">U.S. Credits Required</label>
                  <input
                    type="number"
                    min="12"
                    max="18"
                    value={formData.usCredits}
                    onChange={(e) => updateField('usCredits', e.target.value)}
                    placeholder="12-18"
                    className={inputClass('usCredits')}
                  />
                  <ErrorMsg field="usCredits" />
                </div>
                <div className="sm:col-span-2" data-field="specialRequirements">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requirements for Course Selection</label>
                  <input
                    type="text"
                    value={formData.specialRequirements}
                    onChange={(e) => updateField('specialRequirements', e.target.value)}
                    className={inputClass('specialRequirements')}
                  />
                  <ErrorMsg field="specialRequirements" />
                </div>
                <div className="sm:col-span-2" data-field="allowOutsideLevel">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Does Your Home School Allow Course Selection Outside Level of Education?
                  </label>
                  <select
                    value={formData.allowOutsideLevel}
                    onChange={(e) => updateField('allowOutsideLevel', e.target.value)}
                    className={inputClass('allowOutsideLevel')}
                  >
                    <option value="">Select an option...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <ErrorMsg field="allowOutsideLevel" />
                </div>
              </div>
            </section>

            {/* Course Selection */}
            <section className="mb-10">
              <h3 className="text-2xl font-bold text-[#002D73] section-header">Course Selection</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 shadow-sm">
                <div data-field="level">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Level</label>
                  <div className="space-y-2.5">
                    {['undergraduate', 'graduate'].map((lvl) => (
                      <label key={lvl} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="level"
                          checked={formData.level === lvl}
                          onChange={() => updateField('level', lvl)}
                        />
                        <span className="text-gray-700 group-hover:text-gray-900 capitalize">{lvl}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg field="level" />
                </div>

                <div data-field="campus">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Campus</label>
                  <div className="space-y-2.5">
                    {[{ val: 'nyc', label: 'New York City' }, { val: 'pleasantville', label: 'Pleasantville' }].map(({ val, label }) => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="campus"
                          checked={formData.campus === val}
                          onChange={() => updateField('campus', val)}
                        />
                        <span className="text-gray-700 group-hover:text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg field="campus" />
                </div>

                <div data-field="semester">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Semester</label>
                  <div className="space-y-2.5">
                    {['fall', 'spring'].map((sem) => (
                      <label key={sem} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="semester"
                          checked={formData.semester === sem}
                          onChange={() => updateField('semester', sem)}
                        />
                        <span className="text-gray-700 group-hover:text-gray-900 capitalize">{sem}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg field="semester" />
                </div>
              </div>

              {/* Course Registration Information */}
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-yellow-50 border-2 border-[#FFB81A]/30 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-0.5 w-6 h-6 bg-[#FFB81A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#002D73]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700 space-y-3 flex-1">
                    <p className="font-medium text-[#002D73]">
                      Your Pace academic advisor will receive your course selection and register you in courses<sup>1</sup>.
                      At a later date, you will be instructed on how to view your course registration and how to contact
                      your academic advisor should you have any questions about your schedule.
                    </p>

                    <div className="space-y-1.5 pl-4 border-l-3 border-[#FFB81A]">
                      <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#002D73] rounded-full"></span>
                        Fall courses are posted online in mid to late April.
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#002D73] rounded-full"></span>
                        Spring courses are posted online in mid to late November.
                      </p>
                    </div>

                    <p>
                      Using the course offerings posted for the same semester in the prior year on the{' '}
                      <a
                        href="https://appsrv.pace.edu/ScheduleExplorer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#002D73] underline hover:text-[#FFB81A] font-semibold transition-colors"
                      >
                        Schedule Explorer
                      </a>
                      , list your course preferences and alternative courses below for the semester in which you plan to attend.
                      When using Schedule Explorer to search courses, you must be sure to select the appropriate "Campus"
                      (i.e., Pleasantville or New York City) and the appropriate "Level" (i.e., undergraduate or graduate).
                      Also ensure to review most common mistakes in filling this form on{' '}
                      <a
                        href="https://www.pace.edu/international-academic-support/semester-pace/course-procedures"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#002D73] underline hover:text-[#FFB81A] font-semibold transition-colors"
                      >
                        our website
                      </a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Tables */}
              {(['preferredCourses', 'alternateCourses'] as const).map((courseType) => (
                <div key={courseType} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${courseType === 'preferredCourses' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    <h4 className="font-semibold text-gray-800">
                      {courseType === 'preferredCourses' ? 'Preferred Courses' : 'Alternate Courses'}
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        {courseType === 'preferredCourses'
                          ? '(Provide 5 preferred courses)'
                          : '(Required - form will not be accepted unless complete)'}
                      </span>
                    </h4>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-left w-24 border-b border-gray-200">CRN</th>
                          <th className="p-3 text-left border-b border-gray-200">Subject</th>
                          <th className="p-3 text-left w-32 border-b border-gray-200">Course Code</th>
                          <th className="p-3 text-left w-20 border-b border-gray-200">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData[courseType].map((course, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-b-0">
                            <td className="p-0">
                              <input
                                type="text"
                                value={course.crn}
                                onChange={(e) => updateCourse(courseType, i, 'crn', e.target.value)}
                                placeholder="21211"
                                className={errors[`${courseType}[${i}].crn`] ? 'bg-red-50' : ''}
                              />
                            </td>
                            <td className="p-0">
                              <input
                                type="text"
                                value={course.subject}
                                onChange={(e) => updateCourse(courseType, i, 'subject', e.target.value)}
                                placeholder="Course Title"
                                className={errors[`${courseType}[${i}].subject`] ? 'bg-red-50' : ''}
                              />
                            </td>
                            <td className="p-0">
                              <input
                                type="text"
                                value={course.courseCode}
                                onChange={(e) => updateCourse(courseType, i, 'courseCode', e.target.value.toUpperCase())}
                                placeholder="ABC 123"
                                className={errors[`${courseType}[${i}].courseCode`] ? 'bg-red-50' : ''}
                              />
                            </td>
                            <td className="p-0">
                              <input
                                type="text"
                                value={course.credits}
                                onChange={(e) => updateCourse(courseType, i, 'credits', e.target.value)}
                                placeholder="3"
                                className={errors[`${courseType}[${i}].credits`] ? 'bg-red-50' : ''}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>

            {/* Signature Section */}
            <section className="mb-10">
              <h3 className="text-2xl font-bold text-[#002D73] section-header">
                Home Institution Coordinator Signature
              </h3>
              <div className="mb-5" data-field="coordinatorName">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Coordinator Name</label>
                <input
                  type="text"
                  value={formData.coordinatorName}
                  onChange={(e) => updateField('coordinatorName', e.target.value)}
                  className={inputClass('coordinatorName')}
                />
                <ErrorMsg field="coordinatorName" />
              </div>

              <div data-field="signature">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Signature <span className="text-gray-400">(choose one option)</span>
                </label>

                <div className="grid gap-4">
                  <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-[#002D73]">Option 1: Sign below</span>
                      <button
                        onClick={clearSignature}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-[#002D73] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        className: 'signature-canvas w-full h-32',
                      }}
                      onEnd={saveSignature}
                    />
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Draw your signature above using mouse or touch
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <label className="flex items-start gap-3 cursor-pointer">
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
                        className="mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#002D73]">Option 2: Digital Certification</span>
                        <p className="text-sm text-gray-600 mt-1.5">
                          I certify that I am the designated home institution coordinator and approve this course
                          selection form.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                <ErrorMsg field="signature" />
              </div>
            </section>

            {/* Footnotes */}
            <section className="text-xs text-gray-600 mb-8 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <p className="mb-2"><sup className="text-[#002D73] font-bold">1</sup> You must meet the equivalent prerequisites at your home institution.</p>
              <p className="mb-2"><sup className="text-[#002D73] font-bold">2</sup> Enrollment in the listed courses is not guaranteed.</p>
              <p><sup className="text-[#002D73] font-bold">3</sup> CRN (Course Reference Number)</p>
            </section>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSubmit}
                  disabled={submitted && !isValid}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 ${
                    submitted && !isValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[#002D73] to-[#003894] text-white hover:from-[#003894] hover:to-[#002D73] hover:shadow-2xl hover:scale-105'
                  }`}
                >
                  {submitted && !isValid ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Fix Errors to Submit
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Validate & Export PDF
                    </>
                  )}
                </button>
                <a
                  href={`mailto:IAS@pace.edu?subject=Course Selection Form - ${formData.firstName} ${formData.lastName}&body=Dear IAS Team,%0D%0A%0D%0APlease find attached my course selection form.%0D%0A%0D%0AName: ${formData.firstName} ${formData.lastName}%0D%0APace U ID: ${formData.paceUId}%0D%0A%0D%0AThank you.`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl bg-gradient-to-r from-[#FFB81A] to-[#FFA500] text-[#002D73] hover:from-[#FFA500] hover:to-[#FFB81A] hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Submit to IAS
                </a>
              </div>
              <p className="text-sm text-gray-500 font-medium">Last Updated: 05/07/2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
