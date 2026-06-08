import React, { useEffect, useMemo, useState } from 'react';
import { message, Modal, Select, Typography } from 'antd';
import { isAxiosError } from 'axios';
import { useAutoplanCoursesMutation, useUserPlanner } from 'utils/apiHooks/user';
import openNotification from 'utils/openNotification';
import S from './styles';

const { Text } = Typography;

type Props = {
  open: boolean;
  onCancel: () => void;
};

const TERM_LABELS = ['T0', 'T1', 'T2', 'T3'];

type APIErrorPayload = {
  detail?: string;
};

const AutoplanModal = ({ open, onCancel }: Props) => {
  const plannerQuery = useUserPlanner();

  const planner = plannerQuery.data;

  const autoplanMutation = useAutoplanCoursesMutation();

  const [selectedEndTerm, setSelectedEndTerm] = useState<string>('');

  const endTermOptions = useMemo(() => {
    if (!planner) {
      return [];
    }

    return planner.years.flatMap((_, rowIndex) => {
      const year = planner.startYear + rowIndex;
      return [0, 1, 2, 3].map((termIndex) => ({
        value: `${year}-${termIndex}`,
        label: `${year} ${TERM_LABELS[termIndex]}`
      }));
    });
  }, [planner]);

  useEffect(() => {
    if (!open || !planner) {
      return;
    }

    const lastYear = planner.startYear + planner.years.length - 1;
    setSelectedEndTerm(`${lastYear}-3`);
  }, [open, planner]);

  const handleSubmit = () => {
    if (!planner || planner.unplanned.length === 0) {
      message.error(
        'All courses are currently planned. Unplan one or more courses first to use Autoplan.'
      );
      return;
    }

    if (selectedEndTerm.length === 0) {
      message.error('Select an end term for autoplan.');
      return;
    }

    const split = selectedEndTerm.split('-');
    if (split.length !== 2) {
      message.error('Invalid end term selected.');
      return;
    }

    const [endYear, endTerm] = split.map(Number);

    if (Number.isNaN(endYear) || Number.isNaN(endTerm)) {
      message.error('Invalid end term selected.');
      return;
    }

    autoplanMutation.mutate(
      {
        endTime: [endYear, endTerm]
      },
      {
        onSuccess: () => {
          openNotification({
            type: 'success',
            message: 'Autoplan complete',
            description: (
              <S.NotificationSpan>
                Your planner has been updated. This generated a possible plan you can create using
                your selected end date, but you can continue dragging courses to fit your needs, or
                redo your plan with an earlier end date.
              </S.NotificationSpan>
            )
          });
          onCancel();
        },
        onError: (error) => {
          const detail = isAxiosError<APIErrorPayload>(error)
            ? (error.response?.data?.detail ??
              'No feasible plan was found for the selected courses and constraints.')
            : 'No feasible plan was found for the selected courses and constraints.';

          openNotification({
            type: 'error',
            message: 'Could not generate a plan',
            description: <S.NotificationSpan>{detail}</S.NotificationSpan>
          });
        }
      }
    );
  };

  return (
    <Modal
      title="Autoplan Courses"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Generate Plan"
      confirmLoading={autoplanMutation.isPending}
      destroyOnClose
    >
      <Text>
        Autoplan will place all currently unplanned courses into your planner up to the term you
        select.
      </Text>

      <S.EndTermLabel>Plan up to term</S.EndTermLabel>
      <S.EndTermSelectWrapper>
        <Select
          placeholder="Select end term"
          value={selectedEndTerm}
          onChange={(value) => setSelectedEndTerm(value)}
          options={endTermOptions}
        />
      </S.EndTermSelectWrapper>
    </Modal>
  );
};

export default AutoplanModal;
