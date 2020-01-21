package org.egov.pt.repository.rowmapper;


import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.pt.models.Address;
import org.egov.pt.models.AuditDetails;
import org.egov.pt.models.Document;
import org.egov.pt.models.Institution;
import org.egov.pt.models.Locality;
import org.egov.pt.models.OwnerInfo;
import org.egov.pt.models.Property;
import org.egov.pt.models.enums.CreationReason;
import org.egov.pt.models.enums.Relationship;
import org.egov.pt.models.enums.Status;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
@Component
public class PropertyRowMapper implements ResultSetExtractor<List<Property>> {

	@Autowired
	private ObjectMapper mapper;

	@Override
	public List<Property> extractData(ResultSet rs) throws SQLException, DataAccessException {

		Map<String, Property> propertyMap = new HashMap<>();

		while (rs.next()) {

			String propertyUuId = rs.getString("pid");
			Property currentProperty = propertyMap.get(propertyUuId);
			String tenanId = rs.getString("ptenantid");

			if (null == currentProperty) {

				Address address = getAddress(rs, tenanId);

				AuditDetails auditdetails = getAuditDetail(rs, "proeprty");

				Double landArea = rs.getDouble("landArea");
				if (rs.wasNull()) {
					landArea = null;
				}
				
				String institutionId = rs.getString("institutionid");
				

					 Institution institute = Institution.builder()
							.tenantId(rs.getString("institutiontenantid"))
							.designation(rs.getString("designation"))
							.name(rs.getString("institutionName"))
							.type(rs.getString("institutionType"))
							.id(institutionId)
							.build();

				currentProperty = Property.builder()
						.creationReason(CreationReason.fromValue(rs.getString("creationReason")))
						.acknowldgementNumber(rs.getString("acknowldgementNumber"))
						.status(Status.fromValue(rs.getString("propertystatus")))
						.ownershipCategory(rs.getString("ownershipcategory"))
						.source(org.egov.pt.models.enums.Source.fromValue(rs.getString("source")))
						.usageCategory(rs.getString("pusagecategory"))
						.oldPropertyId(rs.getString("oldPropertyId"))
						.propertyType(rs.getString("propertytype"))
						.propertyId(rs.getString("propertyid"))
						.accountId(rs.getString("accountid"))
						.auditDetails(auditdetails)
						.institution(institute)
						.landArea(landArea)
						.tenantId(tenanId)
						.id(propertyUuId)
						.address(address)
						.build();

				currentProperty.setAdditionalDetails(getadditionalDetail(rs, "padditionalDetails"));
				
				addChildrenToProperty(rs, currentProperty);
				propertyMap.put(propertyUuId, currentProperty);
			}

			addChildrenToProperty(rs, currentProperty);
		}

		return new ArrayList<>(propertyMap.values());

	}

	/**
	 * Adding children elements to Property
	 * 
	 * @param rs
	 * @param currentProperty
	 * @throws SQLException
	 */
	private void addChildrenToProperty(ResultSet rs, Property currentProperty)
			throws SQLException {

		addOwnerToProperty(rs, currentProperty);
		addDocToProperty(rs, currentProperty);
	}


	/**
	 * Adds document to Property
	 * 
	 * @param rs
	 * @param property
	 * @throws SQLException
	 */
	private void addDocToProperty(ResultSet rs, Property property) throws SQLException {

		String docId = rs.getString("pdocid");
		String entityId = rs.getString("pdocentityid");
		List<Document> docs = property.getDocuments();
		
		if (!(docId != null && entityId.equals(property.getId())))
			return;

		if (!CollectionUtils.isEmpty(docs))
			for (Document doc : docs) {
				if (doc.getId().equals(docId))
					return;
			}

		Document doc =  Document.builder()
			.status(Status.fromValue(rs.getString("pdocstatus")))
			.documentType(rs.getString("pdoctype"))
			.fileStoreId(rs.getString("pdocfileStore"))
			.documentUid(rs.getString("pdocuid"))
			.id(docId)
			.build();
		
		property.addDocumentsItem(doc);
	}
	
