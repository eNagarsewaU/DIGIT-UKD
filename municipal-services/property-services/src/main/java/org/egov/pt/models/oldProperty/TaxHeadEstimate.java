package org.egov.pt.models.oldProperty;

import java.math.BigDecimal;

import org.egov.pt.models.enums.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxHeadEstimate {

    private String taxHeadCode;

    private BigDecimal estimateAmount;

    private Category category;
}
