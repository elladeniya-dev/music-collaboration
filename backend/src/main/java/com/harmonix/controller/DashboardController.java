package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.DashboardResponse;
import com.harmonix.entity.User;
import com.harmonix.repository.UserRepository;
import com.harmonix.service.DashboardService;
import com.harmonix.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AppConstants.DASHBOARD_PATH)
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardStats(HttpServletRequest request) {
        User user = AuthUtil.requireUser(request, userRepository);
        DashboardResponse stats = dashboardService.getDashboardData(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved effectively", stats));
    }
}
