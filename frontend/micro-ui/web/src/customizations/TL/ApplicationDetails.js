import {
  Card,
  CardHeader,
  Loader,
  MultiLink,
  Row,
  SubmitBar,
  Header,
  CardSubHeader,
  CardSectionHeader,
} from "@egovernments/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
// import getPDFData from "../../../utils/getTLAcknowledgementData";
// import TLWFApplicationTimeline from "../../../pageComponents/TLWFApplicationTimeline";

const ApplicationDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { tenantId } = useParams();
  const history = useHistory();
  const [bill, setBill] = useState(null);
  const { data: storeData } = window.Digit.Hooks.useStore.getInitData();
  const [mutationHappened, setMutationHappened, clear] =
    window.Digit.Hooks.useSessionStorage("CITIZEN_TL_MUTATION_HAPPENED", false);
  const { tenants } = storeData || {};
  let multiBoxStyle = {
    border: "groove",
    background: "#FAFAFA",
    borderRadius: "4px",
    paddingInline: "10px",
    marginTop: "10px",
    marginBottom: "10px",
  };
  let multiHeaderStyle = {
    marginBottom: "10px",
    marginTop: "10px",
    color: "#505A5F",
  };
  //todo: hook should return object to render the data
  const {
    isLoading,
    isError,
    error,
    data: application,
    error: errorApplication,
  } = window.Digit.Hooks.tl.useTLApplicationDetails({
    tenantId: tenantId,
    applicationNumber: id,
  });

  useEffect(() => {
    setMutationHappened(false);
  }, []);

  const { data: paymentsHistory } = window.Digit.Hooks.tl.useTLPaymentHistory(
    tenantId,
    id
  );
  useEffect(() => {
    if (application) {
      window.Digit.PaymentService.fetchBill(tenantId, {
        consumerCode: application[0]?.applicationNumber,
        businessService: application[0]?.businessService,
      }).then((res) => {
        setBill(res?.Bill[0]);
      });
    }
  }, [application]);
  const [showOptions, setShowOptions] = useState(false);
  useEffect(() => {}, [application, errorApplication]);

  if (isLoading) {
    return <Loader />;
  }

  if (application?.applicationDetails?.length === 0) {
    history.goBack();
  }

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find(
      (tenant) => tenant.code === application[0]?.tenantId
    );
    let res = application[0];
    // const data = getPDFData({ ...res }, tenantInfo, t);
    // data.then((ress) => window.Digit.Utils.pdf.generate(ress));
    setShowOptions(false);
  };

  const downloadPaymentReceipt = async () => {
    const receiptFile = {
      filestoreIds: [paymentsHistory.Payments[0]?.fileStoreId],
    };
    if (!receiptFile?.fileStoreIds?.[0]) {
      const newResponse = await window.Digit.PaymentService.generatePdf(
        tenantId,
        { Payments: [paymentsHistory.Payments[0]] },
        "tl-receipt"
      );
      const fileStore = await window.Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: newResponse.filestoreIds[0],
      });
      window.open(fileStore[newResponse.filestoreIds[0]], "_blank");
      setShowOptions(false);
    } else {
      const fileStore = await window.Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: receiptFile.filestoreIds[0],
      });
      window.open(fileStore[receiptFile.filestoreIds[0]], "_blank");
      setShowOptions(false);
    }
  };

  const downloadTLcertificate = async () => {
    const TLcertificatefile = await window.Digit.PaymentService.generatePdf(
      tenantId,
      { Licenses: application },
      "tlcertificate"
    );
    const receiptFile = await window.Digit.PaymentService.printReciept(tenantId, {
      fileStoreIds: TLcertificatefile.filestoreIds[0],
    });
    window.open(receiptFile[TLcertificatefile.filestoreIds[0]], "_blank");
    setShowOptions(false);
  };

  const dowloadOptions =
    paymentsHistory?.Payments?.length > 0
      ? [
          {
            label: t("TL_CERTIFICATE"),
            onClick: downloadTLcertificate,
          },
          {
            label: t("CS_COMMON_PAYMENT_RECEIPT"),
            onClick: downloadPaymentReceipt,
          },
        ]
      : [
          {
            label: t("CS_COMMON_APPLICATION_ACKNOWLEDGEMENT"),
            onClick: handleDownloadPdf,
          },
        ];

  return (
    <React.Fragment>
      <div className="cardHeaderWithOptions">
        <Header>{t("CS_TITLE_APPLICATION_DETAILS")}</Header>
        <MultiLink
          className="multilinkWrapper"
          onHeadClick={() => setShowOptions(!showOptions)}
          displayOptions={showOptions}
          options={dowloadOptions}
        />
      </div>
      <Card style={{ position: "relative" }}>
        {application?.map((application, index) => {
          return (
            <div key={index} className="employee-data-table">
              <Row
                className="employee-data-table"
                label={t("TL_COMMON_TABLE_COL_APP_NO")}
                text={application?.applicationNumber}
                textStyle={{ whiteSpace: "pre", border: "none" }}
              />
              <Row
                label={t("TL_APPLICATION_CATEGORY")}
                text={t("ACTION_TEST_TRADE_LICENSE")}
                textStyle={{ whiteSpace: "pre" }}
              />
              <CardSectionHeader>
                {t("TL_OWNERSHIP_DETAILS_HEADER")}
              </CardSectionHeader>
              {application?.tradeLicenseDetail.owners.map((ele, index) => {
                return (
                  <div key={index} style={multiBoxStyle}>
                    <CardSectionHeader style={multiHeaderStyle}>
                      {`${t("TL_PAYMENT_PAID_BY_PLACEHOLDER")} - ` +
                        (index + 1)}
                    </CardSectionHeader>
                    <Row
                      label={`${t("TL_COMMON_TABLE_COL_OWN_NAME")}`}
                      text={t(ele.name)}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                    <Row
                      label={`${t("TL_NEW_OWNER_DETAILS_GENDER_LABEL")}`}
                      text={t(ele.gender)}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                    <Row
                      label={`${t("TL_NEW_OWNER_DETAILS_PAN_LABEL")}`}
                      text={t(ele.pan || "NA")}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                     <Row
                      label={`${t("TL_NEW_OWNER_DETAILS_DOB_LABEL")}`}
                      text={t(ele.dob || "NA")}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                     <Row
                      label={`${t("TL_GUARDIAN_S_NAME_LABEL")}`}
                      text={t(ele?.fatherOrHusbandName || "NA")}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                     <Row
                      label={`${t("TL_RELATIONSHIP_WITH_GUARDIAN_LABEL")}`}
                      text={t(ele?.relationship || "NA")}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                    <Row
                      label={`${t("TL_MOBILE_NUMBER_LABEL")}`}
                      text={t(ele.mobileNumber)}
                      textStyle={{ whiteSpace: "pre" }}
                    />
                  </div>
                );
              })}
              <Row
                style={{ border: "none" }}
                label={t("TL_COMMON_TABLE_COL_STATUS")}
                text={t(`WF_NEWTL_${application?.status}`)}
                textStyle={{ whiteSpace: "pre-wrap", width: "70%" }}
              />
              <Row
                style={{ border: "none" }}
                label={t("TL_COMMON_TABLE_COL_SLA_NAME")}
                text={`${Math.round(
                  application?.SLA / (1000 * 60 * 60 * 24)
                )} ${t("TL_SLA_DAYS")}`}
                textStyle={{ whiteSpace: "pre" }}
              />
              <Row
                style={{ border: "none" }}
                label={t("TL_COMMON_TABLE_COL_TRD_NAME")}
                text={application?.tradeName}
                textStyle={{ whiteSpace: "pre-wrap", width: "70%" }}
              />
              <CardSubHeader>{t("TL_TRADE_UNITS_HEADER")}</CardSubHeader>
              {application?.tradeLicenseDetail?.tradeUnits?.map(
                (ele, index) => {
                  return (
                    <div key={index} style={multiBoxStyle}>
                      <CardSectionHeader style={multiHeaderStyle}>
                        {t("TL_UNIT_HEADER")} {index + 1}
                      </CardSectionHeader>
                      <Row
                        label={t("TL_NEW_TRADE_DETAILS_TRADE_CAT_LABEL")}
                        text={t(
                          `TRADELICENSE_TRADETYPE_${
                            ele?.tradeType.split(".")[0]
                          }`
                        )}
                        textStyle={{ whiteSpace: "pre" }}
                      />
                      <Row
                        style={{ border: "none" }}
                        label={t("TL_NEW_TRADE_DETAILS_TRADE_TYPE_LABEL")}
                        text={t(
                          `TRADELICENSE_TRADETYPE_${
                            ele?.tradeType.split(".")[1]
                          }`
                        )}
                        textStyle={{ whiteSpace: "pre" }}
                      />
                      <Row
                        style={{ border: "none" }}
                        label={t("TL_NEW_TRADE_DETAILS_TRADE_SUBTYPE_LABEL")}
                        text={t(
                          `TRADELICENSE_TRADETYPE_${
                            ele?.tradeType.split(".")[0]
                          }_${ele?.tradeType.split(".")[1]}_${ele?.tradeType
                            .split(".")[2]
                            .split("-")
                            .join("_")}`
                        )}
                        textStyle={{ whiteSpace: "pre-wrap", width: "70%" }}
                      />
                    </div>
                  );
                }
              )}
              {Array.isArray(application?.tradeLicenseDetail?.accessories) &&
                application?.tradeLicenseDetail?.accessories.length > 0 && (
                  <CardSubHeader style={{ paddingTop: "7px" }}>
                    {t("TL_NEW_TRADE_DETAILS_HEADER_ACC")}
                  </CardSubHeader>
                )}
              {Array.isArray(application?.tradeLicenseDetail?.accessories) &&
                application?.tradeLicenseDetail?.accessories.length > 0 &&
                application?.tradeLicenseDetail?.accessories?.map(
                  (ele, index) => {
                    return (
                      <div key={index} style={multiBoxStyle}>
                        <CardSectionHeader style={multiHeaderStyle}>
                          {t("TL_ACCESSORY_LABEL")} {index + 1}
                        </CardSectionHeader>
                        <Row
                          style={{ border: "none" }}
                          label={t("TL_REVIEWACCESSORY_TYPE_LABEL")}
                          text={t(
                            `TL_${ele?.accessoryCategory.split("-").join("_")}`
                          )}
                          textStyle={{ whiteSpace: "pre" }}
                        />
                        <Row
                          label={t("TL_NEW_TRADE_ACCESSORY_COUNT_LABEL")}
                          text={ele?.count}
                          textStyle={{ whiteSpace: "pre" }}
                        />
                        <Row
                          label={t("TL_NEW_TRADE_ACCESSORY_UOM_LABEL")}
                          text={ele?.uom}
                          textStyle={{ whiteSpace: "pre" }}
                        />
                        <Row
                          label={t("TL_NEW_TRADE_ACCESSORY_UOMVALUE_LABEL")}
                          text={ele?.uomValue}
                          textStyle={{ whiteSpace: "pre" }}
                        />
                      </div>
                    );
                  }
                )}
              <Row label="" />
              <Row
                style={{ border: "none" }}
                label={t("TL_NEW_TRADE_ADDRESS_LABEL")}
                text={`${
                  application?.tradeLicenseDetail?.address?.doorNo?.trim()
                    ? `${application?.tradeLicenseDetail?.address?.doorNo?.trim()}, `
                    : ""
                } ${
                  application?.tradeLicenseDetail?.address?.street?.trim()
                    ? `${application?.tradeLicenseDetail?.address?.street?.trim()}, `
                    : ""
                }${t(
                  application?.tradeLicenseDetail?.address?.locality?.name
                )}, ${t(application?.tradeLicenseDetail?.address?.city)} ${
                  application?.tradeLicenseDetail?.address?.pincode?.trim()
                    ? `,${application?.tradeLicenseDetail?.address?.pincode?.trim()}`
                    : ""
                }`}
                textStyle={{ whiteSpace: "pre-wrap", width: "70%" }}
              />
              {/* <TLWFApplicationTimeline application={application} id={id} /> */}
              {application?.status == "CITIZENACTIONREQUIRED" ? (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/tl/tradelicence/edit-application/${application?.applicationNumber}/${application?.tenantId}`,
                    state: {},
                  }}
                >
                  <SubmitBar label={t("COMMON_EDIT")} />
                </Link>
              ) : null}
              {/* //TODO: change the actions to be fulfilled from workflow nextactions */}
              {application?.status == "PENDINGPAYMENT" ? (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
                    state: { bill, tenantId: tenantId },
                  }}
                >
                  <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                </Link>
              ) : null}
              {/* APPROVED 
              {application?.status == "APPROVED" ? (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/tl/tradelicence/edit-application/${application?.applicationNumber}/${application?.tenantId}`,
                    state: {},
                  }}
                >
                  <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                </Link>
              ) : null} */}
            </div>
          );
        })}
      </Card>
    </React.Fragment>
  );
};

// ApplicationDetails
const customize = () => {
  window.Digit.ComponentRegistryService.setComponent(
    "ApplicationDetails",
    ApplicationDetails
  );
};

export default customize;
