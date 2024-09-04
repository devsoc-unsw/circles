import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type NotificationType = {
  name: string;
  clicksTillExpire: number;
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
    addNotification: (state, action: PayloadAction<NotificationType>) => {
      const actionNotif: NotificationType = action.payload;
      const foundNotifIndex: number = state.notifications.findIndex(
        (notif) => notif.name === actionNotif.name
      );

      if (foundNotifIndex === -1) {
        state.notifications.push(action.payload);
      }
    },
    closeNotification: (state, action: PayloadAction<string>) => {
      const notificationName: string = action.payload;
      const foundNotifIndex: number = state.notifications.findIndex(
        (notif) => notif.name === notificationName
      );

      if (foundNotifIndex !== -1 && state.notifications[foundNotifIndex].clicksTillExpire > 0) {
        state.notifications[foundNotifIndex].nextNotificationTime =
          Date.now() + state.notifications[foundNotifIndex].cooldown * 1000;
        if (state.notifications[foundNotifIndex].clicksTillExpire > 0) {
          state.notifications[foundNotifIndex].clicksTillExpire -= 1;
        }
      }
    }
  }
});

export const { addNotification, closeNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
