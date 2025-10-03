import React from 'react';

import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { useUserLoadouts, useUserActiveLoadout } from 'utils/apiHooks/loadouts/queries';
import {
  useCreateLoadoutMutation,
  useDeleteLoadoutMutation,
  useSwitchLoadoutMutation
} from 'utils/apiHooks/loadouts/mutations';

const LoadoutsDropdown = () => {
  const { data: loadouts } = useUserLoadouts();
  const { data: activeLoadout } = useUserActiveLoadout();

  const createLoadoutMutation = useCreateLoadoutMutation();
  const deleteLoadoutMutation = useDeleteLoadoutMutation();
  const switchLoadoutMutation = useSwitchLoadoutMutation();

  const handleSwitchLoadout = (loadoutName: string) => {
    if (loadoutName !== activeLoadout?.loadoutName) {
      switchLoadoutMutation.mutate(loadoutName);
    }
  };

  const handleCreateLoadout = () => {
    createLoadoutMutation.mutate();
  };

  const handleDeleteLoadout = (loadoutName: string) => {
    if (loadouts && loadouts.length > 1) {
      deleteLoadoutMutation.mutate(loadoutName);
    }
  };

  // Properly type the menu items array
  const menuItems: MenuProps['items'] = [
    ...(loadouts || []).map((loadout) => ({
      key: loadout.loadoutName,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontWeight: loadout.loadoutName === activeLoadout?.loadoutName ? 'bold' : 'normal'
            }}
          >
            {loadout.loadoutName}
          </span>
          {loadouts && loadouts.length > 1 && (
            <DeleteOutlined
              style={{ color: '#ff4d4f', marginLeft: '8px' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteLoadout(loadout.loadoutName);
              }}
            />
          )}
        </div>
      ),
      onClick: () => handleSwitchLoadout(loadout.loadoutName)
    })),
    { type: 'divider' as const },
    {
      key: 'create-new',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PlusOutlined style={{ marginRight: '8px' }} />
          Create New Loadout
        </div>
      ),
      onClick: handleCreateLoadout,
      disabled: createLoadoutMutation.isPending
    }
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <Button
        style={{
          color: '#fff',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        loading={
          switchLoadoutMutation.isPending ||
          createLoadoutMutation.isPending ||
          deleteLoadoutMutation.isPending
        }
      >
        {activeLoadout?.loadoutName || 'Select Loadout'}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default LoadoutsDropdown;
