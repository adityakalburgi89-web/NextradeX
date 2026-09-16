package com.nextradex.shared.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
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
    TopicExchange eventExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    Queue orderQueue() {
        return QueueBuilder.durable(QUEUE_ORDERS).build();
    }

    @Bean
    Queue marketQueue() {
        return QueueBuilder.durable(QUEUE_MARKET).build();
    }

    @Bean
    Queue notificationQueue() {
        return QueueBuilder.durable(QUEUE_NOTIFICATION).build();
    }

    @Bean
    Binding orderBinding(Queue orderQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderQueue).to(eventExchange).with(ROUTING_KEY_ORDERS);
    }

    @Bean
    Binding marketBinding(Queue marketQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(marketQueue).to(eventExchange).with(ROUTING_KEY_MARKET);
    }

    @Bean
    Binding notificationBinding(Queue notificationQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(notificationQueue).to(eventExchange).with(ROUTING_KEY_NOTIFICATION);
    }

    @Bean
    MessageConverter rabbitMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
