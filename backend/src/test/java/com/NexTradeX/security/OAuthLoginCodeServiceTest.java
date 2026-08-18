package com.nextradex.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nextradex.modules.security.oauth.OAuthLoginCodeService;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

class OAuthLoginCodeServiceTest {

    @Test
    void storesOnlyAHashOfTheBrowserCode() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(values);
        OAuthLoginCodeService service = new OAuthLoginCodeService(redisTemplate);

        String code = service.issueCode(42L);

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(values).set(key.capture(), eq("42"), eq(Duration.ofMinutes(2)));
        assertTrue(key.getValue().startsWith("oauth_login_code:"));
        assertFalse(key.getValue().contains(code));
    }

    @Test
    void codeCanBeConsumedOnlyOnce() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(values);
        when(values.getAndDelete(anyString())).thenReturn("42", null);
        OAuthLoginCodeService service = new OAuthLoginCodeService(redisTemplate);

        assertEquals(42L, service.consumeCode("valid-one-time-code"));
        assertThrows(IllegalArgumentException.class,
                () -> service.consumeCode("valid-one-time-code"));
    }
}
