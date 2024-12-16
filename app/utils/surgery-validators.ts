export const validateSurgeryDate = (date: string): boolean => {
    const surgeryDate = new Date(date);
    const now = new Date();
  
    // Surgery can't be in the past
    if (surgeryDate < now) {
      return false;
    }
  
    // For non-emergency surgeries, validate business hours and weekdays
    const isWeekend = surgeryDate.getDay() === 0 || surgeryDate.getDay() === 6;
    const hour = surgeryDate.getHours();
    const isBusinessHours = hour >= 8 && hour <= 17;
  
    return !isWeekend && isBusinessHours;
  };
  
  export const validateSurgeryDuration = (duration: string): boolean => {
    const durationHours = parseFloat(duration);
    // Duration should be between 0.5 and 12 hours
    return durationHours >= 0.5 && durationHours <= 12;
  };
  
  export const validateRequiredFields = (formData: any): string[] => {
    const requiredFields = ['name', 'type', 'date', 'hospital', 'surgeon'];
    const missingFields = [];
  
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        missingFields.push(field);
      }
    }
  
    return missingFields;
  };