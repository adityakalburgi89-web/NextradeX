package com.nextradex.security;

import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserRole;
import org.junit.jupiter.api.Test;

class UserSerializationSecurityTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void passwordHashIsNeverSerialized() throws Exception {
        User user = User.builder()
                .id(1L)
                .username("user")
                .email("user@example.test")
                .passwordHash("sensitive-hash")
                .firstName("Test")
                .lastName("User")
                .role(UserRole.USER)
                .active(true)
                .emailVerified(true)
                .build();

        String json = objectMapper.writeValueAsString(user);

        assertFalse(json.contains("passwordHash"));
        assertFalse(json.contains("sensitive-hash"));
    }
}
