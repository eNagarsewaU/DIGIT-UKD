import LinearProgress from "egov-ui-framework/ui-atoms/LinearSpinner";
import React from "react";
import Loadable from "react-loadable";

const Loading = () => <LinearProgress />;

const CustomTabContainer = Loadable({
  loader: () => import("./CustomTabContainer"),
  loading: () => <Loading />
});
const LabelContainer = Loadable({
  loader: () => import("./LabelContainer"),
  loading: () => <Loading />
});

const RadioGroupContainer = Loadable({
  loader: () => import("./RadioGroupContainer"),
  loading: () => <Loading />
});

const CheckboxContainer = Loadable({
  loader: () => import("./CheckboxContainer"),
  loading: () => <Loading />
});
const DownloadFileContainer = Loadable({
  loader: () => import("./DownloadFileContainer"),
  loading: () => <Loading />
});
const EstimateCardContainer = Loadable({
  loader: () => import("./EstimateCardContainer"),
  loading: () => <Loading />
});
const AutosuggestContainer = Loadable({
  loader: () => import("./AutosuggestContainer"),
  loading: () => <Loading />
});
const DocumentListContainer = Loadable({
  loader: () => import("./DocumentListContainer"),
  loading: () => <Loading />
});
const PaymentRedirectPage = Loadable({
  loader: () => import("./PaymentRedirectPage"),
  loading: () => <Loading />
});

const DialogContainer = Loadable({
  loader: () => import("./DialogContainer"),
  loading: () => <Loading />
});

const ViewBreakupContainer = Loadable({
  loader: () => import("./ViewbreakupDialogContainer"),
  loading: () => <Loading />
});

const HeaderContainer = Loadable({
  loader: () => import("./HeaderContainer"),
  loading: () => <Loading />
});

const CheckboxContainerPTCommon = Loadable({
  loader: () => import("./CheckboxContainerPTCommon"),
  loading: () => <Loading />
});

const SuccessPTPopupContainer = Loadable({
  loader: () => import("./SuccessPTPopupContainer"),
  loading: () => <Loading />
});


export { CustomTabContainer, RadioGroupContainer,LabelContainer, CheckboxContainer, DownloadFileContainer, EstimateCardContainer, AutosuggestContainer, DocumentListContainer, PaymentRedirectPage, ViewBreakupContainer, DialogContainer, HeaderContainer, CheckboxContainerPTCommon, SuccessPTPopupContainer };

