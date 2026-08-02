package com.NexTradeX.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.NexTradeX.exception.OrderNotFoundException;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;

class OrderServiceTest {

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final UserService userService = mock(UserService.class);
    private final OrderService service = new OrderService(orderRepository, userService);

    @Test
    void calculatesWeightedAverageFromPreviouslyFilledQuantity() {
        Order order = Order.builder()
                .id(10L)
                .quantity(new BigDecimal("4"))
                .filledQuantity(new BigDecimal("2"))
                .averagePrice(new BigDecimal("100"))
                .status(OrderStatus.PARTIALLY_FILLED)
                .build();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Order result = service.fillOrder(10L, new BigDecimal("2"), new BigDecimal("200"));

        assertEquals(0, result.getAveragePrice().compareTo(new BigDecimal("150")));
        assertEquals(OrderStatus.FILLED, result.getStatus());
    }

    @Test
    void cancellationIsScopedToTheAuthenticatedUser() {
        User user = User.builder().id(7L).build();
        when(userService.findById(7L)).thenReturn(Optional.of(user));
        when(orderRepository.findByIdAndUser(99L, user)).thenReturn(Optional.empty());

        assertThrows(OrderNotFoundException.class, () -> service.cancelOrder(99L, 7L));
    }
}
