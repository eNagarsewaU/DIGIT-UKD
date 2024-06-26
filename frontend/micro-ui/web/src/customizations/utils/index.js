import get from "lodash/get";
import set from "lodash/set";
import { useQuery } from "react-query";
import { Request } from "./Request";


/*   method to check not null  if not returns false*/
export const checkForNotNull = (value = "") => {
  return value && value != null && value != undefined && value != "" ? true : false;
};

export const convertDotValues = (value = "") => {
  return (
    (checkForNotNull(value) && ((value.replaceAll && value.replaceAll(".", "_")) || (value.replace && stringReplaceAll(value, ".", "_")))) || "NA"
  );
};

export const getLocalities = {
  admin: async (tenant) => {
    return (await window.Digit.LocationService.getLocalities(tenant)).TenantBoundary[0];
  },
  revenue: async (tenant) => {
    // console.log(“find me here”, tenant)
    return (await window.Digit.LocationService.getRevenueLocalities(tenant)).TenantBoundary[0];
  },
};
export const useLocalities = (tenant, boundaryType = "revenue", config, t) => {
  
 /*  const moduleCode = "MCS";
  const stateCode = "uk";
  const language = window.Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = window.Digit.Services.useStore({ stateCode, moduleCode, language });
 */
  // console.log(“find boundary type here”,boundaryType)
  // window.Digit.Services.useStore({ stateCode, moduleCode, language });  
  return useQuery(["BOUNDARY_DATA", tenant, boundaryType], () => getLocalities[boundaryType.toLowerCase()](tenant), {
    select: (data) => {
      return window.Digit.LocalityService.get(data).map((key) => {
        return { ...key, i18nkey: t(key.i18nkey) };
      });
    },
    staleTime: Infinity,
    ...config,
  });
};

export const   receipt_download = (bussinessService, consumerCode, tenantId, pdfKey="misc-receipt") => {
  return Request({
    url: "/egov-pdf/download/PAYMENT/consolidatedreceipt",
    data: {},
    useCache: true,
    method: "POST",
    params: { bussinessService, consumerCode, tenantId, pdfKey},
    auth: true,
    locale: true,
    userService: true,
    userDownload: true,
  })
  }

export const sortDropdownNames = (options, optionkey, locilizationkey) => {
  return options.sort((a, b) => locilizationkey(a[optionkey]).localeCompare(locilizationkey(b[optionkey])));
};

export const convertToLocale = (value = "", key = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA") {
    return "PT_NA";
  }
  return `${key}_${convertedValue}`;
};

export const getPropertyTypeLocale = (value = "") => {
  return convertToLocale(value, "COMMON_PROPTYPE");
};

export const getPropertyUsageTypeLocale = (value = "") => {
  return convertToLocale(value, "COMMON_PROPUSGTYPE");
};

export const getPropertySubUsageTypeLocale = (value = "") => {
  return convertToLocale(value, "COMMON_PROPSUBUSGTYPE");
};
export const getPropertyOccupancyTypeLocale = (value = "") => {
  return convertToLocale(value, "PROPERTYTAX_OCCUPANCYTYPE");
};

export const getMohallaLocale = (value = "", tenantId = "") => {
  let convertedValue = convertDotValues(tenantId);
  if (convertedValue == "NA" || !checkForNotNull(value)) {
    return "PT_NA";
  }
  convertedValue = convertedValue.toUpperCase();
  return convertToLocale(value, `${convertedValue}_REVENUE`);
};

export const getCityLocale = (value = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA" || !checkForNotNull(value)) {
    return "PT_NA";
  }
  convertedValue = convertedValue.toUpperCase();
  return convertToLocale(convertedValue, `TENANT_TENANTS`);
};

export const getPropertyOwnerTypeLocale = (value = "") => {
  return convertToLocale(value, "PROPERTYTAX_OWNERTYPE");
};

export const getFixedFilename = (filename = "", size = 5) => {
  if (filename.length <= size) {
    return filename;
  }
  return `${filename.substr(0, size)}...`;
};

export const shouldHideBackButton = (config = []) => {
  return config.filter((key) => window.location.href.includes(key.screenPath)).length > 0 ? true : false;
};

/*   style to keep the body height fixed across screens */
export const cardBodyStyle = {
  maxHeight: "calc(100vh - 20em)",
  overflowY: "auto",
};

export const propertyCardBodyStyle = {
  maxHeight: "calc(100vh - 10em)",
  overflowY: "auto",
};

export const getTransaltedLocality = (data) => {
  let localityVariable = data?.tenantId?.replaceAll(".","_") || stringReplaceAll(data?.tenantId,".","_");
  return (localityVariable.toUpperCase()+"_REVENUE_"+data?.locality?.code);
}

export const setAddressDetails = (data) => {
  let { address } = data;

  let propAddress = {
    ...address,
    pincode: address?.pincode,
    landmark: address?.landmark,
    city: address?.city?.name,
    doorNo: address?.doorNo,
    street: address?.street,
    locality: {
      code: address?.locality?.code || "NA",
      area: address?.locality?.name,
    },
  };

  data.address = propAddress;
  return data;
};


