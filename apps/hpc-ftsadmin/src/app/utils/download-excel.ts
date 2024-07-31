import { Workbook } from 'exceljs';
import { flows } from '@unocha/hpc-data';
import { FlowHeaderID, TableHeadersProps } from './table-headers';
import { LanguageKey, t } from '../../i18n';
import dayjs from 'dayjs';
import { util } from '@unocha/hpc-core';

const EMPTY_CELL = '--';
const DATE_FORMAT = 'D/M/YYYY';

export const downloadExcel = async (
  data: flows.SearchFlowsBatchesResult,
  lang: LanguageKey,
  tableHeaders: Array<TableHeadersProps<FlowHeaderID>>,
  fileName: string
): Promise<void> => {
  const flows = data.searchFlowsBatches.flows;

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  const headers: string[] = tableHeaders
    .filter((header) => header.active)
    .map((header) =>
      t.t(lang, (s) => s.components.flowsTable.headers[header.label])
    );

  worksheet.addRow(headers);

  for (const flow of flows) {
    const tableRow: { [label: string]: string | number } = {};

    for (const tableHeader of tableHeaders) {
      if (tableHeader.active) {
        const label = tableHeader.label;
        const displayLabel = t.t(
          lang,
          (s) => s.components.flowsTable.headers[label]
        );

        switch (label) {
          case 'id':
            tableRow[displayLabel] = `${flow.id} v${flow.versionID}`;
            break;

          case 'amountUSD':
            tableRow[displayLabel] =
              parseInt(flow.amountUSD) > 0
                ? new Intl.NumberFormat(lang, {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(parseInt(flow.amountUSD))
                : flow.origAmount && flow.origCurrency
                ? new Intl.NumberFormat(lang, {
                    style: 'currency',
                    currency: flow.origCurrency,
                    maximumFractionDigits: 0,
                  }).format(parseInt(flow.origAmount))
                : EMPTY_CELL;
            break;

          case 'dataProvider':
            tableRow[displayLabel] =
              flow.externalReferences?.at(0)?.systemID || EMPTY_CELL;
            break;

          case 'decisionDate':
            tableRow[displayLabel] = flow.decisionDate
              ? dayjs(flow.decisionDate).locale(lang).format(DATE_FORMAT)
              : EMPTY_CELL;
            break;

          case 'destinationCountry':
            tableRow[displayLabel] =
              flow.locations
                ?.filter((x) => x.direction === 'destination')
                .map((x) => x.name)
                .join(', ') || EMPTY_CELL;
            break;

          case 'destinationOrganization': {
            const destinationOrg = flow.parkedParentSource
              ? `${t.t(
                  lang,
                  (s) => s.components.flowsTable.parkedSource
                )}: ${flow.parkedParentSource?.orgName.join(', ')}`
              : flow.organizations
                  ?.filter((x) => x.direction === 'destination')
                  .map((x) => x.name)
                  .join(', ') || EMPTY_CELL;

            tableRow[displayLabel] = destinationOrg;
            break;
          }
          case 'destinationPlan':
            tableRow[displayLabel] =
              flow.plans
                ?.filter((x) => x.direction === 'destination')
                .map((x) => x.name)
                .join(', ') || EMPTY_CELL;
            break;

          case 'destinationYear':
            tableRow[displayLabel] =
              flow.usageYears
                ?.filter((x) => x.direction === 'destination')
                .map((x) => x.year)
                .join(', ') || EMPTY_CELL;
            break;

          case 'details': {
            const details: string[] = [];

            if (flow.categories) {
              details.push(
                ...flow.categories
                  .filter((cat) => cat.group === 'flowStatus')
                  .map((cat) => cat.name.toLowerCase())
              );
            }
            if (flow.restricted) {
              details.push(
                t.t(lang, (s) => s.components.flowsTable.restricted)
              );
            }
            if (!flow.activeStatus) {
              details.push(t.t(lang, (s) => s.components.flowsTable.inactive));
            }
            if ((flow.parentIDs?.length ?? 0) > 0) {
              details.push(t.t(lang, (s) => s.components.flowsTable.child));
            }
            if ((flow.childIDs?.length ?? 0) > 0) {
              details.push(t.t(lang, (s) => s.components.flowsTable.parent));
            }

            tableRow[displayLabel] =
              details.length > 0 ? details.join(', ') : EMPTY_CELL;
            break;
          }

          case 'exchangeRate':
            tableRow[displayLabel] = flow.exchangeRate || EMPTY_CELL;
            break;

          case 'flowDate':
            tableRow[displayLabel] = flow.flowDate
              ? dayjs(flow.flowDate).locale(lang).format(DATE_FORMAT)
              : EMPTY_CELL;
            break;

          case 'newMoney':
            tableRow[displayLabel] = flow.newMoney?.toString() || EMPTY_CELL;
            break;

          case 'reporterRefCode': {
            const reporterRefCodes = [
              ...new Set(
                flow.reportDetails
                  .map((rd) => rd.refCode)
                  .filter(util.isDefined)
              ),
            ].join(', ');

            tableRow[displayLabel] =
              reporterRefCodes.length > 0 ? reporterRefCodes : EMPTY_CELL;
            break;
          }
          case 'sourceID': {
            const sourceIDs = [
              ...new Set(
                flow.reportDetails
                  .map((rd) => rd.sourceID)
                  .filter(util.isDefined)
              ),
            ].join(', ');

            tableRow[displayLabel] =
              sourceIDs.length > 0 ? sourceIDs : EMPTY_CELL;
            break;
          }
          case 'sourceOrganization': {
            const sourceOrg = flow.parkedParentSource
              ? `${t.t(
                  lang,
                  (s) => s.components.flowsTable.parkedSource
                )}: ${flow.parkedParentSource?.orgName.join(', ')}`
              : flow.organizations
                  ?.filter((x) => x.direction === 'source')
                  .map((x) => x.name)
                  .join(', ') || EMPTY_CELL;

            tableRow[displayLabel] = sourceOrg;
            break;
          }

          case 'status':
            tableRow[displayLabel] = t.t(lang, (s) =>
              flow.versionID > 1
                ? s.components.flowsTable.update
                : s.components.flowsTable.new
            );
            break;

          case 'updatedCreated':
            tableRow[displayLabel] = dayjs(flow.updatedAt)
              .locale(lang)
              .format(DATE_FORMAT);
            break;
        }
      }
    }

    worksheet.addRow(Object.values(tableRow));
  }

  return await workbook.xlsx.writeBuffer().then((data) => {
    const url = URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  });
};
