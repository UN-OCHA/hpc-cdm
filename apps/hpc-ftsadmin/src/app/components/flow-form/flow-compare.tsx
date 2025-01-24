import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { flows } from '@unocha/hpc-data';
import React from 'react';
import tw from 'twin.macro';
import { isKey } from '../../utils/parse-filters';
import { C, dataLoader } from '@unocha/hpc-ui';
import { getContext } from '../../context';
import { t } from '../../../i18n';

export type FlowVersion = NonNullable<flows.FlowREST['versions']>[number];

type ComparisonMode = 'addition' | 'deletion' | 'modification';
type FlowCompareFlowObject = flows.CompareFlowsResult['flowA']['flowObjects'];
type FlowCompareFlowObjectReduced = {
  id: number;
  name: string;
  direction: NonNullable<
    FlowCompareFlowObject[keyof FlowCompareFlowObject]
  >[number]['direction'];
};

const COMMON_STYLES = `
  p-2
  rounded-[4px]
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
};

const comparisonMode = (
  propA: string | undefined | null,
  propB: string | undefined | null
): ComparisonMode => {
  const isEmpty = (prop: string | undefined | null) => {
    return (
      prop === null ||
      prop === undefined ||
      (typeof prop === 'string' && prop === '')
    );
  };
  if (isEmpty(propA) && !isEmpty(propB)) {
    return 'addition';
  }
  if (!isEmpty(propA) && isEmpty(propB)) {
    return 'deletion';
  }

  return 'modification';
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
        {!flowAValue ? <Blank>[blank]</Blank> : flowAValue}
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
    flowObject?.map((flowObject) =>
      'year' in flowObject
        ? {
            id: flowObject.id,
            direction: flowObject.direction,
            name: `${flowObject.year}`,
          }
        : {
            id: flowObject.id,
            direction: flowObject.direction,
            name: flowObject.name,
          }
    );

  const extractNamesJoinTrim = (names: Array<{ name: string }>) =>
    names
      .map(({ name }) => name)
      .join(', ')
      .trim();

  const divideSourceDestination = (
    flowObject?: FlowCompareFlowObjectReduced[]
  ): readonly [string, string] => {
    const [source, destination] = flowObject?.reduce(
      (acc, item) => {
        const clone = structuredClone(acc);
        clone[item.direction === 'source' ? 0 : 1].push(item);
        return clone;
      },
      [[], []] as [
        FlowCompareFlowObjectReduced[],
        FlowCompareFlowObjectReduced[],
      ]
    ) ?? [[], []];

    return [extractNamesJoinTrim(source), extractNamesJoinTrim(destination)];
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
                          {sourceFlowObjectA !== sourceFlowObjectB && (
                            <CompareRow
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
                          {destinationFlowObjectA !==
                            destinationFlowObjectB && (
                            <CompareRow
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
                    <CompareRow
                      key={key}
                      tableCellName={key}
                      flowAValue={extractNamesJoinTrim(flowAValue)}
                      flowBValue={extractNamesJoinTrim(flowBValue)}
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
