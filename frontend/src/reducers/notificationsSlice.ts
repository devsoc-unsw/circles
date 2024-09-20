import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type NotificationDefinition = {
  id: string;
  maxAppearances: number;
  cooldown: number;
};

export type NotificationType = {
  id: string;
  maxAppearances: number;
  cooldown: number;
  nextNotificationTime: number;
};

export type NotificationsState = {
  notifications: Array<NotificationType>;
};

export const initialNotificationsState: NotificationsState = {
  notifications: [] // list of notifications
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: initialNotificationsState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationDefinition>) => {
      const actionNotif: NotificationDefinition = action.payload;
      const foundNotifIndex: number = state.notifications.findIndex(
        (notif) => notif.id === actionNotif.id
      );

      const newNotif: NotificationType = {
        ...actionNotif,
        nextNotificationTime: Date.now() + actionNotif.cooldown * 1000
      };

      if (foundNotifIndex === -1) {
        state.notifications.push(newNotif);
      }
    },
    closeNotification: (state, action: PayloadAction<string>) => {
      const notificationId: string = action.payload;
      const foundNotifIndex: number = state.notifications.findIndex(
        (notif) => notif.id === notificationId
      );

      if (foundNotifIndex !== -1 && state.notifications[foundNotifIndex].maxAppearances > 0) {
        state.notifications[foundNotifIndex].nextNotificationTime =
          Date.now() + state.notifications[foundNotifIndex].cooldown * 1000;
        if (state.notifications[foundNotifIndex].maxAppearances > 0) {
          state.notifications[foundNotifIndex].maxAppearances -= 1;
        }
      }
    }
  }
});

export const { addNotification, closeNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
