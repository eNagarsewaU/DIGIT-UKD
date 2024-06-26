import React, { Component } from "react";
import { connect } from "react-redux";
import { Screen } from "modules/common";
import { Icon } from "components";
import PaymentStatus from "egov-ui-kit/common/propertyTax/PaymentStatus";
import {
  fetchProperties,
  fetchReceipts
} from "egov-ui-kit/redux/properties/actions";
import { clearForms } from "egov-ui-kit/redux/form/actions";
import { updatePrepareFormDataFromDraft } from "egov-ui-kit/redux/common/actions";
import {
  createReceiptDetails,
  createReceiptUIInfo
} from "egov-ui-kit/common/propertyTax/PaymentStatus/Components/createReceipt";
import Label from "egov-ui-kit/utils/translationNode";
import { fetchGeneralMDMSData } from "egov-ui-kit/redux/common/actions";
import get from "lodash/get";
import commonConfig from "config/common.js";
import YearDialogue from "egov-ui-kit/common/propertyTax/YearDialogue";

class PaymentSuccess extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    imageUrl: "",
    yearDialogue: {
      dialogueOpen: false,
      urlToAppend: ''
    }
  };
  toggleYearDialogue = () => {
    this.setState({
      yearDialogue: {
        dialogueOpen: !this.state.yearDialogue.dialogueOpen,
        urlToAppend: `/property-tax/assessment-form?assessmentId=${this.props.match.params.assessmentId}&isReassesment=true&isAssesment=true&propertyId=${this.props.match.params.propertyId}&tenantId=${this.props.match.params.tenantId}`
      }
    })
  }

  icon = <Icon action="navigation" name="check" />;

  buttons = {
    button1: "Link previous payments",
    button2: "PT_FINISH_BUTTON"
  };

  successMessages = financialYear => {
    return {
      Message1: (
        <div
          className="rainmaker-displayInline"
          style={{ justifyContent: "center" }}
        >
          <Label
            containerStyle={{ paddingTop: "10px" }}
            fontSize={16}
            label={"PT_TAX"}
            labelStyle={{ color: "#484848", fontWeight: 500 }}
          />
          {financialYear && (
            <Label
              containerStyle={{ margin: "0 3px", paddingTop: "10px" }}
              fontSize={16}
              label={`(${financialYear})`}
              labelStyle={{ color: "#484848", fontWeight: 500 }}
            />
          )}
        </div>
      ),
      Message2: (
        <Label
          containerStyle={{ paddingTop: "10px" }}
          fontSize={16}
          label={"PT_RECEIPTS_SUCCESS_MESSAGE4"}
          labelStyle={{ color: "#484848", fontWeight: 500 }}
        />
      )
    };
  };

  componentDidMount = () => {
    const {
      fetchProperties,
      fetchReceipts,
      match,
      fetchGeneralMDMSData
    } = this.props;
    const { tenantId } = match.params;
    const requestBody = {
      MdmsCriteria: {
        tenantId: commonConfig.tenantId,
        moduleDetails: [
          {
            moduleName: "PropertyTax",
            masterDetails: [
              {
                name: "Floor"
              },
              {
                name: "UsageCategoryMajor"
              },
              {
                name: "UsageCategoryMinor"
              },
              {
                name: "UsageCategorySubMinor"
              },
              {
                name: "OccupancyType"
              },
              {
                name: "PropertyType"
              },
              {
                name: "PropertySubType"
              },
              {
                name: "UsageCategoryDetail"
              },
              {
                name: "ConstructionType",
              },
              {
                name: "Rebate",
              },
              {
                name: "Interest",
              },
              {
                name: "FireCess",
              },
              {
                name: "RoadType",
              },
              {
                name: "Thana",
              }
            ]
          }
        ]
      }
    };
    fetchGeneralMDMSData(requestBody, "PropertyTax", [
      "Floor",
      "UsageCategoryMajor",
      "UsageCategoryMinor",
      "UsageCategorySubMinor",
      "OccupancyType",
      "PropertyType",
      "PropertySubType",
      "UsageCategoryDetail",
      "ConstructionType",
      "Rebate",
      "Penalty",
      "Interest",
      "FireCess",
      "RoadType",
      "Thana"
    ]);
    fetchGeneralMDMSData(
      null,
      "BillingService",
      ["TaxPeriod", "TaxHeadMaster"],
      "",
      commonConfig.tenantId
    );
    fetchProperties([
      { key: "propertyIds", value: match.params.propertyId },
      { key: "tenantId", value: match.params.tenantId }
    ]);
    fetchReceipts([
      { key: "tenantId", value: match.params.tenantId },
      {
        key: "consumerCode",
        value: `${match.params.propertyId}`
      }
    ]);
    this.convertImgToDataURLviaCanvas(
      this.createImageUrl(match.params.tenantId),
      function (data) {
        this.setState({ imageUrl: data });
      }.bind(this)
    );
    this.props.clearForms();
    this.props.updatePrepareFormDataFromDraft({});
  };

  goToHome = () => {
    /* Mseva 2.0 changes */
    this.props.history.push("/");
  };

  convertImgToDataURLviaCanvas = (url, callback, outputFormat) => {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      var canvas = document.createElement("CANVAS");
      var ctx = canvas.getContext("2d");
      var dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback(dataURL);
      canvas = null;
    };
    img.src = url;
  };


  createImageUrl = (tenantId) => {
    const {cities}=this.props;
    let logUrl;
    cities.forEach((city)=>{
      if (city.key===tenantId) {
        logUrl=city.logoId
      }
    })
    return logUrl;
  };

  render() {
    const { generalMDMSDataById, history,loading } = this.props;
    const { assessmentYear } = this.props.match.params;
    const { imageUrl } = this.state;
    const { toggleYearDialogue } = this;

    return (
      <Screen loading={loading}>
        {this.state.yearDialogue.dialogueOpen && <YearDialogue open={this.state.yearDialogue.dialogueOpen} history={history} urlToAppend={this.state.yearDialogue.urlToAppend} closeDialogue={toggleYearDialogue} />}
        <PaymentStatus
          receiptUIDetails={this.props.receiptUIDetails}
          receiptDetails={this.props.receiptDetails}
          floatingButtonColor="#22b25f"
          icon={this.icon}
          toggleYearDialogue={toggleYearDialogue}
          assessmentYear={assessmentYear}
          messages={this.successMessages(assessmentYear)}
          buttons={this.buttons}
          propertyId={this.props.match.params.propertyId}
          primaryAction={this.goToHome}
          noExistingPropertyId={!this.props.existingPropertyId}
          generalMDMSDataById={generalMDMSDataById && generalMDMSDataById}
          receiptImageUrl={imageUrl && imageUrl}
          extraData={this.props.extraData}
        />
      </Screen>
    );
  }
}

