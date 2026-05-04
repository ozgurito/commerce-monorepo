'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, Search, ChevronLeft, ChevronRight, Loader2,
  UserCheck, UserX, LockOpen, CheckCircle2, XCircle, Mail,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import type { UserDto } from '@/domains/user/user.types'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string | null): string {
  if (!iso) return 'Hiç giriş yapmadı'
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const ROLE_CLS: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 border border-red-200',
  USER:  'bg-blue-50 text-blue-700 border border-blue-200',
}

export default function AdminKullanicilarPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => adminApi.getUsers(page, 20),
    placeholderData: (prev) => prev,
  })

  const toggleActiveMut = useMutation({
    mutationFn: (id: number) => adminApi.toggleUserActive(id),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(u.isActive ? 'Hesap aktif edildi' : 'Hesap askıya alındı')
    },
    onError: () => toast.error('İşlem başarısız'),
  })

  const changeRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => adminApi.changeUserRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Rol güncellendi')
    },
    onError: () => toast.error('Rol güncellenemedi'),
  })

  const unlockMut = useMutation({
    mutationFn: (id: number) => adminApi.unlockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Hesap kilidi kaldırıldı')
    },
    onError: () => toast.error('Kilit açılamadı'),
  })

  const users: UserDto[] = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  const filtered = search.trim()
    ? users.filter(u =>
        (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.fullName ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users

  const isPending = toggleActiveMut.isPending || changeRoleMut.isPending || unlockMut.isPending

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-dark flex items-center gap-2">
            <Users size={22} className="text-orange" />
            Kullanıcılar
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Toplam {totalElements.toLocaleString('tr-TR')} kayıtlı kullanıcı
          </p>
        </div>
      </div>

      {/* Arama */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Ad veya e-posta ara…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange"
        />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="text-orange animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Kullanıcı', 'Rol', 'Durum', 'Son Giriş', 'Kayıt', ''].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider
                                  ${h === 'Son Giriş' || h === 'Kayıt' ? 'hidden lg:table-cell' : ''}
                                  ${h === 'Durum' ? 'hidden md:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => {
                  const initials = (user.fullName ?? user.email ?? '?')
                    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Kullanıcı */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                           text-xs font-extrabold flex-shrink-0
                                           ${user.isActive ? 'bg-orange/10 text-orange' : 'bg-gray-100 text-gray-400'}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-dark truncate">
                              {user.fullName || <span className="text-gray-400 italic">İsimsiz</span>}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                              <Mail size={10} />{user.email ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rol — select ile değiştirilebilir */}
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={e => changeRoleMut.mutate({ id: user.id, role: e.target.value })}
                          disabled={isPending}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer
                                       focus:outline-none focus:ring-1 focus:ring-orange appearance-none
                                       ${ROLE_CLS[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          <option value="USER">Kullanıcı</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>

                      {/* Durum */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                              <CheckCircle2 size={11} className="text-green-500" />Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                              <XCircle size={11} className="text-red-500" />Askıda
                            </span>
                          )}
                          {user.emailVerified ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <CheckCircle2 size={9} className="text-green-400" />E-posta doğrulandı
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 flex items-center gap-1">
                              <XCircle size={9} />E-posta doğrulanmadı
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Son giriş */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-gray-500">{formatDateTime(user.lastLoginAt)}</p>
                      </td>

                      {/* Kayıt */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                      </td>

                      {/* Aksiyonlar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => toggleActiveMut.mutate(user.id)}
                            disabled={isPending}
                            title={user.isActive ? 'Hesabı askıya al' : 'Hesabı aktif et'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                                        disabled:opacity-50
                                        ${user.isActive
                                          ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                                          : 'text-green-500 hover:bg-green-50 hover:text-green-700'}`}
                          >
                            {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          <button
                            onClick={() => unlockMut.mutate(user.id)}
                            disabled={isPending}
                            title="Brute-force kilidini kaldır"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-500
                                       hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-50"
                          >
                            <LockOpen size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Sayfa {page + 1} / {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
