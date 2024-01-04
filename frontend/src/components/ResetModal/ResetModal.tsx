import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Modal } from 'antd';
import { resetDegree } from 'utils/api/degreeApi';
import { useAppDispatch } from 'hooks';
import { resetTabs } from 'reducers/courseTabsSlice';

type Props = {
  open?: boolean;
  onOk?: () => void; // runs after resetting the data
  onCancel?: () => void;
};

// has no internal "open" state since it becomes difficult to juggle with external buttons
const ResetModal = ({ open, onOk, onCancel }: Props) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const resetDegreeMutation = useMutation(resetDegree, {
    onSuccess: () => {
      queryClient.invalidateQueries('degree');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at resetDegreeMutation: ', err);
    }
  });

  const handleResetDegree = () => {
    resetDegreeMutation.mutate();
  };

  const handleOk = async () => {
    handleResetDegree();
    dispatch(resetTabs());
    onOk?.();
  };

  return (
    <Modal
      title="Reset Planner?"
      open={open ?? false}
      closable={false}
      onOk={handleOk}
      okText="Reset"
      okButtonProps={{ type: 'primary', danger: true }}
      onCancel={onCancel}
      cancelText="Go back"
    >
      <div>
        Are you sure want to reset your planner? Your existing data will be permanently removed.
      </div>
    </Modal>
  );
};

export default ResetModal;
