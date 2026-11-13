// AI-assisted: see docs/AI_LOG.md #24
const asFile = (value) => {
  if (!value) return null;
  return typeof value === 'string' ? { uri: value, isPdf: false } : value;
};

export const toFormState = (driver = {}) => {
  const v = driver.vehicle || {};
  const d = driver.documents || {};

  return {
    personalData: {
      profilePhoto: driver.profilePhoto || null,
      fullName: (driver.fullName || '').trim(),
      idNumber: driver.idNumber || '',
      phone: driver.phone || '',
      email: driver.email || '',
      birthDate: driver.birthDate || '',
      gender: driver.gender || '',
    },
    vehicleData: {
      vehiclePhoto: v.vehiclePhoto || null,
      category: v.category || '',
      plate: v.plate || '',
      brand: (v.brand || '').trim(),
      model: (v.model || '').trim(),
      year: v.year != null ? String(v.year) : '',
      color: v.color || '',
      capacity: v.capacity != null ? String(v.capacity) : '',
    },
    docsData: {
      licenseFront: d.licenseFront || null,
      licenseBack: d.licenseBack || null,
      licenseNumber: d.licenseNumber || '',
      licenseExpiry: d.licenseExpiry || '',
      soatFile: asFile(d.soatFile),
      soatExpiry: d.soatExpiry || '',
      technoFile: asFile(d.technoFile),
      technoExpiry: d.technoExpiry || '',
      mpEmail: d.mpEmail || '',
      acceptedTerms: d.acceptedTerms === true,
    },
  };
};

export const buildProfileUpdate = ({ personalData, vehicleData, docsData }, urls, current = {}) => ({
  fullName: personalData.fullName.trim(),
  phone: personalData.phone.trim(),
  gender: personalData.gender,
  birthDate: personalData.birthDate,
  profilePhoto: urls.profilePhoto,
  vehicle: {
    ...(current.vehicle || {}),
    category: vehicleData.category,
    plate: vehicleData.plate.trim().toUpperCase(),
    brand: vehicleData.brand.trim(),
    model: vehicleData.model.trim(),
    year: Number(vehicleData.year),
    capacity: Number(vehicleData.capacity),
    color: vehicleData.color,
    vehiclePhoto: urls.vehiclePhoto,
  },
  documents: {
    ...(current.documents || {}),
    licenseFront: urls.licenseFront,
    licenseBack: urls.licenseBack,
    licenseNumber: docsData.licenseNumber.trim(),
    licenseExpiry: docsData.licenseExpiry,
    soatFile: urls.soatFile,
    soatExpiry: docsData.soatExpiry,
    technoFile: urls.technoFile || null,
    technoExpiry: docsData.technoExpiry || null,
    mpEmail: docsData.mpEmail.trim(),
    acceptedTerms: docsData.acceptedTerms,
  },
});