import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const inputId = id || props.name
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label-field">
          {label}
        </label>
      )}
      <input ref={ref} id={inputId} className={cn('input-field', error && 'border-red-400 focus:ring-red-200', className)} {...props} />
      {hint && !error && <p className="mt-1 text-xs text-espresso-300">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id || props.name
  return (
    <div>
      {label && <label htmlFor={inputId} className="label-field">{label}</label>}
      <textarea ref={ref} id={inputId} className={cn('input-field min-h-[120px] resize-y', className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props },
  ref,
) {
  const inputId = id || props.name
  return (
    <div>
      {label && <label htmlFor={inputId} className="label-field">{label}</label>}
      <select ref={ref} id={inputId} className={cn('input-field appearance-none bg-white', className)} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
