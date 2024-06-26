import { Loader } from "@egovernments/digit-ui-react-components";
import React, { useEffect } from "react";
import { useParams, useHistory, useRouteMatch, useLocation } from "react-router-dom";
import Routes from "./routes";
// import { myBillMap } from "./myBillsKeysMap";

export const MyBills = ({ stateCode }) => {
  const { businessService } = useParams();
  const { tenantId: _tenantId } = window.Digit.Hooks.useQueryParams();

  const { isLoading: storeLoading, data: store } = window.Digit.Services.useStore({
    stateCode,
    moduleCode: businessService,
    language: window.Digit.StoreData.getCurrentLanguage(),
  });

  const history = useHistory();
  const { url } = useRouteMatch();
  const location = useLocation();

  const { tenantId } = window.Digit.UserService.getUser()?.info || location?.state || { tenantId: _tenantId } || {};

  if (!tenantId && !location?.state?.fromSearchResults) {
    history.replace(`/digit-ui/citizen/login`, { from: url });
  }

  const { isLoading, data } = window.Digit.Hooks.useFetchCitizenBillsForBuissnessService(
    { businessService },
    { refetchOnMount: true, enabled: !location?.state?.fromSearchResults }
  );
  const { isLoading: mdmsLoading, data: mdmsBillingData } = window.Digit.Hooks.useGetPaymentRulesForBusinessServices(tenantId);

  const billsList = data?.Bill || [];

  const getPaymentRestrictionDetails = () => {
    const payRestrictiondetails = mdmsBillingData?.MdmsRes?.BillingService?.BusinessService;
    if (payRestrictiondetails?.length) return payRestrictiondetails.filter((e) => e.code == businessService)[0];
    else
      return {
        // isAdvanceAllowed: false,
        // isVoucherCreationEnabled: true,
        // minAmountPayable: 100,
        // partPaymentAllowed: true,
      };
  };

  const getProps = () => ({ billsList, paymentRules: getPaymentRestrictionDetails(), businessService });

  if (mdmsLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <Routes {...getProps()} />
    </React.Fragment>
  );
};
