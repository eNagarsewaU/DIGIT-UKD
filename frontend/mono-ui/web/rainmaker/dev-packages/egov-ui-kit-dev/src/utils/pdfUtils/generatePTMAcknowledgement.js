import { mutationSummaryDetails } from "egov-pt/ui-config/screens/specs/pt-mutation/applyResourceMutation/mutationSummary";
import { transfereeInstitutionSummaryDetails, transfereeSummaryDetails } from "egov-pt/ui-config/screens/specs/pt-mutation/searchPreviewResource/transfereeSummary";
import { transferorInstitutionSummaryDetails, transferorSummaryDetails } from "egov-pt/ui-config/screens/specs/pt-mutation/searchPreviewResource/transferorSummary";
import { registrationSummaryDetails } from "egov-pt/ui-config/screens/specs/pt-mutation/summaryResource/registrationSummary";
import get from "lodash/get";
import { getAddressItems } from "../../common/propertyTax/Property/components/PropertyAddressInfo";
import { generateKeyValue, generatePDF, getDocumentsCard, getMultiItems, getMultipleItemCard } from "./generatePDF";

export const generatePTMAcknowledgement = (preparedFinalObject, fileName = "acknowledgement.pdf") => {
    registrationSummaryDetails.transferReason.localiseValue=true;
    transferorSummaryDetails.ownerType.localiseValue=true;
    transfereeSummaryDetails.ownerType.localiseValue=true;
    transfereeInstitutionSummaryDetails.institutionType.localiseValue=true;
    transferorInstitutionSummaryDetails.institutionType.localiseValue=true;
    const mutationDetails = generateKeyValue(preparedFinalObject, mutationSummaryDetails);
    const registrationDetails = generateKeyValue(preparedFinalObject, registrationSummaryDetails);
    let UlbLogoForPdf = get(preparedFinalObject, 'UlbLogoForPdf', '');
    let property = get(preparedFinalObject, 'Property', {});
    let transfereeOwners = get(
        property,
        "ownersTemp", []
    );
    let transferorOwners = get(
        property,
        "ownersInit", []
    );
    let transfereeOwnersDid = true;
    let transferorOwnersDid = true;
    transfereeOwners.map(owner => {
        if (owner.ownerType != 'NONE') {
            transfereeOwnersDid = false;
        }
    })
    transferorOwners.map(owner => {
        if (owner.ownerType != 'NONE') {
            transferorOwnersDid = false;
        }
    })

    if (transfereeOwnersDid) {
        delete transfereeSummaryDetails.ownerSpecialDocumentType
        delete transfereeSummaryDetails.ownerDocumentId
    }
    if (transferorOwnersDid) {
        delete transferorSummaryDetails.ownerSpecialDocumentType
        delete transferorSummaryDetails.ownerSpecialDocumentID
    }
    let transferorDetails = []
    let transferorDetailsInfo = []
    if (get(property, "ownershipCategoryInit", "").startsWith("INSTITUTION")) {
        transferorDetails = generateKeyValue(preparedFinalObject, transferorInstitutionSummaryDetails)
    } else if (get(property, "ownershipCategoryInit", "").includes("SINGLEOWNER")) {
        transferorDetails = generateKeyValue(preparedFinalObject, transferorSummaryDetails)
    } else {
        transferorDetailsInfo = getMultiItems(preparedFinalObject, transferorSummaryDetails, 'Property.ownersInit')
        transferorDetails = getMultipleItemCard(transferorDetailsInfo, 'PT_OWNER')
    }
    let transfereeDetails = []
    let transfereeDetailsInfo = []
    if (get(property, "ownershipCategoryTemp", "").startsWith("INSTITUTION")) {
        transfereeDetails = generateKeyValue(preparedFinalObject, transfereeInstitutionSummaryDetails)
    } else if (get(property, "ownershipCategoryTemp", "").includes("SINGLEOWNER")) {
        transfereeDetails = generateKeyValue(preparedFinalObject, transfereeSummaryDetails)
    } else {
        transfereeDetailsInfo = getMultiItems(preparedFinalObject, transfereeSummaryDetails, 'Property.ownersTemp')
        if(!window.location.href.includes("search-preview")){
            transfereeDetailsInfo = transfereeDetailsInfo.sort(function(a,b){
                  return transfereeDetailsInfo.indexOf(b)-transfereeDetailsInfo.indexOf(a)
                })
        }
        transfereeDetails = getMultipleItemCard(transfereeDetailsInfo, 'PT_OWNER')
    }

    const addressCard = getAddressItems(get(preparedFinalObject, 'Property', {}));
    const documentsUploadRedux = get(preparedFinalObject, 'documentsUploadRedux', []);
    const documentCard = getDocumentsCard(documentsUploadRedux);
    let pdfData = {
        header: "PTM_ACKNOWLEDGEMENT", tenantId: property.tenantId,
        applicationNoHeader: 'PT_PROPERTY_PTUID', applicationNoValue: property.propertyId,
        additionalHeader: "PT_APPLICATION_NO_LABEL", additionalHeaderValue: property.acknowldgementNumber,
        cards: [
            { header: "PT_PROPERTY_ADDRESS_SUB_HEADER", items: addressCard },
            { header: 'PT_MUTATION_TRANSFEROR_DETAILS', items: transferorDetails, type: transferorDetailsInfo.length > 1 ? 'multiItem' : 'singleItem' },
            { header: 'PT_MUTATION_TRANSFEREE_DETAILS', items: transfereeDetails, type: transfereeDetailsInfo.length > 1 ? 'multiItem' : 'singleItem' },
            { header: "PT_MUTATION_DETAILS", items: mutationDetails, hide: !get(preparedFinalObject, 'PropertyConfiguration[0].Mutation.MutationDetails', false) },
            { header: "PT_MUTATION_REGISTRATION_DETAILS", items: registrationDetails },
            { header: 'PT_SUMMARY_DOCUMENTS_HEADER', items: documentCard }]
    }
    generatePDF(UlbLogoForPdf, pdfData, fileName);
}