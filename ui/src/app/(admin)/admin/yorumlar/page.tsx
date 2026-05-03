'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Check, Trash2, Loader2, MessageSquare, X, XCircle, Reply } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import type { ReviewDto } from '@/domains/reviews/reviews.types'

const FILTER_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'false', label: 'Onay Bekliyor' },
  { value: 'true',  label: 'Onaylı' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

interface ReplyModalProps {
  review: ReviewDto
  onClose: () => void
  onSave: (response: string) => void
  isLoading: boolean
}

function ReplyModal({ review, onClose, onSave, isLoading }: ReplyModalProps) {
  const [response, setResponse] = useState(review.adminResponse ?? '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <h3 className="font-extrabold text-navy-dark text-lg mb-1">Admin Yanıtı</h3>
        <p className="text-xs text-gray-400 mb-4">
          <strong>{review.userName}</strong> — {review.productName}
        </p>
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600 italic">
          &ldquo;{review.comment}&rdquo;
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={4}
          placeholder="Yoruma yanıt yazın…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none
                     focus:ring-1 focus:border-orange focus:ring-orange/20 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">
            İptal
          </button>
          <button
            onClick={() => onSave(response)}
            disabled={isLoading || !response.trim()}
            className="flex-1 bg-orange hover:bg-orange-dark text-white font-bold py-2.5
                       rounded-xl transition-colors disabled:opacity-60 text-sm
                       flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Yanıtı Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminYorumlarPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [approvedFilter, setApprovedFilter] = useState('')
  const [replyTarget, setReplyTarget] = useState<ReviewDto | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page, approvedFilter],
    queryFn: () =>
      adminApi.getReviews(page, 20, approvedFilter === '' ? undefined : approvedFilter === 'true'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Yorum onaylandı')
    },
    onError: () => toast.error('İşlem başarısız'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Yorum reddedildi')
    },
    onError: () => toast.error('İşlem başarısız'),
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      adminApi.respondToReview(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      setReplyTarget(null)
      toast.success('Yanıt kaydedildi')
    },
    onError: () => toast.error('Yanıt kaydedilemedi'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Yorum silindi')
    },
  })

  const reviews = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Yorumlar</h1>
        <select
          value={approvedFilter}
          onChange={(e) => { setApprovedFilter(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20"
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="text-orange animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Yorum bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id}
              className={`bg-white rounded-2xl border p-5
                ${!review.approved ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StarRating rating={review.rating} />
                    {!review.approved && (
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                        Onay Bekliyor
                      </span>
                    )}
                    {review.verifiedPurchase && (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Doğrulanmış Alış
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    <strong className="text-gray-700">{review.userName}</strong>
                    {' · '}{review.productName}
                    {' · '}{new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  {review.title && (
                    <p className="text-sm font-bold text-navy-dark mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  )}
                  {review.adminResponse && (
                    <div className="mt-3 bg-orange/5 border border-orange/20 rounded-xl px-3 py-2">
                      <p className="text-xs font-bold text-orange mb-0.5">Admin Yanıtı</p>
                      <p className="text-xs text-gray-600">{review.adminResponse}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!review.approved && (
                    <button
                      onClick={() => approveMutation.mutate(review.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1 text-xs font-bold text-green-600
                                 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors
                                 disabled:opacity-60"
                    >
                      <Check size={12} /> Onayla
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => rejectMutation.mutate(review.id)}
                      disabled={rejectMutation.isPending}
                      className="flex items-center gap-1 text-xs font-bold text-red-500
                                 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors
                                 disabled:opacity-60"
                    >
                      <XCircle size={12} /> Reddet
                    </button>
                  )}
                  <button
                    onClick={() => setReplyTarget(review)}
                    className="p-1.5 text-gray-400 hover:text-orange hover:bg-orange/10
                               rounded-lg transition-colors"
                    title="Yanıt yaz"
                  >
                    <Reply size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu yorum silinsin mi?')) deleteMutation.mutate(review.id)
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                               rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors">
            Önceki
          </button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors">
            Sonraki
          </button>
        </div>
      )}

      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          isLoading={respondMutation.isPending}
          onSave={(response) => respondMutation.mutate({ id: replyTarget.id, response })}
        />
      )}
    </div>
  )
}
