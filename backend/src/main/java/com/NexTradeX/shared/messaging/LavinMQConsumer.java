package com.NexTradeX.shared.messaging;

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
            // Push real-time toast event over WebSockets to all clients and user-specific channel
            messagingTemplate.convertAndSend("/topic/orders", event);
            if (event.getUserId() != null) {
                messagingTemplate.convertAndSend("/topic/user/" + event.getUserId() + "/orders", event);
            }
        } catch (Exception e) {
            log.error("[LavinMQ Worker] Failed to dispatch WebSocket order notification: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = LavinMQConfig.QUEUE_NOTIFICATION)
    public void processNotification(Object notification) {
        log.info("[LavinMQ Worker] Processing notification background: {}", notification);
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
        } catch (Exception e) {
            log.error("[LavinMQ Worker] Failed to dispatch WebSocket notification: {}", e.getMessage());
        }
    }
}
