//  TODO: Check if this should be done on backend side, Currently not working propperly
import { FormObjectValue, flows } from '@unocha/hpc-data';
import * as XLSX from 'xlsx';
import { FlowHeaderID, TableHeadersProps } from './table-headers';
import { LanguageKey, t } from '../../i18n';
import dayjs from 'dayjs';
import { util } from '@unocha/hpc-core';

const EMPTY_CELL = '--';
const DATE_FORMAT = 'D/M/YYYY';

export const downloadExcel = (
  data: flows.SearchFlowsBatchesResult,
  lang: LanguageKey,
  tableHeaders: Array<TableHeadersProps<FlowHeaderID>>,
  fileName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const flows = data.searchFlowsBatches.flows;
      const sheetData: Array<{ [k: string]: string | number }> = [];
      for (const flow of flows) {
        const tableRow: Array<FormObjectValue> = [];
        for (const tableHeader of tableHeaders) {
          if (tableHeader.active) {
            const label = tableHeader.label;
            const displayLabel = t.t(
              lang,
              (s) => s.components.flowsTable.headers[label]
            );
            switch (label) {
              case 'id': {
                tableRow.push({
                  displayLabel,
                  value: `${flow.id} v${flow.versionID}`,
                });
                break;
              }
              case 'amountUSD': {
                tableRow.push({
                  displayLabel,
                  value:
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
                      : EMPTY_CELL,
                });
                break;
              }
              case 'dataProvider': {
                tableRow.push({
                  displayLabel,
                  value: flow.externalReferences?.at(0)?.systemID || EMPTY_CELL,
                });
                break;
              }
              case 'decisionDate': {
                tableRow.push({
                  displayLabel,
                  value: flow.decisionDate
                    ? dayjs(flow.decisionDate).locale(lang).format(DATE_FORMAT)
                    : EMPTY_CELL,
                });
                break;
              }
              case 'destinationCountry': {
                tableRow.push({
                  displayLabel,
                  value:
                    flow.locations
                      ?.filter((x) => x.direction === 'destination')
                      .map((x) => x.name)
                      .join(', ') || EMPTY_CELL,
                });
                break;
              }
              case 'destinationOrganization': {
                const parkedParentSource = `${t.t(
                  lang,
                  (s) => s.components.flowsTable.parkedSource
                )}: ${flow.parkedParentSource?.orgName.map(
                  (orgName) => orgName
                )}`;

                tableRow.push({
                  displayLabel,
                  value: flow.parkedParentSource
                    ? parkedParentSource
                    : '' +
                        flow.organizations
                          ?.filter((x) => x.direction === 'destination')
                          .map((x) => x.name)
                          .join(', ') || EMPTY_CELL,
                });
                break;
              }
              case 'destinationPlan': {
                tableRow.push({
                  displayLabel,
                  value:
                    flow.plans
                      ?.filter((x) => x.direction === 'destination')
                      .map((x) => x.name)
                      .join(', ') || EMPTY_CELL,
                });
                break;
              }
              case 'destinationYear': {
                tableRow.push({
                  displayLabel,
                  value:
                    flow.usageYears
                      ?.filter((x) => x.direction === 'destination')
                      .map((x) => x.year)
                      .join(', ') || EMPTY_CELL,
                });
                break;
              }
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
                  details.push(
                    t.t(lang, (s) => s.components.flowsTable.inactive)
                  );
                }
                if (flow.parentIDs && flow.parentIDs.length > 0) {
                  details.push(t.t(lang, (s) => s.components.flowsTable.child));
                }
                if (flow.childIDs && flow.childIDs.length > 0) {
                  details.push(
                    t.t(lang, (s) => s.components.flowsTable.parent)
                  );
                }
                tableRow.push({
                  displayLabel,
                  value: details.length > 0 ? details.join(', ') : EMPTY_CELL,
                });
                break;
              }
              case 'exchangeRate': {
                tableRow.push({
                  displayLabel,
                  value: flow.exchangeRate || EMPTY_CELL,
                });
                break;
              }
              case 'flowDate': {
                tableRow.push({
                  displayLabel,
                  value: flow.flowDate
                    ? dayjs(flow.flowDate).locale(lang).format(DATE_FORMAT)
                    : EMPTY_CELL,
                });
                break;
              }
              case 'newMoney': {
                tableRow.push({
                  displayLabel,
                  value: flow.newMoney?.toString() || EMPTY_CELL,
                });
                break;
              }
              case 'reporterRefCode': {
                const uniqueSourceIDs = [
                  ...new Set(
                    flow.reportDetails
                      .map((rd) => rd.refCode)
                      .filter(util.isDefined)
                  ),
                ].join(', ');

                tableRow.push({
                  displayLabel,
                  value:
                    uniqueSourceIDs.length > 0 ? uniqueSourceIDs : EMPTY_CELL,
                });
                break;
              }
              case 'sourceID': {
                const uniqueSourceIDs = [
                  ...new Set(
                    flow.reportDetails
                      .map((rd) => rd.sourceID)
                      .filter(util.isDefined)
                  ),
                ].join(', ');

                tableRow.push({
                  displayLabel,
                  value:
                    uniqueSourceIDs.length > 0 ? uniqueSourceIDs : EMPTY_CELL,
                });
                break;
              }
              case 'sourceOrganization': {
                const parkedParentSource = `${t.t(
                  lang,
                  (s) => s.components.flowsTable.parkedSource
                )}: ${flow.parkedParentSource?.orgName.map(
                  (orgName) => orgName
                )}`;

                tableRow.push({
                  displayLabel,
                  value: flow.parkedParentSource
                    ? parkedParentSource
                    : '' +
                        flow.organizations
                          ?.filter((x) => x.direction === 'source')
                          .map((x) => x.name)
                          .join(', ') || EMPTY_CELL,
                });
                break;
              }
              case 'status': {
                tableRow.push({
                  displayLabel,
                  value: t.t(lang, (s) =>
                    flow.versionID > 1
                      ? s.components.flowsTable.update
                      : s.components.flowsTable.new
                  ),
                });
                break;
              }
              case 'updatedCreated': {
                tableRow.push({
                  displayLabel,
                  value: dayjs(flow.updatedAt).locale(lang).format(DATE_FORMAT),
                });
                break;
              }
            }
          }
        }

        sheetData.push(
          Object.assign(
            {},
            ...tableRow.map((x) => ({ [x.displayLabel]: x.value }))
          )
        );
      }

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