export const getownerarray = (data) => {
  let ownerarray = [];
  data?.owners.owners.map((ob) => {
    ownerarray.push({
      mobileNumber: ob.mobileNumber,
      name: ob.name,
      fatherOrHusbandName:ob.fatherOrHusbandName,
      relationship: ob.relationship,
      dob: ob.dob,
      gender: ob.gender.code,
      permanentAddress: data?.owners?.permanentAddress,
    });
  });
  return ownerarray;
};

export const gettradeownerarray = (data) => {
  let tradeownerarray = [];
  const isEditRenew = window.location.href.includes("renew-trade");
  data.tradeLicenseDetail.owners.map((oldowner) => {
    data?.owners?.owners.map((newowner) => {
      if(oldowner.id === newowner.id)
      {
        if((oldowner.name !== newowner.name) || (oldowner.gender !== newowner.gender.code) || (oldowner.mobileNumber !== newowner.mobileNumber) || (oldowner.permanentAddress !== data?.owners?.permanentAddress))
        {
        if (oldowner.name !== newowner.name)
        {
          oldowner.name = newowner.name;
        }
        if(oldowner.gender !== newowner.gender.code)
        {
          oldowner.gender = newowner.gender.code;
        }
        if(oldowner.pan !== newowner.pan)
        {
          oldowner.pan = newowner.pan;
        }        
        if(oldowner?.emailId !== newowner.emailId)
        {
          oldowner.emailId = newowner.emailId;
        }
        if(oldowner?.fatherOrHusbandName !== newowner.fatherOrHusbandName)
        {
          oldowner.fatherOrHusbandName = newowner.fatherOrHusbandName;
        }               
        if(oldowner.mobileNumber !== newowner.mobileNumber)
        {
          oldowner.mobileNumber = newowner.mobileNumber;
        }
        if(oldowner.permanentAddress !== data?.owners?.permanentAddress)
        {
          oldowner.permanentAddress = data?.owners?.permanentAddress;
        }
        let found = tradeownerarray.length > 0 ?tradeownerarray.some(el => el.id === oldowner.id):false;
          if(!found)tradeownerarray.push(oldowner);
      }
        else
        {
          let found = tradeownerarray.length > 0 ? tradeownerarray.some(el => el.id === oldowner.id):false;
          if(!found)tradeownerarray.push(oldowner);
        }
      }
    })
  })
  !isEditRenew && data.tradeLicenseDetail.owners.map((oldowner) => {
    let found = tradeownerarray.length > 0 ? tradeownerarray.some(el => el.id === oldowner.id):false;
    if(!found)tradeownerarray.push({...oldowner,active:false});   
  })
  data?.owners?.owners.map((ob) => {
    if(!ob.id)
    {
      tradeownerarray.push({
              mobileNumber: ob.mobileNumber,
              name: ob.name,
              fatherOrHusbandName:ob.fatherOrHusbandName,
              relationship: ob.relationship,
              dob: ob.dob,
              gender: ob.gender.code,
              permanentAddress: data?.owners?.permanentAddress,
            });
    }
  })
  return tradeownerarray;
}

export const gettradeunits = (data) => {
  let tradeunits = [];
  data?.TradeDetails?.units.map((ob) => {
    tradeunits.push({ tradeType: ob.tradesubtype.code, uom: ob.unit, uomValue: ob.uom });
  });
  return tradeunits;
};

export const gettradeupdateunits = (data) => {
  let TLunits = [];
  const isEditRenew = window.location.href.includes("renew-trade");
  data.tradeLicenseDetail.tradeUnits.map((oldunit) => {
    data.TradeDetails.units.map((newunit) => {
      if(oldunit.id === newunit.id)
      {
        if (oldunit.tradeType !== newunit.tradesubtype.code)
        {
          oldunit.tradeType = newunit.tradesubtype.code;
          TLunits.push(oldunit);
        }
        else
        {
          let found = TLunits.length > 0 ? TLunits.some(el => el.id === oldunit.id):false;
          if(!found)TLunits.push(oldunit);
        }

      }
      else
      {
        if(!isEditRenew){
        let found = TLunits.length > 0 ? TLunits.some(el => el.id === oldunit.id):false;
        if(!found)TLunits.push({...oldunit,active:false});  
        } 
      }
    })
  })
  data.TradeDetails.units.map((ob) => {
    if(!ob.id)
    {
      TLunits.push({ tradeType: ob.tradesubtype.code, uom: ob.unit, uomValue: ob.uom });
    }
  })
  return TLunits;
};

export const getaccessories = (data) => {
  let tradeaccessories = [];
  data?.TradeDetails?.accessories.map((ob) => {
    tradeaccessories.push({ uom: ob.unit, accessoryCategory: ob.accessory.code, uomValue: ob.uom, count: ob.accessorycount });
  });
  return tradeaccessories;
};

