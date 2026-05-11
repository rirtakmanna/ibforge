// src/components/AvatarMenu.jsx
//
// Avatar trigger + 2-item dropdown menu (Brand System §AvatarMenu).
// Used by Layout on desktop and tablet (top-right) and mobile (top-left).
//
// Display:
//   variant="desktop" → photo/initials circle + first name to the left
//   variant="icon"    → photo/initials circle only (tablet + mobile)
//
// Accessibility:
//   - Trigger: <button aria-haspopup="true" aria-expanded={isOpen}>
//   - Menu: <ul role="menu"> with <li role="menuitem"> children
//   - Click outside closes (mousedown listener, cleaned up on unmount)
//   - Escape closes and returns focus to the trigger button
//   - Arrow Down / Arrow Up move focus between menu items
//   - Enter or Space activates the focused item
//
// Phase 1/2A: handlers call placeholder auth.js functions.
//   Logout       → signOut() → navigate to /login
//   Delete account → toast "not available yet"; Phase 3 wires real deletion + confirmation modal.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getCurrentUser, signOut, deleteAccount } from "@/utils/auth";
import "./AvatarMenu.css";

function getInitials(name) {
  if (!name || typeof name !== "string") return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(name) {
  if (!name || typeof name !== "string") return "";
  return name.trim().split(/\s+/)[0] || "";
}

function AvatarMenu({ variant = "desktop" }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const menuItems = [
    {
      key: "delete",
      label: "Delete account",
      destructive: true,
      onSelect: async () => {
        const result = await deleteAccount();
        if (!result.ok) {
          // Phase 3 replaces this with the real confirmation modal flow.
          // For now: surface via console + a lightweight alert. Toast component
          // arrives in a later phase; alert is the documented placeholder.
          // eslint-disable-next-line no-alert
          alert("Account deletion is not yet available.");
        }
      },
    },
    {
      key: "logout",
      label: "Log out",
      destructive: false,
      onSelect: async () => {
        await signOut();
        navigate("/login");
      },
    },
  ];

  // Click outside closes the menu.
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleMouseDown(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // When opening, focus the first item.
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      // Defer so the item is mounted.
      const id = requestAnimationFrame(() => {
        if (itemRefs.current[0]) itemRefs.current[0].focus();
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [isOpen]);

  function handleTriggerClick() {
    setIsOpen((prev) => !prev);
  }

  function handleTriggerKeyDown(event) {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  function handleMenuKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      if (triggerRef.current) triggerRef.current.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (focusedIndex + 1) % menuItems.length;
      setFocusedIndex(next);
      itemRefs.current[next]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = (focusedIndex - 1 + menuItems.length) % menuItems.length;
      setFocusedIndex(prev);
      itemRefs.current[prev]?.focus();
      return;
    }
    if (event.key === "Tab") {
      setIsOpen(false);
    }
  }

  async function handleItemActivate(item) {
    setIsOpen(false);
    await item.onSelect();
  }

  function handleItemKeyDown(event, item) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleItemActivate(item);
    }
  }

  const hasPhoto = Boolean(user?.photoURL);
  const initials = getInitials(user?.displayName);
  const firstName = getFirstName(user?.displayName);
  const showName = variant === "desktop";

  return (
    <div ref={containerRef} className={`avatar-menu avatar-menu--${variant}`}>
      <button
        ref={triggerRef}
        type="button"
        className="avatar-menu-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Account menu for ${user?.displayName || "Operator"}`}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {showName && firstName && (
          <span className="avatar-menu-name">{firstName}</span>
        )}
        <span className="avatar-menu-photo" aria-hidden="true">
          {hasPhoto ? (
            <img src={user.photoURL} alt="" />
          ) : (
            <span className="avatar-menu-initials">{initials}</span>
          )}
        </span>
        {showName && (
          <ChevronDown
            className={`avatar-menu-chevron${isOpen ? " is-open" : ""}`}
            aria-hidden="true"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="avatar-menu-dropdown"
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            onKeyDown={handleMenuKeyDown}
          >
            {menuItems.map((item, index) => (
              <li key={item.key} role="none" className="avatar-menu-item-row">
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  className={`avatar-menu-item${
                    item.destructive ? " is-destructive" : ""
                  }`}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onClick={() => handleItemActivate(item)}
                  onKeyDown={(e) => handleItemKeyDown(e, item)}
                  onFocus={() => setFocusedIndex(index)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AvatarMenu;
