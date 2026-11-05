export function explainInvalidField(event) {
  const field = event.target;
  if (field.validity.valueMissing) field.setCustomValidity(field.type === 'checkbox' ? 'Acepta las condiciones para continuar.' : 'Completa este campo para continuar.');
  else if (field.validity.typeMismatch && field.type === 'email') field.setCustomValidity('Escribe un correo válido, por ejemplo: nombre@ejemplo.com.');
  else if (field.validity.tooShort) field.setCustomValidity(`Usa al menos ${field.minLength} caracteres.`);
  else if (field.validity.rangeUnderflow || field.validity.rangeOverflow) field.setCustomValidity(`Escribe un número entre ${field.min} y ${field.max}.`);
  else if (field.validity.patternMismatch) field.setCustomValidity('Escribe un nombre que no contenga solo espacios.');
}
export function clearFieldError(event) { event.target.setCustomValidity?.(''); }