export const gettradeupdateaccessories = (data) => {
  let TLaccessories = [];
  const isEditRenew = window.location.href.includes("renew-trade");
  if(data?.TradeDetails?.isAccessories?.i18nKey.includes("NO"))
  {
    data?.tradeLicenseDetail?.accessories && data.tradeLicenseDetail.accessories.map((oldunit) => {
      TLaccessories.push({...oldunit,active:false});
    })
  }
  else{
  data?.tradeLicenseDetail?.accessories && data.tradeLicenseDetail.accessories.map((oldunit) => {
    data.TradeDetails.accessories.map((newunit) => {
      if(oldunit.id === newunit.id)
      {
        if (oldunit.accessoryCategory !== newunit.accessory.code)
        {
          oldunit.accessoryCategory = newunit.accessory.code;
          TLaccessories.push(oldunit);
        }
        else
        {
          let found = TLaccessories.length > 0 ? TLaccessories.some(el => el.id === oldunit.id):false;
          if(!found)TLaccessories.push(oldunit);
        }

      }
      else
      {
        if(!isEditRenew){
          let found = TLaccessories.length > 0 ? TLaccessories.some(el => el.id === oldunit.id):false;
          if(!found)TLaccessories.push({...oldunit,active:false});
        }
        
      }
    })
  })
  data.TradeDetails.accessories.map((ob) => {
    if(!ob.id)
    {
      TLaccessories.push({ uom: ob.unit, accessoryCategory: ob.accessory.code, uomValue: ob.uom, count: ob.accessorycount });
    }
  })
}
  return TLaccessories;
}

export const convertToTrade = (data = {}) => {
  let Financialyear = sessionStorage.getItem("CurrentFinancialYear");
  const formdata = {
    Licenses: [
      {
        action: "INITIATE",
        applicationType: "NEW",
        commencementDate: Date.parse(data?.TradeDetails?.CommencementDate),
        financialYear: Financialyear ? Financialyear : "2021-22",
        licenseType: "PERMANENT",
        tenantId: data?.address?.city?.code,
        tradeLicenseDetail: {
          channel:"CITIZEN",
          address: {
            city: data?.address?.city?.code,
            locality: {
              code: data?.address?.locality?.code,
            },
            tenantId: data?.tenantId,
            pincode: data?.address?.pincode,
            doorNo: data?.address?.doorNo,
            street: data?.address?.street,
            landmark: data?.address?.landmark,
          },
          applicationDocuments: null,
          accessories: data?.TradeDetails?.accessories ? getaccessories(data) : null,
          owners: getownerarray(data),
          structureType: data?.TradeDetails?.StructureType.code !=="IMMOVABLE" ? data?.TradeDetails?.VehicleType.code : data?.TradeDetails?.BuildingType.code,
          subOwnerShipCategory: data?.ownershipCategory?.code,
          tradeUnits: gettradeunits(data),
        },
        tradeName: data?.TradeDetails?.TradeName,
        wfDocuments: [],
        applicationDocuments: [],
        workflowCode: "NewTL",
      },
    ],
  };
  return formdata;
};

export const getwfdocuments = (data) => {
  let wfdoc = [];
  let doc = data ? data.owners.documents : [];
  doc["OwnerPhotoProof"] && wfdoc.push({
    fileName: doc["OwnerPhotoProof"].name,
    fileStoreId: doc["OwnerPhotoProof"].fileStoreId,
    documentType: "OWNERPHOTO",
    tenantId: data?.tenantId,
  });
  doc["ProofOfIdentity"] && wfdoc.push({
    fileName: doc["ProofOfIdentity"].name,
    fileStoreId: doc["ProofOfIdentity"].fileStoreId,
    documentType: "OWNERIDPROOF",
    tenantId: data?.tenantId,
  });
  doc["ProofOfOwnership"] && wfdoc.push({
    fileName: doc["ProofOfOwnership"].name,
    fileStoreId: doc["ProofOfOwnership"].fileStoreId,
    documentType: "OWNERSHIPPROOF",
    tenantId: data?.tenantId,
  });
  return wfdoc;
}

export const getEditTradeDocumentUpdate = (data) => {
  let updateddocuments=[];
  let doc = data ? data.owners.documents : [];
  data.tradeLicenseDetail.applicationDocuments.map((olddoc) => {
    if(olddoc.documentType === "OWNERPHOTO" && olddoc.fileStoreId === data.owners.documents["OwnerPhotoProof"].fileStoreId ||
    olddoc.documentType === "OWNERSHIPPROOF" && olddoc.fileStoreId == data.owners.documents["ProofOfOwnership"].fileStoreId ||
    olddoc.documentType === "OWNERIDPROOF" && olddoc.fileStoreId === data.owners.documents["ProofOfIdentity"].fileStoreId)
    {
      updateddocuments.push(olddoc);
    }
    else{
    if(olddoc.documentType === "OWNERPHOTO" && olddoc.fileStoreId !== data.owners.documents["OwnerPhotoProof"].fileStoreId)
    {
      updateddocuments.push({
        fileName: doc["OwnerPhotoProof"].name,
        fileStoreId: doc["OwnerPhotoProof"].fileStoreId,
        documentType: "OWNERPHOTO",
        tenantId: data?.tenantId,
      });
      updateddocuments.push({...olddoc, active :"false"});
    }
    if(olddoc.documentType === "OWNERSHIPPROOF" && olddoc.fileStoreId !== data.owners.documents["ProofOfOwnership"].fileStoreId)
    {
      updateddocuments.push({
        fileName: doc["ProofOfOwnership"].name,
        fileStoreId: doc["ProofOfOwnership"].fileStoreId,
        documentType: "OWNERSHIPPROOF",
        tenantId: data?.tenantId,
      });
      updateddocuments.push({...olddoc,active:"false"});
    }
    if(olddoc.documentType === "OWNERIDPROOF" && olddoc.fileStoreId !== data.owners.documents["ProofOfIdentity"].fileStoreId)
    {
      updateddocuments.push({
        fileName: doc["ProofOfIdentity"].name,
        fileStoreId: doc["ProofOfIdentity"].fileStoreId,
        documentType: "OWNERIDPROOF",
        tenantId: data?.tenantId,
      });
      updateddocuments.push({...olddoc,active:"false"});
    }
  }
  });
  return updateddocuments;
}

