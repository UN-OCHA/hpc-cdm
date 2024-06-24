import dayjs from 'dayjs';
import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';

interface FlowContextType {
  flowValue: any;
  setFlowValue: Dispatch<SetStateAction<any>>;
  initialValue: any;
  isEdit: any;
  currentVersionData: any;
  environment: any;
  prevDetails: any;
  versionData: any;
  isRestricted: any;
  errorCorrection: any;
  inputEntries: any;
  flowId: any;
  versionId: any;
  initializeInputEntries: any;
  rejectInputEntry: any;
  currentVersionID: any;
  currentFlowID: any;
  currentVersionActiveStatus: any;
  isPending: any;
  isSuperseded: any;
  isCancelled: any;
  isCancellation: any;
  isNewPending: any;
  isUpdatePending: any;
  canReactive: any;
  pendingFieldsAllApplied: any;
  allFieldsReviewed: any;
  pendingVersionV1: any;
}

const initialValueFormat = {
  amountUSD: '',
  amountOriginal: '',
  exchangeRateUsed: '',
  keywords: [],
  flowStatus: '',
  flowType: { value: 133, displayLabel: 'Standard' },
  flowDescription: '',
  firstReported: dayjs().format('DD/MM/YYYY'),
  decisionDate: null,
  budgetYear: '',
  flowDate: null,
  contributionType: { value: 50, displayLabel: 'Financial' },
  earmarkingType: '',
  method: { value: 156, displayLabel: 'Traditional aid' },
  cashTransfer: '',
  beneficiaryGroup: '',
  inactiveReason: '',
  notes: '',
  sourceOrganizations: [],
  sourceLocations: [],
  sourceUsageYears: [],
  sourceProjects: [],
  sourcePlans: [],
  sourceGoverningEntities: [],
  sourceGlobalClusters: [],
  sourceEmergencies: [],
  destinationOrganizations: [],
  destinationLocations: [],
  destinationUsageYears: [],
  destinationProjects: [],
  destinationPlans: [],
  destinationGoverningEntities: [],
  destinationGlobalClusters: [],
  destinationEmergencies: [],
  origCurrency: '',
  includeChildrenOfParkedFlows: true,
  reportDetails: [
    {
      verified: 'verified',
      reportSource: 'primary',
      reporterReferenceCode: '',
      reportChannel: '',
      reportedOrganization: { value: '', displayLabel: '' },
      reportedDate: null,
      reporterContactInformation: '',
      sourceSystemRecordId: '',
      reportFiles: [
        {
          title: '',
          fileName: '',
          UploadFileUrl: '',
          size: 0,
          type: '',
        },
      ],
      reportFileTitle: '',
      reportUrlTitle: '',
      reportUrl: '',
    },
  ],
  parentFlow: [],
  childFlow: [],
  isParkedParent: false,
  sources: {},
};

const FlowContext = createContext<FlowContextType | undefined>(undefined);

const FlowContextProvider: React.FC<{
  children: ReactNode;
  initialValue: any;
  isEdit: any;
  currentVersionData: any;
  environment: any;
  prevDetails: any;
  versionData: any;
  isRestricted: any;
  errorCorrection: any;
  inputEntries: any;
  flowId: any;
  versionId: any;
  initializeInputEntries: any;
  rejectInputEntry: any;
  currentVersionID: any;
  currentFlowID: any;
  currentVersionActiveStatus: any;
  isPending: any;
  isSuperseded: any;
  isCancelled: any;
  isCancellation: any;
  isNewPending: any;
  isUpdatePending: any;
  canReactive: any;
  pendingFieldsAllApplied: any;
  allFieldsReviewed: any;
  pendingVersionV1: any;
}> = ({
  children,
  initialValue,
  isEdit,
  currentVersionData,
  environment,
  prevDetails,
  versionData,
  isRestricted,
  errorCorrection,
  inputEntries,
  flowId,
  versionId,
  initializeInputEntries,
  rejectInputEntry,
  currentVersionID,
  currentFlowID,
  currentVersionActiveStatus,
  isPending,
  isSuperseded,
  isCancelled,
  isCancellation,
  isNewPending,
  isUpdatePending,
  canReactive,
  pendingFieldsAllApplied,
  allFieldsReviewed,
  pendingVersionV1,
}) => {
  const [flowValue, setFlowValue] = useState<any>(initialValueFormat);

  useEffect(() => {
    setFlowValue(initialValue);
  }, [initialValue]);

  return (
    <FlowContext.Provider
      value={{
        flowValue,
        setFlowValue,
        initialValue,
        isEdit,
        currentVersionData,
        environment,
        prevDetails,
        versionData,
        isRestricted,
        errorCorrection,
        inputEntries,
        flowId,
        versionId,
        initializeInputEntries,
        rejectInputEntry,
        currentVersionID,
        currentFlowID,
        currentVersionActiveStatus,
        isPending,
        isSuperseded,
        isCancelled,
        isCancellation,
        isNewPending,
        isUpdatePending,
        canReactive,
        pendingFieldsAllApplied,
        allFieldsReviewed,
        pendingVersionV1,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export { FlowContextProvider, FlowContext };
