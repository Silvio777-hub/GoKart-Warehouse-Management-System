package com.swam.service;

import com.swam.model.Task;
import com.swam.model.User;
import com.swam.repository.TaskRepository;
import com.swam.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository repo;
    private final UserRepository userRepo;
    private final RealtimeService realtimeService;

    public TaskService(TaskRepository repo, UserRepository userRepo, RealtimeService realtimeService) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.realtimeService = realtimeService;
    }

    public List<Task> list() {
        return repo.findAll();
    }

    public List<Task> listByAssignee(String username) {
        User u = userRepo.findByUsername(username);
        if (u == null)
            return List.of();
        return repo.findByAssignee(u);
    }

    public List<Task> listByAssigneeOrCreator(String username) {
        User u = userRepo.findByUsername(username);
        if (u == null)
            return List.of();
        return repo.findByAssigneeOrCreator(u, u);
    }

    public Optional<Task> find(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repo.findById(id);
    }

    public Task save(Task t) {
        if (t == null) {
            throw new IllegalArgumentException("Task entity cannot be null");
        }
        Task saved = repo.save(t);
        realtimeService.broadcast("tasks", saved);
        return saved;
    }

    public void delete(Long id) {
        if (id != null) {
            repo.deleteById(id);
            realtimeService.broadcastDelete("tasks", id);
        }
    }
}
