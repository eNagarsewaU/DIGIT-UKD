import React, { Component } from "react";
import { connect } from "react-redux";
import { Screen } from "modules/common";
import { Icon } from "components";
import PaymentStatus from "egov-ui-kit/common/propertyTax/PaymentStatus";
import {
  fetchProperties,
  fetchReceipts
} from "egov-ui-kit/redux/properties/actions";
import {
  createReceiptDetails,
  createReceiptUIInfo
} from "egov-ui-kit/common/propertyTax/PaymentStatus/Components/createReceipt";
import Label from "egov-ui-kit/utils/translationNode";
import { fetchGeneralMDMSData } from "egov-ui-kit/redux/common/actions";
import get from "lodash/get";
import commonConfig from "config/common.js";

class PaymentSuccess extends Component {
  state = {
    imageUrl: ""
  };

  icon = <Icon action="navigation" name="check" />;

  buttons = {
    button1: "Link previous payments",
    button2: "PT_FINISH_BUTTON"
  };

  successMessages = {
    Message1: (
      <Label
        containerStyle={{ paddingTop: "10px" }}
        fontSize={16}
        label={"PT_RECEIPT_THANKYOU"}
        labelStyle={{ color: "#484848", fontWeight: 500 }}
      />
    ),
    Message2: (
      <Label
        containerStyle={{ paddingTop: "10px" }}
        fontSize={16}
        label={"PT_RECEIPTS_SUCCESS_MESSAGE"}
        labelStyle={{ color: "#484848", fontWeight: 500 }}
      />
    )
  };

  componentDidMount = () => {
    const {
      fetchProperties,
      fetchReceipts,
      match,
      fetchGeneralMDMSData
    } = this.props;
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
      "UsageCategoryDetail"
    ]);
    fetchProperties([
      { key: "ids", value: match.params.propertyId },
      { key: "tenantId", value: match.params.tenantId }
    ]);
    fetchReceipts([
      { key: "tenantId", value: match.params.tenantId },
      {
        key: "consumerCode",
        value: `${match.params.propertyId}:${match.params.assessmentId}`
      }
    ]);
    this.convertImgToDataURLviaCanvas(
      this.createImageUrl(match.params.tenantId),
      function(data) {
        this.setState({ imageUrl: data });
      }.bind(this)
    );
  };

  goToHome = () => {
    /* Mseva 2.0 changes */
    this.props.history.push("/");
  };

  convertImgToDataURLviaCanvas = (url, callback, outputFormat) => {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
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

  createImageUrl = tenantId => {
    return `https://s3.ap-south-1.amazonaws.com/ukd-assets/${tenantId}/logo.png`;
  };

  render() {
    const { generalMDMSDataById } = this.props;
    const { imageUrl } = this.state;
    return (
      <Screen>
        <PaymentStatus
          receiptUIDetails={this.props.receiptUIDetails}
          receiptDetails={this.props.receiptDetails}
          floatingButtonColor="#22b25f"
          icon={this.icon}
          messages={this.successMessages}
          buttons={this.buttons}
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
  const { propertiesById, receipts } = properties;
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
    fetchGeneralMDMSData: (requestBody, moduleName, masterName) =>
      dispatch(fetchGeneralMDMSData(requestBody, moduleName, masterName))
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentSuccess);
