import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { HeaderActions } from './HeaderActions'

export function Header() {
  return (
    <header className="bg-navy sticky top-0 z-[300] shadow-[0_2px_20px_rgba(0,0,0,.3)]">
      {/* Full-width container — logo left edge, icons right edge, like Trendyol */}
      <div className="flex items-center gap-4 lg:gap-6 h-[68px] w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        <Logo />
        <SearchBar />
        <HeaderActions />
      </div>
    </header>
  )
}
