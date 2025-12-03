import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select Option',
  label,
  icon: Icon,
  required = false,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2 w-full">
          {Icon && <Icon className="w-4 h-4 text-orange-500" />}
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </label>
      )}
      
      {/* Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 text-sm font-medium flex items-center justify-between ${
          disabled
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : isOpen
            ? 'border-orange-500 bg-white text-gray-700 shadow-lg shadow-orange-200/50'
            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:shadow-md'
        }`}
      >
        <span className={`flex items-center space-x-2 truncate ${!selectedOption ? 'text-gray-400' : ''}`}>
          {selectedOption ? (
            <>
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex-shrink-0"></span>
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180 text-orange-500' : ''
          } ${disabled ? '' : 'group-hover:text-orange-500'}`}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-orange-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center justify-between group ${
                    value === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-orange-500 text-white font-semibold shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50 hover:text-orange-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        value === option.value
                          ? 'bg-white'
                          : 'bg-gradient-to-r from-orange-400 to-orange-500'
                      }`}
                    ></span>
                    <span className="text-sm truncate">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <Check className="w-5 h-5 text-white flex-shrink-0 ml-2 animate-in zoom-in duration-200" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

