'use client'
import { Check } from 'lucide-react'

export interface WizardStep {
  label: string
  description?: string
}

interface Props {
  steps: WizardStep[]
  current: number // 0-indexed
  maxReached: number // furthest step already unlocked
  onStepClick?: (index: number) => void
}

export function ProductWizardStepper({ steps, current, maxReached, onStepClick }: Props) {
  return (
    <nav className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex sm:flex-col overflow-x-auto sm:overflow-visible gap-1 sm:gap-0">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const clickable = !!onStepClick && i <= maxReached

        return (
          <button
            key={step.label}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepClick?.(i)}
            className={`shrink-0 sm:w-full flex items-start gap-3 text-left px-2 py-2.5 rounded-xl transition-colors
                        ${active ? 'bg-orange/5' : ''}
                        ${clickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
          >
            <div className="flex sm:flex-col items-center">
              <div
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                            ${done
                              ? 'bg-green-500 text-white'
                              : active
                                ? 'bg-orange text-white'
                                : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-0.5 h-8 mt-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pt-0.5 min-w-0">
              <div className={`text-sm font-bold whitespace-nowrap sm:whitespace-normal
                                ${active ? 'text-orange' : done ? 'text-navy-dark' : 'text-gray-400'}`}>
                {step.label}
              </div>
              {step.description && (
                <div className="hidden sm:block text-[11px] text-gray-400 mt-0.5">{step.description}</div>
              )}
            </div>
          </button>
        )
      })}
    </nav>
  )
}
