import React from 'react';
import { AlertCircle } from 'lucide-react';
import { validationRules } from '../../utils/validation';

const FormField = ({ field, register, error }) => {
  const { name, label, type, required, placeholder, maxLength, rows, options } = field;

  const renderInput = () => {
    const validationRule = validationRules[name] || {};
    const commonProps = {
      ...register(name, validationRule),
      className: `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-colors ${
        error ? 'border-error-red' : 'border-gray-300'
      }`
    };

    if (type === 'select') {
      return (
        <select
          {...commonProps}
          className={`${commonProps.className} bg-white pr-10 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-[position:calc(100%-12px)_center]`}
        >
          <option value="">{placeholder}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={rows || 3}
          className={`${commonProps.className} resize-vertical`}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      );
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-center space-x-3">
          <input
            {...register(name, validationRule)}
            type="checkbox"
            className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-2 focus:ring-primary-blue"
          />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
      );
    }

    return (
      <input
        {...commonProps}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    );
  };

  return (
    <div className="space-y-2">
      {type !== 'checkbox' && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-red ml-1">*</span>}
        </label>
      )}

      {renderInput()}

      {error && (
        <div className="flex items-center space-x-1 text-error-red text-sm">
          <AlertCircle size={16} />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default FormField; 