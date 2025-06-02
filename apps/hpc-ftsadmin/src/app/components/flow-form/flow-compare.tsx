import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { type flows } from '@unocha/hpc-data';
import { C, dataLoader } from '@unocha/hpc-ui';
import React from 'react';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import { getContext } from '../../context';
import { isKey } from '../../utils/parse-filters';

export type FlowVersion = NonNullable<flows.GetFlowResult['versions']>[number];

type ComparisonMode = 'addition' | 'deletion' | 'modification' | 'noop';
type FlowCompareFlowObject = flows.CompareFlowsResult['flowA']['flowObjects'];
type FlowCompareReduced = {
  id: number;
  name: string;
  state: NonNullable<
    FlowCompareFlowObject[keyof FlowCompareFlowObject]
  >[number]['state'];
};
type FlowCompareFlowObjectReduced = FlowCompareReduced & {
  direction: NonNullable<
    FlowCompareFlowObject[keyof FlowCompareFlowObject]
  >[number]['direction'];
};

const COMMON_STYLES = `
  p-2
  rounded-sm
`;
const Addition = tw.span`
  bg-unocha-pallete-green-light
  ${COMMON_STYLES}
`;
const Modification = tw.span`
  bg-unocha-pallete-yellow-light
  ${COMMON_STYLES}
`;
const Deletion = tw.span`
  bg-unocha-pallete-red-light
  line-through
  ${COMMON_STYLES}
`;
const Blank = tw.span`
  italic
  text-unocha-textLight
`;
const SourceDestination = tw.span`
  bg-unocha-primary
  text-white
  me-2
  ${COMMON_STYLES}
`;
const TableCell45 = tw(TableCell)`
  w-[45%]
`;
const TableCell10 = tw(TableCell)`
  w-[10%]
`;

const COMPARISON: Record<
  ComparisonMode,
  ({
    flowAValue,
    flowBValue,
  }: {
    flowAValue: React.ReactNode;
    flowBValue: React.ReactNode;
  }) => JSX.Element
> = {
  addition: ({ flowBValue }) => (
    <Box>
      <Addition>{flowBValue}</Addition>
    </Box>
  ),
  deletion: ({ flowAValue }) => (
    <Box>
      <Deletion>{flowAValue}</Deletion>
    </Box>
  ),
  modification: ({ flowBValue }) => (
    <Box>
      <Modification>{flowBValue}</Modification>
    </Box>
  ),
  noop: ({ flowBValue }) => (
    <Box>
      <span>{flowBValue}</span>
    </Box>
  ),
};

const isEmpty = (prop: string | undefined | null) => {
  return (
    prop === null ||
    prop === undefined ||
    (typeof prop === 'string' && prop === '')
  );
};
const comparisonMode = (
  propA: string | undefined | null,
  propB: string | undefined | null
): ComparisonMode => {
  if (isEmpty(propA) && !isEmpty(propB)) {
    return 'addition';
  }
  if (!isEmpty(propA) && isEmpty(propB)) {
    return 'deletion';
  }
  return 'modification';
};

const extractNamesJoinTrim = (names: Array<{ name: string }>) =>
  names
    .map(({ name }) => name)
    .join(', ')
    .trim();

