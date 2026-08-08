package com.NexTradeX.shared.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LavinMQConfig {

    public static final String EXCHANGE_NAME = "nextradex.events";

    public static final String QUEUE_ORDERS = "order.events.queue";
    public static final String QUEUE_MARKET = "market.event.queue";
    public static final String QUEUE_NOTIFICATION = "notification.event.queue";

    public static final String ROUTING_KEY_ORDERS = "order.#";
    public static final String ROUTING_KEY_MARKET = "market.#";
    public static final String ROUTING_KEY_NOTIFICATION = "notification.#";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue ordersQueue() {
        return QueueBuilder.durable(QUEUE_ORDERS).build();
    }

    @Bean
    public Queue marketQueue() {
        return QueueBuilder.durable(QUEUE_MARKET).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(QUEUE_NOTIFICATION).build();
    }

    @Bean
    public Binding ordersBinding(Queue ordersQueue, TopicExchange exchange) {
        return BindingBuilder.bind(ordersQueue).to(exchange).with(ROUTING_KEY_ORDERS);
    }

    @Bean
    public Binding marketBinding(Queue marketQueue, TopicExchange exchange) {
        return BindingBuilder.bind(marketQueue).to(exchange).with(ROUTING_KEY_MARKET);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(notificationQueue).to(exchange).with(ROUTING_KEY_NOTIFICATION);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
