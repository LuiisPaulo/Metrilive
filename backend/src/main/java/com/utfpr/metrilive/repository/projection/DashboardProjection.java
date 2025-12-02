package com.utfpr.metrilive.repository.projection;

import java.util.Date;

public interface DashboardProjection {
    Date getDate();
    String getType();
    Long getTotalViews();
    Long getTotalComments();
    Long getTotalShares();
}
