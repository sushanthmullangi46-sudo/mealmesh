package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.AuthRequest;
import com.mealmesh.dto.AuthResponse;
import com.mealmesh.dto.RegisterRequest;
import com.mealmesh.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse res = authService.login(request);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse res = authService.register(request);
            return ResponseEntity.ok(ApiResponse.ok("Registration successful", res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/demo/{role}")
    public ResponseEntity<ApiResponse<AuthResponse>> demoLogin(@PathVariable String role) {
        try {
            AuthResponse res = authService.demoLogin(role);
            return ResponseEntity.ok(ApiResponse.ok("Demo login as " + role.toUpperCase() + " successful", res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
