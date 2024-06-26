import { Card } from "components";
import commonConfig from "config/common.js";
import DownloadPrintButton from "egov-ui-framework/ui-molecules/DownloadPrintButton";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import Screen from "egov-ui-kit/common/common/Screen";
import { toggleSnackbarAndSetText } from "egov-ui-kit/redux/app/actions";
import { initLocalizationLabels } from "egov-ui-kit/redux/app/utils";
import { fetchGeneralMDMSData } from "egov-ui-kit/redux/common/actions";
import { fetchProperties } from "egov-ui-kit/redux/properties/actions";
import { httpRequest } from "egov-ui-kit/utils/api";
import { FETCHASSESSMENTS, PROPERTY } from "egov-ui-kit/utils/endPoints";
import { getLocale, localStorageSet } from "egov-ui-kit/utils/localStorageUtils";
import { generatePdfFromDiv, getQueryValue,getFinancialYearFromQuery } from "egov-ui-kit/utils/PTCommon";
import Label from "egov-ui-kit/utils/translationNode";
import WorkFlowContainer from "egov-workflow/ui-containers-local/WorkFlowContainer";
import get from "lodash/get";
import React, { Component } from "react";
import { connect } from "react-redux";
import PTHeader from "../../common/PTHeader";
import AssessmentInfo from "../Property/components/AssessmentInfo";
import DocumentsInfo from "../Property/components/DocumentsInfo";
import OwnerInfo from "../Property/components/OwnerInfo";
import PropertyAddressInfo from "../Property/components/PropertyAddressInfo";
import PropertyTaxDetailsCard from "../Property/components/PropertyTaxDetails";
import "./index.css";
import CalculationDetails from "../Property/components/CalculationDetails"
import {  createAssessmentPayload } from "egov-ui-kit/config/forms/specs/PropertyTaxPay/propertyCreateUtils";


const innerDivStyle = {
  padding: "0",
  // borderBottom: "1px solid #e0e0e0",
  marginLeft: 0,
};

const IconStyle = {
  margin: 0,
  top: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  height: "inherit",
};

const listItemStyle = {
  padding: "0px 20px",
  borderWidth: "10px 10px 0px",
};

const appName = process.env.REACT_APP_NAME;

const locale = getLocale() || "en_IN";
const localizationLabelsData = initLocalizationLabels(locale);

