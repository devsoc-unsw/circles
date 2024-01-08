import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';

type IconType = ArgsProps['type'];

type Props = {
  type: IconType;
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
