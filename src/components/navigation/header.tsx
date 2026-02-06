import React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Link } from 'react-router';
import { ModeToggle } from '@/components/mode-toggle';
import Status from '@/components/status';
import { APP_NAME } from '@/lib/constants';

function Header() {
  return (
    <div className="flex flex-row items-center justify-between border-b-1 border-slate-500 p-2">
      <Link to="/"><h1>{APP_NAME}</h1></Link>
      <NavigationMenu title="Trove" >
        <NavigationMenuList>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Status />
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/settings">Settings</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <ModeToggle />
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export default Header;