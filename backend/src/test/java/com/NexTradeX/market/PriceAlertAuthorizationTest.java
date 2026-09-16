package com.nextradex.market;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nextradex.modules.market.market.PriceAlert;
import com.nextradex.modules.market.market.PriceAlertController;
import com.nextradex.modules.market.market.PriceAlertRepository;
import com.nextradex.modules.security.auth.JwtService;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

class PriceAlertAuthorizationTest {

    @Test
    void userCannotDeleteAnotherUsersAlert() {
        PriceAlertRepository repository = mock(PriceAlertRepository.class);
        UserService userService = mock(UserService.class);
        JwtService jwtService = mock(JwtService.class);
        Authentication authentication = mock(Authentication.class);
        PriceAlertController controller = new PriceAlertController(repository, userService, jwtService);

        User owner = User.builder().id(22L).build();
        PriceAlert alert = PriceAlert.builder().id(99L).user(owner).build();
        when(jwtService.extractUserIdFromAuthentication(authentication)).thenReturn(11L);
        when(repository.findById(99L)).thenReturn(Optional.of(alert));

        ResponseEntity<?> response = controller.deleteAlert(99L, authentication);

        assertEquals(404, response.getStatusCode().value());
        verify(repository, never()).delete(alert);
    }
}
