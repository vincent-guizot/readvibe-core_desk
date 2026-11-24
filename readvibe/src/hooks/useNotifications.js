'use client';

import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  setNotifications,
} from '../redux/slices/uiSlice';

export function useNotifications() {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const notify = useCallback(
    (payload) => {
      dispatch(addNotification(payload));
    },
    [dispatch]
  );

  const markAsRead = useCallback(
    (id) => {
      dispatch(markNotificationRead(id));
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  const removeNotification = useCallback(
    (id) => {
      dispatch(deleteNotification(id));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    notify,
    markAsRead,
    markAllAsRead,
    deleteNotification: removeNotification,
    clearAll,
    setNotifications: (list) => dispatch(setNotifications(list)),
  };
}

export default useNotifications;
