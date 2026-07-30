const dictionaries = {
  ru: {
    valueMissing: 'Заполните это поле.',
    typeMismatchEmail: 'Введите корректный адрес электронной почты.',
    typeMismatchUrl: 'Введите корректный адрес сайта.',
    tooShort: ({ minLength }) => `Введите не менее ${minLength} символов.`,
    tooLong: ({ maxLength }) => `Введите не более ${maxLength} символов.`,
    patternMismatch: 'Проверьте формат введённого значения.',
    rangeUnderflow: ({ min }) => `Значение должно быть не меньше ${min}.`,
    rangeOverflow: ({ max }) => `Значение должно быть не больше ${max}.`,
    stepMismatch: 'Введите допустимое значение.',
    badInput: 'Введите корректное значение.',
    generic: 'Проверьте введённое значение.'
  },
  en: {
    valueMissing: 'Please fill out this field.',
    typeMismatchEmail: 'Enter a valid email address.',
    typeMismatchUrl: 'Enter a valid website address.',
    tooShort: ({ minLength }) => `Enter at least ${minLength} characters.`,
    tooLong: ({ maxLength }) => `Enter no more than ${maxLength} characters.`,
    patternMismatch: 'Match the requested format.',
    rangeUnderflow: ({ min }) => `Value must be at least ${min}.`,
    rangeOverflow: ({ max }) => `Value must be no greater than ${max}.`,
    stepMismatch: 'Enter a valid value.',
    badInput: 'Enter a valid value.',
    generic: 'Check the entered value.'
  }
};

let generatedId = 0;

function languageFor(form) {
  const raw = form.dataset.ruiLocale || document.documentElement.lang || 'ru';
  return raw.toLowerCase().startsWith('en') ? 'en' : 'ru';
}

function params(input) {
  return {
    minLength: input.minLength > -1 ? input.minLength : '',
    maxLength: input.maxLength > -1 ? input.maxLength : '',
    min: input.min,
    max: input.max
  };
}

function override(input, key) {
  const names = {
    valueMissing: 'ruiMessageRequired',
    typeMismatchEmail: 'ruiMessageEmail',
    typeMismatchUrl: 'ruiMessageUrl',
    tooShort: 'ruiMessageTooShort',
    tooLong: 'ruiMessageTooLong',
    patternMismatch: 'ruiMessagePattern',
    rangeUnderflow: 'ruiMessageMin',
    rangeOverflow: 'ruiMessageMax',
    stepMismatch: 'ruiMessageStep',
    badInput: 'ruiMessageBadInput',
    generic: 'ruiMessageInvalid'
  };
  return input.dataset[names[key] || names.generic];
}

function messageKey(input) {
  const validity = input.validity;
  if (validity.valueMissing) return 'valueMissing';
  if (validity.typeMismatch && input.type === 'email') return 'typeMismatchEmail';
  if (validity.typeMismatch && input.type === 'url') return 'typeMismatchUrl';
  if (validity.tooShort) return 'tooShort';
  if (validity.tooLong) return 'tooLong';
  if (validity.patternMismatch) return 'patternMismatch';
  if (validity.rangeUnderflow) return 'rangeUnderflow';
  if (validity.rangeOverflow) return 'rangeOverflow';
  if (validity.stepMismatch) return 'stepMismatch';
  if (validity.badInput) return 'badInput';
  return 'generic';
}

function localMessage(input, lang) {
  const key = messageKey(input);
  const custom = override(input, key);
  if (custom) return custom;
  const entry = dictionaries[lang][key] || dictionaries[lang].generic;
  return typeof entry === 'function' ? entry(params(input)) : entry;
}

function getField(input) {
  return input.closest('.rui-field, [data-rui-field]');
}

function getMessage(field) {
  if (!field) return null;
  let message = field.querySelector('.rui-field__message, [data-rui-field-message]');
  if (!message) {
    message = document.createElement('span');
    message.className = 'rui-field__message';
    message.dataset.ruiFieldMessage = '';
    message.hidden = true;
    field.append(message);
  }
  if (!message.id) message.id = `rui-field-message-${++generatedId}`;
  return message;
}

