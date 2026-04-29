'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Address } from '@/domains/orders/orders.types'

const schema = z.object({
  fullName:    z.string().min(3, 'Ad Soyad en az 3 karakter'),
  phone:       z.string().regex(/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası girin'),
  city:        z.string().min(2, 'Şehir gerekli'),
  district:    z.string().min(2, 'İlçe gerekli'),
  addressLine: z.string().min(10, 'Adres en az 10 karakter olmalı'),
  postalCode:  z.string().optional(),
  country:     z.string().min(1),
})

export type AddressFormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<AddressFormValues>
  onSubmit: (values: Address) => void
  submitLabel?: string
  isLoading?: boolean
}

function Field({
  label, error, children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
     : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

export function AddressForm({ defaultValues, onSubmit, submitLabel = 'Devam Et', isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Türkiye', ...defaultValues },
  })

  const submit = (values: AddressFormValues) => {
    onSubmit({
      fullName:    values.fullName,
      phone:       values.phone,
      city:        values.city,
      district:    values.district,
      addressLine: values.addressLine,
      postalCode:  values.postalCode ?? '',
      country:     values.country ?? 'Türkiye',
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ad Soyad *" error={errors.fullName?.message}>
          <input {...register('fullName')} placeholder="Ad Soyad"
            className={inputCls(!!errors.fullName)} />
        </Field>
        <Field label="Telefon *" error={errors.phone?.message}>
          <input {...register('phone')} placeholder="05XX XXX XX XX"
            className={inputCls(!!errors.phone)} type="tel" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Şehir *" error={errors.city?.message}>
          <input {...register('city')} placeholder="İstanbul"
            className={inputCls(!!errors.city)} />
        </Field>
        <Field label="İlçe *" error={errors.district?.message}>
          <input {...register('district')} placeholder="Kadıköy"
            className={inputCls(!!errors.district)} />
        </Field>
      </div>

      <Field label="Adres *" error={errors.addressLine?.message}>
        <textarea {...register('addressLine')} placeholder="Mahalle, sokak, bina ve daire no"
          rows={3} className={inputCls(!!errors.addressLine)} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Posta Kodu" error={errors.postalCode?.message}>
          <input {...register('postalCode')} placeholder="34000"
            className={inputCls(!!errors.postalCode)} />
        </Field>
        <Field label="Ülke">
          <input {...register('country')} defaultValue="Türkiye"
            className={inputCls()} readOnly />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange hover:bg-orange-dark text-white font-bold py-3.5
                   rounded-xl transition-colors disabled:opacity-60"
      >
        {isLoading ? 'Kaydediliyor…' : submitLabel}
      </button>
    </form>
  )
}
