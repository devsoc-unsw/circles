import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from 'antd';
import { resetUserDegree } from 'utils/api/userApi';
import { useAppDispatch } from 'hooks';
import useToken from 'hooks/useToken';
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
  const token = useToken({ allowUnset: true }); // NOTE: must allow unset since this is used in ErrorBoundary itself

  const resetDegreeMutation = useMutation({
    mutationFn: (definedToken: string) => resetUserDegree(definedToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['degree']
      });
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at resetDegreeMutation: ', err);
    }
  });

  const handleResetDegree = () => {
    if (token !== undefined) {
      resetDegreeMutation.mutate(token);
    }
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
      okText="Reset Data"
      okButtonProps={{ type: 'primary', danger: true }}
      onCancel={onCancel}
      cancelText="Go to Degree Planner"
    >
      <div>
        You can navigate to the Degree Wizard to reset your data. By clicking Ok, Your existing data
        will be permanently removed.
      </div>
    </Modal>
  );
};

export default ResetModal;
