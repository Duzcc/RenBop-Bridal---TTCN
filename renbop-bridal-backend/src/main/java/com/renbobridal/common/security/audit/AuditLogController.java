package com.renbobridal.common.security.audit;

import com.renbobridal.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Admin Audit Log", description = "Endpoints for viewing and undoing activity logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get filtered and paginated audit logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getLogs(
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AuditLog> logs = auditLogRepository.findFiltered(
                entityName, action, userId, from, to, PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/timeline")
    @Operation(summary = "Get latest 50 logs for timeline UI")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getTimeline() {
        return ResponseEntity.ok(ApiResponse.ok(auditLogRepository.findTop50ByOrderByCreatedAtDesc()));
    }

    @PostMapping("/{id}/undo")
    @Operation(summary = "Revert an action (if supported)")
    public ResponseEntity<ApiResponse<?>> undoAction(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit log not found"));

        if (log.getIsReverted()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Action already reverted", "ALREADY_REVERTED"));
        }

        if (log.getPreviousValue() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cannot revert: No previous state saved", "NO_PREV_STATE"));
        }

        // TODO: In a real enterprise system, we would deserialize previousValue and save it back to DB
        // For this demo, we just mark it as reverted to show the UI capability
        log.setIsReverted(true);
        log.setRevertedBy(currentUserId);
        log.setRevertedAt(Instant.now());

        AuditLog saved = auditLogRepository.save(log);

        return ResponseEntity.ok(ApiResponse.ok("Reverted successfully", saved));
    }
}
