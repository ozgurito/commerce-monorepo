'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, Users, ShieldCheck, User } from 'lucide-react'
import { adminApi } from '@/domains/admin/admin.api'
import { useDebounce } from '@/hooks/useDebounce'

export default function AdminKullanicilarPage() {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, debouncedKeyword],
    queryFn: () => adminApi.getUsers(page, 20, debouncedKeyword || undefined),
  })

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Kullanıcılar</h1>
        {data && (
          <span className="text-sm text-gray-400">
            Toplam {data.totalElements} kullanıcı
          </span>
        )}
      </div>

      {/* Arama */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(0) }}
          placeholder="E-posta veya ad ile ara…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm
                     focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20"
        />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-orange animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Kullanıcı</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Telefon</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Rol</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center
                                      flex-shrink-0 text-sm font-bold text-orange">
                        {u.fullName?.charAt(0)?.toUpperCase() ?? u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-navy-dark">
                          {u.fullName || <span className="text-gray-400 italic">İsimsiz</span>}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5
                                       rounded-full bg-orange/10 text-orange">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5
                                       rounded-full bg-gray-100 text-gray-500">
                        <User size={11} /> Kullanıcı
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
