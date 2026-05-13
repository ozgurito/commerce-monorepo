import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { HeaderActions } from './HeaderActions'

export function Header() {
  return (
    <header className="bg-navy sticky top-0 z-[300] shadow-[0_2px_20px_rgba(0,0,0,.3)]">
      {/* 3-col grid: logo | search (centered) | actions */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-5 h-[68px] w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <Logo />
        <div className="flex justify-center">
          <SearchBar />
        </div>
        <HeaderActions />
      </div>
    </header>
  )
}
