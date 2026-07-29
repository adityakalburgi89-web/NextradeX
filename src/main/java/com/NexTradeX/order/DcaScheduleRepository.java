package com.NexTradeX.order;

import com.NexTradeX.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DcaScheduleRepository extends JpaRepository<DcaSchedule, Long> {
    List<DcaSchedule> findAllByUser(User user);
    List<DcaSchedule> findByActiveTrueAndNextRunTimeBefore(LocalDateTime time);
    Optional<DcaSchedule> findByIdAndUser(Long scheduleId, User user);
}
