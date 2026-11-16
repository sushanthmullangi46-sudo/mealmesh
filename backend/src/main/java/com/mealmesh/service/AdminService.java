package com.mealmesh.service;

import com.mealmesh.dsa.stack.CustomStack;
import com.mealmesh.entity.AuditLog;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.entity.User;
import com.mealmesh.repository.AuditLogRepository;
import com.mealmesh.repository.NgoProfileRepository;
import com.mealmesh.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final NgoProfileRepository ngoProfileRepository;
    private final AuditLogRepository auditLogRepository;
    private final CustomStack<String> adminActionStack = new CustomStack<>();

    public AdminService(UserRepository userRepository,
                        NgoProfileRepository ngoProfileRepository,
                        AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.ngoProfileRepository = ngoProfileRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<NgoProfile> getAllNgos() {
        return ngoProfileRepository.findAll();
    }

    @Transactional
    public NgoProfile toggleNgoVerification(UUID ngoId, boolean verified) {
        NgoProfile ngo = ngoProfileRepository.findById(ngoId)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found: " + ngoId));
        boolean oldVal = ngo.isVerified();
        ngo.setVerified(verified);
        ngo = ngoProfileRepository.save(ngo);

        String actionToken = "VERIFY_NGO:" + ngoId + ":" + oldVal + ":" + verified;
        adminActionStack.push(actionToken);

        AuditLog log = new AuditLog();
        log.setAction("VERIFY_NGO");
        log.setEntityType("NGO");
        log.setEntityId(ngoId);
        log.setDetails("Toggled NGO '" + ngo.getOrganizationName() + "' verification to: " + verified);
        auditLogRepository.save(log);

        return ngo;
    }

    @Transactional
    public String undoLastAdminAction() {
        if (adminActionStack.isEmpty()) {
            return "No administrative operations to revert.";
        }

        String lastAction = adminActionStack.pop();
        String[] parts = lastAction.split(":");
        if (parts.length >= 4 && "VERIFY_NGO".equalsIgnoreCase(parts[0])) {
            UUID ngoId = UUID.fromString(parts[1]);
            boolean oldVal = Boolean.parseBoolean(parts[2]);
            ngoProfileRepository.findById(ngoId).ifPresent(ngo -> {
                ngo.setVerified(oldVal);
                ngoProfileRepository.save(ngo);
            });
            return "Reverted NGO verification for " + ngoId + " back to " + oldVal;
        }

        return "Rolled back action: " + lastAction;
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