function connectDescription(input, field, message) {
  const description = field?.querySelector('.rui-field__description, [data-rui-field-description]');
  if (description && !description.id) description.id = `rui-field-description-${++generatedId}`;
  const ids = [description?.id, message?.id].filter(Boolean);
  if (ids.length) input.setAttribute('aria-describedby', ids.join(' '));
}

function render(input, { force = false } = {}) {
  const form = input.form || input.closest('[data-rui-validate]');
  if (!form) return true;
  const field = getField(input);
  if (!field) return input.checkValidity();
  const message = getMessage(field);
  connectDescription(input, field, message);

  const serverError = input.dataset.ruiServerError || field.dataset.ruiServerError;
  input.setCustomValidity('');

  let text = '';
  let invalid = false;
  if (serverError) {
    text = serverError;
    invalid = true;
    input.setCustomValidity(text);
  } else if (!input.validity.valid && (force || input.dataset.ruiTouched === 'true')) {
    text = localMessage(input, languageFor(form));
    invalid = true;
    input.setCustomValidity(text);
  }

  field.dataset.invalid = String(invalid);
  field.dataset.valid = String(!invalid && input.value.length > 0);
  input.setAttribute('aria-invalid', String(invalid));

  if (message) {
    message.textContent = invalid ? text : '';
    message.hidden = !invalid;
    message.setAttribute('aria-live', invalid ? 'polite' : 'off');
  }

  return !invalid;
}

function clearServerError(input) {
  const field = getField(input);
  if (input.dataset.ruiServerErrorPersist === 'true' || field?.dataset.ruiServerErrorPersist === 'true') return;
  delete input.dataset.ruiServerError;
  if (field) delete field.dataset.ruiServerError;
}

export function initValidation(root = document) {
  root.querySelectorAll('[data-rui-validate]').forEach(form => {
    if (form.dataset.ruiValidationReady) return;
    form.dataset.ruiValidationReady = 'true';
    form.noValidate = true;

    const controls = [...form.querySelectorAll('input, textarea, select')]
      .filter(input => !['button', 'submit', 'reset', 'hidden'].includes(input.type));

    controls.forEach(input => {
      const field = getField(input);
      const message = getMessage(field);
      connectDescription(input, field, message);
      if (message && !input.dataset.ruiServerError && !field?.dataset.ruiServerError) {
        message.textContent = '';
        message.hidden = true;
      }
      if (input.dataset.ruiServerError || field?.dataset.ruiServerError) render(input, { force: true });
      else input.setAttribute('aria-invalid', 'false');
    });

    form.addEventListener('input', event => {
      const input = event.target;
      if (!controls.includes(input)) return;
      input.dataset.ruiTouched = 'true';
      clearServerError(input);
      render(input, { force: true });
    });

    form.addEventListener('change', event => {
      const input = event.target;
      if (!controls.includes(input)) return;
      input.dataset.ruiTouched = 'true';
      clearServerError(input);
      render(input, { force: true });
    });

    form.addEventListener('blur', event => {
      const input = event.target;
      if (!controls.includes(input)) return;
      input.dataset.ruiTouched = 'true';
      render(input, { force: true });
    }, true);

    form.addEventListener('reset', () => queueMicrotask(() => {
      controls.forEach(input => {
        input.setCustomValidity('');
        delete input.dataset.ruiTouched;
        const field = getField(input);
        if (field) {
          field.dataset.invalid = 'false';
          field.dataset.valid = 'false';
        }
        input.setAttribute('aria-invalid', 'false');
        const message = getMessage(field);
        if (message) {
          message.textContent = '';
          message.hidden = true;
        }
      });
    }));

    form.addEventListener('submit', event => {
      let firstInvalid = null;
      controls.forEach(input => {
        input.dataset.ruiTouched = 'true';
        if (!render(input, { force: true }) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid || !form.checkValidity()) {
        event.preventDefault();
        firstInvalid?.focus();
      }
    });
  });
}