export const getEditRenewTradeDocumentUpdate = (data,datafromflow) => {
  let updateddocuments=[];
  let doc = datafromflow ? datafromflow.owners.documents : [];
  data.tradeLicenseDetail.applicationDocuments.map((olddoc) => {
    if(olddoc.documentType === "OWNERPHOTO" && olddoc.fileStoreId === datafromflow.owners.documents["OwnerPhotoProof"].fileStoreId ||
    olddoc.documentType === "OWNERSHIPPROOF" && olddoc.fileStoreId == datafromflow.owners.documents["ProofOfOwnership"].fileStoreId ||
    olddoc.documentType === "OWNERIDPROOF" && olddoc.fileStoreId === datafromflow.owners.documents["ProofOfIdentity"].fileStoreId)
    {
      updateddocuments.push(olddoc);
    }
    else{
    if(olddoc.documentType === "OWNERPHOTO" && olddoc.fileStoreId !== datafromflow.owners.documents["OwnerPhotoProof"].fileStoreId)
    {
      updateddocuments.push({
        fileName: doc["OwnerPhotoProof"].name,
        fileStoreId: doc["OwnerPhotoProof"].fileStoreId,
        documentType: "OWNERPHOTO",
        tenantId: data?.tenantId,
      });
      updateddocuments.push({...olddoc, active :"false"});
    }
    if(olddoc.documentType === "OWNERSHIPPROOF" && olddoc.fileStoreId !== datafromflow.owners.documents["ProofOfOwnership"].fileStoreId)
    {
      updateddocuments.push({
        fileName: doc["ProofOfOwnership"].name,
        fileStoreId: doc["ProofOfOwnership"].fileStoreId,
        documentType: "OWNERSHIPPROOF",
        tenantId: data?.tenantId,
      });
      updateddocuments.push({...olddoc,active:"false"});
    }
    if(olddoc.documentType === "OWNERIDPROOF" && olddoc.fileStoreId !== datafromflow.owners.documents["ProofOfIdentity"].fileStoreId)
    {
      updateddocuments.push({
        fileName: doc["ProofOfIdentity"].name,
        fileStoreId: doc["ProofOfIdentity"].fileStoreId,
        documentType: "OWNERIDPROOF",
        tenantId: data?.tenantId,
      });
      updateddocuments.push({...olddoc,active:"false"});
    }
  }
  });
  return updateddocuments;
}

export const convertToUpdateTrade = (data = {}, datafromflow, tenantId) => {
  const isEdit = window.location.href.includes("renew-trade");
  let formdata1 = {
    Licenses: [
    ]
  }
  formdata1.Licenses[0] = {
    ...data.Licenses[0],
  }
  formdata1.Licenses[0].action = "APPLY";
  formdata1.Licenses[0].wfDocuments = formdata1.Licenses[0].wfDocuments ? formdata1.Licenses[0].wfDocuments:[]
    formdata1.Licenses[0].tradeLicenseDetail.applicationDocuments = !isEdit ? (formdata1.Licenses[0].tradeLicenseDetail.applicationDocuments ? formdata1.Licenses[0].tradeLicenseDetail.applicationDocuments : getwfdocuments(datafromflow)):getEditRenewTradeDocumentUpdate(data?.Licenses[0],datafromflow)
    console.info("formdata1", formdata1);
  return formdata1;
}

export const getvalidfromdate = (date, fy) => {
  let temp = parseInt(fy[0].id);
  let object;
  fy && fy.map((ob) => {
    if (parseInt(ob.id) > temp) {
      object = ob;
      temp = parseInt(ob.id);
    }
  })
  return object;
}

export const getvalidTodate = (date, fy) => {

  let temp = parseInt(fy[0].id);
  let object;
  fy && fy.map((ob) => {
    if (parseInt(ob.id) > temp) {
      object = ob;
      temp = parseInt(ob.id);
    }
  })
  return object;
}

export const stringToBoolean = (value) => {

  if (value) {
    switch (value.toLowerCase().trim()) {
      case "true": case "yes": case "1": return true;
      case "false": case "no": case "0": case null: return false;
      default: return Boolean(value);
    }
  }
  else {
    return Boolean(value);
  }
}


