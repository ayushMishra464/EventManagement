package com.eventmanagement.dto;

// ============================================
// Member 5: User DTOs - API request/response models
// ============================================

import com.eventmanagement.entity.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    private UserRole role;

    /** Used only when creating user via API; never returned in responses. */
    private String password;
}