class ApplicationPreview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pathName: null,
      dialogueOpen: false,
      urlToAppend: "",
      showAssessmentHistory: false,
      estimates:null,
      calculationDetails:false
    };
  }

  componentDidMount = () => {
    this.setPropertyId();
    const { location, fetchGeneralMDMSData, fetchProperties } = this.props;
    const requestBody = {
      MdmsCriteria: {
        tenantId: commonConfig.tenantId,
        moduleDetails: [
          {
            moduleName: "PropertyTax",
            masterDetails: [
              {
                name: "Floor",
              },
              {
                name: "UsageCategoryMajor",
              },
              {
                name: "UsageCategoryMinor",
              },
              {
                name: "UsageCategorySubMinor",
              },
              {
                name: "OccupancyType",
              },
              {
                name: "PropertyType",
              },
              {
                name: "PropertySubType",
              },
              {
                name: "OwnerType",
              },
              {
                name: "UsageCategoryDetail",
              },
              {
                name: "SubOwnerShipCategory",
              },
            ],
          },
        ],
      },
    };
    fetchGeneralMDMSData(requestBody, "PropertyTax", [
      "Floor",
      "UsageCategoryMajor",
      "UsageCategoryMinor",
      "UsageCategorySubMinor",
      "OccupancyType",
      "PropertyType",
      "PropertySubType",
      "OwnerType",
      "UsageCategoryDetail",
      "SubOwnerShipCategory",
    ]);
    const tenantId = getQueryValue(window.location.href, "tenantId");
    const queryObject = [
      { key: "tenantId", value: tenantId },
      { key: "businessServices", value: this.getApplicationType().moduleName }
    ];
    this.setBusinessServiceDataToLocalStorage(queryObject);



    this.fetchApplication();
  };
  setBusinessServiceDataToLocalStorage = async (queryObject) => {
    const { toggleSnackbarAndSetText } = this.props;
    try {
      const payload = await httpRequest("egov-workflow-v2/egov-wf/businessservice/_search", "_search", queryObject);
      localStorageSet("businessServiceData", JSON.stringify(get(payload, "BusinessServices")));
      return get(payload, "BusinessServices");
    } catch (e) {
      toggleSnackbarAndSetText(
        true,
        {
          labelName: "Not authorized to access Business Service!",
          labelKey: "ERR_NOT_AUTHORISED_BUSINESS_SERVICE",
        },
        "error"
      );
    }
  };
  fetchApplication = async () => {
    const applicationType = this.getApplicationType();
    try {
      const payload = await httpRequest(applicationType.endpoint.GET.URL, applicationType.endpoint.GET.ACTION, applicationType.queryParams
      );

      const responseObject = payload[applicationType.responsePath] && payload[applicationType.responsePath].length > 0 && payload[applicationType.responsePath][0];
      if (!responseObject.workflow) {


        let workflow = {
          "id": null,
          "tenantId": getQueryArg(
            window.location.href,
            "tenantId"
          ),
          "businessService": applicationType.moduleName,
          "businessId": getQueryArg(
            window.location.href,
            "applicationNumber"
          ),
          "action": "",
          "moduleName": "PT",
          "state": null,
          "comment": null,
          "documents": null,
          "assignes": null
        }
        responseObject.workflow = workflow;
      }
      this.props.prepareFinalObject(applicationType.dataPath, payload[applicationType.responsePath] && responseObject)
    } catch (e) {
      console.log(e);

    }

  }


  // setBusinessServiceDataToLocalStorage = async (queryObject) => {
  //   const { toggleSnackbarAndSetText } = this.props;
  //   try {
  //     const payload = await httpRequest("egov-workflow-v2/egov-wf/businessservice/_search", "_search", queryObject);
  //     localStorageSet("businessServiceData", JSON.stringify(get(payload, "BusinessServices")));
  //     return get(payload, "BusinessServices");
  //   } catch (e) {
  //     toggleSnackbarAndSetText(
  //       true,
  //       {
  //         labelName: "Not authorized to access Business Service!",
  //         labelKey: "ERR_NOT_AUTHORISED_BUSINESS_SERVICE",
  //       },
  //       "error"
  //     );
  //   }
  // };


  setPropertyId = async () => {
    const tenantId = getQueryValue(window.location.href, "tenantId");
    const applicationNumber = getQueryValue(window.location.href, "applicationNumber");
    const propertyId = await this.getPropertyId(applicationNumber, tenantId);
    this.props.fetchProperties([
      { key: "propertyIds", value: propertyId },
      { key: "tenantId", value: tenantId },
    ]);

    this.props.prepareFinalObject('PTApplication.propertyId', propertyId);
    this.setState({ propertyId });

  }
  getPropertyId = async (applicationNumber, tenantId) => {
    const applicationType = getQueryValue(window.location.href, "type");
    if (applicationType == 'assessment') {
      const queryObject = [
        { key: "assessmentNumbers", value: applicationNumber },
        { key: "tenantId", value: tenantId }
      ];
      try {
        const payload = await httpRequest(
          "property-services/assessment/_search",
          "_search",
          queryObject
        );
        if (payload && payload.Assessments.length > 0) {
          return payload.Assessments[0].propertyId;
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      const queryObject = [
        { key: "acknowledgementIds", value: applicationNumber },
        { key: "tenantId", value: tenantId }
      ];
      try {
        const payload = await httpRequest(
          "property-services/property/_search",
          "_search",
          queryObject
        );
        if (payload && payload.Properties.length > 0) {
          return payload.Properties[0].propertyId;
        }
      } catch (e) {
        console.log(e);
      }
    }

  }
  getApplicationType = () => {
    const applicationType = getQueryValue(window.location.href, "type");
    let applicationObject = {}
    if (applicationType == "assessment") {
      applicationObject.dataPath = "Assessment";
      applicationObject.responsePath = "Assessments";
      applicationObject.moduleName = "ASMT";
      applicationObject.updateUrl = "/property-services/assessment/_update";


      applicationObject.queryParams = [
        {
          key: "assessmentNumbers", value: getQueryArg(
            window.location.href,
            "applicationNumber"
          )
        },
        {
          key: "tenantId", value: getQueryArg(
            window.location.href,
            "tenantId"
          )
        }
      ]


      applicationObject.endpoint = FETCHASSESSMENTS;

    } else if (applicationType == "property") {
      applicationObject.responsePath = "Properties";
      applicationObject.dataPath = "Property";
      applicationObject.moduleName = "PT.CREATE";
      applicationObject.updateUrl = "/property-services/property/_update";


      applicationObject.queryParams = [
        {
          key: "acknowledgementIds", value: getQueryArg(
            window.location.href,
            "applicationNumber"
          )
        },
        {
          key: "tenantId", value: getQueryArg(
            window.location.href,
            "tenantId"
          )
        }
      ]


      applicationObject.endpoint = PROPERTY;


    }
    return applicationObject;
  }
  getLogoUrl = (tenantId) => {
    const { cities } = this.props
    const filteredCity = cities && cities.length > 0 && cities.filter(item => item.code === tenantId);
    return filteredCity ? get(filteredCity[0], "logoId") : "";
  }

  estimate = async (additionalDetails)=>{
    var {properties,prepareFormData} = this.props;
    const financialYearFromQuery = getFinancialYearFromQuery();
    const financeYear = { financialYear: financialYearFromQuery };
    let fY = localStorage.getItem('finalData')
    fY = fY && JSON.parse(fY);
    financeYear.financialYear =  fY && fY[0].financialYear;

    if(properties && properties.propertyId){
      const assessmentPayload = createAssessmentPayload(properties, financeYear);
      if(additionalDetails){
        assessmentPayload.additionalDetails = additionalDetails;
      }
      let estimateResponse = await httpRequest(
        "pt-calculator-v2/propertytax/_estimate",
        "_estimate",
        [],
        {
          Assessment: assessmentPayload
        }
      );
      let intermediateValues=[];

      if(estimateResponse.Calculation){
        intermediateValues.push(
          {taxHeadCode: "PT_CARPET_AREA", 
          estimateAmount:estimateResponse.Calculation[0].carpetArea,  
          category: "TAX"}
        )
        intermediateValues.push(
          {taxHeadCode: "PT_ANNUAL_VALUE", 
          estimateAmount:estimateResponse.Calculation[0].landAV,  
          category: "TAX"}
        )
      }
      this.setState({
        estimates:estimateResponse.Calculation,
        intermediateValues: intermediateValues
      })
    }
}

updateEstimate = ()=>{

  let additionalDetails = {
    "adhocPenalty":localStorage.getItem('adhocPenalty'),
    "adhocPenaltyReason":localStorage.getItem('adhocPenaltyReason') == 'Others' ? localStorage.getItem('adhocOtherPenaltyReason') : localStorage.getItem('adhocPenaltyReason'),
    "adhocExemption":localStorage.getItem("adhocExemption"),
    "adhocExemptionReason":localStorage.getItem('adhocExemptionReason') == 'Others' ? localStorage.getItem("adhocOtherExemptionReason") : localStorage.getItem("adhocExemptionReason")
  }
    // if(this.props.prepareFormData.Properties[0].additionalDetails){
    //   this.estimate(this.props.prepareFormData.Properties[0].additionalDetails)
    // }
    if(additionalDetails){
      this.estimate(additionalDetails)
    }
}
openCalculationDetails = () => {
  this.setState({ calculationDetails: true });
};
closeCalculationDetails = () => {
  this.setState({ calculationDetails: false });
};
  render() {
    const { location, documentsUploaded,auth } = this.props;
    const { search } = location;
    let roles,approver;
    const applicationNumber = getQueryValue(search, "applicationNumber");
    const { generalMDMSDataById, properties, cities } = this.props;
    const applicationType = this.getApplicationType();
    const applicationDownloadObject = {
      label: { labelName: "PT Application", labelKey: "PT_APPLICATION" },
      link: () => {
        generatePdfFromDiv("download", applicationNumber, "#property-application-review-form")

      },
      leftIcon: "assignment"
    };
    const applicationPrintObject = {
      label: { labelName: "PT Application", labelKey: "PT_APPLICATION" },
      link: () => {
        // const { Licenses,LicensesTemp } = state.screenConfiguration.preparedFinalObject;
        // const documents = LicensesTemp[0].reviewDocData;
        // set(Licenses[0],"additionalDetails.documents",documents)
        // downloadAcknowledgementForm(Licenses,'print');
        generatePdfFromDiv("print", applicationNumber, "#property-application-review-form")

      },
      leftIcon: "assignment"
    };

    const downloadMenu = [applicationDownloadObject];
    const printMenu = [applicationPrintObject];

    let header = '';
    if (applicationType.dataPath == 'Property') {
      header = 'PT_APPLICATION_TITLE';
    } else {
      header = 'PT_ASSESS_APPLICATION_TITLE';
    }
    let logoUrl = "";
    let corpCity = "";
    let ulbGrade = "";
    if (get(properties, "tenantId")) {
      logoUrl = get(properties, "tenantId") ? this.getLogoUrl(get(properties, "tenantId")) : "";
      corpCity = `TENANT_TENANTS_${get(properties, "tenantId").toUpperCase().replace(/[.:-\s\/]/g, "_")}`;
      const selectedCityObject = cities && cities.length > 0 && cities.filter(item => item.code === get(properties, "tenantId"));
      ulbGrade = selectedCityObject ? `ULBGRADE_${get(selectedCityObject[0], "city.ulbGrade")}` : "MUNICIPAL CORPORATION";
    }
    if(!this.state.estimates && properties.propertyId){
      this.estimate();
    }
    roles = auth && auth.userInfo.roles
    approver =roles && roles.filter(function(role){
      if(role.code == "PTAPPROVER"){
        return role;
      }
    })
    
    return <div>
      <Screen className={""}>
        <PTHeader header={header} subHeaderTitle='PT_PROPERTY_APPLICATION_NO' subHeaderValue={applicationNumber} />

        {/* <div className="printDownloadButton">
          {<DownloadPrintButton data={{
            label: {
              labelName: "Download", labelKey: "PT_DOWNLOAD"
            },
            leftIcon: "cloud_download",
            rightIcon: "arrow_drop_down",
            props: { variant: "outlined", style: { marginLeft: 10, color: "#FE7A51" } },
            menu: downloadMenu
          }} />}
          {<DownloadPrintButton data={{
            label: {
              labelName: "Print", labelKey: "PT_PRINT"
            },
            leftIcon: "print",
            rightIcon: "arrow_drop_down",
            props: { variant: "outlined", style: { marginLeft: 10, color: "#FE7A51" } },
            menu: printMenu
          }} />}
        </div> */}

        <div className="form-without-button-cont-generic" >
          <div>
            <WorkFlowContainer dataPath={applicationType.dataPath}
              moduleName={applicationType.moduleName}
              updateUrl={applicationType.updateUrl}></WorkFlowContainer>
            <Card

              textChildren={
                <div className="col-sm-12 col-xs-12" id="property-application-review-form" style={{ alignItems: "center" }}>
                  <div className="pdf-header" id="pdf-header">
                    <Card
                      style={{ display: "flex", backgroundColor: "rgb(242, 242, 242)", minHeight: "120px", alignItems: "center", paddingLeft: "10px" }}
                      textChildren={
                        <div style={{ display: "flex" }}>
                          {/* <Image  id="image-id" style={logoStyle} source={logoUrl} /> */}
                          <div style={{ marginLeft: 30 }}>
                            <div style={{ display: "flex", marginBottom: 5 }}>
                              <Label label={corpCity} fontSize="20px" fontWeight="500" color="rgba(0, 0, 0, 0.87)" containerStyle={{ marginRight: 10, textTransform: "uppercase" }} />
                              <Label label={ulbGrade} fontSize="20px" fontWeight="500" color="rgba(0, 0, 0, 0.87)" />
                            </div>
                            <Label label={"PT_PDF_SUBHEADER"} fontSize="16px" fontWeight="500" />
                          </div>
                        </div>
                      }
                    />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ display: "flex" }}>
                        <Label label="PT_PROPERTY_ID" color="rgba(0, 0, 0, 0.87)" fontSize="20px" containerStyle={{ marginRight: 10 }} />
                        <Label label={`: ${get(properties, "propertyId")}`} fontSize="20px" />
                      </div>
                      {/* <div style={{display : "flex"}}>
                      <Label label="Property ID :" color="rgba(0, 0, 0, 0.87)" fontSize="20px"/>
                      <Label label="PT-JLD-2018-09-145323" fontSize="20px"/>
                    </div> */}
                      {/* <div style={{display : "flex"}}>
                      <Label label="PDF_STATIC_LABEL_CONSOLIDATED_BILL_DATE" color="rgba(0, 0, 0, 0.87)" fontSize="20px"/>
                      <Label label="PT-JLD-2018-09-145323" fontSize="20px"/>
                    </div> */}
                    </div>
                  </div>
                 {this.state.estimates && approver && approver.length>0 && <PropertyTaxDetailsCard
                estimationDetails={this.state.estimates}
                importantDates=""
                openCalculationDetails={this.openCalculationDetails}
                // optionSelected={this.state.valueSelected}
                updateEstimate = {this.updateEstimate}
              />}
                  <PropertyAddressInfo properties={properties} generalMDMSDataById={generalMDMSDataById}></PropertyAddressInfo>
                  <AssessmentInfo properties={properties} generalMDMSDataById={generalMDMSDataById} ></AssessmentInfo>
                  <OwnerInfo properties={properties} generalMDMSDataById={generalMDMSDataById} ></OwnerInfo>
                  <DocumentsInfo documentsUploaded={documentsUploaded}></DocumentsInfo>
                  <CalculationDetails
                    open={this.state.calculationDetails}
                    data={this.props.calculationScreenData}
                    closeDialogue={() => this.closeCalculationDetails()}
                    intermediateValues ={this.state.intermediateValues}
                  />
                </div>
              }
            />
          </div>
        </div>
      </Screen>
    </div>
  }
}

