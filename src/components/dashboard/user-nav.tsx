"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, User, Shield } from "lucide-react";
import { LogoutModal } from "./logout-modal";

type UserNavProps = {
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = (user.name || user.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative flex items-center" ref={menuRef}>
        {/* User profile dropdown trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full p-0.5 text-left transition hover:ring-2 hover:ring-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User account menu"
        >
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#24352f] text-sm font-semibold text-white ring-1 ring-black/10">
            {initials}
          </div>
          <ChevronDown
            className={`hidden size-4 text-white/80 transition-transform sm:block ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-stone-200 bg-white p-1 text-zinc-900 shadow-xl ring-1 ring-black/5 z-50">
            <div className="border-b border-stone-100 px-3.5 py-3">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {user.name}
              </p>
              {user.email && (
                <p className="truncate text-xs text-zinc-500 mt-0.5">
                  {user.email}
                </p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                <Shield className="size-3 text-stone-500" />
                {user.role}
              </span>
            </div>

            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutModal(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus:bg-red-50 focus:outline-none"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}

