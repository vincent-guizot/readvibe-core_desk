'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  markNotificationRead,
  clearAllNotifications,
} from '../redux/slices/uiSlice';

export function useNotifications() {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead: (id) => dispatch(markNotificationRead(id)),
    clearAll: () => dispatch(clearAllNotifications()),
  };
}

export default useNotifications;
