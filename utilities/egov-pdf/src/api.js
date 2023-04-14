var config = require("./config");
var axios = require("axios").default;
var url = require("url");

auth_token = config.auth_token;

async function search_user(uuid, tenantId, requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.user, config.paths.user_search),
    data: {
      RequestInfo: requestinfo.RequestInfo,
      uuid: [uuid],
      tenantId: tenantId,
    },
  });
}

async function search_epass(uuid, tenantId, requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.epass, config.paths.epass_search),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      ids: uuid,
    },
  });
}

async function search_property(
  uuid,
  tenantId,
  requestinfo,
  allowCitizenTOSearchOthersRecords
) {
  // currently single property pdfs supported
  if (uuid.split(",").length > 1) {
    uuid = uuid.split(",")[0].trim();
  }
  var params = {
    tenantId: tenantId,
    uuids: uuid,
  };
  if (
    checkIfCitizen(requestinfo) &&
    allowCitizenTOSearchOthersRecords != true
  ) {
    var mobileNumber = requestinfo.RequestInfo.userInfo.mobileNumber;
    var userName = requestinfo.RequestInfo.userInfo.userName;
    params["mobileNumber"] = mobileNumber || userName;
  }
  return await axios({
    method: "post",
    url: url.resolve(config.host.pt, config.paths.pt_search),
    data: requestinfo,
    params,
  });
}

async function search_workflow(applicationNumber, tenantId, requestinfo) {
  var params = {
    tenantId: tenantId,
    businessIds: applicationNumber,
  };
  return await axios({
    method: "post",
    url: url.resolve(config.host.workflow, config.paths.workflow_search),
    data: requestinfo,
    params,
  });
}

async function search_payment(consumerCodes, tenantId, requestinfo, bussinessService) {
  var params = {
    tenantId: tenantId,
    consumerCodes: consumerCodes,
  };
  var searchEndpoint = config.paths.payment_search;
  searchEndpoint = searchEndpoint.replace(/\$module/g,bussinessService);
  if (checkIfCitizen(requestinfo)) {
    var mobileNumber = requestinfo.RequestInfo.userInfo.mobileNumber;
    var userName = requestinfo.RequestInfo.userInfo.userName;
    params["mobileNumber"] = mobileNumber || userName;
  }
  return await axios({
    method: "post",
    url: url.resolve(config.host.payments, searchEndpoint),
    data: requestinfo,
    params,
  });
}

async function search_bill(consumerCode, tenantId, requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.bill, config.paths.bill_search),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      consumerCode: consumerCode,
    },
  });
}

async function search_tllicense(applicationNumber, tenantId, requestinfo, allowCitizenTOSearchOthersRecords) {
  var params = {
    tenantId: tenantId,
    applicationNumber: applicationNumber,
  };
  if (checkIfCitizen(requestinfo) && allowCitizenTOSearchOthersRecords != true) {
    var mobileNumber = requestinfo.RequestInfo.userInfo.mobileNumber;
    var userName = requestinfo.RequestInfo.userInfo.userName;
    params["mobileNumber"] = mobileNumber || userName;
  }
  return await axios({
    method: "post",
    url: url.resolve(config.host.tl, config.paths.tl_search),
    data: requestinfo,
    params,
  });
}

async function search_water(applicationNumber, tenantId, requestinfo, allowCitizenTOSearchOthersRecords) {
  var params = {
    tenantId: tenantId,
    applicationNumber: applicationNumber,
  };
  if (checkIfCitizen(requestinfo) && allowCitizenTOSearchOthersRecords != true) {
    var mobileNumber = requestinfo.RequestInfo.userInfo.mobileNumber;
    var userName = requestinfo.RequestInfo.userInfo.userName;
    params["mobileNumber"] = mobileNumber || userName;
  }
  return await axios({
    method: "post",
    url: url.resolve(config.host.wns, config.paths.water_search),
    data: requestinfo,
    params,
  });
}

