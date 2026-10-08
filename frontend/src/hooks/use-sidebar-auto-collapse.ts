import { useEffect } from 'react';

import { useSidebar } from '@/components/ui/sidebar';

type UseSidebarAutoCollapseOptions = {
  enabled?: boolean;
  locked?: boolean;
};

export function useSidebarAutoCollapse({
  enabled = true,
  locked = false,
}: UseSidebarAutoCollapseOptions = {}) {
  const { setOpen, setOpenMobile, setLocked } = useSidebar();

  useEffect(() => {
    if (!enabled) {
      if (locked) {
        setLocked(false);
      }

      return;
    }

    setOpen(false);
    setOpenMobile(false);

    if (locked) {
      setLocked(true);
    }

    return () => {
      if (locked) {
        setLocked(false);
      }
    };
  }, [enabled, locked, setLocked, setOpen, setOpenMobile]);
}
