'use client'
import { useState } from 'react'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

const INITIAL: FormState = { name: '', email: '', subject: '', message: '' }

const SUBJECTS = [
  'Sipariş & Kargo',
  'İade & Değişim',
  'Ürün Bilgisi',
  'Ödeme Sorunu',
  'Teknik Destek',
  'Diğer',
]

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none ' +
  'focus:ring-1 focus:border-orange focus:ring-orange/20 transition-colors'

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }
    setLoading(true)
    // Gerçek bir mail servisi entegre edilene kadar simüle ediyoruz
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
    toast.success('Mesajınız alındı, en geç 24 saat içinde yanıt vereceğiz.')
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="font-extrabold text-navy-dark text-lg">Mesajınız İletildi!</h3>
        <p className="text-sm text-gray-500">
          En geç <strong>24 saat</strong> içinde{' '}
          <span className="text-orange font-semibold">{form.email}</span> adresinize
          yanıt göndereceğiz.
        </p>
        <button
          onClick={() => { setForm(INITIAL); setSent(false) }}
          className="text-sm text-orange hover:text-orange-dark font-semibold transition-colors"
        >
          Yeni mesaj gönder
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-extrabold text-navy-dark text-lg">Bize Yazın</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Ad Soyad <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Adınız Soyadınız"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            E-posta <span className="text-red-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ornek@mail.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Konu</label>
        <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
          <option value="">Konu seçin</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">
          Mesajınız <span className="text-red-400">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Mesajınızı buraya yazın…"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                   text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Gönderiliyor…</>
          : <><Send size={16} /> Mesajı Gönder</>}
      </button>
    </form>
  )
}