async function search_sewerage(applicationNumber, tenantId, requestinfo, allowCitizenTOSearchOthersRecords) {
  var params = {
    tenantId: tenantId,
    applicationNumber: applicationNumber,
  };
  if (checkIfCitizen(requestinfo) && allowCitizenTOSearchOthersRecords != true) {
    var mobileNumber = requestinfo.RequestInfo.userInfo.mobileNumber;
    var userName = requestinfo.RequestInfo.userInfo.userName;
    params["mobileNumber"] = mobileNumber || userName;
  }
  return await axios({
    method: "post",
    url: url.resolve(config.host.wns, config.paths.sewerage_search),
    data: requestinfo,
    params,
  });
}

async function search_mdms(tenantId, module, master, requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.mdms, config.paths.mdms_search),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      ids: uuid,
    },
  });
}

async function search_echallan(tenantId, challanNo,requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.challan, config.paths.mcollect_challan_search),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      challanNo: challanNo,
    },
  });
}


async function search_bill_genie(data,requestinfo) {
   return await axios({
    method: "post",
    url: url.resolve(config.host.bill, config.paths.bill_genie_getBill),
    data: Object.assign(requestinfo, data),
  });
}


async function search_waterOpenSearch(data,requestinfo) {
  
  return await axios({
    method: "post",
    url: url.resolve(config.host.bill, config.paths.searcher_water_open_search),
    data: Object.assign(requestinfo, data),
  });
}

async function search_sewerageOpenSearch(data,requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.bill, config.paths.searcher_sewerage_open_search),
    data: Object.assign(requestinfo, data),
  });
}

async function search_bill_genie_water_bills(data,requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.bill, config.paths.bill_genie_waterBills),
    data: Object.assign(requestinfo, data),
  });
}

async function search_bill_genie_sewerage_bills(data,requestinfo) {
  return await axios({
    method: "post",
    url: url.resolve(config.host.bill, config.paths.bill_genie_sewerageBills),
    data: Object.assign(requestinfo, data),
  });
}

async function search_billV2(tenantId, consumerCode, serviceId, requestinfo) {
  //console.log("search_billV2 consumerCode--",consumerCode,"tenantId",tenantId,"serviceId",serviceId);
  return await axios({
    method: "post",
    url: url.resolve(config.host.mcollectBilling, config.paths.mcollect_bill),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      consumerCode: consumerCode,
      service:serviceId
    },
  });
}

async function fetch_bill(tenantId, consumerCode, serviceId, requestinfo) {
  //console.log("search_billV2 consumerCode--",consumerCode,"tenantId",tenantId,"serviceId",serviceId);
  return await axios({
    method: "post",
    url: url.resolve(config.host.mcollectBilling, config.paths.fetch_bill),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      consumerCode: consumerCode,
      businessService: serviceId
    },
  });
}

async function search_amendment(tenantId, amendmentId, serviceId, requestinfo) {
  //console.log("search_billV2 consumerCode--",amendmentId,"tenantId",tenantId,"serviceId",serviceId);
  return await axios({
    method: "post",
    url: url.resolve(config.host.mcollectBilling, config.paths.bill_ammendment_search),
    data: requestinfo,
    params: {
      tenantId: tenantId,
      amendmentId: amendmentId,
      businessService:serviceId
    },
  });
}

/**
 * It generates bill of property tax and merge into single PDF file
 * @param {*} kafkaData - Data pushed in kafka topic
 */