// getApplicationDetailsBasedOnWorkflow(applicationNumber){




// }


const mapStateToProps = (state, ownProps) => {
  const { common = {}, screenConfiguration = {},auth } = state;
  const { generalMDMSDataById } = common || {};
  const { propertiesById, loading, } = state.properties || {};
  const { location } = ownProps;
  const { search } = location;

  const { preparedFinalObject = {} } = screenConfiguration;
  const { PTApplication = {} } = preparedFinalObject;
  const { propertyId = '' } = PTApplication;
  const { cities, prepareFormData} = state.common || [];



  const properties = propertiesById[propertyId] || {};
  const { documentsUploaded } = properties || [];
  return {
    ownProps,
    generalMDMSDataById, properties, documentsUploaded, propertyId, cities,prepareFormData,auth
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchGeneralMDMSData: (requestBody, moduleName, masterName) => dispatch(fetchGeneralMDMSData(requestBody, moduleName, masterName)),
    fetchProperties: (queryObjectProperty) => dispatch(fetchProperties(queryObjectProperty)),
    toggleSnackbarAndSetText: (open, message, error) => dispatch(toggleSnackbarAndSetText(open, message, error)),
    prepareFinalObject: (jsonPath, value) => dispatch(prepareFinalObject(jsonPath, value)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationPreview);
