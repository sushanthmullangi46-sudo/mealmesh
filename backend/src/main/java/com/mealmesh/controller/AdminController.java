package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.AuditLog;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.entity.User;
import com.mealmesh.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    @GetMapping("/ngos")
    public ResponseEntity<ApiResponse<List<NgoProfile>>> getAllNgos() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllNgos()));
    }

    @PatchMapping("/ngos/{id}/verify")
    public ResponseEntity<ApiResponse<NgoProfile>> verifyNgo(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> payload) {
        try {
            boolean verified = payload.getOrDefault("verified", true);
            NgoProfile ngo = adminService.toggleNgoVerification(id, verified);
            return ResponseEntity.ok(ApiResponse.ok("Verification updated", ngo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/undo")
    public ResponseEntity<ApiResponse<String>> undoLastAction() {
        String msg = adminService.undoLastAdminAction();
        return ResponseEntity.ok(ApiResponse.ok(msg, msg));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRecentAuditLogs()));
    }
}
