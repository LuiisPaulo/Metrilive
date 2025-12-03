package com.utfpr.metrilive.service;

import com.utfpr.metrilive.model.Role;
import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.repository.LiveVideoRepository;
import com.utfpr.metrilive.repository.projection.DashboardProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LiveVideoRepository liveVideoRepository;
    private final UserService userService;

    public List<DashboardProjection> getDashboardMetrics() {
        User user = userService.getCurrentUser();
        
        if (user.getRole() == Role.ADMIN) {
            return liveVideoRepository.getDashboardMetricsForAdmin();
        } else {
            return liveVideoRepository.getDashboardMetricsForUser(user.getId());
        }
    }

    public byte[] generateCsvReport() {
        List<DashboardProjection> metrics = getDashboardMetrics();
        StringBuilder sb = new StringBuilder();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        sb.append("Data;Tipo;Visualizações;Comentários;Compartilhamentos\n");

        for (DashboardProjection metric : metrics) {
            sb.append(sdf.format(metric.getDate())).append(";");
            sb.append(metric.getType()).append(";");
            sb.append(metric.getTotalViews()).append(";");
            sb.append(metric.getTotalComments()).append(";");
            sb.append(metric.getTotalShares()).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}