//FinancialYear
export const convertToEditTrade = (data, fy = []) => {
  const currrentFYending = fy.filter(item => item.code === data?.financialYear)[0]
    .endingDate;
    let nextFinancialYearForRenewal = fy.filter(item => item.startingDate === currrentFYending+1000)[0]?.code;
  let isDirectrenewal = stringToBoolean(sessionStorage.getItem("isDirectRenewal"));
  let formdata = {
    Licenses: [
      {
        id: data?.id,
        tenantId: data?.tenantId,
        businessService: data?.businessService,
        licenseType: data?.licenseType,
        applicationType: "RENEWAL",
        workflowCode: isDirectrenewal ? "DIRECTRENEWAL" : "EDITRENEWAL",
        licenseNumber: data?.licenseNumber,
        applicationNumber: data?.applicationNumber,
        tradeName: data?.tradeName,
        applicationDate: data?.applicationDate,
        commencementDate: data?.commencementDate,
        issuedDate: data?.issuedDate,
        financialYear: nextFinancialYearForRenewal || "2020-21",
        validFrom: data?.validFrom,
        validTo: data?.validTo,
        action: "INITIATE",
        wfDocuments: data?.wfDocuments,
        status: data?.status,
        tradeLicenseDetail: {
          address: data.tradeLicenseDetail.address,
          applicationDocuments: data.tradeLicenseDetail.applicationDocuments,
          accessories: isDirectrenewal ? data.tradeLicenseDetail.accessories : gettradeupdateaccessories(data),
          owners: isDirectrenewal ? data.tradeLicenseDetail.owners : gettradeownerarray(data),
          structureType: isDirectrenewal ? data.tradeLicenseDetail.structureType : (data?.TradeDetails?.VehicleType ? data?.TradeDetails?.VehicleType.code : data?.TradeDetails?.BuildingType.code),
          subOwnerShipCategory: data?.ownershipCategory?.code,
          tradeUnits: gettradeupdateunits(data),
          additionalDetail: data.tradeLicenseDetail.additionalDetail,
          auditDetails: data.tradeLicenseDetail.auditDetails,
          channel: data.tradeLicenseDetail.channel,
          id: data.tradeLicenseDetail.id,
          institution: data.tradeLicenseDetail.institution,
        },
        calculation: null,
        auditDetails: data?.auditDetails,
        accountId: data?.accountId,
      }
    ]
  }
  console.log("renewal payload formdata", formdata);
  return formdata;
}





//FinancialYear
export const convertToResubmitTrade = (data) => {

  let formdata = {
    Licenses: [
      {
        id: data?.id,
        tenantId: data?.tenantId,
        businessService: data?.businessService,
        licenseType: data?.licenseType,
        applicationType: data.applicationType,
        workflowCode: data.workflowCode,
        licenseNumber: data?.licenseNumber,
        applicationNumber: data?.applicationNumber,
        tradeName: data?.tradeName,
        applicationDate: data?.applicationDate,
        commencementDate: data?.commencementDate,
        issuedDate: data?.issuedDate,
        financialYear: data?.financialYear,
        validFrom: data?.validFrom,
        validTo: data?.validTo,
        action: "FORWARD",
        wfDocuments: data?.wfDocuments,
        status: data?.status,
        tradeLicenseDetail: {
          address: data.tradeLicenseDetail.address,
          applicationDocuments: getEditTradeDocumentUpdate(data),
          accessories: gettradeupdateaccessories(data),
          owners: gettradeownerarray(data),
          structureType: (data?.TradeDetails?.VehicleType ? data?.TradeDetails?.VehicleType.code : data?.TradeDetails?.BuildingType.code),
          subOwnerShipCategory: data?.ownershipCategory?.code,
          tradeUnits: gettradeupdateunits(data),
          additionalDetail: data.tradeLicenseDetail.additionalDetail,
          auditDetails: data.tradeLicenseDetail.auditDetails,
          channel: data.tradeLicenseDetail.channel,
          id: data.tradeLicenseDetail.id,
          institution: data.tradeLicenseDetail.institution,
        },
        calculation: null,
        auditDetails: data?.auditDetails,
        accountId: data?.accountId,
      }
    ]
  }
  return formdata;
}

/*   method to check value  if not returns NA*/

export const convertEpochToDateCitizen = (dateEpoch) => {
  // Returning null in else case because new Date(null) returns initial date from calender
  if (dateEpoch) {
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  } else {
    return null;
  }
};

export const checkForNA = (value = "") => {
  return checkForNotNull(value) ? value : "PT_NA";
};

export const getCommencementDataFormat = (date) => {
  let newDate = new Date(date).getFullYear().toString() + "-" + (new Date(date).getMonth() + 1).toString() + "-" + new Date(date).getDate().toString()
  return newDate;
};

/*   method to check value  if not returns NA*/
export const isPropertyVacant = (value = "") => {
  return checkForNotNull(value) && value.includes("VACANT") ? true : false;
};

/*   method to check value equal to flat / part of building if not returns NA  */
export const isPropertyFlatorPartofBuilding = (value = "") => {
  return checkForNotNull(value) && value.includes("SHAREDPROPERTY") ? true : false;
};