const CompareEntityRow = ({
  tableCellName,
  flowAValue,
  flowBValue,
}: {
  tableCellName: React.ReactNode;
  flowAValue: FlowCompareReduced[];
  flowBValue: FlowCompareReduced[];
}) => {
  if (!flowAValue && !flowBValue) {
    return;
  }
  return (
    <TableRow>
      <TableCell10>{tableCellName}</TableCell10>
      <TableCell45>
        {flowAValue.length ? (
          extractNamesJoinTrim(flowAValue)
        ) : (
          <Blank>[blank]</Blank>
        )}
      </TableCell45>
      <TableCell45>
        <Box sx={tw`flex gap-x-2`}>
          {flowBValue.map((fB) =>
            COMPARISON[fB.state]({
              flowAValue: flowAValue.find((fA) => fA.id === fB.id)?.name,
              flowBValue: fB.name,
            })
          )}
        </Box>
      </TableCell45>
    </TableRow>
  );
};
const CompareRow = ({
  tableCellName,
  flowAValue,
  flowBValue,
}: {
  tableCellName: React.ReactNode;
  flowAValue?: string;
  flowBValue?: string;
}) => {
  if (!flowAValue && !flowBValue) {
    return;
  }
  return (
    <TableRow>
      <TableCell10>{tableCellName}</TableCell10>
      <TableCell45>
        {flowAValue === '' || flowAValue === undefined ? (
          <Blank>[blank]</Blank>
        ) : (
          flowAValue
        )}
      </TableCell45>
      <TableCell45>
        {COMPARISON[comparisonMode(flowAValue, flowBValue)]({
          flowAValue,
          flowBValue,
        })}
      </TableCell45>
    </TableRow>
  );
};
const FlowCompare = ({
  flowVersionA,
  flowVersionB,
}: {
  flowVersionA: FlowVersion;
  flowVersionB: FlowVersion;
}) => {
  const { lang, env: getEnv } = getContext();
  const env = getEnv();

  const state = dataLoader(
    [
      flowVersionA.id,
      flowVersionA.versionID,
      flowVersionB.id,
      flowVersionB.versionID,
    ],
    () =>
      env.model.flows.compareFlows({
        flowIdA: flowVersionA.id,
        flowIdB: flowVersionB.id,
        versionIdA: flowVersionA.versionID,
        versionIdB: flowVersionB.versionID,
      })
  );

  const parseYearToName = (
    flowObject: FlowCompareFlowObject[keyof FlowCompareFlowObject]
  ) =>
    flowObject?.map((fO) => {
      const commonProps = {
        id: fO.id,
        direction: fO.direction,
        state: fO.state,
      };
      return 'year' in fO
        ? { ...commonProps, name: `${fO.year}` }
        : {
            ...commonProps,
            name: fO.name,
          };
    });

  const divideSourceDestination = (
    flowObject?: FlowCompareFlowObjectReduced[]
  ): readonly [
    FlowCompareFlowObjectReduced[],
    FlowCompareFlowObjectReduced[],
  ] => {
    return (
      flowObject?.reduce(
        (acc, item) => {
          const clone = structuredClone(acc);
          clone[item.direction === 'source' ? 0 : 1].push(item);
          return clone;
        },
        [[], []] as [
          FlowCompareFlowObjectReduced[],
          FlowCompareFlowObjectReduced[],
        ]
      ) ?? [[], []]
    );
  };
  /**
   * The API already returns different values only, but when dividing
   * them by direction we need to see if the source or/and destination
   * suffered changes. If both Arrays are empty it means they are in the
   * same state
   */
  const areFlowsDifferent = (
    flowObjectA: FlowCompareFlowObjectReduced[],
    flowObjectB: FlowCompareFlowObjectReduced[]
  ) => {
    return !(flowObjectA.length === 0 && flowObjectB.length === 0);
  };

  return (
    <C.Loader
      loader={state}
      strings={{
        ...t.get(lang, (s) => s.components.loader),
        notFound: t.get(lang, (s) => s.components.notFound),
      }}
    >
      {({ flowA: flowCompleteA, flowB: flowCompleteB }) => {
        const {
          flowId: flowIdA,
          versionId: versionIdA,
          ...flowA
        } = flowCompleteA;
        const {
          flowId: flowIdB,
          versionId: versionIdB,
          ...flowB
        } = flowCompleteB;

        return (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell10></TableCell10>
                <TableCell45>{`${flowIdA}v${versionIdA}`}</TableCell45>
                <TableCell45>{`${flowIdB}v${versionIdB}`}</TableCell45>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(flowA).map((key) => {
                if (!isKey(flowA, key)) {
                  return null;
                }

                if (key === 'flowObjects') {
                  return Object.keys(flowA['flowObjects']).map(
                    (flowObjectKey) => {
                      if (!isKey(flowA['flowObjects'], flowObjectKey)) {
                        return null;
                      }

                      const [sourceFlowObjectA, destinationFlowObjectA] =
                        divideSourceDestination(
                          parseYearToName(flowA['flowObjects'][flowObjectKey])
                        );
                      const [sourceFlowObjectB, destinationFlowObjectB] =
                        divideSourceDestination(
                          parseYearToName(flowB['flowObjects'][flowObjectKey])
                        );

                      return (
                        <React.Fragment key={flowObjectKey}>
                          {areFlowsDifferent(
                            sourceFlowObjectA,
                            sourceFlowObjectB
                          ) && (
                            <CompareEntityRow
                              tableCellName={
                                <span>
                                  <SourceDestination>
                                    {t.t(
                                      lang,
                                      (s) =>
                                        s.components.flowVersions.direction
                                          .source
                                    )}
                                  </SourceDestination>
                                  {flowObjectKey}
                                </span>
                              }
                              flowAValue={sourceFlowObjectA}
                              flowBValue={sourceFlowObjectB}
                            />
                          )}
                          {areFlowsDifferent(
                            destinationFlowObjectA,
                            destinationFlowObjectB
                          ) && (
                            <CompareEntityRow
                              tableCellName={
                                <span>
                                  <SourceDestination>
                                    {t.t(
                                      lang,
                                      (s) =>
                                        s.components.flowVersions.direction
                                          .destination
                                    )}
                                  </SourceDestination>
                                  {flowObjectKey}
                                </span>
                              }
                              flowAValue={destinationFlowObjectA}
                              flowBValue={destinationFlowObjectB}
                            />
                          )}
                        </React.Fragment>
                      );
                    }
                  );
                }

                const flowAValue = flowA[key];
                const flowBValue = flowB[key];

                //  Categories
                if (Array.isArray(flowAValue) && Array.isArray(flowBValue)) {
                  return (
                    <CompareEntityRow
                      key={key}
                      tableCellName={key}
                      flowAValue={flowAValue}
                      flowBValue={flowBValue}
                    />
                  );
                }
                return (
                  <CompareRow
                    key={key}
                    tableCellName={key}
                    flowAValue={flowAValue?.toString()}
                    flowBValue={flowBValue?.toString()}
                  />
                );
              })}
            </TableBody>
          </Table>
        );
      }}
    </C.Loader>
  );
};

export default FlowCompare;
