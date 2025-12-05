import React from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { validationRules } from '../../utils/validation';

const FormField = ({ field, register, error, customValidation }) => {
  const { name, label, type, required, placeholder, maxLength, rows, options, optgroups } = field;

  const renderInput = () => {
    const validationRule = customValidation || validationRules[name] || {};

    // 统一所有字段样式，确保一致的显示效果
    const commonProps = {
      ...register(name, validationRule),
      className: `w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-colors ${
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
          {optgroups ? (
            optgroups.map((group, groupIndex) => (
              <optgroup key={groupIndex} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))
          ) : (
            options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          )}
        </select>
      );
    }

    if (type === 'date') {
      const dateInputProps = {
        ...commonProps,
        className: `${commonProps.className} appearance-none bg-white pr-12 text-gray-900 [color-scheme:light] custom-date-input`
      };

      const handleDateInteraction = (event) => {
        // Keep native picker while allowing custom styling
        if (event.currentTarget.showPicker) {
          event.currentTarget.showPicker();
        }
      };

      return (
        <div className="relative">
          <input
            {...dateInputProps}
            type="date"
            placeholder={placeholder || 'Select date'}
            onClick={(event) => handleDateInteraction(event)}
            onKeyDown={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                handleDateInteraction(event);
              }
            }}
          />
          <Calendar
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      );
    }

    if (type === 'radio') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {options?.map((option) => (
            <label key={option.value} className="cursor-pointer block">
              <input
                {...register(name, validationRule)}
                type="radio"
                value={option.value}
                className="sr-only peer"
              />
              <div
                className={`w-full rounded-lg border px-4 py-3 text-sm font-medium text-center transition-all shadow-sm ${
                  error
                    ? 'border-error-red bg-red-50 text-error-red'
                    : 'border-gray-300 bg-white text-gray-700 peer-checked:bg-blue-50 peer-checked:border-primary-blue peer-checked:text-primary-blue'
                }`}
              >
                {option.label}
              </div>
            </label>
          ))}
        </div>
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
        <div className="flex items-center space-x-1 text-error-red text-sm text-left">
          <AlertCircle size={16} />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default FormField; 
