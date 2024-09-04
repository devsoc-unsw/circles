import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { RootState } from 'config/store';
import { addNotification, closeNotification } from 'reducers/notificationsSlice';

type IconType = ArgsProps['type'];

type Notification = {
  tryOpenNotification: () => void;
};

type Props = {
  name: string;
  type: IconType;
  message: string;
  description?: React.ReactNode;
  cooldown?: number;
  clicksTillExpire?: number;
  duration?: number;
  icon?: React.ReactNode;
};

function useNotification(notif: Props): Notification {
  const dispatch = useDispatch();

  const { notifications } = useSelector((state: RootState) => state.notifications);

  const tryOpenNotification = useCallback(() => {
    const foundNotif = notifications.find((n) => n.name === notif.name);

    if (foundNotif && foundNotif.clicksTillExpire === 0) {
      return;
    }

    if (foundNotif && foundNotif.nextNotificationTime > Date.now()) {
      return;
    }

    notif.clicksTillExpire = notif.clicksTillExpire || -1;
    notif.cooldown = notif.cooldown || 5;
    notif.duration = notif.duration || 5;

    notification.open({
      type: notif.type,
      message: notif.message,
      description: notif.description,
      duration: notif.duration,
      placement: 'bottomRight',
      icon: notif.icon,
      onClose: () => {
        dispatch(closeNotification(notif.name));
      }
    });

    dispatch(
      addNotification({
        name: notif.name,
        clicksTillExpire: notif.clicksTillExpire,
        cooldown: notif.cooldown,
        nextNotificationTime: Date.now() + notif.cooldown * 1000
      })
    );
  }, [dispatch, notif, notifications]);

  return {
    tryOpenNotification
  };
}

export default useNotification;
