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
    errors.idNumber = 'Debe ser un numero de 6 a 10 digitos';
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
    errors.email = 'Ingrese un correo valido con @ y dominio';
  }

  return errors;
};