import {
  type categories,
  type organizations,
  type util,
} from '@unocha/hpc-data';
import { C, CLASSES, combineClasses, useDataLoader } from '@unocha/hpc-ui';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { type Environment } from '../../../environments/interface';
import { t } from '../../../i18n';
import OrganizationForm, {
  type AddEditOrganizationValues,
} from '../../components/organization-form';
import PageMeta from '../../components/page-meta';
import { AppContext, getEnv } from '../../context';
import { TOAST_CONFIG } from '../../utils/constants';
import { defaultOptions } from '../../utils/fn-promises';

interface Props {
  className?: string;
}

type OrganizationRouteParams = { id: string };

type OrganizationCategories = 'type' | 'subType' | 'level';

const Container = tw.div`
  flex
  mb-16
`;
const LandingContainer = tw.div`
  w-full
  p-8
`;
const PaddingContainer = tw.div`
  xl:px-96
  md:px-64
  px-36
`;
const InfoText = tw.p`
  mb-0
  mt-0
  italic
  text-unocha-textLight
`;

const orgCategoryTo = (
  categories: organizations.OrganizationCategory[] | undefined,
  type: OrganizationCategories
): util.FormObjectValue | null => {
  const categoryGroup =
    type === 'level' ? 'organizationLevel' : 'organizationType';
  const checkParentID = (parentID: number | null) => {
    return type === 'subType' ? parentID !== null : parentID === null;
  };

  const organizationCategory = categories?.find((cat) => {
    return cat.group === categoryGroup && checkParentID(cat.parentID);
  });
  if (!organizationCategory) {
    return null;
  }

  return {
    displayLabel: organizationCategory.name,
    value: organizationCategory.id,
  } satisfies util.FormObjectValue;
};

export const fnOrganizationType = (
  organizationTypes: categories.GetCategoriesResult
): util.FormObjectValue[] => {
  const response = organizationTypes
    .map((organizationType, _, organizationTypes) => {
      if (organizationType.parentID) {
        const parent = organizationTypes.find(
          (orgType) => orgType.id === organizationType.parentID
        );
        if (!parent) {
          return organizationType;
        }
        return {
          ...organizationType,
          name: `${parent.name}: ${organizationType.name}`,
        };
      }
      return organizationType;
    })
    .filter(
      (organizationType) =>
        organizationType.name === 'Other' || organizationType.parentID !== null
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return defaultOptions(response);
};

const parseOrganizationToInitialValue = (
  org: organizations.GetOrganizationResult,
  organizationTypes: categories.GetCategoriesResult
): AddEditOrganizationValues => {
  const {
    name,
    abbreviation,
    nativeName,
    url,
    active: isActive,
    verified: isVerified,
    notes,
    categories,
    locations,
    parent,
    comments,
    collectiveInd: isCollectiveInd,
  } = org;
  const res: AddEditOrganizationValues = {
    name,
    abbreviation,
    isActive,
    isVerified,
    isCollectiveInd,
    organizationSubType: null,
    nativeName: nativeName ?? undefined,
    url: url ?? undefined,
    notes: notes ?? undefined,
    comments: comments ?? undefined,
    parent: parent
      ? ({
          displayLabel: parent.name,
          value: parent.id,
        } satisfies util.FormObjectValue)
      : undefined,
    organizationLevel: orgCategoryTo(categories, 'level'),
  };

  if (locations) {
    res.locations = locations
      .map(
        (location) =>
          ({
            displayLabel: location.name,
            value: location.id,
          }) satisfies util.FormObjectValue
      )
      .map((preLocation, index, preLocations) => {
        const locationParentID = locations[index].parentId;

        if (!locationParentID) {
          return preLocation;
        }

        const parent = preLocations.find((a) => a.value === locationParentID);

        if (!parent) {
          return preLocation;
        }

        return {
          ...preLocation,
          parent: {
            displayLabel: parent.displayLabel,
            value: parent.value,
          } satisfies util.FormObjectValue,
        };
      });
  }

  const organizationSubType = orgCategoryTo(categories, 'subType');
  const organizationType =
    fnOrganizationType(organizationTypes).find(
      (orgType) => orgType.value === organizationSubType?.value
    ) ?? orgCategoryTo(categories, 'type');

  res.organizationSubType = organizationType;

  return res;
};

const getOrganizationData = async (
  env: Environment,
  idString?: string
): Promise<
  [
    organizations.GetOrganizationResult | undefined,
    AddEditOrganizationValues | undefined,
    categories.GetCategoriesResult,
    categories.GetCategoriesResult,
  ]
> => {
  const [organizationLevels, organizationTypes] = await Promise.all([
    env.model.categories.getCategories({
      query: 'organizationLevel',
    }),

    env.model.categories.getCategories({
      query: 'organizationType',
    }),
  ]);

  if (!idString) {
    return [undefined, undefined, organizationLevels, organizationTypes];
  }
  const id = parseInt(idString, 10);
  const org = await env.model.organizations.getOrganization({ id });

  return [
    org,
    parseOrganizationToInitialValue(org, organizationTypes),
    organizationLevels,
    organizationTypes,
  ];
};

export default (props: Props) => {
  const { id } = useParams<OrganizationRouteParams>();
  const env = getEnv();

  const locationState: { successMessage?: string } | null = useLocation().state;

  useEffect(() => {
    if (locationState?.successMessage) {
      toast.success(locationState.successMessage, TOAST_CONFIG);
    }
  }, [locationState?.successMessage]);

  const [state, load] = useDataLoader([id], () => getOrganizationData(env, id));
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta
            title={[
              t.t(lang, (s) => s.routes.organization.title, {
                id: id ?? '',
              }),
            ]}
          />
          <Container>
            <LandingContainer>
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
                {(orgData) => {
                  const [
                    data,
                    initialValues,
                    organizationLevels,
                    organizationTypes,
                  ] = orgData;
                  if (!data || !initialValues) {
                    return (
                      <PaddingContainer>
                        <C.PageTitle style={{ marginBottom: 0 }}>
                          {t.t(
                            lang,
                            (s) =>
                              s.components.organizationUpdateCreate.title.create
                          )}
                        </C.PageTitle>
                        <InfoText>
                          {t.t(
                            lang,
                            (s) =>
                              s.components.organizationUpdateCreate.text.create
                          )}
                        </InfoText>
                        <OrganizationForm
                          organizationLevels={organizationLevels}
                          organizationTypes={organizationTypes}
                        />
                      </PaddingContainer>
                    );
                  }
                  return (
                    <PaddingContainer>
                      <C.PageTitle>{data.name}</C.PageTitle>
                      <InfoText>
                        {t.t(
                          lang,
                          (s) => s.components.organizationUpdateCreate.text.edit
                        )}
                      </InfoText>
                      <OrganizationForm
                        organizationLevels={organizationLevels}
                        organizationTypes={organizationTypes}
                        initialValues={initialValues}
                        id={data.id}
                        load={load}
                      />
                    </PaddingContainer>
                  );
                }}
              </C.Loader>
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
