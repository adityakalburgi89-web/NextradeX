package com.nextradex.shared.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class LavinMQConsumer {

    private static final Logger log = LoggerFactory.getLogger(LavinMQConsumer.class);

    private final SimpMessagingTemplate messagingTemplate;

    public LavinMQConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @RabbitListener(queues = LavinMQConfig.QUEUE_ORDERS)
    public void processOrderEvent(OrderEvent event) {
        log.info("[LavinMQ Worker] Processing queued order: ID = {}, Symbol={}, side ={}",
                event.getOrderId(),
                event.getSymbol(),
                event.getSide());

        try {
            if (event.getUserId() != null) {
                messagingTemplate.convertAndSendToUser(event.getUserId(), "/queue/orders", event);
            }
        } catch (Exception e) {
            log.error("[LavinMQ Worker] Failed to dispatch WebSocket order notification: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = LavinMQConfig.QUEUE_NOTIFICATION)
    public void processNotification(NotificationEvent notification) {
        log.info("[LavinMQ Worker] Processing notification event: ID={}", notification.getId());
        try {
            if (notification.getUserId() != null) {
                messagingTemplate.convertAndSendToUser(
                        notification.getUserId(), "/queue/notifications", notification);
            }
        } catch (Exception e) {
            log.error("[LavinMQ Worker] Failed to dispatch WebSocket notification", e);
        }
    }
}
