// AI-assisted: see docs/AI_LOG.md #3
export const validatePersonalData = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.fullName = 'El nombre completo debe tener al menos 3 caracteres.';
  }

  if (!data.idNumber || !/^\d{6,10}$/.test(data.idNumber)) {
    errors.idNumber = 'El documento debe contener entre 6 y 10 dígitos numéricos.';
  }

  if (!data.phone || !/^\d{10}$/.test(data.phone)) {
    errors.phone = 'El número de celular debe tener exactamente 10 dígitos.';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Ingrese un correo electrónico válido.';
  }

  if (!data.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria.';
  } else {
    const birth = new Date(data.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    if (age < 18) {
      errors.birthDate = 'Debe ser mayor de 18 años para registrarse como conductor.';
    }
  }

  if (!data.gender) {
    errors.gender = 'Debe seleccionar un género.';
  }

  if (!data.profilePhoto) {
    errors.profilePhoto = 'La foto de perfil es obligatoria.';
  }

  return errors;
};

export const validateVehicleData = (data) => {
  const errors = {};

  if (!data.category) {
    errors.category = 'Debe seleccionar una categoría.';
  }

  if (!data.plate || !/^[A-Z]{3}\d{3}$/.test(data.plate)) {
    errors.plate = 'La placa debe tener formato colombiano (3 letras y 3 números). Ej: ABC123';
  }

  if (!data.brand || data.brand.trim().length < 2) {
    errors.brand = 'La marca del vehículo es obligatoria.';
  }

  if (!data.model || data.model.trim().length < 1) {
    errors.model = 'El modelo del vehículo es obligatorio.';
  }

  if (!data.year || !/^\d{4}$/.test(data.year)) {
    errors.year = 'Ingrese un año válido (4 dígitos). Ej: 2022';
  }

  if (!data.capacity || isNaN(data.capacity) || parseInt(data.capacity) < 1) {
    errors.capacity = 'La capacidad de pasajeros es obligatoria.';
  }

  if (!data.color) {
    errors.color = 'Debe seleccionar un color.';
  }

  if (!data.vehiclePhoto) {
    errors.vehiclePhoto = 'La foto del vehículo es obligatoria.';
  }

  return errors;
};

export const validateDocumentsData = (data, vehicleYear) => {
  const errors = {};
  const todayStr = new Date().toISOString().split('T')[0];

  if (!data.licenseFront) errors.licenseFront = 'La foto frontal de la licencia es obligatoria.';
  if (!data.licenseBack) errors.licenseBack = 'La foto posterior de la licencia es obligatoria.';
  if (!data.licenseNumber || data.licenseNumber.trim().length < 5) {
    errors.licenseNumber = 'Ingrese un número de licencia válido.';
  }
  if (!data.licenseExpiry) {
    errors.licenseExpiry = 'La fecha de vencimiento de la licencia es obligatoria.';
  } else if (data.licenseExpiry <= todayStr) {
    errors.licenseExpiry = 'La licencia se encuentra vencida. Ingrese una fecha posterior a hoy.';
  }

  if (!data.soatFile) errors.soatFile = 'El documento o foto del SOAT es obligatorio.';
  if (!data.soatExpiry) {
    errors.soatExpiry = 'La fecha de vencimiento del SOAT es obligatoria.';
  } else if (data.soatExpiry <= todayStr) {
    errors.soatExpiry = 'El SOAT se encuentra vencido. Ingrese una fecha posterior a hoy.';
  }

  const currentYear = new Date().getFullYear();
  const vYear = parseInt(vehicleYear) || currentYear;
  const isExempt = (currentYear - vYear) <= 5;

  if (!isExempt) {
    if (!data.technoFile) errors.technoFile = 'La revisión técnico-mecánica es obligatoria para vehículos con más de 5 años.';
    if (!data.technoExpiry) {
      errors.technoExpiry = 'La fecha de vencimiento de la técnico-mecánica es obligatoria.';
    } else if (data.technoExpiry <= todayStr) {
      errors.technoExpiry = 'La técnico-mecánica se encuentra vencida. Ingrese una fecha posterior a hoy.';
    }
  }

  if (!data.mpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.mpEmail)) {
    errors.mpEmail = 'Ingrese un correo de Mercado Pago válido.';
  }

  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'Debe aceptar los Términos y Condiciones.';
  }

  return errors;
};