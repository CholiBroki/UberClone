// AI-assisted: see docs/AI_LOG.md #5
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
  }

  if (!data.gender) {
    errors.gender = 'Debe seleccionar un género.';
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

  return errors;
};