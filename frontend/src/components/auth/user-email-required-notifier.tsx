import { useEffect, useState } from 'react';

import { UpdateUserEmailDialog } from '@/components/auth/update-user-email-dialog';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { userNeedsEmail } from '@/lib/user-email';

export function UserEmailRequiredNotifier() {
  const { data: user } = useWebSession();
  const [open, setOpen] = useState(false);
  const needsEmail = userNeedsEmail(user);

  useEffect(() => {
    if (needsEmail) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [needsEmail]);

  if (!needsEmail || !user) {
    return null;
  }

  return (
    <UpdateUserEmailDialog
      open={open}
      required
      currentEmail={user.email}
      onOpenChange={setOpen}
    />
  );
}
