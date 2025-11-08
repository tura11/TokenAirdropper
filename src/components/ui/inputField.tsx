import React from 'react'

interface InputFormProps {
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  multiline?: boolean
  rows?: number
  disabled?: boolean
  error?: string
}

export function InputForm({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  multiline = false,
  rows = 4,
  disabled = false,
  error 
}: InputFormProps) {
  const baseClasses = "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${baseClasses} font-mono text-sm resize-y min-h-[100px]`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClasses}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}