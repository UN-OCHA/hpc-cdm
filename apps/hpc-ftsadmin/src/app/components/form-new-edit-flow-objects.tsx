import { Typography } from '@mui/material';
import { organizations } from '@unocha/hpc-data';
import { styled } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import FormNewEditFlowObjectControl, {
  FormNewEditFlowObjectControlProps,
} from './form-new-edit-flow-object-control';

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
`;

interface Props {
  refDirection: 'source' | 'destination';
  label: string;
}

type Field<T> = Omit<FormNewEditFlowObjectControlProps<T>, 'refDirection' | 'objectType'>;

interface Fields {
  organization: Field<organizations.Organization>;
}

export default function FormNewEditFlowObjects(props: Props) {
  const { refDirection, label } = props;
  const { model } = getEnv();
  const fields: Fields = {
    organization: {
      label: (s) => s.components.forms.newEditFlow.fields.organizations,
      getOptions: model.organizations.getOrganizationsAutocomplete,
      searchOnType: true,
    },
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Fieldset>
          <Typography variant="h3" component="legend" sx={{ marginBottom: 2 }}>
            {label}
          </Typography>
          {Object.entries(fields).map(([key, { ...props }]) => (
            <FormNewEditFlowObjectControl
              key={`${refDirection}.${key}`}
              refDirection={refDirection}
              objectType={key}
              {...props}
            />
          ))}
        </Fieldset>
      )}
    </AppContext.Consumer>
  );
}