	/**
	 * Adds Owner Object to Property
	 * 
	 * @param rs
	 * @return
	 * @throws SQLException
	 */
	private void addOwnerToProperty(ResultSet rs, Property property) throws SQLException {
		
		String uuid = rs.getString("userid");
		List<OwnerInfo> owners = property.getOwners();

		if (!CollectionUtils.isEmpty(owners))
			for (OwnerInfo owner : owners) {
				if (owner.getUuid().equals(uuid))
					return;
			}

		Double ownerShipPercentage = rs.getDouble("ownerShipPercentage");
		if(rs.wasNull()) {
			ownerShipPercentage = null;
			}
		
		Boolean isPrimaryOwner = rs.getBoolean("isPrimaryOwner");
		if(rs.wasNull()) {
			isPrimaryOwner = null;
			}
		
		OwnerInfo owner = OwnerInfo.builder()
				.relationship(Relationship.fromValue(rs.getString("relationship")))
				.status(Status.fromValue(rs.getString("ownstatus")))
				.institutionId(rs.getString("owninstitutionid"))
				.ownerShipPercentage(ownerShipPercentage)
				.tenantId(rs.getString("owntenantid"))
				.ownerType(rs.getString("ownerType"))
				.isPrimaryOwner(isPrimaryOwner)
				.uuid(uuid)
				.build();
		
		addDocToOwner(rs, owner);
		
		property.addOwnersItem(owner);
	}
	
	/**
	 * Method to add documents to Owner
	 * 
	 * @param rs
	 * @param OwnerId
	 * @param owner
	 * @throws SQLException
	 */
	private void addDocToOwner(ResultSet rs, OwnerInfo owner) throws SQLException {
		
		String docId = rs.getString("owndocid");
		String 	entityId = rs.getString("owndocentityId");
		List<Document> docs = owner.getDocuments();

		if (!(null != docId && entityId.equals(owner.getUuid())))
			return;

		if (!CollectionUtils.isEmpty(docs))
			for (Document doc : docs) {
				if (doc.getId().equals(docId))
					return;
			}
	
		Document doc = Document.builder()
			.status(Status.fromValue(rs.getString("owndocstatus")))
			.fileStoreId(rs.getString("owndocfileStore"))
			.documentType(rs.getString("owndoctype"))
			.documentUid(rs.getString("owndocuid"))
			.id(docId)
			.build();
		
		owner.addDocumentsItem(doc);
	}

	
	/**
	 * creates and adds the address object to property 
	 * 
	 * @param rs
	 * @param tenanId
	 * @return
	 * @throws SQLException
	 */
	private Address getAddress(ResultSet rs, String tenanId) throws SQLException {
		
		Locality locality = Locality.builder().code(rs.getString("locality")).build();

		Address address = Address.builder()
				.buildingName(rs.getString("buildingName"))
				.landmark(rs.getString("landmark"))
				.pincode(rs.getString("pincode"))
				.doorNo(rs.getString("doorno"))
				.street(rs.getString("street"))
				.id(rs.getString("addressId"))
				.city(rs.getString("city"))
				.locality(locality)
				.tenantId(tenanId)
				.build();
		return address;
	}
	
	/**
	 * prepares and returns an audit detail object
	 * 
	 * depending on the source the column names of result set will vary
	 * 
	 * @param rs
	 * @return
	 * @throws SQLException
	 */
	private AuditDetails getAuditDetail(ResultSet rs, String source) throws SQLException {
		
		switch (source) {
		
		case "property":
			
			Long lastModifiedTime = rs.getLong("plastModifiedTime");
			if (rs.wasNull()) {
				lastModifiedTime = null;
			}
			
			return AuditDetails.builder().createdBy(rs.getString("pcreatedBy"))
					.createdTime(rs.getLong("pcreatedTime")).lastModifiedBy(rs.getString("plastModifiedBy"))
					.lastModifiedTime(lastModifiedTime).build();
			
		default: 
			return null;
			
		}

	}
	
	/**
	 * method parses the PGobject and returns the JSON node
	 * 
	 * @param rs
	 * @param key
	 * @return
	 * @throws SQLException
	 */
	private Object getadditionalDetail(ResultSet rs, String key) throws SQLException {

		JsonNode propertyAdditionalDetails = null;

		try {

			PGobject obj = (PGobject) rs.getObject(key);
			if (obj != null) {
				propertyAdditionalDetails = mapper.readTree(obj.getValue());
			}

		} catch (IOException e) {
			throw new CustomException("PARSING ERROR", "The propertyAdditionalDetail json cannot be parsed");
		}

		return propertyAdditionalDetails;

	}
}
