package com.NexTradeX.shared.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class LavinMQProducer {

    private static final Logger log = LoggerFactory.getLogger(LavinMQProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public LavinMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrderEvent(OrderEvent event) {
        try {
            log.info("[LavinMQ Producer] Publishing message order event to queue: symbol={}, side={}, qty={}",
                    event.getSymbol(), event.getSide(), event.getQuantity());

            rabbitTemplate.convertAndSend(LavinMQConfig.EXCHANGE_NAME, "order.submitted", event);
        } catch (Exception e) {
            log.error("[LavinMQ Producer] Failed to publish order event: {}", e.getMessage(), e);
        }
    }

    public void sendMarketEvent(Object marketData) {
        try {
            rabbitTemplate.convertAndSend(LavinMQConfig.EXCHANGE_NAME, "market.tick", marketData);
        } catch (Exception e) {
            log.error("[LavinMQ Producer] Failed to publish market event: {}", e.getMessage());
        }
    }

    public void sendNotificationEvent(Object notification) {
        try {
            rabbitTemplate.convertAndSend(LavinMQConfig.EXCHANGE_NAME, "notification.alert", notification);
        } catch (Exception e) {
            log.error("[LavinMQ Producer] Failed to publish notification event: {}", e.getMessage());
        }
    }
}
