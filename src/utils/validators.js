// AI-assisted: see docs/AI_LOG.md #5

export const validatePersonalData = (data) => {
  let errors = {};

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = 'El nombre es obligatorio';
  } else if (!nameRegex.test(data.fullName)) {
    errors.fullName = 'Solo se permiten letras y espacios';
  } else if (data.fullName.length > 50) {
    errors.fullName = 'Maximo 50 caracteres';
  }

  const idRegex = /^[0-9]{6,10}$/;
  if (!data.idNumber) {
    errors.idNumber = 'El documento es obligatorio';
  } else if (!idRegex.test(data.idNumber)) {
    errors.idNumber = 'Debe tener entre 6 y 10 digitos';
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!data.phone) {
    errors.phone = 'El celular es obligatorio';
  } else if (!phoneRegex.test(data.phone)) {
    errors.phone = 'El celular debe tener 10 digitos';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.email = 'El correo es obligatorio';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Ingrese un correo valido';
  }

  if (!data.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria';
  } else {
    const today = new Date();
    const birth = new Date(data.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    if (age < 18) {
      errors.birthDate = 'El conductor debe ser mayor de 18 años';
    }
  }

  if (!data.gender) errors.gender = 'Seleccione un género';
  if (!data.language) errors.language = 'Seleccione un idioma';

  return errors;
};

export const validateVehicleData = (data) => {
  let errors = {};

  const plateRegex = /^[A-Z]{3}[0-9]{3}$/;
  if (!data.plate) {
    errors.plate = 'La placa es obligatoria';
  } else if (!plateRegex.test(data.plate)) {
    errors.plate = 'Formato invalido (Ej. ABC123)';
  }

  if (!data.brand || data.brand.trim() === '') {
    errors.brand = 'La marca es obligatoria';
  } else if (data.brand.length > 30) {
    errors.brand = 'Maximo 30 caracteres';
  }

  if (!data.model || data.model.trim() === '') {
    errors.model = 'El modelo es obligatorio';
  } else if (data.model.length > 30) {
    errors.model = 'Maximo 30 caracteres';
  }

  const currentYear = new Date().getFullYear();
  if (!data.year) {
    errors.year = 'El año es obligatorio';
  } else if (parseInt(data.year) > currentYear) {
    errors.year = `El año no puede ser mayor a ${currentYear}`;
  }

  const capacityNum = parseInt(data.capacity);
  if (!data.capacity) {
    errors.capacity = 'La capacidad es obligatoria';
  } else if (data.category === 'xl' && capacityNum < 6) {
    errors.capacity = 'La categoria XL exige minimo 6 pasajeros';
  }

  return errors;
};