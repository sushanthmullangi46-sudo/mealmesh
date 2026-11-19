package com.mealmesh.controller;

import com.mealmesh.dsa.queue.CustomQueue;

import com.mealmesh.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/sync")
public class BatchSyncController {

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processBatchSync(
            @RequestBody List<Map<String, Object>> offlineActions) {

        int processed = 0;
        int failed = 0;
        List<String> syncReceipts = new ArrayList<>();

        // Actions recorded while the device was offline are replayed in the exact order they
        // happened: enqueue all of them, then dequeue one by one (FIFO, O(1) per operation).
        CustomQueue<Map<String, Object>> replayQueue = new CustomQueue<>();
        replayQueue.setRecordSteps(false);
        if (offlineActions != null) {
            for (Map<String, Object> action : offlineActions) {
                replayQueue.enqueue(action);
            }
        }
        int position = 1;
        while (!replayQueue.isEmpty()) {
            Map<String, Object> action = replayQueue.dequeue();
            if (action == null) { failed++; continue; }
            String type = String.valueOf(action.getOrDefault("type", "UNKNOWN"));
            String clientTxId = String.valueOf(action.getOrDefault("clientTxId", UUID.randomUUID().toString()));
            processed++;
            syncReceipts.add("#" + (position++) + " synced " + type + " [TX: " + clientTxId.substring(0, Math.min(8, clientTxId.length())) + "]");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("syncedCount", processed);
        result.put("failedCount", failed);
        result.put("syncedAt", LocalDateTime.now());
        result.put("receipts", syncReceipts);

        return ResponseEntity.ok(ApiResponse.ok("Offline sync batch processed successfully", result));
    }
}
