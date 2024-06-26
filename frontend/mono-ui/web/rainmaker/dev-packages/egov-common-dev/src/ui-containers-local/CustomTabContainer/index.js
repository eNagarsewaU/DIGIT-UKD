import React from "react";
import RenderScreen from "egov-ui-framework/ui-molecules/RenderScreen";
import CustomTab from "../../ui-molecules-local/CustomTab";
import { connect } from "react-redux";
import { addComponentJsonpath } from "egov-ui-framework/ui-utils/commons";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";

class MultiItem extends React.Component {
  state = {
    tabIndex: 0
  };

  fieldsToReset = [
    "ReceiptTemp[0].Bill[0].payer",
    "ReceiptTemp[0].Bill[0].paidBy",
    "ReceiptTemp[0].Bill[0].payerMobileNumber",
    "ReceiptTemp[0].instrument.transactionNumber",
    "ReceiptTemp[0].instrument.transactionDateInput",
    "ReceiptTemp[0].instrument.ifscCode",
    "ReceiptTemp[0].instrument.instrumentNumber",
    "ReceiptTemp[0].instrument.transactionNumberConfirm",
    "ReceiptTemp[0].instrument.bank.name",
    "ReceiptTemp[0].instrument.branchName"
  ];

  resetAllFields = (children, dispatch, state) => {
    for (var child in children) {
      if (children[child].children) {
        for (var innerChild in children[child].children) {
          if (
            get(
              state.screenConfiguration.screenConfig["pay"],
              `${
                children[child].children[innerChild].componentJsonpath
              }.props.value`
            )
          ) {
            dispatch(
              handleField(
                "pay",
                children[child].children[innerChild].componentJsonpath,
                "props.value",
                ""
              )
            );
            dispatch(
              handleField(
                "pay",
                children[child].children[innerChild].componentJsonpath,
                "props.error",
                false
              )
            );
            dispatch(
              handleField(
                "pay",
                children[child].children[innerChild].componentJsonpath,
                "isFieldValid",
                true
              )
            );
            dispatch(
              handleField(
                "pay",
                children[child].children[innerChild].componentJsonpath,
                "props.helperText",
                ""
              )
            );
          }
        }
      }
    }
  };

  resetFields = (dispatch, state) => {
    // 
    // dispatch(prepareFinalObject("ReceiptTemp[0].instrument", {}));
    const finalObject = get(state , "screenConfiguration.preparedFinalObject");
    const ifscCode = get(finalObject, "ReceiptTemp[0].instrument.ifscCode");
    const transactionDateInput = get(finalObject, "ReceiptTemp[0].instrument.transactionDateInput");
    const transactionNumber = get(finalObject, "ReceiptTemp[0].instrument.transactionNumber");
    const bankName = get(finalObject,"ReceiptTemp[0].instrument.bank.name");
    const branchName  = get(state.screenConfiguration.preparedFinalObject,"ReceiptTemp[0].instrument.branchName");
    dispatch(prepareFinalObject("ReceiptTemp[0].Bill[0].paidBy", get(finalObject,"ReceiptTemp[0].Bill[0].payerName")));
    dispatch(prepareFinalObject("ReceiptTemp[0].Bill[0].payerMobileNumber", get(finalObject,"ReceiptTemp[0].Bill[0].mobilenumber")));
    if (bankName && branchName) {
      dispatch(prepareFinalObject("ReceiptTemp[0].instrument.bank.name", ""));
      dispatch(prepareFinalObject("ReceiptTemp[0].instrument.branchName", ""));
    }
    if(ifscCode){
      dispatch(prepareFinalObject("ReceiptTemp[0].instrument.ifscCode", ""));
    }
    if(transactionDateInput){
      dispatch(prepareFinalObject("ReceiptTemp[0].instrument.transactionDateInput", ""));
    }
    if(transactionNumber){
      dispatch(prepareFinalObject("ReceiptTemp[0].instrument.transactionNumber", ""));
    }
    // Has to manually clear bank name and branch
    const keyToIndexMapping = [
      {
        index: 0,
        key: "cash"
      },
      {
        index: 1,
        key: "cheque"
      },
      
      {
        index: 2,
        key: "offline_neft"
      },
      {
        index: 3,
        key: "offline_rtgs"
      },
      {
        index: 4,
        key: "pos"
      },
      {
        index: 5,
        key: "demandDraft"
      },
      {
        index: 6,
        key: "card"
      }
    ];

    keyToIndexMapping.forEach(item => {
      const objectJsonPath = `components.div.children.formwizardFirstStep.children.paymentDetails.children.cardContent.children.capturePaymentDetails.children.cardContent.children.tabSection.props.tabs[${
        item.index
      }].tabContent[${item.key}].children`;
      const children = get(
        state.screenConfiguration.screenConfig["pay"],
        objectJsonPath,
        {}
      );
      this.resetAllFields(children, dispatch, state);
    });
  };

  setInstrumentType = (value, dispatch) => {
    dispatch(
      prepareFinalObject("ReceiptTemp[0].instrument.instrumentType.name", value)
    );
  };

  onTabChange = (tabIndex, dispatch, state) => {
    this.resetFields(dispatch, state);
    switch (tabIndex) {
      case 0:
        this.setInstrumentType("Cash", dispatch);
        break;
      case 1:
        this.setInstrumentType("Cheque", dispatch);
        break;
  
          case 2:
            this.setInstrumentType("OFFLINE_RTGS", dispatch);
            break;
        case 3:
          this.setInstrumentType("POS", dispatch);
          break;
         
              case 4:
                this.setInstrumentType("DD", dispatch);
                break;
              case 5:
                this.setInstrumentType("Card", dispatch);
                break;
      default:
        this.setInstrumentType("Cash", dispatch);
        break;
    }
  };

  onTabClick = tabIndex => {
    const { state, dispatch } = this.props;
    this.onTabChange(tabIndex, dispatch, state);
    this.setState({ tabIndex });
  };

  render() {
    const {
      uiFramework,
      onFieldChange,
      onComponentClick,
      screenKey,
      componentJsonpath
    } = this.props;

    const { onTabClick } = this;

    const transFormedProps = {
      ...this.props,
      tabs: this.props.tabs.map((tab, key) => {
        return {
          ...tab,
          tabContent: (
            <RenderScreen
              key={key}
              screenKey={screenKey}
              components={cloneDeep(
                addComponentJsonpath(
                  tab.tabContent,
                  `${componentJsonpath}.props.tabs[${key}].tabContent`
                )
              )}
              uiFramework={uiFramework}
              onFieldChange={onFieldChange}
              onComponentClick={onComponentClick}
            />
          )
        };
      })
    };
    return <CustomTab handleClick={onTabClick} {...transFormedProps} />;
  }
}

const mapStateToProps = state => {
  const { screenConfiguration } = state;
  const { screenConfig, preparedFinalObject } = screenConfiguration;
  return { screenConfig, preparedFinalObject, state };
};

export default connect(mapStateToProps)(MultiItem);
