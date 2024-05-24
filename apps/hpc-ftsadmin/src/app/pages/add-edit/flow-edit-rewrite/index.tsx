import React from 'react';

import FlowRewriteForm from '../../../components/flow-form-rewrite/index';

interface Props {
  className?: string;
  isEdit: boolean;
}

export default (props: Props) => {
  return <FlowRewriteForm />;
};
