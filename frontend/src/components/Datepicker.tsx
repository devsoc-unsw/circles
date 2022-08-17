import generatePicker from 'antd/es/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
// fuck this code
// https://ant.design/docs/react/replace-moment
const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export default DatePicker;
