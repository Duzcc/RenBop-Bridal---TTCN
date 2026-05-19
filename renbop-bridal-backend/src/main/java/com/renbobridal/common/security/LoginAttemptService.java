package com.renbobridal.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final int MAX_ATTEMPT = 5;
    private final int LOCK_TIME_DURATION_MINUTES = 15;

    private final StringRedisTemplate redisTemplate;

    private String getAttemptsKey(String key) {
        return "login_attempts:" + key;
    }

    private String getLockKey(String key) {
        return "login_locked:" + key;
    }

    public void loginSucceeded(String key) {
        redisTemplate.delete(getAttemptsKey(key));
        redisTemplate.delete(getLockKey(key));
    }

    public void loginFailed(String key) {
        String attemptKey = getAttemptsKey(key);
        String lockKey = getLockKey(key);

        String val = redisTemplate.opsForValue().get(attemptKey);
        int attempts = val != null ? Integer.parseInt(val) : 0;
        attempts++;

        if (attempts >= MAX_ATTEMPT) {
            redisTemplate.opsForValue().set(lockKey, "LOCKED", Duration.ofMinutes(LOCK_TIME_DURATION_MINUTES));
            redisTemplate.delete(attemptKey);
        } else {
            redisTemplate.opsForValue().set(attemptKey, String.valueOf(attempts), Duration.ofMinutes(LOCK_TIME_DURATION_MINUTES));
        }
    }

    public boolean isBlocked(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(getLockKey(key)));
    }
}