export const isPropertyIndependent = (value = "") => {
  return checkForNotNull(value) && value.includes("INDEPENDENT") ? true : false;
};

export const isthere1Basement = (value = "") => {
  return checkForNotNull(value) && value.includes("ONE") ? true : false;
};

export const isthere2Basement = (value = "") => {
  return checkForNotNull(value) && value.includes("TWO") ? true : false;
};

export const isPropertyselfoccupied = (value = "") => {
  return checkForNotNull(value) && value.includes("SELFOCCUPIED") ? true : false;
};

export const isPropertyPartiallyrented = (value = "") => {
  return checkForNotNull(value) && value.includes("PARTIALLY") ? true : false;
};

export const ispropertyunoccupied = (value = "") => {
  return checkForNotNull(value) && value.includes("YES") ? true : false;
};
/*   method to get required format from fielstore url*/
export const pdfDownloadLink = (documents = {}, fileStoreId = "", format = "") => {
  /* Need to enhance this util to return required format*/

  let downloadLink = documents[fileStoreId] || "";
  let differentFormats = downloadLink?.split(",") || [];
  let fileURL = "";
  differentFormats.length > 0 &&
    differentFormats.map((link) => {
      if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
        fileURL = link;
      }
    });
  return fileURL;
};

/*   method to get filename  from fielstore url*/
export const pdfDocumentName = (documentLink = "", index = 0) => {
  let documentName = decodeURIComponent(documentLink.split("?")[0].split("/").pop().slice(13)) || `Document - ${index + 1}`;
  return documentName;
};

/* methid to get date from epoch */
export const convertEpochToDate = (dateEpoch) => {
  // Returning null in else case because new Date(null) returns initial date from calender
  if (dateEpoch) {
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${year}-${month}-${day}`;//`${day}/${month}/${year}`;
  } else {
    return null;
  }
};

export const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};

export const checkIsAnArray = (obj = []) => {
  return obj && Array.isArray(obj) ? true : false;
};
export const checkArrayLength = (obj = [], length = 0) => {
  return checkIsAnArray(obj) && obj.length > length ? true : false;
};

export const getWorkflow = (data = {}) => {
  return {
    action: data?.isEditProperty ? "REOPEN" : "OPEN",
    businessService: `PT.${getCreationReason(data)}`,
    moduleName: "PT",
  };
};

export const getCreationReason = (data = {}) => {
  return data?.isUpdateProperty ? "UPDATE" : "CREATE";
};

export const getUniqueItemsFromArray = (data, identifier) => {
  const uniqueArray = [];
  const map = new Map();
  for (const item of data) {
    if (!map.has(item[identifier])) {
      map.set(item[identifier], true); // set any value to Map
      uniqueArray.push(item);
    }
  }
  return uniqueArray;
};

export const commonTransform = (object, path) => {
  let data = get(object, path);
  let transformedData = {};
  data.map(a => {
    const splitList = a.code.split(".");
    let ipath = "";
    for (let i = 0; i < splitList.length; i += 1) {
      if (i != splitList.length - 1) {
        if (
          !(
            splitList[i] in
            (ipath === "" ? transformedData : get(transformedData, ipath))
          )
        ) {
          set(
            transformedData,
            ipath === "" ? splitList[i] : ipath + "." + splitList[i],
            i < splitList.length - 2 ? {} : []
          );
        }
      } else {
        get(transformedData, ipath).push(a);
      }
      ipath = splitList.slice(0, i + 1).join(".");
    }
  });
  set(object, path, transformedData);
  return object;
};

export const convertDateToEpoch = (dateString, dayStartOrEnd = "dayend") => {
  //example input format : "2018-10-02"
  try {
    const parts = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    const DateObj = new Date(Date.UTC(parts[1], parts[2] - 1, parts[3]));
    DateObj.setMinutes(DateObj.getMinutes() + DateObj.getTimezoneOffset());
    if (dayStartOrEnd === "dayend") {
      DateObj.setHours(DateObj.getHours() + 24);
      DateObj.setSeconds(DateObj.getSeconds() - 1);
    }
    return DateObj.getTime();
  } catch (e) {
    return dateString;
  }
};

export const getQueryStringParams = (query) => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query).split("&").reduce((params, param) => {
      let [key, value] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {})
    : {};
};

export const getPattern = type => {
  switch (type) {
    case "Name":
      return /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;“”‘’]{1,50}$/i;
    case "Street":
        return /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;“”‘’]{1,256}$/i;    
    case "MobileNo":
      return /^[6789][0-9]{9}$/i;
    case "Amount":
      return /^[0-9]{0,8}$/i;
    case "NonZeroAmount":
      return /^[1-9][0-9]{0,7}$/i;
    case "DecimalNumber":
      return /^\d{0,8}(\.\d{1,2})?$/i;
    //return /(([0-9]+)((\.\d{1,2})?))$/i;
    case "Email":
      return /^(?=^.{1,64}$)((([^<>()\[\]\\.,;:\s$*@'"]+(\.[^<>()\[\]\\.,;:\s@'"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))$/i;
    case "Address":
      return /^[^\$\"<>?\\\\~`!@$%^()+={}\[\]*:;“”‘’]{1,500}$/i;
    case "PAN":
      return /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/i;
    case "TradeName":
      return /^[-@.\/#&+\w\s]*$/
    //return /^[^\$\"'<>?\\\\~`!@#$%^()+={}\[\]*,.:;“”‘’]{1,100}$/i;
    case "Date":
      return /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/i;
    case "UOMValue":
      return /^(0)*[1-9][0-9]{0,5}$/i;
    case "OperationalArea":
      return /^(0)*[1-9][0-9]{0,6}$/i;
    case "NoOfEmp":
      return /^(0)*[1-9][0-9]{0,6}$/i;
    case "GSTNo":
      return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/i;
    case "DoorHouseNo":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*:;“”‘’]{1,50}$/i;
    case "BuildingStreet":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,64}$/i;
    case "Pincode":
      return /^[1-9][0-9]{5}$/i;
    case "Landline":
      return /^[0-9]{11}$/i;
    case "propertyId":
      return /^[a-zA-z0-9\s\\/\-]$/i;
    case "ElectricityConnNo":
      return /^.{1,15}$/i;
    case "DocumentNo":
      return /^[0-9]{1,15}$/i;
    case "eventName":
      return /^[^\$\"<>?\\\\~`!@#$%^()+={}\[\]*,.:;“”]{1,65}$/i;
    case "eventDescription":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,500}$/i;
    case "cancelChallan":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,100}$/i;
    case "FireNOCNo":
      return /^[a-zA-Z0-9-]*$/i;
    case "consumerNo":
      return /^[a-zA-Z0-9/-]*$/i;
    case "AadharNo":
      //return /^\d{4}\s\d{4}\s\d{4}$/;
      return /^([0-9]){12}$/;
    case "ChequeNo":
      return /^(?!0{6})[0-9]{6}$/;
    case "Comments":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,50}$/i;
    case "OldLicenceNo":
      return /^[a-zA-Z0-9-/]{0,64}$/;
  }
};

