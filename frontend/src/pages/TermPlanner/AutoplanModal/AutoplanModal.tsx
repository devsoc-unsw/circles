import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, message, Modal, Select, Typography } from 'antd';
import { isAxiosError } from 'axios';
import { useTheme } from 'styled-components';
import { useAutoplanCoursesMutation, useUserCourses, useUserPlanner } from 'utils/apiHooks/user';
import openNotification from 'utils/openNotification';

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
  const coursesQuery = useUserCourses();
  const theme = useTheme();

  const planner = plannerQuery.data;
  const courses = coursesQuery.data;

  const autoplanMutation = useAutoplanCoursesMutation();

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedEndTerm, setSelectedEndTerm] = useState<string>('');
  const [lockExistingPlanned, setLockExistingPlanned] = useState(true);

  const courseOptions = useMemo(
    () =>
      (planner?.unplanned ?? []).map((courseCode) => ({
        value: courseCode,
        label: `${courseCode} - ${courses?.[courseCode]?.title ?? 'Unknown course'}`
      })),
    [courses, planner?.unplanned]
  );

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

    setSelectedCourses([...planner.unplanned]);

    const lastYear = planner.startYear + planner.years.length - 1;
    setSelectedEndTerm(`${lastYear}-3`);
    setLockExistingPlanned(true);
  }, [open, planner]);

  const handleSubmit = () => {
    if (selectedCourses.length === 0) {
      message.error('Select at least one unplanned course to autoplan.');
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

    const endYear = Number(split[0]);
    const endTerm = Number(split[1]);

    if (Number.isNaN(endYear) || Number.isNaN(endTerm)) {
      message.error('Invalid end term selected.');
      return;
    }

    autoplanMutation.mutate(
      {
        courseCodes: selectedCourses,
        endTime: [endYear, endTerm],
        lockExistingPlannedCourses: lockExistingPlanned
      },
      {
        onSuccess: () => {
          openNotification({
            type: 'success',
            message: 'Autoplan complete',
            description: (
              <span style={{ color: theme.text }}>
                Your planner has been updated. This generated a possible plan you can create using
                your selected end date, but you can continue dragging courses to fit your needs, or
                redo your plan with an earlier end date.
              </span>
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
            description: <span style={{ color: theme.text }}>{detail}</span>
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
      <Text>Select unplanned courses to automatically place into your planner.</Text>
      <Select
        mode="multiple"
        style={{ width: '100%', marginTop: 12 }}
        placeholder="Select courses"
        value={selectedCourses}
        onChange={(values) => setSelectedCourses(values)}
        options={courseOptions}
        optionFilterProp="label"
      />

      <Text style={{ display: 'block', marginTop: 16 }}>Plan up to term</Text>
      <Select
        style={{ width: '100%', marginTop: 8 }}
        placeholder="Select end term"
        value={selectedEndTerm}
        onChange={(value) => setSelectedEndTerm(value)}
        options={endTermOptions}
      />

      <Checkbox
        style={{ marginTop: 16 }}
        checked={lockExistingPlanned}
        onChange={(event) => setLockExistingPlanned(event.target.checked)}
      >
        Lock currently planned courses
      </Checkbox>
    </Modal>
  );
};

export default AutoplanModal;
