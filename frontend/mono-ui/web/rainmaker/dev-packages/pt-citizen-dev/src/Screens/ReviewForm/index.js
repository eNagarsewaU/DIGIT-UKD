import React, { Component } from "react";
import { Icon } from "components";
import CalculationDetails from "./components/CalculationDetails";
import PropertyTaxDetailsCard from "./components/PropertyTaxDetails";
import { Card } from "components";
import { httpRequest } from "egov-ui-kit/utils/api";
import { connect } from "react-redux";
import { MDMS } from "egov-ui-kit/utils/endPoints";
import EditIcon from "./components/EditIcon";
import {getQueryValue,
  findCorrectDateObj,
  findCorrectDateObjPenaltyIntrest
} from "egov-ui-kit/utils/PTCommon";
import Label from "egov-ui-kit/utils/translationNode";
import { SingleCheckbox } from "components";
import "./index.css";
import { convertToArray } from "egov-ui-kit/config/forms/specs/PropertyTaxPay/propertyCreateUtils";
import PropertyAddressInfo from 'egov-ui-kit/common/propertyTax/Property/components/PropertyAddressInfo';
import AssessmentInfo from 'egov-ui-kit/common/propertyTax/Property/components/AssessmentInfo';
import OwnerInfo from 'egov-ui-kit/common/propertyTax/Property/components/OwnerInfo';
import DocumentsInfo from "egov-ui-kit/common/propertyTax/Property/components/DocumentsInfo";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";


const defaultIconStyle = {
  fill: "#767676",
  width: 22,
  height: 22,
  marginLeft: 15,
  marginRight: 10
};


class ReviewForm extends Component {
  state = {
    valueSelected: "Full_Amount",
    importantDates: {},
    totalAmountTobePaid: 0,
    errorText: "",
    pattern: false,
    minLength: 1,
    maxLength: 11,
    termsAccepted: false,
    calculationDetails: false
  };

  componentDidMount() {
    //this.getImportantDates();
    this.props.getEstimates();
  }

  getImportantDates = async () => {
    const { currentTenantId } = this.props;
    try {
      let ImpDatesResponse = await httpRequest(
        MDMS.GET.URL,
        MDMS.GET.ACTION,
        [],
        {
          MdmsCriteria: {
            tenantId: currentTenantId,
            moduleDetails: [
              {
                moduleName: "PropertyTax",
                masterDetails: [
                  {
                    name: "Rebate"
                  },
                  {
                    name: "Penalty"
                  },
                  {
                    name: "Interest"
                  },
                  {
                    name: "FireCess"
                  }
                ]
              }
            ]
          }
        }
      );
      if (ImpDatesResponse && ImpDatesResponse.MdmsRes.PropertyTax) {
        const {
          Interest,
          FireCess,
          Rebate,
          Penalty
        } = ImpDatesResponse.MdmsRes.PropertyTax;
        const { financialYr } = this.props;
        const intrest =Interest &&  findCorrectDateObjPenaltyIntrest(financialYr, Interest);
        const fireCess = findCorrectDateObj(financialYr, FireCess);
        const rebate = findCorrectDateObj(financialYr, Rebate);
        const penalty = findCorrectDateObjPenaltyIntrest(financialYr, Penalty);
        this.setState({
          importantDates: {
            intrest,
            fireCess,
            rebate,
            penalty
          }
        });
      }
    } catch (e) {
      alert(e);
    }
  };

  getErrorMessage = value => {
    let { totalAmount } = this.props.estimationDetails[0] || {};
    let errorText = `amount should be numeric`;
    if (isFinite(value) && value >= totalAmount) {
      errorText = `can't be greater than ${parseInt(totalAmount) - 1}`;
    } else if (isFinite(value) && value <= 100) {
      errorText = "can't be less than 100";
    }
    return errorText;
  };

  handleFieldChange = (event, value) => {
    let { totalAmount } = this.props.estimationDetails[0] || {};
    if (
      isNaN(parseFloat(value)) ||
      !isFinite(value) ||
      value >= totalAmount ||
      value < 100
    ) {
      this.setState(
        {
          errorText: this.getErrorMessage(value)
        },
        () => {
          this.props.updateTotalAmount(
            value,
            this.state.valueSelected === "Full_Amount",
            this.state.errorText
          );
        }
      );
    } else {
      this.setState(
        {
          errorText: ""
        },
        () => {
          this.props.updateTotalAmount(
            value,
            this.state.valueSelected === "Full_Amount",
            this.state.errorText
          );
        }
      );
    }
  };

  updateTotalAmount = value =>
    this.props.updateTotalAmount(
      value,
      this.state.valueSelected === "Full_Amount"
    );

