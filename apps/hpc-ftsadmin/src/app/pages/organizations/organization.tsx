import { C, CLASSES, combineClasses, useDataLoader } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext, getEnv } from '../../context';
import tw from 'twin.macro';
import { useParams } from 'react-router-dom';
import OrganizationForm, {
  AddEditOrganizationValues,
} from '../../components/organization-form';
import { organizations } from '@unocha/hpc-data';
import { FormObjectValue } from '../../utils/parse-filters';

interface Props {
  className?: string;
}
type OrganizationRouteParams = { id: string };
const Container = tw.div`
flex
`;
const LandingContainer = tw.div`
w-full
`;

type OrganizationCategories = 'type' | 'subType' | 'level';
const orgCategoryTo = (
  categories: Array<organizations.OrganizationCategory> | undefined,
  type: OrganizationCategories
): Array<FormObjectValue> => {
  const res: Array<FormObjectValue> = [];
  if (!categories) return res;
  switch (type) {
    case 'type': {
      res.push(
        ...categories
          .filter(
            (cat) => cat.group === 'organizationType' && cat.parentID === null
          )
          .map((cat) => ({ displayLabel: cat.name, value: cat.id.toString() }))
      );

      break;
    }
    case 'subType': {
      res.push(
        ...categories
          .filter(
            (cat) => cat.group === 'organizationType' && cat.parentID !== null
          )
          .map((cat) => ({ displayLabel: cat.name, value: cat.id.toString() }))
      );

      break;
    }
    case 'level': {
      res.push(
        ...categories
          .filter(
            (cat) => cat.group === 'organizationLevel' && cat.parentID === null
          )
          .map((cat) => ({ displayLabel: cat.name, value: cat.id.toString() }))
      );
      break;
    }
  }
  return res;
};

const parseOrganizationToInitialValue = (
  org: organizations.GetOrganizationResult
): AddEditOrganizationValues => {
  const {
    name,
    abbreviation,
    nativeName,
    url,
    active,
    verified,
    notes,
    categories,
    locations,
    parent,
    comments,
    collectiveInd,
  } = org;
  const res: AddEditOrganizationValues = {
    name,
    abbreviation,
    active,
    verified,
    collectiveInd,
    organizationTypes: [],
  };
  res.nativeName = nativeName ?? undefined;
  res.url = url ?? undefined;
  res.notes = notes ?? undefined;
  res.comments = comments ?? undefined;
  res.locations = locations?.map((location) => ({
    displayLabel: location.name,
    value: location.id.toString(),
  }));
  res.parent = parent
    ? { displayLabel: parent.name, value: parent.id.toString() }
    : undefined;
  res.organizationLevel = orgCategoryTo(categories, 'level').at(0);
  res.organizationTypes = [
    ...orgCategoryTo(categories, 'type'),
    ...orgCategoryTo(categories, 'subType'),
  ];
  return res;
};

export default (props: Props) => {
  const { id: idString } = useParams<OrganizationRouteParams>();
  const id = parseInt(idString ?? '', 10);
  const env = getEnv();
  const [state, load] = useDataLoader([id], () =>
    env.model.organizations.getOrganization({ id })
  );
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <LandingContainer>
              {idString ? (
                <C.Loader
                  loader={state}
                  strings={{
                    ...t.get(lang, (s) => s.components.loader),
                    notFound: {
                      ...t.get(lang, (s) => s.components.notFound),
                      ...t.get(lang, (s) => s.components.flowsTable.notFound),
                    },
                  }}
                >
                  {(data) => (
                    <>
                      <C.PageTitle>{data.name}</C.PageTitle>
                      <OrganizationForm
                        initialValues={parseOrganizationToInitialValue(data)}
                        id={id}
                        load={load}
                      />
                    </>
                  )}
                </C.Loader>
              ) : (
                <>
                  <C.PageTitle>Add Organization</C.PageTitle>
                  <OrganizationForm />
                </>
              )}
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
