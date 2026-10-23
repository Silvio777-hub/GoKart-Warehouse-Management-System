package com.swam.repository;

import com.swam.model.Task;
import com.swam.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignee(User assignee);

    List<Task> findByCreator(User creator);

    List<Task> findByAssigneeOrCreator(User assignee, User creator);

    List<Task> findByStatus(String status);
}