  onRadioButtonChange = e => {
    let { estimationDetails } = this.props;
    let { totalAmount } = estimationDetails[0] || {};
    if (e.target.value === "Full_Amount") {
      this.setState(
        {
          totalAmountTobePaid: totalAmount,
          valueSelected: "Full_Amount",
          errorText: ""
        },
        () => {
          this.updateTotalAmount(this.props.totalAmountToBePaid);
        }
      );
    } else {
      this.setState(
        { totalAmountTobePaid: 0, valueSelected: "Partial_Amount" },
        () => {
          this.updateTotalAmount(100);
        }
      );
    }
  };

  onEditButtonClick = index => {
    let { onTabClick } = this.props;
    this.props.prepareFinalObject("propertiesEdited", true);
    onTabClick(index);
  };

  openCalculationDetails = () => {
    this.setState({ calculationDetails: true });
  };

  closeCalculationDetails = () => {
    this.setState({ calculationDetails: false });
  };

  editIcon = (
    <Icon
      onClick={this.handleEdit}
      style={defaultIconStyle}
      color="#ffffff"
      action="image"
      name="edit"
    />
  );
  render() {
    let { handleFieldChange, onRadioButtonChange, onEditButtonClick } = this;
    let { valueSelected, importantDates, errorText } = this.state;
    let {
      stepZero,
      stepTwo,
      stepOne,
      estimationDetails,
      totalAmountToBePaid,
      isPartialPaymentInValid,
      termsAccepted,
      termsError,
      isAssesment,
      toggleTerms
    } = this.props;
    let { totalAmount } = estimationDetails[0] || {};
    const { generalMDMSDataById = {} ,location={}} = this.props;
    
  const { search } = location;
    const isReassess = Boolean(getQueryValue(search, "isReassesment").replace('false', ''));
      const isAssess = Boolean(getQueryValue(search, "isAssesment").replace('false', ''));
    return (
      <div>
        <Card
          textChildren={
            <div className="col-sm-12 col-xs-12" style={{ alignItems: "center" }}>
              <div>
                <Label
                  labelStyle={{ letterSpacing: "0.67px", color: "rgba(0, 0, 0, 0.87)", fontWeight: "400", lineHeight: "19px" }}
                  label={'PT_APPLICATION_SUMMARY'}
                  fontSize="20px"
                />

              </div>
              {(isAssess||isReassess)&& <PropertyTaxDetailsCard
                estimationDetails={estimationDetails}
                importantDates={importantDates}
                openCalculationDetails={this.openCalculationDetails}
                optionSelected={valueSelected}
              />}
              <PropertyAddressInfo generalMDMSDataById={generalMDMSDataById} properties={this.props.properties} editIcon={<EditIcon onIconClick={() => onEditButtonClick(0)} />}></PropertyAddressInfo>
              <AssessmentInfo generalMDMSDataById={generalMDMSDataById} properties={this.props.properties} editIcon={<EditIcon onIconClick={() => onEditButtonClick(1)} />}></AssessmentInfo>
              <OwnerInfo generalMDMSDataById={generalMDMSDataById} properties={this.props.properties} ></OwnerInfo>
              <DocumentsInfo generalMDMSDataById={generalMDMSDataById} documentsUploaded={this.props.documentsUploadRedux} editIcon={<EditIcon onIconClick={() => onEditButtonClick(3)} />}></DocumentsInfo>
              <div>
                {!this.props.isCompletePayment && (
                  <CalculationDetails
                    open={this.state.calculationDetails}
                    data={this.props.calculationScreenData}
                    closeDialogue={() => this.closeCalculationDetails()}
                  />
                )}
                <p className="declaration-main-header">DECLARATION</p>
                <SingleCheckbox
                  id="rcpt"
                  errorMessage={<Label label={termsError} />}
                  errorText={<Label label={termsError} />}
                  floatingLabelText={
                    <Label label="PT_FINAL_DECLARATION_MESSAGE" color="#767676" />
                  }
                  value={termsAccepted}
                  onCheck={() => {
                    toggleTerms();
                  }}
                />
                {termsError && (
                  <Label
                    label={termsError}
                    containerStyle={{
                      marginTop: "-22px",
                      color: "#f44336",
                      "margin-left": "4px"
                    }}
                    fontSize="14px"
                    color="red"
                  />
                )}
              </div>
            </div>
          }
        />
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  const { common = {}, screenConfiguration } = state;
  const { generalMDMSDataById } = common || {};
  const { preparedFinalObject} = screenConfiguration;
  let { documentsUploadRedux } = preparedFinalObject;
  documentsUploadRedux = convertToArray(documentsUploadRedux);
  return {
    ownProps,
    generalMDMSDataById,
    documentsUploadRedux
  };
};
const mapDispatchToProps = dispatch => ({
  setRoute: route => dispatch({ type: "SET_ROUTE", route }),
  prepareFinalObject: (jsonPath, value) =>
  dispatch(prepareFinalObject(jsonPath, value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewForm);