export const checkForEmployee = (role) => {
  const tenantId = window.Digit.ULBService.getCurrentTenantId();
  const userInfo = window.Digit.UserService.getUser();
  const rolearray = userInfo?.info?.roles.filter(item => { if (item.code == role && item.tenantId === tenantId) return true; });
  return rolearray?.length;
}

export const convertEpochToDateDMY = (dateEpoch) => {
  if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
    return "NA";
  }
  const dateFromApi = new Date(dateEpoch);
  let month = dateFromApi.getMonth() + 1;
  let day = dateFromApi.getDate();
  let year = dateFromApi.getFullYear();
  month = (month > 9 ? "" : "0") + month;
  day = (day > 9 ? "" : "0") + day;
  return `${day}/${month}/${year}`;
};

export const customiseCreateFormData = (formData) => {

  const obj = {
    licenseType: "PERMANENT",
    tradeLicenseDetail: {
      address: {
        city: formData?.address?.city?.code,
        doorNo: formData?.address?.doorNo,
        street: formData?.address?.street,
        buildingName: formData?.address?.buildingName,
        locality: { ...formData?.address?.locality },
        pincode: formData?.address?.pincode,
      },
     // structureType: isDirectrenewal ? data.tradeLicenseDetail.structureType : 
     //(data?.TradeDetails?.VehicleType ? data?.TradeDetails?.VehicleType.code :
     // data?.TradeDetails?.BuildingType.code),


      structureType: formData?.tradedetils?.[0]?.structureSubType?.code,
      additionalDetail: {
        occupancyType: formData?.tradedetils?.[0]?.occupancyType?.code,
        gstNo: formData?.tradedetils?.[0]?.gstNo,
        electricityConnectionNo: formData?.address?.electricityConnectionNo,
        relationType: formData?.owners?.[0]?.relationType?.code &&  `RELATIONTYPE.${formData?.owners?.[0]?.relationType?.code}`, //to be validated from formdata?.owner
      },
      operationalArea: formData?.tradedetils?.[0]?.operationalArea, // to be added
      noOfEmployees: formData?.tradedetils?.[0]?.noOfEmployees, // to be added
      tradeUnits: formData?.tradeUnits?.map((e) => ({
        tradeType: e?.tradeSubType?.code,
        uom: e.uom,
        uomValue: e.unit,
        rate: e.rate, //needs to be added // billing slab service
      })),
      institution: formData?.owners?.[0]?.designation ?  {designation: formData?.owners?.[0]?.designation}:null,        
      subOwnerShipCategory: formData?.ownershipCategory?.code,
      owners: formData?.owners?.map((e) => ({
        userName: e.name, //to be checked
        name: e.name,
        gender: e?.gender?.code,
        mobileNumber: e?.mobileNumber,
        emailId: e?.emailId,
        altContactNumber: e?.altContactNumber,
        pan: e?.pan, // to be added
        ownerType: e?.ownerType?.code,
        aadhaarNumber: null,
        permanentAddress: e.permanentAddress, // to be validated
        permanentCity: null,
        permanentPinCode: null,
        correspondenceAddress: null,
        correspondenceCity: null,
        correspondencePinCode: null,
        active: true,
        locale: null,
        type: "CITIZEN",
        accountLocked: false,
        accountLockedDate: 0,
        fatherOrHusbandName: e.fatherOrHusbandName,
        signature: null,
        bloodGroup: null,
        photo: null,
        identificationMark: null,
        tenantId:
          formData?.address?.city?.code ||
          window.Digit.ULBService.getCurrentTenantId(),
        dob: convertDateToEpoch(e.dob),
        relationship: e?.relationship?.code,
      })),
      applicationDocuments: null,
    },
    tradeName: formData?.tradedetils?.[0]?.tradeName,
    applicationType: "NEW",
    workflowCode: "NewTL",
    action: "INITIATE",

    commencementDate: convertDateToEpoch(
      formData?.tradedetils?.[0]?.commencementDate
    ),
    tenantId:
      formData?.address?.city?.code ||
      window.Digit.ULBService.getCurrentTenantId(),
    financialYear: formData?.tradedetils?.[0]?.financialYear?.code,
  };

  
  return obj ;
};


