package com.eventmanagement.service;

// ============================================
// Member 4: User service - business logic with RBAC
// ============================================

import com.eventmanagement.dto.UserDTO;
import com.eventmanagement.entity.User;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        // Only ADMIN can view all users
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Access denied. Only administrators can view all users");
        }
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return toDTO(user);
    }

    @Transactional
    public UserDTO create(UserDTO dto) {
        // Only ADMIN can create users (for manual ADMIN creation)
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Access denied. Only administrators can create users");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("User already exists with email: " + dto.getEmail());
        }
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new RuntimeException("Password is required");
        }
        User user = toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user = userRepository.save(user);
        return toDTO(user);
    }

    @Transactional
    public UserDTO update(Long id, UserDTO dto) {
        // Only ADMIN can update users
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Access denied. Only administrators can update users");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        user = userRepository.save(user);
        return toDTO(user);
    }

    @Transactional
    public void deleteById(Long id) {
        // Only ADMIN can delete users
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Access denied. Only administrators can delete users");
        }
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                /* password never included in response */
                .build();
    }

    private User toEntity(UserDTO dto) {
        return User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .role(dto.getRole() != null ? dto.getRole() : User.UserRole.ATTENDEE)
                .build();
    }
}
