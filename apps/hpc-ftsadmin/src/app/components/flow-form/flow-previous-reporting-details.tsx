import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { type flows } from '@unocha/hpc-data';
import { C, useDataLoader } from '@unocha/hpc-ui';
import { Link } from 'react-router';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import dayjs from '../../../libs/dayjs';
import { getContext } from '../../context';
import { isValidUrl } from '../../utils/utils';

type Props = {
  flow: flows.GetFlowResult;
};

const FlowPreviousReportingDetails = ({ flow }: Props) => {
  const { id, versionID, versions } = flow;
  const { lang, env: getEnv } = getContext();
  const env = getEnv();

  const HEADERS = [
    t.t(lang, (s) => s.components.flowPreviousReportingDetails.header.version),
    t.t(lang, (s) => s.components.reportingDetail.reportSource.label),
    t.t(lang, (s) => s.components.reportingDetail.reportedByOrganization.label),
    t.t(lang, (s) => s.components.reportingDetail.dateReported.label),
    t.t(lang, (s) => s.components.reportingDetail.reportChannel.label),
    t.t(lang, (s) => s.components.reportingDetail.sourceSystemRecordId.label),
    t.t(lang, (s) => s.components.reportingDetail.reporterContactInfo.label),
    t.t(lang, (s) => s.components.reportingDetail.reporterReferenceCode.label),
    t.t(lang, (s) => s.components.reportingDetail.verified.label),
    t.t(lang, (s) => s.components.reportingDetail.file.label),
  ] as const;

  /* TODO:
   * It would be nice to have an endpoint for retrieving reportingDetails
   * without having to bring each flow version.
   */
  const [state] = useDataLoader([versionID], async () => {
    return await Promise.all(
      versions
        .map((version) => version.versionID)
        .filter((version) => version < versionID)
        .sort((a, b) => a - b)
        .map((version) => env.model.flows.getFlow({ id, versionID: version }))
    );
  });

  return (
    <C.Loader
      loader={state}
      strings={{
        ...t.get(lang, (s) => s.components.loader),
        notFound: {
          ...t.get(lang, (s) => s.components.notFound),
        },
      }}
    >
      {(flows) => (
        <Box sx={tw`overflow-auto mb-4`}>
          <Table>
            <TableHead>
              <TableRow>
                {HEADERS.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {flows.map((f) =>
                f.reportDetails.map((rD) => (
                  <TableRow key={`${f.versionID}_${rD.id}`}>
                    <TableCell>{rD.versionID}</TableCell>
                    <TableCell>{rD.source}</TableCell>
                    <TableCell>{rD.organization?.name ?? null}</TableCell>
                    <TableCell>{dayjs(rD.date).format()}</TableCell>
                    <TableCell>
                      {rD.categories.map((cat) => cat.name).join(', ')}
                    </TableCell>
                    <TableCell>{rD.sourceID}</TableCell>
                    <TableCell>{rD.contactInfo}</TableCell>
                    <TableCell>{rD.refCode}</TableCell>
                    <TableCell>
                      {rD.verified &&
                        t.t(lang, (s) => s.components.mergeModal.button.yes)}
                    </TableCell>
                    <TableCell>
                      {!rD.reportFiles.length ? (
                        <span>--</span>
                      ) : (
                        <Box sx={tw`flex gap-x-2`}>
                          {rD.reportFiles.map((rF, i) => {
                            if (rF.url && isValidUrl(rF.url)) {
                              return (
                                <Link to={rF.url} key={i}>
                                  {rF.title}
                                </Link>
                              );
                            }
                            return <span>{rF.title}</span>;
                          })}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </C.Loader>
  );
};

export default FlowPreviousReportingDetails;
