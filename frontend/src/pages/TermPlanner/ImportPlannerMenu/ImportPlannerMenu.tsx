import React, { useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useTheme } from 'styled-components';
import { useImportUserMutation } from 'utils/apiHooks/user';
import { importUser, UserJson } from 'utils/export';
import openNotification from 'utils/openNotification';
import CS from '../common/styles';
import S from './styles';
import parseAcademicStatement from './inputParsers';

const ImportPlannerMenu = () => {
  const importUserMutation = useImportUserMutation();
  const theme = useTheme();
  const handleImport = (user: UserJson) => {
    importUserMutation.mutate(user);
  };

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [loadingJson, setLoadingJson] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const uploadJson = () => {
    jsonInputRef.current?.click();
  };

  const uploadPdf = () => {
    pdfInputRef.current?.click();
  };

  const uploadedJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return;
    }

    if (e.target.files[0].type !== 'application/json') {
      openNotification({
        type: 'error',
        message: 'Import file needs to be JSON.',
        description: (
          <span style={{ color: theme.text }}>The uploaded file is not of type JSON.</span>
        )
      });
      e.target.value = '';
      return;
    }

    setLoadingJson(true);
    const reader = new FileReader();
    reader.readAsText(e.target.files[0], 'UTF-8');
    reader.onload = async (ev) => {
      if (ev.target === null) {
        return;
      }

      const content = ev.target.result;
      e.target.value = '';

      try {
        const fileInJson = JSON.parse(content as string) as JSON;
        const user = importUser(fileInJson);
        handleImport(user);
        setLoadingJson(false);
      } catch (err) {
        setLoadingJson(false);
        // eslint-disable-next-line no-console
        console.error('Error at uploadedJSONFile', err);
        openNotification({
          type: 'error',
          message: 'Invalid JSON format',
          description: (
            <span style={{ color: theme.text }}>An error occured when parsing the JSON file</span>
          )
        });
        return;
      }

      openNotification({
        type: 'success',
        message: 'JSON Imported',
        description: (
          <span style={{ color: theme.text }}>Planner has been successfully imported.</span>
        )
      });
    };
  };

  // new handler to upload PDF files
  const uploadedPDFFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;

    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
      openNotification({
        type: 'error',
        message: 'Import file needs to be a PDF.',
        description: (
          <span style={{ color: theme.text }}>
            The uploaded file is not an official academic statement PDF.
          </span>
        )
      });
      e.target.value = '';
      return;
    }

    setLoadingPdf(true);
    try {
      const parsedPlanner = await parseAcademicStatement(file);
      e.target.value = '';

      console.log('Successfully Parsed Planner Structure:', parsedPlanner);

      setLoadingPdf(false);
      openNotification({
        type: 'success',
        message: 'PDF Statement Parsed',
        description: (
          <span style={{ color: theme.text }}>Your course history has been extracted cleanly.</span>
        )
      });
    } catch (err) {
      setLoadingPdf(false);
      e.target.value = '';
      console.error('Error parsing academic statement:', err);
      openNotification({
        type: 'error',
        message: 'Parsing Failed',
        description: (
          <span style={{ color: theme.text }}>
            Could not extract course terms from this document layout.
          </span>
        )
      });
    }
  };

  const spinIcon = <LoadingOutlined style={{ fontSize: 28 }} spin />;

  return (
    <S.Wrapper style={{ width: '240px' }}>
      <CS.MenuHeader>Import</CS.MenuHeader>
      <CS.MenuDivider />
      <div>Import an existing planner if you have exported it previously as a JSON file.</div>
      <div>If you currently have courses planned, it may be merged with the imported planner.</div>
      <div>
        You can also upload an academic statement that can be used to populate your planner.
      </div>
      <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CS.Button style={{ width: '100%', margin: '5px' }} onClick={uploadJson}>
            Upload a planner
          </CS.Button>
          <CS.Button style={{ width: '100%', margin: '5px' }} onClick={uploadPdf}>
            Upload academic statement
          </CS.Button>
          {(loadingJson || loadingPdf) && <Spin indicator={spinIcon} />}
        </div>
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          ref={jsonInputRef}
          onChange={uploadedJSONFile}
        />
        <input
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          ref={pdfInputRef}
          onChange={uploadedPDFFile}
        />
      </>
    </S.Wrapper>
  );
};

export default ImportPlannerMenu;
