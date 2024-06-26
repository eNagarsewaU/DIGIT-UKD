package org.egov.pt.service;

import java.util.HashMap;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.pt.config.PropertyConfiguration;
import org.egov.pt.models.Property;
import org.egov.pt.models.PropertyCriteria;
import org.egov.pt.models.collection.Bill;
import org.egov.pt.models.collection.PaymentDetail;
import org.egov.pt.models.collection.PaymentRequest;
import org.egov.pt.models.enums.Status;
import org.egov.pt.models.workflow.ProcessInstanceRequest;
import org.egov.pt.models.workflow.State;
import org.egov.pt.producer.Producer;
import org.egov.pt.repository.PropertyRepository;
import org.egov.pt.util.PropertyUtil;
import org.egov.pt.web.contracts.PropertyRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentUpdateService {

	@Autowired
	private PropertyRepository propertyRepository;

	@Autowired
	private PropertyConfiguration config;

	@Autowired
	private WorkflowService wfIntegrator;

	@Autowired
	private Producer producer;

	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private PropertyUtil util;
	
	@Autowired
	private NotificationService notifService;

	/**
	 * Process the message from kafka and updates the status to paid
	 * 
	 * @param record The incoming message from receipt create consumer
	 */
	public void process(HashMap<String, Object> record) {

		try {

			PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
			RequestInfo requestInfo = paymentRequest.getRequestInfo();

			List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
			String tenantId = paymentRequest.getPayment().getTenantId();

			for (PaymentDetail paymentDetail : paymentDetails) {
				
				Boolean isModuleMutation = paymentDetail.getBusinessService().equalsIgnoreCase(config.getMutationWfName());
				
				if (isModuleMutation) {

					updateWorkflowForMutationPayment(requestInfo, tenantId, paymentDetail);
				}
			}
		} catch (Exception e) {
			log.error("KAFKA_PROCESS_ERROR:", e);
		}

	}

	/**
	 * method to do workflow update for Property
	 * 
	 * @param requestInfo
	 * @param tenantId
	 * @param paymentDetail
	 */
	private void updateWorkflowForMutationPayment(RequestInfo requestInfo, String tenantId, PaymentDetail paymentDetail) {
		log.info("~~~~~~~~~~~ updateWorkflowForMutationPayment ~~~~~~~~~~");
		Bill bill  = paymentDetail.getBill();
		
		PropertyCriteria criteria = PropertyCriteria.builder()
				.acknowledgementIds(Sets.newHashSet(bill.getConsumerCode()))
				.tenantId(tenantId)
				.build();
				
		List<Property> properties = propertyRepository.getPropertiesWithOwnerInfo(criteria, requestInfo, true);

		if (CollectionUtils.isEmpty(properties))
			throw new CustomException("INVALID RECEIPT",
					"No Properties found for the comsumerCode " + criteria.getPropertyIds());

//		Role role = Role.builder().code("SYSTEM_PAYMENT").build();
//		requestInfo.getUserInfo().getRoles().add(role);
		
		properties.forEach( property -> {
			
			PropertyRequest updateRequest = PropertyRequest.builder().requestInfo(requestInfo)
					.property(property).build();
			
			ProcessInstanceRequest wfRequest = util.getProcessInstanceForMutationPayment(updateRequest);
			
			if(wfRequest.getProcessInstances()!=null && wfRequest.getProcessInstances().get(0)!=null && wfRequest.getProcessInstances().get(0).getAction()!=null)
				log.info("~~~~~~~~~~~ payment workflow request = "+wfRequest.getProcessInstances().get(0).getAction());
			
			State state = wfIntegrator.callWorkFlow(wfRequest);
			log.info("~~~~~~~~~~~ updateWorkflowForMutationPayment ~~~~~~~~~~");
			property.setWorkflow(wfRequest.getProcessInstances().get(0));
			property.getWorkflow().setState(state);
			updateRequest.getProperty().setStatus(Status.fromValue(state.getApplicationStatus()));
			producer.push(config.getUpdatePropertyTopic(), updateRequest);			
			notifService.sendNotificationForMtPayment(updateRequest, bill.getTotalAmount());
		});
	}

}
