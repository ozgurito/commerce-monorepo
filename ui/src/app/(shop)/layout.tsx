export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Gün 2'de: <Header /> ve <Footer /> buraya gelecek */}
      <main className="flex-1">{children}</main>
    </>
  )
}
