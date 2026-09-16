package com.nextradex.modules.security.auth;

import com.nextradex.modules.user.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * Interface contract for Authentication Operations.
 */
public interface IAuthService extends UserDetailsService {
    UserDetails loadUserByEmail(String email);
    String registerUser(String username, String email, String password, String firstName, String lastName);
    String loginUser(String identifier, String password);
    User getUserByUsername(String username);
    boolean processForgotPassword(String email);
    boolean resetPassword(String token, String newPassword);
}
