import { C } from '@unocha/hpc-ui';
import { FlowForm } from '../../components/flow-form';
import { useState } from 'react';

export default () => {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  return (
    <>
      <C.MessageAlert setMessage={setError} message={error} severity="error" />
      <C.MessageAlert
        setMessage={setSuccess}
        message={success}
        severity="success"
      />
      <FlowForm setError={setError} setSuccess={setSuccess} />
    </>
  );
};
