// AI-assisted: see docs/AI_LOG.md #16
import { formatLocalDate, parseLocalDate } from './dateUtils';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;

export const validatePersonalData = (data) => {
  const errors = {};

  const name = (data.fullName || '').trim();
  if (!name) {
    errors.fullName = 'El nombre completo es obligatorio.';
  } else if (name.length < 3) {
    errors.fullName = 'El nombre debe tener al menos 3 caracteres.';
  } else if (name.length > 50) {
    errors.fullName = 'El nombre no puede superar 50 caracteres.';
  } else if (!NAME_REGEX.test(name)) {
    errors.fullName = 'Solo se permiten letras y espacios.';
  }

  if (!data.idNumber || !/^\d{6,10}$/.test(data.idNumber)) {
    errors.idNumber = 'El documento debe contener entre 6 y 10 dígitos numéricos.';
  }

  if (!data.phone || !/^\d{10}$/.test(data.phone)) {
    errors.phone = 'El número de celular debe tener exactamente 10 dígitos.';
  }

  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingrese un correo válido con @ y dominio (ej. nombre@dominio.com).';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (data.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  } else if (!/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
    errors.password = 'La contraseña debe combinar letras y números.';
  }

  if (!data.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria.';
  } else {
    const birth = parseLocalDate(data.birthDate);
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

  if (!data.gender) errors.gender = 'Debe seleccionar un género.';
  if (!data.profilePhoto) errors.profilePhoto = 'La foto de perfil es obligatoria.';

  return errors;
};

export const validateVehicleData = (data) => {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (!data.category) errors.category = 'Debe seleccionar una categoría.';

  // La placa se convierte a mayúsculas antes de validar
  const plate = (data.plate || '').trim().toUpperCase();
  if (!PLATE_REGEX.test(plate)) {
    errors.plate = 'La placa debe tener formato colombiano (3 letras y 3 números). Ej: ABC123';
  }

  const brand = (data.brand || '').trim();
  if (!brand) errors.brand = 'La marca del vehículo es obligatoria.';
  else if (brand.length > 30) errors.brand = 'La marca no puede superar 30 caracteres.';

  const model = (data.model || '').trim();
  if (!model) errors.model = 'El modelo del vehículo es obligatorio.';
  else if (model.length > 30) errors.model = 'El modelo no puede superar 30 caracteres.';

  if (!data.year || !/^\d{4}$/.test(data.year)) {
    errors.year = 'Ingrese un año válido (4 dígitos). Ej: 2022';
  } else if (parseInt(data.year, 10) > currentYear) {
    errors.year = `El año no puede ser mayor a ${currentYear}.`;
  } else if (parseInt(data.year, 10) < 1950) {
    errors.year = 'Ingrese un año válido (desde 1950).';
  }

  const capacity = parseInt(data.capacity, 10);
  if (!data.capacity || !/^\d+$/.test(String(data.capacity)) || capacity < 1) {
    errors.capacity = 'La capacidad de pasajeros es obligatoria (número entero).';
  } else if (data.category === 'xl' && capacity < 6) {
    errors.capacity = 'La categoría XL exige una capacidad mínima de 6 pasajeros.';
  }

  if (!data.color) errors.color = 'Debe seleccionar un color.';
  if (!data.vehiclePhoto) errors.vehiclePhoto = 'La foto del vehículo (con la placa visible) es obligatoria.';

  return errors;
};

export const validateDocumentsData = (data, vehicleYear) => {
  const errors = {};
  const todayStr = formatLocalDate();

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
  const vYear = parseInt(vehicleYear, 10) || currentYear;
  const isExempt = currentYear - vYear <= 5;

  if (!isExempt) {
    if (!data.technoFile) errors.technoFile = 'La revisión técnico-mecánica es obligatoria para vehículos con más de 5 años.';
    if (!data.technoExpiry) {
      errors.technoExpiry = 'La fecha de vencimiento de la técnico-mecánica es obligatoria.';
    } else if (data.technoExpiry <= todayStr) {
      errors.technoExpiry = 'La técnico-mecánica se encuentra vencida. Ingrese una fecha posterior a hoy.';
    }
  }

  if (!data.mpEmail || !EMAIL_REGEX.test(data.mpEmail.trim())) {
    errors.mpEmail = 'Ingrese un correo de Mercado Pago válido.';
  }

  if (!data.acceptedTerms) errors.acceptedTerms = 'Debe aceptar los Términos y Condiciones.';

  return errors;
};