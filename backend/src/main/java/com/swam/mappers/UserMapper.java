package com.swam.mappers;

import com.swam.dtos.UserDTO;
import com.swam.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDTO toDTO(User user) {
        if (user == null)
            return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        return dto;
    }

    public User toEntity(UserDTO dto) {
        if (dto == null)
            return null;
        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setFullName(dto.getFullName());
        user.setRole(dto.getRole());
        user.setPassword(dto.getPassword());
        user.setEmail(dto.getEmail());
        user.setBio(dto.getBio());
        return user;
    }
}
