import React, { useEffect, useRef } from 'react';
import { App, Button, Space } from 'antd';
import { useDismissShareNoticeMutation } from 'utils/apiHooks/user';
import useSettings from 'hooks/useSettings';

const NOTICE_KEY = 'share-course-data-notice';

// One-time popup for accounts made before the setup step explained popularity
// stats. New users already saw this in the degree wizard (shareNoticeSeen = true).
const ShareDataNotice = () => {
  const { notification } = App.useApp();
  const { shareNoticeSeen, toggleShareCourseData } = useSettings();
  const dismissMutation = useDismissShareNoticeMutation();
  const shown = useRef(false);

  useEffect(() => {
    if (shareNoticeSeen || shown.current) return;
    shown.current = true;

    let handled = false;
    const close = (turnOff: boolean) => {
      if (handled) return;
      handled = true;
      // Turning sharing off also marks the notice as seen on the server
      if (turnOff) toggleShareCourseData();
      else dismissMutation.mutate();
      notification.destroy(NOTICE_KEY);
    };

    notification.info({
      key: NOTICE_KEY,
      placement: 'bottomRight',
      duration: false,
      title: 'Your plan helps show popular electives',
      description: (
        <>
          <p>
            Circles counts which electives students in your degree plan, anonymously. No names or
            marks are shared, and nothing shows until at least 20 students are counted.
          </p>
          <p>To stop your plan being counted at any time:</p>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li>Open the Term Planner.</li>
            <li>Click the gear (Settings) icon.</li>
            <li>Turn off &quot;Share Course Data&quot;.</li>
          </ol>
        </>
      ),
      actions: (
        <Space>
          <Button onClick={() => close(true)}>Turn off sharing</Button>
          <Button type="primary" onClick={() => close(false)}>
            Got it
          </Button>
        </Space>
      ),
      onClose: () => close(false)
    });
  }, [shareNoticeSeen, notification, toggleShareCourseData, dismissMutation]);

  return null;
};

export default ShareDataNotice;
