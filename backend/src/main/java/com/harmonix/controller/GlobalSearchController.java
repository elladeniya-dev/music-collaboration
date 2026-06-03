package com.harmonix.controller;

import com.harmonix.constant.AppConstants;
import com.harmonix.dto.response.ApiResponse;
import com.harmonix.dto.response.GlobalSearchResponse;
import com.harmonix.service.GlobalSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_BASE_PATH + "/search")
@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@RequiredArgsConstructor
public class GlobalSearchController {

    private final GlobalSearchService globalSearchService;

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<GlobalSearchResponse>> searchGlobal(@RequestParam("q") String query) {
        GlobalSearchResponse response = globalSearchService.globalSearch(query);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
