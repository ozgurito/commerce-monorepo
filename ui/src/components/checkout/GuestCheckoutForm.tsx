'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { AddressForm } from './AddressForm'
import type { Address } from '@/domains/orders/orders.types'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
})

interface GuestData {
  email: string
  address: Address
}

interface Props {
  onSubmit: (data: GuestData) => void
  isLoading?: boolean
}

export function GuestCheckoutForm({ onSubmit, isLoading }: Props) {
  const [email, setEmail] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  })

  const handleEmail = ({ email }: { email: string }) => setEmail(email)

  const handleAddress = (address: Address) => {
    if (!email) return
    onSubmit({ email, address })
  }

  if (!email) {
    return (
      <div className="space-y-5">
        <div className="bg-navy-50 rounded-xl p-4 text-sm text-navy-dark">
          <p className="font-bold mb-1">Misafir olarak devam ediyorsunuz</p>
          <p className="text-gray-600">
            Siparişinizi takip etmek için e-posta adresinize onay gönderilecektir.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleEmail)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              E-posta Adresi *
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="ornek@email.com"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none
                          focus:ring-1 transition-colors
                          ${errors.email
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                            : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-orange hover:bg-orange-dark text-white font-bold
                       py-3.5 rounded-xl transition-colors"
          >
            Devam Et
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Hesabınız var mı?{' '}
          <Link href="/giris?redirect=/odeme" className="text-orange font-semibold hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-green-50 border border-green-200
                      rounded-xl px-4 py-2.5">
        <span className="text-sm text-green-700">
          <span className="font-bold">E-posta:</span> {email}
        </span>
        <button
          onClick={() => setEmail(null)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Değiştir
        </button>
      </div>

      <h3 className="font-bold text-navy-dark">Teslimat Adresi</h3>
      <AddressForm
        onSubmit={handleAddress}
        isLoading={isLoading}
        submitLabel="Ödemeye Geç"
      />
    </div>
  )
}
