package com.swam.repository;

import com.swam.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	User findByUsername(String username);

	User findByEmail(String email);

	List<User> findByDeletedFalse(); // Active users

	List<User> findByDeletedTrue(); // Users in trash
}
