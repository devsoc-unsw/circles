import { notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

type Props = {
  type: NotificationType;
  message?: string;
  description?: string;
  duration?: number;
};

const openNotification = ({ type = 'info', message, description, duration = 5 }: Props) => {
  notification.open({
    type,
    message,
    description,
    duration,
    placement: 'bottomRight'
  });
};

export default openNotification;