export const formatFormDataToCreateTLApiObject = (formData) => {
  const obj = {
    licenseType: "PERMANENT",
    tradeLicenseDetail: {
      address: {
        city: formData?.address?.city?.code,
        doorNo: formData?.address?.doorNo,
        street: formData?.address?.street,
        locality: { ...formData?.address?.locality },
        pincode: formData?.address?.pincode,
      },

      structureType: formData?.TradeDetails?.StructureType?.code?.includes(
        "IMMOVABLE"
      )
        ? formData?.TradeDetails?.BuildingType?.code
        : formData?.TradeDetails?.VehicleType?.code,
      additionalDetail: {
        occupancyType: formData?.TradeDetails?.OccupancyType?.code,
        gstNo: formData?.TradeDetails?.gstNo,
        electricityConnectionNo: formData?.address?.electricityConnectionNo,
        //relationType:  formData?.owners?.[0]?.tradeRelationship?.code && `RELATIONTYPE.${formData?.owners?.[0]?.tradeRelationship?.code}`, //to be validated from formdata?.owners
      },
      operationalArea: formData?.operationalarea?.operationalarea, // to be added
      noOfEmployees: formData?.noofemployees?.noofemployees, // to be added
      tradeUnits: formData?.TradeDetails?.units?.map((e) => ({
        tradeType: e?.tradesubtype?.code,
        uom: e.uom,
        uomValue: e.unit,
        rate: e.rate, //needs to be added // billing slab service
      })),
      institution: formData?.owners?.owners?.[0]?.designation ?  {designation: formData?.owners?.owners?.[0]?.designation}:null,        
      subOwnerShipCategory: formData?.ownershipCategory?.code,
      owners: formData?.owners?.owners?.map((e) => ({
        userName: e.name, //to be checked
        name: e.name,
        gender: e?.gender?.code,
        mobileNumber: e?.mobileNumber,
        emailId: e?.email,
        altContactNumber: null,
        pan: e?.pan, // to be added
        aadhaarNumber: null,
        permanentAddress: e.correspondenceAddress, // to be validated
        permanentCity: null,
        permanentPinCode: null,
        correspondenceAddress: null,
        correspondenceCity: null,
        correspondencePinCode: null,
        active: true,
        locale: null,
        type: "CITIZEN",
        accountLocked: false,
        accountLockedDate: 0,
        fatherOrHusbandName: e.fatherOrHusbandName,
        signature: null,
        bloodGroup: null,
        photo: null,
        identificationMark: null,
        tenantId:
          formData?.address?.city?.code ||
          window.Digit.ULBService.getCurrentTenantId(),
        dob: convertDateToEpoch(e.DOB),
        relationship: e?.relationship?.code,
      })),
      applicationDocuments: null,
    },
    tradeName: formData?.TradeDetails?.TradeName,
    applicationType: "NEW",
    workflowCode: "NewTL",
    action: "INITIATE",
    commencementDate: convertDateToEpoch(
      formData?.TradeDetails?.commencementDate
    ),
    tenantId:
      formData?.address?.city?.code ||
      window.Digit.ULBService.getCurrentTenantId(),
    financialYear: formData?.TradeDetails?.FY?.code,
  };

  
  return { Licenses: [obj] };
};

export const formatResponseDataToCreateTLApiObject = (data, formData) => {
  data.tradeLicenseDetail.applicationDocuments = getwfdocuments(formData);
  data.action = "APPLY";
  return { Licenses: [data] };
};

export const ptAccess = () => {
  const userInfo = window.Digit.UserService.getUser();
  const userRoles = userInfo.info.roles.map((roleData) => roleData.code);
  const ptRoles = ["PT_APPROVER", "PT_CEMP", "PTCEMP", "PT_DOC_VERIFIER", "PT_FIELD_INSPECTOR"];

  const PT_ACCESS = userRoles.filter((role) => ptRoles.includes(role));

  return PT_ACCESS.length > 0;
};