const getLatestPropertyDetails = propertyDetailsArray => {
  if (propertyDetailsArray.length > 1) {
    return propertyDetailsArray.reduce((acc, curr) => {
      return acc.assessmentDate > curr.assessmentDate ? acc : curr;
    });
  } else {
    return propertyDetailsArray[0];
  }
};

const mapStateToProps = (state, ownProps) => {
  const { properties, common, app } = state || {};
  const { localizationLabels } = app;
  const { cities } = common;
  const { generalMDMSDataById } = state.common || {};
  const { propertiesById, receipts ,loading} = properties;
  const selProperty =
    propertiesById && propertiesById[ownProps.match.params.propertyId];
  const existingPropertyId = selProperty && selProperty.oldPropertyId;
  const latestPropertyDetails =
    selProperty && getLatestPropertyDetails(selProperty.propertyDetails);
  const rawReceiptDetails = receipts && receipts[0];
  const lastAmount =
    receipts && get(receipts[0], "Bill[0].billDetails[0].totalAmount");
  const totalAmountBeforeLast =
    receipts &&
    receipts.reduce((acc, curr, index) => {
      if (index !== 0) {
        acc += get(curr, "Bill[0].billDetails[0].amountPaid");
      }
      return acc;
    }, 0);
  const totalAmountToPay = lastAmount + totalAmountBeforeLast;
  const totalAmountPaid =
    receipts &&
    receipts.reduce((acc, curr) => {
      acc += get(curr, "Bill[0].billDetails[0].amountPaid");
      return acc;
    }, 0);
  const receiptUIDetails =
    selProperty &&
    cities &&
    createReceiptUIInfo(
      selProperty,
      rawReceiptDetails,
      cities,
      totalAmountToPay,
      true,
      totalAmountPaid,
      latestPropertyDetails
    );
  const receiptDetails =
    selProperty &&
    rawReceiptDetails &&
    cities &&
    createReceiptDetails(
      selProperty,
      latestPropertyDetails,
      rawReceiptDetails,
      localizationLabels,
      cities,
      totalAmountToPay,
      totalAmountPaid
    );
  return {
    loading,
    receiptUIDetails,
    receiptDetails,
    cities,
    existingPropertyId,
    generalMDMSDataById,
    extraData: {
      property: selProperty,
      receipt: rawReceiptDetails
    }
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchProperties: queryObject => dispatch(fetchProperties(queryObject)),
    fetchReceipts: queryObject => dispatch(fetchReceipts(queryObject)),
    fetchGeneralMDMSData: (
      requestBody,
      moduleName,
      masterName,
      key,
      tenantId
    ) =>
      dispatch(
        fetchGeneralMDMSData(requestBody, moduleName, masterName, key, tenantId)
      ),
    updatePrepareFormDataFromDraft: prepareFormData =>
      dispatch(updatePrepareFormDataFromDraft(prepareFormData)),
    clearForms: () => dispatch(clearForms())
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentSuccess);
