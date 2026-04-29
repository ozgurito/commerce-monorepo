export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Gün 9'da: <AccountSidebar /> buraya gelecek */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