async function create_bulk_pdf_pt(kafkaData){
  var propertyBills;
  var consolidatedResult = {Bill:[]};

  let { 
    tenantId, 
    locality, 
    bussinessService, 
    isConsolidated, 
    consumerCode, 
    requestinfo, 
    jobid
  } = kafkaData;

  try {

    try{
      var searchCriteria = {locality, tenantId, bussinessService};
      propertyBills = await search_bill(
        null, 
        null,
        {
          RequestInfo:requestinfo.RequestInfo,
          searchCriteria
        }
      );

      propertyBills = propertyBills.data.Bills;
      console.log("****propertyBills***",propertyBills);

      if(propertyBills.length>0){
        for(let propertyBill of propertyBills){
          if(propertyBill.status ==='EXPIRED'){
            var billresponse = await fetch_bill(
              tenantId, propertyBill.consumerCode, propertyBill.businessService, {RequestInfo:requestinfo.RequestInfo}
            );
            if (billresponse?.data?.Bill?.[0]) consolidatedResult.Bill.push(billresponse.data.Bill[0]);
          }
          else{
            if(propertyBill.status ==='ACTIVE')
              consolidatedResult.Bill.push(propertyBill);
          }
        }
      }
    }
    catch (ex) {
      if (ex.response && ex.response.data) logger.error(ex.response.data);
      throw new Error("Failed to query details of property ");
    }

    if (consolidatedResult?.Bill?.length > 0) {
      var pdfResponse;
      var pdfkey = config.pdf.ptbill_pdf_template;
      try {
        var batchSize = config.PDF_BATCH_SIZE;
        var size = consolidatedResult.Bill.length;
        var numberOfFiles = (size%batchSize) == 0 ? (size/batchSize) : (~~(size/batchSize) +1);
        for(var i = 0;i<size;i+=batchSize){
          var payloads = [];
          var billData = consolidatedResult.Bill.slice(i,i+batchSize);
          var billArray = { 
              Bill: billData,
              isBulkPdf: true,
              pdfJobId: jobid,
              pdfKey: pdfkey,
              totalPdfRecords:size,
              currentPdfRecords: billData.length,
              tenantId: tenantId,
              numberOfFiles:numberOfFiles,
              locality: locality,
              service: bussinessService,
              isConsolidated: isConsolidated,
              consumerCode: consumerCode
          };
          var pdfData = Object.assign({RequestInfo:requestinfo.RequestInfo}, billArray)
          payloads.push({
            topic: config.KAFKA_RECEIVE_CREATE_JOB_TOPIC,
            messages: JSON.stringify(pdfData)
          });
          producer.send(payloads, function(err, data) {
            if (err) {
              logger.error(err.stack || err);
              errorCallback({
                message: `error while publishing to kafka: ${err.message}`
              });
            } else {
              logger.info("jobid: " + jobid + ": published to kafka successfully");
            }
          });

        }

        try {
          const result = await pool.query('select * from egov_bulk_pdf_info where jobid = $1', [jobid]);
          if(result.rowCount>=1){
            const updateQuery = 'UPDATE egov_bulk_pdf_info SET totalrecords = $1 WHERE jobid = $2';
            await pool.query(updateQuery,[size, jobid]);
          }
        } catch (err) {
          logger.error(err.stack || err);
        }
      } catch (ex) {
        let errorMessage= "Failed to generate PDF"; 
        if (ex.response && ex.response.data) logger.error(ex.response.data);
        throw new Error(errorMessage);
      }
    } else {
      throw new Error("There is no billfound for the criteria");
    }

  } catch (ex) {
    throw new Error("Failed to query bill for property application");
  }

}

async function create_pdf(tenantId, key, data, requestinfo) {
  return await axios({
    responseType: "stream",
    method: "post",
    url: url.resolve(config.host.pdf, config.paths.pdf_create),
    data: Object.assign(requestinfo, data),
    params: {
      tenantId: tenantId,
      key: key,
    },
  });
}

function checkIfCitizen(requestinfo) {
  if (requestinfo.RequestInfo.userInfo.type == "CITIZEN") {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  create_pdf,
  search_epass,
  search_mdms,
  search_user,
  search_property,
  search_bill,
  search_payment,
  search_tllicense,
  search_workflow,
  search_echallan,
  search_billV2,
  search_bill_genie,
  search_amendment,
  search_water,
  search_sewerage,
  search_waterOpenSearch,
  search_sewerageOpenSearch,
  search_bill_genie_water_bills,
  search_bill_genie_sewerage_bills,
  fetch_bill,
  create_bulk_pdf_pt
};
