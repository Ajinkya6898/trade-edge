"use client";

import { NavLink } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ComponentType, SVGProps } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            return (
              <SidebarMenuItem key={item.title}>
                <NavLink to={item.url} end>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`${
                        isActive &&
                        "bg-primary text-white hover:bg-primary/90 hover:text-white"
                      }`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
