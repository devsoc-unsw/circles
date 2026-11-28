import React, { useEffect, useRef } from 'react';
import { App, Button, Space } from 'antd';
import { useDismissShareNoticeMutation } from 'utils/apiHooks/user';
import useSettings from 'hooks/useSettings';

const NOTICE_KEY = 'share-course-data-notice';

// One-time popup for accounts made before the setup step explained popularity
// stats. New users already saw this in the degree wizard (shareNoticeSeen = true).
const ShareDataNotice = () => {
  const { notification } = App.useApp();
  const { shareNoticeSeen, setShareCourseData } = useSettings();
  const dismissMutation = useDismissShareNoticeMutation();
  const shown = useRef(false);

  // If the user changes the setting somewhere else (Settings menu, another
  // tab), the notice is no longer needed, so close it.
  useEffect(() => {
    if (shareNoticeSeen && shown.current) notification.destroy(NOTICE_KEY);
  }, [shareNoticeSeen, notification]);

  useEffect(() => {
    if (shareNoticeSeen || shown.current) return;
    shown.current = true;

    let handled = false;
    const close = (share: boolean) => {
      if (handled) return;
      handled = true;
      // Setting the value also marks the notice as seen on the server
      if (share) dismissMutation.mutate();
      else setShareCourseData(false);
      notification.destroy(NOTICE_KEY);
    };

    notification.info({
      key: NOTICE_KEY,
      placement: 'bottomRight',
      duration: false,
      title: 'Your plan is counted in popular electives',
      description: (
        <>
          <p>
            Circles already counts the electives in your plan, together with other students in your
            degree, to show which electives are popular. It&apos;s anonymous: no names or marks are
            shared.
          </p>
          <p>You can change this at any time:</p>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li>Open the Term Planner.</li>
            <li>Click the gear (Settings) icon.</li>
            <li>Turn off &quot;Share Course Data&quot;.</li>
          </ol>
        </>
      ),
      // Equal weight: neither choice is pushed over the other
      actions: (
        <Space>
          <Button onClick={() => close(false)}>Turn off sharing</Button>
          <Button onClick={() => close(true)}>Keep sharing</Button>
        </Space>
      ),
      onClose: () => close(true)
    });
  }, [shareNoticeSeen, notification, setShareCourseData, dismissMutation]);

  return null;
};

export default ShareDataNotice;
