import { useState } from 'react';
import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { Link } from 'react-router';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { categories, flows } from '@unocha/hpc-data';
import dayjs from '../../../libs/dayjs';

import paths from '../../paths';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import { getContext } from '../../context';
import { PENDING_REVIEW } from '../../utils/constants';
import FlowCompare, { type FlowVersion } from './flow-compare';
import InfoAlert from '../info-alert';

type FlowVersionSelection = [FlowVersion | null, FlowVersion | null];

const SPAN_STYLES = `
  px-2
  py-1
  mx-2
  border
  border-solid
  rounded-[4px]
`;
const LatestSpan = tw.span`
  ${SPAN_STYLES}
  bg-unocha-success-light
  border-unocha-success
`;
const PendingReviewSpan = tw.span`
  ${SPAN_STYLES}
  bg-unocha-pallete-orange-light
  border-unocha-pallete-orange
`;
const MarginEndLink = tw(Link)`
  me-2
`;
const TableRowClick = tw(TableRow)`
  transition-all
  hover:shadow-md
  bg-blend-hue
  hover:bg-opacity-20
  hover:cursor-pointer
`;

const FlowVersions = ({
  flow,
  inactiveReasons,
}: {
  flow: flows.GetFlowResult;
  inactiveReasons: categories.Category[];
}) => {
  const { lang } = getContext();

  const [selectedVersions, setSelectedVersions] =
    useState<FlowVersionSelection>([null, null]);

  const hasFlowsSelected = (
    selection: FlowVersionSelection
  ): selection is [FlowVersion, FlowVersion] =>
    selection.every((flowVersion) => flowVersion !== null);

  const pendingReviewCategory = inactiveReasons.find(
    (category) => category.name === PENDING_REVIEW
  );

  const handleVersionSelection = (flowVersion: FlowVersion) => {
    setSelectedVersions((prev) => {
      const checkedRowIndex = prev.findIndex(
        (a) => a?.id === flowVersion.id && a.versionID === flowVersion.versionID
      );

      if (checkedRowIndex !== -1) {
        const prevSelectedRowsClone = structuredClone(prev);
        prevSelectedRowsClone[checkedRowIndex] = null;
        if (checkedRowIndex === 0) {
          prevSelectedRowsClone[0] = prevSelectedRowsClone[1];
          prevSelectedRowsClone[1] = null;
        }
        return prevSelectedRowsClone;
      }

      if (prev.every((selectedVersion) => selectedVersion !== null)) {
        const prevSelectedRowsClone = structuredClone(prev);
        prevSelectedRowsClone[1] = flowVersion;
        return prevSelectedRowsClone;
      }

      if (!prev[0]) {
        return [flowVersion, null];
      }
      const flowB = prev[1] ?? flowVersion;

      return [prev[0], flowB];
    });
  };

  return (
    <Box sx={tw`flex flex-col px-4 gap-y-6`}>
      <InfoAlert
        text={t.t(lang, (s) => s.components.flowVersions.info.compareInfo)}
        localStorageKey="compareFlowVersions"
        sxProps={tw`mb-4`}
      />
      <Table>
        <TableBody>
          {flow.versions
            ?.sort(
              (flowVersion, previous) =>
                previous.versionID - flowVersion.versionID
            )
            .map((flowVersion) => (
              <TableRowClick
                key={`flowVersion_${flowVersion.id}v${flowVersion.versionID}`}
                onClick={() => handleVersionSelection(flowVersion)}
                sx={{
                  backgroundColor: selectedVersions.some(
                    (selectedVersion) =>
                      selectedVersion?.id === flowVersion.id &&
                      selectedVersion.versionID === flowVersion.versionID
                  )
                    ? tw`bg-unocha-primary bg-opacity-10`
                    : undefined,
                }}
              >
                <TableCell>
                  {flowVersion.versionID === flow?.versionID && (
                    <VisibilityIcon color="primary" sx={tw`me-4 float-start`} />
                  )}
                  <MarginEndLink
                    to={paths.flow(flowVersion.id, flowVersion.versionID)}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                  >
                    {`#${flowVersion.id}v${flowVersion.versionID}`}
                  </MarginEndLink>
                  {flowVersion.activeStatus && (
                    <LatestSpan>
                      {t.t(lang, (s) => s.components.flowForm.activeTag)}
                    </LatestSpan>
                  )}
                  {flowVersion.categories.some(
                    (cat) => cat.categoryID === pendingReviewCategory?.id
                  ) && (
                    <PendingReviewSpan>
                      {t.t(lang, (s) => s.components.flowForm.pendingReviewTag)}
                    </PendingReviewSpan>
                  )}
                  {t.t(lang, (s) => s.components.flowForm.createdUpdated, {
                    createdDate: dayjs(flowVersion.createdAt).format(),
                    updatedDate: dayjs(flowVersion.updatedAt).format(),
                  })}
                </TableCell>
              </TableRowClick>
            ))}
        </TableBody>
      </Table>
      {hasFlowsSelected(selectedVersions) && (
        <FlowCompare
          flowVersionA={selectedVersions[0]}
          flowVersionB={selectedVersions[1]}
        />
      )}
    </Box>
  );
};

export default FlowVersions;
