import React, { useEffect, useState } from 'react';
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Modal, Typography } from 'antd';
import useMediaQuery from 'hooks/useMediaQuery';

const { Title, Paragraph } = Typography;

const MobileNotSupportedModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Check if user has already seen the modal in this session
    const hasSeenModal = sessionStorage.getItem('circles-mobile-modal-seen');

    if (isMobile && !hasSeenModal) {
      // Show modal after a short delay to avoid jarring experience
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('circles-mobile-modal-seen', 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isMobile]);

  const handleOk = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <MobileOutlined style={{ fontSize: '24px', marginRight: '8px', color: '#9453e6' }} />
          <span>Mobile Experience</span>
        </div>
      }
      open={isVisible}
      onOk={handleOk}
      onCancel={handleOk}
      footer={[
        <Button key="understood" type="primary" onClick={handleOk}>
          I Understand
        </Button>
      ]}
      centered
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <Title level={4} style={{ color: '#9453e6', marginBottom: '16px' }}>
          Circles is not officially supported on mobile yet
        </Title>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
          While you can browse our landing page on mobile, the full Circles experience is optimized
          for desktop use.
        </Paragraph>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
          For the best experience planning your degree, please visit us on a desktop or laptop
          computer.
        </Paragraph>
        <div style={{ fontSize: '48px', margin: '16px 0' }}>
          <DesktopOutlined style={{ color: '#9453e6' }} />
        </div>
      </div>
    </Modal>
  );
};

export default MobileNotSupportedModal;
