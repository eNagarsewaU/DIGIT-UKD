import { compose } from "recompose";
import { Button } from "components";
import { withRouter } from "react-router-dom";
import React, { Component } from "react";
import { connect } from "react-redux";
import Label from "egov-ui-kit/utils/translationNode";
import HistoryCard from "../../../../../Property/components/HistoryCard";
import { convertEpochToDate, getFormattedDate } from "../../../../../../../utils/PTCommon";
import { getFullRow } from "../AssessmentHistory";
import { downloadReceipt } from "egov-ui-kit/redux/properties/actions";

class PaymentHistory extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            items: [],
            showItems: false,
            errorMessage:"PT_PAYMENT_HISTORY_ERROR"
        };
    }
    getBillPeriod(billDetails = []) {
        let latest = billDetails.sort((x, y) => y.fromPeriod - x.fromPeriod);
        const billPeriod = convertEpochToDate(latest[latest.length - 1].fromPeriod) + ' to ' + convertEpochToDate(latest[0].toPeriod - 20000000);
        return billPeriod;

    }
    getTransformedPaymentHistory() {
        const labelStyle = {
            letterSpacing: 1.2,
            fontWeight: "600",
            lineHeight: "35px",
        };
        const buttonStyle = {
            float: 'right',
            lineHeight: "35px",
            height: "35px",
            backgroundColor: "rgb(242, 242, 242)",
            boxShadow: "none",
            border: "1px solid rgb(254, 122, 81)",
            borderRadius: "2px",
            outline: "none",
            alignItems: "right",
        };
        const { Payments = [] ,downloadReceipt, properties, workflowStatus} = this.props;
        var finalStatus = workflowStatus && workflowStatus.ProcessInstances[0] && workflowStatus.ProcessInstances[0].action;
        const workFlowLastModifiedDate =  workflowStatus && workflowStatus.ProcessInstances[0] && workflowStatus.ProcessInstances[0].auditDetails.lastModifiedTime;
        const paymentDate =  Payments && Payments[0] && Payments[0].transactionDate;
        let IsDateValid   = workFlowLastModifiedDate>paymentDate;

        const paymentHistoryItems = Payments.map((payment, index) => {
            
            if(payment.paymentStatus!='CANCELLED')
          {
            const amount=payment.totalAmountPaid==0?'0':payment.totalAmountPaid;
            return (
                <div  style={{borderTop: "1px solid #474343", height: "91px" }}>
                        {getFullRow("PT_HISTORY_RECEIPT_NO", payment.paymentDetails[0].receiptNumber ? '' + payment.paymentDetails[0].receiptNumber : "NA", 12)}
                        {getFullRow("PT_HISTORY_AMOUNT_PAID", amount ? 'Rs ' + amount : "NA", 12)}
                        {getFullRow("PT_HISTORY_PAYMENT_DATE", payment.transactionDate ? getFormattedDate(payment.transactionDate) : "NA", 12)}
                        {getFullRow("PT_HISTORY_BILL_NO", payment.paymentDetails[0].bill.billNumber ? '' + payment.paymentDetails[0].bill.billNumber : "NA", 12)}
                        {getFullRow("PT_HISTORY_BILL_PERIOD", this.getBillPeriod(payment.paymentDetails[0].bill.billDetails), 6)}
                        <div className="col-sm-6 col-xs-12" style={{ marginBottom: 10, marginTop: 5 }}>
                            <div className="assess-history" style={{ float: "right" }}>
                            {(this.props.properties.status!=="INWORKFLOW" && !IsDateValid && finalStatus !== "APPROVED" && payment.instrumentStatus!=="CANCELLED")?<Button
                                    label={<Label buttonLabel={true} label="PT_DOWNLOAD_RECEIPT" color="rgb(254, 122, 81)" fontSize="16px" height="35px" labelStyle={labelStyle} />}
                                    buttonStyle={buttonStyle}
                                    onClick={() => {
                                        const receiptQueryString= [
                                                { key: "receiptNumbers", value: payment.paymentDetails[0].receiptNumber },
                                                { key: "tenantId", value: payment.paymentDetails[0].tenantId }
                                              ]
                                        downloadReceipt(receiptQueryString)
                                        // lastElement.onClick();
                                    }}
                                ></Button>:""}
                            </div>
                        </div >
                    </div>)               
            
        }})
        return paymentHistoryItems;
    }

    render() {

        const { Payments = [] } = this.props;

        let paymentHistoryItem = [];
       
        let finalPayments=[];
       
        Payments.map((payment, index) => {
            if(payment && payment.paymentStatus!='CANCELLED')
            {
                finalPayments.push(payment);
            }
        })
      
        if (finalPayments.length > 0) {
            
            paymentHistoryItem = this.getTransformedPaymentHistory();
        }
       
        const items = this.state.showItems ? this.state.items : [];
        const errorMessage = this.state.showItems&&items.length==0 ? this.state.errorMessage : '';
        return (<HistoryCard header={'PT_PAYMENT_HISTORY'} items={items} errorMessage={errorMessage} onHeaderClick={() => {
            console.log("clicked");
            this.setState({ showItems: !this.state.showItems, items: paymentHistoryItem })
        }}></HistoryCard>)
    }
}


const mapStateToProps = (state, ownProps) => {
    const { Bill = [], Payments = [] } = state.properties || {};
    const propertyId = decodeURIComponent(ownProps.match.params.propertyId);

    return {
        propertyId,
        Bill,
        Payments
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
     downloadReceipt: (receiptQueryString) => dispatch(downloadReceipt(receiptQueryString)),
    };
  };
//   [
//     { key: "consumerCodes", value: decodeURIComponent(this.props.match.params.propertyId) },
//     { key: "tenantId", value: this.props.match.params.tenantId }
// //   ]

export default compose(
    withRouter,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(PaymentHistory);