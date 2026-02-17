package com.eventmanagement.repository;

// ============================================
// Member 3: User repository - data access layer
// ============================================

import com.eventmanagement.entity.User;
import com.eventmanagement.entity.User.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);
}
