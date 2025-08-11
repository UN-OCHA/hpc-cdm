import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router';

import { type categories, type flows } from '@unocha/hpc-data';
import dayjs from '../../../libs/dayjs';

import tw from 'twin.macro';
import { t } from '../../../i18n';
import { getContext } from '../../context';
import paths from '../../paths';
import { PENDING_REVIEW } from '../../utils/constants';
import InfoAlert from '../info-alert';
import FlowCompare, { type FlowVersion } from './flow-compare';

type FlowVersionSelection = [FlowVersion | null, FlowVersion | null];

const SPAN_STYLES = `
  px-2
  py-1
  mx-2
  border
  border-solid
  rounded-sm
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
const DeletedSpan = tw.span`
  ${SPAN_STYLES}
  bg-unocha-error-light
  border-unocha-error
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
    setSelectedVersions(([a, b]) => {
      const isASelected =
        a && a.id === flowVersion.id && a.versionID === flowVersion.versionID;
      const isBSelected =
        b && b.id === flowVersion.id && b.versionID === flowVersion.versionID;
      // Deselect if already selected
      if (isASelected) {
        return [null, b];
      }
      if (isBSelected) {
        return [a, null];
      }
      // If both slots filled, replace second
      if (a && b) {
        return [a, flowVersion];
      }
      // Fill the first empty slot
      return a ? [a, flowVersion] : [flowVersion, null];
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
            .sort(
              (flowVersion, previous) =>
                previous.versionID - flowVersion.versionID
            )
            .map((flowVersion) => (
              <TableRowClick
                key={`flowVersion_${flowVersion.id}v${flowVersion.versionID}`}
                onClick={() => handleVersionSelection(flowVersion)}
                sx={{
                  ...(selectedVersions.some(
                    (selectedVersion) =>
                      selectedVersion?.id === flowVersion.id &&
                      selectedVersion.versionID === flowVersion.versionID
                  )
                    ? tw`bg-unocha-primary bg-opacity-10`
                    : undefined),
                }}
              >
                <TableCell>
                  {flowVersion.versionID === flow.versionID && (
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
                  {flowVersion.deletedAt && (
                    <DeletedSpan>
                      {t.t(lang, (s) => s.components.flowForm.deletedTag)}
                    </DeletedSpan>
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
