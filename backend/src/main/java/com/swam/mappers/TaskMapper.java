package com.swam.mappers;

import com.swam.dtos.TaskDTO;
import com.swam.model.Task;

import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskDTO toDTO(Task t) {
        if (t == null)
            return null;
        TaskDTO dto = new TaskDTO();
        dto.setId(t.getId());
        dto.setDescription(t.getDescription());
        dto.setStatus(t.getStatus());
        dto.setPriority(t.getPriority());
        dto.setDueDate(t.getDueDate());
        dto.setCreatedAt(t.getCreatedAt());
        if (t.getAssignee() != null) {
            dto.setAssigneeUsername(t.getAssignee().getUsername());
        }
        if (t.getCreator() != null) {
            dto.setCreatorUsername(t.getCreator().getUsername());
        }
        return dto;
    }

    public Task toEntity(TaskDTO dto) {
        if (dto == null)
            return null;
        Task t = new Task();
        t.setId(dto.getId());
        t.setDescription(dto.getDescription());
        t.setStatus(dto.getStatus());
        t.setPriority(dto.getPriority());
        t.setDueDate(dto.getDueDate());
        // createdAt usually set by entity default, but if update, might need preserving
        // assignee set by service using username
        return t;
    }
}
