package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.DsaLabRequestDto;
import com.mealmesh.service.DsaLabService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dsa-lab")
public class DsaLabController {

    private final DsaLabService dsaLabService;

    public DsaLabController(DsaLabService dsaLabService) {
        this.dsaLabService = dsaLabService;
    }

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<Map<String, Object>>> execute(@RequestBody DsaLabRequestDto request) {
        try {
            Map<String, Object> result = dsaLabService.executeOperation(request);
            return ResponseEntity.ok(ApiResponse.ok("Executed DSA operation successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
