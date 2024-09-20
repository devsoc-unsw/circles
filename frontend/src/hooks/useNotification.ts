import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { RootState } from 'config/store';
import { addNotification, closeNotification } from 'reducers/notificationsSlice';

type IconType = ArgsProps['type'];

type Notification = (notif: Props) => void;

type Props = {
  type: IconType;
  message: string;
  description?: React.ReactNode;
  duration?: number;
  icon?: React.ReactNode;
};

function useNotification(id: string, cooldown?: number, maxAppearances?: number): Notification {
  const dispatch = useDispatch();

  const { notifications } = useSelector((state: RootState) => state.notifications);

  const foundNotif = notifications.find((n) => n.id === id);

  const notifMaxAppearances = maxAppearances ?? -1;
  const notifCooldown = cooldown ?? 0;

  if (!foundNotif) {
    dispatch(
      addNotification({
        id,
        maxAppearances: notifMaxAppearances,
        cooldown: notifCooldown
      })
    );
  }

  const tryOpenNotification = useCallback(
    (notif: Props) => {
      if (foundNotif && foundNotif.maxAppearances === 0) {
        return;
      }

      if (foundNotif && foundNotif.nextNotificationTime > Date.now()) {
        return;
      }

      notif.duration = notif.duration ?? 5;

      notification.open({
        type: notif.type,
        message: notif.message,
        description: notif.description,
        duration: notif.duration,
        placement: 'bottomRight',
        icon: notif.icon,
        onClose: () => {
          dispatch(closeNotification(id));
        }
      });
    },
    [dispatch, foundNotif, id]
  );

  return tryOpenNotification;
}

export default useNotification;
