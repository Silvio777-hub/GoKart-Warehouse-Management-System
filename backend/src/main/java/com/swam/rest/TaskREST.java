package com.swam.rest;

import com.swam.dtos.TaskDTO;
import com.swam.mappers.TaskMapper;
import com.swam.model.Task;
import com.swam.model.User;
import com.swam.service.TaskService;
import com.swam.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tasks", description = "Assignment and tracking of staff work orders")
public class TaskREST {
    private final TaskService service;
    private final UserService userService;
    private final TaskMapper mapper;

    public TaskREST(TaskService service, UserService userService, TaskMapper mapper) {
        this.service = service;
        this.userService = userService;
        this.mapper = mapper;
    }

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "List tasks", description = "Returns visible tasks based on role: ADMIN/MANAGER see all, STAFF see assigned/created.")
    public List<TaskDTO> list(Authentication auth) {
        // ADMIN sees ALL tasks
        // Others see tasks they are ASSIGNED or tasks they CREATED
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

        if (isAdmin || isManager) {
            return service.list().stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());
        } else {
            return service.listByAssigneeOrCreator(auth.getName()).stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());
        }
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Create task", description = "Creates and assigns a new work task. Accessible by ADMIN and MANAGER.")
    public ResponseEntity<TaskDTO> create(@RequestBody TaskDTO dto, Authentication auth) {
        String myRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst().orElse("STAFF");
        User creator = userService.findByUsername(auth.getName());

        // Only Manager/Admin can create tasks
        if ("STAFF".equals(myRole)) {
            return ResponseEntity.status(403).build();
        }

        if (dto.getAssigneeUsername() == null) {
            return ResponseEntity.badRequest().build();
        }

        User assignee = userService.findByUsername(dto.getAssigneeUsername());
        if (assignee == null) {
            return ResponseEntity.notFound().build();
        }

        // Assignment restrictions:
        // Admin: can assign to anyone
        // Manager: can ONLY assign to STAFF
        if ("MANAGER".equals(myRole) && !"STAFF".equals(assignee.getRole())) {
            return ResponseEntity.status(403).build();
        }

        Task entity = mapper.toEntity(dto);
        entity.setAssignee(assignee);
        entity.setCreator(creator);
        entity.setStatus("PENDING"); // Force initial status

        Task saved = java.util.Objects.requireNonNull(service.save(entity));
        return ResponseEntity.created(java.util.Objects.requireNonNull(URI.create("/api/tasks/" + saved.getId())))
                .body(mapper.toDTO(saved));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateStatus(@PathVariable Long id, @RequestBody TaskDTO dto, Authentication auth) {
        // ONLY the assignee can mark a task as DONE (or update status)
        return service.find(id).map(t -> {
            if (!t.getAssignee().getUsername().equals(auth.getName())) {
                return ResponseEntity.status(403).<TaskDTO>build();
            }
            t.setStatus(dto.getStatus());
            Task saved = java.util.Objects.requireNonNull(service.save(t));
            return ResponseEntity.ok(mapper.toDTO(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        // Only Manager/Admin can delete
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"))) {
            return ResponseEntity.status(403).build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
