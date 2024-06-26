package org.egov.pt.calculator.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.pt.calculator.web.models.BillingSlab;
import org.egov.pt.calculator.web.models.property.AuditDetails;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

@Component
public class BillingSlabRowMapper implements ResultSetExtractor<List<BillingSlab>> {

	@Override
	public List<BillingSlab> extractData(ResultSet rs) throws SQLException, DataAccessException {
		Map<String, BillingSlab> billingSlabMap = new HashMap<>();
		while (rs.next()) {
			String currentId = rs.getString("id");
			BillingSlab currentBillingSlab = billingSlabMap.get(currentId);
			if (null == currentBillingSlab) {
				AuditDetails auditDetails = AuditDetails.builder().createdBy(rs.getString("createdby"))
						.createdTime(rs.getLong("createdTime")).lastModifiedBy(rs.getString("lastmodifiedby"))
						.lastModifiedTime(rs.getLong("lastmodifiedtime")).build();

				currentBillingSlab = BillingSlab.builder().tenantId(rs.getString("tenantid"))
						.id(rs.getString("id")).mohalla(rs.getString("mohalla"))
						.unitRate(rs.getDouble("unitrate")).propertyType(rs.getString("propertytype"))
						.constructionType(rs.getString("constructiontype")).ward(rs.getString("ward"))
						.roadType(rs.getString("roadtype")).auditDetails(auditDetails).build();

				billingSlabMap.put(currentId, currentBillingSlab);
			}

		}

		return new ArrayList<>(billingSlabMap.values());

	}

}
