import { notification } from 'antd';
import type { IconType } from 'antd/lib/notification';

type Props = {
  type: IconType
  message?: string
  description?: string
  duration?: number
};

const openNotification = ({
  type = 'info', message, description, duration = 5,
}: Props) => {
  notification.open({
    type,
    message,
    description,
    duration,
    placement: 'bottomRight',
  });
};

export default openNotification;
