import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { AppHeader } from "./AppHeader";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
}

const MobileLayout = ({ children, showNav = true, showHeader = true }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative flex flex-col">
      {showHeader && <AppHeader />}
      <div className={showNav ? "safe-bottom flex-1 min-h-0" : "flex-1 min-h-0"}>{children}</div>
      {showNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;
